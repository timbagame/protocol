import { type Address } from "@solana/kit";
export declare function isWrappedSol(mint: Address): boolean;
export declare function buildWrapSolInstructions(owner: Address, amount: bigint): Promise<{
    tokenAccount: Address;
    instructions: import("@solana/kit").Instruction<string, readonly (import("@solana/kit").AccountLookupMeta<string, string> | import("@solana/kit").AccountMeta<string>)[]>[];
}>;
//# sourceMappingURL=wsol.d.ts.map