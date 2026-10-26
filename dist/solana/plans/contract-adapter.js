import { createNoopSigner } from "@solana/kit";
import { decodeGame as decodeContractGame, getContractClient, getGameTypeName, } from "../../contracts/client/index.js";
import { buildWrapSolInstructions, isWrappedSol } from "./wsol.js";
import { TOKEN_PROGRAM_ID, createAssociatedTokenAccountIdempotentInstruction, getAssociatedTokenAddress, } from "./token-program.js";
import * as v020 from "../../contracts/v0.2.0/generated/index.js";
import * as v030 from "../../contracts/v0.3.0/generated/index.js";
function mapGame(address, account) {
    const type = getGameTypeName(account.gameType);
    const createdAt = Number(account.createdAt);
    return {
        address,
        creator: account.creator,
        type,
        tokenMint: account.tokenMint,
        stakeAmount: type === "coinflip" ? account.ticketAmount : 0n,
        prizeAmount: type === "giveaway" ? account.ticketAmount : account.totalAmount,
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
export function createContractAdapter(version, programId) {
    const client = getContractClient(version);
    const decodeGame = (address, data) => mapGame(address, decodeContractGame(version, data));
    const buildPlan = async (input, refund) => {
        const playerTokenAccount = await getAssociatedTokenAddress(input.tokenMint, input.player);
        const authority = input.authority ?? input.player;
        const refundAccounts = {
            game: input.game,
            player: input.player,
            authority: createNoopSigner(authority),
            tokenMint: input.tokenMint,
            playerTokenAccount,
        };
        const instruction = refund
            ? version === "0.2.0"
                ? await v020.getUnjoinGameInstructionAsync(refundAccounts, {
                    programAddress: programId,
                })
                : await v030.getRefundPlayerInstructionAsync(refundAccounts, {
                    programAddress: programId,
                })
            : await client.getJoinGameInstructionAsync({
                game: input.game,
                player: createNoopSigner(input.player),
                tokenMint: input.tokenMint,
                playerTokenAccount,
            }, { programAddress: programId });
        const setup = createAssociatedTokenAccountIdempotentInstruction(refund ? authority : input.player, playerTokenAccount, input.player, input.tokenMint, TOKEN_PROGRAM_ID);
        const instructions = [setup];
        if (!refund && isWrappedSol(input.tokenMint)) {
            if (!input.tokenAmount || input.tokenAmount <= 0n) {
                throw new Error("SOL joins require a positive stake amount");
            }
            instructions.push(...(await buildWrapSolInstructions(input.player, input.tokenAmount)).instructions.slice(1));
        }
        instructions.push(instruction);
        return { instructions, playerTokenAccount };
    };
    return {
        decodeGame,
        buildJoinPlan: (input) => buildPlan(input, false),
        buildRefundPlan: (input) => buildPlan(input, true),
        buildClosePlan: async (input) => {
            const creatorTokenAccount = await getAssociatedTokenAddress(input.tokenMint, input.creator);
            const setup = createAssociatedTokenAccountIdempotentInstruction(input.creator, creatorTokenAccount, input.creator, input.tokenMint, TOKEN_PROGRAM_ID);
            const close = await client.getCloseGameInstructionAsync({
                game: input.game,
                creator: createNoopSigner(input.creator),
                tokenMint: input.tokenMint,
                creatorTokenAccount,
            }, { programAddress: programId });
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
//# sourceMappingURL=contract-adapter.js.map