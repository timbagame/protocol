import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { httpFixtures } from "../scripts/rust-http-fixtures.js";
import { games, evmFixtures } from "../scripts/fixtures/rust-games.js";

for (const [name, build] of [
  ["http.json", httpFixtures],
  ["games.json", games],
  ["evm.json", evmFixtures],
] as const) {
  test(`TypeScript ${name} matches the committed Rust parity fixture`, async () => {
    const expected = JSON.parse(
      readFileSync(
        join(import.meta.dir, "../crates/timba-protocol/tests/fixtures", name),
        "utf8",
      ),
    );
    expect(JSON.parse(JSON.stringify(await build()))).toEqual(expected);
  });
}
