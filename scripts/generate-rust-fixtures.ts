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
import {
  encodeAbiParameters,
  encodeEventTopics,
  getAbiItem,
  type Hex,
} from "viem";
import { parseTokenAmount } from "../src/amounts/index.ts";
import * as evm from "../src/evm/v0.1.0/index.ts";
import { httpFixtures } from "./rust-http-fixtures.ts";
import {
  gameCapabilities,
  gamePath,
  gameReferenceKey,
  validateGameDraft,
  type GameDraft,
  type GameReference,
} from "../src/games/index.ts";
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

const DEPLOYMENT = {
  chainId: 31337,
  address: "0x1111111111111111111111111111111111111111",
  version: "0.1.0",
} as const;
const EVM_CREATOR = "0x2B5AD5c4795c026514f8317c7a215E218DcCD6cF";
const EVM_PLAYER = "0x6813Eb9362372EEF6200f3b1dbC3f819671cBA69";
const EVM_TOKEN = "0x2222222222222222222222222222222222222222";
const GAME_ID = `0x${"44".repeat(32)}` as Hex;
const SECRET = `0x${"c3".repeat(32)}` as Hex;
const bytes32 = (byte: string) => `0x${byte.repeat(32)}` as Hex;

/** bigint values as decimal strings, matching the oracle's persisted JSON. */
const plain = (value: unknown): unknown =>
  JSON.parse(
    JSON.stringify(value, (_, v) => (typeof v === "bigint" ? v.toString() : v)),
  );

function log(eventName: string, args: Record<string, unknown>) {
  const item = getAbiItem({ abi: evm.timbaAbi, name: eventName }) as {
    inputs: readonly { name: string; type: string; indexed?: boolean }[];
  };
  const data = item.inputs.filter((input) => !input.indexed);
  return {
    eventName,
    address: DEPLOYMENT.address,
    topics: encodeEventTopics({
      abi: evm.timbaAbi,
      eventName,
      args,
    } as Parameters<typeof encodeEventTopics>[0]),
    data: encodeAbiParameters(
      data as Parameters<typeof encodeAbiParameters>[0],
      data.map((input) => args[input.name]),
    ),
  };
}

async function evmFixtures() {
  const request = (gameType: 0 | 1, commitment: Hex) => ({
    creator: EVM_CREATOR,
    token: EVM_TOKEN,
    gameType,
    amount: 12_345_678_901_234_567_890n,
    minPlayers: 1,
    maxPlayers: 10,
    timeout: 3600,
    isPrivate: true,
    commitment,
    nonce: 7n,
    deadline: 1120n,
  });
  const created = request(1, bytes32("ab"));
  const commitment = evm.commitmentFor(SECRET);
  const transactions = {
    create: evm.createGameTransaction(DEPLOYMENT, created, "0x1234", true),
    joinPublic: evm.joinGameTransaction(DEPLOYMENT, GAME_ID),
    joinPrivate: evm.joinGameTransaction(DEPLOYMENT, GAME_ID, {
      deadline: 1060n,
      signature: "0xabcdef",
    }),
    refund: evm.refundPlayerTransaction(DEPLOYMENT, GAME_ID, EVM_PLAYER),
    complete: evm.completeGameTransaction(DEPLOYMENT, GAME_ID, SECRET),
    close: evm.closeGameTransaction(DEPLOYMENT, GAME_ID),
    invalidateNonce: evm.invalidateCreationNonceTransaction(DEPLOYMENT, 8n),
    approve: evm.tokenApprovalTransaction(DEPLOYMENT, EVM_TOKEN, 500n),
  };
  const winners = [
    [bytes32("00"), 3],
    [bytes32("00"), 1000],
    [bytes32("ff"), 1],
    [bytes32("5a"), 7],
  ].map(([entropy, participants]) => ({
    entropy,
    participants,
    ...evm.selectEvmWinnerFromEntropy(entropy as Hex, participants as number),
  }));
  const logs = [
    log("GameCreated", {
      gameId: GAME_ID,
      creator: EVM_CREATOR,
      request: request(0, commitment),
      expiresAt: 4720n,
    }),
    log("GameCreated", {
      gameId: GAME_ID,
      creator: EVM_CREATOR,
      request: created,
      expiresAt: 4720n,
    }),
    log("PlayerJoined", {
      gameId: GAME_ID,
      player: EVM_PLAYER,
      index: 3n,
      entryBlock: 77n,
    }),
    log("PlayerRefunded", {
      gameId: GAME_ID,
      player: EVM_PLAYER,
      amount: 500n,
      removedIndex: 1n,
      movedParticipant: EVM_CREATOR,
    }),
    log("PlayerRefunded", {
      gameId: GAME_ID,
      player: EVM_PLAYER,
      amount: 500n,
      removedIndex: 0n,
      movedParticipant: "0x0000000000000000000000000000000000000000",
    }),
    log("GameCompleted", {
      gameId: GAME_ID,
      winner: EVM_PLAYER,
      prize: 190n,
      fee: 10n,
      secret: SECRET,
    }),
    log("GameClosed", { gameId: GAME_ID, creator: EVM_CREATOR, refund: 200n }),
    log("OwnershipTransferred", {
      previousOwner: EVM_CREATOR,
      newOwner: EVM_PLAYER,
    }),
  ].map((entry) => ({
    ...entry,
    decoded: evm.decodeEvmGameEvent(DEPLOYMENT, {
      ...entry,
      chainId: DEPLOYMENT.chainId,
    }),
  }));
  return plain({
    deployment: DEPLOYMENT,
    creator: EVM_CREATOR,
    player: EVM_PLAYER,
    gameId: evm.gameIdFor(DEPLOYMENT, EVM_CREATOR, 7n),
    creationDigest: evm.creationDigest(DEPLOYMENT, created),
    joinDigest: evm.privateJoinDigest(DEPLOYMENT, GAME_ID, EVM_PLAYER, 1060n),
    commitment,
    transactions,
    winners,
    winner: evm.calculateEvmWinner(
      DEPLOYMENT,
      GAME_ID,
      SECRET,
      commitment,
      77n,
      5,
    ),
    logs,
  });
}

