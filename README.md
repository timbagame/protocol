# `@timbagame/protocol`

Runtime-validated HTTP contracts and versioned on-chain artifacts shared by independently deployed Timba services.

The Contracts repository remains the source of truth for the Anchor program. This package publishes immutable IDL and generated type snapshots so each consumer uses the same artifact during staged upgrades. Third-party API schemas remain with their service adapters.

## Commands

```bash
bun install
bun run typecheck
bun test
bun run build
```

Import the smallest service boundary required by a consumer:

```ts
import { GenerateHashResponseSchema } from "@timbagame/protocol/oracle";
```

Select the deployed contract version explicitly. The lightweight registry does not import either IDL:

```ts
import {
  getContractCapabilities,
  parseContractVersion,
} from "@timbagame/protocol/contracts";
import {
  timbaIdlV020,
  type TimbaV020,
} from "@timbagame/protocol/contracts/v0.2.0";
import {
  fetchGame,
  getJoinGameInstructionAsync,
} from "@timbagame/protocol/contracts/v0.2.0/kit";

const version = parseContractVersion(process.env.CONTRACT_VERSION);
const capabilities = getContractCapabilities(version);
```

Import `@timbagame/protocol/contracts/v0.3.0` only in consumers that need the v0.3.0 IDL. There is intentionally no `latest` alias because both versions use the same program address and the active version must come from deployment configuration.

Each version also exposes a generated `@solana/kit` client from its `/kit`
subpath. Run `bun run generate:contracts` after updating an IDL snapshot and
commit the generated source and package output. CI verifies that both remain in
sync.

The v0.2.0 snapshot comes from Contracts tag `v0.2.0` (`bb81f1983473a0bf580f711386ec361519e1813c`). The v0.3.0 snapshot comes from Contracts commit `6c2bb07f9299704efee3bef840bb092857e7111e`. Copy both the Anchor IDL and its generated Anchor TypeScript type together when adding a contract version, then regenerate the Kit client.

Contract v0.3 consumers can read the Oracle-owned creation policy through the
authenticated `GET /token-policies` contract:

```ts
import { createRestClient, expectStatus } from "@timbagame/protocol/common";
import { oracleContract } from "@timbagame/protocol/oracle";

const oracle = createRestClient(oracleContract, {
  baseUrl: "https://oracle.example.com",
  getHeaders: (endpoint) =>
    endpoint.authenticated
      ? { Authorization: "Bearer <service-token>" }
      : undefined,
});
const result = await oracle.tokenPolicies();
const policies = expectStatus(result, 200).data.policies;
```

`signGameTransaction` returns typed creation-policy rejections at HTTP 422.
Generic validation, authentication, rate-limit, and service error responses keep
their existing schemas and status codes.

Create a typed REST client from the same contract used by the server:

```ts
import { createRestClient, expectStatus } from "@timbagame/protocol/common";
import { indexerContract } from "@timbagame/protocol/indexer";

const indexer = createRestClient(indexerContract, {
  baseUrl: "https://indexer.example.com",
});
const result = await indexer.games({
  query: { limit: 20, offset: 0 },
});
const games = expectStatus(result, 200).data.games;
```

The client validates parameters, queries, and bodies before sending them. It validates the JSON
response with the schema declared for the actual HTTP status. Declared error statuses remain typed;
unexpected statuses and invalid responses throw protocol errors.

## Private package release

1. Merge the intended changes and bump `package.json` using semantic versioning.
2. Create a GitHub Release with a `vX.Y.Z` tag that exactly matches the package version. For example, package version `1.2.3` requires tag `v1.2.3`.
3. The release workflow validates the package and publishes it privately to GitHub Packages.
4. After the first release, confirm that the package is private. In the package settings under **Manage Actions access**, grant read access only to `timbagame/web`, `timbagame/oracle`, and `timbagame/bot`.

Consumer workflows need `contents: read` and `packages: read`. Set `NODE_AUTH_TOKEN` to `${{ github.token }}` for `bun install`, and commit this token-free `.npmrc` in each consumer:

