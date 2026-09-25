import { describe, expect, test } from "bun:test";
import {
  formatTokenAmount,
  parseTokenAmount,
  TokenAmountError,
} from "../src/amounts/index.js";

describe("exact token amounts", () => {
  test("round trips base units without losing precision", () => {
    for (const decimals of [0, 1, 6, 9, 18, 255]) {
      for (const value of [
        0n,
        1n,
        99n,
        9007199254740993n,
        18446744073709551615n,
      ]) {
        expect(
          parseTokenAmount(formatTokenAmount(value, decimals), decimals),
        ).toBe(value);
      }
    }
    expect(formatTokenAmount(123n, 0)).toBe("123");
    expect(formatTokenAmount(1230000n, 6)).toBe("1.23");
  });

  test("accepts normalized unsigned decimal input and zero", () => {
    expect(parseTokenAmount(" .75 ", 2)).toBe(75n);
    expect(parseTokenAmount("001.", 0)).toBe(1n);
    expect(parseTokenAmount("0", 9)).toBe(0n);
  });

  test("rejects excess precision instead of silently changing the amount", () => {
    for (const input of ["1.001", "0.001", "1.000"]) {
      expect(() => parseTokenAmount(input, 2)).toThrow("2 decimal places");
    }
    expect(() => parseTokenAmount("1.1", 0)).toThrow("0 decimal places");
  });

  test("rejects invalid values and decimal counts", () => {
    for (const input of [
      "",
      " ",
      ".",
      "-1",
      "+1",
      "1e3",
      "Infinity",
      "1,000",
      "1.2.3",
    ]) {
      expect(() => parseTokenAmount(input, 9)).toThrow(TokenAmountError);
    }
    for (const decimals of [-1, 0.5, 256, NaN, Infinity]) {
      expect(() => parseTokenAmount("1", decimals)).toThrow(TokenAmountError);
      expect(() => formatTokenAmount(1n, decimals)).toThrow(TokenAmountError);
    }
    expect(() => formatTokenAmount(-1n, 9)).toThrow(TokenAmountError);
  });

  test("accepts exactly the same formats as the previous pattern", () => {
    const previous = /^(?:\d+\.?\d*|\.\d+)$/;
    const alphabet = ["0", "1", "9", ".", " ", "a", "-"];
    const inputs = [""];
    for (let length = 1; length <= 5; length += 1) {
      for (const prefix of inputs.filter(
        (input) => input.length === length - 1,
      )) {
        for (const char of alphabet) inputs.push(prefix + char);
      }
    }
    for (const input of inputs) {
      const accepted = (() => {
        try {
          parseTokenAmount(input, 255);
          return true;
        } catch {
          return false;
        }
      })();
      expect(accepted).toBe(previous.test(input.trim()));
    }
  });

  test("handles long runs of zeros in linear time", () => {
    const zeros = "0".repeat(100_000);
    const started = performance.now();
    expect(() => parseTokenAmount(`${zeros}x`, 18)).toThrow(TokenAmountError);
    expect(parseTokenAmount(`${zeros}.5`, 1)).toBe(5n);
    expect(formatTokenAmount(10n ** 250n, 255)).toBe("0.00001");
    expect(performance.now() - started).toBeLessThan(1_000);
  });
});
