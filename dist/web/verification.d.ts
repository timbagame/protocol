import type { Address } from "@solana/kit";
/** Checks published inputs locally; chain references remain available for auditing. */
export declare function validateVerifiedGame(value: unknown, signature: string, programId: Address): Promise<{
    gameKey: string & import("zod").$brand<"SolanaAddress">;
    signature: string & import("zod").$brand<"SolanaSignature">;
    timestamp: number;
    gameType?: "coinflip" | "giveaway" | undefined;
    creator?: (string & import("zod").$brand<"SolanaAddress">) | undefined;
    isPrivate?: boolean | undefined;
    ticketAmount?: number | undefined;
    totalAmount?: number | undefined;
    maxTickets?: number | undefined;
    createdAt?: number | undefined;
    participants: {
        address: string & import("zod").$brand<"SolanaAddress">;
        ticketCount: number;
        ticketIndices: number[];
    }[];
    totalTickets: number;
    winner: string & import("zod").$brand<"SolanaAddress">;
    winnerTicketIndex: number;
    prizeAmount: number;
    feeAmount: number;
    tokenMint: string & import("zod").$brand<"SolanaAddress">;
    tokenSymbol: string;
    tokenDecimals: number;
    randomValue: string & import("zod").$brand<"U64String">;
    calculationBreakdown: {
        randomValue: string & import("zod").$brand<"U64String">;
        totalTickets: number;
        winnerIndex: number;
        formula: string;
    };
    explorerUrl: string;
    secretKey: string & import("zod").$brand<"Hex32">;
    randomHash: string & import("zod").$brand<"Hex32">;
    lastSlot: string & import("zod").$brand<"U64String">;
    transactionSignatures: (string & import("zod").$brand<"SolanaSignature">)[];
}>;
//# sourceMappingURL=verification.d.ts.map