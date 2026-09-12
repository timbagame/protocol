import { describe, expect, test } from "bun:test";
import {
  AccountRole,
  address,
  blockhash,
  getAddressEncoder,
  getTransactionEncoder,
  generateKeyPairSigner,
} from "@solana/kit";
import { createLegacyTransaction } from "../src/solana/plans/transaction.js";
import { findGameTokenPda } from "../src/contracts/v0.2.0/generated/index.js";
import { findGameVaultPda } from "../src/contracts/v0.3.0/generated/index.js";
const PROGRAM_ID = address("BPFLoaderUpgradeab1e11111111111111111111111");
const getGameTokenPDA = async (tokenMint: ReturnType<typeof address>) =>
  (await findGameTokenPda({ tokenMint }, { programAddress: PROGRAM_ID }))[0];
const getGameVaultPDA = async (tokenMint: ReturnType<typeof address>) =>
  (await findGameVaultPda({ tokenMint }, { programAddress: PROGRAM_ID }))[0];
import { NATIVE_MINT as SOL_MINT } from "../src/solana/plans/token-program.js";
import { createContractAdapter } from "../src/solana/plans/contract-adapter.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
} from "../src/solana/plans/token-program.js";

const GAME_DISCRIMINATOR = Buffer.from([27, 90, 166, 125, 74, 100, 121, 18]);
const CREATOR = address("HGBiGfyR9GF36J4SMPjxsRkFuwYNuNYuzdCjgR4aw4FC");
const MINT = address("F3A1baCgv4TF79TSjdMTvpMDtNv8DJvHZwNc9DG8pump");
const GAME = address("5QwKMyvKrbzRbnSKDmgiPstaw2E5mteKmL5ufYXDvS4Z");
const adapterV030 = createContractAdapter("0.3.0", PROGRAM_ID);
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

describe("Timba contract adapter", () => {
  test("decodes participant addresses", () => {
    const game = adapterV030.decodeGame(GAME, gameAccount());
    expect(game.participantAddresses).toEqual([CREATOR]);
    expect(game.stakeAmount).toBe(5_000_000n);
  });

  test("uses the canonical v0.3 join accounts", async () => {
    const join = await adapterV030.buildJoinPlan({
      game: GAME,
      player: CREATOR,
      tokenMint: MINT,
    });
    const instruction = join.instructions[1]!;
    const gameVault = await getGameVaultPDA(MINT);
    const legacyGameToken = await getGameTokenPDA(MINT);
    expect(instruction.accounts).toHaveLength(10);
    expect(
      instruction.accounts?.some(
        (account) => account.address === SYSTEM_PROGRAM_ID,
      ),
    ).toBeFalse();
    expect(instruction.accounts?.[2]).toEqual({
      address: PROGRAM_ID,
      role: AccountRole.READONLY,
    });
    expect(instruction.accounts?.[3]?.address).toBe(MINT);
    expect(instruction.accounts?.[4]?.address).toBe(gameVault);
    expect(instruction.accounts?.[6]?.address).toBe(TOKEN_PROGRAM_ID);
    expect(instruction.accounts?.[7]?.address).toBe(
      ASSOCIATED_TOKEN_PROGRAM_ID,
    );
    expect(
      instruction.accounts?.some(
        (account) => account.address === legacyGameToken,
      ),
    ).toBeFalse();
  });

  test("wraps native SOL before joining", async () => {
    const plan = await adapterV030.buildJoinPlan({
      game: GAME,
      player: CREATOR,
      tokenMint: SOL_MINT,
      tokenAmount: 500_000_000n,
    });
    expect(plan.instructions).toHaveLength(4);
    expect(plan.instructions[1]?.programAddress).toBe(SYSTEM_PROGRAM_ID);
    expect(plan.instructions[2]?.programAddress).toBe(TOKEN_PROGRAM_ID);
  });

  test("lets the creator refund another participant before closing", async () => {
    const participant = address("6HqDqk25HSbzsk1HJ8PMzhzD5ZNY9LqZhpGwbCLyzvC6");
    const unjoin = await adapterV030.buildUnjoinPlan({
      game: GAME,
      player: participant,
      authority: CREATOR,
      tokenMint: MINT,
    });
    const close = await adapterV030.buildClosePlan({
      game: GAME,
      creator: CREATOR,
      tokenMint: MINT,
    });
    expect(unjoin.instructions[0]?.accounts?.[0]?.address).toBe(CREATOR);
    expect(
      unjoin.instructions[1]?.accounts?.some(
        (account) => account.address === CREATOR,
      ),
    ).toBeTrue();
    expect(close.instructions[1]?.accounts?.[1]?.address).toBe(CREATOR);
    expect(close.instructions[1]?.accounts?.[1]?.role).toBe(
      AccountRole.WRITABLE_SIGNER,
    );
  });

  test("fits seven refunds and close in one legacy transaction", async () => {
    const instructions = [];
    for (let index = 1; index <= 7; index++) {
      const participant = (await generateKeyPairSigner()).address;
      instructions.push(
        ...(
          await adapterV030.buildUnjoinPlan({
            game: GAME,
            player: participant,
            authority: CREATOR,
            tokenMint: MINT,
          })
        ).instructions,
      );
    }
    instructions.push(
      ...(
        await adapterV030.buildClosePlan({
          game: GAME,
          creator: CREATOR,
          tokenMint: MINT,
        })
      ).instructions,
    );
    const transaction = createLegacyTransaction(
      CREATOR,
      {
        blockhash: blockhash("11111111111111111111111111111111"),
        lastValidBlockHeight: 1n,
      },
      instructions,
    );
    expect(
      getTransactionEncoder().encode(transaction).length,
    ).toBeLessThanOrEqual(1232);
  });

  test("uses the v0.2 GameToken join account", async () => {
    const join = await createContractAdapter("0.2.0", PROGRAM_ID).buildJoinPlan(
      {
        game: GAME,
        player: CREATOR,
        tokenMint: MINT,
      },
    );
    const gameToken = await getGameTokenPDA(MINT);
    expect(join.instructions[1]?.accounts).toHaveLength(11);
    expect(
      join.instructions[1]?.accounts?.some(
        (account) => account.address === gameToken,
      ),
    ).toBeTrue();
  });
});
