import { expect, test } from "bun:test";
import { address } from "@solana/kit";
import {
  normalizeSolanaGameEvent,
  type SolanaGameReference,
} from "../src/games/index.js";
const key = address("11111111111111111111111111111111");
const reference: SolanaGameReference = {
  chain: "solana",
  deployment: key,
  network: "devnet",
  gameId: key,
};

test("normalizes every Solana lifecycle event and preserves unavailable fields", () => {
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "GameInitialized",
      data: {
        gameKey: key,
        creator: key,
        gameType: "giveaway",
        ticketAmount: 0n,
        totalAmount: 100n,
        maxTickets: 4,
        minTickets: 1,
        tokenMint: key,
        isPrivate: false,
        createdAt: 1000n,
        timeout: 100n,
      },
    }),
  ).toMatchObject({
    kind: "created",
    gameType: "giveaway",
    expiresAt: 1100n,
    commitment: null,
  });
  const membership = {
    gameKey: key,
    player: key,
    totalAmount: 100n,
    ticketsCount: 1,
    ticketIndex: 0,
    lastSlot: 42n,
    timestamp: 1000n,
  };
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "PlayerJoined",
      data: membership,
    }),
  ).toMatchObject({ kind: "joined", index: 0, amount: null });
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "PlayerUnjoined",
      data: { ...membership, movedParticipant: null },
    }),
  ).toMatchObject({
    kind: "refunded",
    index: 0,
    amount: null,
    movedParticipant: null,
  });
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "GameCompleted",
      data: {
        gameKey: key,
        winner: key,
        ticketsCount: 2,
        winnerAmount: 99n,
        feeAmount: 1n,
        timestamp: 1100n,
      },
    }),
  ).toMatchObject({ kind: "completed", prize: 99n, fee: 1n, secret: null });
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "GameClosed",
      data: { gameKey: key, timestamp: 1100n },
    }),
  ).toMatchObject({
    kind: "closed",
    creator: null,
    refundAmount: null,
    closedBy: "creator",
  });
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "OperatorGameClosed",
      data: {
        gameKey: key,
        creator: key,
        operator: key,
        refundedAmount: 100n,
        recoveredLamports: 500n,
        timestamp: 1100n,
      },
    }),
  ).toMatchObject({ kind: "closed", refundAmount: 100n, closedBy: "operator" });
});
test("rejects mismatched game identity and ignores non-game events", () => {
  expect(() =>
    normalizeSolanaGameEvent(
      { ...reference, gameId: "wrong" },
      {
        name: "GameClosed",
        data: { gameKey: key, timestamp: 1100n },
      },
    ),
  ).toThrow();
  expect(
    normalizeSolanaGameEvent(reference, {
      name: "TokenFeeWithdrawn",
      data: { operator: key, tokenMint: key, amount: 1n },
    }),
  ).toBeNull();
});
