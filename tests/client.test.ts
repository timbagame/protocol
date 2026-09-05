import { describe, expect, test } from "bun:test";
import {
  address,
  getAddressEncoder,
  getProgramDerivedAddress,
} from "@solana/kit";
import {
  decodeGame,
  getContractClient,
  getGameTypeName,
} from "../src/contracts/client/index.js";
import { getContractIdl } from "../src/contracts/idl/index.js";
import type { ContractVersion } from "../src/contracts/index.js";
const GAME_DISCRIMINATOR = Buffer.from([27, 90, 166, 125, 74, 100, 121, 18]);
const CREATOR = address("HGBiGfyR9GF36J4SMPjxsRkFuwYNuNYuzdCjgR4aw4FC");
const MINT = address("F3A1baCgv4TF79TSjdMTvpMDtNv8DJvHZwNc9DG8pump");
const GAME = address("5QwKMyvKrbzRbnSKDmgiPstaw2E5mteKmL5ufYXDvS4Z");
const addressEncoder = getAddressEncoder();

function gameAccount() {
  const data = Buffer.alloc(
    8 + 32 + 1 + 8 + 4 + 4 + 4 + 32 + 8 + 8 + 8 + 1 + 8 + 4 + 32,
  );
  let offset = 0;
  const bytes = (value: ArrayLike<number>) => {
    Buffer.from(value).copy(data, offset);
    offset += value.length;
  };
  const u8 = (value: number) => {
    data.writeUInt8(value, offset++);
  };
  const u32 = (value: number) => {
    data.writeUInt32LE(value, offset);
    offset += 4;
  };
  const u64 = (value: bigint) => {
    data.writeBigUInt64LE(value, offset);
    offset += 8;
  };
  bytes(GAME_DISCRIMINATOR);
  bytes(addressEncoder.encode(CREATOR));
  u8(0);
  u64(5_000_000n);
  u32(4);
  u32(2);
  u32(1);
  bytes(addressEncoder.encode(MINT));
  u64(100n);
  u64(300n);
  u64(999n);
  u8(0);
  u64(5_000_000n);
  u32(1);
  bytes(addressEncoder.encode(CREATOR));
  return data;
}

for (const version of ["0.2.0", "0.3.0"] as const) {
  describe(`shared client ${version}`, () => {
    test("selects matching immutable artifacts", () => {
      const client = getContractClient(version);
      expect(getContractIdl(version).metadata.version).toBe(version);
      expect(String(client.TIMBA_PROGRAM_ADDRESS)).toBe(
        getContractIdl(version).address,
      );
    });

    test("decodes independent account bytes and rejects inconsistent participants", () => {
      const game = decodeGame(version, gameAccount());
      expect(game.ticketAmount).toBe(5_000_000n);
      expect(game.participants).toEqual([CREATOR]);
      expect(game.lastSlot).toBe(999n);
      const badCount = gameAccount();
      badCount.writeUInt32LE(2, 57);
      expect(() => decodeGame(version, badCount)).toThrow("participant count");
      const badType = gameAccount();
      badType.fill(0, 0, 8);
      expect(() => decodeGame(version, badType)).toThrow();
      expect(() => decodeGame(version, new Uint8Array())).toThrow();
    });

    test("derives contract addresses with an explicit program override", async () => {
      const client = getContractClient(version);
      const randomHash = new Uint8Array(32).fill(7);
      const config = { programAddress: GAME };
      const encoder = new TextEncoder();
      const expectedGame = await getProgramDerivedAddress({
        programAddress: GAME,
        seeds: [encoder.encode("game"), randomHash],
      });
      const expectedOracle = await getProgramDerivedAddress({
        programAddress: GAME,
        seeds: [encoder.encode("oracle")],
      });
      const expectedVault = await getProgramDerivedAddress({
        programAddress: GAME,
        seeds: [encoder.encode("game_vault"), addressEncoder.encode(MINT)],
      });
      expect(await client.findGamePda({ randomHash }, config)).toEqual(
        expectedGame,
      );
      expect(await client.findOraclePda(config)).toEqual(expectedOracle);
      expect(
        await client.findGameVaultPda({ tokenMint: MINT }, config),
      ).toEqual(expectedVault);
    });
  });
}

test("runtime version selection rejects unsupported versions", () => {
  expect(() => getContractClient("0.4.0" as ContractVersion)).toThrow();
  expect(() => getContractIdl("0.4.0" as ContractVersion)).toThrow();
});

test("normalizes known game enums and rejects unknown variants", () => {
  for (const version of ["0.2.0", "0.3.0"] as const) {
    const client = getContractClient(version);
    expect(getGameTypeName(client.GameType.Coinflip)).toBe("coinflip");
    expect(getGameTypeName(client.GameType.Giveaway)).toBe("giveaway");
  }
  expect(() =>
    getGameTypeName(2 as Parameters<typeof getGameTypeName>[0]),
  ).toThrow();
  for (const version of [
    "",
    " 0.3.0 ",
    undefined,
  ] as unknown as ContractVersion[]) {
    expect(() => getContractClient(version)).toThrow();
    expect(() => getContractIdl(version)).toThrow();
  }
});
