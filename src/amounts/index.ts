/** Exact token amounts. No floating point conversion or implicit rounding. */
export class TokenAmountError extends Error {
  constructor(
    readonly code: "decimals" | "format" | "precision",
    message: string,
  ) {
    super(message);
    this.name = "TokenAmountError";
  }
}

function assertDecimals(decimals: number): void {
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 255) {
    throw new TokenAmountError(
      "decimals",
      "Decimals must be an integer between 0 and 255",
    );
  }
}

/** Accepts unsigned decimal strings, including .5 and 1., with surrounding whitespace. */
export function parseTokenAmount(value: string, decimals: number): bigint {
  assertDecimals(decimals);
  const normalized = value.trim();
  if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(normalized)) {
    throw new TokenAmountError("format", "Invalid amount format");
  }
  const [whole = "", fraction = ""] = normalized.split(".");
  if (fraction.length > decimals) {
    throw new TokenAmountError(
      "precision",
      `This token supports ${decimals} decimal places`,
    );
  }
  return (
    BigInt(whole || "0") * 10n ** BigInt(decimals) +
    BigInt(fraction.padEnd(decimals, "0") || "0")
  );
}

/** Formats unsigned base units without rounding, including zero-decimal tokens. */
export function formatTokenAmount(value: bigint, decimals: number): string {
  assertDecimals(decimals);
  if (value < 0n)
    throw new TokenAmountError("format", "Amount must be non-negative");
  if (decimals === 0) return value.toString();
  const padded = value.toString().padStart(decimals + 1, "0");
  const whole = padded.slice(0, -decimals);
  const fraction = trimTrailingZeros(padded.slice(-decimals));
  return fraction ? `${whole}.${fraction}` : whole;
}

/** Linear-time trailing zero trim; avoids a backtracking regular expression. */
function trimTrailingZeros(digits: string): string {
  let end = digits.length;
  while (end > 0 && digits[end - 1] === "0") end -= 1;
  return digits.slice(0, end);
}
