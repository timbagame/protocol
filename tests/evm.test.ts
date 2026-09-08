import { expect, test } from "bun:test";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import {
  encodeAbiParameters,
  encodeEventTopics,
  parseAbiParameters,
  zeroAddress,
  type Address,
  type Hex,
} from "viem";
import {
  timbaAbi,
  creationDigest,
  privateJoinDigest,
  gameIdFor,
  commitmentFor,
  calculateEvmWinner,
  createGameTransaction,
  joinGameTransaction,
  refundPlayerTransaction,
  completeGameTransaction,
  closeGameTransaction,
  selectEvmWinnerFromEntropy,
  decodeEvmGameEvent,
  type CreateGameRequest,
  evmArtifactSource,
  timbaAbiJson,
} from "../src/evm/v0.1.0/index.js";
import type { EvmDeployment } from "../src/evm/index.js";
import vector from "./fixtures/evm-client-v1.json" with { type: "json" };

const deployment: EvmDeployment = {
  version: "0.1.0",
  chainId: Number(vector.chainId),
  address: vector.proxy as Address,
};
const request: CreateGameRequest = {
  creator: vector.creator as Address,
  token: vector.token as Address,
  gameType: 0,
  amount: 123n,
  minPlayers: 2,
  maxPlayers: 3,
  timeout: 100,
  isPrivate: false,
  commitment: vector.commitment as Hex,
  nonce: 0n,
  deadline: 2000n,
};
const id = vector.gameId as Hex,
  secret = vector.secret as Hex,
  player = vector.player as Address;

