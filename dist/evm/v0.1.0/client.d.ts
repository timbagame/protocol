import { type Address, type Hex, type ContractFunctionArgs } from "viem";
import { timbaAbi } from "./abi.js";
import type { EvmDeployment } from "../index.js";
export type CreateGameRequest = ContractFunctionArgs<typeof timbaAbi, "nonpayable", "createGame">[0];
export declare function evmDomain(deployment: EvmDeployment): {
    readonly name: "Timba";
    readonly version: "1";
    readonly chainId: number;
    readonly verifyingContract: `0x${string}`;
};
export declare const creationTypes: {
    readonly CreateGame: readonly [{
        readonly name: "creator";
        readonly type: "address";
    }, {
        readonly name: "token";
        readonly type: "address";
    }, {
        readonly name: "gameType";
        readonly type: "uint8";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
    }, {
        readonly name: "minPlayers";
        readonly type: "uint32";
    }, {
        readonly name: "maxPlayers";
        readonly type: "uint32";
    }, {
        readonly name: "timeout";
        readonly type: "uint32";
    }, {
        readonly name: "isPrivate";
        readonly type: "bool";
    }, {
        readonly name: "commitment";
        readonly type: "bytes32";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }];
};
export declare const joinTypes: {
    readonly JoinGame: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
    }, {
        readonly name: "player";
        readonly type: "address";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
    }];
};
export declare function creationTypedData(deployment: EvmDeployment, request: CreateGameRequest): {
    readonly domain: {
        readonly name: "Timba";
        readonly version: "1";
        readonly chainId: number;
        readonly verifyingContract: `0x${string}`;
    };
    readonly types: {
        readonly CreateGame: readonly [{
            readonly name: "creator";
            readonly type: "address";
        }, {
            readonly name: "token";
            readonly type: "address";
        }, {
            readonly name: "gameType";
            readonly type: "uint8";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly name: "minPlayers";
            readonly type: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
        }, {
            readonly name: "timeout";
            readonly type: "uint32";
        }, {
            readonly name: "isPrivate";
            readonly type: "bool";
        }, {
            readonly name: "commitment";
            readonly type: "bytes32";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
        }];
    };
    readonly primaryType: "CreateGame";
    readonly message: {
        amount: bigint;
        commitment: `0x${string}`;
        creator: `0x${string}`;
        deadline: bigint;
        gameType: number;
        isPrivate: boolean;
        maxPlayers: number;
        minPlayers: number;
        nonce: bigint;
        timeout: number;
        token: `0x${string}`;
    };
};
export declare function privateJoinTypedData(deployment: EvmDeployment, gameId: Hex, player: Address, deadline: bigint): {
    readonly domain: {
        readonly name: "Timba";
        readonly version: "1";
        readonly chainId: number;
        readonly verifyingContract: `0x${string}`;
    };
    readonly types: {
        readonly JoinGame: readonly [{
            readonly name: "gameId";
            readonly type: "bytes32";
        }, {
            readonly name: "player";
            readonly type: "address";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
        }];
    };
    readonly primaryType: "JoinGame";
    readonly message: {
        readonly gameId: `0x${string}`;
        readonly player: `0x${string}`;
        readonly deadline: bigint;
    };
};
export declare function creationDigest(deployment: EvmDeployment, request: CreateGameRequest): Hex;
export declare function privateJoinDigest(deployment: EvmDeployment, gameId: Hex, player: Address, deadline: bigint): Hex;
export declare function gameIdFor(deployment: EvmDeployment, creator: Address, nonce: bigint): Hex;
export declare function createGameTransaction(deployment: EvmDeployment, request: CreateGameRequest, signature: Hex, joinCreator: boolean): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly data: `0x${string}`;
    readonly value: 0n;
};
export declare function joinGameTransaction(deployment: EvmDeployment, gameId: Hex, authorization?: {
    deadline: bigint;
    signature: Hex;
}): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly data: `0x${string}`;
    readonly value: 0n;
};
export declare function refundPlayerTransaction(deployment: EvmDeployment, gameId: Hex, player: Address): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly data: `0x${string}`;
    readonly value: 0n;
};
export declare function completeGameTransaction(deployment: EvmDeployment, gameId: Hex, secret: Hex): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly data: `0x${string}`;
    readonly value: 0n;
};
export declare function closeGameTransaction(deployment: EvmDeployment, gameId: Hex): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly data: `0x${string}`;
    readonly value: 0n;
};
export declare function invalidateCreationNonceTransaction(deployment: EvmDeployment, next: bigint): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly data: `0x${string}`;
    readonly value: 0n;
};
export declare function tokenApprovalTransaction(deployment: EvmDeployment, token: Address, amount: bigint): {
    readonly chainId: number;
    readonly to: `0x${string}`;
    readonly value: 0n;
    readonly data: `0x${string}`;
};
//# sourceMappingURL=client.d.ts.map