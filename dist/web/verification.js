import { FinalizedVerifiedGameSchema } from "./index.js";
import { calculateWinner } from "../randomness/index.js";
import { findGamePda } from "../contracts/v0.3.0/generated/index.js";
const bytes = (hex) => Uint8Array.from(hex.match(/../g), (value) => parseInt(value, 16));
/** Checks published inputs locally; chain references remain available for auditing. */
export async function validateVerifiedGame(value, signature, programId) {
    const data = FinalizedVerifiedGameSchema.parse(value);
    const secret = bytes(data.secretKey);
    const hash = new Uint8Array(await crypto.subtle.digest("SHA-256", secret));
    const commitment = [...hash]
        .map((byte) => byte.toString(16).padStart(2, "0"))
        .join("");
    const winner = await calculateWinner(secret, BigInt(data.lastSlot), BigInt(data.totalTickets));
    if (data.signature !== signature ||
        !data.transactionSignatures.some((value) => value === signature) ||
        commitment !== data.randomHash.toLowerCase() ||
        String((await findGamePda({ randomHash: hash }, { programAddress: programId }))[0]) !== String(data.gameKey) ||
        data.participants.length !== data.totalTickets ||
        data.participants.some((p, index) => p.ticketCount !== 1 ||
            p.ticketIndices.length !== 1 ||
            p.ticketIndices[0] !== index) ||
        winner.randomValue.toString() !== data.randomValue ||
        winner.winnerIndex !== data.winnerTicketIndex ||
        data.participants[winner.winnerIndex]?.address !== data.winner ||
        data.calculationBreakdown.randomValue !== data.randomValue ||
        data.calculationBreakdown.winnerIndex !== data.winnerTicketIndex ||
        data.calculationBreakdown.totalTickets !== data.totalTickets)
        throw new Error("Game verification inputs are inconsistent");
    return data;
}
//# sourceMappingURL=verification.js.map