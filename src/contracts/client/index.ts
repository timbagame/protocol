import * as v020 from "../v0.2.0/generated/index.js";
import * as v030 from "../v0.3.0/generated/index.js";
import { isContractVersion, type ContractVersion } from "../index.js";
import type { ReadonlyUint8Array } from "@solana/kit";

const clients = { "0.2.0": v020, "0.3.0": v030 } as const;

// Runtime selection cannot preserve a particular version's generic address literals.
// Keep parameter and result types; direct versioned exports retain full inference.
type RuntimeClient<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => infer R
    ? (...args: A) => R
    : T[K];
};

/** Use explicit version exports when only one deployment version is needed. */
export function getContractClient<V extends ContractVersion>(
  version: V,
): RuntimeClient<(typeof clients)[V]> {
  if (!isContractVersion(version))
    throw new Error(`Unsupported contract version: ${version}`);
  return clients[version] as RuntimeClient<(typeof clients)[V]>;
}

export type DecodedGame = v020.Game | v030.Game;

export function decodeGame(
  version: ContractVersion,
  data: ReadonlyUint8Array,
): DecodedGame {
  const client = getContractClient(version);
  if (client.identifyTimbaAccount(data) !== client.TimbaAccount.Game) {
    throw new Error("Account is not a Timba game");
  }
  const game = client.getGameDecoder().decode(data);
  if (game.participants.length !== game.ticketsCount) {
    throw new Error("Timba participant count does not match the game account");
  }
  return game;
}

/** Generated game enums have the same wire values in both supported versions. */
export function getGameTypeName(
  gameType: DecodedGame["gameType"],
): "coinflip" | "giveaway" {
  switch (gameType) {
    case v020.GameType.Coinflip:
      return "coinflip";
    case v020.GameType.Giveaway:
      return "giveaway";
    default:
      throw new Error(`Unsupported game type: ${gameType}`);
  }
}
