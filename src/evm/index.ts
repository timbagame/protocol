export const SUPPORTED_EVM_CONTRACT_VERSIONS = ["0.1.0"] as const;
export type EvmContractVersion =
  (typeof SUPPORTED_EVM_CONTRACT_VERSIONS)[number];
/** Interface selection is explicit; a proxy address does not prove its current version. */
export interface EvmDeployment {
  chainId: number;
  address: `0x${string}`;
  version: EvmContractVersion;
}
