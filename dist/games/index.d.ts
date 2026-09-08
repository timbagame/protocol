import type { Game as SolanaGame } from "../contracts/v0.3.0/generated/accounts/game.js";
import type { EventData } from "../contracts/events/index.js";
export type GameReference = {
    chain: "solana";
    network: string;
    deployment: string;
    gameId: string;
} | {
    chain: "evm";
    chainId: bigint;
    deployment: string;
    gameId: string;
};
export type SolanaGameReference = Extract<GameReference, {
    chain: "solana";
}>;
export type EvmGameReference = Extract<GameReference, {
    chain: "evm";
}>;
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
    entropyPosition: {
        kind: "solana-slot" | "evm-block";
        value: bigint;
    };
}
export type GameObservation = {
    status: "unknown";
    game: null;
    reference: GameReference;
} | {
    status: GameOutcome;
    game: null;
    reference: GameReference;
} | {
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
/** Pass only terminal outcomes established by confirmed indexed events for this game. */
export declare function observeSolanaGame(reference: SolanaGameReference, account: SolanaGame | null, terminal?: {
    gameKey: string;
    outcome: GameOutcome;
}, commitment?: string | null): GameObservation;
export declare function observeEvmGame(reference: EvmGameReference, account: EvmGame | null): GameObservation;
/** Derived from the current Oracle buffer. Never cache this as a creation-time economic term. */
export declare function gameLifecycle(game: NormalizedGame, now: bigint, buffer: bigint): {
    expired: boolean;
    recoveryAt: bigint;
    canJoin: boolean;
    canSettle: boolean;
    canRefund: boolean;
};
export interface MembershipChange {
    reference: GameReference;
    kind: "joined" | "refunded";
    player: string;
    index: number;
    movedParticipant: string | null;
}
export declare function normalizeSolanaMembership(reference: SolanaGameReference, event: {
    name: "PlayerJoined";
    data: EventData<"PlayerJoined">;
} | {
    name: "PlayerUnjoined";
    data: EventData<"PlayerUnjoined">;
}): MembershipChange;
export declare function normalizeEvmMembership(reference: EvmGameReference, event: {
    name: "PlayerJoined";
    gameId: string;
    player: string;
    index: bigint;
} | {
    name: "PlayerRefunded";
    gameId: string;
    player: string;
    removedIndex: bigint;
    movedParticipant: string;
}): MembershipChange;
export * from "./events.js";
export * from "./workflows.js";
//# sourceMappingURL=index.d.ts.map