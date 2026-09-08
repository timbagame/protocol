import { decodeEventLog, getAddress, toEventSelector, } from "viem";
import { normalizeEvmMembership } from "../../games/index.js";
import { timbaAbi } from "./abi.js";
import { evmDomain } from "./client.js";
const eventTopics = new Set(timbaAbi
    .filter((item) => item.type === "event")
    .map((item) => toEventSelector(item)));
/** Require logs from the selected chain; removed logs must be rolled back by the indexer. */
export function decodeEvmGameEvent(deployment, log) {
    const domain = evmDomain(deployment);
    if (log.chainId !== domain.chainId)
        throw new Error("Log belongs to another chain");
    if (getAddress(log.address) !== domain.verifyingContract)
        return null;
    if (log.removed)
        throw new Error("Removed log requires rollback");
    if (!log.topics[0] || !eventTopics.has(log.topics[0]))
        return null;
    const event = decodeEventLog({
        abi: timbaAbi,
        data: log.data,
        topics: [...log.topics],
        strict: true,
    });
    const e = event.args;
    if (!("gameId" in e))
        return null;
    const reference = {
        chain: "evm",
        chainId: BigInt(domain.chainId),
        deployment: domain.verifyingContract,
        gameId: e.gameId,
    };
    switch (event.eventName) {
        case "GameCreated": {
            const { request: r, expiresAt } = event.args;
            if (r.gameType !== 0 && r.gameType !== 1)
                throw new Error("Unknown game type");
            return {
                kind: "created",
                reference,
                creator: r.creator,
                token: r.token,
                gameType: r.gameType === 0 ? "coinflip" : "giveaway",
                ticketAmount: r.gameType === 0 ? r.amount : 0n,
                totalAmount: r.gameType === 1 ? r.amount : 0n,
                minimumParticipants: r.minPlayers,
                maximumParticipants: r.maxPlayers,
                expiresAt,
                isPrivate: r.isPrivate,
                commitment: r.commitment,
            };
        }
        case "PlayerJoined":
            return {
                ...normalizeEvmMembership(reference, {
                    name: "PlayerJoined",
                    ...event.args,
                }),
                amount: null,
            };
        case "PlayerRefunded":
            return {
                ...normalizeEvmMembership(reference, {
                    name: "PlayerRefunded",
                    ...event.args,
                }),
                amount: event.args.amount,
            };
        case "GameCompleted":
            return {
                kind: "completed",
                reference,
                winner: event.args.winner,
                prize: event.args.prize,
                fee: event.args.fee,
                secret: event.args.secret,
            };
        case "GameClosed":
            return {
                kind: "closed",
                reference,
                creator: event.args.creator,
                refundAmount: event.args.refund,
                closedBy: null,
            };
        default:
            return null;
    }
}
//# sourceMappingURL=events.js.map