import { expect, spyOn, test } from "bun:test";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const script = resolve(import.meta.dir, "../scripts/check-evm-upstream.ts");
const packagedAbi = resolve(import.meta.dir, "../src/evm/v0.1.0/timba.json");
const packagedVector = resolve(import.meta.dir, "fixtures/evm-client-v1.json");

async function writeCheckout(
  checkout: string,
  abi: unknown,
  vector: unknown,
): Promise<void> {
  await mkdir(join(checkout, "evm/abi"), { recursive: true });
  await mkdir(join(checkout, "evm/test/fixtures"), { recursive: true });
  await writeFile(join(checkout, "evm/abi/Timba.json"), JSON.stringify(abi));
  await writeFile(
    join(checkout, "evm/test/fixtures/client-v1.json"),
    JSON.stringify(vector),
  );
}

// The script runs on import, so each case loads a fresh module instance. The
// cases share one test so the passing run is always last, independent of
// --randomize, which keeps its line data in the coverage report.
test("compares a contracts checkout against the packaged ABI and vectors", async () => {
  const originalArgv = process.argv;
  const checkout = await mkdtemp(join(tmpdir(), "timba-evm-upstream-"));
  const log = spyOn(console, "log").mockImplementation(() => {});
  let runs = 0;
  const run = (...args: string[]) => {
    process.argv = [originalArgv[0]!, script, ...args];
    runs += 1;
    return import(`${script}?run=${runs}`);
  };
  try {
    const abi = await Bun.file(packagedAbi).json();
    const vector = await Bun.file(packagedVector).json();

    await expect(run()).rejects.toThrow(
      "Usage: bun run check:evm-upstream /path/to/contracts",
    );

    await writeCheckout(checkout, [], vector);
    await expect(run(checkout)).rejects.toThrow(
      "EVM ABI differs from contracts",
    );

    await writeCheckout(checkout, abi, { changed: true });
    await expect(run(checkout)).rejects.toThrow(
      "EVM client vectors differ from contracts",
    );

    log.mockClear();
    await writeCheckout(checkout, abi, vector);
    await run(checkout);
    expect(log.mock.calls.map(([line]) => line)).toEqual([
      "Packaged EVM ABI matches the supplied contracts checkout.",
      "Client vectors match the supplied contracts checkout.",
    ]);
  } finally {
    log.mockRestore();
    process.argv = originalArgv;
    await rm(checkout, { recursive: true, force: true });
  }
});
