export const SUPPORTED_CONTRACT_VERSIONS = ["0.2.0", "0.3.0"];
export const DEFAULT_CONTRACT_VERSION = "0.2.0";
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
};
export function isContractVersion(value) {
    return SUPPORTED_CONTRACT_VERSIONS.includes(value);
}
export function parseContractVersion(value, variableName = "CONTRACT_VERSION") {
    const version = value?.trim() || DEFAULT_CONTRACT_VERSION;
    if (isContractVersion(version))
        return version;
    throw new Error(`${variableName} must be one of ${SUPPORTED_CONTRACT_VERSIONS.join(", ")}; received ${version}`);
}
export function getContractCapabilities(version) {
    return CONTRACT_CAPABILITIES[version];
}
//# sourceMappingURL=index.js.map