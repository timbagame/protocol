import * as z from "zod";
export declare const GameTypeSchema: z.ZodEnum<{
    coinflip: "coinflip";
    giveaway: "giveaway";
}>;
export declare const GameStatusSchema: z.ZodEnum<{
    completed: "completed";
    active: "active";
    cancelled: "cancelled";
}>;
export declare const IndexerGameSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    status: z.ZodOptional<z.ZodEnum<{
        completed: "completed";
        active: "active";
        cancelled: "cancelled";
    }>>;
    creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
    gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>>>;
    ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
    createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
    winnerAmount: z.ZodNullable<z.ZodNumber>;
    feeAmount: z.ZodNullable<z.ZodNumber>;
    ticketsCount: z.ZodNullable<z.ZodNumber>;
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    timestamp: z.ZodNumber;
    slot: z.ZodNumber;
    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    isCreator: z.ZodOptional<z.ZodBoolean>;
    isPlayer: z.ZodOptional<z.ZodBoolean>;
    isJoined: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const IndexerTokenFinancialStatsSchema: z.ZodObject<{
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    totalVolume: z.ZodNumber;
    totalFees: z.ZodNumber;
    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    biggestWin: z.ZodNullable<z.ZodObject<{
        amount: z.ZodNumber;
        winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const IndexerStatsResponseSchema: z.ZodObject<{
    totalGames: z.ZodNumber;
    uniquePlayers: z.ZodNumber;
    financials: z.ZodArray<z.ZodObject<{
        tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        totalVolume: z.ZodNumber;
        totalFees: z.ZodNumber;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        biggestWin: z.ZodNullable<z.ZodObject<{
            amount: z.ZodNumber;
            winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        }, z.core.$strip>>;
    }, z.core.$strip>>;
    lastUpdated: z.ZodNumber;
}, z.core.$strip>;
export declare const IndexerGamesResponseSchema: z.ZodObject<{
    games: z.ZodArray<z.ZodObject<{
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        status: z.ZodOptional<z.ZodEnum<{
            completed: "completed";
            active: "active";
            cancelled: "cancelled";
        }>>;
        creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
        gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            coinflip: "coinflip";
            giveaway: "giveaway";
        }>>>;
        ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
        winnerAmount: z.ZodNullable<z.ZodNumber>;
        feeAmount: z.ZodNullable<z.ZodNumber>;
        ticketsCount: z.ZodNullable<z.ZodNumber>;
        tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        timestamp: z.ZodNumber;
        slot: z.ZodNumber;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isCreator: z.ZodOptional<z.ZodBoolean>;
        isPlayer: z.ZodOptional<z.ZodBoolean>;
        isJoined: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    total: z.ZodNumber;
    page: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strip>;
export declare const IndexerPlayerGamesResponseSchema: z.ZodObject<{
    games: z.ZodArray<z.ZodObject<{
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        status: z.ZodOptional<z.ZodEnum<{
            completed: "completed";
            active: "active";
            cancelled: "cancelled";
        }>>;
        creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
        gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
            coinflip: "coinflip";
            giveaway: "giveaway";
        }>>>;
        ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
        createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
        winnerAmount: z.ZodNullable<z.ZodNumber>;
        feeAmount: z.ZodNullable<z.ZodNumber>;
        ticketsCount: z.ZodNullable<z.ZodNumber>;
        tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        timestamp: z.ZodNumber;
        slot: z.ZodNumber;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
        isCreator: z.ZodOptional<z.ZodBoolean>;
        isPlayer: z.ZodOptional<z.ZodBoolean>;
        isJoined: z.ZodOptional<z.ZodBoolean>;
    }, z.core.$strip>>;
    count: z.ZodNumber;
    limit: z.ZodNumber;
    offset: z.ZodNumber;
}, z.core.$strip>;
export declare const IndexerActiveGameSchema: z.ZodObject<{
    game_key: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    ticket_amount: z.ZodNumber;
    total_amount: z.ZodNumber;
    max_tickets: z.ZodNumber;
    min_tickets: z.ZodNumber;
    current_tickets: z.ZodNumber;
    token_mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    is_private: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
    created_at: z.ZodNumber;
    timeout: z.ZodNumber;
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    slot: z.ZodNumber;
    indexed_at: z.ZodNumber;
    expiresAt: z.ZodNumber;
    timeLeft: z.ZodNumber;
    isPrivate: z.ZodBoolean;
    game_type: z.ZodNullable<z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>>;
    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const IndexerActiveGamesResponseSchema: z.ZodObject<{
    games: z.ZodArray<z.ZodObject<{
        game_key: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        ticket_amount: z.ZodNumber;
        total_amount: z.ZodNumber;
        max_tickets: z.ZodNumber;
        min_tickets: z.ZodNumber;
        current_tickets: z.ZodNumber;
        token_mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        is_private: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
        created_at: z.ZodNumber;
        timeout: z.ZodNumber;
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        slot: z.ZodNumber;
        indexed_at: z.ZodNumber;
        expiresAt: z.ZodNumber;
        timeLeft: z.ZodNumber;
        isPrivate: z.ZodBoolean;
        game_type: z.ZodNullable<z.ZodEnum<{
            coinflip: "coinflip";
            giveaway: "giveaway";
        }>>;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>;
    count: z.ZodNumber;
}, z.core.$strip>;
export declare const IndexerPlayerProfileSchema: z.ZodObject<{
    wallet: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    summary: z.ZodObject<{
        relatedGames: z.ZodNumber;
        createdGames: z.ZodNumber;
        playedGames: z.ZodNumber;
        activeGames: z.ZodNumber;
        completedGames: z.ZodNumber;
        cancelledGames: z.ZodNumber;
        wins: z.ZodNumber;
        losses: z.ZodNumber;
        lastActivity: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>;
    tokens: z.ZodArray<z.ZodObject<{
        tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        gamesPlayed: z.ZodNumber;
        stakedAmount: z.ZodNumber;
        wonAmount: z.ZodNumber;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>;
    frequentPlayers: z.ZodArray<z.ZodObject<{
        player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        gamesTogether: z.ZodNumber;
    }, z.core.$strip>>;
    historyComplete: z.ZodBoolean;
}, z.core.$strip>;
export declare const IndexerTokenSummarySchema: z.ZodObject<{
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    games: z.ZodNumber;
    latestTimestamp: z.ZodNumber;
    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, z.core.$strip>;
export declare const IndexerTokensResponseSchema: z.ZodObject<{
    tokens: z.ZodArray<z.ZodObject<{
        tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        games: z.ZodNumber;
        latestTimestamp: z.ZodNumber;
        priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export declare const IndexerLeaderboardPlayerSchema: z.ZodObject<{
    player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    games_won: z.ZodNumber;
    total_winnings: z.ZodNullable<z.ZodNumber>;
    avg_win: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const IndexerLeaderboardResponseSchema: z.ZodObject<{
    players: z.ZodArray<z.ZodObject<{
        player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        games_won: z.ZodNumber;
        total_winnings: z.ZodNullable<z.ZodNumber>;
        avg_win: z.ZodNullable<z.ZodNumber>;
    }, z.core.$strip>>;
    count: z.ZodNumber;
}, z.core.$strip>;
export declare const IndexerHealthResponseSchema: z.ZodObject<{
    status: z.ZodLiteral<"ok">;
    timestamp: z.ZodNumber;
}, z.core.$strip>;
export declare const IndexerTriggerResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    indexed: z.ZodNumber;
    total: z.ZodNumber;
    message: z.ZodString;
}, z.core.$strip>;
export declare const IndexerTriggerErrorSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export declare const HistoricalBackfillStateSchema: z.ZodObject<{
    beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
    pages: z.ZodNumber;
    transactions: z.ZodNumber;
    initializedEvents: z.ZodNumber;
    closedEvents: z.ZodNumber;
    complete: z.ZodBoolean;
}, z.core.$strip>;
export declare const HistoricalInitializedEventSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    gameType: z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>;
    ticketAmount: z.ZodNumber;
    totalAmount: z.ZodNumber;
    maxTickets: z.ZodNumber;
    minTickets: z.ZodNumber;
    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    isPrivate: z.ZodBoolean;
    createdAt: z.ZodNumber;
    timeout: z.ZodNumber;
    slot: z.ZodNumber;
}, z.core.$strip>;
export declare const HistoricalCompletedEventSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    winnerAmount: z.ZodNumber;
    feeAmount: z.ZodNumber;
    ticketsCount: z.ZodNumber;
    timestamp: z.ZodNumber;
    slot: z.ZodNumber;
}, z.core.$strip>;
export declare const HistoricalClosedEventSchema: z.ZodObject<{
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    timestamp: z.ZodNumber;
    slot: z.ZodNumber;
}, z.core.$strip>;
export declare const HistoricalMembershipEventSchema: z.ZodObject<{
    kind: z.ZodEnum<{
        joined: "joined";
        unjoined: "unjoined";
    }>;
    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    ticketsCount: z.ZodNumber;
    ticketIndex: z.ZodNumber;
    timestamp: z.ZodNumber;
    slot: z.ZodNumber;
}, z.core.$strip>;
export declare const HistoricalGameEventPageSchema: z.ZodObject<{
    initialized: z.ZodArray<z.ZodObject<{
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        gameType: z.ZodEnum<{
            coinflip: "coinflip";
            giveaway: "giveaway";
        }>;
        ticketAmount: z.ZodNumber;
        totalAmount: z.ZodNumber;
        maxTickets: z.ZodNumber;
        minTickets: z.ZodNumber;
        tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        isPrivate: z.ZodBoolean;
        createdAt: z.ZodNumber;
        timeout: z.ZodNumber;
        slot: z.ZodNumber;
    }, z.core.$strip>>;
    completed: z.ZodArray<z.ZodObject<{
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        winnerAmount: z.ZodNumber;
        feeAmount: z.ZodNumber;
        ticketsCount: z.ZodNumber;
        timestamp: z.ZodNumber;
        slot: z.ZodNumber;
    }, z.core.$strip>>;
    closed: z.ZodArray<z.ZodObject<{
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        timestamp: z.ZodNumber;
        slot: z.ZodNumber;
    }, z.core.$strip>>;
    membership: z.ZodArray<z.ZodObject<{
        kind: z.ZodEnum<{
            joined: "joined";
            unjoined: "unjoined";
        }>;
        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
        gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        ticketsCount: z.ZodNumber;
        ticketIndex: z.ZodNumber;
        timestamp: z.ZodNumber;
        slot: z.ZodNumber;
    }, z.core.$strip>>;
    nextBefore: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
    oldestSlot: z.ZodNullable<z.ZodNumber>;
    transactions: z.ZodNumber;
    complete: z.ZodBoolean;
}, z.core.$strip>;
export declare const BackfillCommitRequestSchema: z.ZodObject<{
    expectedBefore: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
    page: z.ZodObject<{
        initialized: z.ZodArray<z.ZodObject<{
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
            gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            gameType: z.ZodEnum<{
                coinflip: "coinflip";
                giveaway: "giveaway";
            }>;
            ticketAmount: z.ZodNumber;
            totalAmount: z.ZodNumber;
            maxTickets: z.ZodNumber;
            minTickets: z.ZodNumber;
            tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            isPrivate: z.ZodBoolean;
            createdAt: z.ZodNumber;
            timeout: z.ZodNumber;
            slot: z.ZodNumber;
        }, z.core.$strip>>;
        completed: z.ZodArray<z.ZodObject<{
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
            gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            winnerAmount: z.ZodNumber;
            feeAmount: z.ZodNumber;
            ticketsCount: z.ZodNumber;
            timestamp: z.ZodNumber;
            slot: z.ZodNumber;
        }, z.core.$strip>>;
        closed: z.ZodArray<z.ZodObject<{
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
            gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            timestamp: z.ZodNumber;
            slot: z.ZodNumber;
        }, z.core.$strip>>;
        membership: z.ZodArray<z.ZodObject<{
            kind: z.ZodEnum<{
                joined: "joined";
                unjoined: "unjoined";
            }>;
            signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
            gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            ticketsCount: z.ZodNumber;
            ticketIndex: z.ZodNumber;
            timestamp: z.ZodNumber;
            slot: z.ZodNumber;
        }, z.core.$strip>>;
        nextBefore: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
        oldestSlot: z.ZodNullable<z.ZodNumber>;
        transactions: z.ZodNumber;
        complete: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strict>;
export declare const BackfillStateResponseSchema: z.ZodObject<{
    success: z.ZodLiteral<true>;
    state: z.ZodObject<{
        beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
        pages: z.ZodNumber;
        transactions: z.ZodNumber;
        initializedEvents: z.ZodNumber;
        closedEvents: z.ZodNumber;
        complete: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const BackfillConflictResponseSchema: z.ZodObject<{
    error: z.ZodString;
    state: z.ZodObject<{
        beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
        pages: z.ZodNumber;
        transactions: z.ZodNumber;
        initializedEvents: z.ZodNumber;
        closedEvents: z.ZodNumber;
        complete: z.ZodBoolean;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const BackfillRetryableErrorSchema: z.ZodObject<{
    success: z.ZodLiteral<false>;
    retryable: z.ZodLiteral<true>;
    reason: z.ZodEnum<{
        rpc_rate_limited: "rpc_rate_limited";
        page_failed: "page_failed";
    }>;
    error: z.ZodString;
}, z.core.$strip>;
export declare const PaginationQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
}, z.core.$strip>;
export declare const GamesQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    tokenMint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
}, z.core.$strip>;
export declare const PlayerQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
}, z.core.$strip>;
export declare const LatestGamesQuerySchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    tokenMint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
    gameType: z.ZodOptional<z.ZodEnum<{
        coinflip: "coinflip";
        giveaway: "giveaway";
    }>>;
    includeLifecycle: z.ZodOptional<z.ZodEnum<{
        0: "0";
        1: "1";
    }>>;
}, z.core.$strip>;
export declare const GameByKeyQuerySchema: z.ZodObject<{
    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
    fresh: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const indexerContract: {
    readonly health: {
        readonly method: "GET";
        readonly path: "/health";
        readonly authenticated: false;
        readonly responses: {
            readonly 200: z.ZodObject<{
                status: z.ZodLiteral<"ok">;
                timestamp: z.ZodNumber;
            }, z.core.$strip>;
        };
    };
    readonly triggerIndex: {
        readonly method: "POST";
        readonly path: "/api/trigger-index";
        readonly authenticated: false;
        readonly responses: {
            readonly 200: z.ZodObject<{
                success: z.ZodLiteral<true>;
                indexed: z.ZodNumber;
                total: z.ZodNumber;
                message: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                success: z.ZodLiteral<false>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly readBackfill: {
        readonly method: "GET";
        readonly path: "/api/backfill";
        readonly authenticated: true;
        readonly responses: {
            readonly 200: z.ZodObject<{
                success: z.ZodLiteral<true>;
                state: z.ZodObject<{
                    beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
                    pages: z.ZodNumber;
                    transactions: z.ZodNumber;
                    initializedEvents: z.ZodNumber;
                    closedEvents: z.ZodNumber;
                    complete: z.ZodBoolean;
                }, z.core.$strip>;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 429: z.ZodObject<{
                success: z.ZodLiteral<false>;
                retryable: z.ZodLiteral<true>;
                reason: z.ZodEnum<{
                    rpc_rate_limited: "rpc_rate_limited";
                    page_failed: "page_failed";
                }>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                success: z.ZodLiteral<false>;
                retryable: z.ZodLiteral<true>;
                reason: z.ZodEnum<{
                    rpc_rate_limited: "rpc_rate_limited";
                    page_failed: "page_failed";
                }>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly runBackfill: {
        readonly method: "POST";
        readonly path: "/api/backfill";
        readonly authenticated: true;
        readonly responses: {
            readonly 200: z.ZodObject<{
                success: z.ZodLiteral<true>;
                state: z.ZodObject<{
                    beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
                    pages: z.ZodNumber;
                    transactions: z.ZodNumber;
                    initializedEvents: z.ZodNumber;
                    closedEvents: z.ZodNumber;
                    complete: z.ZodBoolean;
                }, z.core.$strip>;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 429: z.ZodObject<{
                success: z.ZodLiteral<false>;
                retryable: z.ZodLiteral<true>;
                reason: z.ZodEnum<{
                    rpc_rate_limited: "rpc_rate_limited";
                    page_failed: "page_failed";
                }>;
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                success: z.ZodLiteral<false>;
                retryable: z.ZodLiteral<true>;
                reason: z.ZodEnum<{
                    rpc_rate_limited: "rpc_rate_limited";
                    page_failed: "page_failed";
                }>;
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly commitBackfill: {
        readonly method: "POST";
        readonly path: "/api/backfill/commit";
        readonly authenticated: true;
        readonly body: z.ZodObject<{
            expectedBefore: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
            page: z.ZodObject<{
                initialized: z.ZodArray<z.ZodObject<{
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    gameType: z.ZodEnum<{
                        coinflip: "coinflip";
                        giveaway: "giveaway";
                    }>;
                    ticketAmount: z.ZodNumber;
                    totalAmount: z.ZodNumber;
                    maxTickets: z.ZodNumber;
                    minTickets: z.ZodNumber;
                    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    isPrivate: z.ZodBoolean;
                    createdAt: z.ZodNumber;
                    timeout: z.ZodNumber;
                    slot: z.ZodNumber;
                }, z.core.$strip>>;
                completed: z.ZodArray<z.ZodObject<{
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    winnerAmount: z.ZodNumber;
                    feeAmount: z.ZodNumber;
                    ticketsCount: z.ZodNumber;
                    timestamp: z.ZodNumber;
                    slot: z.ZodNumber;
                }, z.core.$strip>>;
                closed: z.ZodArray<z.ZodObject<{
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    timestamp: z.ZodNumber;
                    slot: z.ZodNumber;
                }, z.core.$strip>>;
                membership: z.ZodArray<z.ZodObject<{
                    kind: z.ZodEnum<{
                        joined: "joined";
                        unjoined: "unjoined";
                    }>;
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    ticketsCount: z.ZodNumber;
                    ticketIndex: z.ZodNumber;
                    timestamp: z.ZodNumber;
                    slot: z.ZodNumber;
                }, z.core.$strip>>;
                nextBefore: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
                oldestSlot: z.ZodNullable<z.ZodNumber>;
                transactions: z.ZodNumber;
                complete: z.ZodBoolean;
            }, z.core.$strip>;
        }, z.core.$strict>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                success: z.ZodLiteral<true>;
                state: z.ZodObject<{
                    beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
                    pages: z.ZodNumber;
                    transactions: z.ZodNumber;
                    initializedEvents: z.ZodNumber;
                    closedEvents: z.ZodNumber;
                    complete: z.ZodBoolean;
                }, z.core.$strip>;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 401: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 409: z.ZodObject<{
                error: z.ZodString;
                state: z.ZodObject<{
                    beforeSignature: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">>;
                    pages: z.ZodNumber;
                    transactions: z.ZodNumber;
                    initializedEvents: z.ZodNumber;
                    closedEvents: z.ZodNumber;
                    complete: z.ZodBoolean;
                }, z.core.$strip>;
            }, z.core.$strip>;
        };
    };
    readonly stats: {
        readonly method: "GET";
        readonly path: "/api/stats";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            tokenMint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                totalGames: z.ZodNumber;
                uniquePlayers: z.ZodNumber;
                financials: z.ZodArray<z.ZodObject<{
                    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    totalVolume: z.ZodNumber;
                    totalFees: z.ZodNumber;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    biggestWin: z.ZodNullable<z.ZodObject<{
                        amount: z.ZodNumber;
                        winner: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                        signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    }, z.core.$strip>>;
                }, z.core.$strip>>;
                lastUpdated: z.ZodNumber;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly games: {
        readonly method: "GET";
        readonly path: "/api/games";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            tokenMint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                games: z.ZodArray<z.ZodObject<{
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    status: z.ZodOptional<z.ZodEnum<{
                        completed: "completed";
                        active: "active";
                        cancelled: "cancelled";
                    }>>;
                    creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
                    gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                        coinflip: "coinflip";
                        giveaway: "giveaway";
                    }>>>;
                    ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                    createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                    winnerAmount: z.ZodNullable<z.ZodNumber>;
                    feeAmount: z.ZodNullable<z.ZodNumber>;
                    ticketsCount: z.ZodNullable<z.ZodNumber>;
                    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    timestamp: z.ZodNumber;
                    slot: z.ZodNumber;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    isCreator: z.ZodOptional<z.ZodBoolean>;
                    isPlayer: z.ZodOptional<z.ZodBoolean>;
                    isJoined: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strip>>;
                total: z.ZodNumber;
                page: z.ZodNumber;
                limit: z.ZodNumber;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly latestGames: {
        readonly method: "GET";
        readonly path: "/api/games/latest";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            tokenMint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
            gameType: z.ZodOptional<z.ZodEnum<{
                coinflip: "coinflip";
                giveaway: "giveaway";
            }>>;
            includeLifecycle: z.ZodOptional<z.ZodEnum<{
                0: "0";
                1: "1";
            }>>;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodArray<z.ZodObject<{
                signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                status: z.ZodOptional<z.ZodEnum<{
                    completed: "completed";
                    active: "active";
                    cancelled: "cancelled";
                }>>;
                creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
                gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    coinflip: "coinflip";
                    giveaway: "giveaway";
                }>>>;
                ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                winnerAmount: z.ZodNullable<z.ZodNumber>;
                feeAmount: z.ZodNullable<z.ZodNumber>;
                ticketsCount: z.ZodNullable<z.ZodNumber>;
                tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                timestamp: z.ZodNumber;
                slot: z.ZodNumber;
                priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                isCreator: z.ZodOptional<z.ZodBoolean>;
                isPlayer: z.ZodOptional<z.ZodBoolean>;
                isJoined: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly gameByKey: {
        readonly method: "GET";
        readonly path: "/api/games/by-key";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
            fresh: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                status: z.ZodOptional<z.ZodEnum<{
                    completed: "completed";
                    active: "active";
                    cancelled: "cancelled";
                }>>;
                creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
                gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                    coinflip: "coinflip";
                    giveaway: "giveaway";
                }>>>;
                ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                winnerAmount: z.ZodNullable<z.ZodNumber>;
                feeAmount: z.ZodNullable<z.ZodNumber>;
                ticketsCount: z.ZodNullable<z.ZodNumber>;
                tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                timestamp: z.ZodNumber;
                slot: z.ZodNumber;
                priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                isCreator: z.ZodOptional<z.ZodBoolean>;
                isPlayer: z.ZodOptional<z.ZodBoolean>;
                isJoined: z.ZodOptional<z.ZodBoolean>;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 404: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly activeGames: {
        readonly method: "GET";
        readonly path: "/api/active-games";
        readonly authenticated: false;
        readonly responses: {
            readonly 200: z.ZodObject<{
                games: z.ZodArray<z.ZodObject<{
                    game_key: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    ticket_amount: z.ZodNumber;
                    total_amount: z.ZodNumber;
                    max_tickets: z.ZodNumber;
                    min_tickets: z.ZodNumber;
                    current_tickets: z.ZodNumber;
                    token_mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    is_private: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
                    created_at: z.ZodNumber;
                    timeout: z.ZodNumber;
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    slot: z.ZodNumber;
                    indexed_at: z.ZodNumber;
                    expiresAt: z.ZodNumber;
                    timeLeft: z.ZodNumber;
                    isPrivate: z.ZodBoolean;
                    game_type: z.ZodNullable<z.ZodEnum<{
                        coinflip: "coinflip";
                        giveaway: "giveaway";
                    }>>;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                }, z.core.$strip>>;
                count: z.ZodNumber;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly playerActiveGames: {
        readonly method: "GET";
        readonly path: "/api/my-active-games";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                games: z.ZodArray<z.ZodObject<{
                    game_key: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    creator: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    ticket_amount: z.ZodNumber;
                    total_amount: z.ZodNumber;
                    max_tickets: z.ZodNumber;
                    min_tickets: z.ZodNumber;
                    current_tickets: z.ZodNumber;
                    token_mint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    is_private: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
                    created_at: z.ZodNumber;
                    timeout: z.ZodNumber;
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    slot: z.ZodNumber;
                    indexed_at: z.ZodNumber;
                    expiresAt: z.ZodNumber;
                    timeLeft: z.ZodNumber;
                    isPrivate: z.ZodBoolean;
                    game_type: z.ZodNullable<z.ZodEnum<{
                        coinflip: "coinflip";
                        giveaway: "giveaway";
                    }>>;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                }, z.core.$strip>>;
                count: z.ZodNumber;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly playerGames: {
        readonly method: "GET";
        readonly path: "/api/player-games";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            offset: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                games: z.ZodArray<z.ZodObject<{
                    signature: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
                    gameKey: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    status: z.ZodOptional<z.ZodEnum<{
                        completed: "completed";
                        active: "active";
                        cancelled: "cancelled";
                    }>>;
                    creator: z.ZodOptional<z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>>;
                    gameType: z.ZodOptional<z.ZodNullable<z.ZodEnum<{
                        coinflip: "coinflip";
                        giveaway: "giveaway";
                    }>>>;
                    ticketAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    totalAmount: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    maxTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    minTickets: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    isPrivate: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
                    createdAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    timeout: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    expiresAt: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    winner: z.ZodNullable<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
                    winnerAmount: z.ZodNullable<z.ZodNumber>;
                    feeAmount: z.ZodNullable<z.ZodNumber>;
                    ticketsCount: z.ZodNullable<z.ZodNumber>;
                    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    timestamp: z.ZodNumber;
                    slot: z.ZodNumber;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                    isCreator: z.ZodOptional<z.ZodBoolean>;
                    isPlayer: z.ZodOptional<z.ZodBoolean>;
                    isJoined: z.ZodOptional<z.ZodBoolean>;
                }, z.core.$strip>>;
                count: z.ZodNumber;
                limit: z.ZodNumber;
                offset: z.ZodNumber;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly playerProfile: {
        readonly method: "GET";
        readonly path: "/api/player-profile";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                wallet: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                summary: z.ZodObject<{
                    relatedGames: z.ZodNumber;
                    createdGames: z.ZodNumber;
                    playedGames: z.ZodNumber;
                    activeGames: z.ZodNumber;
                    completedGames: z.ZodNumber;
                    cancelledGames: z.ZodNumber;
                    wins: z.ZodNumber;
                    losses: z.ZodNumber;
                    lastActivity: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>;
                tokens: z.ZodArray<z.ZodObject<{
                    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    gamesPlayed: z.ZodNumber;
                    stakedAmount: z.ZodNumber;
                    wonAmount: z.ZodNumber;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                }, z.core.$strip>>;
                frequentPlayers: z.ZodArray<z.ZodObject<{
                    player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    gamesTogether: z.ZodNumber;
                }, z.core.$strip>>;
                historyComplete: z.ZodBoolean;
            }, z.core.$strip>;
            readonly 400: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly tokens: {
        readonly method: "GET";
        readonly path: "/api/tokens";
        readonly authenticated: false;
        readonly responses: {
            readonly 200: z.ZodObject<{
                tokens: z.ZodArray<z.ZodObject<{
                    tokenMint: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    games: z.ZodNumber;
                    latestTimestamp: z.ZodNumber;
                    priceUsd: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                }, z.core.$strip>>;
            }, z.core.$strip>;
            readonly 500: z.ZodObject<{
                error: z.ZodString;
            }, z.core.$strip>;
        };
    };
    readonly leaderboard: {
        readonly method: "GET";
        readonly path: "/api/leaderboard";
        readonly authenticated: false;
        readonly query: z.ZodObject<{
            limit: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
            tokenMint: z.ZodOptional<z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">>;
        }, z.core.$strip>;
        readonly responses: {
            readonly 200: z.ZodObject<{
                players: z.ZodArray<z.ZodObject<{
                    player: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
                    games_won: z.ZodNumber;
                    total_winnings: z.ZodNullable<z.ZodNumber>;
                    avg_win: z.ZodNullable<z.ZodNumber>;
                }, z.core.$strip>>;
                count: z.ZodNumber;
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
export type IndexerGame = z.output<typeof IndexerGameSchema>;
export type IndexerStatsResponse = z.output<typeof IndexerStatsResponseSchema>;
export type IndexerTokenFinancialStats = z.output<typeof IndexerTokenFinancialStatsSchema>;
export type IndexerGamesResponse = z.output<typeof IndexerGamesResponseSchema>;
export type IndexerPlayerGamesResponse = z.output<typeof IndexerPlayerGamesResponseSchema>;
export type IndexerActiveGame = z.output<typeof IndexerActiveGameSchema>;
export type IndexerActiveGamesResponse = z.output<typeof IndexerActiveGamesResponseSchema>;
export type IndexerPlayerProfile = z.output<typeof IndexerPlayerProfileSchema>;
export type IndexerTokenSummary = z.output<typeof IndexerTokenSummarySchema>;
export type IndexerTokensResponse = z.output<typeof IndexerTokensResponseSchema>;
export type IndexerLeaderboardPlayer = z.output<typeof IndexerLeaderboardPlayerSchema>;
export type IndexerLeaderboardResponse = z.output<typeof IndexerLeaderboardResponseSchema>;
export type HistoricalBackfillState = z.output<typeof HistoricalBackfillStateSchema>;
export type HistoricalGameEventPage = z.output<typeof HistoricalGameEventPageSchema>;
//# sourceMappingURL=index.d.ts.map