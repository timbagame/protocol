// Builds tests/fixtures/http.json: every zod schema of the HTTP contracts, run with zod on a
// valid sample and on mutations of it, so the Rust `http` schemas can be checked against
// the exact same accept/reject decisions, outputs and first issue paths.
import { getBase58Decoder } from "@solana/kit";
import * as z from "zod";
import * as bot from "../src/bot/index.ts";
import * as common from "../src/common/index.ts";
import * as indexer from "../src/indexer/index.ts";
import * as oracle from "../src/oracle/index.ts";
import * as web from "../src/web/index.ts";

const modules = { common, oracle, indexer, web, bot } as const;
const base58 = (byte: number, length: number) =>
  getBase58Decoder().decode(new Uint8Array(length).fill(byte));
const A = base58(7, 32);
const B = base58(9, 32);
const SIG = base58(7, 64);
const TX = "AQID";
const HEX = "ab".repeat(32);
const TIME = "2026-10-16T23:35:05.123Z";
const SERVICE = {
  name: "oracle",
  version: "1.0.0",
  environment: "test",
  uptime: 12.5,
};
const ENVELOPE = { timestamp: TIME, service: SERVICE };

const indexerGame = {
  signature: SIG,
  gameKey: A,
  status: "active",
  creator: B,
  gameType: "giveaway",
  ticketAmount: 1.5,
  totalAmount: 15,
  maxTickets: 10,
  minTickets: 1,
  isPrivate: false,
  createdAt: 1_700_000_000,
  timeout: 3600,
  expiresAt: 1_700_003_600,
  winner: null,
  winnerAmount: null,
  feeAmount: null,
  ticketsCount: 3,
  tokenMint: B,
  timestamp: 1_700_000_100,
  slot: 123,
  priceUsd: 0.25,
  isCreator: true,
  isPlayer: false,
  isJoined: false,
};
const financials = {
  tokenMint: A,
  totalVolume: 100,
  totalFees: 2.5,
  priceUsd: null,
  biggestWin: { amount: 40, winner: B, signature: SIG },
};
const activeGame = {
  game_key: A,
  creator: B,
  ticket_amount: 1,
  total_amount: 10,
  max_tickets: 10,
  min_tickets: 2,
  current_tickets: 3,
  token_mint: B,
  is_private: 0,
  created_at: 1_700_000_000,
  timeout: 3600,
  signature: SIG,
  slot: 99,
  indexed_at: 1_700_000_010,
  expiresAt: 1_700_003_600,
  timeLeft: 120,
  isPrivate: false,
  game_type: "coinflip",
  priceUsd: 1.5,
};
const backfillState = {
  beforeSignature: SIG,
  pages: 2,
  transactions: 40,
  initializedEvents: 5,
  closedEvents: 1,
  complete: false,
};
const page = {
  initialized: [
    {
      signature: SIG,
      gameKey: A,
      creator: B,
      gameType: "coinflip",
      ticketAmount: 1,
      totalAmount: 2,
      maxTickets: 2,
      minTickets: 2,
      tokenMint: B,
      isPrivate: false,
      createdAt: 1_700_000_000,
      timeout: 60,
      slot: 7,
    },
  ],
  completed: [
    {
      signature: SIG,
      gameKey: A,
      winner: B,
      winnerAmount: 1.9,
      feeAmount: 0.1,
      ticketsCount: 2,
      timestamp: 1_700_000_100,
      slot: 8,
    },
  ],
  closed: [{ signature: SIG, gameKey: A, timestamp: 1_700_000_200, slot: 9 }],
  operatorClosed: [
    {
      signature: SIG,
      gameKey: A,
      timestamp: 1_700_000_300,
      slot: 10,
      creator: B,
      operator: A,
      refundedAmount: "18446744073709551615",
      recoveredLamports: 2_039_280,
    },
  ],
  membership: [
    {
      kind: "joined",
      signature: SIG,
      gameKey: A,
      player: B,
      ticketsCount: 1,
      ticketIndex: 0,
      timestamp: 1_700_000_050,
      slot: 7,
    },
  ],
  nextBefore: null,
  oldestSlot: 7,
  transactions: 100,
  complete: true,
};
const verifiedGame = {
  gameKey: A,
  signature: SIG,
  timestamp: 1_700_000_100,
  gameType: "coinflip",
  creator: B,
  isPrivate: false,
  ticketAmount: 1,
  totalAmount: 2,
  maxTickets: 2,
  createdAt: 1_700_000_000,
  participants: [
    { address: A, ticketCount: 1, ticketIndices: [0] },
    { address: B, ticketCount: 1, ticketIndices: [1] },
  ],
  totalTickets: 2,
  winner: B,
  winnerTicketIndex: 1,
  prizeAmount: 1.9,
  feeAmount: 0.1,
  tokenMint: A,
  tokenSymbol: "SOL",
  tokenDecimals: 9,
  randomValue: "18446744073709551615",
  secretKey: HEX,
  randomHash: HEX.toUpperCase(),
  transactionSignatures: [SIG],
  lastSlot: "42",
  calculationBreakdown: {
    randomValue: "18446744073709551615",
    totalTickets: 2,
    winnerIndex: 1,
    formula: "randomValue % totalTickets",
  },
  explorerUrl: `https://solscan.io/tx/${SIG}`,
};
const tokenPolicy = {
  mint: A,
  enabled: true,
  minimumAmountRaw: "1000",
  acceptedMinimumAmountRaw: "500",
  revision: 3,
  effectiveAt: "2026-10-16T00:00:00Z",
};

