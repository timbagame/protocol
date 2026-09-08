import { type Hex, type Address } from "viem";
import type { EvmDeployment } from "../index.js";
import type { NormalizedGameEvent } from "../../games/events.js";
/** Require logs from the selected chain; removed logs must be rolled back by the indexer. */
export declare function decodeEvmGameEvent(deployment: EvmDeployment, log: {
    chainId: number;
    address: Address;
    data: Hex;
    topics: readonly Hex[];
    removed?: boolean;
}): NormalizedGameEvent | null;
//# sourceMappingURL=events.d.ts.map