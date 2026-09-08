import type { Game as SolanaGame } from "../contracts/v0.3.0/generated/accounts/game.js";
import type { EventData } from "../contracts/events/index.js";

export type GameReference =
  | { chain: "solana"; network: string; deployment: string; gameId: string }
  | { chain: "evm"; chainId: bigint; deployment: string; gameId: string };
export type SolanaGameReference = Extract<GameReference, { chain: "solana" }>;
export type EvmGameReference = Extract<GameReference, { chain: "evm" }>;
export type GameOutcome = "completed" | "closed";
export interface NormalizedGame {
  reference: GameReference;
  status: "open" | GameOutcome;
  creator: string;
  token: string;
  gameType: "coinflip" | "giveaway";
  isPrivate: boolean;
  ticketAmount: bigint;
  totalAmount: bigint;
  minimumParticipants: number;
  maximumParticipants: number;
  participants: readonly string[];
  participantCount: number;
  expiresAt: bigint;
  /** Null when the Solana creation commitment has not been indexed. Never infer it from the PDA. */
  commitment: string | null;
  entropyPosition: { kind: "solana-slot" | "evm-block"; value: bigint };
}
export type GameObservation =
  | { status: "unknown"; game: null; reference: GameReference }
  | { status: GameOutcome; game: null; reference: GameReference }
  | {
      status: NormalizedGame["status"];
      game: NormalizedGame;
      reference: GameReference;
    };

/** Decoded EVM getGame tuple, independent of the caller's ABI library. */
export interface EvmGame {
  creator: string;
  token: string;
  gameType: number;
  status: number;
  isPrivate: boolean;
  minPlayers: number;
  maxPlayers: number;
  expiresAt: bigint;
  ticketAmount: bigint;
  totalAmount: bigint;
  commitment: string;
  lastEntryBlock: bigint;
  participants: readonly string[];
}

function gameType(value: number): NormalizedGame["gameType"] {
  if (value === 0) return "coinflip";
  if (value === 1) return "giveaway";
  throw new Error("Unknown game type");
}

/** Pass only terminal outcomes established by confirmed indexed events for this game. */
export function observeSolanaGame(
  reference: SolanaGameReference,
  account: SolanaGame | null,
  terminal?: { gameKey: string; outcome: GameOutcome },
  commitment: string | null = null,
): GameObservation {
  if (terminal && terminal.gameKey !== reference.gameId)
    throw new Error("Terminal event belongs to another game");
  if (!account)
    return { reference, status: terminal?.outcome ?? "unknown", game: null };
  if (account.ticketsCount !== account.participants.length)
    throw new Error("Participant count mismatch");
  const game: NormalizedGame = {
    reference,
    status: "open",
    creator: account.creator,
    token: account.tokenMint,
    gameType: gameType(account.gameType),
    isPrivate: account.isPrivate,
    ticketAmount: account.ticketAmount,
    totalAmount: account.totalAmount,
    minimumParticipants: account.minTickets,
    maximumParticipants: account.maxTickets,
    participants: [...account.participants],
    participantCount: account.ticketsCount,
    expiresAt: account.createdAt + account.timeout,
    commitment,
    entropyPosition: { kind: "solana-slot", value: account.lastSlot },
  };
  return { reference, status: game.status, game };
}

export function observeEvmGame(
  reference: EvmGameReference,
  account: EvmGame | null,
): GameObservation {
  if (!account || account.status === 0)
    return { reference, status: "unknown", game: null };
  const status = ({ 1: "open", 2: "completed", 3: "closed" } as const)[
    account.status as 1 | 2 | 3
  ];
  if (!status) throw new Error("Unknown game status");
  const game: NormalizedGame = {
    reference,
    status,
    creator: account.creator,
    token: account.token,
    gameType: gameType(account.gameType),
    isPrivate: account.isPrivate,
    ticketAmount: account.ticketAmount,
    totalAmount: account.totalAmount,
    minimumParticipants: account.minPlayers,
    maximumParticipants: account.maxPlayers,
    participants: [...account.participants],
    participantCount: account.participants.length,
    expiresAt: account.expiresAt,
    commitment: account.commitment,
    entropyPosition: { kind: "evm-block", value: account.lastEntryBlock },
  };
  return { reference, status, game };
}

/** Derived from the current Oracle buffer. Never cache this as a creation-time economic term. */
export function gameLifecycle(
  game: NormalizedGame,
  now: bigint,
  buffer: bigint,
) {
  if (now < 0n || buffer <= 0n) throw new Error("Invalid time or buffer");
  const expired = now >= game.expiresAt;
  const recoveryAt = game.expiresAt + buffer;
  const ready =
    game.participantCount === game.maximumParticipants ||
    (game.participantCount >= game.minimumParticipants && expired);
  const open = game.status === "open";
  return {
    expired,
    recoveryAt,
    canJoin:
      open && !expired && game.participantCount < game.maximumParticipants,
    canSettle: open && ready && now < recoveryAt,
    canRefund: open && expired && (!ready || now >= recoveryAt),
  };
}

export interface MembershipChange {
  reference: GameReference;
  kind: "joined" | "refunded";
  player: string;
  index: number;
  movedParticipant: string | null;
}
function safeIndex(value: bigint | number): number {
  if (
    typeof value === "bigint" &&
    (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER))
  )
    throw new Error("Invalid participant index");
  const index = Number(value);
  if (!Number.isSafeInteger(index) || index < 0)
    throw new Error("Invalid participant index");
  return index;
}

export function normalizeSolanaMembership(
  reference: SolanaGameReference,
  event:
    | { name: "PlayerJoined"; data: EventData<"PlayerJoined"> }
    | { name: "PlayerUnjoined"; data: EventData<"PlayerUnjoined"> },
): MembershipChange {
  if (event.data.gameKey !== reference.gameId)
    throw new Error("Event belongs to another game");
  return {
    reference,
    kind: event.name === "PlayerJoined" ? "joined" : "refunded",
    player: event.data.player,
    index: safeIndex(event.data.ticketIndex),
    movedParticipant:
      event.name === "PlayerUnjoined" ? event.data.movedParticipant : null,
  };
}
export function normalizeEvmMembership(
  reference: EvmGameReference,
  event:
    | { name: "PlayerJoined"; gameId: string; player: string; index: bigint }
    | {
        name: "PlayerRefunded";
        gameId: string;
        player: string;
        removedIndex: bigint;
        movedParticipant: string;
      },
): MembershipChange {
  if (event.gameId.toLowerCase() !== reference.gameId.toLowerCase())
    throw new Error("Event belongs to another game");
  return {
    reference,
    kind: event.name === "PlayerJoined" ? "joined" : "refunded",
    player: event.player,
    index: safeIndex(
      event.name === "PlayerJoined" ? event.index : event.removedIndex,
    ),
    movedParticipant:
      event.name === "PlayerRefunded" &&
      !/^0x0{40}$/i.test(event.movedParticipant)
        ? event.movedParticipant
        : null,
  };
}