/** One or more valid inputs per schema, by TypeScript export name or contract path. */
const SAMPLES: Record<string, unknown[]> = {
  ApiErrorSchema: [{ ...ENVELOPE, success: false, error: "Boom" }],
  Base64TransactionSchema: [TX],
  Hex32Schema: [HEX],
  NonNegativeIntegerSchema: [0],
  NullablePriceUsdSchema: [null, 2.5],
  PositiveIntegerSchema: [1],
  ServiceEnvelopeSchema: [ENVELOPE],
  ServiceMetadataSchema: [SERVICE],
  SimpleApiErrorSchema: [{ error: "Not found" }],
  SlotSchema: [5],
  SolanaAddressSchema: [A],
  SolanaSignatureSchema: [SIG],
  U64StringSchema: ["18446744073709551615"],
  UnixTimestampSchema: [1_700_000_000],
  CompleteGameNowRequestSchema: [{ gameAddress: A }],
  CompleteGameNowResponseSchema: [
    { ...ENVELOPE, success: true, gameAddress: A, status: "in-flight" },
    { ...ENVELOPE, success: true, gameAddress: A, status: "not-ready" },
    {
      ...ENVELOPE,
      success: true,
      gameAddress: A,
      status: "completed",
      txHash: SIG,
      winnerAddress: B,
      totalPot: 2.5,
    },
  ],
  CreationPolicyRejectionCodeSchema: ["policy_unavailable"],
  CreationPolicyRejectionSchema: [
    {
      ...ENVELOPE,
      success: false,
      error: "Too small",
      code: "amount_below_minimum",
      mint: A,
      minimumAmountRaw: "1000",
      acceptedMinimumAmountRaw: "500",
      revision: 3,
    },
  ],
  GenerateHashRequestSchema: [{}, { gameType: "  CoinFlip " }],
  GenerateHashResponseSchema: [
    {
      ...ENVELOPE,
      success: true,
      randomHash: HEX,
      gameAddress: A,
      oracleOperator: B,
    },
  ],
  OracleHealthResponseSchema: [
    { ...ENVELOPE, success: true, status: "healthy" },
  ],
  OracleStatsSchema: [
    {
      totalSecrets: 10,
      usedSecrets: 4,
      pendingGames: 1,
      completedGames: 2,
      cancelledGames: 1,
      eventListening: true,
      activeListeners: 1,
    },
  ],
  OracleStatsResponseSchema: [
    {
      ...ENVELOPE,
      success: true,
      stats: {
        totalSecrets: 10,
        usedSecrets: 4,
        pendingGames: 1,
        completedGames: 2,
        cancelledGames: 1,
        eventListening: false,
        activeListeners: 0,
      },
    },
  ],
  SignGameTransactionRequestSchema: [{ txBase64: TX }],
  SignGameTransactionResponseSchema: [
    { ...ENVELOPE, success: true, txBase64: TX },
  ],
  TokenPoliciesResponseSchema: [
    { ...ENVELOPE, success: true, policies: [tokenPolicy] },
  ],
  TokenPolicySchema: [
    tokenPolicy,
    { ...tokenPolicy, acceptedMinimumAmountRaw: "1000" },
    { ...tokenPolicy, acceptedMinimumAmountRaw: "1001" },
  ],
  "TokenPolicySchema.effectiveAt": [TIME],
  "GenerateHashRequestSchema.gameType": ["coinflip"],
  "VerifiedGameSchema.explorerUrl": ["https://timba.cc/verify"],
  BackfillCommitRequestSchema: [{ expectedBefore: SIG, page }],
  BackfillConflictResponseSchema: [{ error: "Stale", state: backfillState }],
  BackfillRetryableErrorSchema: [
    {
      success: false,
      retryable: true,
      reason: "rpc_rate_limited",
      error: "Slow down",
    },
  ],
  BackfillStateResponseSchema: [{ success: true, state: backfillState }],
  GameByKeyQuerySchema: [{ gameKey: A }, { gameKey: A, fresh: "" }],
  GameStatusSchema: ["cancelled"],
  GameTypeSchema: ["coinflip"],
  GamesQuerySchema: [{}, { limit: "20", offset: "40", tokenMint: A }],
  HistoricalBackfillStateSchema: [backfillState],
  HistoricalClosedEventSchema: [page.closed[0]],
  HistoricalCompletedEventSchema: [page.completed[0]],
  HistoricalGameEventPageSchema: [page],
  HistoricalInitializedEventSchema: [page.initialized[0]],
  HistoricalMembershipEventSchema: [page.membership[0]],
  HistoricalOperatorClosedEventSchema: [page.operatorClosed[0]],
  IndexerActiveGameSchema: [activeGame],
  IndexerActiveGamesResponseSchema: [{ games: [activeGame], count: 1 }],
  IndexerGameSchema: [
    indexerGame,
    {
      ...indexerGame,
      status: undefined,
      winner: B,
      winnerAmount: 9,
      feeAmount: 1,
    },
  ],
  IndexerGamesResponseSchema: [
    { games: [indexerGame], total: 1, page: 1, limit: 50 },
  ],
  IndexerHealthResponseSchema: [{ status: "ok", timestamp: 1_700_000_000_000 }],
  IndexerLeaderboardPlayerSchema: [
    { player: A, games_won: 3, total_winnings: 9.5, avg_win: null },
  ],
  IndexerLeaderboardResponseSchema: [
    {
      players: [
        { player: A, games_won: 3, total_winnings: null, avg_win: 3.25 },
      ],
      count: 1,
    },
  ],
  IndexerPlayerGamesResponseSchema: [
    { games: [indexerGame], count: 1, limit: 50, offset: 0 },
  ],
  IndexerPlayerProfileSchema: [
    {
      wallet: A,
      summary: {
        relatedGames: 5,
        createdGames: 2,
        playedGames: 3,
        activeGames: 1,
        completedGames: 3,
        cancelledGames: 1,
        wins: 2,
        losses: 1,
        lastActivity: null,
      },
      tokens: [
        {
          tokenMint: B,
          gamesPlayed: 3,
          stakedAmount: 3,
          wonAmount: 4.5,
          priceUsd: 1,
        },
      ],
      frequentPlayers: [{ player: B, gamesTogether: 2 }],
      historyComplete: true,
    },
  ],
  IndexerStatsResponseSchema: [
    {
      totalGames: 10,
      uniquePlayers: 4,
      financials: [financials],
      lastUpdated: 1_700_000_000,
    },
  ],
  IndexerTokenFinancialStatsSchema: [
    financials,
    { ...financials, biggestWin: null },
  ],
  IndexerTokenSummarySchema: [
    { tokenMint: A, games: 3, latestTimestamp: 1_700_000_000 },
  ],
  IndexerTokensResponseSchema: [
    {
      tokens: [{ tokenMint: A, games: 3, latestTimestamp: 1, priceUsd: null }],
    },
  ],
  IndexerTriggerErrorSchema: [{ success: false, error: "RPC down" }],
  IndexerTriggerResponseSchema: [
    { success: true, indexed: 4, total: 10, message: "Indexed" },
  ],
  LatestGamesQuerySchema: [
    {},
    { limit: "5", tokenMint: A, gameType: "giveaway", includeLifecycle: "1" },
  ],
  PaginationQuerySchema: [{}, { limit: "100", offset: "0" }],
  PlayerQuerySchema: [{ player: A }],
  "indexerContract.stats.query": [{}, { tokenMint: A }],
  "indexerContract.playerActiveGames.query": [{ player: A }],
  "indexerContract.playerProfile.query": [{ player: B }],
  "indexerContract.leaderboard.query": [{}, { limit: "1", tokenMint: A }],
  "indexerContract.latestGames.responses.200": [[indexerGame]],
  CreateGameRequestSchema: [
    {
      creator: A,
      tokenMint: B,
      type: "giveaway",
      amount: "1000",
      minPlayers: 1,
      maxPlayers: 10,
      timeoutSeconds: 3600,
    },
    {
      creator: A,
      tokenMint: B,
      type: "coinflip",
      amount: "1",
      minPlayers: 2,
      maxPlayers: 2,
      timeoutSeconds: 60,
    },
    // Rejected by the refinements: a zero amount, one coinflip player, max below min.
    ...[
      { amount: "0" },
      { minPlayers: 1, maxPlayers: 1 },
      { minPlayers: 3, maxPlayers: 2 },
    ].map((change) => ({
      creator: A,
      tokenMint: B,
      type: "coinflip",
      amount: "1",
      minPlayers: 2,
      maxPlayers: 2,
      timeoutSeconds: 60,
      ...change,
    })),
  ],
  FinalizedVerifiedGameSchema: [verifiedGame],
  GameAddressParamsSchema: [{ address: A }],
  GameConfigResponseSchema: [
    {
      tokens: [
        {
          mint: A,
          symbol: "SOL",
          decimals: 9,
          minimumAmount: "0.001",
          minimumAmountRaw: "1000000",
          enabled: true,
          priceUsd: 150.25,
        },
      ],
    },
  ],
  GameTokenConfigSchema: [
    {
      mint: A,
      symbol: "USDC",
      decimals: 6,
      minimumAmount: "1",
      minimumAmountRaw: "1000000",
      enabled: false,
    },
  ],
  PrepareGameResponseSchema: [
    { txBase64: TX, gameAddress: A, lastValidBlockHeight: 100 },
  ],
  SerializedGameSchema: [
    {
      address: A,
      creator: B,
      type: "giveaway",
      tokenMint: A,
      stakeAmount: "0",
      prizeAmount: "1000",
      currentPlayers: 1,
      minPlayers: 1,
      maxPlayers: 10,
      isPrivate: false,
      createdAt: 1_700_000_000,
      expiresAt: 1_700_003_600,
      lastSlot: "42",
      participantAddresses: [B],
    },
  ],
  SubmitGameRequestSchema: [{ txBase64: TX }],
  SubmitGameResponseSchema: [{ signature: SIG }],
  VerifiedGameSchema: [
    verifiedGame,
    Object.fromEntries(
      Object.entries(verifiedGame).filter(
        ([key]) =>
          ![
            "secretKey",
            "randomHash",
            "transactionSignatures",
            "lastSlot",
            "gameType",
          ].includes(key),
      ),
    ),
  ],
  VerifyGameParamsSchema: [{ signature: SIG }],
  VerifyGameRequestSchema: [{ signature: SIG }],
  "webContract.game.query": [{}, { fresh: "0" }],
  BotHealthResponseSchema: [{ status: "ok" }],
  CompletedGameNotificationResponseSchema: [{ success: true }],
  CompletedGameNotificationSchema: [
    { gameAddress: A, winnerAddress: B, winnerTxSignature: SIG, totalPot: 0 },
  ],
};

