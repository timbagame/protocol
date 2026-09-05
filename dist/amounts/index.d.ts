/** Exact token amounts. No floating point conversion or implicit rounding. */
export declare class TokenAmountError extends Error {
    readonly code: "decimals" | "format" | "precision";
    constructor(code: "decimals" | "format" | "precision", message: string);
}
/** Accepts unsigned decimal strings, including .5 and 1., with surrounding whitespace. */
export declare function parseTokenAmount(value: string, decimals: number): bigint;
/** Formats unsigned base units without rounding, including zero-decimal tokens. */
export declare function formatTokenAmount(value: bigint, decimals: number): string;
//# sourceMappingURL=index.d.ts.map