# Parity fixtures

These JSON files come from this repository's TypeScript package, so the Rust
crate is checked byte for byte against it.

| Fixture         | Covers                                                     | Checked by            |
| --------------- | ---------------------------------------------------------- | --------------------- |
| `plans.json`    | Create, join, unjoin and close plans for v0.2.0 and v0.3.0 | `tests/kit_parity.rs` |
| `complete.json` | `completeGame` instructions for v0.2.0 and v0.3.0          | `tests/kit_parity.rs` |

`scripts/generate-rust-fixtures.ts` writes them from `src/`. After changing
the TypeScript package, regenerate them and commit the result:

```sh
bun run generate:rust-fixtures
```

CI runs `bun run check:rust-fixtures`, which fails when a committed fixture no
longer matches the TypeScript output.