test("matches Solidity-generated domain, signing and winner vectors", () => {
  expect(creationDigest(deployment, request)).toBe(
    vector.creationDigest as Hex,
  );
  expect(privateJoinDigest(deployment, id, player, 2000n)).toBe(
    vector.joinDigest as Hex,
  );
  expect(gameIdFor(deployment, request.creator, 0n)).toBe(id);
  expect(commitmentFor(secret)).toBe(vector.commitment as Hex);
  expect(
    calculateEvmWinner(deployment, id, secret, request.commitment, 42n, 2)
      .winnerIndex,
  ).toBe(Number(vector.winnerIndex));
});
test("matches Solidity calldata for every game action", () => {
  expect(createGameTransaction(deployment, request, "0x1234", true).data).toBe(
    vector.createCalldata as Hex,
  );
  expect(
    joinGameTransaction(deployment, id, {
      signature: "0x1234",
      deadline: 2000n,
    }).data,
  ).toBe(vector.joinCalldata as Hex);
  expect(refundPlayerTransaction(deployment, id, player).data).toBe(
    vector.refundCalldata as Hex,
  );
  expect(completeGameTransaction(deployment, id, secret).data).toBe(
    vector.completeCalldata as Hex,
  );
  expect(closeGameTransaction(deployment, id).data).toBe(
    vector.closeCalldata as Hex,
  );
  expect(
    createGameTransaction(deployment, request, "0x1234", true),
  ).toMatchObject({ to: deployment.address, chainId: 8453, value: 0n });
});
test("binds signatures to network, deployment and every signed request field", () => {
  const digest = creationDigest(deployment, request);
  expect(creationDigest({ ...deployment, chainId: 4663 }, request)).not.toBe(
    digest,
  );
  expect(creationDigest({ ...deployment, address: player }, request)).not.toBe(
    digest,
  );
  for (const patch of [
    { creator: player },
    { token: player },
    { gameType: 1 },
    { amount: 124n },
    { minPlayers: 1 },
    { maxPlayers: 4 },
    { timeout: 101 },
    { isPrivate: true },
    { commitment: secret },
    { nonce: 1n },
    { deadline: 2001n },
  ])
    expect(creationDigest(deployment, { ...request, ...patch })).not.toBe(
      digest,
    );
  expect(() =>
    creationDigest({ ...deployment, chainId: 0 }, request),
  ).toThrow();
  expect(() =>
    creationDigest(deployment, { ...request, amount: -1n }),
  ).toThrow();
  expect(() =>
    calculateEvmWinner(deployment, id, secret, secret, 42n, 2),
  ).toThrow("Invalid reveal");
});
test("handles rejection sampling and enforces native input bounds", () => {
  const zero = ("0x" + "00".repeat(32)) as Hex;
  expect(selectEvmWinnerFromEntropy(zero, 1)).toEqual({
    randomValue: 0n,
    winnerIndex: 0,
  });
  const selected = selectEvmWinnerFromEntropy(zero, 3);
  expect(selected.randomValue).not.toBe(0n); // zero is below 2^256 mod 3
  expect(selected.winnerIndex).toBeGreaterThanOrEqual(0);
  expect(selected.winnerIndex).toBeLessThan(3);
  for (const count of [0, 1001, 1.5])
    expect(() => selectEvmWinnerFromEntropy(zero, count)).toThrow();
  expect(() => commitmentFor("0x12")).toThrow();
  expect(() =>
    calculateEvmWinner(deployment, id, secret, request.commitment, -1n, 2),
  ).toThrow();
});
test("ABI and typed export match the pinned artifact", () => {
  expect(JSON.stringify(timbaAbi)).toBe(JSON.stringify(timbaAbiJson));
  const content = readFileSync(
    new URL("../src/evm/v0.1.0/timba.json", import.meta.url),
  );
  expect(createHash("sha256").update(content).digest("hex")).toBe(
    evmArtifactSource.abiSha256,
  );
});
function log(topics: Hex[], data: Hex) {
  return { chainId: 8453, address: deployment.address, topics, data };
}
test("decodes all EVM lifecycle events without inventing missing fields", () => {
  const created = decodeEvmGameEvent(
    deployment,
    log(
      encodeEventTopics({
        abi: timbaAbi,
        eventName: "GameCreated",
        args: { gameId: id, creator: request.creator },
      }) as Hex[],
      encodeAbiParameters(
        [
          {
            type: "tuple",
            components: timbaAbi.find(
              (x) => x.type === "function" && x.name === "createGame",
            )!.inputs[0].components,
          },
          { type: "uint64" },
        ],
        [request, 1100n],
      ),
    ),
  );
  expect(created).toMatchObject({
    kind: "created",
    ticketAmount: 123n,
    totalAmount: 0n,
    expiresAt: 1100n,
  });
  expect(
    decodeEvmGameEvent(
      deployment,
      log(
        encodeEventTopics({
          abi: timbaAbi,
          eventName: "PlayerJoined",
          args: { gameId: id, player },
        }) as Hex[],
        encodeAbiParameters(parseAbiParameters("uint256,uint256"), [1n, 42n]),
      ),
    ),
  ).toMatchObject({ kind: "joined", index: 1, amount: null });
  expect(
    decodeEvmGameEvent(
      deployment,
      log(
        encodeEventTopics({
          abi: timbaAbi,
          eventName: "PlayerRefunded",
          args: { gameId: id, player },
        }) as Hex[],
        encodeAbiParameters(parseAbiParameters("uint256,uint256,address"), [
          123n,
          1n,
          zeroAddress,
        ]),
      ),
    ),
  ).toMatchObject({
    kind: "refunded",
    index: 1,
    movedParticipant: null,
    amount: 123n,
  });
  expect(
    decodeEvmGameEvent(
      deployment,
      log(
        encodeEventTopics({
          abi: timbaAbi,
          eventName: "GameCompleted",
          args: { gameId: id, winner: player },
        }) as Hex[],
        encodeAbiParameters(parseAbiParameters("uint256,uint256,bytes32"), [
          244n,
          2n,
          secret,
        ]),
      ),
    ),
  ).toMatchObject({
    kind: "completed",
    winner: player,
    prize: 244n,
    fee: 2n,
    secret,
  });
  expect(
    decodeEvmGameEvent(
      deployment,
      log(
        encodeEventTopics({
          abi: timbaAbi,
          eventName: "GameClosed",
          args: { gameId: id, creator: request.creator },
        }) as Hex[],
        encodeAbiParameters(parseAbiParameters("uint256"), [123n]),
      ),
    ),
  ).toMatchObject({ kind: "closed", refundAmount: 123n, closedBy: null });
});
test("ignores other emitters and rejects wrong-chain, removed and malformed logs", () => {
  const topics = encodeEventTopics({
    abi: timbaAbi,
    eventName: "GameClosed",
    args: { gameId: id, creator: request.creator },
  }) as Hex[];
  const valid = log(
    topics,
    encodeAbiParameters(parseAbiParameters("uint256"), [0n]),
  );
  expect(
    decodeEvmGameEvent(deployment, { ...valid, address: player }),
  ).toBeNull();
  expect(() =>
    decodeEvmGameEvent(deployment, { ...valid, chainId: 1 }),
  ).toThrow();
  expect(() =>
    decodeEvmGameEvent(deployment, { ...valid, removed: true }),
  ).toThrow();
  expect(() =>
    decodeEvmGameEvent(deployment, { ...valid, data: "0x" }),
  ).toThrow();
  expect(decodeEvmGameEvent(deployment, { ...valid, topics: [] })).toBeNull();
});