/** Values every primitive schema is also run on, beyond its samples and their mutations. */
const EDGES: unknown[] = [
  null,
  true,
  0,
  -0,
  1,
  -1,
  1.5,
  2 ** 53 - 1,
  2 ** 53,
  1e300,
  "",
  " ",
  "0",
  "01",
  "1",
  "18446744073709551615",
  "18446744073709551616",
  A,
  A.slice(1),
  `${A}1`,
  "1".repeat(32),
  "1".repeat(44),
  SIG,
  SIG.slice(1),
  "0".repeat(32),
  HEX,
  HEX.toUpperCase(),
  `${HEX}a`,
  "AQID",
  "AQI=",
  "AQ==",
  "AQ=",
  "A===",
  "A".repeat(4000),
  "A".repeat(4004),
  "A".repeat(16_384),
  "A".repeat(16_388),
  TIME,
  "2026-10-16T23:35:05Z",
  "2024-02-29T00:00:00Z",
  "2023-02-29T00:00:00Z",
  "1900-02-29T00:00:00Z",
  "2000-02-29T00:00:00Z",
  "2026-04-31T00:00:00Z",
  "2026-10-16T23:35:05.Z",
  "2026-10-16T23:35:05+00:00",
  "2026-10-16 23:35:05Z",
  "https://timba.cc/play?x=1#y",
  "http://localhost:3000",
  " https://timba.cc ",
  "mailto:team@timba.cc",
  "not a url",
  "https://",
  "  MiXeD  ",
  " x ",
  "a".repeat(128),
  "a".repeat(129),
  "ok",
  "healthy",
  "coinflip",
  "joined",
  "rpc_rate_limited",
  "token_disabled",
  "0x10",
  "1e1",
  "5.0",
  "-0",
  "Infinity",
  "abc",
  " 7 ",
  [],
  ["5"],
  {},
];

