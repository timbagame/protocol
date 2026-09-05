import * as z from "zod";
export declare const CompletedGameNotificationSchema: z.ZodObject<{
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    winnerAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    winnerTxSignature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    totalPot: z.ZodNumber;
}, z.core.$strict>;
export declare const CompletedGameNotificationResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
}, z.core.$strip>;
export declare const BotHealthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
}, z.core.$strip>;
export declare const botContract: {
    readonly health: {
        readonly method: "GET";
        readonly path: "/health";
        readonly authenticated: false;
        readonly responses: {
            200: z.ZodObject<{
                status: z.ZodLiteral<"ok">;
            }, z.core.$strip>;
        };
    };
    readonly completedGame: {
        readonly method: "POST";
        readonly path: "/internal/completed";
        readonly authenticated: false;
        readonly body: z.ZodObject<{
            gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            winnerAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            winnerTxSignature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
            totalPot: z.ZodNumber;
        }, z.core.$strict>;
        readonly responses: {
            200: z.ZodObject<{
                success: z.ZodLiteral<true>;
            }, z.core.$strip>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
};
export type CompletedGameNotification = z.output<typeof CompletedGameNotificationSchema>;
//# sourceMappingURL=index.d.ts.map