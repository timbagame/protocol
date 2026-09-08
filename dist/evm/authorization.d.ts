import { type CreateGameRequest } from "./v0.1.0/client.js";
import type { EvmDeployment } from "./index.js";
/** Verify economic terms and identity before the adapter verifies the live operator signature. */
export declare function checkCreationAuthorization(deployment: EvmDeployment, expected: CreateGameRequest, input: unknown): {
    gameId: `0x${string}`;
    signature: `0x${string}`;
    request: {
        commitment: `0x${string}`;
        amount: bigint;
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
//# sourceMappingURL=authorization.d.ts.map