/** Runs `run`, recording either its result or the thrown message. */
function outcome(run: () => unknown) {
  try {
    return { ok: run() };
  } catch (error) {
    const { message, code } = error as Error & { code?: string };
    return { error: message, ...(code ? { code } : {}) };
  }
}

async function games() {
  const amounts = [
    ["1.5", 6],
    [" 1.5\n", 6],
    [".5", 1],
    ["1.", 0],
    ["0.000", 255],
    ["\uFEFF2\u00A0", 0],
    ["\u00851", 0],
    ["007.10", 2],
    ["340282366920938463463374607431768211455", 0],
    ["1.1234567", 6],
    ["", 6],
    [".", 6],
    ["-1", 6],
    ["1e3", 6],
    ["1.2.3", 6],
    ["+1", 6],
    ["1 2", 6],
    ["\u0661", 6],
    ["1", 256],
  ].map(([value, decimals]) => ({
    value,
    decimals,
    ...outcome(() => parseTokenAmount(value as string, decimals as number)),
  }));
  const references: GameReference[] = [
    {
      chain: "solana",
      network: "mainnet-beta",
      deployment: PROGRAM,
      gameId: "Game Id/é&?",
    },
    {
      chain: "evm",
      chainId: 8453n,
      deployment: "0xAbCdEf0123456789aBcDeF0123456789AbCdEf01",
      gameId: `0x${"Ab".repeat(32)}`,
    },
  ];
  const draft: GameDraft = {
    type: "giveaway",
    tokenMint: USDC,
    amount: "2.5",
    minPlayers: 1,
    maxPlayers: 10,
    timeoutMinutes: 60,
  };
  const variants: [string, Partial<GameDraft>][] = [
    ["valid", {}],
    ["301 seconds", { timeoutMinutes: 301 / 60 }],
    ["fractional seconds", { timeoutMinutes: 1.001 }],
    ["below minimum", { amount: "0.5" }],
    ["zero", { amount: "0" }],
    ["bad amount", { amount: "abc" }],
    ["precision", { amount: "1.1234567" }],
    ["coinflip floor", { type: "coinflip", minPlayers: 1, maxPlayers: 2 }],
    ["coinflip", { type: "coinflip", minPlayers: 2, maxPlayers: 2 }],
    ["fractional players", { minPlayers: 1.5 }],
    ["max below min", { minPlayers: 5, maxPlayers: 4 }],
    ["too many players", { maxPlayers: 101 }],
    ["short timeout", { timeoutMinutes: 4 }],
    ["one minute", { timeoutMinutes: 1 }],
    ["long timeout", { timeoutMinutes: 1441 }],
    ["infinite timeout", { timeoutMinutes: Infinity }],
    ["private", { isPrivate: true }],
  ];
  const drafts = (["solana", "evm"] as const).flatMap((chain) =>
    variants.map(([name, change]) => {
      const input = { ...draft, ...change };
      return {
        name,
        chain,
        draft: {
          ...input,
          // JSON has no Infinity; the Rust test maps null back to it.
          timeoutMinutes: Number.isFinite(input.timeoutMinutes)
            ? input.timeoutMinutes
            : null,
        },
        ...outcome(() =>
          validateGameDraft(
            input,
            { decimals: 6, minimumAmount: "1" },
            gameCapabilities(chain),
          ),
        ),
      };
    }),
  );
  return plain({
    amounts,
    references: references.map((reference) => ({
      reference,
      key: gameReferenceKey(reference),
      path: gamePath(reference),
    })),
    drafts,
  });
}

const fixtures: Record<string, () => Promise<unknown>> = {
  "plans.json": plans,
  "complete.json": complete,
  "evm.json": evmFixtures,
  "games.json": games,
  "http.json": async () => httpFixtures(),
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
