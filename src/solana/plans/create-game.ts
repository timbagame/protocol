import { createNoopSigner, type Address, type Instruction } from "@solana/kit";
import {
  GameType as GameTypeV020,
  getInitializeGameInstructionAsync as getInitializeGameInstructionAsyncV020,
} from "../../contracts/v0.2.0/generated/index.js";
import {
  GameType as GameTypeV030,
  getInitializeGameInstructionAsync as getInitializeGameInstructionAsyncV030,
} from "../../contracts/v0.3.0/generated/index.js";
import {
  findGamePda,
  findGameVaultPda,
} from "../../contracts/v0.3.0/generated/index.js";
import type { TimbaGameType } from "./types.js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddress,
} from "./token-program.js";
import type { ContractVersion } from "../../contracts/index.js";

export interface CreateGameInput {
  creator: Address;
  tokenMint: Address;
  type: TimbaGameType;
  amount: bigint;
  minPlayers: number;
  maxPlayers: number;
  timeoutSeconds: bigint;
  randomHash: Uint8Array;
  oracleOperator: Address;
}

export async function buildCreateGamePlan(
  input: CreateGameInput,
  version: ContractVersion,
  programId: Address,
) {
  if (input.randomHash.length !== 32) {
    throw new Error("Oracle commitment must be 32 bytes");
  }
  const game = (
    await findGamePda(
      { randomHash: input.randomHash },
      { programAddress: programId },
    )
  )[0];
  const gameVault = (
    await findGameVaultPda(
      { tokenMint: input.tokenMint },
      { programAddress: programId },
    )
  )[0];
  const gameVaultTokenAccount = await getAssociatedTokenAddress(
    input.tokenMint,
    gameVault,
    true,
    TOKEN_PROGRAM_ID,
  );
  const creatorTokenAccount = await getAssociatedTokenAddress(
    input.tokenMint,
    input.creator,
  );
  const creator = createNoopSigner(input.creator);
  const oracleOperator = createNoopSigner(input.oracleOperator);
  const common = {
    game,
    creator,
    oracleOperator,
    tokenMint: input.tokenMint,
    creatorTokenAccount,
    gameType:
      input.type === "coinflip" ? GameTypeV020.Coinflip : GameTypeV020.Giveaway,
    amount: input.amount,
    maxTickets: input.maxPlayers,
    minTickets: input.minPlayers,
    timeout: input.timeoutSeconds,
    isPrivate: false,
    randomHash: input.randomHash,
  };
  const initialize =
    version === "0.2.0"
      ? await getInitializeGameInstructionAsyncV020(common, {
          programAddress: programId,
        })
      : await getInitializeGameInstructionAsyncV030(
          {
            ...common,
            gameType:
              input.type === "coinflip"
                ? GameTypeV030.Coinflip
                : GameTypeV030.Giveaway,
          },
          { programAddress: programId },
        );
  const creatorTokenSetup = createAssociatedTokenAccountIdempotentInstruction(
    input.creator,
    creatorTokenAccount,
    input.creator,
    input.tokenMint,
    TOKEN_PROGRAM_ID,
  );
  const vaultTokenSetup: Instruction[] =
    version === "0.2.0"
      ? []
      : [
          createAssociatedTokenAccountIdempotentInstruction(
            input.creator,
            gameVaultTokenAccount,
            gameVault,
            input.tokenMint,
            TOKEN_PROGRAM_ID,
          ),
        ];
  return {
    game,
    instructions: [creatorTokenSetup, ...vaultTokenSetup, initialize],
  };
}
