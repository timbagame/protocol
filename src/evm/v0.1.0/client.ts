import {
  encodeAbiParameters,
  encodeFunctionData,
  erc20Abi,
  getAddress,
  hashTypedData,
  keccak256,
  parseAbiParameters,
  type Address,
  type Hex,
  type ContractFunctionArgs,
} from "viem";
import { timbaAbi } from "./abi.js";
import type { EvmDeployment } from "../index.js";

export type CreateGameRequest = ContractFunctionArgs<
  typeof timbaAbi,
  "nonpayable",
  "createGame"
>[0];

export function evmDomain(deployment: EvmDeployment) {
  if (deployment.version !== "0.1.0")
    throw new Error("Unsupported EVM contract version");
  if (!Number.isSafeInteger(deployment.chainId) || deployment.chainId <= 0)
    throw new Error("Invalid EVM chain ID");
  return {
    name: "Timba",
    version: "1",
    chainId: deployment.chainId,
    verifyingContract: getAddress(deployment.address),
  } as const;
}
export const creationTypes = {
  CreateGame: [
    { name: "creator", type: "address" },
    { name: "token", type: "address" },
    { name: "gameType", type: "uint8" },
    { name: "amount", type: "uint256" },
    { name: "minPlayers", type: "uint32" },
    { name: "maxPlayers", type: "uint32" },
    { name: "timeout", type: "uint32" },
    { name: "isPrivate", type: "bool" },
    { name: "commitment", type: "bytes32" },
    { name: "nonce", type: "uint256" },
    { name: "deadline", type: "uint256" },
  ],
} as const;
export const joinTypes = {
  JoinGame: [
    { name: "gameId", type: "bytes32" },
    { name: "player", type: "address" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

export function creationTypedData(
  deployment: EvmDeployment,
  request: CreateGameRequest,
) {
  return {
    domain: evmDomain(deployment),
    types: creationTypes,
    primaryType: "CreateGame",
    message: request,
  } as const;
}
export function privateJoinTypedData(
  deployment: EvmDeployment,
  gameId: Hex,
  player: Address,
  deadline: bigint,
) {
  return {
    domain: evmDomain(deployment),
    types: joinTypes,
    primaryType: "JoinGame",
    message: { gameId, player, deadline },
  } as const;
}
export function creationDigest(
  deployment: EvmDeployment,
  request: CreateGameRequest,
): Hex {
  return hashTypedData(creationTypedData(deployment, request));
}
export function privateJoinDigest(
  deployment: EvmDeployment,
  gameId: Hex,
  player: Address,
  deadline: bigint,
): Hex {
  return hashTypedData(
    privateJoinTypedData(deployment, gameId, player, deadline),
  );
}
export function gameIdFor(
  deployment: EvmDeployment,
  creator: Address,
  nonce: bigint,
): Hex {
  const domain = evmDomain(deployment);
  return keccak256(
    encodeAbiParameters(parseAbiParameters("uint256,address,address,uint256"), [
      BigInt(domain.chainId),
      domain.verifyingContract,
      creator,
      nonce,
    ]),
  );
}
function transaction(deployment: EvmDeployment, data: Hex) {
  const domain = evmDomain(deployment);
  return {
    chainId: domain.chainId,
    to: domain.verifyingContract,
    data,
    value: 0n,
  } as const;
}
export function createGameTransaction(
  deployment: EvmDeployment,
  request: CreateGameRequest,
  signature: Hex,
  joinCreator: boolean,
) {
  return transaction(
    deployment,
    encodeFunctionData({
      abi: timbaAbi,
      functionName: "createGame",
      args: [request, signature, joinCreator],
    }),
  );
}
export function joinGameTransaction(
  deployment: EvmDeployment,
  gameId: Hex,
  authorization?: { deadline: bigint; signature: Hex },
) {
  return transaction(
    deployment,
    encodeFunctionData({
      abi: timbaAbi,
      functionName: "joinGame",
      args: [
        gameId,
        authorization?.deadline ?? 0n,
        authorization?.signature ?? "0x",
      ],
    }),
  );
}
export function refundPlayerTransaction(
  deployment: EvmDeployment,
  gameId: Hex,
  player: Address,
) {
  return transaction(
    deployment,
    encodeFunctionData({
      abi: timbaAbi,
      functionName: "refundPlayer",
      args: [gameId, player],
    }),
  );
}
export function completeGameTransaction(
  deployment: EvmDeployment,
  gameId: Hex,
  secret: Hex,
) {
  return transaction(
    deployment,
    encodeFunctionData({
      abi: timbaAbi,
      functionName: "completeGame",
      args: [gameId, secret],
    }),
  );
}
export function closeGameTransaction(deployment: EvmDeployment, gameId: Hex) {
  return transaction(
    deployment,
    encodeFunctionData({
      abi: timbaAbi,
      functionName: "closeGame",
      args: [gameId],
    }),
  );
}
export function invalidateCreationNonceTransaction(
  deployment: EvmDeployment,
  next: bigint,
) {
  return transaction(
    deployment,
    encodeFunctionData({
      abi: timbaAbi,
      functionName: "invalidateCreationNonce",
      args: [next],
    }),
  );
}
export function tokenApprovalTransaction(
  deployment: EvmDeployment,
  token: Address,
  amount: bigint,
) {
  const domain = evmDomain(deployment);
  return {
    chainId: domain.chainId,
    to: getAddress(token),
    value: 0n,
    data: encodeFunctionData({
      abi: erc20Abi,
      functionName: "approve",
      args: [domain.verifyingContract, amount],
    }),
  } as const;
}
