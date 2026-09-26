import { expect, test } from "bun:test";
import { z } from "zod";
import { jsonResponse, parseJsonResponse } from "../src/common/index.js";

const Schema = z.strictObject({ amount: z.number().int().nonnegative() });

test("serializes only schema-valid response bodies", async () => {
  const response = jsonResponse(Schema, { amount: 3 }, { status: 201 });
  expect(response.status).toBe(201);
  expect(await response.json()).toEqual({ amount: 3 });
  expect(() => jsonResponse(Schema, { amount: -1 })).toThrow();
});

test("parses response bodies through the schema", async () => {
  expect(await parseJsonResponse(Response.json({ amount: 4 }), Schema)).toEqual(
    { amount: 4 },
  );
  await expect(
    parseJsonResponse(Response.json({ amount: 4, extra: 1 }), Schema),
  ).rejects.toThrow();
});
