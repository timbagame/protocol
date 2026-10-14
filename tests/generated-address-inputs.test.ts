import { expect, test } from "bun:test";
import { address, createNoopSigner } from "@solana/kit";
import * as v020 from "../src/contracts/v0.2.0/generated/index.js";
import * as v030 from "../src/contracts/v0.3.0/generated/index.js";

for (const [version, client] of [
  ["v0.2.0", v020],
  ["v0.3.0", v030],
] as const) {
  test(`${version} address-bearing inputs preserve event bytes and PDA seeds`, async () => {
    const operator = address("So11111111111111111111111111111111111111112");
    const signer = createNoopSigner(operator);
    const event = {
      operator,
      feePercentage: 5,
      oracleBufferTime: 10n,
      maxTickets: 10,
      maxTimeout: 60n,
      minTimeout: 1n,
    };
    const encoder = client.getOracleInitializedEventEncoder();
    const bytes = encoder.encode(event);
    expect(encoder.encode({ ...event, operator: signer })).toEqual(bytes);
    expect(client.getOracleInitializedEventDecoder().decode(bytes)).toEqual(
      event,
    );
    expect(await client.findGameVaultPda({ tokenMint: signer })).toEqual(
      await client.findGameVaultPda({ tokenMint: operator }),
    );
  });
}
