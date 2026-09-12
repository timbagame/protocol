import { type Address, type Instruction } from "@solana/kit";
export declare const TOKEN_PROGRAM_ID: Address<"TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA">;
export declare const ASSOCIATED_TOKEN_PROGRAM_ID: Address<"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL">;
export declare const NATIVE_MINT: Address<"So11111111111111111111111111111111111111112">;
export declare const SYSTEM_PROGRAM_ID: Address<"11111111111111111111111111111111">;
export declare class TokenOwnerOffCurveError extends Error {
    readonly name = "TokenOwnerOffCurveError";
}
export declare function getAssociatedTokenAddress(mint: Address, owner: Address, allowOwnerOffCurve?: boolean, programId?: Address, associatedTokenProgramId?: Address): Promise<Address>;
export declare function createAssociatedTokenAccountIdempotentInstruction(payer: Address, associatedToken: Address, owner: Address, mint: Address, programId?: Address, associatedTokenProgramId?: Address): Instruction;
export declare function createSyncNativeInstruction(account: Address, programId?: Address): Instruction;
//# sourceMappingURL=token-program.d.ts.map