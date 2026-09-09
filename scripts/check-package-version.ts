import { appendFileSync } from "node:fs";

/** Only an explicit missing package/version permits publishing. */
export function shouldPublish(
  exitCode: number,
  stdout: string,
  stderr: string,
  version: string,
): boolean {
  if (exitCode === 0) {
    if (JSON.parse(stdout) !== version)
      throw new Error("Registry returned an unexpected package version");
    return false;
  }
  for (const output of [stdout, stderr]) {
    try {
      const result = JSON.parse(output);
      if (result?.error?.code === "E404") return true;
    } catch {
      // npm may also write plain-text diagnostics; these never authorize publish.
    }
  }
  throw new Error("Unable to check published package version");
}

if (import.meta.main) {
  const { name, version } = await Bun.file(
    new URL("../package.json", import.meta.url),
  ).json();
  if (!/^\d+\.\d+\.\d+$/.test(version))
    throw new Error("Only stable package versions may be published");
  const result = Bun.spawnSync([
    "npm",
    "view",
    `${name}@${version}`,
    "version",
    "--json",
    "--registry=https://npm.pkg.github.com",
  ]);
  const publish = shouldPublish(
    result.exitCode,
    result.stdout.toString(),
    result.stderr.toString(),
    version,
  );
  if (!process.env["GITHUB_OUTPUT"]) throw new Error("Missing GitHub output path");
  appendFileSync(process.env["GITHUB_OUTPUT"], `publish=${publish}\n`);
  console.log(
    publish
      ? `${name}@${version} is unpublished; publication is needed`
      : `${name}@${version} is already published; skipping`,
  );
}
