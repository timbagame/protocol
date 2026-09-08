import { encodeAbiParameters, encodeFunctionData, erc20Abi, getAddress, hashTypedData, keccak256, parseAbiParameters, } from "viem";
import { timbaAbi } from "./abi.js";
export function evmDomain(deployment) {
    if (deployment.version !== "0.1.0")
        throw new Error("Unsupported EVM contract version");
    if (!Number.isSafeInteger(deployment.chainId) || deployment.chainId <= 0)
        throw new Error("Invalid EVM chain ID");
    return {
        name: "Timba",
        version: "1",
        chainId: deployment.chainId,
        verifyingContract: getAddress(deployment.address),
    };
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
};
export const joinTypes = {
    JoinGame: [
        { name: "gameId", type: "bytes32" },
        { name: "player", type: "address" },
        { name: "deadline", type: "uint256" },
    ],
};
export function creationTypedData(deployment, request) {
    return {
        domain: evmDomain(deployment),
        types: creationTypes,
        primaryType: "CreateGame",
        message: request,
    };
}
export function privateJoinTypedData(deployment, gameId, player, deadline) {
    return {
        domain: evmDomain(deployment),
        types: joinTypes,
        primaryType: "JoinGame",
        message: { gameId, player, deadline },
    };
}
export function creationDigest(deployment, request) {
    return hashTypedData(creationTypedData(deployment, request));
}
export function privateJoinDigest(deployment, gameId, player, deadline) {
    return hashTypedData(privateJoinTypedData(deployment, gameId, player, deadline));
}
export function gameIdFor(deployment, creator, nonce) {
    const domain = evmDomain(deployment);
    return keccak256(encodeAbiParameters(parseAbiParameters("uint256,address,address,uint256"), [
        BigInt(domain.chainId),
        domain.verifyingContract,
        creator,
        nonce,
    ]));
}
function transaction(deployment, data) {
    const domain = evmDomain(deployment);
    return {
        chainId: domain.chainId,
        to: domain.verifyingContract,
        data,
        value: 0n,
    };
}
export function createGameTransaction(deployment, request, signature, joinCreator) {
    return transaction(deployment, encodeFunctionData({
        abi: timbaAbi,
        functionName: "createGame",
        args: [request, signature, joinCreator],
    }));
}
export function joinGameTransaction(deployment, gameId, authorization) {
    return transaction(deployment, encodeFunctionData({
        abi: timbaAbi,
        functionName: "joinGame",
        args: [
            gameId,
            authorization?.deadline ?? 0n,
            authorization?.signature ?? "0x",
        ],
    }));
}
export function refundPlayerTransaction(deployment, gameId, player) {
    return transaction(deployment, encodeFunctionData({
        abi: timbaAbi,
        functionName: "refundPlayer",
        args: [gameId, player],
    }));
}
export function completeGameTransaction(deployment, gameId, secret) {
    return transaction(deployment, encodeFunctionData({
        abi: timbaAbi,
        functionName: "completeGame",
        args: [gameId, secret],
    }));
}
export function closeGameTransaction(deployment, gameId) {
    return transaction(deployment, encodeFunctionData({
        abi: timbaAbi,
        functionName: "closeGame",
        args: [gameId],
    }));
}
export function invalidateCreationNonceTransaction(deployment, next) {
    return transaction(deployment, encodeFunctionData({
        abi: timbaAbi,
        functionName: "invalidateCreationNonce",
        args: [next],
    }));
}
export function tokenApprovalTransaction(deployment, token, amount) {
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
    };
}
//# sourceMappingURL=client.js.map