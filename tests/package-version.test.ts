import { expect, spyOn, test } from "bun:test";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";
import { main, shouldPublish } from "../scripts/check-package-version.js";

test("published versions are skipped; only explicit E404 allows publication", () => {
  expect(shouldPublish(0, '"0.12.1"', "", "0.12.1")).toBe(false);
  expect(shouldPublish(1, '{"error":{"code":"E404"}}', "", "0.12.1")).toBe(
    true,
  );
  for (const code of ["E401", "E403", "E429", "E500", "ETIMEDOUT"]) {
    expect(() =>
      shouldPublish(1, JSON.stringify({ error: { code } }), "", "0.12.1"),
    ).toThrow();
  }
  expect(() => shouldPublish(1, "", "network unavailable", "0.12.1")).toThrow();
  expect(() => shouldPublish(0, '"0.12.0"', "", "0.12.1")).toThrow();
});

test("main queries the registry and records the publish decision", async () => {
  const root = await mkdtemp(join(tmpdir(), "timba-package-version-"));
  const log = spyOn(console, "log").mockImplementation(() => {});
  try {
    const manifest = pathToFileURL(join(root, "package.json"));
    const output = join(root, "github-output");
    await writeFile(
      manifest,
      JSON.stringify({ name: "@timbagame/protocol", version: "1.2.3" }),
    );
    const commands: string[][] = [];
    const registry =
      (exitCode: number, stdout: string, stderr = "") =>
      (command: string[]) => {
        commands.push(command);
        return { exitCode, stdout, stderr };
      };

    await main(
      { GITHUB_OUTPUT: output },
      registry(1, "", '{"error":{"code":"E404"}}'),
      manifest,
    );
    await main({ GITHUB_OUTPUT: output }, registry(0, '"1.2.3"'), manifest);

    expect(commands).toEqual([
      [
        "npm",
        "view",
        "@timbagame/protocol@1.2.3",
        "version",
        "--json",
        "--registry=https://npm.pkg.github.com",
      ],
      [
        "npm",
        "view",
        "@timbagame/protocol@1.2.3",
        "version",
        "--json",
        "--registry=https://npm.pkg.github.com",
      ],
    ]);
    expect(await readFile(output, "utf8")).toBe(
      "publish=true\npublish=false\n",
    );
    expect(log.mock.calls).toEqual([
      ["@timbagame/protocol@1.2.3 is unpublished; publication is needed"],
      ["@timbagame/protocol@1.2.3 is already published; skipping"],
    ]);

    await expect(main({}, registry(0, '"1.2.3"'), manifest)).rejects.toThrow(
      "Missing GitHub output path",
    );
    await expect(
      main({ GITHUB_OUTPUT: output }, registry(1, "", "E401"), manifest),
    ).rejects.toThrow("Unable to check published package version");

    commands.length = 0;
    await writeFile(
      manifest,
      JSON.stringify({ name: "@timbagame/protocol", version: "1.2.3-rc.1" }),
    );
    await expect(
      main({ GITHUB_OUTPUT: output }, registry(1, "", ""), manifest),
    ).rejects.toThrow("Only stable package versions may be published");
    expect(commands).toEqual([]);
    expect(await readFile(output, "utf8")).toBe(
      "publish=true\npublish=false\n",
    );
  } finally {
    log.mockRestore();
    await rm(root, { recursive: true, force: true });
  }
});
