import * as z from "zod";
import { Base64TransactionSchema, Hex32Schema, NonNegativeIntegerSchema, SimpleApiErrorSchema, SolanaAddressSchema, SolanaSignatureSchema, U64StringSchema, UnixTimestampSchema, defineEndpoint, } from "../common/index.js";
export const CreateGameRequestSchema = z
    .strictObject({
    creator: SolanaAddressSchema,
    tokenMint: SolanaAddressSchema,
    type: z.enum(["coinflip", "giveaway"]),
    amount: U64StringSchema.refine((amount) => amount !== "0", "Amount must be positive"),
    minPlayers: z.number().int().min(1).max(100),
    maxPlayers: z.number().int().min(1).max(100),
    timeoutSeconds: z.number().int().min(60).max(86_400),
})
    .superRefine((value, context) => {
    const minimumPlayers = value.type === "coinflip" ? 2 : 1;
    if (value.minPlayers < minimumPlayers) {
        context.addIssue({
            code: "custom",
            path: ["minPlayers"],
            message: `Minimum players for ${value.type} is ${minimumPlayers}`,
        });
    }
    if (value.maxPlayers < value.minPlayers) {
        context.addIssue({
            code: "custom",
            path: ["maxPlayers"],
            message: "Maximum players must not be lower than minimum players",
        });
    }
});
export const PrepareGameResponseSchema = z.object({
    txBase64: Base64TransactionSchema,
    gameAddress: SolanaAddressSchema,
    lastValidBlockHeight: NonNegativeIntegerSchema,
});
export const SubmitGameRequestSchema = z.strictObject({
    txBase64: Base64TransactionSchema.max(4_000),
});
export const SubmitGameResponseSchema = z.object({
    signature: SolanaSignatureSchema,
});
export const SerializedGameSchema = z.object({
    address: SolanaAddressSchema,
    creator: SolanaAddressSchema,
    type: z.enum(["coinflip", "giveaway"]),
    tokenMint: SolanaAddressSchema,
    stakeAmount: U64StringSchema,
    prizeAmount: U64StringSchema,
    currentPlayers: NonNegativeIntegerSchema,
    minPlayers: NonNegativeIntegerSchema,
    maxPlayers: NonNegativeIntegerSchema,
    isPrivate: z.boolean(),
    createdAt: UnixTimestampSchema,
    expiresAt: UnixTimestampSchema,
    lastSlot: U64StringSchema,
    participantAddresses: z.array(SolanaAddressSchema).readonly(),
});
export const GameTokenConfigSchema = z.object({
    mint: SolanaAddressSchema,
    symbol: z.string().min(1),
    decimals: z.number().int().min(0).max(255),
    minimumAmount: z.string().min(1),
    minimumAmountRaw: U64StringSchema,
    enabled: z.boolean(),
    priceUsd: z.number().finite().nonnegative().nullable().optional(),
});
export const GameConfigResponseSchema = z.object({
    tokens: z.array(GameTokenConfigSchema),
});
export const VerifyGameRequestSchema = z.strictObject({
    signature: SolanaSignatureSchema,
});
export const GameAddressParamsSchema = z.object({
    address: SolanaAddressSchema,
});
export const VerifyGameParamsSchema = z.object({
    signature: SolanaSignatureSchema,
});
export const VerifiedGameSchema = z.object({
    gameKey: SolanaAddressSchema,
    signature: SolanaSignatureSchema,
    timestamp: UnixTimestampSchema,
    gameType: z.enum(["coinflip", "giveaway"]).optional(),
    creator: SolanaAddressSchema.optional(),
    isPrivate: z.boolean().optional(),
    ticketAmount: z.number().finite().nonnegative().optional(),
    totalAmount: z.number().finite().nonnegative().optional(),
    maxTickets: NonNegativeIntegerSchema.optional(),
    createdAt: UnixTimestampSchema.optional(),
    participants: z.array(z.object({
        address: SolanaAddressSchema,
        ticketCount: NonNegativeIntegerSchema,
        ticketIndices: z.array(NonNegativeIntegerSchema),
    })),
    totalTickets: NonNegativeIntegerSchema,
    winner: SolanaAddressSchema,
    winnerTicketIndex: NonNegativeIntegerSchema,
    prizeAmount: z.number().finite().nonnegative(),
    feeAmount: z.number().finite().nonnegative(),
    tokenMint: SolanaAddressSchema,
    tokenSymbol: z.string().min(1),
    tokenDecimals: z.number().int().min(0).max(255),
    randomValue: U64StringSchema,
    secretKey: Hex32Schema.optional(),
    randomHash: Hex32Schema.optional(),
    transactionSignatures: z
        .array(SolanaSignatureSchema)
        .min(1)
        .max(2001)
        .optional(),
    lastSlot: U64StringSchema.optional(),
    calculationBreakdown: z.object({
        randomValue: U64StringSchema,
        totalTickets: NonNegativeIntegerSchema,
        winnerIndex: NonNegativeIntegerSchema,
        formula: z.string().min(1),
    }),
    explorerUrl: z.url(),
});
/** Complete published proof; chain reconstruction remains the oracle's responsibility. */
export const FinalizedVerifiedGameSchema = VerifiedGameSchema.extend({
    secretKey: Hex32Schema,
    randomHash: Hex32Schema,
    lastSlot: U64StringSchema,
    transactionSignatures: z.array(SolanaSignatureSchema).min(1).max(2001),
});
export const webContract = {
    prepareGame: defineEndpoint({
        method: "POST",
        path: "/api/play/games/prepare",
        authenticated: false,
        body: CreateGameRequestSchema,
        responses: {
            200: PrepareGameResponseSchema,
            400: SimpleApiErrorSchema,
            403: SimpleApiErrorSchema,
            413: SimpleApiErrorSchema,
            415: SimpleApiErrorSchema,
            503: SimpleApiErrorSchema,
        },
    }),
    submitGame: defineEndpoint({
        method: "POST",
        path: "/api/play/games/submit",
        authenticated: false,
        body: SubmitGameRequestSchema,
        responses: {
            200: SubmitGameResponseSchema,
            400: SimpleApiErrorSchema,
            403: SimpleApiErrorSchema,
            415: SimpleApiErrorSchema,
            503: SimpleApiErrorSchema,
        },
    }),
    gameConfig: defineEndpoint({
        method: "GET",
        path: "/api/play/config",
        authenticated: false,
        responses: { 200: GameConfigResponseSchema, 503: SimpleApiErrorSchema },
    }),
    game: defineEndpoint({
        method: "GET",
        path: "/api/play/games/:address",
        authenticated: false,
        params: GameAddressParamsSchema,
        query: z.object({ fresh: z.enum(["0", "1"]).optional() }),
        responses: {
            200: SerializedGameSchema,
            400: SimpleApiErrorSchema,
            404: SimpleApiErrorSchema,
            503: SimpleApiErrorSchema,
        },
    }),
    verifyGame: defineEndpoint({
        method: "POST",
        path: "/api/verify-game",
        authenticated: false,
        body: VerifyGameRequestSchema,
        responses: {
            200: FinalizedVerifiedGameSchema,
            400: SimpleApiErrorSchema,
            403: SimpleApiErrorSchema,
            503: SimpleApiErrorSchema,
        },
    }),
    cachedVerifyGame: defineEndpoint({
        method: "GET",
        path: "/api/verify-game/:signature",
        authenticated: false,
        params: VerifyGameParamsSchema,
        responses: {
            200: FinalizedVerifiedGameSchema,
            400: SimpleApiErrorSchema,
            503: SimpleApiErrorSchema,
        },
    }),
};
export { validateVerifiedGame } from "./verification.js";
//# sourceMappingURL=index.js.map