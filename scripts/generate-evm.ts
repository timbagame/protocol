import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { format, resolveConfig } from "prettier";

const root = resolve(import.meta.dir, "..");
const folder = resolve(root, "src/evm/v0.1.0");
const abi = JSON.parse(await readFile(resolve(folder, "timba.json"), "utf8"));
const source =
  "// Generated from timba.json. Do not edit by hand.\n" +
  'import type { Abi } from "viem";\n' +
  "export const timbaAbi = " +
  JSON.stringify(abi, null, 2) +
  " as const satisfies Abi;\n";
await writeFile(
  resolve(folder, "abi.ts"),
  await format(source, {
    ...(await resolveConfig(root)),
    parser: "typescript",
  }),
);
