# `@timbagame/protocol`

Runtime-validated HTTP contracts shared by independently deployed Timba services.

This package contains only JSON wire formats owned by Timba. The Anchor IDL remains the source of truth for the on-chain program, and third-party API schemas remain with their service adapters.

## Commands

```bash
bun install
bun run typecheck
bun test
bun run build
```

Import the smallest service boundary required by a consumer:

```ts
import { GenerateHashResponseSchema } from "@timbagame/protocol/oracle";
```
