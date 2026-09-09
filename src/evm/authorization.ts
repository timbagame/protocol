import { getAddress, zeroHash } from "viem";
import { evmAuthorizationSchema } from "./http.js";
import { gameIdFor, type CreateGameRequest } from "./v0.1.0/client.js";
import type { EvmDeployment } from "./index.js";
/** Verify economic terms and identity before the adapter verifies the live operator signature. */
export function checkCreationAuthorization(
  deployment: EvmDeployment,
  expected: CreateGameRequest,
  input: unknown,
) {
  const response = evmAuthorizationSchema.parse(input);
  const request = {
    ...expected,
    creator: getAddress(expected.creator),
    token: getAddress(expected.token),
    commitment: response.request.commitment,
  };
  if (
    request.commitment === zeroHash ||
    response.gameId.toLowerCase() !==
      gameIdFor(deployment, expected.creator, expected.nonce)
  )
    throw new Error("Invalid game authorization");
  for (const key of Object.keys(request) as (keyof CreateGameRequest)[]) {
    if (String(response.request[key]) !== String(request[key]))
      throw new Error("Oracle changed game terms");
  }
  return { gameId: response.gameId, signature: response.signature, request };
}
