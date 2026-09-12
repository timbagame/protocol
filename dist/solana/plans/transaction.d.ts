import { type Address, type BlockhashLifetimeConstraint, type Instruction, type Transaction } from "@solana/kit";
export declare function createLegacyTransaction(feePayer: Address, lifetime: BlockhashLifetimeConstraint, instructions: readonly Instruction[]): Readonly<import("@solana/kit").TransactionWithBlockhashLifetime & Readonly<{
    messageBytes: import("@solana/kit").TransactionMessageBytes;
    signatures: import("@solana/kit").SignaturesMap;
}>>;
export declare function decodeTransactionBase64(value: string): Transaction;
export declare function encodeTransactionBase64(transaction: Transaction): string;
//# sourceMappingURL=transaction.d.ts.map