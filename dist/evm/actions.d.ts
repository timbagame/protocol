import type { EvmGame } from "../games/index.js";
/** Mirror caller permissions separately from lifecycle timing; simulation remains authoritative. */
export declare function evmGameActions(game: EvmGame, account: string | null, now: bigint, buffer: bigint): {
    creator: boolean;
    participant: boolean;
    join: boolean;
    refund: boolean;
    close: boolean;
};
//# sourceMappingURL=actions.d.ts.map