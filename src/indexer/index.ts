import * as z from "zod";
import {
  NonNegativeIntegerSchema,
  NullablePriceUsdSchema,
  PositiveIntegerSchema,
  SimpleApiErrorSchema,
  SlotSchema,
  SolanaAddressSchema,
  SolanaSignatureSchema,
  UnixTimestampSchema,
  defineEndpoint,
} from "../common/index.js";

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
  tokens: z.array(
    z.object({
      tokenMint: SolanaAddressSchema,
      gamesPlayed: NonNegativeIntegerSchema,
      stakedAmount: z.number().finite().nonnegative(),
      wonAmount: z.number().finite().nonnegative(),
      priceUsd: NullablePriceUsdSchema.optional(),
    }),
  ),
  frequentPlayers: z.array(
    z.object({
      player: SolanaAddressSchema,
      gamesTogether: NonNegativeIntegerSchema,
    }),
  ),
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

export const indexerContract = {
  health: defineEndpoint({
    method: "GET",
    path: "/health",
    authenticated: false,
    responses: { 200: IndexerHealthResponseSchema },
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
  activeGames: defineEndpoint({
    method: "GET",
    path: "/api/active-games",
    authenticated: false,
    responses: {
      200: IndexerActiveGamesResponseSchema,
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
} as const;

export type IndexerGame = z.output<typeof IndexerGameSchema>;
export type IndexerStatsResponse = z.output<typeof IndexerStatsResponseSchema>;
export type IndexerTokenFinancialStats = z.output<
  typeof IndexerTokenFinancialStatsSchema
>;
export type IndexerGamesResponse = z.output<typeof IndexerGamesResponseSchema>;
export type IndexerPlayerGamesResponse = z.output<
  typeof IndexerPlayerGamesResponseSchema
>;
export type IndexerActiveGame = z.output<typeof IndexerActiveGameSchema>;
export type IndexerActiveGamesResponse = z.output<
  typeof IndexerActiveGamesResponseSchema
>;
export type IndexerPlayerProfile = z.output<typeof IndexerPlayerProfileSchema>;
export type IndexerTokenSummary = z.output<typeof IndexerTokenSummarySchema>;
export type IndexerTokensResponse = z.output<
  typeof IndexerTokensResponseSchema
>;
export type IndexerLeaderboardPlayer = z.output<
  typeof IndexerLeaderboardPlayerSchema
>;
export type IndexerLeaderboardResponse = z.output<
  typeof IndexerLeaderboardResponseSchema
>;
