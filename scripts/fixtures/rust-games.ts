// Pure builders shared by the fixture generator and Bun parity tests.
import { address } from "@solana/kit";
import {
  encodeAbiParameters,
  encodeEventTopics,
  getAbiItem,
  type Hex,
  type Abi,
} from "viem";
import { parseTokenAmount } from "../../src/amounts/index.js";
import * as evm from "../../src/evm/v0.1.0/index.js";
import {
  gameCapabilities,
  gamePath,
  gameReferenceKey,
  validateGameDraft,
  type GameDraft,
  type GameReference,
} from "../../src/games/index.js";
const PROGRAM = address("32Jr4JnXWvqq9GqPQynkooHsszaucUUvZfNLh2hdX2L5");
const USDC = address("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
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
  const abi: Abi = evm.timbaAbi;
  const item = getAbiItem({ abi, name: eventName });
  if (!item || item.type !== "event")
    throw new Error(`Expected event ${eventName}`);
  const data = item.inputs.filter((input) => !input.indexed);
  const topics = encodeEventTopics({ abi, eventName, args }).map((topic) => {
    if (typeof topic !== "string")
      throw new Error("Expected one concrete topic per indexed argument");
    return topic;
  });
  return {
    eventName,
    address: DEPLOYMENT.address,
    topics,
    data: encodeAbiParameters(
      data,
      data.map((input) => args[input.name ?? ""]),
    ),
  };
}

export async function evmFixtures() {
  const request = (
    gameType: 0 | 1,
    commitment: Hex,
  ): evm.CreateGameRequest => ({
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
    [bytes32("00"), 315],
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

export async function games() {
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
