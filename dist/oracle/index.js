import * as z from "zod";
import { ApiErrorSchema, Base64TransactionSchema, Hex32Schema, NonNegativeIntegerSchema, ServiceEnvelopeSchema, SolanaAddressSchema, SolanaSignatureSchema, defineEndpoint, } from "../common/index.js";
const OracleSuccessSchema = ServiceEnvelopeSchema.extend({
    success: z.literal(true),
});
export const GenerateHashRequestSchema = z.strictObject({
    gameType: z.enum(["coinflip", "giveaway"]).optional(),
});
export const GenerateHashResponseSchema = OracleSuccessSchema.extend({
    randomHash: Hex32Schema,
    gameAddress: SolanaAddressSchema,
    oracleOperator: SolanaAddressSchema,
});
export const SignGameTransactionRequestSchema = z.strictObject({
    txBase64: Base64TransactionSchema,
});
export const SignGameTransactionResponseSchema = OracleSuccessSchema.extend({
    txBase64: Base64TransactionSchema,
});
export const OracleHealthResponseSchema = OracleSuccessSchema.extend({
    status: z.literal("healthy"),
});
export const OracleStatsSchema = z.object({
    totalSecrets: NonNegativeIntegerSchema,
    usedSecrets: NonNegativeIntegerSchema,
    pendingGames: NonNegativeIntegerSchema,
    completedGames: NonNegativeIntegerSchema,
    cancelledGames: NonNegativeIntegerSchema,
    eventListening: z.boolean(),
    activeListeners: NonNegativeIntegerSchema,
});
export const OracleStatsResponseSchema = OracleSuccessSchema.extend({
    stats: OracleStatsSchema,
});
export const CompleteGameNowRequestSchema = z.strictObject({
    gameAddress: SolanaAddressSchema,
});
const CompleteGameBaseSchema = OracleSuccessSchema.extend({
    gameAddress: SolanaAddressSchema,
});
export const CompleteGameNowResponseSchema = z.discriminatedUnion("status", [
    CompleteGameBaseSchema.extend({ status: z.literal("in-flight") }),
    CompleteGameBaseSchema.extend({ status: z.literal("not-ready") }),
    CompleteGameBaseSchema.extend({
        status: z.literal("completed"),
        txHash: SolanaSignatureSchema,
        winnerAddress: SolanaAddressSchema,
        totalPot: z.number().finite().nonnegative(),
    }),
]);
export const oracleContract = {
    health: defineEndpoint({
        method: "GET",
        path: "/health",
        authenticated: false,
        responses: { 200: OracleHealthResponseSchema, 500: ApiErrorSchema },
    }),
    generateHash: defineEndpoint({
        method: "POST",
        path: "/generate-hash",
        authenticated: true,
        body: GenerateHashRequestSchema,
        responses: {
            200: GenerateHashResponseSchema,
            400: ApiErrorSchema,
            500: ApiErrorSchema,
        },
    }),
    signGameTransaction: defineEndpoint({
        method: "POST",
        path: "/sign-game-transaction",
        authenticated: true,
        body: SignGameTransactionRequestSchema,
        responses: {
            200: SignGameTransactionResponseSchema,
            400: ApiErrorSchema,
            503: ApiErrorSchema,
        },
    }),
    stats: defineEndpoint({
        method: "GET",
        path: "/stats",
        authenticated: true,
        responses: { 200: OracleStatsResponseSchema, 500: ApiErrorSchema },
    }),
    completeGameNow: defineEndpoint({
        method: "POST",
        path: "/games/complete-now",
        authenticated: true,
        body: CompleteGameNowRequestSchema,
        responses: {
            200: CompleteGameNowResponseSchema,
            400: ApiErrorSchema,
            404: ApiErrorSchema,
            409: ApiErrorSchema,
            500: ApiErrorSchema,
        },
    }),
};
//# sourceMappingURL=index.js.map