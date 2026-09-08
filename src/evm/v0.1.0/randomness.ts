import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  sha256,
  size,
  type Hex,
} from "viem";
import type { EvmDeployment } from "../index.js";
import { evmDomain } from "./client.js";

export const EVM_RANDOMNESS_VERSION = "keccak256-domain-block-u256-v1" as const;
export function commitmentFor(secret: Hex): Hex {
  if (!/^0x[0-9a-fA-F]{64}$/.test(secret))
    throw new Error("Secret must be 32 bytes");
  return sha256(secret);
}
export function selectEvmWinnerFromEntropy(
  initialEntropy: Hex,
  participants: number,
) {
  if (
    !/^0x[0-9a-fA-F]{64}$/.test(initialEntropy) ||
    size(initialEntropy) !== 32
  )
    throw new Error("Entropy must be 32 bytes");
  if (
    !Number.isInteger(participants) ||
    participants < 1 ||
    participants > 1000
  )
    throw new Error("Participant count must be between 1 and 1000");
  const n = BigInt(participants);
  const threshold = (1n << 256n) % n;
  let entropy = initialEntropy;
  for (let round = 0; round < 32; round++) {
    const randomValue = BigInt(entropy);
    if (randomValue >= threshold)
      return { randomValue, winnerIndex: Number(randomValue % n) };
    entropy = keccak256(
      encodeAbiParameters(parseAbiParameters("bytes32,uint256"), [
        entropy,
        BigInt(round),
      ]),
    );
  }
  throw new Error("Unable to generate unbiased randomness");
}
export function calculateEvmWinner(
  deployment: EvmDeployment,
  gameId: Hex,
  secret: Hex,
  commitment: Hex,
  lastEntryBlock: bigint,
  participants: number,
) {
  if (commitmentFor(secret).toLowerCase() !== commitment.toLowerCase())
    throw new Error("Invalid reveal");
  const domain = evmDomain(deployment);
  const entropy = keccak256(
    encodeAbiParameters(
      parseAbiParameters("uint256,address,bytes32,bytes32,uint256"),
      [
        BigInt(domain.chainId),
        domain.verifyingContract,
        gameId,
        secret,
        lastEntryBlock,
      ],
    ),
  );
  return selectEvmWinnerFromEntropy(entropy, participants);
}
