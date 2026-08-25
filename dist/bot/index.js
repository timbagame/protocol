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
export const botContract = {
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