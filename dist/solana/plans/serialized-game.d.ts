import type { TimbaGameAccount } from "./types.js";
export interface SerializedTimbaGameAccount {
    address: string;
    creator: string;
    type: TimbaGameAccount["type"];
    tokenMint: string;
    stakeAmount: string;
    prizeAmount: string;
    currentPlayers: number;
    minPlayers: number;
    maxPlayers: number;
    isPrivate: boolean;
    createdAt: number;
    expiresAt: number;
    lastSlot: string;
    participantAddresses: readonly string[];
}
export declare function serializeGame(game: TimbaGameAccount): SerializedTimbaGameAccount;
export declare function deserializeGame(game: SerializedTimbaGameAccount): TimbaGameAccount;
//# sourceMappingURL=serialized-game.d.ts.map