import { expect, test } from "bun:test";
import { address, getAddressEncoder } from "@solana/kit";
import {
  decodeProgramEvent,
  EVENT_DISCRIMINATORS,
} from "../src/contracts/events/index.js";

const game = address("11111111111111111111111111111111");
const operator = address("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA");
const MAX_U64 = 0xffff_ffff_ffff_ffffn;

function event(name: keyof typeof EVENT_DISCRIMINATORS, size: number) {
  const bytes = Buffer.alloc(size);
  bytes.set(EVENT_DISCRIMINATORS[name]);
  return bytes;
}

test("decodes initialized giveaway terms into labelled values", () => {
  const bytes = event("GameInitialized", 146);
  bytes[72] = 1;
  bytes.writeBigUInt64LE(MAX_U64, 73);
  bytes.writeUInt32LE(10, 89);
  bytes.writeUInt32LE(1, 93);
  bytes[129] = 1;
  bytes.writeBigUInt64LE(600n, 138);
  expect(decodeProgramEvent(bytes)).toMatchObject({
    name: "GameInitialized",
    data: {
      gameType: "giveaway",
      isPrivate: true,
      ticketAmount: MAX_U64,
      maxTickets: 10,
      minTickets: 1,
      timeout: 600n,
    },
  });
  bytes[72] = 0;
  bytes[129] = 0;
  expect(decodeProgramEvent(bytes)?.data).toMatchObject({
    gameType: "coinflip",
    isPrivate: false,
  });
});

test("decodes fee withdrawals with full u64 amounts", () => {
  const bytes = event("TokenFeeWithdrawn", 80);
  bytes.set(getAddressEncoder().encode(operator), 8);
  bytes.writeBigUInt64LE(MAX_U64, 72);
  expect(decodeProgramEvent(bytes)).toEqual({
    name: "TokenFeeWithdrawn",
    data: { operator, tokenMint: game, amount: MAX_U64 },
  });
  expect(() => decodeProgramEvent(bytes.subarray(0, 79))).toThrow(
    "Invalid Timba event length",
  );
});

test("decodes operator refunds and creator closes", () => {
  const refund = event("OperatorGameClosed", 128);
  refund.set(getAddressEncoder().encode(operator), 72);
  refund.writeBigUInt64LE(5_000n, 104);
  refund.writeBigUInt64LE(2_039_280n, 112);
  refund.writeBigUInt64LE(1_700_000_000n, 120);
  expect(decodeProgramEvent(refund)).toEqual({
    name: "OperatorGameClosed",
    data: {
      gameKey: game,
      creator: game,
      operator,
      refundedAmount: 5_000n,
      recoveredLamports: 2_039_280n,
      timestamp: 1_700_000_000n,
    },
  });

  const closed = event("GameClosed", 48);
  closed.writeBigUInt64LE(9n, 40);
  expect(decodeProgramEvent(closed)).toEqual({
    name: "GameClosed",
    data: { gameKey: game, timestamp: 9n },
  });
});
