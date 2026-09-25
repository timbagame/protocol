# @timbagame/protocol

The shared TypeScript layer behind [Timba](https://timba.cc), a platform for multiplayer coinflips and giveaways on Solana, played on the web or in Telegram.

This package holds everything Timba services need to agree on:

- Versioned Solana program interfaces (IDL, Anchor types and generated `@solana/kit` clients)
- The EVM contract ABI, transaction builders and EIP-712 payloads
- Runtime-validated HTTP contracts for the oracle, indexer, bot and web services
- Pure helpers for token amounts, game lifecycle and winner verification

It is also the easiest way to check a Timba game result yourself. The winner math in `randomness` is the same calculation the on-chain program performs.

The programs themselves live in [timbagame/contracts](https://github.com/timbagame/contracts).

## Install

Releases are published to GitHub Packages. Point the `@timbagame` scope at that registry:

```ini
# .npmrc
@timbagame:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

GitHub Packages requires a token for every install, even for public packages. Set `NODE_AUTH_TOKEN` to a GitHub token with the `read:packages` scope, then install:

```bash
bun add @timbagame/protocol
# or: npm install @timbagame/protocol
```

In GitHub Actions, `NODE_AUTH_TOKEN: ${{ github.token }}` works when the workflow has `packages: read`. Never commit a token.

## Verify a game result

Every Timba game commits to the SHA-256 hash of a 32-byte secret before anyone joins. When the game settles, the oracle reveals the secret and the program picks the winner from that secret and the game's final Solana slot:

1. Check that `sha256(secret)` matches the commitment published when the game was created.
2. Build a 40-byte seed: the secret followed by the final slot as a little-endian u64.
3. Hash the seed with SHA-256 to get 32 bytes of entropy.
4. Read little-endian u64 windows from the entropy until one falls below the largest multiple of the ticket count. This rejection step keeps every ticket equally likely.
5. The winner is at position `value % tickets` in the participant list.

```ts
import { calculateWinner } from "@timbagame/protocol/randomness";

const { winnerIndex } = await calculateWinner(
  secret,
  lastSlot,
  BigInt(tickets),
);
```

`validateVerifiedGame` from `@timbagame/protocol/web` runs the full check on a published proof: commitment, game address, ticket positions and winner. It only confirms that the supplied inputs are consistent with each other, so a fabricated proof could still pass. To confirm a result, take the secret, final slot and participant list from the chain itself: open the creation, join and settlement transactions the proof references in a Solana explorer or on your own RPC node, check that they belong to the same game account, and run the calculation on those values.

The EVM contract uses a different, domain-separated formula. Use `calculateEvmWinner` from `@timbagame/protocol/evm/v0.1.0` for EVM games.

## What's inside

| Import                                     | Contents                                                                 |
| ------------------------------------------ | ------------------------------------------------------------------------ |
| `@timbagame/protocol/contracts`            | Supported Solana contract versions and their capabilities                |
| `@timbagame/protocol/contracts/v0.2.0`     | v0.2.0 IDL and Anchor types                                              |
| `@timbagame/protocol/contracts/v0.3.0`     | v0.3.0 IDL and Anchor types                                              |
| `@timbagame/protocol/contracts/v0.3.0/kit` | Generated `@solana/kit` instruction builders, accounts and PDAs          |
| `@timbagame/protocol/contracts/client`     | Pick the generated client for a runtime version, decode games            |
| `@timbagame/protocol/contracts/events`     | Decode program events from transaction logs                              |
| `@timbagame/protocol/solana/plans`         | Create, join, unjoin and close transaction plans, with no RPC or signing |
| `@timbagame/protocol/randomness`           | Solana winner calculation                                                |
| `@timbagame/protocol/evm/v0.1.0`           | EVM ABI, transaction builders, EIP-712 payloads, events and randomness   |
| `@timbagame/protocol/games`                | Chain-neutral game lifecycle, drafts and event normalization             |
| `@timbagame/protocol/amounts`              | Exact decimal string and bigint conversion                               |
| `@timbagame/protocol/common`               | Typed REST client for the service contracts below                        |
| `@timbagame/protocol/oracle`               | Oracle HTTP schemas and token policy evaluation                          |
| `@timbagame/protocol/indexer`              | Indexer HTTP schemas                                                     |
| `@timbagame/protocol/web`                  | Web API schemas and game proof validation                                |
| `@timbagame/protocol/bot`                  | Bot HTTP schemas                                                         |

Each `contracts/*` path also has a `solana/*` alias. Import the narrowest path you need: the Solana entry points do not load `viem`, and the version registry loads no IDL.

## Usage

### Pick a contract version

Two Solana program versions share one program address, so the version must come from your deployment configuration. There is deliberately no `latest` alias.

```ts
import {
  getContractCapabilities,
  parseContractVersion,
} from "@timbagame/protocol/contracts";
import { getContractClient } from "@timbagame/protocol/contracts/client";

const version = parseContractVersion(process.env.CONTRACT_VERSION);
const capabilities = getContractCapabilities(version);
const client = getContractClient(version);
```

Always pass the deployment's `programAddress` to PDA and instruction builders.

### Call a service with a typed client

The same contract object describes the server and the client. Requests are validated before they are sent, and responses are validated against the schema for the status code that came back.

```ts
import { createRestClient, expectStatus } from "@timbagame/protocol/common";
import { indexerContract } from "@timbagame/protocol/indexer";

const indexer = createRestClient(indexerContract, {
  baseUrl: "https://indexer.example.com",
});
const result = await indexer.games({ query: { limit: 20, offset: 0 } });
const games = expectStatus(result, 200).data.games;
```

### Handle token amounts

```ts
import {
  formatTokenAmount,
  parseTokenAmount,
} from "@timbagame/protocol/amounts";

parseTokenAmount("1.5", 9); // 1500000000n
formatTokenAmount(1500000000n, 9); // "1.5"
```

`parseTokenAmount` rejects extra fractional digits instead of rounding them away.

### Build an EVM transaction

```ts
import {
  creationTypedData,
  createGameTransaction,
} from "@timbagame/protocol/evm/v0.1.0";

// Use the proxy address, not the implementation address.
const deployment = { chainId: 8453, address: proxy, version: "0.1.0" } as const;
const signature = await operatorWallet.signTypedData(
  creationTypedData(deployment, request),
);
const transaction = createGameTransaction(deployment, request, signature, true);
```

Transaction helpers only encode calls. Fetching nonces, estimating fees, signing and broadcasting stay with the caller, and no helper grants an unlimited token allowance.

## Design notes

- **No hidden side effects.** The transaction, lifecycle, amount and verification helpers are pure: they read no environment variables, open no RPC connections, and never sign, store data or retry. The one exception is the REST client from `common`, which sends HTTP requests with `fetch` (or the one you pass in).
- **On-chain amounts are `bigint`.** Contract clients, transaction plans and game helpers keep token units exact. Some older indexer and web API fields, such as `ticketAmount`, `totalAmount` and the verified-game prize and fee, are plain JSON numbers, so treat them as display values rather than exact amounts.
- **A missing account is not a result.** A closed Solana game account is reported as unknown until indexed evidence says whether it settled or was cancelled. Game addresses can be reused after closure, so tie that evidence to the same deployment and account lifetime.
- **Events need canonical order.** Apply decoded events in chain order and roll back on reorgs before passing them to the membership helpers.

## Development

Requires [Bun](https://bun.sh) 1.4.2.

```bash
bun install
bun run typecheck
bun test
bun run build
```

Generated code and the built `dist` folder are committed, and CI fails if they drift from their sources.

| Change                         | Then run                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------- |
| New or updated Solana IDL      | Copy the IDL and its Anchor type together, then `bun run generate:contracts` |
| New or updated EVM ABI         | Update `src/evm/v0.1.0/source.json`, then `bun run generate:evm`             |
| Compare EVM artifacts upstream | `bun run check:evm-upstream /path/to/contracts`                              |
| Anything under `src`           | `bun run build`, then commit `dist`                                          |

Solana IDL snapshots come from tagged commits in the contracts repository. The EVM ABI records its source commit and SHA-256 in `source.json`.

## Releases

Each release is a normal pull request that bumps `version` in `package.json`. When it merges into `main` and CI passes, the release workflow publishes that version. Published versions are immutable, so any fix ships as a new version.

## Related

- [timbagame/contracts](https://github.com/timbagame/contracts): the Solana and EVM programs
- [timba.cc](https://timba.cc): play on the web and verify games
- [@playtimbabot](https://t.me/playtimbabot): play in Telegram

## License

[MIT](LICENSE)
