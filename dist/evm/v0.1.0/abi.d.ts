export declare const timbaAbi: readonly [{
    readonly type: "constructor";
    readonly inputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "CREATE_TYPEHASH";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "JOIN_TYPEHASH";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_BUFFER";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_FEE";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_PLAYERS";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "MAX_TIMEOUT";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "UPGRADE_INTERFACE_VERSION";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "string";
        readonly internalType: "string";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "acceptOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "acceptUpgradeAuthority";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "closeGame";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "completeGame";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "secret";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "config";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "feePercentage";
        readonly type: "uint8";
        readonly internalType: "uint8";
    }, {
        readonly name: "buffer";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "minTimeout";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "maxTimeout";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }, {
        readonly name: "maxPlayers";
        readonly type: "uint32";
        readonly internalType: "uint32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "configure";
    readonly inputs: readonly [{
        readonly name: "next";
        readonly type: "tuple";
        readonly internalType: "struct Timba.OracleConfig";
        readonly components: readonly [{
            readonly name: "feePercentage";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "buffer";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "minTimeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxTimeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "createGame";
    readonly inputs: readonly [{
        readonly name: "request";
        readonly type: "tuple";
        readonly internalType: "struct Timba.CreateRequest";
        readonly components: readonly [{
            readonly name: "creator";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "gameType";
            readonly type: "uint8";
            readonly internalType: "enum Timba.GameType";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "minPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "timeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "isPrivate";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "commitment";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "signature";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }, {
        readonly name: "joinCreator";
        readonly type: "bool";
        readonly internalType: "bool";
    }];
    readonly outputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "creationDigest";
    readonly inputs: readonly [{
        readonly name: "request";
        readonly type: "tuple";
        readonly internalType: "struct Timba.CreateRequest";
        readonly components: readonly [{
            readonly name: "creator";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "gameType";
            readonly type: "uint8";
            readonly internalType: "enum Timba.GameType";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "minPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "timeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "isPrivate";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "commitment";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "creationNonces";
    readonly inputs: readonly [{
        readonly name: "creator";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "nonce";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "eip712Domain";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "fields";
        readonly type: "bytes1";
        readonly internalType: "bytes1";
    }, {
        readonly name: "name";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "version";
        readonly type: "string";
        readonly internalType: "string";
    }, {
        readonly name: "chainId";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "verifyingContract";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "salt";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "extensions";
        readonly type: "uint256[]";
        readonly internalType: "uint256[]";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "gameIdFor";
    readonly inputs: readonly [{
        readonly name: "creator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "getGame";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "tuple";
        readonly internalType: "struct Timba.Game";
        readonly components: readonly [{
            readonly name: "creator";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "gameType";
            readonly type: "uint8";
            readonly internalType: "enum Timba.GameType";
        }, {
            readonly name: "status";
            readonly type: "uint8";
            readonly internalType: "enum Timba.Status";
        }, {
            readonly name: "isPrivate";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "minPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "expiresAt";
            readonly type: "uint64";
            readonly internalType: "uint64";
        }, {
            readonly name: "ticketAmount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "totalAmount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "commitment";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "lastEntryBlock";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "participants";
            readonly type: "address[]";
            readonly internalType: "address[]";
        }];
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "initialize";
    readonly inputs: readonly [{
        readonly name: "operator";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "authority";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "initialConfig";
        readonly type: "tuple";
        readonly internalType: "struct Timba.OracleConfig";
        readonly components: readonly [{
            readonly name: "feePercentage";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "buffer";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "minTimeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxTimeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }];
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "invalidateCreationNonce";
    readonly inputs: readonly [{
        readonly name: "next";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "joinDigest";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "player";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "joinGame";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "deadline";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }, {
        readonly name: "signature";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "liabilities";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "amount";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "owner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "participantIndex";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "player";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [{
        readonly name: "indexPlusOne";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingOwner";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "pendingUpgradeAuthority";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "proposeUpgradeAuthority";
    readonly inputs: readonly [{
        readonly name: "next";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "proxiableUUID";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "refundPlayer";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "player";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "renounceOwnership";
    readonly inputs: readonly [];
    readonly outputs: readonly [];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "transferOwnership";
    readonly inputs: readonly [{
        readonly name: "next";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "nonpayable";
}, {
    readonly type: "function";
    readonly name: "upgradeAuthority";
    readonly inputs: readonly [];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "address";
        readonly internalType: "address";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "function";
    readonly name: "upgradeToAndCall";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly internalType: "address";
    }, {
        readonly name: "data";
        readonly type: "bytes";
        readonly internalType: "bytes";
    }];
    readonly outputs: readonly [];
    readonly stateMutability: "payable";
}, {
    readonly type: "function";
    readonly name: "winnerIndex";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }, {
        readonly name: "secret";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
    readonly outputs: readonly [{
        readonly name: "";
        readonly type: "uint256";
        readonly internalType: "uint256";
    }];
    readonly stateMutability: "view";
}, {
    readonly type: "event";
    readonly name: "EIP712DomainChanged";
    readonly inputs: readonly [];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "GameClosed";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "creator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "refund";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "GameCompleted";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "winner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "prize";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "fee";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "secret";
        readonly type: "bytes32";
        readonly indexed: false;
        readonly internalType: "bytes32";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "GameCreated";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "creator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "request";
        readonly type: "tuple";
        readonly indexed: false;
        readonly internalType: "struct Timba.CreateRequest";
        readonly components: readonly [{
            readonly name: "creator";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "token";
            readonly type: "address";
            readonly internalType: "address";
        }, {
            readonly name: "gameType";
            readonly type: "uint8";
            readonly internalType: "enum Timba.GameType";
        }, {
            readonly name: "amount";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "minPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "timeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "isPrivate";
            readonly type: "bool";
            readonly internalType: "bool";
        }, {
            readonly name: "commitment";
            readonly type: "bytes32";
            readonly internalType: "bytes32";
        }, {
            readonly name: "nonce";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }, {
            readonly name: "deadline";
            readonly type: "uint256";
            readonly internalType: "uint256";
        }];
    }, {
        readonly name: "expiresAt";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Initialized";
    readonly inputs: readonly [{
        readonly name: "version";
        readonly type: "uint64";
        readonly indexed: false;
        readonly internalType: "uint64";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "NonceInvalidated";
    readonly inputs: readonly [{
        readonly name: "creator";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "nonce";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OracleConfigured";
    readonly inputs: readonly [{
        readonly name: "config";
        readonly type: "tuple";
        readonly indexed: false;
        readonly internalType: "struct Timba.OracleConfig";
        readonly components: readonly [{
            readonly name: "feePercentage";
            readonly type: "uint8";
            readonly internalType: "uint8";
        }, {
            readonly name: "buffer";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "minTimeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxTimeout";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }, {
            readonly name: "maxPlayers";
            readonly type: "uint32";
            readonly internalType: "uint32";
        }];
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferStarted";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "OwnershipTransferred";
    readonly inputs: readonly [{
        readonly name: "previousOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "newOwner";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PlayerJoined";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "player";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "index";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "entryBlock";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "PlayerRefunded";
    readonly inputs: readonly [{
        readonly name: "gameId";
        readonly type: "bytes32";
        readonly indexed: true;
        readonly internalType: "bytes32";
    }, {
        readonly name: "player";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "amount";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "removedIndex";
        readonly type: "uint256";
        readonly indexed: false;
        readonly internalType: "uint256";
    }, {
        readonly name: "movedParticipant";
        readonly type: "address";
        readonly indexed: false;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "UpgradeAuthorityProposed";
    readonly inputs: readonly [{
        readonly name: "current";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "proposed";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "UpgradeAuthorityTransferred";
    readonly inputs: readonly [{
        readonly name: "previous";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }, {
        readonly name: "current";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "event";
    readonly name: "Upgraded";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly indexed: true;
        readonly internalType: "address";
    }];
    readonly anonymous: false;
}, {
    readonly type: "error";
    readonly name: "AddressEmptyCode";
    readonly inputs: readonly [{
        readonly name: "target";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC1967InvalidImplementation";
    readonly inputs: readonly [{
        readonly name: "implementation";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "ERC1967NonPayable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "EntryUnavailable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "FailedCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "GameUnavailable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidAuthorization";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidConfig";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidGame";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidInitialization";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidReveal";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidToken";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "InvalidTransfer";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "NotInitializing";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "OwnableInvalidOwner";
    readonly inputs: readonly [{
        readonly name: "owner";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "OwnableUnauthorizedAccount";
    readonly inputs: readonly [{
        readonly name: "account";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "RandomnessUnavailable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "RecoveryUnavailable";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "ReentrancyGuardReentrantCall";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "SafeERC20FailedOperation";
    readonly inputs: readonly [{
        readonly name: "token";
        readonly type: "address";
        readonly internalType: "address";
    }];
}, {
    readonly type: "error";
    readonly name: "UUPSUnauthorizedCallContext";
    readonly inputs: readonly [];
}, {
    readonly type: "error";
    readonly name: "UUPSUnsupportedProxiableUUID";
    readonly inputs: readonly [{
        readonly name: "slot";
        readonly type: "bytes32";
        readonly internalType: "bytes32";
    }];
}];
//# sourceMappingURL=abi.d.ts.map