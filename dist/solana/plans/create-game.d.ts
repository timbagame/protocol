import { type Address, type Instruction } from "@solana/kit";
import type { TimbaGameType } from "./types.js";
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
export declare function buildCreateGamePlan(input: CreateGameInput, version: ContractVersion, programId: Address): Promise<{
    game: Address<string>;
    instructions: Instruction<string, readonly (import("@solana/kit").AccountLookupMeta<string, string> | import("@solana/kit").AccountMeta<string>)[]>[];
}>;
//# sourceMappingURL=create-game.d.ts.map