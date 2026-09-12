export function serializeGame(game) {
    return {
        ...game,
        stakeAmount: game.stakeAmount.toString(),
        prizeAmount: game.prizeAmount.toString(),
        lastSlot: game.lastSlot.toString(),
    };
}
export function deserializeGame(game) {
    return {
        ...game,
        creationSignature: "",
        stakeAmount: BigInt(game.stakeAmount),
        prizeAmount: BigInt(game.prizeAmount),
        lastSlot: BigInt(game.lastSlot),
    };
}
//# sourceMappingURL=serialized-game.js.map