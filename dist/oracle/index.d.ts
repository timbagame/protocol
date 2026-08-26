import * as z from "zod";
export declare const GenerateHashRequestSchema: z.ZodObject<{
    gameType: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export declare const GenerateHashResponseSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    randomHash: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    oracleOperator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
}, z.core.$strip>;
export declare const SignGameTransactionRequestSchema: z.ZodObject<{
    txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
}, z.core.$strict>;
export declare const SignGameTransactionResponseSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
}, z.core.$strip>;
export declare const OracleHealthResponseSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    status: z.ZodLiteral<"healthy">;
}, z.core.$strip>;
export declare const OracleStatsSchema: z.ZodObject<{
    totalSecrets: z.ZodNumber;
    usedSecrets: z.ZodNumber;
    pendingGames: z.ZodNumber;
    completedGames: z.ZodNumber;
    cancelledGames: z.ZodNumber;
    eventListening: z.ZodBoolean;
    activeListeners: z.ZodNumber;
}, z.core.$strip>;
export declare const OracleStatsResponseSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    stats: z.ZodObject<{
        totalSecrets: z.ZodNumber;
        usedSecrets: z.ZodNumber;
        pendingGames: z.ZodNumber;
        completedGames: z.ZodNumber;
        cancelledGames: z.ZodNumber;
        eventListening: z.ZodBoolean;
        activeListeners: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const CompleteGameNowRequestSchema: z.ZodObject<{
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
}, z.core.$strict>;
export declare const CompleteGameNowResponseSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    status: z.ZodLiteral<"in-flight">;
}, z.core.$strip>, z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    status: z.ZodLiteral<"not-ready">;
}, z.core.$strip>, z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    status: z.ZodLiteral<"completed">;
    txHash: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    winnerAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    totalPot: z.ZodNumber;
}, z.core.$strip>], "status">;
export declare const oracleContract: {
    readonly health: {
        readonly method: "GET";
        readonly path: "/health";
        readonly authenticated: false;
        readonly responses: {
            readonly 200: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                status: z.ZodLiteral<"healthy">;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly generateHash: {
        readonly method: "POST";
        readonly path: "/generate-hash";
        readonly authenticated: true;
        readonly body: z.ZodObject<{
            gameType: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                randomHash: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
                gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                oracleOperator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 429: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly signGameTransaction: {
        readonly method: "POST";
        readonly path: "/sign-game-transaction";
        readonly authenticated: true;
        readonly body: z.ZodObject<{
            txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
        }, z.core.$strict>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 429: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 503: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly stats: {
        readonly method: "GET";
        readonly path: "/stats";
        readonly authenticated: true;
        readonly responses: {
            readonly 200: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                stats: z.ZodObject<{
                    totalSecrets: z.ZodNumber;
                    usedSecrets: z.ZodNumber;
                    pendingGames: z.ZodNumber;
                    completedGames: z.ZodNumber;
                    cancelledGames: z.ZodNumber;
                    eventListening: z.ZodBoolean;
                    activeListeners: z.ZodNumber;
                }, z.core.$strip>;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 429: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly completeGameNow: {
        readonly method: "POST";
        readonly path: "/games/complete-now";
        readonly authenticated: true;
        readonly body: z.ZodObject<{
            gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        }, z.core.$strict>;
        readonly responses: {
            readonly 200: z.ZodDiscriminatedUnion<[z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                status: z.ZodLiteral<"in-flight">;
            }, z.core.$strip>, z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                status: z.ZodLiteral<"not-ready">;
            }, z.core.$strip>, z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                status: z.ZodLiteral<"completed">;
                txHash: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                winnerAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                totalPot: z.ZodNumber;
            }, z.core.$strip>], "status">;
            readonly 400: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 404: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 409: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 429: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
};
export type GenerateHashRequest = z.input<typeof GenerateHashRequestSchema>;
export type GenerateHashResponse = z.output<typeof GenerateHashResponseSchema>;
export type SignGameTransactionRequest = z.input<typeof SignGameTransactionRequestSchema>;
export type SignGameTransactionResponse = z.output<typeof SignGameTransactionResponseSchema>;
export type OracleStats = z.output<typeof OracleStatsSchema>;
export type OracleStatsResponse = z.output<typeof OracleStatsResponseSchema>;
//# sourceMappingURL=index.d.ts.map