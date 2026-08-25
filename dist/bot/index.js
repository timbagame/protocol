import * as z from "zod";
import { SimpleApiErrorSchema, SolanaAddressSchema, SolanaSignatureSchema, defineEndpoint, } from "../common/index.js";
export const CompletedGameNotificationSchema = z.strictObject({
    gameAddress: SolanaAddressSchema,
    winnerAddress: SolanaAddressSchema,
    winnerTxSignature: SolanaSignatureSchema,
    totalPot: z.number().finite().nonnegative(),
});
export const CompletedGameNotificationResponseSchema = z.object({
    success: z.literal(true),
});
export const BotHealthResponseSchema = z.object({
    status: z.literal("ok"),
});
export const botContract = {
    health: defineEndpoint({
        method: "GET",
        path: "/health",
        authenticated: false,
        responses: { 200: BotHealthResponseSchema },
    }),
    completedGame: defineEndpoint({
        method: "POST",
        path: "/internal/completed",
        authenticated: false,
        body: CompletedGameNotificationSchema,
        responses: {
            200: CompletedGameNotificationResponseSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
};
//# sourceMappingURL=index.js.map