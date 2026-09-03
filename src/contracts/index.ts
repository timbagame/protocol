export const SUPPORTED_CONTRACT_VERSIONS = ["0.2.0", "0.3.0"] as const;

export type ContractVersion = (typeof SUPPORTED_CONTRACT_VERSIONS)[number];

export const DEFAULT_CONTRACT_VERSION: ContractVersion = "0.2.0";

export interface ContractCapabilities {
  gameTokenAccount: boolean;
  oracleTokenPolicy: boolean;
  operatorGameClosedEvent: boolean;
  directCompletionFeeTransfer: boolean;
}

export const CONTRACT_CAPABILITIES = {
  "0.2.0": {
    gameTokenAccount: true,
    oracleTokenPolicy: false,
    operatorGameClosedEvent: false,
    directCompletionFeeTransfer: false,
  },
  "0.3.0": {
    gameTokenAccount: false,
    oracleTokenPolicy: true,
    operatorGameClosedEvent: true,
    directCompletionFeeTransfer: true,
  },
} as const satisfies Record<ContractVersion, ContractCapabilities>;

export function isContractVersion(value: string): value is ContractVersion {
  return (SUPPORTED_CONTRACT_VERSIONS as readonly string[]).includes(value);
}

export function parseContractVersion(
  value: string | undefined,
  variableName = "CONTRACT_VERSION",
): ContractVersion {
  const version = value?.trim() || DEFAULT_CONTRACT_VERSION;
  if (isContractVersion(version)) return version;

  throw new Error(
    `${variableName} must be one of ${SUPPORTED_CONTRACT_VERSIONS.join(", ")}; received ${version}`,
  );
}

export function getContractCapabilities(
  version: ContractVersion,
): ContractCapabilities {
  return CONTRACT_CAPABILITIES[version];
}
