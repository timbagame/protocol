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
export declare const TokenPolicySchema: z.ZodObject<{
    mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    enabled: z.ZodBoolean;
    minimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    acceptedMinimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    revision: z.ZodNumber;
    effectiveAt: z.ZodISODateTime;
}, z.core.$strict>;
export declare const TokenPoliciesResponseSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<true>;
    policies: z.ZodArray<z.ZodObject<{
        mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        enabled: z.ZodBoolean;
        minimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
        acceptedMinimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
        revision: z.ZodNumber;
        effectiveAt: z.ZodISODateTime;
    }, z.core.$strict>>;
}, z.core.$strip>;
export declare const CreationPolicyRejectionCodeSchema: z.ZodEnum<{
    amount_below_minimum: "amount_below_minimum";
    policy_unavailable: "policy_unavailable";
    token_disabled: "token_disabled";
    unsupported_mint: "unsupported_mint";
}>;
export declare const CreationPolicyRejectionSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<false>;
    error: z.ZodString;
    code: z.ZodEnum<{
        amount_below_minimum: "amount_below_minimum";
        policy_unavailable: "policy_unavailable";
        token_disabled: "token_disabled";
        unsupported_mint: "unsupported_mint";
    }>;
    mint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
    minimumAmountRaw: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "U64String", "out">>;
    acceptedMinimumAmountRaw: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "U64String", "out">>;
    revision: z.ZodOptional<z.ZodNumber>;
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
            200: z.ZodObject<{
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
            500: z.ZodObject<{
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
            200: z.ZodObject<{
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
            400: z.ZodObject<{
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
            401: z.ZodObject<{
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
            429: z.ZodObject<{
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
            500: z.ZodObject<{
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
    readonly tokenPolicies: {
        readonly method: "GET";
        readonly path: "/token-policies";
        readonly authenticated: true;
        readonly responses: {
            200: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<true>;
                policies: z.ZodArray<z.ZodObject<{
                    mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    enabled: z.ZodBoolean;
                    minimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                    acceptedMinimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                    revision: z.ZodNumber;
                    effectiveAt: z.ZodISODateTime;
                }, z.core.$strict>>;
            }, z.core.$strip>;
            401: z.ZodObject<{
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
            429: z.ZodObject<{
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
            500: z.ZodObject<{
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
            503: z.ZodObject<{
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
            200: z.ZodObject<{
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
            400: z.ZodObject<{
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
            401: z.ZodObject<{
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
            422: z.ZodObject<{
                timestamp: z.ZodISODateTime;
                service: z.ZodObject<{
                    name: z.ZodString;
                    version: z.ZodString;
                    environment: z.ZodString;
                    uptime: z.ZodNumber;
                }, z.core.$strip>;
                success: z.ZodLiteral<false>;
                error: z.ZodString;
                code: z.ZodEnum<{
                    amount_below_minimum: "amount_below_minimum";
                    policy_unavailable: "policy_unavailable";
                    token_disabled: "token_disabled";
                    unsupported_mint: "unsupported_mint";
                }>;
                mint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                minimumAmountRaw: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "U64String", "out">>;
                acceptedMinimumAmountRaw: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "U64String", "out">>;
                revision: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strip>;
            429: z.ZodObject<{
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
            500: z.ZodObject<{
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
            503: z.ZodObject<{
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
            200: z.ZodObject<{
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
            401: z.ZodObject<{
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
            429: z.ZodObject<{
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
            500: z.ZodObject<{
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
            200: z.ZodDiscriminatedUnion<[z.ZodObject<{
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
            400: z.ZodObject<{
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
            401: z.ZodObject<{
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
            404: z.ZodObject<{
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
            409: z.ZodObject<{
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
            429: z.ZodObject<{
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
            500: z.ZodObject<{
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
export type TokenPolicyInput = z.input<typeof TokenPolicySchema>;
export type TokenPolicy = z.output<typeof TokenPolicySchema>;
export type TokenPoliciesResponse = z.output<typeof TokenPoliciesResponseSchema>;
export type CreationPolicyRejectionCode = z.output<typeof CreationPolicyRejectionCodeSchema>;
export type CreationPolicyRejection = z.output<typeof CreationPolicyRejectionSchema>;
export type OracleStats = z.output<typeof OracleStatsSchema>;
export type OracleStatsResponse = z.output<typeof OracleStatsResponseSchema>;
/** Pure eligibility check; callers own availability, metadata, and error presentation. */
export declare function evaluateTokenPolicy<T extends Pick<TokenPolicy, "mint" | "enabled" | "acceptedMinimumAmountRaw">>(policies: readonly T[], mint: string, amount?: bigint): {
    accepted: true;
    policy: T;
} | {
    accepted: false;
    code: "unsupported_mint" | "token_disabled" | "amount_below_minimum";
    policy?: T;
};
//# sourceMappingURL=index.d.ts.map