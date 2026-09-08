import { parseTokenAmount } from "../amounts/index.js";
import type { GameReference } from "./index.js";

export const CLIENT_GAME_LIMITS = {
  maxPlayers: 100,
  maxTimeout: 86400,
  defaultTimeout: 3600,
  defaultBuffer: 3600,
} as const;
export const GAME_DEFAULTS = {
  coinflip: { minPlayers: 2, maxPlayers: 2 },
  giveaway: { minPlayers: 1, maxPlayers: 10 },
} as const;
export interface GameDraft {
  type: "coinflip" | "giveaway";
  tokenMint: string;
  amount: string;
  minPlayers: number;
  maxPlayers: number;
  timeoutMinutes: number;
  isPrivate?: boolean;
}
export interface GameCapabilities {
  privateGames: boolean;
  minTimeout: number;
  maxTimeout: number;
  maxPlayers: number;
}
export const gameCapabilities = (
  chain: "solana" | "evm",
): GameCapabilities => ({
  privateGames: chain === "evm",
  minTimeout: chain === "evm" ? 300 : 60,
  maxTimeout: CLIENT_GAME_LIMITS.maxTimeout,
  maxPlayers: CLIENT_GAME_LIMITS.maxPlayers,
});
/** Validates user input without signing, RPC calls, implicit rounding or float amounts. */
export function validateGameDraft(
  draft: GameDraft,
  token: { decimals: number; minimumAmount: string },
  capabilities: GameCapabilities,
) {
  const amount = parseTokenAmount(draft.amount, token.decimals);
  const minimum = parseTokenAmount(token.minimumAmount, token.decimals);
  const floor = draft.type === "coinflip" ? 2 : 1;
  if (
    amount <= 0n ||
    amount < minimum ||
    !Number.isInteger(draft.minPlayers) ||
    !Number.isInteger(draft.maxPlayers) ||
    draft.minPlayers < floor ||
    draft.maxPlayers < draft.minPlayers ||
    draft.maxPlayers > capabilities.maxPlayers ||
    !Number.isInteger(draft.timeoutMinutes) ||
    draft.timeoutMinutes * 60 < capabilities.minTimeout ||
    draft.timeoutMinutes * 60 > capabilities.maxTimeout ||
    (draft.isPrivate && !capabilities.privateGames)
  )
    throw new Error("Invalid game terms");
  return amount;
}
/** Always include deployment and network in cache, journal and UI identity. */
export function gameReferenceKey(reference: GameReference): string {
  return JSON.stringify(
    reference.chain === "evm"
      ? [
          "evm",
          reference.chainId.toString(),
          reference.deployment.toLowerCase(),
          reference.gameId.toLowerCase(),
        ]
      : ["solana", reference.network, reference.deployment, reference.gameId],
  );
}
export function gamePath(reference: GameReference): string {
  const base = `/play/games/${encodeURIComponent(reference.gameId)}`;
  return reference.chain === "evm"
    ? `${base}?chainId=${reference.chainId}&deployment=${encodeURIComponent(reference.deployment)}`
    : base;
}
export type ActionProgress =
  "awaiting-wallet" | "submitted" | "confirmed" | "failed";
export function transactionProgress(
  receipt: { success: boolean; confirmations: number } | null,
  required: number,
): ActionProgress {
  if (!Number.isInteger(required) || required < 1)
    throw new Error("Invalid confirmation depth");
  if (!receipt || receipt.confirmations < required) return "submitted";
  return receipt.success ? "confirmed" : "failed";
}
