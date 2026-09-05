import { type ReadonlyUint8Array } from "@solana/kit";
export declare const EVENT_DISCRIMINATORS: {
    readonly GameInitialized: readonly [82, 221, 11, 2, 244, 52, 240, 250];
    readonly GameCompleted: readonly [103, 26, 106, 108, 240, 191, 179, 120];
    readonly GameClosed: readonly [178, 203, 179, 224, 43, 18, 209, 4];
    readonly PlayerJoined: readonly [39, 144, 49, 106, 108, 210, 183, 38];
    readonly PlayerUnjoined: readonly [191, 34, 140, 22, 253, 20, 237, 73];
    readonly TokenFeeWithdrawn: readonly [92, 98, 195, 90, 108, 129, 244, 119];
    readonly OperatorGameClosed: readonly [236, 51, 251, 125, 251, 64, 187, 174];
};
declare function initialized(data: ReadonlyUint8Array): {
    gameType: "coinflip" | "giveaway";
    isPrivate: boolean;
    createdAt: bigint;
    creator: import("@solana/kit").Address<string>;
    gameKey: import("@solana/kit").Address<string>;
    maxTickets: number;
    minTickets: number;
    ticketAmount: bigint;
    timeout: bigint;
    tokenMint: import("@solana/kit").Address<string>;
    totalAmount: bigint;
};
declare function unjoined(data: ReadonlyUint8Array): {
    movedParticipant: import("@solana/kit").Address<string> | null;
    lastSlot: bigint;
    timestamp: bigint;
    gameKey: import("@solana/kit").Address<string>;
    player: import("@solana/kit").Address<string>;
    ticketIndex: number;
    ticketsCount: number;
    totalAmount: bigint;
};
declare const readers: {
    GameInitialized: typeof initialized;
    GameCompleted: (data: ReadonlyUint8Array) => {
        feeAmount: bigint;
        gameKey: import("@solana/kit").Address<string>;
        ticketsCount: number;
        timestamp: bigint;
        winner: import("@solana/kit").Address<string>;
        winnerAmount: bigint;
    };
    GameClosed: (data: ReadonlyUint8Array) => {
        gameKey: import("@solana/kit").Address<string>;
        timestamp: bigint;
    };
    PlayerJoined: (data: ReadonlyUint8Array) => {
        gameKey: import("@solana/kit").Address<string>;
        lastSlot: bigint;
        player: import("@solana/kit").Address<string>;
        ticketIndex: number;
        ticketsCount: number;
        timestamp: bigint;
        totalAmount: bigint;
    };
    PlayerUnjoined: typeof unjoined;
    TokenFeeWithdrawn: (data: ReadonlyUint8Array) => {
        amount: bigint;
        operator: import("@solana/kit").Address<string>;
        tokenMint: import("@solana/kit").Address<string>;
    };
    OperatorGameClosed: (data: ReadonlyUint8Array) => {
        creator: import("@solana/kit").Address<string>;
        gameKey: import("@solana/kit").Address<string>;
        operator: import("@solana/kit").Address<string>;
        recoveredLamports: bigint;
        refundedAmount: bigint;
        timestamp: bigint;
    };
};
export type EventName = keyof typeof readers;
export type EventData<N extends EventName> = ReturnType<(typeof readers)[N]>;
export type ProgramEvent = {
    [N in EventName]: {
        name: N;
        data: EventData<N>;
    };
}[EventName];
/** Unknown events are ignored; malformed recognized events throw. Layouts cover v0.2 and v0.3. */
export declare function decodeProgramEvent(data: ReadonlyUint8Array): ProgramEvent | null;
/** Only accept events emitted while the requested program owns the active invocation frame. */
export declare function getTrustedProgramData(logs: readonly string[], programId: string): Uint8Array[];
export {};
//# sourceMappingURL=index.d.ts.map