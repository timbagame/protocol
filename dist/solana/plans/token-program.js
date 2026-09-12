import { createNoopSigner, isOffCurveAddress, address, } from "@solana/kit";
import { TOKEN_PROGRAM_ADDRESS, ASSOCIATED_TOKEN_PROGRAM_ADDRESS, findAssociatedTokenPda, getCreateAssociatedTokenIdempotentInstruction, getSyncNativeInstruction, } from "@solana-program/token";
import { SYSTEM_PROGRAM_ADDRESS } from "@solana-program/system";
export const TOKEN_PROGRAM_ID = TOKEN_PROGRAM_ADDRESS;
export const ASSOCIATED_TOKEN_PROGRAM_ID = ASSOCIATED_TOKEN_PROGRAM_ADDRESS;
export const NATIVE_MINT = address("So11111111111111111111111111111111111111112");
export const SYSTEM_PROGRAM_ID = SYSTEM_PROGRAM_ADDRESS;
export class TokenOwnerOffCurveError extends Error {
    name = "TokenOwnerOffCurveError";
}
export async function getAssociatedTokenAddress(mint, owner, allowOwnerOffCurve = false, programId = TOKEN_PROGRAM_ID, associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID) {
    if (!allowOwnerOffCurve && isOffCurveAddress(owner))
        throw new TokenOwnerOffCurveError();
    return (await findAssociatedTokenPda({ mint, owner, tokenProgram: programId }, { programAddress: associatedTokenProgramId }))[0];
}
export function createAssociatedTokenAccountIdempotentInstruction(payer, associatedToken, owner, mint, programId = TOKEN_PROGRAM_ID, associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID) {
    return getCreateAssociatedTokenIdempotentInstruction({
        payer: createNoopSigner(payer),
        ata: associatedToken,
        owner,
        mint,
        tokenProgram: programId,
    }, { programAddress: associatedTokenProgramId });
}
export function createSyncNativeInstruction(account, programId = TOKEN_PROGRAM_ID) {
    return getSyncNativeInstruction({ account }, { programAddress: programId });
}
//# sourceMappingURL=token-program.js.map