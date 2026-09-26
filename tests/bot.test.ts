import { describe, expect, test } from "bun:test";
import {
  BotHealthResponseSchema,
  CompletedGameNotificationResponseSchema,
  CompletedGameNotificationSchema,
  botContract,
} from "../src/bot/index.js";
import { createRestClient, expectStatus } from "../src/common/index.js";

const GAME = "32Jr4JnXWvqq9GqPQynkooHsszaucUUvZfNLh2hdX2L5";
const WINNER = "11111111111111111111111111111111";
const SIGNATURE = "1".repeat(64);
const NOTIFICATION = {
  gameAddress: GAME,
  winnerAddress: WINNER,
  winnerTxSignature: SIGNATURE,
  totalPot: 2.5,
};

describe("bot completed-game notifications", () => {
  test("accepts a finite non-negative pot with base58 identities", () => {
    expect<unknown>(
      CompletedGameNotificationSchema.parse(NOTIFICATION),
    ).toEqual(NOTIFICATION);
    expect(
      CompletedGameNotificationSchema.parse({ ...NOTIFICATION, totalPot: 0 })
        .totalPot,
    ).toBe(0);
  });

  test("rejects negative, infinite and non-numeric pots", () => {
    for (const totalPot of [-0.01, Number.POSITIVE_INFINITY, Number.NaN, "1"]) {
      expect(
        CompletedGameNotificationSchema.safeParse({ ...NOTIFICATION, totalPot })
          .success,
      ).toBe(false);
    }
  });

  test("rejects malformed identities and unknown fields", () => {
    for (const patch of [
      { gameAddress: "not a key" },
      { winnerAddress: "2".repeat(32) },
      { winnerTxSignature: "0".repeat(64) },
      { extra: true },
    ]) {
      expect(
        CompletedGameNotificationSchema.safeParse({ ...NOTIFICATION, ...patch })
          .success,
      ).toBe(false);
    }
  });

  test("requires literal success and ok responses", () => {
    expect(
      CompletedGameNotificationResponseSchema.parse({ success: true }),
    ).toEqual({ success: true });
    expect(
      CompletedGameNotificationResponseSchema.safeParse({ success: false })
        .success,
    ).toBe(false);
    expect(BotHealthResponseSchema.parse({ status: "ok" })).toEqual({
      status: "ok",
    });
    expect(BotHealthResponseSchema.safeParse({ status: "down" }).success).toBe(
      false,
    );
  });
});

describe("bot endpoint declarations", () => {
  test("declares unauthenticated health and completion routes", () => {
    expect(botContract.health).toMatchObject({
      method: "GET",
      path: "/health",
      authenticated: false,
    });
    expect(botContract.completedGame).toMatchObject({
      method: "POST",
      path: "/internal/completed",
      authenticated: false,
    });
    expect(Object.keys(botContract.completedGame.responses).sort()).toEqual([
      "200",
      "400",
      "500",
    ]);
  });

  test("posts a validated notification and parses declared errors", async () => {
    const requests: Request[] = [];
    const replies = [
      Response.json({ success: true }),
      Response.json({ error: "game not found" }, { status: 400 }),
    ];
    const client = createRestClient(botContract, {
      baseUrl: "https://bot.test",
      fetch: async (input, init) => {
        requests.push(new Request(input, init));
        return replies.shift()!;
      },
    });

    const ok = await client.completedGame({ body: NOTIFICATION });
    expect(expectStatus(ok, 200).data).toEqual({ success: true });
    expect(requests[0]!.url).toBe("https://bot.test/internal/completed");
    expect(requests[0]!.method).toBe("POST");
    expect(await requests[0]!.json()).toEqual(NOTIFICATION);

    const rejected = await client.completedGame({ body: NOTIFICATION });
    expect(rejected.status).toBe(400);
    expect(() => expectStatus(rejected, 200)).toThrow(
      "Expected HTTP 200, received 400: game not found",
    );
  });

  test("rejects an invalid notification before sending it", async () => {
    let called = false;
    const client = createRestClient(botContract, {
      baseUrl: "https://bot.test",
      fetch: async () => {
        called = true;
        return Response.json({ success: true });
      },
    });
    await expect(
      client.completedGame({ body: { ...NOTIFICATION, totalPot: -1 } }),
    ).rejects.toThrow();
    expect(called).toBe(false);
  });
});
