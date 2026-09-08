import type { ProgramEvent } from "../contracts/events/index.js";
import type {
  GameReference,
  SolanaGameReference,
  MembershipChange,
} from "./index.js";
import { normalizeSolanaMembership } from "./index.js";

export type NormalizedGameEvent =
  | {
      kind: "created";
      reference: GameReference;
      creator: string;
      token: string;
      gameType: "coinflip" | "giveaway";
      ticketAmount: bigint;
      totalAmount: bigint;
      minimumParticipants: number;
      maximumParticipants: number;
      expiresAt: bigint;
      isPrivate: boolean;
      commitment: string | null;
    }
  | (MembershipChange & { amount: bigint | null })
  | {
      kind: "completed";
      reference: GameReference;
      winner: string;
      prize: bigint;
      fee: bigint;
      secret: string | null;
    }
  | {
      kind: "closed";
      reference: GameReference;
      creator: string | null;
      refundAmount: bigint | null;
      closedBy: "creator" | "operator" | null;
    };

/** Input must come from trusted program logs on reference.network, in canonical order. */
export function normalizeSolanaGameEvent(
  reference: SolanaGameReference,
  event: ProgramEvent,
): NormalizedGameEvent | null {
  if (!("gameKey" in event.data)) return null;
  if (event.data.gameKey !== reference.gameId)
    throw new Error("Event belongs to another game");
  switch (event.name) {
    case "GameInitialized": {
      const e = event.data;
      return {
        kind: "created",
        reference,
        creator: e.creator,
        token: e.tokenMint,
        gameType: e.gameType,
        ticketAmount: e.ticketAmount,
        totalAmount: e.totalAmount,
        minimumParticipants: e.minTickets,
        maximumParticipants: e.maxTickets,
        expiresAt: e.createdAt + e.timeout,
        isPrivate: e.isPrivate,
        commitment: null,
      };
    }
    case "PlayerJoined":
    case "PlayerUnjoined":
      return { ...normalizeSolanaMembership(reference, event), amount: null };
    case "GameCompleted":
      return {
        kind: "completed",
        reference,
        winner: event.data.winner,
        prize: event.data.winnerAmount,
        fee: event.data.feeAmount,
        secret: null,
      };
    case "GameClosed":
      return {
        kind: "closed",
        reference,
        creator: null,
        refundAmount: null,
        closedBy: "creator",
      };
    case "OperatorGameClosed":
      return {
        kind: "closed",
        reference,
        creator: event.data.creator,
        refundAmount: event.data.refundedAmount,
        closedBy: "operator",
      };
    default:
      return null;
  }
}
