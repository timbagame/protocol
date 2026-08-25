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
export declare const botContract: {
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
            readonly 200: z.ZodObject<{
                success: z.ZodLiteral<true>;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
};
export type CompletedGameNotification = z.output<typeof CompletedGameNotificationSchema>;
//# sourceMappingURL=index.d.ts.map