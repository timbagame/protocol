import { expect, test } from "bun:test";
import { shouldPublish } from "../scripts/check-package-version.js";

test("published versions are skipped; only explicit E404 allows publication", () => {
  expect(shouldPublish(0, '"0.12.1"', "", "0.12.1")).toBe(false);
  expect(shouldPublish(1, '{"error":{"code":"E404"}}', "", "0.12.1")).toBe(
    true,
  );
  for (const code of ["E401", "E403", "E429", "E500", "ETIMEDOUT"]) {
    expect(() =>
      shouldPublish(1, JSON.stringify({ error: { code } }), "", "0.12.1"),
    ).toThrow();
  }
  expect(() => shouldPublish(1, "", "network unavailable", "0.12.1")).toThrow();
  expect(() => shouldPublish(0, '"0.12.0"', "", "0.12.1")).toThrow();
});
