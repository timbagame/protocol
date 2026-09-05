import {
  getAddressDecoder,
  getBase64Encoder,
  getStructDecoder,
  getU8Decoder,
  getU32Decoder,
  getU64Decoder,
  type ReadonlyUint8Array,
} from "@solana/kit";

export const EVENT_DISCRIMINATORS = {
  GameInitialized: [82, 221, 11, 2, 244, 52, 240, 250],
  GameCompleted: [103, 26, 106, 108, 240, 191, 179, 120],
  GameClosed: [178, 203, 179, 224, 43, 18, 209, 4],
  PlayerJoined: [39, 144, 49, 106, 108, 210, 183, 38],
  PlayerUnjoined: [191, 34, 140, 22, 253, 20, 237, 73],
  TokenFeeWithdrawn: [92, 98, 195, 90, 108, 129, 244, 119],
  OperatorGameClosed: [236, 51, 251, 125, 251, 64, 187, 174],
} as const;
const key = getAddressDecoder();
const u64 = getU64Decoder();
const u32 = getU32Decoder();
const membership = [
  ["gameKey", key],
  ["player", key],
  ["totalAmount", u64],
  ["ticketsCount", u32],
  ["ticketIndex", u32],
] as const;
const decoders = {
  GameInitialized: getStructDecoder([
    ["gameKey", key],
    ["creator", key],
    ["gameType", getU8Decoder()],
    ["ticketAmount", u64],
    ["totalAmount", u64],
    ["maxTickets", u32],
    ["minTickets", u32],
    ["tokenMint", key],
    ["isPrivate", getU8Decoder()],
    ["createdAt", u64],
    ["timeout", u64],
  ]),
  GameCompleted: getStructDecoder([
    ["gameKey", key],
    ["winner", key],
    ["ticketsCount", u32],
    ["winnerAmount", u64],
    ["feeAmount", u64],
    ["timestamp", u64],
  ]),
  GameClosed: getStructDecoder([
    ["gameKey", key],
    ["timestamp", u64],
  ]),
  PlayerJoined: getStructDecoder([
    ...membership,
    ["lastSlot", u64],
    ["timestamp", u64],
  ]),
  TokenFeeWithdrawn: getStructDecoder([
    ["operator", key],
    ["tokenMint", key],
    ["amount", u64],
  ]),
  OperatorGameClosed: getStructDecoder([
    ["gameKey", key],
    ["creator", key],
    ["operator", key],
    ["refundedAmount", u64],
    ["recoveredLamports", u64],
    ["timestamp", u64],
  ]),
};
function exact<T>(
  data: ReadonlyUint8Array,
  decoder: { fixedSize: number; decode: (data: ReadonlyUint8Array) => T },
): T {
  if (data.length !== decoder.fixedSize + 8)
    throw new Error("Invalid Timba event length");
  return decoder.decode(data.slice(8));
}
function initialized(data: ReadonlyUint8Array) {
  const value = exact(data, decoders.GameInitialized);
  if (value.gameType > 1 || value.isPrivate > 1)
    throw new Error("Invalid Timba event enum or boolean");
  return {
    ...value,
    gameType:
      value.gameType === 0 ? ("coinflip" as const) : ("giveaway" as const),
    isPrivate: value.isPrivate === 1,
  };
}
function unjoined(data: ReadonlyUint8Array) {
  // Historical deployments emitted membership without the moved-participant option.
  if (data.length === 104)
    return { ...exact(data, decoders.PlayerJoined), movedParticipant: null };
  const flag = data[88];
  if ((flag !== 0 && flag !== 1) || data.length !== (flag === 1 ? 137 : 105))
    throw new Error("Invalid PlayerUnjoined event");
  const head = getStructDecoder(membership).decode(data.slice(8));
  const offset = flag === 1 ? 121 : 89;
  return {
    ...head,
    movedParticipant: flag === 1 ? key.decode(data.slice(89, 121)) : null,
    lastSlot: u64.decode(data.slice(offset)),
    timestamp: u64.decode(data.slice(offset + 8)),
  };
}
const readers = {
  GameInitialized: initialized,
  GameCompleted: (data: ReadonlyUint8Array) =>
    exact(data, decoders.GameCompleted),
  GameClosed: (data: ReadonlyUint8Array) => exact(data, decoders.GameClosed),
  PlayerJoined: (data: ReadonlyUint8Array) =>
    exact(data, decoders.PlayerJoined),
  PlayerUnjoined: unjoined,
  TokenFeeWithdrawn: (data: ReadonlyUint8Array) =>
    exact(data, decoders.TokenFeeWithdrawn),
  OperatorGameClosed: (data: ReadonlyUint8Array) =>
    exact(data, decoders.OperatorGameClosed),
};
export type EventName = keyof typeof readers;
export type EventData<N extends EventName> = ReturnType<(typeof readers)[N]>;
export type ProgramEvent = {
  [N in EventName]: { name: N; data: EventData<N> };
}[EventName];

/** Unknown events are ignored; malformed recognized events throw. Layouts cover v0.2 and v0.3. */
export function decodeProgramEvent(
  data: ReadonlyUint8Array,
): ProgramEvent | null {
  const name = (Object.keys(EVENT_DISCRIMINATORS) as EventName[]).find((name) =>
    EVENT_DISCRIMINATORS[name].every((byte, index) => data[index] === byte),
  );
  if (!name) return null;
  return { name, data: readers[name](data) } as ProgramEvent;
}

/** Only accept events emitted while the requested program owns the active invocation frame. */
export function getTrustedProgramData(
  logs: readonly string[],
  programId: string,
): Uint8Array[] {
  const stack: string[] = [];
  const result: Uint8Array[] = [];
  for (const log of logs) {
    const invocation =
      /^Program ([1-9A-HJ-NP-Za-km-z]{32,44}) invoke \[(\d+)]$/.exec(log);
    if (invocation) {
      const depth = Number(invocation[2]);
      if (!Number.isSafeInteger(depth) || depth < 1 || depth > 64) continue;
      stack.length = depth - 1;
      stack.push(invocation[1]!);
      continue;
    }
    const completion =
      /^Program ([1-9A-HJ-NP-Za-km-z]{32,44}) (?:success|failed:)/.exec(log);
    if (completion) {
      if (stack.at(-1) === completion[1]) stack.pop();
      continue;
    }
    if (stack.at(-1) !== programId) continue;
    const encoded =
      /^Program data: ((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$/.exec(
        log,
      )?.[1];
    if (!encoded) continue;
    const bytes = getBase64Encoder().encode(encoded);
    if (bytes.length >= 8) result.push(new Uint8Array(bytes));
  }
  return result;
}
