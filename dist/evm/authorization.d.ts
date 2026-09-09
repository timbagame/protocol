import { type CreateGameRequest } from "./v0.1.0/client.js";
import type { EvmDeployment } from "./index.js";
/** Verify economic terms and identity before the adapter verifies the live operator signature. */
export declare function checkCreationAuthorization(deployment: EvmDeployment, expected: CreateGameRequest, input: unknown): {
    gameId: `0x${string}`;
    signature: `0x${string}`;
    request: {
        creator: `0x${string}`;
        token: `0x${string}`;
        commitment: `0x${string}`;
        amount: bigint;
        deadline: bigint;
        gameType: number;
        isPrivate: boolean;
        maxPlayers: number;
        minPlayers: number;
        nonce: bigint;
        timeout: number;
    };
};
//# sourceMappingURL=authorization.d.ts.map