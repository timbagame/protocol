import * as z from "zod";
import { NonNegativeIntegerSchema, NullablePriceUsdSchema, PositiveIntegerSchema, SimpleApiErrorSchema, SlotSchema, SolanaAddressSchema, SolanaSignatureSchema, UnixTimestampSchema, defineEndpoint, } from "../common/index.js";
export const GameTypeSchema = z.enum(["coinflip", "giveaway"]);
export const GameStatusSchema = z.enum(["active", "completed", "cancelled"]);
const NullableAmountSchema = z.number().finite().nonnegative().nullable();
export const IndexerGameSchema = z.object({
    signature: SolanaSignatureSchema,
    gameKey: SolanaAddressSchema,
    status: GameStatusSchema.optional(),
    creator: SolanaAddressSchema.nullable().optional(),
    gameType: GameTypeSchema.nullable().optional(),
    ticketAmount: NullableAmountSchema.optional(),
    totalAmount: NullableAmountSchema.optional(),
    maxTickets: NonNegativeIntegerSchema.nullable().optional(),
    minTickets: NonNegativeIntegerSchema.nullable().optional(),
    isPrivate: z.boolean().nullable().optional(),
    createdAt: UnixTimestampSchema.nullable().optional(),
    timeout: NonNegativeIntegerSchema.nullable().optional(),
    expiresAt: UnixTimestampSchema.nullable().optional(),
    winner: SolanaAddressSchema.nullable(),
    winnerAmount: NullableAmountSchema,
    feeAmount: NullableAmountSchema,
    ticketsCount: NonNegativeIntegerSchema.nullable(),
    tokenMint: SolanaAddressSchema,
    timestamp: UnixTimestampSchema,
    slot: SlotSchema,
    priceUsd: NullablePriceUsdSchema.optional(),
    isCreator: z.boolean().optional(),
    isPlayer: z.boolean().optional(),
    isJoined: z.boolean().optional(),
});
export const IndexerTokenFinancialStatsSchema = z.object({
    tokenMint: SolanaAddressSchema,
    totalVolume: z.number().finite().nonnegative(),
    totalFees: z.number().finite().nonnegative(),
    priceUsd: NullablePriceUsdSchema.optional(),
    biggestWin: z
        .object({
        amount: z.number().finite().nonnegative(),
        winner: SolanaAddressSchema,
        signature: SolanaSignatureSchema,
    })
        .nullable(),
});
export const IndexerStatsResponseSchema = z.object({
    totalGames: NonNegativeIntegerSchema,
    uniquePlayers: NonNegativeIntegerSchema,
    financials: z.array(IndexerTokenFinancialStatsSchema),
    lastUpdated: UnixTimestampSchema,
});
export const IndexerGamesResponseSchema = z.object({
    games: z.array(IndexerGameSchema),
    total: NonNegativeIntegerSchema,
    page: PositiveIntegerSchema,
    limit: PositiveIntegerSchema,
});
export const IndexerPlayerGamesResponseSchema = z.object({
    games: z.array(IndexerGameSchema),
    count: NonNegativeIntegerSchema,
    limit: PositiveIntegerSchema,
    offset: NonNegativeIntegerSchema,
});
export const IndexerActiveGameSchema = z.object({
    game_key: SolanaAddressSchema,
    creator: SolanaAddressSchema,
    ticket_amount: z.number().finite().nonnegative(),
    total_amount: z.number().finite().nonnegative(),
    max_tickets: NonNegativeIntegerSchema,
    min_tickets: NonNegativeIntegerSchema,
    current_tickets: NonNegativeIntegerSchema,
    token_mint: SolanaAddressSchema,
    is_private: z.union([z.literal(0), z.literal(1)]),
    created_at: UnixTimestampSchema,
    timeout: NonNegativeIntegerSchema,
    signature: SolanaSignatureSchema,
    slot: SlotSchema,
    indexed_at: UnixTimestampSchema,
    expiresAt: UnixTimestampSchema,
    timeLeft: NonNegativeIntegerSchema,
    isPrivate: z.boolean(),
    game_type: GameTypeSchema.nullable(),
    priceUsd: NullablePriceUsdSchema.optional(),
});
export const IndexerActiveGamesResponseSchema = z.object({
    games: z.array(IndexerActiveGameSchema),
    count: NonNegativeIntegerSchema,
});
export const IndexerPlayerProfileSchema = z.object({
    wallet: SolanaAddressSchema,
    summary: z.object({
        relatedGames: NonNegativeIntegerSchema,
        createdGames: NonNegativeIntegerSchema,
        playedGames: NonNegativeIntegerSchema,
        activeGames: NonNegativeIntegerSchema,
        completedGames: NonNegativeIntegerSchema,
        cancelledGames: NonNegativeIntegerSchema,
        wins: NonNegativeIntegerSchema,
        losses: NonNegativeIntegerSchema,
        lastActivity: UnixTimestampSchema.nullable(),
    }),
    tokens: z.array(z.object({
        tokenMint: SolanaAddressSchema,
        gamesPlayed: NonNegativeIntegerSchema,
        stakedAmount: z.number().finite().nonnegative(),
        wonAmount: z.number().finite().nonnegative(),
        priceUsd: NullablePriceUsdSchema.optional(),
    })),
    frequentPlayers: z.array(z.object({
        player: SolanaAddressSchema,
        gamesTogether: NonNegativeIntegerSchema,
    })),
    historyComplete: z.boolean(),
});
export const IndexerTokenSummarySchema = z.object({
    tokenMint: SolanaAddressSchema,
    games: NonNegativeIntegerSchema,
    latestTimestamp: UnixTimestampSchema,
    priceUsd: NullablePriceUsdSchema.optional(),
});
export const IndexerTokensResponseSchema = z.object({
    tokens: z.array(IndexerTokenSummarySchema),
});
export const IndexerLeaderboardPlayerSchema = z.object({
    player: SolanaAddressSchema,
    games_won: NonNegativeIntegerSchema,
    total_winnings: z.number().finite().nonnegative().nullable(),
    avg_win: z.number().finite().nonnegative().nullable(),
});
export const IndexerLeaderboardResponseSchema = z.object({
    players: z.array(IndexerLeaderboardPlayerSchema),
    count: NonNegativeIntegerSchema,
});
export const IndexerHealthResponseSchema = z.object({
    status: z.literal("ok"),
    timestamp: z.number().int().nonnegative(),
});
export const IndexerTriggerResponseSchema = z.object({
    success: z.literal(true),
    indexed: NonNegativeIntegerSchema,
    total: NonNegativeIntegerSchema,
    message: z.string().min(1),
});
export const IndexerTriggerErrorSchema = z.object({
    success: z.literal(false),
    error: z.string().min(1),
});
export const HistoricalBackfillStateSchema = z.object({
    beforeSignature: SolanaSignatureSchema.nullable(),
    pages: NonNegativeIntegerSchema,
    transactions: NonNegativeIntegerSchema,
    initializedEvents: NonNegativeIntegerSchema,
    closedEvents: NonNegativeIntegerSchema,
    complete: z.boolean(),
});
export const HistoricalInitializedEventSchema = z.object({
    signature: SolanaSignatureSchema,
    gameKey: SolanaAddressSchema,
    creator: SolanaAddressSchema,
    gameType: GameTypeSchema,
    ticketAmount: z.number().finite().nonnegative(),
    totalAmount: z.number().finite().nonnegative(),
    maxTickets: NonNegativeIntegerSchema,
    minTickets: NonNegativeIntegerSchema,
    tokenMint: SolanaAddressSchema,
    isPrivate: z.boolean(),
    createdAt: UnixTimestampSchema,
    timeout: NonNegativeIntegerSchema,
    slot: SlotSchema,
});
export const HistoricalCompletedEventSchema = z.object({
    signature: SolanaSignatureSchema,
    gameKey: SolanaAddressSchema,
    winner: SolanaAddressSchema,
    winnerAmount: z.number().finite().nonnegative(),
    feeAmount: z.number().finite().nonnegative(),
    ticketsCount: NonNegativeIntegerSchema,
    timestamp: UnixTimestampSchema,
    slot: SlotSchema,
});
export const HistoricalClosedEventSchema = z.object({
    signature: SolanaSignatureSchema,
    gameKey: SolanaAddressSchema,
    timestamp: UnixTimestampSchema,
    slot: SlotSchema,
});
export const HistoricalMembershipEventSchema = z.object({
    kind: z.enum(["joined", "unjoined"]),
    signature: SolanaSignatureSchema,
    gameKey: SolanaAddressSchema,
    player: SolanaAddressSchema,
    ticketsCount: NonNegativeIntegerSchema,
    ticketIndex: NonNegativeIntegerSchema,
    timestamp: UnixTimestampSchema,
    slot: SlotSchema,
});
export const HistoricalGameEventPageSchema = z.object({
    initialized: z.array(HistoricalInitializedEventSchema),
    completed: z.array(HistoricalCompletedEventSchema),
    closed: z.array(HistoricalClosedEventSchema),
    membership: z.array(HistoricalMembershipEventSchema),
    nextBefore: SolanaSignatureSchema.nullable(),
    oldestSlot: SlotSchema.nullable(),
    transactions: z.number().int().min(0).max(100),
    complete: z.boolean(),
});
export const BackfillCommitRequestSchema = z.strictObject({
    expectedBefore: SolanaSignatureSchema.nullable(),
    page: HistoricalGameEventPageSchema,
});
export const BackfillStateResponseSchema = z.object({
    success: z.literal(true),
    state: HistoricalBackfillStateSchema,
});
export const BackfillConflictResponseSchema = z.object({
    error: z.string().min(1),
    state: HistoricalBackfillStateSchema,
});
export const BackfillRetryableErrorSchema = z.object({
    success: z.literal(false),
    retryable: z.literal(true),
    reason: z.enum(["rpc_rate_limited", "page_failed"]),
    error: z.string().min(1),
});
export const PaginationQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(50),
    offset: z.coerce.number().int().nonnegative().default(0),
});
export const GamesQuerySchema = PaginationQuerySchema.extend({
    tokenMint: SolanaAddressSchema.optional(),
});
export const PlayerQuerySchema = PaginationQuerySchema.extend({
    player: SolanaAddressSchema,
});
export const LatestGamesQuerySchema = z.object({
    limit: z.coerce.number().int().min(1).max(100).default(10),
    tokenMint: SolanaAddressSchema.optional(),
    gameType: GameTypeSchema.optional(),
    includeLifecycle: z.enum(["0", "1"]).optional(),
});
export const GameByKeyQuerySchema = z.object({
    gameKey: SolanaAddressSchema,
    fresh: z.string().optional(),
});
export const indexerContract = {
    health: defineEndpoint({
        method: "GET",
        path: "/health",
        authenticated: false,
        responses: { 200: IndexerHealthResponseSchema },
    }),
    triggerIndex: defineEndpoint({
        method: "POST",
        path: "/api/trigger-index",
        authenticated: true,
        responses: {
            200: IndexerTriggerResponseSchema,
            401: SimpleApiErrorSchema,
            500: IndexerTriggerErrorSchema,
        },
    }),
    readBackfill: defineEndpoint({
        method: "GET",
        path: "/api/backfill",
        authenticated: true,
        responses: {
            200: BackfillStateResponseSchema,
            401: SimpleApiErrorSchema,
            429: BackfillRetryableErrorSchema,
            500: BackfillRetryableErrorSchema,
        },
    }),
    runBackfill: defineEndpoint({
        method: "POST",
        path: "/api/backfill",
        authenticated: true,
        responses: {
            200: BackfillStateResponseSchema,
            401: SimpleApiErrorSchema,
            429: BackfillRetryableErrorSchema,
            500: BackfillRetryableErrorSchema,
        },
    }),
    commitBackfill: defineEndpoint({
        method: "POST",
        path: "/api/backfill/commit",
        authenticated: true,
        body: BackfillCommitRequestSchema,
        responses: {
            200: BackfillStateResponseSchema,
            400: SimpleApiErrorSchema,
            401: SimpleApiErrorSchema,
            409: BackfillConflictResponseSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    stats: defineEndpoint({
        method: "GET",
        path: "/api/stats",
        authenticated: false,
        query: z.object({ tokenMint: SolanaAddressSchema.optional() }),
        responses: {
            200: IndexerStatsResponseSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    games: defineEndpoint({
        method: "GET",
        path: "/api/games",
        authenticated: false,
        query: GamesQuerySchema,
        responses: {
            200: IndexerGamesResponseSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    latestGames: defineEndpoint({
        method: "GET",
        path: "/api/games/latest",
        authenticated: false,
        query: LatestGamesQuerySchema,
        responses: {
            200: z.array(IndexerGameSchema),
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    gameByKey: defineEndpoint({
        method: "GET",
        path: "/api/games/by-key",
        authenticated: false,
        query: GameByKeyQuerySchema,
        responses: {
            200: IndexerGameSchema,
            400: SimpleApiErrorSchema,
            404: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    activeGames: defineEndpoint({
        method: "GET",
        path: "/api/active-games",
        authenticated: false,
        responses: {
            200: IndexerActiveGamesResponseSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    playerActiveGames: defineEndpoint({
        method: "GET",
        path: "/api/my-active-games",
        authenticated: false,
        query: z.object({ player: SolanaAddressSchema }),
        responses: {
            200: IndexerActiveGamesResponseSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    playerGames: defineEndpoint({
        method: "GET",
        path: "/api/player-games",
        authenticated: false,
        query: PlayerQuerySchema,
        responses: {
            200: IndexerPlayerGamesResponseSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    playerProfile: defineEndpoint({
        method: "GET",
        path: "/api/player-profile",
        authenticated: false,
        query: z.object({ player: SolanaAddressSchema }),
        responses: {
            200: IndexerPlayerProfileSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
    tokens: defineEndpoint({
        method: "GET",
        path: "/api/tokens",
        authenticated: false,
        responses: { 200: IndexerTokensResponseSchema, 500: SimpleApiErrorSchema },
    }),
    leaderboard: defineEndpoint({
        method: "GET",
        path: "/api/leaderboard",
        authenticated: false,
        query: z.object({
            limit: z.coerce.number().int().min(1).max(100).default(20),
            tokenMint: SolanaAddressSchema.optional(),
        }),
        responses: {
            200: IndexerLeaderboardResponseSchema,
            400: SimpleApiErrorSchema,
            500: SimpleApiErrorSchema,
        },
    }),
};
//# sourceMappingURL=index.js.map