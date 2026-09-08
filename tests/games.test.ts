import { describe, expect, test } from "bun:test";
import { address } from "@solana/kit";
import type { Game } from "../src/contracts/v0.3.0/generated/accounts/game.js";
import {
  gameLifecycle,
  observeEvmGame,
  observeSolanaGame,
  normalizeEvmMembership,
  normalizeSolanaMembership,
  type EvmGame,
  type EvmGameReference,
  type SolanaGameReference,
} from "../src/games/index.js";

const key = address("11111111111111111111111111111111");
const solana: SolanaGameReference = {
  chain: "solana",
  network: "devnet",
  deployment: key,
  gameId: key,
};
const evm: EvmGameReference = {
  chain: "evm",
  chainId: 8453n,
  deployment: "0x123",
  gameId: "0xabc",
};
const solanaAccount: Game = {
  discriminator: new Uint8Array(8),
  creator: key,
  tokenMint: key,
  gameType: 0,
  ticketAmount: 100n,
  totalAmount: 200n,
  minTickets: 2,
  maxTickets: 4,
  ticketsCount: 2,
  createdAt: 1000n,
  timeout: 100n,
  lastSlot: 50n,
  isPrivate: false,
  participants: [key, key],
};
const evmAccount: EvmGame = {
  creator: key,
  token: key,
  gameType: 0,
  status: 1,
  ticketAmount: 100n,
  totalAmount: 200n,
  minPlayers: 2,
  maxPlayers: 4,
  expiresAt: 1100n,
  commitment: "0x01",
  lastEntryBlock: 50n,
  isPrivate: false,
  participants: [key, key],
};

describe("cross-chain games", () => {
  test("normalizes amounts and terms without conflating slots and blocks", () => {
    const a = observeSolanaGame(solana, solanaAccount).game!;
    const b = observeEvmGame(evm, evmAccount).game!;
    expect(a.expiresAt).toBe(b.expiresAt);
    expect(a.ticketAmount).toBe(b.ticketAmount);
    expect(a.participantCount).toBe(b.participantCount);
    expect(a.minimumParticipants).toBe(b.minimumParticipants);
    expect(a.commitment).toBeNull();
    expect(a.entropyPosition.kind).toBe("solana-slot");
    expect(b.entropyPosition.kind).toBe("evm-block");
    expect(b.reference).toEqual(evm);
    expect(
      observeEvmGame(evm, { ...evmAccount, ticketAmount: 1n << 100n }).game!
        .ticketAmount,
    ).toBe(1n << 100n);
  });
  test("absence needs a terminal event; empty zero-pot accounts remain open", () => {
    expect(observeSolanaGame(solana, null).status).toBe("unknown");
    expect(
      observeSolanaGame(solana, null, { gameKey: key, outcome: "closed" })
        .status,
    ).toBe("closed");
    expect(
      observeSolanaGame(solana, null, { gameKey: key, outcome: "completed" })
        .status,
    ).toBe("completed");
    expect(() =>
      observeSolanaGame(solana, null, {
        gameKey: "wrong",
        outcome: "completed",
      }),
    ).toThrow();
    expect(
      observeSolanaGame(solana, {
        ...solanaAccount,
        totalAmount: 0n,
        participants: [],
        ticketsCount: 0,
      }).status,
    ).toBe("open");
    expect(observeEvmGame(evm, { ...evmAccount, status: 0 }).status).toBe(
      "unknown",
    );
    expect(observeEvmGame(evm, { ...evmAccount, status: 2 }).status).toBe(
      "completed",
    );
    expect(observeEvmGame(evm, { ...evmAccount, status: 3 }).status).toBe(
      "closed",
    );
  });
  test("rejects unknown layouts and inconsistent participant counts", () => {
    expect(() => observeEvmGame(evm, { ...evmAccount, status: 4 })).toThrow();
    expect(() => observeEvmGame(evm, { ...evmAccount, gameType: 2 })).toThrow();
    expect(() =>
      observeSolanaGame(solana, { ...solanaAccount, ticketsCount: 3 }),
    ).toThrow();
  });
  test("matches expiry, full-game and live-buffer boundaries on both adapters", () => {
    for (const observation of [
      observeEvmGame(evm, evmAccount),
      observeSolanaGame(solana, solanaAccount),
    ]) {
      const game = observation.game!;
      expect(gameLifecycle(game, 1099n, 10n)).toMatchObject({
        canJoin: true,
        canSettle: false,
        canRefund: false,
      });
      expect(gameLifecycle(game, 1100n, 10n)).toMatchObject({
        canJoin: false,
        canSettle: true,
        canRefund: false,
      });
      expect(gameLifecycle(game, 1110n, 10n)).toMatchObject({
        canSettle: false,
        canRefund: true,
      });
      expect(gameLifecycle(game, 1110n, 20n).canSettle).toBe(true);
      expect(
        gameLifecycle({ ...game, participantCount: 1 }, 1100n, 10n).canRefund,
      ).toBe(true);
      expect(
        gameLifecycle({ ...game, participantCount: 4 }, 1000n, 10n).canSettle,
      ).toBe(true);
      expect(
        gameLifecycle({ ...game, status: "closed" }, 1110n, 10n),
      ).toMatchObject({ canJoin: false, canSettle: false, canRefund: false });
    }
  });
  test("normalizes swap-removal and last-removal events", () => {
    const a = normalizeSolanaMembership(solana, {
      name: "PlayerUnjoined",
      data: {
        gameKey: key,
        player: key,
        ticketIndex: 0,
        ticketsCount: 1,
        totalAmount: 100n,
        movedParticipant: key,
        lastSlot: 51n,
        timestamp: 1110n,
      },
    });
    const b = normalizeEvmMembership(evm, {
      name: "PlayerRefunded",
      gameId: "0xABC",
      player: key,
      removedIndex: 0n,
      movedParticipant: key,
    });
    expect(a.kind).toBe(b.kind);
    expect(a.index).toBe(b.index);
    expect(a.movedParticipant).toBe(b.movedParticipant);
    expect(
      normalizeEvmMembership(evm, {
        name: "PlayerRefunded",
        gameId: "0xabc",
        player: key,
        removedIndex: 0n,
        movedParticipant: "0x" + "0".repeat(40),
      }).movedParticipant,
    ).toBeNull();
    expect(() =>
      normalizeEvmMembership(evm, {
        name: "PlayerJoined",
        gameId: "other",
        player: key,
        index: 0n,
      }),
    ).toThrow();
    expect(() =>
      normalizeEvmMembership(evm, {
        name: "PlayerJoined",
        gameId: "0xabc",
        player: key,
        index: 1n << 64n,
      }),
    ).toThrow();
  });
});
