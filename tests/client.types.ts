// Compile-time regression tests; checked by `bun run typecheck` without RPC calls.
import type {
  Account,
  Address,
  EncodedAccount,
  MaybeAccount,
  MaybeEncodedAccount,
} from "@solana/kit";
import { getContractClient } from "../src/contracts/client/index.js";
import type { ContractVersion } from "../src/contracts/index.js";
import type * as V020 from "../src/contracts/v0.2.0/generated/index.js";
import type * as V030 from "../src/contracts/v0.3.0/generated/index.js";

function expectType<T>(value: T): void {
  void value;
}

type TestAddress = "11111111111111111111111111111111";

export function checkClientTypes(
  existing: EncodedAccount<TestAddress>,
  maybe: MaybeEncodedAccount<TestAddress>,
  version: ContractVersion,
  rpc: Parameters<typeof V030.fetchGame>[0],
  address: Address<TestAddress>,
): void {
  const legacy = getContractClient("0.2.0");
  const current = getContractClient("0.3.0");
  const selected = getContractClient(version);
  expectType<typeof V020>(legacy);
  expectType<typeof V030>(current);

  expectType<Account<V020.Game, TestAddress>>(legacy.decodeGame(existing));
  expectType<Account<V030.Game, TestAddress>>(current.decodeGame(existing));
  expectType<Account<V020.Game | V030.Game, TestAddress>>(
    selected.decodeGame(existing),
  );
  expectType<MaybeAccount<V020.Game, TestAddress>>(legacy.decodeGame(maybe));
  expectType<MaybeAccount<V030.Game, TestAddress>>(current.decodeGame(maybe));
  expectType<MaybeAccount<V020.Game | V030.Game, TestAddress>>(
    selected.decodeGame(maybe),
  );
  // A possibly missing account must not acquire the known-existing overload.
  // @ts-expect-error The caller must check existence before reading data.
  selected.decodeGame(maybe).data;

  expectType<Account<V020.Oracle | V030.Oracle, TestAddress>>(
    selected.decodeOracle(existing),
  );
  expectType<MaybeAccount<V020.Oracle | V030.Oracle, TestAddress>>(
    selected.decodeOracle(maybe),
  );
  expectType<Account<V020.GameToken, TestAddress>>(
    legacy.decodeGameToken(existing),
  );
  expectType<MaybeAccount<V020.GameToken, TestAddress>>(
    legacy.decodeGameToken(maybe),
  );
  expectType<Promise<Account<V020.Game | V030.Game, TestAddress>>>(
    selected.fetchGame(rpc, address),
  );
}
