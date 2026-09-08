function gameType(value) {
    if (value === 0)
        return "coinflip";
    if (value === 1)
        return "giveaway";
    throw new Error("Unknown game type");
}
/** Pass only terminal outcomes established by confirmed indexed events for this game. */
export function observeSolanaGame(reference, account, terminal, commitment = null) {
    if (terminal && terminal.gameKey !== reference.gameId)
        throw new Error("Terminal event belongs to another game");
    if (!account)
        return { reference, status: terminal?.outcome ?? "unknown", game: null };
    if (account.ticketsCount !== account.participants.length)
        throw new Error("Participant count mismatch");
    const game = {
        reference,
        status: "open",
        creator: account.creator,
        token: account.tokenMint,
        gameType: gameType(account.gameType),
        isPrivate: account.isPrivate,
        ticketAmount: account.ticketAmount,
        totalAmount: account.totalAmount,
        minimumParticipants: account.minTickets,
        maximumParticipants: account.maxTickets,
        participants: [...account.participants],
        participantCount: account.ticketsCount,
        expiresAt: account.createdAt + account.timeout,
        commitment,
        entropyPosition: { kind: "solana-slot", value: account.lastSlot },
    };
    return { reference, status: game.status, game };
}
export function observeEvmGame(reference, account) {
    if (!account || account.status === 0)
        return { reference, status: "unknown", game: null };
    const status = { 1: "open", 2: "completed", 3: "closed" }[account.status];
    if (!status)
        throw new Error("Unknown game status");
    const game = {
        reference,
        status,
        creator: account.creator,
        token: account.token,
        gameType: gameType(account.gameType),
        isPrivate: account.isPrivate,
        ticketAmount: account.ticketAmount,
        totalAmount: account.totalAmount,
        minimumParticipants: account.minPlayers,
        maximumParticipants: account.maxPlayers,
        participants: [...account.participants],
        participantCount: account.participants.length,
        expiresAt: account.expiresAt,
        commitment: account.commitment,
        entropyPosition: { kind: "evm-block", value: account.lastEntryBlock },
    };
    return { reference, status, game };
}
/** Derived from the current Oracle buffer. Never cache this as a creation-time economic term. */
export function gameLifecycle(game, now, buffer) {
    if (now < 0n || buffer <= 0n)
        throw new Error("Invalid time or buffer");
    const expired = now >= game.expiresAt;
    const recoveryAt = game.expiresAt + buffer;
    const ready = game.participantCount === game.maximumParticipants ||
        (game.participantCount >= game.minimumParticipants && expired);
    const open = game.status === "open";
    return {
        expired,
        recoveryAt,
        canJoin: open && !expired && game.participantCount < game.maximumParticipants,
        canSettle: open && ready && now < recoveryAt,
        canRefund: open && expired && (!ready || now >= recoveryAt),
    };
}
function safeIndex(value) {
    if (typeof value === "bigint" &&
        (value < 0n || value > BigInt(Number.MAX_SAFE_INTEGER)))
        throw new Error("Invalid participant index");
    const index = Number(value);
    if (!Number.isSafeInteger(index) || index < 0)
        throw new Error("Invalid participant index");
    return index;
}
export function normalizeSolanaMembership(reference, event) {
    if (event.data.gameKey !== reference.gameId)
        throw new Error("Event belongs to another game");
    return {
        reference,
        kind: event.name === "PlayerJoined" ? "joined" : "refunded",
        player: event.data.player,
        index: safeIndex(event.data.ticketIndex),
        movedParticipant: event.name === "PlayerUnjoined" ? event.data.movedParticipant : null,
    };
}
export function normalizeEvmMembership(reference, event) {
    if (event.gameId.toLowerCase() !== reference.gameId.toLowerCase())
        throw new Error("Event belongs to another game");
    return {
        reference,
        kind: event.name === "PlayerJoined" ? "joined" : "refunded",
        player: event.player,
        index: safeIndex(event.name === "PlayerJoined" ? event.index : event.removedIndex),
        movedParticipant: event.name === "PlayerRefunded" &&
            !/^0x0{40}$/i.test(event.movedParticipant)
            ? event.movedParticipant
            : null,
    };
}
export * from "./events.js";
//# sourceMappingURL=index.js.map