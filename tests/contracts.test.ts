import { describe, expect, test } from "bun:test";
import {
  CONTRACT_CAPABILITIES,
  DEFAULT_CONTRACT_VERSION,
  getContractCapabilities,
  parseContractVersion,
} from "../src/contracts/index.js";
import { timbaIdlV020 } from "../src/contracts/v0.2.0/index.js";
import {
  getJoinGameDiscriminatorBytes as getJoinGameDiscriminatorBytesV020,
  identifyTimbaInstruction as identifyTimbaInstructionV020,
  TIMBA_PROGRAM_ADDRESS as TIMBA_PROGRAM_ADDRESS_V020,
  TimbaInstruction as TimbaInstructionV020,
} from "../src/contracts/v0.2.0/generated/index.js";
import { timbaIdlV030 } from "../src/contracts/v0.3.0/index.js";
import {
  getOperatorCloseGameDiscriminatorBytes,
  identifyTimbaInstruction as identifyTimbaInstructionV030,
  TIMBA_PROGRAM_ADDRESS as TIMBA_PROGRAM_ADDRESS_V030,
  TimbaInstruction as TimbaInstructionV030,
} from "../src/contracts/v0.3.0/generated/index.js";

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

  test("generates version-specific Kit clients from the IDL snapshots", () => {
    expect(String(TIMBA_PROGRAM_ADDRESS_V020)).toBe(timbaIdlV020.address);
    expect(String(TIMBA_PROGRAM_ADDRESS_V030)).toBe(timbaIdlV030.address);
    expect(
      identifyTimbaInstructionV020(getJoinGameDiscriminatorBytesV020()),
    ).toBe(TimbaInstructionV020.JoinGame);
    expect(
      identifyTimbaInstructionV030(getOperatorCloseGameDiscriminatorBytes()),
    ).toBe(TimbaInstructionV030.OperatorCloseGame);
  });
});
