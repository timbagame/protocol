import { describe, expect, test } from "bun:test";
import { getAddressEncoder, address } from "@solana/kit";
import {
  decodeProgramEvent,
  EVENT_DISCRIMINATORS,
  getTrustedProgramData,
} from "../src/contracts/events/index.js";
const program = "11111111111111111111111111111111";
const other = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA";
function completed() {
  const bytes = Buffer.alloc(100);
  bytes.set(EVENT_DISCRIMINATORS.GameCompleted);
  bytes.set(getAddressEncoder().encode(address(other)), 8);
  bytes.writeUInt32LE(2, 72);
  bytes.writeBigUInt64LE(0xffff_ffff_ffff_ffffn, 76);
  return bytes;
}
describe("shared Timba events", () => {
  test("preserves full u64 amounts and rejects truncated or extra fields", () => {
    const bytes = completed();
    expect(decodeProgramEvent(bytes)).toMatchObject({
      name: "GameCompleted",
      data: {
        gameKey: other,
        ticketsCount: 2,
        winnerAmount: 0xffff_ffff_ffff_ffffn,
      },
    });
    expect(() => decodeProgramEvent(bytes.subarray(0, 99))).toThrow();
    expect(() =>
      decodeProgramEvent(Buffer.concat([bytes, Buffer.alloc(1)])),
    ).toThrow();
    expect(decodeProgramEvent(new Uint8Array(8))).toBeNull();
  });
  test("supports legacy and current unjoin layouts", () => {
    for (const length of [104, 105, 137]) {
      const bytes = Buffer.alloc(length);
      bytes.set(EVENT_DISCRIMINATORS.PlayerUnjoined);
      if (length === 137) {
        bytes[88] = 1;
        bytes.set(getAddressEncoder().encode(address(other)), 89);
      }
      expect(decodeProgramEvent(bytes)).toMatchObject({
        name: "PlayerUnjoined",
        data: { movedParticipant: length === 137 ? other : null },
      });
    }
    const invalid = Buffer.alloc(105);
    invalid.set(EVENT_DISCRIMINATORS.PlayerUnjoined);
    invalid[88] = 2;
    expect(() => decodeProgramEvent(invalid)).toThrow();
  });
  test("decodes player joins and rejects joins with a truncated layout", () => {
    const bytes = Buffer.alloc(104);
    bytes.set(EVENT_DISCRIMINATORS.PlayerJoined);
    bytes.set(getAddressEncoder().encode(address(program)), 8);
    bytes.set(getAddressEncoder().encode(address(other)), 40);
    bytes.writeBigUInt64LE(0xffff_ffff_ffff_ffffn, 72);
    bytes.writeUInt32LE(3, 80);
    bytes.writeUInt32LE(2, 84);
    bytes.writeBigUInt64LE(999n, 88);
    bytes.writeBigUInt64LE(1_700_000_000n, 96);
    expect(decodeProgramEvent(bytes)).toEqual({
      name: "PlayerJoined",
      data: {
        gameKey: address(program),
        player: address(other),
        totalAmount: 0xffff_ffff_ffff_ffffn,
        ticketsCount: 3,
        ticketIndex: 2,
        lastSlot: 999n,
        timestamp: 1_700_000_000n,
      },
    });
    expect(() => decodeProgramEvent(bytes.subarray(0, 103))).toThrow(
      "Invalid Timba event length",
    );
  });
  test("filters CPI, unrelated, and unframed logs", () => {
    const data = `Program data: ${completed().toString("base64")}`;
    const logs = [
      data,
      `Program ${program} invoke [1]`,
      data,
      `Program ${other} invoke [2]`,
      data,
      `Program ${other} success`,
      data,
      `Program ${program} success`,
      data,
    ];
    expect(getTrustedProgramData(logs, program)).toHaveLength(2);
  });
  test("rejects invalid initialized enum and boolean fields", () => {
    const bytes = Buffer.alloc(146);
    bytes.set(EVENT_DISCRIMINATORS.GameInitialized);
    bytes[72] = 2;
    expect(() => decodeProgramEvent(bytes)).toThrow();
    bytes[72] = 0;
    bytes[129] = 2;
    expect(() => decodeProgramEvent(bytes)).toThrow();
  });
});
