import { describe, expect, test } from "bun:test";
import { z } from "zod";
import {
  Base64TransactionSchema,
  ApiErrorSchema,
  ProtocolHttpError,
  ProtocolResponseError,
  SimpleApiErrorSchema,
  SolanaAddressSchema,
  SolanaSignatureSchema,
  U64StringSchema,
  createRestClient,
  defineEndpoint,
  expectStatus,
} from "../src/common/index.js";
import {
  CreationPolicyRejectionSchema,
  GenerateHashRequestSchema,
  GenerateHashResponseSchema,
  SignGameTransactionRequestSchema,
  TokenPoliciesResponseSchema,
  TokenPolicySchema,
  oracleContract,
} from "../src/oracle/index.js";
import {
  GameByKeyQuerySchema,
  HistoricalGameEventPageSchema,
  IndexerGamesResponseSchema,
  IndexerStatsResponseSchema,
  LatestGamesQuerySchema,
  indexerContract,
} from "../src/indexer/index.js";
import {
  CreateGameRequestSchema,
  GameAddressParamsSchema,
  PrepareGameResponseSchema,
  VerifyGameParamsSchema,
  webContract,
} from "../src/web/index.js";

const ADDRESS = "32Jr4JnXWvqq9GqPQynkooHsszaucUUvZfNLh2hdX2L5";
const OTHER_ADDRESS = "11111111111111111111111111111111";
const SIGNATURE = "1".repeat(64);
const NONZERO_SIGNATURE =
  "2tPC5XVkNxEfErA7gF5Z1Pz9GWubEGEg7QtNCnBx6WHPzfQ5y3Pxz1E8ppK88topdba7h1FAp4CLUyeLfsqFVY9a";
const SERVICE = {
  timestamp: "2026-08-25T12:00:00.000Z",
  service: {
    name: "oracle-api",
    version: "1.0.0",
    environment: "test",
    uptime: 1,
  },
};

describe("Oracle contract", () => {
  test("declares auth and rate-limit responses for every protected endpoint", () => {
    for (const endpoint of Object.values(oracleContract)) {
      if (!endpoint.authenticated) continue;
      expect(endpoint.responses[401]).toBe(ApiErrorSchema);
      expect(endpoint.responses[429]).toBe(ApiErrorSchema);
    }
  });

  test("declares internal signing failures as shaped API errors", () => {
    expect(oracleContract.signGameTransaction.responses[500]).toBe(
      ApiErrorSchema,
    );
  });

  test("declares a protected token-policy endpoint", () => {
    expect(oracleContract.tokenPolicies.method).toBe("GET");
    expect(oracleContract.tokenPolicies.path).toBe("/token-policies");
    expect(oracleContract.tokenPolicies.authenticated).toBe(true);
    expect(oracleContract.tokenPolicies.responses[200]).toBe(
      TokenPoliciesResponseSchema,
    );
  });

  test("keeps generic signing errors and declares typed policy rejections", () => {
    expect(oracleContract.signGameTransaction.responses[400]).toBe(
      ApiErrorSchema,
    );
    expect(oracleContract.signGameTransaction.responses[422]).toBe(
      CreationPolicyRejectionSchema,
    );
    expect(oracleContract.signGameTransaction.responses[503]).toBe(
      ApiErrorSchema,
    );
  });
});

describe("common wire values", () => {
  test("accepts addresses that decode to exactly 32 bytes", () => {
    expect(String(SolanaAddressSchema.parse(ADDRESS))).toBe(ADDRESS);
    expect(String(SolanaAddressSchema.parse(OTHER_ADDRESS))).toBe(
      OTHER_ADDRESS,
    );
    expect(() => SolanaAddressSchema.parse("not a public key")).toThrow();
    expect(() => SolanaAddressSchema.parse("z".repeat(44))).toThrow();
    expect(() => SolanaAddressSchema.parse("2".repeat(32))).toThrow();
    expect(() => SolanaAddressSchema.parse("z".repeat(100_000))).toThrow();
  });

  test("accepts signatures that decode to exactly 64 bytes", () => {
    expect(String(SolanaSignatureSchema.parse(SIGNATURE))).toBe(SIGNATURE);
    expect(String(SolanaSignatureSchema.parse(NONZERO_SIGNATURE))).toBe(
      NONZERO_SIGNATURE,
    );
    expect(() => SolanaSignatureSchema.parse("2".repeat(64))).toThrow();
    expect(() => SolanaSignatureSchema.parse("z".repeat(128))).toThrow();
    expect(() => SolanaSignatureSchema.parse("0".repeat(64))).toThrow();
    expect(() => SolanaSignatureSchema.parse("z".repeat(100_000))).toThrow();
  });

  test("bounds u64 decimal strings", () => {
    expect(String(U64StringSchema.parse("0"))).toBe("0");
    expect(String(U64StringSchema.parse("1"))).toBe("1");
    expect(String(U64StringSchema.parse("18446744073709551615"))).toBe(
      "18446744073709551615",
    );
    expect(() => U64StringSchema.parse("18446744073709551616")).toThrow();
    expect(() => U64StringSchema.parse("9".repeat(100_000))).toThrow();
    expect(() => U64StringSchema.parse("not-a-number")).toThrow();
    expect(() => U64StringSchema.parse("01")).toThrow();
  });

  test("accepts base64 and rejects arbitrary transaction text", () => {
    expect(String(Base64TransactionSchema.parse("AQIDBA=="))).toBe("AQIDBA==");
    expect(() => Base64TransactionSchema.parse("***")).toThrow();
  });
});

