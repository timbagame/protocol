import { expect, test } from "bun:test";
import {
  calculateWinner,
  createWinnerSeed,
  selectWinnerFromEntropy,
} from "../src/randomness/index.js";
test("encodes the contract's 32-byte secret and little-endian slot", () => {
  const seed = createWinnerSeed(
    new Uint8Array(32).fill(7),
    0x0102030405060708n,
  );
  expect(Array.from(seed.slice(32))).toEqual([8, 7, 6, 5, 4, 3, 2, 1]);
});
test("slides overlapping windows when the first u64 is rejected", () => {
  const entropy = new Uint8Array(32).fill(255);
  entropy[8] = 0;
  expect(selectWinnerFromEntropy(entropy, 2n)).toEqual({
    randomValue: 0x00ff_ffff_ffff_ffffn,
    winnerIndex: 1,
  });
  expect(() =>
    selectWinnerFromEntropy(new Uint8Array(32).fill(255), 2n),
  ).toThrow();
});
test("validates bounds", async () => {
  expect(() => selectWinnerFromEntropy(new Uint8Array(32), 0n)).toThrow();
  expect(() => createWinnerSeed(new Uint8Array(31), 0n)).toThrow();
  expect(() => createWinnerSeed(new Uint8Array(32), -1n)).toThrow();
  expect(
    (await calculateWinner(new Uint8Array(32).fill(1), 123456n, 1n))
      .winnerIndex,
  ).toBe(0);
});

test("matches contract winner fixtures", async () => {
  expect(await calculateWinner(new Uint8Array(32).fill(0), 0n, 2n)).toEqual({
    randomValue: 10125002298327184428n,
    winnerIndex: 0,
  });
  expect(
    await calculateWinner(new Uint8Array(32).fill(1), 123456n, 100n),
  ).toEqual({ randomValue: 14809389532232907002n, winnerIndex: 2 });
  expect(await calculateWinner(new Uint8Array(32).fill(7), 42n, 8n)).toEqual({
    randomValue: 8343668469929381468n,
    winnerIndex: 4,
  });
  expect(
    await calculateWinner(
      new Uint8Array(32).fill(255),
      18446744073709551615n,
      4294967295n,
    ),
  ).toEqual({ randomValue: 14218936971049291118n, winnerIndex: 3496189253 });
});
