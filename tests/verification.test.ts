import { test, expect } from "bun:test";
import { calculateWinner } from "../src/randomness/index.js";
import { address as solanaAddress } from "@solana/kit";
import { findGamePda } from "../src/contracts/v0.3.0/generated/index.js";
const PROGRAM_ID = solanaAddress("11111111111111111111111111111111");
const getGamePDA = async (randomHash: Uint8Array) =>
  (await findGamePda({ randomHash }, { programAddress: PROGRAM_ID }))[0];
import { validateVerifiedGame } from "../src/web/verification.js";

test("locally verifies the published commitment and winner, rejecting tampered results", async () => {
  const secret = new Uint8Array(32).fill(7);
  const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", secret));
  const hex = (bytes: Uint8Array) =>
    [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  const result = await calculateWinner(secret, 3n, 1n);
  const signature = "2".repeat(88);
  const address = "11111111111111111111111111111111";
  const data = {
    gameKey: await getGamePDA(hash),
    signature,
    timestamp: 1,
    participants: [{ address, ticketCount: 1, ticketIndices: [0] }],
    totalTickets: 1,
    winner: address,
    winnerTicketIndex: 0,
    prizeAmount: 1,
    feeAmount: 0,
    tokenMint: address,
    tokenSymbol: "TEST",
    tokenDecimals: 9,
    randomValue: result.randomValue.toString(),
    secretKey: hex(secret),
    randomHash: hex(hash),
    lastSlot: "3",
    transactionSignatures: [signature],
    calculationBreakdown: {
      randomValue: result.randomValue.toString(),
      totalTickets: 1,
      winnerIndex: 0,
      formula: "synthetic",
    },
    explorerUrl: "https://solscan.io",
  };
  await expect(
    validateVerifiedGame(
      { ...data, randomValue: "18446744073709551616" },
      signature,
      PROGRAM_ID,
    ),
  ).rejects.toThrow();
  await expect(
    validateVerifiedGame(
      { ...data, transactionSignatures: undefined },
      signature,
      PROGRAM_ID,
    ),
  ).rejects.toThrow();
  await expect(
    validateVerifiedGame(
      data,
      signature,
      solanaAddress("So11111111111111111111111111111111111111112"),
    ),
  ).rejects.toThrow();
  expect(
    String((await validateVerifiedGame(data, signature, PROGRAM_ID)).winner),
  ).toBe(address);
  await expect(
    validateVerifiedGame(
      { ...data, randomHash: "00".repeat(32) },
      signature,
      PROGRAM_ID,
    ),
  ).rejects.toThrow();
  await expect(
    validateVerifiedGame(
      { ...data, winnerTicketIndex: 1 },
      signature,
      PROGRAM_ID,
    ),
  ).rejects.toThrow();
  await expect(
    validateVerifiedGame(data, "3".repeat(88), PROGRAM_ID),
  ).rejects.toThrow();
});