describe("typed REST client", () => {
  const contract = {
    update: defineEndpoint({
      method: "POST",
      path: "/games/:gameId",
      authenticated: true,
      params: z.strictObject({ gameId: z.string().min(1) }),
      query: z.strictObject({ fresh: z.boolean() }),
      body: z.strictObject({ amount: z.number().int().positive() }),
      responses: {
        200: z.object({ success: z.literal(true), amount: z.number() }),
        400: z.object({ error: z.string() }),
      },
    }),
  } as const;

  test("builds and validates requests and responses from one contract", async () => {
    const requests: Request[] = [];
    const client = createRestClient(contract, {
      baseUrl: "https://service.test/root/",
      headers: { "X-Client": "protocol-test" },
      getHeaders: (endpoint) =>
        endpoint.authenticated
          ? { Authorization: "Bearer synthetic-token" }
          : {},
      fetch: async (input, init) => {
        requests.push(new Request(input, init));
        return Response.json({ success: true, amount: 7 });
      },
    });

    const result = await client.update({
      params: { gameId: "game / one" },
      query: { fresh: true },
      body: { amount: 7 },
      request: { cache: "no-store" },
    });
    const success = expectStatus(result, 200);

    expect(success.data.amount).toBe(7);
    expect(requests).toHaveLength(1);
    expect(requests[0]?.url).toBe(
      "https://service.test/root/games/game%20%2F%20one?fresh=true",
    );
    expect(requests[0]?.method).toBe("POST");
    expect(requests[0]?.headers.get("authorization")).toBe(
      "Bearer synthetic-token",
    );
    expect(requests[0]?.headers.get("x-client")).toBe("protocol-test");
    expect(await requests[0]?.json()).toEqual({ amount: 7 });
  });

  test("rejects invalid input before making a request", async () => {
    let called = false;
    const client = createRestClient(contract, {
      baseUrl: "https://service.test",
      fetch: async () => {
        called = true;
        return Response.json({ success: true, amount: 1 });
      },
    });

    await expect(
      client.update({
        params: { gameId: "game" },
        query: { fresh: true },
        body: { amount: 0 },
      }),
    ).rejects.toThrow();
    expect(called).toBe(false);
  });

  test("returns typed declared errors and can require a success status", async () => {
    const client = createRestClient(contract, {
      baseUrl: "https://service.test",
      fetch: async () =>
        Response.json({ error: "invalid amount" }, { status: 400 }),
    });
    const result = await client.update({
      params: { gameId: "game" },
      query: { fresh: false },
      body: { amount: 1 },
    });

    expect(result.status).toBe(400);
    if (result.status === 400) expect(result.data.error).toBe("invalid amount");
    expect(() => expectStatus(result, 200)).toThrow(ProtocolHttpError);
  });

  test("rejects undeclared statuses and malformed declared responses", async () => {
    const unexpected = createRestClient(contract, {
      baseUrl: "https://service.test",
      fetch: async () => Response.json({ error: "busy" }, { status: 503 }),
    });
    await expect(
      unexpected.update({
        params: { gameId: "game" },
        query: { fresh: false },
        body: { amount: 1 },
      }),
    ).rejects.toBeInstanceOf(ProtocolHttpError);

    const malformed = createRestClient(contract, {
      baseUrl: "https://service.test",
      fetch: async () => Response.json({ success: true, amount: "seven" }),
    });
    await expect(
      malformed.update({
        params: { gameId: "game" },
        query: { fresh: false },
        body: { amount: 1 },
      }),
    ).rejects.toBeInstanceOf(ProtocolResponseError);
  });
});

