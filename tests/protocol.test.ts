import { describe, expect, test } from "bun:test";
import { z } from "zod";
import {
  Base64TransactionSchema,
  ApiErrorSchema,
  ProtocolHttpError,
  ProtocolResponseError,
  SolanaAddressSchema,
  U64StringSchema,
  createRestClient,
  defineEndpoint,
  expectStatus,
} from "../src/common/index.js";
import {
  GenerateHashRequestSchema,
  GenerateHashResponseSchema,
  SignGameTransactionRequestSchema,
  oracleContract,
} from "../src/oracle/index.js";
import {
  GameByKeyQuerySchema,
  IndexerGamesResponseSchema,
  IndexerStatsResponseSchema,
  LatestGamesQuerySchema,
} from "../src/indexer/index.js";
import {
  CreateGameRequestSchema,
  GameAddressParamsSchema,
  PrepareGameResponseSchema,
  VerifyGameParamsSchema,
} from "../src/web/index.js";

const ADDRESS = "32Jr4JnXWvqq9GqPQynkooHsszaucUUvZfNLh2hdX2L5";
const OTHER_ADDRESS = "11111111111111111111111111111111";
const SIGNATURE = "1".repeat(64);
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
});

describe("common wire values", () => {
  test("accepts lexical Solana addresses and rejects invalid strings", () => {
    expect(String(SolanaAddressSchema.parse(ADDRESS))).toBe(ADDRESS);
    expect(() => SolanaAddressSchema.parse("not a public key")).toThrow();
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
