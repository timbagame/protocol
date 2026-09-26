import { describe, expect, test } from "bun:test";
import { AccountRole, address, createNoopSigner } from "@solana/kit";
import {
  GameType,
  TIMBA_ERROR__GAME_FULL,
  TIMBA_PROGRAM_ADDRESS,
  TimbaAccount,
  TimbaInstruction,
  getCompleteGameInstruction,
  getGameDecoder,
  getGameEncoder,
  getTimbaErrorMessage,
  identifyTimbaAccount,
  identifyTimbaInstruction,
  parseTimbaInstruction,
} from "../src/contracts/v0.3.0/generated/index.js";

const CREATOR = address("32Jr4JnXWvqq9GqPQynkooHsszaucUUvZfNLh2hdX2L5");
const PLAYER = address("11111111111111111111111111111111");
const MINT = address("So11111111111111111111111111111111111111112");

// Generated Codama code is excluded from the line gate; these checks pin the
// wire formats the package itself relies on (game accounts, winner payouts).
describe("generated v0.3.0 codecs", () => {
  test("round-trips a game account and identifies it by discriminator", () => {
    const bytes = getGameEncoder().encode({
      creator: CREATOR,
      gameType: GameType.Giveaway,
      ticketAmount: 18_446_744_073_709_551_615n,
      maxTickets: 4,
      minTickets: 2,
      ticketsCount: 2,
      tokenMint: MINT,
      createdAt: 1_700_000_000n,
      timeout: 3_600n,
      lastSlot: 42n,
      isPrivate: true,
      totalAmount: 5_000n,
      participants: [CREATOR, PLAYER],
    });
    expect(identifyTimbaAccount(bytes)).toBe(TimbaAccount.Game);
    const game = getGameDecoder().decode(bytes);
    expect(game).toMatchObject({
      creator: CREATOR,
      gameType: GameType.Giveaway,
      ticketAmount: 18_446_744_073_709_551_615n,
      maxTickets: 4,
      minTickets: 2,
      ticketsCount: 2,
      tokenMint: MINT,
      createdAt: 1_700_000_000n,
      timeout: 3_600n,
      lastSlot: 42n,
      isPrivate: true,
      totalAmount: 5_000n,
      participants: [CREATOR, PLAYER],
    });
  });

  test("builds and parses a complete-game payout instruction", () => {
    const randomHash = new Uint8Array(32).fill(7);
    const secretKey = new Uint8Array(32).fill(9);
    const oracleOperator = createNoopSigner(PLAYER);
    const instruction = getCompleteGameInstruction({
      game: CREATOR,
      tokenMint: MINT,
      gameVault: CREATOR,
      gameVaultTokenAccount: CREATOR,
      oracle: CREATOR,
      oracleOperator,
      winner: PLAYER,
      creator: CREATOR,
      winnerTokenAccount: PLAYER,
      oracleOperatorTokenAccount: PLAYER,
      randomHash,
      secretKey,
      winnerIndex: 3,
    });
    expect(instruction.programAddress).toBe(TIMBA_PROGRAM_ADDRESS);
    expect(identifyTimbaInstruction(instruction)).toBe(
      TimbaInstruction.CompleteGame,
    );
    const parsed = parseTimbaInstruction(instruction);
    expect(parsed.instructionType).toBe(TimbaInstruction.CompleteGame);
    if (parsed.instructionType !== TimbaInstruction.CompleteGame)
      throw new Error("unreachable");
    expect(parsed.data.winnerIndex).toBe(3);
    expect([...parsed.data.randomHash]).toEqual([...randomHash]);
    expect([...parsed.data.secretKey]).toEqual([...secretKey]);
    expect(parsed.accounts.winner.address).toBe(PLAYER);
    expect(parsed.accounts.oracleOperator.address).toBe(PLAYER);
    expect(parsed.accounts.oracleOperator.role).toBe(
      AccountRole.READONLY_SIGNER,
    );
    expect(parsed.accounts.winnerTokenAccount.role).toBe(AccountRole.WRITABLE);
  });

  test("rejects unknown instruction and account discriminators", () => {
    const junk = new Uint8Array(8).fill(255);
    expect(() => identifyTimbaInstruction({ data: junk })).toThrow();
    expect(() => identifyTimbaAccount(junk)).toThrow();
  });

  test("maps program error codes to messages", () => {
    expect(getTimbaErrorMessage(TIMBA_ERROR__GAME_FULL)).toBe("Game full");
  });
});
