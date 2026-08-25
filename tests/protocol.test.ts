import { describe, expect, test } from "bun:test";
import {
  Base64TransactionSchema,
  SolanaAddressSchema,
  U64StringSchema,
} from "../src/common/index.js";
import {
  GenerateHashResponseSchema,
  SignGameTransactionRequestSchema,
} from "../src/oracle/index.js";
import {
  IndexerGamesResponseSchema,
  IndexerStatsResponseSchema,
} from "../src/indexer/index.js";
import {
  CreateGameRequestSchema,
  PrepareGameResponseSchema,
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

describe("oracle contracts", () => {
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
});