type Path = (string | number)[];
const MUTATIONS: Record<string, (value: unknown) => unknown> = {
  delete: () => undefined,
  null: () => null,
  emptyString: () => "",
  zero: () => 0,
  negative: () => -1,
  fraction: () => 1.5,
  true: () => true,
  emptyArray: () => [],
  emptyObject: () => ({}),
  huge: () => 1e300,
  word: () => "x",
  extraKey: (value) =>
    typeof value === "object" && value !== null && !Array.isArray(value)
      ? { ...value, extra: 1 }
      : undefined,
  duplicateItem: (value) =>
    Array.isArray(value) ? [...value, ...value] : undefined,
};

function paths(value: unknown, prefix: Path = []): Path[] {
  const out: Path[] = [prefix];
  if (Array.isArray(value)) {
    if (value.length) out.push(...paths(value[0], [...prefix, 0]));
  } else if (typeof value === "object" && value !== null) {
    for (const [key, child] of Object.entries(value))
      out.push(...paths(child, [...prefix, key]));
  }
  return out;
}

/** Applies `op` at `path`; `undefined` means the op does not apply. */
function mutate(
  value: unknown,
  path: Path,
  op: string,
): { applies: boolean; value: unknown } {
  if (!path.length) {
    if (op === "delete") return { applies: false, value };
    const next = MUTATIONS[op]!(value);
    return { applies: next !== undefined, value: next };
  }
  const copy = structuredClone(value) as Record<string | number, unknown>;
  let parent = copy;
  for (const key of path.slice(0, -1))
    parent = parent[key] as Record<string | number, unknown>;
  const last = path[path.length - 1]!;
  if (op === "delete") {
    if (Array.isArray(parent)) return { applies: false, value };
    delete parent[last];
    return { applies: true, value: copy };
  }
  const next = MUTATIONS[op]!(parent[last]);
  if (next === undefined) return { applies: false, value };
  parent[last] = next;
  return { applies: true, value: copy };
}

