import * as z from "zod";
import {
  ApiErrorSchema,
  Base64TransactionSchema,
  Hex32Schema,
  NonNegativeIntegerSchema,
  ServiceEnvelopeSchema,
  SolanaAddressSchema,
  SolanaSignatureSchema,
  U64StringSchema,
  defineEndpoint,
} from "../common/index.js";

const OracleSuccessSchema = ServiceEnvelopeSchema.extend({
  success: z.literal(true),
});

export const GenerateHashRequestSchema = z.strictObject({
  gameType: z.string().trim().toLowerCase().min(1).max(128).optional(),
});

export const GenerateHashResponseSchema = OracleSuccessSchema.extend({
  randomHash: Hex32Schema,
  gameAddress: SolanaAddressSchema,
  oracleOperator: SolanaAddressSchema,
});

export const SignGameTransactionRequestSchema = z.strictObject({
  txBase64: Base64TransactionSchema,
});

export const SignGameTransactionResponseSchema = OracleSuccessSchema.extend({
  txBase64: Base64TransactionSchema,
});

export const TokenPolicySchema = z
  .strictObject({
    mint: SolanaAddressSchema,
    enabled: z.boolean(),
    minimumAmountRaw: U64StringSchema,
    acceptedMinimumAmountRaw: U64StringSchema,
    revision: NonNegativeIntegerSchema,
    effectiveAt: z.iso.datetime(),
  })
  .refine(
    ({ minimumAmountRaw, acceptedMinimumAmountRaw }) =>
      BigInt(acceptedMinimumAmountRaw) <= BigInt(minimumAmountRaw),
    {
      message: "accepted minimum must not exceed the recommended minimum",
      path: ["acceptedMinimumAmountRaw"],
    },
  );

export const TokenPoliciesResponseSchema = OracleSuccessSchema.extend({
  policies: z.array(TokenPolicySchema),
});

export const CreationPolicyRejectionCodeSchema = z.enum([
  "unsupported_mint",
  "token_disabled",
  "amount_below_minimum",
  "policy_unavailable",
]);

export const CreationPolicyRejectionSchema = ApiErrorSchema.extend({
  code: CreationPolicyRejectionCodeSchema,
  mint: SolanaAddressSchema.optional(),
  minimumAmountRaw: U64StringSchema.optional(),
  acceptedMinimumAmountRaw: U64StringSchema.optional(),
  revision: NonNegativeIntegerSchema.optional(),
});

export const OracleHealthResponseSchema = OracleSuccessSchema.extend({
  status: z.literal("healthy"),
});

export const OracleStatsSchema = z.object({
  totalSecrets: NonNegativeIntegerSchema,
  usedSecrets: NonNegativeIntegerSchema,
  pendingGames: NonNegativeIntegerSchema,
  completedGames: NonNegativeIntegerSchema,
  cancelledGames: NonNegativeIntegerSchema,
  eventListening: z.boolean(),
  activeListeners: NonNegativeIntegerSchema,
});

export const OracleStatsResponseSchema = OracleSuccessSchema.extend({
  stats: OracleStatsSchema,
});

export const CompleteGameNowRequestSchema = z.strictObject({
  gameAddress: SolanaAddressSchema,
});

const CompleteGameBaseSchema = OracleSuccessSchema.extend({
  gameAddress: SolanaAddressSchema,
});

export const CompleteGameNowResponseSchema = z.discriminatedUnion("status", [
  CompleteGameBaseSchema.extend({ status: z.literal("in-flight") }),
  CompleteGameBaseSchema.extend({ status: z.literal("not-ready") }),
  CompleteGameBaseSchema.extend({
    status: z.literal("completed"),
    txHash: SolanaSignatureSchema,
    winnerAddress: SolanaAddressSchema,
    totalPot: z.number().finite().nonnegative(),
  }),
]);

