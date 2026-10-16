// Writes the fixtures that check crates/timba-protocol byte for byte against
// this package. `--check` fails instead when a committed fixture is stale.
import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  address,
  createKeyPairSignerFromPrivateKeyBytes,
  type Address,
} from "@solana/kit";
import { format } from "prettier";
import * as v2 from "../src/contracts/v0.2.0/generated/index.ts";
import * as v3 from "../src/contracts/v0.3.0/generated/index.ts";
import {
  buildCreateGamePlan,
  createContractAdapter,
  createLegacyTransaction,
  encodeTransactionBase64,
  getAssociatedTokenAddress,
} from "../src/solana/plans/index.ts";

const FIXTURES = join(
  import.meta.dir,
  "../crates/timba-protocol/tests/fixtures",
);
const PROGRAM = address("32Jr4JnXWvqq9GqPQynkooHsszaucUUvZfNLh2hdX2L5");
const SOL = address("So11111111111111111111111111111111111111112");
const USDC = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const CREATOR = address("9xQeWvG816bUx9EPjHmaT23yvVM2ZWbrrpZb9PusVFin");
const OPERATOR = address("HN7cABqLq46Es1jh92dQQisAq662SmxELLLsHHe4YWrH");
const VERSIONS = ["0.2.0", "0.3.0"] as const;
const LIFETIME = {
  blockhash: "4uQeVj5tqViQh7yWWGStvkEG1Zmhx6uasJtWCJziofM",
  lastValidBlockHeight: 1n,
} as Parameters<typeof createLegacyTransaction>[1];

function encode(
  feePayer: Address,
  instructions: Parameters<typeof createLegacyTransaction>[2],
) {
  return encodeTransactionBase64(
    createLegacyTransaction(feePayer, LIFETIME, instructions),
  );
}

async function plans() {
  const out: Record<string, unknown> = {};
  for (const version of VERSIONS) {
    const plan = await buildCreateGamePlan(
      {
        creator: CREATOR,
        tokenMint: USDC,
        type: "giveaway",
        amount: 123456789n,
        minPlayers: 2,
        maxPlayers: 10,
        timeoutSeconds: 3600n,
        randomHash: new Uint8Array(32).fill(7),
        oracleOperator: OPERATOR,
      },
      version,
      PROGRAM,
    );
    const adapter = createContractAdapter(version, PROGRAM);
    const join = await adapter.buildJoinPlan({
      game: plan.game,
      player: OPERATOR,
      tokenMint: SOL,
      tokenAmount: 5000n,
    });
    const unjoin = await adapter.buildUnjoinPlan({
      game: plan.game,
      player: OPERATOR,
      tokenMint: USDC,
      authority: CREATOR,
    });
    const close = await adapter.buildClosePlan({
      game: plan.game,
      creator: CREATOR,
      tokenMint: USDC,
    });
    out[version] = {
      game: plan.game,
      create: encode(CREATOR, plan.instructions),
      join: encode(OPERATOR, join.instructions),
      unjoin: encode(CREATOR, unjoin.instructions),
      close: encode(CREATOR, close.instructions),
    };
  }
  return out;
}

async function complete() {
  const operator = await createKeyPairSignerFromPrivateKeyBytes(
    new Uint8Array(32).fill(5),
  );
  const config = { programAddress: PROGRAM };
  const cases = [];
  for (const version of VERSIONS) {
    for (const [i, mint] of [USDC, SOL].entries()) {
      const randomHash = new Uint8Array(32).fill(11 + i);
      const secretKey = new Uint8Array(32).fill(22 + i);
      // The completion cases settle to a winner other than the game's creator.
      const winner = CREATOR;
      const creator = OPERATOR;
      const [game] = await v3.findGamePda({ randomHash }, config);
      const [gameVault] = await v3.findGameVaultPda(
        { tokenMint: mint },
        config,
      );
      const [oracle] = await v3.findOraclePda(config);
      const vaultTokenAccount = await getAssociatedTokenAddress(
        mint,
        gameVault,
        true,
      );
      const common = {
        game,
        tokenMint: mint,
        gameVault,
        oracle,
        oracleOperator: operator,
        winner,
        creator,
        winnerTokenAccount: await getAssociatedTokenAddress(mint, winner, true),
        randomHash,
        secretKey,
        winnerIndex: 3 + i,
      };
      const instruction =
        version === "0.2.0"
          ? v2.getCompleteGameInstruction(
              {
                ...common,
                gameToken: (
                  await v2.findGameTokenPda({ tokenMint: mint }, config)
                )[0],
                gameTokenAccount: vaultTokenAccount,
              },
              config,
            )
          : v3.getCompleteGameInstruction(
              {
                ...common,
                gameVaultTokenAccount: vaultTokenAccount,
                oracleOperatorTokenAccount: await getAssociatedTokenAddress(
                  mint,
                  operator.address,
                  true,
                ),
              },
              config,
            );
      cases.push({
        version,
        mint,
        randomHash: 11 + i,
        secretKey: 22 + i,
        winnerIndex: 3 + i,
        winner,
        creator,
        tx: encode(operator.address, [instruction]),
      });
    }
  }
  return { operator: operator.address, cases };
}

const fixtures: Record<string, () => Promise<unknown>> = {
  "plans.json": plans,
  "complete.json": complete,
};
const check = Bun.argv.includes("--check");
const stale: string[] = [];
for (const [name, build] of Object.entries(fixtures)) {
  const path = join(FIXTURES, name);
  const content = await format(JSON.stringify(await build()), {
    parser: "json",
  });
  if (!check) await writeFile(path, content);
  else if ((await readFile(path, "utf8").catch(() => "")) !== content)
    stale.push(name);
}
if (stale.length) {
  console.error(
    "Stale Rust fixtures: " +
      stale.join(", ") +
      ". Run bun run generate:rust-fixtures.",
  );
  process.exit(1);
}