/** `1` when zod accepts the input unchanged, `{ output }` when it changes it, else the first issue path. */
function run(schema: z.ZodType, input: unknown) {
  const result = schema.safeParse(input);
  if (!result.success) return result.error.issues[0]!.path.join(".");
  const output = JSON.parse(JSON.stringify(result.data));
  return JSON.stringify(output) === JSON.stringify(input) ? 1 : { output };
}

/** Long single-character strings as `{ $repeat: [character, length] }`, to keep the file small. */
function compact(value: unknown) {
  return typeof value === "string" &&
    value.length > 64 &&
    new Set(value).size === 1
    ? { $repeat: [value[0], value.length] }
    : value;
}

/** Primitives only used inside objects, so they also run on EDGES. */
const FIELDS: Record<string, z.ZodType> = {
  "TokenPolicySchema.effectiveAt": oracle.TokenPolicySchema.shape.effectiveAt,
  "GenerateHashRequestSchema.gameType":
    oracle.GenerateHashRequestSchema.shape.gameType,
  "VerifiedGameSchema.explorerUrl": web.VerifiedGameSchema.shape.explorerUrl,
};

export function httpFixtures() {
  const names = new Map<z.ZodType, string>(
    Object.entries(FIELDS).map(([name, schema]) => [schema, name]),
  );
  for (const mod of Object.values(modules))
    for (const [name, value] of Object.entries(mod))
      if (value instanceof z.ZodType && !names.has(value))
        names.set(value, name);
  const contracts: Record<string, unknown> = {};
  for (const mod of Object.values(modules))
    for (const [contractName, contract] of Object.entries(mod)) {
      if (!contractName.endsWith("Contract")) continue;
      const endpoints: Record<string, unknown> = {};
      for (const [endpointName, endpoint] of Object.entries(
        contract as Record<string, common.AnyRestEndpoint>,
      )) {
        const name = (schema: z.ZodType, slot: string) => {
          if (!names.has(schema))
            names.set(schema, `${contractName}.${endpointName}.${slot}`);
          return names.get(schema)!;
        };
        endpoints[endpointName] = {
          method: endpoint.method,
          path: endpoint.path,
          authenticated: endpoint.authenticated,
          params: endpoint.params ? name(endpoint.params, "params") : null,
          query: endpoint.query ? name(endpoint.query, "query") : null,
          body: endpoint.body ? name(endpoint.body, "body") : null,
          responses: Object.fromEntries(
            Object.entries(endpoint.responses).map(([status, schema]) => [
              status,
              name(schema, `responses.${status}`),
            ]),
          ),
        };
      }
      contracts[contractName] = endpoints;
    }
  const schemas: Record<string, unknown> = {};
  for (const [schema, name] of names) {
    const samples = SAMPLES[name];
    if (!samples) throw new Error(`Missing Rust fixture sample for ${name}`);
    const primitive = paths(samples[0]).length === 1;
    // [sample index, mutated path ("/"-joined), mutation ("" for none), result]
    const cases: unknown[] = [];
    samples.forEach((sample, index) => {
      cases.push([index, "", "", run(schema, sample)]);
      for (const path of paths(sample))
        for (const op of Object.keys(MUTATIONS)) {
          const mutated = mutate(sample, path, op);
          if (mutated.applies)
            cases.push([index, path.join("/"), op, run(schema, mutated.value)]);
        }
    });
    // [edge value, result]
    const edges = primitive
      ? EDGES.map((value) => [compact(value), run(schema, value)])
      : [];
    schemas[name] = { samples, cases, edges };
  }
  return { contracts, schemas };
}