```ini
@timbagame:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

For local installation, supply a classic personal access token with `read:packages` through the `NODE_AUTH_TOKEN` environment variable. Never commit the token.

## Shared client behavior (0.8.0)

Use `@timbagame/protocol/amounts` for exact unsigned decimal-string and bigint
conversion. `parseTokenAmount` trims surrounding whitespace, accepts `.5` and
`1.`, permits zero, and rejects excess fractional digits instead of truncating.
Decimals must be integers from 0 through 255. `formatTokenAmount` preserves all
base units, including for zero-decimal tokens. Applications own positive-amount
requirements, safe-number conversion, rounding for display, and error wording.

Use `@timbagame/protocol/contracts/client` when a consumer supports both deployed
versions. `getContractClient(version)` selects the generated operations;
`decodeGame(version, bytes)` checks the account discriminator and participant
count; `getGameTypeName` normalizes the generated game enum. Literal versions
retain the complete generated types. Runtime version unions
broaden only instruction-builder address literals so either version can be called;
account-decoder overloads and RPC address inference remain intact. Import the explicit
version's `/kit` subpath when a single-version bundle matters.
Always pass deployment-specific `programAddress` to PDA and instruction builders.
Game random hashes must be exactly 32 bytes; service adapters validate them before
calling the generated PDA encoder.

`@timbagame/protocol/contracts/idl` owns `getContractIdl(version)`. The lightweight
`/contracts` capability registry still imports neither IDLs nor generated clients.

### Ownership and migration

- Bot, web, and Oracle use shared client/IDL selection. Bot and Oracle derive
  Timba PDAs with generated helpers; web already did so.
- Web maps decoded accounts to its presentation model. Bot converts Kit addresses
  to its PublicKey boundary. Oracle retains RPC orchestration and creation policy.
- Standard token/ATA and signer adapters remain local and use asynchronous Solana
  helpers. They are not a Timba protocol abstraction.
- Signing, wallet transaction setup, caching, storage, provider integrations, and
  presentation remain in their owning services.

Consumers pin the published `@timbagame/protocol@0.8.0` registry package in
`package.json` and `bun.lock`. Install it with `bun install --frozen-lockfile` using
the GitHub Packages authentication described above.

### Shared events, randomness, and token policy

`@timbagame/protocol/contracts/events` exports `decodeProgramEvent`,
`getTrustedProgramData`, and typed event data. Decode only data from the active
Timba invocation frame. Unknown events return null; malformed recognized layouts
throw. Consumers choose whether malformed history should abort indexing or be
skipped. Amounts and timestamps remain bigint. Historical PlayerUnjoined layouts
are supported alongside the v0.2/v0.3 events.

`@timbagame/protocol/randomness` exports `calculateWinner(secret, lastSlot, tickets)`
and the pure `createWinnerSeed`/`selectWinnerFromEntropy` functions for services
using a synchronous standard SHA-256 implementation. Seeds are 32-byte secrets
followed by an unsigned little-endian u64 slot. Selection matches the contract's
overlapping-window rejection sampling; secret storage remains application-owned.

`evaluateTokenPolicy` from `/oracle` checks mint support, enabled status, and the
accepted minimum, returning structured rejection codes. It does not fetch prices,
load metadata, or produce user-facing messages. `TokenPolicyInput` describes the
unvalidated wire input; `TokenPolicy` is the validated schema output.

## Cross-repository integration

The shared local-validator suite lives in the sibling `operations/integration` directory. Run `bun run test:integration --web` from `operations`; see its README for pinned toolchains, candidate protocol packages and optional manual GitHub runs. Normal CI does not run the combined system suite or require a cross-repository credential.

## Cross-chain game adapters

Import `observeSolanaGame`, `observeEvmGame`, `gameLifecycle`,
`normalizeSolanaMembership`, and `normalizeEvmMembership` from
`@timbagame/protocol/games`. These pure adapters accept decoded current Solana
v0.3 accounts or EVM Timba tuples. Existing Solana HTTP schemas and transaction
builders are unchanged.

Game references include the chain/network, deployment, and game identifier.
Amounts remain bigint token units. Expiry and the current Oracle buffer determine
join, settlement, and refund eligibility; these helpers describe timing, not
wallet authorization, token balances, or transaction success.

A missing account is unknown, never automatically completed. Supply a verified
indexed Solana terminal outcome to distinguish settlement from cancellation.
Bind that evidence to the same network/deployment and account incarnation in your
indexer: Solana commitment-derived PDAs can be reused after closure. Fetch errors
must not be converted into terminal outcomes.

Solana commitments are not present in the Game account; pass the indexed creation
commitment when available. Entropy positions retain their slot/block distinction.
Use the versioned Solana and EVM randomness verifiers below. Their formulas
are intentionally different.

Membership adapters consume decoded events. EVM refunds require the new
`removedIndex` and `movedParticipant` event fields; a zero moved address becomes
null. Keep events in canonical chain order and handle reorgs before applying them.
Historical Solana event versions without swap-removal information require their
version-specific reconstruction rules.

## Versioned chain interfaces

| Import                                         | Purpose                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `@timbagame/protocol/solana`                   | Existing Solana version/capability metadata                              |
| `@timbagame/protocol/solana/v0.3.0`            | Solana IDL and Anchor types                                              |
| `@timbagame/protocol/solana/v0.3.0/kit`        | Generated Solana transaction builders                                    |
| `@timbagame/protocol/solana/v0.3.0/randomness` | Solana SHA-256/slot verifier                                             |
| `@timbagame/protocol/evm`                      | EVM interface versions and deployment type                               |
| `@timbagame/protocol/evm/v0.1.0`               | Typed ABI, transaction builders, EIP-712 payloads, randomness and events |
| `@timbagame/protocol/evm/v0.1.0/abi`           | Raw JSON ABI                                                             |
| `@timbagame/protocol/games`                    | Shared observations, lifecycle and normalized event types                |

Existing `contracts/*` and `randomness` exports remain compatible. The new Solana
paths are aliases, not a second copy of generated code. Solana imports do not
load viem. EVM v0.1.0 identifies the initial, not-yet-deployed Solidity interface;
it is separate from the protocol package version and EIP-712 domain version.

```ts
import {
  creationTypedData,
  createGameTransaction,
} from "@timbagame/protocol/evm/v0.1.0";

// proxy is the configured proxy address, never the implementation address.
const deployment = { chainId: 8453, address: proxy, version: "0.1.0" } as const;
const payload = creationTypedData(deployment, request);
const signature = await operatorWallet.signTypedData(payload);
const transaction = createGameTransaction(deployment, request, signature, true);
// Submit with the creator's wallet on deployment.chainId.
```

Transaction helpers only encode calls. They do not fetch nonces, estimate fees,
sign, broadcast, retry or select an RPC. Fetch the current creator nonce and
validate off-chain token/game policy before signing. Use `privateJoinTypedData`
for private-entry signatures; public joins omit authorization.
Amounts and nonces are bigint. Approval amounts are explicit; no helper silently
grants unlimited allowances.

`calculateEvmWinner` verifies the SHA-256 commitment and reproduces Solidity's
domain-separated Keccak/rejection-sampling algorithm. Pass the stored
`lastEntryBlock`, not an assumed RPC block height. Its result verifies selection,
not whether settlement is currently authorized or timely. Do not expose unrevealed
secrets through public simulation services.

`decodeEvmGameEvent` accepts raw logs, checks chain ID and emitting proxy, and
rejects removed or malformed recognized logs. `normalizeSolanaGameEvent` consumes
decoded events from trusted program logs. Both cover creation, joins, refunds,
completion and closure. Unavailable event fields are null, not guessed. Callers
retain transaction/block/log identities, canonical ordering and reorg rollback.

A proxy address does not identify an immutable implementation. Maintain the
interface version by deployment and upgrade block in the application, and select
the versioned decoder accordingly. There is no automatic on-chain version
discovery or hardcoded production deployment registry.

## EVM artifact maintenance

The JSON ABI is copied from the public contracts artifact. `source.json` records
its source commit and SHA-256. Generate its literal TypeScript ABI with
`bun run generate:evm`. This preserves viem's inferred argument and event types.

Before updating the pinned artifact, review interface compatibility and select
the appropriate contract version. Update the source metadata, regenerate the
typed ABI and distribution, then check the intended local contracts checkout:

```bash
bun run check:evm-upstream /path/to/contracts
bun run generate:evm
bun run build
bun test
```

Solidity-generated client vectors are committed in both repositories and tested
against their implementations. Contracts regenerates/checks them with its
`ClientVectors` script/test. Protocol CI verifies the committed ABI, generated
TypeScript, distribution and vectors without cloning another repository.
The optional upstream check compares both ABI and vectors; an offline CI run
cannot discover unimported upstream changes.