describe("oracle contracts", () => {
  test("validates versioned token policies", () => {
    const policy = TokenPolicySchema.parse({
      mint: ADDRESS,
      enabled: true,
      minimumAmountRaw: "1000000",
      acceptedMinimumAmountRaw: "950000",
      revision: 7,
      effectiveAt: "2026-09-02T12:00:00.000Z",
    });

    expect(policy.revision).toBe(7);
    expect(String(policy.minimumAmountRaw)).toBe("1000000");
    expect(String(policy.acceptedMinimumAmountRaw)).toBe("950000");
    expect(
      TokenPoliciesResponseSchema.parse({
        ...SERVICE,
        success: true,
        policies: [policy],
      }).policies,
    ).toHaveLength(1);

    expect(() =>
      TokenPolicySchema.parse({
        mint: ADDRESS,
        enabled: true,
        minimumAmountRaw: "18446744073709551616",
        acceptedMinimumAmountRaw: "950000",
        revision: 7,
        effectiveAt: "2026-09-02T12:00:00.000Z",
      }),
    ).toThrow();
    expect(() =>
      TokenPolicySchema.parse({
        mint: ADDRESS,
        enabled: true,
        minimumAmountRaw: "1",
        acceptedMinimumAmountRaw: "1",
        revision: -1,
        effectiveAt: "not-a-timestamp",
      }),
    ).toThrow();
    expect(() =>
      TokenPolicySchema.parse({
        mint: ADDRESS,
        enabled: true,
        minimumAmountRaw: "1000000",
        acceptedMinimumAmountRaw: "1000001",
        revision: 7,
        effectiveAt: "2026-09-02T12:00:00.000Z",
      }),
    ).toThrow("accepted minimum must not exceed");
  });

  test("validates every creation-policy rejection code", () => {
    for (const code of [
      "unsupported_mint",
      "token_disabled",
      "amount_below_minimum",
      "policy_unavailable",
    ] as const) {
      expect(
        CreationPolicyRejectionSchema.parse({
          ...SERVICE,
          success: false,
          error: "Creation policy rejected the transaction",
          code,
          mint: ADDRESS,
          minimumAmountRaw: "1000000",
          acceptedMinimumAmountRaw: "950000",
          revision: 7,
        }).code,
      ).toBe(code);
    }

    expect(() =>
      CreationPolicyRejectionSchema.parse({
        ...SERVICE,
        success: false,
        error: "Creation policy rejected the transaction",
        code: "unknown_policy_error",
      }),
    ).toThrow();
  });

  test("normalizes supported and future game type labels", () => {
    expect(
      GenerateHashRequestSchema.parse({ gameType: "  Giveaway  " }).gameType,
    ).toBe("giveaway");
    expect(
      GenerateHashRequestSchema.parse({ gameType: "future-game" }).gameType,
    ).toBe("future-game");
    expect(() =>
      GenerateHashRequestSchema.parse({ gameType: "x".repeat(129) }),
    ).toThrow();
  });

  test("parses a generated commitment response", () => {
    const result = GenerateHashResponseSchema.parse({
      ...SERVICE,
      success: true,
      randomHash: "ab".repeat(32),
      gameAddress: ADDRESS,
      oracleOperator: OTHER_ADDRESS,
    });

    expect(String(result.oracleOperator)).toBe(OTHER_ADDRESS);
  });

  test("rejects extra signing request fields", () => {
    expect(() =>
      SignGameTransactionRequestSchema.parse({
        txBase64: "AQIDBA==",
        secret: "leak",
      }),
    ).toThrow();
  });
});

