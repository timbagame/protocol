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