import { getU64Decoder, getU64Encoder } from "@solana/kit";
const U64_MAX = (1n << 64n) - 1n;
/** Contract rejection sampling over overlapping little-endian u64 windows. */
export function selectWinnerFromEntropy(entropy, tickets) {
    if (entropy.length !== 32)
        throw new Error("Entropy must contain 32 bytes");
    if (tickets < 1n || tickets > 0xffffffffn)
        throw new Error("Ticket count must be a positive u32");
    if (tickets === 1n)
        return { randomValue: getU64Decoder().decode(entropy), winnerIndex: 0 };
    const maxValid = U64_MAX - (U64_MAX % tickets);
    for (let start = 0; start <= entropy.length - 8; start++) {
        const randomValue = getU64Decoder().decode(entropy.subarray(start, start + 8));
        if (randomValue < maxValid)
            return { randomValue, winnerIndex: Number(randomValue % tickets) };
    }
    throw new Error("Unable to generate unbiased random number - game must be cancelled");
}
export function createWinnerSeed(secret, lastSlot) {
    if (secret.length !== 32)
        throw new Error("Secret must contain 32 bytes");
    if (lastSlot < 0n || lastSlot > U64_MAX)
        throw new Error("Slot must fit in u64");
    const seed = new Uint8Array(40);
    seed.set(secret);
    seed.set(getU64Encoder().encode(lastSlot), 32);
    return seed;
}
export async function calculateWinner(secret, lastSlot, tickets) {
    const seed = createWinnerSeed(secret, lastSlot);
    const entropy = new Uint8Array(await crypto.subtle.digest("SHA-256", new Uint8Array(seed)));
    return selectWinnerFromEntropy(entropy, tickets);
}
//# sourceMappingURL=index.js.map