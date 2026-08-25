# `@timbagame/protocol`

Runtime-validated HTTP contracts shared by independently deployed Timba services.

This package contains only JSON wire formats owned by Timba. The Anchor IDL remains the source of truth for the on-chain program, and third-party API schemas remain with their service adapters.

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
