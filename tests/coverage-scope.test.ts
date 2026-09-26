import { expect, test } from "bun:test";
import scope from "../coverage-scope.json" with { type: "json" };

test("documents a reason for every coverage exclusion", () => {
  const reasons: Record<string, string> = scope.excludeReasons;
  expect(Object.keys(reasons).sort()).toEqual([...scope.exclude].sort());
  for (const pattern of scope.exclude) {
    expect(reasons[pattern]?.trim().length ?? 0).toBeGreaterThan(10);
  }
});

test("gates all first-party source and scripts", () => {
  expect(scope.roots).toEqual(["src", "scripts"]);
});
