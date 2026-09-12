import { createNoopSigner, type Address, type Instruction } from "@solana/kit";
import {
  decodeGame as decodeContractGame,
  getContractClient,
  getGameTypeName,
  type DecodedGame,
} from "../../contracts/client/index.js";
import type { TimbaGameAccount, TimbaGameType } from "./types.js";
import { buildWrapSolInstructions, isWrappedSol } from "./wsol.js";
import {
  TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  getAssociatedTokenAddress,
} from "./token-program.js";
import type { ContractVersion } from "../../contracts/index.js";

export interface GameInstructionInput {
  game: Address;
  player: Address;
  tokenMint: Address;
  tokenAmount?: bigint;
  authority?: Address;
}

export interface CloseGameInstructionInput {
  game: Address;
  creator: Address;
  tokenMint: Address;
}

export interface GameInstructionPlan {
  instructions: readonly Instruction[];
  playerTokenAccount: Address;
}

export interface TimbaContractAdapter {
  decodeGame(address: string, data: Uint8Array): TimbaGameAccount;
  buildJoinPlan(input: GameInstructionInput): Promise<GameInstructionPlan>;
  buildUnjoinPlan(input: GameInstructionInput): Promise<GameInstructionPlan>;
  buildClosePlan(
    input: CloseGameInstructionInput,
  ): Promise<GameInstructionPlan>;
  hasParticipant(game: TimbaGameAccount, player: Address): Promise<boolean>;
}

function mapGame(address: string, account: DecodedGame): TimbaGameAccount {
  const type: TimbaGameType = getGameTypeName(account.gameType);
  const createdAt = Number(account.createdAt);
  return {
    address,
    creator: account.creator,
    type,
    tokenMint: account.tokenMint,
    stakeAmount: type === "coinflip" ? account.ticketAmount : 0n,
    prizeAmount:
      type === "giveaway" ? account.ticketAmount : account.totalAmount,
    currentPlayers: account.ticketsCount,
    minPlayers: account.minTickets,
    maxPlayers: account.maxTickets,
    isPrivate: account.isPrivate,
    createdAt,
    expiresAt: createdAt + Number(account.timeout),
    creationSignature: "",
    lastSlot: account.lastSlot,
    participantAddresses: account.participants,
  };
}

export function createContractAdapter(
  version: ContractVersion,
  programId: Address,
): TimbaContractAdapter {
  const client = getContractClient(version);
  const decodeGame = (address: string, data: Uint8Array): TimbaGameAccount =>
    mapGame(address, decodeContractGame(version, data));

  const buildPlan = async (
    input: GameInstructionInput,
    unjoin: boolean,
  ): Promise<GameInstructionPlan> => {
    const playerTokenAccount = await getAssociatedTokenAddress(
      input.tokenMint,
      input.player,
    );
    const authority = input.authority ?? input.player;
    const instruction = unjoin
      ? await client.getUnjoinGameInstructionAsync(
          {
            game: input.game,
            player: input.player,
            authority: createNoopSigner(authority),
            tokenMint: input.tokenMint,
            playerTokenAccount,
          },
          { programAddress: programId },
        )
      : await client.getJoinGameInstructionAsync(
          {
            game: input.game,
            player: createNoopSigner(input.player),
            tokenMint: input.tokenMint,
            playerTokenAccount,
          },
          { programAddress: programId },
        );
    const setup = createAssociatedTokenAccountIdempotentInstruction(
      unjoin ? authority : input.player,
      playerTokenAccount,
      input.player,
      input.tokenMint,
      TOKEN_PROGRAM_ID,
    );

    const instructions: Instruction[] = [setup];
    if (!unjoin && isWrappedSol(input.tokenMint)) {
      if (!input.tokenAmount || input.tokenAmount <= 0n) {
        throw new Error("SOL joins require a positive stake amount");
      }
      instructions.push(
        ...(
          await buildWrapSolInstructions(input.player, input.tokenAmount)
        ).instructions.slice(1),
      );
    }
    instructions.push(instruction);
    return { instructions, playerTokenAccount };
  };

  return {
    decodeGame,
    buildJoinPlan: (input) => buildPlan(input, false),
    buildUnjoinPlan: (input) => buildPlan(input, true),
    buildClosePlan: async (input) => {
      const creatorTokenAccount = await getAssociatedTokenAddress(
        input.tokenMint,
        input.creator,
      );
      const setup = createAssociatedTokenAccountIdempotentInstruction(
        input.creator,
        creatorTokenAccount,
        input.creator,
        input.tokenMint,
        TOKEN_PROGRAM_ID,
      );
      const close = await client.getCloseGameInstructionAsync(
        {
          game: input.game,
          creator: createNoopSigner(input.creator),
          tokenMint: input.tokenMint,
          creatorTokenAccount,
        },
        { programAddress: programId },
      );
      return {
        instructions: [setup, close],
        playerTokenAccount: creatorTokenAccount,
      };
    },
    hasParticipant: async (game, player) => {
      return game.participantAddresses.includes(player);
    },
  };
}
