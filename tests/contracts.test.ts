import { describe, expect, test } from "bun:test";
import {
  CONTRACT_CAPABILITIES,
  DEFAULT_CONTRACT_VERSION,
  getContractCapabilities,
  parseContractVersion,
} from "../src/contracts/index.js";
import { timbaIdlV020 } from "../src/contracts/v0.2.0/index.js";
import { timbaIdlV030 } from "../src/contracts/v0.3.0/index.js";

describe("versioned contract artifacts", () => {
  test("exports immutable IDL snapshots", () => {
    expect(timbaIdlV020.metadata.version).toBe("0.2.0");
    expect(timbaIdlV030.metadata.version).toBe("0.3.0");
    expect(timbaIdlV020.address).toBe(timbaIdlV030.address);
  });

  test("defaults explicitly to the deployed contract", () => {
    expect(DEFAULT_CONTRACT_VERSION).toBe("0.2.0");
    expect(parseContractVersion(undefined)).toBe("0.2.0");
    expect(parseContractVersion(" 0.3.0 ")).toBe("0.3.0");
    expect(() => parseContractVersion("0.4.0")).toThrow(
      "CONTRACT_VERSION must be one of 0.2.0, 0.3.0",
    );
  });

  test("describes behavior without importing either IDL", () => {
    expect(getContractCapabilities("0.2.0")).toEqual({
      gameTokenAccount: true,
      oracleTokenPolicy: false,
      operatorGameClosedEvent: false,
      directCompletionFeeTransfer: false,
    });
    expect(CONTRACT_CAPABILITIES["0.3.0"]).toEqual({
      gameTokenAccount: false,
      oracleTokenPolicy: true,
      operatorGameClosedEvent: true,
      directCompletionFeeTransfer: true,
    });
  });
});
