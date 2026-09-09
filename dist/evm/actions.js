/** Mirror caller permissions separately from lifecycle timing; simulation remains authoritative. */
export function evmGameActions(game, account, now, buffer) {
    const open = game.status === 1;
    const creator = Boolean(account && game.creator.toLowerCase() === account.toLowerCase());
    const participant = Boolean(account &&
        game.participants.some((player) => player.toLowerCase() === account.toLowerCase()));
    const expired = now >= game.expiresAt;
    const recoverable = open &&
        expired &&
        (game.participants.length < game.minPlayers ||
            now >= game.expiresAt + buffer);
    return {
        creator,
        participant,
        join: open &&
            !expired &&
            game.participants.length < game.maxPlayers &&
            !participant,
        refund: recoverable && participant,
        close: open &&
            creator &&
            (game.participants.length === 0 || (game.gameType === 1 && recoverable)),
    };
}
//# sourceMappingURL=actions.js.map