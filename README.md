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
