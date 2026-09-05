import { expect, test } from "bun:test";
import { evaluateTokenPolicy, TokenPolicySchema } from "../src/oracle/index.js";
const policy = TokenPolicySchema.parse({
  mint: "So11111111111111111111111111111111111111112",
  enabled: true,
  minimumAmountRaw: "100",
  acceptedMinimumAmountRaw: "95",
  revision: 1,
  effectiveAt: "2026-09-01T00:00:00Z",
});
test("policy evaluation preserves the accepted minimum boundary and rejection precedence", () => {
  expect(evaluateTokenPolicy([], policy.mint, 100n)).toEqual({
    accepted: false,
    code: "unsupported_mint",
  });
  expect(
    evaluateTokenPolicy([{ ...policy, enabled: false }], policy.mint, 0n),
  ).toMatchObject({ accepted: false, code: "token_disabled" });
  expect(evaluateTokenPolicy([policy], policy.mint, 94n)).toMatchObject({
    accepted: false,
    code: "amount_below_minimum",
  });
  expect(evaluateTokenPolicy([policy], policy.mint, 95n)).toEqual({
    accepted: true,
    policy,
  });
  expect(evaluateTokenPolicy([policy], policy.mint)).toEqual({
    accepted: true,
    policy,
  });
});