export const oracleContract = {
  health: defineEndpoint({
    method: "GET",
    path: "/health",
    authenticated: false,
    responses: { 200: OracleHealthResponseSchema, 500: ApiErrorSchema },
  }),
  generateHash: defineEndpoint({
    method: "POST",
    path: "/generate-hash",
    authenticated: true,
    body: GenerateHashRequestSchema,
    responses: {
      200: GenerateHashResponseSchema,
      400: ApiErrorSchema,
      401: ApiErrorSchema,
      429: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  }),
  tokenPolicies: defineEndpoint({
    method: "GET",
    path: "/token-policies",
    authenticated: true,
    responses: {
      200: TokenPoliciesResponseSchema,
      401: ApiErrorSchema,
      429: ApiErrorSchema,
      500: ApiErrorSchema,
      503: ApiErrorSchema,
    },
  }),
  signGameTransaction: defineEndpoint({
    method: "POST",
    path: "/sign-game-transaction",
    authenticated: true,
    body: SignGameTransactionRequestSchema,
    responses: {
      200: SignGameTransactionResponseSchema,
      400: ApiErrorSchema,
      401: ApiErrorSchema,
      422: CreationPolicyRejectionSchema,
      429: ApiErrorSchema,
      500: ApiErrorSchema,
      503: ApiErrorSchema,
    },
  }),
  stats: defineEndpoint({
    method: "GET",
    path: "/stats",
    authenticated: true,
    responses: {
      200: OracleStatsResponseSchema,
      401: ApiErrorSchema,
      429: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  }),
  completeGameNow: defineEndpoint({
    method: "POST",
    path: "/games/complete-now",
    authenticated: true,
    body: CompleteGameNowRequestSchema,
    responses: {
      200: CompleteGameNowResponseSchema,
      400: ApiErrorSchema,
      401: ApiErrorSchema,
      404: ApiErrorSchema,
      409: ApiErrorSchema,
      429: ApiErrorSchema,
      500: ApiErrorSchema,
    },
  }),
} as const;

export type GenerateHashRequest = z.input<typeof GenerateHashRequestSchema>;
export type GenerateHashResponse = z.output<typeof GenerateHashResponseSchema>;
export type SignGameTransactionRequest = z.input<
  typeof SignGameTransactionRequestSchema
>;
export type SignGameTransactionResponse = z.output<
  typeof SignGameTransactionResponseSchema
>;
export type TokenPolicyInput = z.input<typeof TokenPolicySchema>;
export type TokenPolicy = z.output<typeof TokenPolicySchema>;
export type TokenPoliciesResponse = z.output<
  typeof TokenPoliciesResponseSchema
>;
export type CreationPolicyRejectionCode = z.output<
  typeof CreationPolicyRejectionCodeSchema
>;
export type CreationPolicyRejection = z.output<
  typeof CreationPolicyRejectionSchema
>;
export type OracleStats = z.output<typeof OracleStatsSchema>;
export type OracleStatsResponse = z.output<typeof OracleStatsResponseSchema>;

/** Pure eligibility check; callers own availability, metadata, and error presentation. */
export function evaluateTokenPolicy<
  T extends Pick<TokenPolicy, "mint" | "enabled" | "acceptedMinimumAmountRaw">,
>(
  policies: readonly T[],
  mint: string,
  amount?: bigint,
):
  | { accepted: true; policy: T }
  | {
      accepted: false;
      code: "unsupported_mint" | "token_disabled" | "amount_below_minimum";
      policy?: T;
    } {
  const policy = policies.find((policy) => policy.mint === mint);
  if (!policy) return { accepted: false, code: "unsupported_mint" };
  if (!policy.enabled)
    return { accepted: false, code: "token_disabled", policy };
  if (amount !== undefined && amount < BigInt(policy.acceptedMinimumAmountRaw))
    return { accepted: false, code: "amount_below_minimum", policy };
  return { accepted: true, policy };
}
