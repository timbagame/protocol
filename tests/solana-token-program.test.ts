import { describe, expect, test } from "bun:test";
import { AccountRole, address, getProgramDerivedAddress } from "@solana/kit";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  SYSTEM_PROGRAM_ID,
  TOKEN_PROGRAM_ID,
  TokenOwnerOffCurveError,
  createAssociatedTokenAccountIdempotentInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
} from "../src/solana/plans/token-program.js";

const TOKEN_2022_PROGRAM_ID = address(
  "TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb",
);
const OWNER = address("11111111111111111111111111111111");

describe("legacy token compatibility", () => {
  test("derives canonical associated token addresses", async () => {
    const [pdaOwner] = await getProgramDerivedAddress({
      seeds: [Buffer.from("owner")],
      programAddress: address("BPFLoaderUpgradeab1e11111111111111111111111"),
    });

    expect(String(await getAssociatedTokenAddress(NATIVE_MINT, OWNER))).toBe(
      "aqxoAhCwpy3oB1BpNw9hL1HdLYLgPpbPjzxDrrQj3Fs",
    );
    expect(
      getAssociatedTokenAddress(NATIVE_MINT, pdaOwner),
    ).rejects.toBeInstanceOf(TokenOwnerOffCurveError);
    expect(
      String(await getAssociatedTokenAddress(NATIVE_MINT, pdaOwner, true)),
    ).toBe("5myBF2P55TgTd7QW7hYYGZfcqwXDY4rgtLhRF4fJMytm");
    expect(
      String(
        await getAssociatedTokenAddress(
          NATIVE_MINT,
          pdaOwner,
          true,
          TOKEN_2022_PROGRAM_ID,
        ),
      ),
    ).toBe("3vdGrVDTV7fMTkQhnXgo3ZQPKfp1eqBeWvPAFdXjZGQi");
  });

  test("builds the canonical idempotent ATA instruction", async () => {
    const associatedToken = await getAssociatedTokenAddress(NATIVE_MINT, OWNER);
    const instruction = createAssociatedTokenAccountIdempotentInstruction(
      OWNER,
      associatedToken,
      OWNER,
      NATIVE_MINT,
    );

    expect(instruction.programAddress).toBe(ASSOCIATED_TOKEN_PROGRAM_ID);
    expect([...instruction.data!]).toEqual([1]);
    expect(
      instruction.accounts?.map(({ address, role }) => ({ address, role })),
    ).toEqual([
      { address: OWNER, role: AccountRole.WRITABLE_SIGNER },
      { address: associatedToken, role: AccountRole.WRITABLE },
      { address: OWNER, role: AccountRole.READONLY },
      { address: NATIVE_MINT, role: AccountRole.READONLY },
      { address: SYSTEM_PROGRAM_ID, role: AccountRole.READONLY },
      { address: TOKEN_PROGRAM_ID, role: AccountRole.READONLY },
    ]);
  });

  test("builds the canonical SyncNative instruction", () => {
    const account = address("aqxoAhCwpy3oB1BpNw9hL1HdLYLgPpbPjzxDrrQj3Fs");
    const instruction = createSyncNativeInstruction(account);
    expect(instruction.programAddress).toBe(TOKEN_PROGRAM_ID);
    expect([...instruction.data!]).toEqual([17]);
    expect(
      instruction.accounts?.map(({ address, role }) => ({ address, role })),
    ).toEqual([
      { address: account, role: AccountRole.WRITABLE },
      {
        address: address("SysvarRent111111111111111111111111111111111"),
        role: AccountRole.READONLY,
      },
    ]);
  });
});
