export declare const SUPPORTED_CONTRACT_VERSIONS: readonly ["0.2.0", "0.3.0"];
export type ContractVersion = (typeof SUPPORTED_CONTRACT_VERSIONS)[number];
export declare const DEFAULT_CONTRACT_VERSION: ContractVersion;
export interface ContractCapabilities {
    gameTokenAccount: boolean;
    oracleTokenPolicy: boolean;
    operatorGameClosedEvent: boolean;
    directCompletionFeeTransfer: boolean;
}
export declare const CONTRACT_CAPABILITIES: {
    readonly "0.2.0": {
        readonly gameTokenAccount: true;
        readonly oracleTokenPolicy: false;
        readonly operatorGameClosedEvent: false;
        readonly directCompletionFeeTransfer: false;
    };
    readonly "0.3.0": {
        readonly gameTokenAccount: false;
        readonly oracleTokenPolicy: true;
        readonly operatorGameClosedEvent: true;
        readonly directCompletionFeeTransfer: true;
    };
};
export declare function isContractVersion(value: string): value is ContractVersion;
export declare function parseContractVersion(value: string | undefined, variableName?: string): ContractVersion;
export declare function getContractCapabilities(version: ContractVersion): ContractCapabilities;
//# sourceMappingURL=index.d.ts.map