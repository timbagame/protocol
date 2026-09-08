import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

// Explicit local checkout only; ordinary CI needs neither network nor sibling repos.
const root = process.argv[2];
if (!root)
  throw new Error("Usage: bun run check:evm-upstream /path/to/contracts");
const canonical = JSON.parse(
  await readFile(resolve(root, "evm/abi/Timba.json"), "utf8"),
);
const packaged = JSON.parse(
  await readFile(
    resolve(import.meta.dir, "../src/evm/v0.1.0/timba.json"),
    "utf8",
  ),
);
if (JSON.stringify(canonical) !== JSON.stringify(packaged))
  throw new Error("EVM ABI differs from contracts");
console.log("Packaged EVM ABI matches the supplied contracts checkout.");

const vector = JSON.parse(
  await readFile(resolve(root, "evm/test/fixtures/client-v1.json"), "utf8"),
);
const localVector = JSON.parse(
  await readFile(
    resolve(import.meta.dir, "../tests/fixtures/evm-client-v1.json"),
    "utf8",
  ),
);
if (JSON.stringify(vector) !== JSON.stringify(localVector))
  throw new Error("EVM client vectors differ from contracts");
console.log("Client vectors match the supplied contracts checkout.");
