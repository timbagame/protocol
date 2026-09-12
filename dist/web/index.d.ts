import * as z from "zod";
export declare const CreateGameRequestSchema: z.ZodObject<{
    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    type: z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>;
    amount: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    minPlayers: z.ZodNumber;
    maxPlayers: z.ZodNumber;
    timeoutSeconds: z.ZodNumber;
}, z.core.$strict>;
export declare const PrepareGameResponseSchema: z.ZodObject<{
    txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
    gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    lastValidBlockHeight: z.ZodNumber;
}, z.core.$strip>;
export declare const SubmitGameRequestSchema: z.ZodObject<{
    txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
}, z.core.$strict>;
export declare const SubmitGameResponseSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
}, z.core.$strip>;
export declare const SerializedGameSchema: z.ZodObject<{
    address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    type: z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>;
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    stakeAmount: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    prizeAmount: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    currentPlayers: z.ZodNumber;
    minPlayers: z.ZodNumber;
    maxPlayers: z.ZodNumber;
    isPrivate: z.ZodBoolean;
    createdAt: z.ZodNumber;
    expiresAt: z.ZodNumber;
    lastSlot: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    participantAddresses: z.ZodReadonly<z.ZodArray<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
}, z.core.$strip>;
export declare const GameTokenConfigSchema: z.ZodObject<{
    mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    minimumAmount: z.ZodString;
    minimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    enabled: z.ZodBoolean;
    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const GameConfigResponseSchema: z.ZodObject<{
    tokens: z.ZodArray<z.ZodObject<{
        mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        minimumAmount: z.ZodString;
        minimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
        enabled: z.ZodBoolean;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const VerifyGameRequestSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
}, z.core.$strict>;
export declare const GameAddressParamsSchema: z.ZodObject<{
    address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
}, z.core.$strip>;
export declare const VerifyGameParamsSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
}, z.core.$strip>;
export declare const VerifiedGameSchema: z.ZodObject<{
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    timestamp: z.ZodNumber;
    gameType: z.ZodOptional<z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>>;
    creator: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    ticketAmount: z.ZodOptional<z.ZodNumber>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    maxTickets: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    participants: z.ZodArray<z.ZodObject<{
        address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        ticketCount: z.ZodNumber;
        ticketIndices: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>>;
    totalTickets: z.ZodNumber;
    winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    winnerTicketIndex: z.ZodNumber;
    prizeAmount: z.ZodNumber;
    feeAmount: z.ZodNumber;
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    tokenSymbol: z.ZodString;
    tokenDecimals: z.ZodNumber;
    randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    secretKey: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "Hex32", "out">>;
    randomHash: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "Hex32", "out">>;
    transactionSignatures: z.ZodOptional<z.ZodArray<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>>;
    lastSlot: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "U64String", "out">>;
    calculationBreakdown: z.ZodObject<{
        randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
        totalTickets: z.ZodNumber;
        winnerIndex: z.ZodNumber;
        formula: z.ZodString;
    }, z.core.$strip>;
    explorerUrl: z.ZodURL;
}, z.core.$strip>;
/** Complete published proof; chain reconstruction remains the oracle's responsibility. */
export declare const FinalizedVerifiedGameSchema: z.ZodObject<{
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    timestamp: z.ZodNumber;
    gameType: z.ZodOptional<z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>>;
    creator: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
    isPrivate: z.ZodOptional<z.ZodBoolean>;
    ticketAmount: z.ZodOptional<z.ZodNumber>;
    totalAmount: z.ZodOptional<z.ZodNumber>;
    maxTickets: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodNumber>;
    participants: z.ZodArray<z.ZodObject<{
        address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        ticketCount: z.ZodNumber;
        ticketIndices: z.ZodArray<z.ZodNumber>;
    }, z.core.$strip>>;
    totalTickets: z.ZodNumber;
    winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    winnerTicketIndex: z.ZodNumber;
    prizeAmount: z.ZodNumber;
    feeAmount: z.ZodNumber;
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    tokenSymbol: z.ZodString;
    tokenDecimals: z.ZodNumber;
    randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    calculationBreakdown: z.ZodObject<{
        randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
        totalTickets: z.ZodNumber;
        winnerIndex: z.ZodNumber;
        formula: z.ZodString;
    }, z.core.$strip>;
    explorerUrl: z.ZodURL;
    secretKey: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
    randomHash: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
    lastSlot: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
    transactionSignatures: z.ZodArray<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
}, z.core.$strip>;
export type FinalizedVerifiedGame = z.output<typeof FinalizedVerifiedGameSchema>;
export type FinalizedVerifiedGameInput = z.input<typeof FinalizedVerifiedGameSchema>;
export declare const webContract: {
    readonly prepareGame: {
        readonly method: "POST";
        readonly path: "/api/play/games/prepare";
        readonly authenticated: false;
        readonly body: z.ZodObject<{
            creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            type: z.ZodEnum<{
                coinflip: "coinflip";
                giveaway: "giveaway";
            }>;
            amount: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
            minPlayers: z.ZodNumber;
            maxPlayers: z.ZodNumber;
            timeoutSeconds: z.ZodNumber;
        }, z.core.$strict>;
        readonly responses: {
            200: z.ZodObject<{
                txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
                gameAddress: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                lastValidBlockHeight: z.ZodNumber;
            }, z.core.$strip>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            403: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            413: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            415: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            503: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly submitGame: {
        readonly method: "POST";
        readonly path: "/api/play/games/submit";
        readonly authenticated: false;
        readonly body: z.ZodObject<{
            txBase64: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
        }, z.core.$strict>;
        readonly responses: {
            200: z.ZodObject<{
                signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
            }, z.core.$strip>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            403: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            415: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            503: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly gameConfig: {
        readonly method: "GET";
        readonly path: "/api/play/config";
        readonly authenticated: false;
        readonly responses: {
            200: z.ZodObject<{
                tokens: z.ZodArray<z.ZodObject<{
                    mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    symbol: z.ZodString;
                    decimals: z.ZodNumber;
                    minimumAmount: z.ZodString;
                    minimumAmountRaw: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                    enabled: z.ZodBoolean;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            503: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly game: {
        readonly method: "GET";
        readonly path: "/api/play/games/:address";
        readonly authenticated: false;
        readonly params: z.ZodObject<{
            address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        }, z.core.$strip>;
        readonly query: z.ZodObject<{
            fresh: z.ZodOptional<z.ZodEnum<{
                0: "0";
                1: "1";
            }>>;
        }, z.core.$strip>;
        readonly responses: {
            200: z.ZodObject<{
                address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                type: z.ZodEnum<{
                    coinflip: "coinflip";
                    giveaway: "giveaway";
                }>;
                tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                stakeAmount: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                prizeAmount: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                currentPlayers: z.ZodNumber;
                minPlayers: z.ZodNumber;
                maxPlayers: z.ZodNumber;
                isPrivate: z.ZodBoolean;
                createdAt: z.ZodNumber;
                expiresAt: z.ZodNumber;
                lastSlot: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                participantAddresses: z.ZodReadonly<z.ZodArray<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
            }, z.core.$strip>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            404: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            503: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly verifyGame: {
        readonly method: "POST";
        readonly path: "/api/verify-game";
        readonly authenticated: false;
        readonly body: z.ZodObject<{
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        }, z.core.$strict>;
        readonly responses: {
            200: z.ZodObject<{
                gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                timestamp: z.ZodNumber;
                gameType: z.ZodOptional<z.ZodEnum<{
                    coinflip: "coinflip";
                    giveaway: "giveaway";
                }>>;
                creator: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                isPrivate: z.ZodOptional<z.ZodBoolean>;
                ticketAmount: z.ZodOptional<z.ZodNumber>;
                totalAmount: z.ZodOptional<z.ZodNumber>;
                maxTickets: z.ZodOptional<z.ZodNumber>;
                createdAt: z.ZodOptional<z.ZodNumber>;
                participants: z.ZodArray<z.ZodObject<{
                    address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    ticketCount: z.ZodNumber;
                    ticketIndices: z.ZodArray<z.ZodNumber>;
                }, z.core.$strip>>;
                totalTickets: z.ZodNumber;
                winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                winnerTicketIndex: z.ZodNumber;
                prizeAmount: z.ZodNumber;
                feeAmount: z.ZodNumber;
                tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                tokenSymbol: z.ZodString;
                tokenDecimals: z.ZodNumber;
                randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                calculationBreakdown: z.ZodObject<{
                    randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                    totalTickets: z.ZodNumber;
                    winnerIndex: z.ZodNumber;
                    formula: z.ZodString;
                }, z.core.$strip>;
                explorerUrl: z.ZodURL;
                secretKey: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
                randomHash: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
                lastSlot: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                transactionSignatures: z.ZodArray<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
            }, z.core.$strip>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            403: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            503: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly cachedVerifyGame: {
        readonly method: "GET";
        readonly path: "/api/verify-game/:signature";
        readonly authenticated: false;
        readonly params: z.ZodObject<{
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        }, z.core.$strip>;
        readonly responses: {
            200: z.ZodObject<{
                gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                timestamp: z.ZodNumber;
                gameType: z.ZodOptional<z.ZodEnum<{
                    coinflip: "coinflip";
                    giveaway: "giveaway";
                }>>;
                creator: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                isPrivate: z.ZodOptional<z.ZodBoolean>;
                ticketAmount: z.ZodOptional<z.ZodNumber>;
                totalAmount: z.ZodOptional<z.ZodNumber>;
                maxTickets: z.ZodOptional<z.ZodNumber>;
                createdAt: z.ZodOptional<z.ZodNumber>;
                participants: z.ZodArray<z.ZodObject<{
                    address: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    ticketCount: z.ZodNumber;
                    ticketIndices: z.ZodArray<z.ZodNumber>;
                }, z.core.$strip>>;
                totalTickets: z.ZodNumber;
                winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                winnerTicketIndex: z.ZodNumber;
                prizeAmount: z.ZodNumber;
                feeAmount: z.ZodNumber;
                tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                tokenSymbol: z.ZodString;
                tokenDecimals: z.ZodNumber;
                randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                calculationBreakdown: z.ZodObject<{
                    randomValue: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                    totalTickets: z.ZodNumber;
                    winnerIndex: z.ZodNumber;
                    formula: z.ZodString;
                }, z.core.$strip>;
                explorerUrl: z.ZodURL;
                secretKey: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
                randomHash: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
                lastSlot: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
                transactionSignatures: z.ZodArray<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
            }, z.core.$strip>;
            400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            503: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
};
export type CreateGameRequest = z.input<typeof CreateGameRequestSchema>;
export type PrepareGameResponse = z.output<typeof PrepareGameResponseSchema>;
export type SubmitGameRequest = z.input<typeof SubmitGameRequestSchema>;
export type SubmitGameResponse = z.output<typeof SubmitGameResponseSchema>;
export type SerializedGame = z.output<typeof SerializedGameSchema>;
export type GameTokenConfig = z.output<typeof GameTokenConfigSchema>;
export type GameConfigResponse = z.output<typeof GameConfigResponseSchema>;
export type VerifiedGame = z.output<typeof VerifiedGameSchema>;
export { validateVerifiedGame } from "./verification.js";
//# sourceMappingURL=index.d.ts.map