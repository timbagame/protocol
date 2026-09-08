import type { ProgramEvent } from "../contracts/events/index.js";
import type { GameReference, SolanaGameReference, MembershipChange } from "./index.js";
export type NormalizedGameEvent = {
    kind: "created";
    reference: GameReference;
    creator: string;
    token: string;
    gameType: "coinflip" | "giveaway";
    ticketAmount: bigint;
    totalAmount: bigint;
    minimumParticipants: number;
    maximumParticipants: number;
    expiresAt: bigint;
    isPrivate: boolean;
    commitment: string | null;
} | (MembershipChange & {
    amount: bigint | null;
}) | {
    kind: "completed";
    reference: GameReference;
    winner: string;
    prize: bigint;
    fee: bigint;
    secret: string | null;
} | {
    kind: "closed";
    reference: GameReference;
    creator: string | null;
    refundAmount: bigint | null;
    closedBy: "creator" | "operator" | null;
};
/** Input must come from trusted program logs on reference.network, in canonical order. */
export declare function normalizeSolanaGameEvent(reference: SolanaGameReference, event: ProgramEvent): NormalizedGameEvent | null;
//# sourceMappingURL=events.d.ts.map