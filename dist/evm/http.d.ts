import { z } from "zod";
export declare const addressSchema: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
export declare const uintSchema: z.ZodString;
export declare const evmTokenSchema: z.ZodObject<{
    address: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    symbol: z.ZodString;
    decimals: z.ZodNumber;
    minimumAmount: z.ZodString;
}, z.core.$strict>;
export declare const evmMetadataSchema: z.ZodObject<{
    chainId: z.ZodNumber;
    address: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    version: z.ZodLiteral<"0.1.0">;
    confirmations: z.ZodDefault<z.ZodNumber>;
    buffer: z.ZodOptional<z.ZodNumber>;
    tokens: z.ZodArray<z.ZodObject<{
        address: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        symbol: z.ZodString;
        decimals: z.ZodNumber;
        minimumAmount: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strip>;
export type EvmMetadata = z.output<typeof evmMetadataSchema>;
export declare const evmIntentSchema: z.ZodObject<{
    creator: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    token: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    gameType: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
    amount: z.ZodString;
    minPlayers: z.ZodNumber;
    maxPlayers: z.ZodNumber;
    timeout: z.ZodNumber;
    isPrivate: z.ZodBoolean;
    nonce: z.ZodString;
    deadline: z.ZodString;
    proof: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
}, z.core.$strict>;
export declare const evmPrivateJoinSchema: z.ZodObject<{
    gameId: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    player: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    deadline: z.ZodString;
    proof: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
}, z.core.$strict>;
export declare const evmGameResponseSchema: z.ZodObject<{
    game: z.ZodObject<{
        creator: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        token: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        gameType: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
        status: z.ZodNumber;
        isPrivate: z.ZodBoolean;
        minPlayers: z.ZodNumber;
        maxPlayers: z.ZodNumber;
        expiresAt: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
        ticketAmount: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
        totalAmount: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
        commitment: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        lastEntryBlock: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
        participants: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>>;
    }, z.core.$strip>;
    events: z.ZodArray<z.ZodObject<{
        transactionHash: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        event: z.ZodObject<{
            kind: z.ZodString;
            winner: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>>;
            prize: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>>;
            fee: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>>;
            secret: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>>>;
        }, z.core.$strip>;
    }, z.core.$strip>>;
}, z.core.$strip>;
export type GameResponse = z.output<typeof evmGameResponseSchema>;
export declare const evmGamePageSchema: z.ZodObject<{
    games: z.ZodArray<z.ZodObject<{
        game: z.ZodObject<{
            creator: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
            token: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
            gameType: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
            status: z.ZodNumber;
            isPrivate: z.ZodBoolean;
            minPlayers: z.ZodNumber;
            maxPlayers: z.ZodNumber;
            expiresAt: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
            ticketAmount: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
            totalAmount: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
            commitment: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
            lastEntryBlock: z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>;
            participants: z.ZodArray<z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>>;
        }, z.core.$strip>;
        events: z.ZodArray<z.ZodObject<{
            transactionHash: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
            event: z.ZodObject<{
                kind: z.ZodString;
                winner: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>>;
                prize: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>>;
                fee: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<bigint, string>>>;
                secret: z.ZodOptional<z.ZodNullable<z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>>>;
            }, z.core.$strip>;
        }, z.core.$strip>>;
        id: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    }, z.core.$strip>>;
    nextOffset: z.ZodNullable<z.ZodNumber>;
}, z.core.$strip>;
export declare const evmAuthorizationSchema: z.ZodObject<{
    gameId: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    request: z.ZodObject<{
        creator: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        token: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
        gameType: z.ZodUnion<readonly [z.ZodLiteral<0>, z.ZodLiteral<1>]>;
        amount: z.ZodString;
        minPlayers: z.ZodNumber;
        maxPlayers: z.ZodNumber;
        timeout: z.ZodNumber;
        isPrivate: z.ZodBoolean;
        nonce: z.ZodString;
        deadline: z.ZodString;
        commitment: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
    }, z.core.$strict>;
    signature: z.ZodPipe<z.ZodString, z.ZodTransform<`0x${string}`, string>>;
}, z.core.$strip>;
//# sourceMappingURL=http.d.ts.map