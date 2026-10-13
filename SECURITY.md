# Security

`@timbagame/protocol` is a shared TypeScript library. It parses, validates and
formats data from the Timba contracts and Oracle. It holds no funds and no keys.

Treat every input it parses (amounts, accounts, indexer events, Oracle payloads)
as untrusted. A bug here can mislead a caller about game state. It does not
change what the contracts enforce on-chain. For the on-chain trust model, see
the [contracts security policy](https://github.com/timbagame/contracts/blob/main/SECURITY.md).

## Reporting

Do not publish exploit details, credentials or unrevealed secrets in an issue.
Report vulnerabilities privately through this repository's
[Security tab](https://github.com/timbagame/protocol/security/advisories/new).
