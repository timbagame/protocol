import { normalizeSolanaMembership } from "./index.js";
/** Input must come from trusted program logs on reference.network, in canonical order. */
export function normalizeSolanaGameEvent(reference, event) {
    if (!("gameKey" in event.data))
        return null;
    if (event.data.gameKey !== reference.gameId)
        throw new Error("Event belongs to another game");
    switch (event.name) {
        case "GameInitialized": {
            const e = event.data;
            return {
                kind: "created",
                reference,
                creator: e.creator,
                token: e.tokenMint,
                gameType: e.gameType,
                ticketAmount: e.ticketAmount,
                totalAmount: e.totalAmount,
                minimumParticipants: e.minTickets,
                maximumParticipants: e.maxTickets,
                expiresAt: e.createdAt + e.timeout,
                isPrivate: e.isPrivate,
                commitment: null,
            };
        }
        case "PlayerJoined":
        case "PlayerUnjoined":
            return { ...normalizeSolanaMembership(reference, event), amount: null };
        case "GameCompleted":
            return {
                kind: "completed",
                reference,
                winner: event.data.winner,
                prize: event.data.winnerAmount,
                fee: event.data.feeAmount,
                secret: null,
            };
        case "GameClosed":
            return {
                kind: "closed",
                reference,
                creator: null,
                refundAmount: null,
                closedBy: "creator",
            };
        case "OperatorGameClosed":
            return {
                kind: "closed",
                reference,
                creator: event.data.creator,
                refundAmount: event.data.refundedAmount,
                closedBy: "operator",
            };
        default:
            return null;
    }
}
//# sourceMappingURL=events.js.map