import { type Address, type Instruction } from "@solana/kit";
import type { TimbaGameAccount } from "./types.js";
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
    buildClosePlan(input: CloseGameInstructionInput): Promise<GameInstructionPlan>;
    hasParticipant(game: TimbaGameAccount, player: Address): Promise<boolean>;
}
export declare function createContractAdapter(version: ContractVersion, programId: Address): TimbaContractAdapter;
//# sourceMappingURL=contract-adapter.d.ts.map