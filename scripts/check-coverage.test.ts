import { expect, spyOn, test } from "bun:test";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { checkCoverage, main } from "./check-coverage";

async function git(root: string, ...args: string[]): Promise<void> {
  const result = Bun.spawnSync(["git", ...args], { cwd: root, stderr: "pipe" });
  if (result.exitCode !== 0)
    throw new Error(new TextDecoder().decode(result.stderr));
}

function report(hits: Iterable<number>, source = "src/a.ts"): string {
  const covered = new Set(hits);
  return `SF:${source}\n${Array.from({ length: 100 }, (_, index) => {
    const line = index + 1;
    return `DA:${line},${covered.has(line) ? 1 : 0}`;
  }).join("\n")}\nend_of_record\n`;
}

const lines = (count: number) =>
  Array.from({ length: count }, (_, index) => index + 1);

async function repository(prefix: string): Promise<string> {
  const root = await mkdtemp(join(tmpdir(), prefix));
  await mkdir(join(root, "src"));
  await writeFile(join(root, "src/a.ts"), "synthetic\n".repeat(100));
  await git(root, "init", "-q");
  await git(root, "add", ".");
  return root;
}

test("enforces the threshold and validates merged LCOV reports", async () => {
  const root = await repository("timba-coverage-gate-");
  try {
    const config: Parameters<typeof checkCoverage>[0] = {
      roots: ["src"],
      extensions: [".ts"],
    };
    const low = join(root, "low.info");
    const full = join(root, "full.info");
    const rest = join(root, "rest.info");
    await writeFile(low, report(lines(99)));
    await writeFile(full, report(lines(100)));
    await writeFile(rest, report([100]));
    expect(await checkCoverage(config, [low], root)).toEqual({
      threshold: 100,
      covered: 99,
      total: 100,
      percent: 99,
      missing: [],
      passed: false,
    });
    expect((await checkCoverage(config, [full], root)).passed).toBe(true);
    expect((await checkCoverage(config, [low, rest], root)).passed).toBe(true);

    const bad = join(root, "bad.info");
    await writeFile(bad, "SF:src/a.ts\nDA:1,-1\nend_of_record\n");
    await expect(checkCoverage(config, [bad], root)).rejects.toThrow(
      "Invalid LCOV line data",
    );

    await writeFile(join(root, "src/tiny.ts"), "synthetic");
    await git(root, "add", ".");
    const weighted = join(root, "weighted.info");
    await writeFile(
      weighted,
      `${await Bun.file(low).text()}SF:src/tiny.ts\nDA:1,1\nend_of_record\n`,
    );
    expect((await checkCoverage(config, [weighted], root)).passed).toBe(false);
    config.exclude = ["src/tiny.ts"];

    await expect(
      checkCoverage(config, [join(root, "absent")], root),
    ).rejects.toThrow();
    const empty = join(root, "empty.info");
    await writeFile(empty, "");
    await expect(checkCoverage(config, [full, empty], root)).rejects.toThrow(
      "No scoped line data",
    );

    await writeFile(join(root, "src/missing.ts"), "synthetic");
    await git(root, "add", ".");
    expect(await checkCoverage(config, [full], root)).toMatchObject({
      missing: ["src/missing.ts"],
      passed: false,
    });
    config.exclude = ["src/tiny.ts", "src/missing.ts"];
    expect((await checkCoverage(config, [full], root)).passed).toBe(true);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("resolves report paths and rejects unusable inputs", async () => {
  const root = await repository("timba-coverage-inputs-");
  try {
    const config: Parameters<typeof checkCoverage>[0] = {
      roots: ["src/"],
      extensions: [".ts"],
    };
    const absolute = join(root, "absolute.info");
    await writeFile(absolute, report(lines(100), join(root, "src/a.ts")));
    expect((await checkCoverage(config, [absolute], root)).passed).toBe(true);

    // Reports written from a subdirectory resolve against reportBase.
    const nested = join(root, "nested.info");
    await writeFile(nested, report(lines(100), "../src/a.ts"));
    expect(
      (await checkCoverage({ ...config, reportBase: "pkg" }, [nested], root))
        .passed,
    ).toBe(true);

    // Files outside the repository never count towards scoped lines.
    const outside = join(root, "outside.info");
    await writeFile(outside, report(lines(100), "../elsewhere/a.ts"));
    await expect(checkCoverage(config, [outside], root)).rejects.toThrow(
      `No scoped line data in ${outside}`,
    );

    for (const entry of ["DA:x,1", "DA:1,y", "DA:1", "DA:0,1"]) {
      const invalid = join(root, "invalid.info");
      await writeFile(invalid, `SF:src/a.ts\n${entry}\nend_of_record\n`);
      await expect(checkCoverage(config, [invalid], root)).rejects.toThrow(
        "Invalid LCOV line data",
      );
    }

    await expect(checkCoverage(config, [], root)).rejects.toThrow(
      "No instrumented source lines in coverage reports",
    );
    await expect(
      checkCoverage({ roots: ["lib"], extensions: [".ts"] }, [absolute], root),
    ).rejects.toThrow("No source files matched the coverage scope");
    await expect(
      checkCoverage({ roots: ["."], extensions: [".rs"] }, [absolute], root),
    ).rejects.toThrow("No source files matched the coverage scope");

    const untracked = await mkdtemp(join(tmpdir(), "timba-coverage-nogit-"));
    try {
      await expect(
        checkCoverage(config, [absolute], untracked),
      ).rejects.toThrow("Unable to list tracked source files");
    } finally {
      await rm(untracked, { recursive: true, force: true });
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("main reports the gate result through its exit code and output", async () => {
  const root = await repository("timba-coverage-main-");
  const cwd = process.cwd();
  const log = spyOn(console, "log").mockImplementation(() => {});
  const error = spyOn(console, "error").mockImplementation(() => {});
  try {
    process.chdir(root);
    await writeFile(
      "scope.json",
      JSON.stringify({ roots: ["src"], extensions: [".ts"] }),
    );
    await writeFile("full.info", report(lines(100)));
    await writeFile("partial.info", report(lines(99)));

    expect(await main([])).toBe(2);
    expect(await main(["scope.json"])).toBe(2);
    expect(error.mock.calls).toEqual([
      ["Usage: bun run scripts/check-coverage.ts <config> <lcov-report> [...]"],
      ["Usage: bun run scripts/check-coverage.ts <config> <lcov-report> [...]"],
    ]);
    expect(log).not.toHaveBeenCalled();

    error.mockClear();
    expect(await main(["scope.json", "full.info"])).toBe(0);
    expect(JSON.parse(String(log.mock.calls[0]?.[0]))).toEqual({
      threshold: 100,
      covered: 100,
      total: 100,
      percent: 100,
      missing: [],
      passed: true,
    });
    expect(error).not.toHaveBeenCalled();

    log.mockClear();
    expect(await main(["scope.json", "partial.info"])).toBe(1);
    expect(JSON.parse(String(log.mock.calls[0]?.[0]))).toMatchObject({
      covered: 99,
      passed: false,
    });
    expect(error).not.toHaveBeenCalled();

    log.mockClear();
    await writeFile("src/untested.ts", "synthetic");
    await git(root, "add", ".");
    expect(await main(["scope.json", "full.info"])).toBe(1);
    expect(JSON.parse(String(log.mock.calls[0]?.[0]))).toMatchObject({
      missing: ["src/untested.ts"],
      passed: false,
    });
    expect(error.mock.calls).toEqual([
      ["Coverage is incomplete: scoped source files are absent from LCOV."],
    ]);

    log.mockClear();
    error.mockClear();
    await writeFile("broken.json", "{");
    expect(await main(["broken.json", "full.info"])).toBe(1);
    expect(await main(["scope.json", "empty.info"])).toBe(1);
    expect(log).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledTimes(2);
    expect(String(error.mock.calls[0]?.[0])).toStartWith(
      "Coverage gate failed: ",
    );
    expect(String(error.mock.calls[1]?.[0])).toStartWith(
      "Coverage gate failed: ",
    );
  } finally {
    process.chdir(cwd);
    log.mockRestore();
    error.mockRestore();
    await rm(root, { recursive: true, force: true });
  }
});
