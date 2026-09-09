import type { GameReference } from "./index.js";
export declare const CLIENT_GAME_LIMITS: {
    readonly maxPlayers: 100;
    readonly maxTimeout: 86400;
    readonly defaultTimeout: 3600;
    readonly defaultBuffer: 3600;
};
export declare const GAME_DEFAULTS: {
    readonly coinflip: {
        readonly minPlayers: 2;
        readonly maxPlayers: 2;
    };
    readonly giveaway: {
        readonly minPlayers: 1;
        readonly maxPlayers: 10;
    };
};
export interface GameDraft {
    type: "coinflip" | "giveaway";
    tokenMint: string;
    amount: string;
    minPlayers: number;
    maxPlayers: number;
    timeoutMinutes: number;
    isPrivate?: boolean;
}
export interface GameCapabilities {
    privateGames: boolean;
    minTimeout: number;
    maxTimeout: number;
    maxPlayers: number;
}
export declare const gameCapabilities: (chain: "solana" | "evm") => GameCapabilities;
/** Validates user input without signing, RPC calls, implicit rounding or float amounts. */
export declare function validateGameDraft(draft: GameDraft, token: {
    decimals: number;
    minimumAmount: string;
}, capabilities: GameCapabilities): bigint;
/** Always include deployment and network in cache, journal and UI identity. */
export declare function gameReferenceKey(reference: GameReference): string;
export declare function gamePath(reference: GameReference): string;
export type ActionProgress = "awaiting-wallet" | "submitted" | "confirmed" | "failed";
export declare function transactionProgress(receipt: {
    success: boolean;
    confirmations: number;
} | null, required: number): ActionProgress;
//# sourceMappingURL=workflows.d.ts.map