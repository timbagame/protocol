import * as v020 from "../v0.2.0/generated/index.js";
import * as v030 from "../v0.3.0/generated/index.js";
import { isContractVersion, type ContractVersion } from "../index.js";
import type {
  Account,
  EncodedAccount,
  MaybeAccount,
  MaybeEncodedAccount,
  ReadonlyUint8Array,
} from "@solana/kit";

const clients = { "0.2.0": v020, "0.3.0": v030 } as const;

// Only instruction builders need their generic address literals widened when
// selecting between versions. Keep account-decoder overloads and RPC generics.
type RuntimeClient<T> = {
  [K in keyof T]: K extends
    `get${string}Instruction` | `get${string}InstructionAsync`
    ? T[K] extends (...args: infer A) => infer R
      ? (...args: A) => R
      : T[K]
    : T[K];
};

type AccountDecoder<T extends object> = {
  <A extends string = string>(account: EncodedAccount<A>): Account<T, A>;
  <A extends string = string>(
    account: MaybeEncodedAccount<A>,
  ): MaybeAccount<T, A>;
};

// A union of overloaded generic decoders is not callable in TypeScript. Expose
// the same two overloads once, with the union of the supported account layouts.
type RuntimeDecoders = {
  decodeGame: AccountDecoder<v020.Game | v030.Game>;
  decodeOracle: AccountDecoder<v020.Oracle | v030.Oracle>;
};

type SelectedClient<V extends ContractVersion> = ContractVersion extends V
  ? Omit<RuntimeClient<(typeof clients)[V]>, keyof RuntimeDecoders> &
      RuntimeDecoders
  : (typeof clients)[V];

/** Use explicit version exports when only one deployment version is needed. */
export function getContractClient<V extends ContractVersion>(
  version: V,
): SelectedClient<V> {
  if (!isContractVersion(version))
    throw new Error(`Unsupported contract version: ${version}`);
  return clients[version] as SelectedClient<V>;
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
