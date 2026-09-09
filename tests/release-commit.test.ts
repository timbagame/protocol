import { expect, test } from "bun:test";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

test("release guard rejects PR commits and accepts the resulting squash merge", () => {
  const cwd = mkdtempSync(join(tmpdir(), "protocol-release-"));
  const git = (...args: string[]) => {
    const result = Bun.spawnSync(["git", ...args], { cwd });
    if (result.exitCode !== 0) throw new Error(result.stderr.toString());
    return result.stdout.toString().trim();
  };
  const guard = () =>
    Bun.spawnSync(
      [
        "bash",
        fileURLToPath(
          new URL("../scripts/check-release-commit.sh", import.meta.url),
        ),
      ],
      { cwd },
    );
  try {
    git("init", "--initial-branch=main");
    git("config", "user.name", "Release test");
    git("config", "user.email", "release@example.invalid");
    git("config", "commit.gpgsign", "false");
    git("remote", "add", "origin", cwd);
    git("commit", "--allow-empty", "-m", "Initial main");
    expect(guard().exitCode).toBe(0);
    git("checkout", "-b", "feature");
    writeFileSync(join(cwd, "change"), "reviewed change");
    git("add", "change");
    git("commit", "-m", "PR commit");
    const feature = git("rev-parse", "HEAD");
    expect(guard().exitCode).toBe(1);
    git("checkout", "main");
    git("merge", "--squash", "feature");
    git("commit", "-m", "Squash merge");
    expect(guard().exitCode).toBe(0);
    git("checkout", "--detach", feature);
    expect(guard().exitCode).toBe(1);
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
});
