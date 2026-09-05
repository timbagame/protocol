import * as v020 from "../v0.2.0/generated/index.js";
import * as v030 from "../v0.3.0/generated/index.js";
import { type ContractVersion } from "../index.js";
import type { ReadonlyUint8Array } from "@solana/kit";
declare const clients: {
    readonly "0.2.0": typeof v020;
    readonly "0.3.0": typeof v030;
};
type RuntimeClient<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (...args: A) => R : T[K];
};
/** Use explicit version exports when only one deployment version is needed. */
export declare function getContractClient<V extends ContractVersion>(version: V): RuntimeClient<(typeof clients)[V]>;
export type DecodedGame = v020.Game | v030.Game;
export declare function decodeGame(version: ContractVersion, data: ReadonlyUint8Array): DecodedGame;
/** Generated game enums have the same wire values in both supported versions. */
export declare function getGameTypeName(gameType: DecodedGame["gameType"]): "coinflip" | "giveaway";
export {};
//# sourceMappingURL=index.d.ts.map