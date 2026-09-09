import { describe, expect, test } from "bun:test";
import {
  gameCapabilities,
  gamePath,
  gameReferenceKey,
  validateGameDraft,
  transactionProgress,
} from "../src/games/workflows.js";
import { evmMetadataSchema } from "../src/evm/http.js";
const draft = {
  type: "coinflip" as const,
  tokenMint: "token",
  amount: ".5",
  minPlayers: 2,
  maxPlayers: 10,
  timeoutMinutes: 60,
};
describe("shared game workflows", () => {
  test("exact amounts and chain capability boundaries", () => {
    for (const chain of ["solana", "evm"] as const) {
      expect(
        validateGameDraft(
          draft,
          { decimals: 6, minimumAmount: "0.25" },
          gameCapabilities(chain),
        ),
      ).toBe(500000n);
      for (const change of [
        { maxPlayers: 101 },
        { timeoutMinutes: 1441 },
        { minPlayers: 11 },
        { amount: ".0000001" },
      ])
        expect(() =>
          validateGameDraft(
            { ...draft, ...change },
            { decimals: 6, minimumAmount: "0.25" },
            gameCapabilities(chain),
          ),
        ).toThrow();
    }
    expect(() =>
      validateGameDraft(
        { ...draft, isPrivate: true },
        { decimals: 6, minimumAmount: "0.25" },
        gameCapabilities("solana"),
      ),
    ).toThrow();
  });
  test("same game identifier on another deployment never shares identity", () => {
    const a = {
      chain: "evm" as const,
      chainId: 1n,
      deployment: "0xABC",
      gameId: "0xDEF",
    };
    expect(gameReferenceKey(a)).not.toBe(
      gameReferenceKey({ ...a, chainId: 2n }),
    );
    expect(gameReferenceKey(a)).toBe(
      gameReferenceKey({ ...a, deployment: "0xabc", gameId: "0xdef" }),
    );
    expect(gamePath(a)).toContain("chainId=1&deployment=0xABC");
  });
  test("unconfirmed failure is still pending", () => {
    expect(transactionProgress({ success: false, confirmations: 1 }, 2)).toBe(
      "submitted",
    );
    expect(transactionProgress({ success: false, confirmations: 2 }, 2)).toBe(
      "failed",
    );
    expect(transactionProgress(null, 2)).toBe("submitted");
  });
  test("ambiguous token symbols are rejected", () => {
    const token = {
      address: `0x${"11".repeat(20)}`,
      symbol: "TEST",
      decimals: 18,
      minimumAmount: "1",
    };
    expect(
      evmMetadataSchema.safeParse({
        chainId: 1,
        address: token.address,
        version: "0.1.0",
        tokens: [
          token,
          { ...token, address: `0x${"22".repeat(20)}`, symbol: "test" },
        ],
      }).success,
    ).toBe(false);
  });
});

test("EVM recovery permissions match caller, game type and boundary", async () => {
  const { evmGameActions } = await import("../src/evm/actions.js");
  const game = {
    creator: "creator",
    token: "token",
    gameType: 0,
    status: 1,
    isPrivate: false,
    minPlayers: 2,
    maxPlayers: 2,
    expiresAt: 100n,
    ticketAmount: 1n,
    totalAmount: 2n,
    commitment: "0x",
    lastEntryBlock: 1n,
    participants: ["creator", "player"],
  };
  expect(evmGameActions(game, "player", 109n, 10n).refund).toBe(false);
  expect(evmGameActions(game, "player", 110n, 10n).refund).toBe(true);
  expect(evmGameActions(game, "stranger", 110n, 10n).refund).toBe(false);
  expect(evmGameActions(game, "creator", 110n, 10n).close).toBe(false);
  expect(
    evmGameActions({ ...game, gameType: 1 }, "creator", 110n, 10n).close,
  ).toBe(true);
  expect(
    evmGameActions({ ...game, participants: [] }, "creator", 1n, 10n).close,
  ).toBe(true);
  expect(
    evmGameActions({ ...game, status: 2 }, "creator", 110n, 10n).close,
  ).toBe(false);
});

test("second-based chat timeouts survive conversion to minutes", () => {
  const token = { decimals: 6, minimumAmount: "0.25" };
  for (const seconds of [300, 301, 307, 3599, 86400]) {
    expect(
      validateGameDraft(
        { ...draft, timeoutMinutes: seconds / 60 },
        token,
        gameCapabilities("evm"),
      ),
    ).toBe(500000n);
  }
  for (const seconds of [299, 301.5, 86401, NaN, Infinity]) {
    expect(() =>
      validateGameDraft(
        { ...draft, timeoutMinutes: seconds / 60 },
        token,
        gameCapabilities("evm"),
      ),
    ).toThrow();
  }
});

test("authorization compares address identity while rejecting changed terms", async () => {
  const { checkCreationAuthorization } =
    await import("../src/evm/authorization.js");
  const { gameIdFor } = await import("../src/evm/v0.1.0/client.js");
  const { getAddress, zeroHash } = await import("viem");
  const creator = "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" as const;
  const deployment = {
    chainId: 8453,
    address: creator,
    version: "0.1.0",
  } as const;
  const expected = {
    creator,
    token: creator,
    gameType: 0,
    amount: 1n,
    minPlayers: 2,
    maxPlayers: 2,
    timeout: 3600,
    isPrivate: false,
    nonce: 0n,
    deadline: 9999999999n,
    commitment: zeroHash,
  } as const;
  const response = {
    gameId: gameIdFor(deployment, creator, 0n),
    request: {
      ...expected,
      amount: "1",
      nonce: "0",
      deadline: "9999999999",
      commitment: `0x${"11".repeat(32)}`,
    },
    signature: `0x${"11".repeat(65)}`,
  };
  expect(
    checkCreationAuthorization(deployment, expected, response).request.creator,
  ).toBe(getAddress(creator));
  for (const change of [
    { amount: "2" },
    { token: "0x1111111111111111111111111111111111111111" },
    { creator: "0x1111111111111111111111111111111111111111" },
    { nonce: "1" },
    { commitment: zeroHash },
  ]) {
    expect(() =>
      checkCreationAuthorization(deployment, expected, {
        ...response,
        request: { ...response.request, ...change },
      }),
    ).toThrow();
  }
  expect(() =>
    checkCreationAuthorization(deployment, expected, {
      ...response,
      gameId: zeroHash,
    }),
  ).toThrow();
});
