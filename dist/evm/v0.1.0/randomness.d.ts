import { type Hex } from "viem";
import type { EvmDeployment } from "../index.js";
export declare const EVM_RANDOMNESS_VERSION: "keccak256-domain-block-u256-v1";
export declare function commitmentFor(secret: Hex): Hex;
export declare function selectEvmWinnerFromEntropy(initialEntropy: Hex, participants: number): {
    randomValue: bigint;
    winnerIndex: number;
};
export declare function calculateEvmWinner(deployment: EvmDeployment, gameId: Hex, secret: Hex, commitment: Hex, lastEntryBlock: bigint, participants: number): {
    randomValue: bigint;
    winnerIndex: number;
};
//# sourceMappingURL=randomness.d.ts.map