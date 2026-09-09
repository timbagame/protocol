import { z } from "zod";
import { getAddress, type Hex } from "viem";
export const addressSchema = z
  .string()
  .regex(/^0x[0-9a-fA-F]{40}$/)
  .transform((value) => getAddress(value));
export const uintSchema = z
  .string()
  .regex(/^(0|[1-9][0-9]*)$/)
  .max(78)
  .refine((value) => BigInt(value) < 2n ** 256n);

export const evmTokenSchema = z.strictObject({
  address: addressSchema,
  symbol: z.string().regex(/^[A-Za-z0-9_-]{1,16}$/),
  decimals: z.number().int().min(0).max(36),
  minimumAmount: uintSchema.refine((value) => BigInt(value) > 0n),
});
export const evmMetadataSchema = z.object({
  chainId: z.number().int().positive().safe(),
  address: addressSchema,
  version: z.literal("0.1.0"),
  confirmations: z.number().int().min(1).max(256).default(2),
  buffer: z.number().int().min(1).max(86400).optional(),
  tokens: z
    .array(evmTokenSchema)
    .min(1)
    .refine(
      (tokens) =>
        new Set(tokens.map((t) => t.address)).size === tokens.length &&
        new Set(tokens.map((t) => t.symbol.toLowerCase())).size ===
          tokens.length,
      "Duplicate token policy",
    ),
});
export type EvmMetadata = z.output<typeof evmMetadataSchema>;
const hexSignature = z
  .string()
  .regex(/^0x(?:[a-fA-F0-9]{2})+$/)
  .max(8194)
  .transform((value) => value as Hex);
export const evmIntentSchema = z.strictObject({
  creator: addressSchema,
  token: addressSchema,
  gameType: z.union([z.literal(0), z.literal(1)]),
  amount: uintSchema,
  minPlayers: z.number().int().min(1).max(100),
  maxPlayers: z.number().int().min(1).max(100),
  timeout: z.number().int().min(300).max(86400),
  isPrivate: z.boolean(),
  nonce: uintSchema,
  deadline: uintSchema,
  proof: hexSignature,
});
export const evmPrivateJoinSchema = z.strictObject({
  gameId: z
    .string()
    .regex(/^0x[0-9a-fA-F]{64}$/)
    .transform((v) => v as Hex),
  player: addressSchema,
  deadline: uintSchema,
  proof: hexSignature,
});

const address = addressSchema;
const hex = z
  .string()
  .regex(/^0x[0-9a-fA-F]{64}$/)
  .transform((v) => v as Hex);
const integer = z
  .string()
  .regex(/^(0|[1-9][0-9]*)$/)
  .transform(BigInt);
export const evmGameResponseSchema = z.object({
  game: z.object({
    creator: address,
    token: address,
    gameType: z.union([z.literal(0), z.literal(1)]),
    status: z.number().int().min(0).max(3),
    isPrivate: z.boolean(),
    minPlayers: z.number().int(),
    maxPlayers: z.number().int(),
    expiresAt: integer,
    ticketAmount: integer,
    totalAmount: integer,
    commitment: hex,
    lastEntryBlock: integer,
    participants: z.array(address),
  }),
  events: z.array(
    z.object({
      transactionHash: hex,
      event: z.object({
        kind: z.string(),
        winner: address.optional(),
        prize: integer.optional(),
        fee: integer.optional(),
        secret: hex.nullable().optional(),
      }),
    }),
  ),
});
export type GameResponse = z.output<typeof evmGameResponseSchema>;

export const evmGamePageSchema = z.object({
  games: z.array(evmGameResponseSchema.extend({ id: hex })),
  nextOffset: z.number().int().nonnegative().nullable(),
});
export const evmAuthorizationSchema = z.object({
  gameId: hex,
  request: evmIntentSchema.omit({ proof: true }).extend({ commitment: hex }),
  signature: hexSignature,
});