describe("indexer contracts", () => {
  test("preserves operator game closure audit fields in backfill pages", () => {
    const page = HistoricalGameEventPageSchema.parse({
      initialized: [],
      completed: [],
      closed: [],
      operatorClosed: [
        {
          signature: NONZERO_SIGNATURE,
          gameKey: ADDRESS,
          creator: OTHER_ADDRESS,
          operator: ADDRESS,
          refundedAmount: "9007199254740993",
          recoveredLamports: 2,
          timestamp: 3,
          slot: 4,
        },
      ],
      membership: [],
      nextBefore: null,
      oldestSlot: 4,
      transactions: 1,
      complete: true,
    });

    expect(page.operatorClosed[0]?.recoveredLamports).toBe(2);
    expect(String(page.operatorClosed[0]?.refundedAmount)).toBe(
      "9007199254740993",
    );
    expect(() =>
      HistoricalGameEventPageSchema.parse({
        ...page,
        operatorClosed: [
          { ...page.operatorClosed[0]!, refundedAmount: 9_007_199_254_740_992 },
        ],
      }),
    ).toThrow();
  });

  test("protects state-changing indexing and declares implementation statuses", () => {
    expect(indexerContract.triggerIndex.authenticated).toBe(true);
    expect(indexerContract.triggerIndex.responses[401]).toBe(
      SimpleApiErrorSchema,
    );
    expect(indexerContract.latestGames.responses[400]).toBe(
      SimpleApiErrorSchema,
    );
    expect(indexerContract.gameByKey.responses[500]).toBe(SimpleApiErrorSchema);
    expect(indexerContract.playerActiveGames.responses[500]).toBe(
      SimpleApiErrorSchema,
    );
    expect(indexerContract.commitBackfill.responses[500]).toBe(
      SimpleApiErrorSchema,
    );
  });

  test("parses current game and stats responses", () => {
    expect(
      IndexerGamesResponseSchema.parse({
        games: [
          {
            signature: SIGNATURE,
            gameKey: ADDRESS,
            winner: OTHER_ADDRESS,
            winnerAmount: 20,
            feeAmount: 1,
            ticketsCount: 2,
            tokenMint: OTHER_ADDRESS,
            timestamp: 1,
            slot: 2,
          },
        ],
        total: 1,
        page: 1,
        limit: 50,
      }).total,
    ).toBe(1);

    expect(
      IndexerStatsResponseSchema.parse({
        totalGames: 0,
        uniquePlayers: 0,
        financials: [],
        lastUpdated: 0,
      }).financials,
    ).toEqual([]);
  });

  test("normalizes and bounds route queries", () => {
    expect(LatestGamesQuerySchema.parse({ limit: "10" }).limit).toBe(10);
    expect(LatestGamesQuerySchema.parse({ limit: "100" }).limit).toBe(100);
    expect(() => LatestGamesQuerySchema.parse({ limit: "101" })).toThrow();
    expect(
      String(GameByKeyQuerySchema.parse({ gameKey: ADDRESS }).gameKey),
    ).toBe(ADDRESS);
  });
});

describe("web contracts", () => {
  test("declares sanitized client and dependency failures", () => {
    expect(webContract.verifyGame.responses[403]).toBe(SimpleApiErrorSchema);
    expect(webContract.game.responses[503]).toBe(SimpleApiErrorSchema);
    expect(webContract.verifyGame.responses[503]).toBe(SimpleApiErrorSchema);
    expect(webContract.cachedVerifyGame.responses[503]).toBe(
      SimpleApiErrorSchema,
    );
  });

  test("accepts positive u64 amounts and rejects zero", () => {
    const request = {
      creator: ADDRESS,
      tokenMint: OTHER_ADDRESS,
      type: "coinflip" as const,
      minPlayers: 2,
      maxPlayers: 2,
      timeoutSeconds: 60,
    };

    expect(
      String(CreateGameRequestSchema.parse({ ...request, amount: "1" }).amount),
    ).toBe("1");
    expect(() =>
      CreateGameRequestSchema.parse({ ...request, amount: "0" }),
    ).toThrow();
  });

  test("enforces game-specific player limits", () => {
    expect(() =>
      CreateGameRequestSchema.parse({
        creator: ADDRESS,
        tokenMint: OTHER_ADDRESS,
        type: "coinflip",
        amount: "1",
        minPlayers: 1,
        maxPlayers: 2,
        timeoutSeconds: 60,
      }),
    ).toThrow();
  });

  test("parses a prepared transaction response", () => {
    expect(
      String(
        PrepareGameResponseSchema.parse({
          txBase64: "AQIDBA==",
          gameAddress: ADDRESS,
          lastValidBlockHeight: 1,
        }).gameAddress,
      ),
    ).toBe(ADDRESS);
  });

  test("validates dynamic route parameters", () => {
    expect(
      String(GameAddressParamsSchema.parse({ address: ADDRESS }).address),
    ).toBe(ADDRESS);
    expect(
      String(VerifyGameParamsSchema.parse({ signature: SIGNATURE }).signature),
    ).toBe(SIGNATURE);
  });
});
