export declare const SOLANA_RANDOMNESS_VERSION: "sha256-slot-le-u64-v1";
/** Contract rejection sampling over overlapping little-endian u64 windows. */
export declare function selectWinnerFromEntropy(entropy: Uint8Array, tickets: bigint): {
    randomValue: bigint;
    winnerIndex: number;
};
export declare function createWinnerSeed(secret: Uint8Array, lastSlot: bigint): Uint8Array;
export declare function calculateWinner(secret: Uint8Array, lastSlot: bigint, tickets: bigint): Promise<{
    randomValue: bigint;
    winnerIndex: number;
}>;
//# sourceMappingURL=index.d.ts.map