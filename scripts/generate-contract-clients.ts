import { resolve } from "node:path";

import { rootNodeFromAnchor, type AnchorIdl } from "@codama/nodes-from-anchor";
import { renderVisitor } from "@codama/renderers-js";
import { createFromRoot } from "codama";
import { format, resolveConfig } from "prettier";

const root = resolve(import.meta.dir, "..");
const prettierConfig = await resolveConfig(root);
const contractVersions = ["v0.2.0", "v0.3.0"] as const;
const generatedDirectories = new Set([
  "accounts",
  "errors",
  "instructions",
  "pdas",
  "programs",
  "types",
]);

for (const version of contractVersions) {
  const input = resolve(root, "src", "contracts", version, "timba.json");
  const packageFolder = resolve(root, "src", "contracts", version);
  const generatedFolder = resolve(packageFolder, "generated");
  const idl = (await Bun.file(input).json()) as AnchorIdl;
  const codama = createFromRoot(rootNodeFromAnchor(idl));

  await codama.accept(
    renderVisitor(packageFolder, {
      deleteFolderBeforeRendering: true,
      formatCode: true,
      generatedFolder: "generated",
      kitImportStrategy: "rootOnly",
      syncPackageJson: false,
    }),
  );

  const generatedFiles = new Bun.Glob("**/*.ts").scan({
    absolute: true,
    cwd: generatedFolder,
  });

  for await (const generatedFile of generatedFiles) {
    const source = await Bun.file(generatedFile).text();
    const nodeEsmSource = source.replaceAll(
      /(from\s+["'])(\.\.?\/[^"']+)(["'])/g,
      (_match, prefix: string, specifier: string, suffix: string) => {
        const target = specifier.split("/").at(-1);
        const extension =
          target && generatedDirectories.has(target) ? "/index.js" : ".js";
        return `${prefix}${specifier}${extension}${suffix}`;
      },
    );
    await Bun.write(
      generatedFile,
      await format(nodeEsmSource, {
        ...prettierConfig,
        filepath: generatedFile,
      }),
    );
  }
}
