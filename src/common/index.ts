import * as z from "zod";

const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;

export const SolanaAddressSchema = z
  .string()
  .min(32)
  .max(44)
  .regex(BASE58_PATTERN)
  .brand<"SolanaAddress">();

export const SolanaSignatureSchema = z
  .string()
  .min(64)
  .max(128)
  .regex(BASE58_PATTERN)
  .brand<"SolanaSignature">();

export const Base64TransactionSchema = z
  .string()
  .min(1)
  .max(16_384)
  .regex(BASE64_PATTERN)
  .brand<"Base64Transaction">();

export const Hex32Schema = z
  .string()
  .length(64)
  .regex(/^[0-9a-f]+$/i)
  .brand<"Hex32">();

export const U64StringSchema = z
  .string()
  .regex(/^(0|[1-9]\d*)$/)
  .refine(
    (value) => BigInt(value) <= 18_446_744_073_709_551_615n,
    "Value exceeds u64",
  )
  .brand<"U64String">();

export const NonNegativeIntegerSchema = z.number().int().nonnegative();
export const PositiveIntegerSchema = z.number().int().positive();
export const UnixTimestampSchema = NonNegativeIntegerSchema;
export const SlotSchema = NonNegativeIntegerSchema;
export const NullablePriceUsdSchema = z
  .number()
  .finite()
  .nonnegative()
  .nullable();

export const ServiceMetadataSchema = z.object({
  name: z.string().min(1),
  version: z.string().min(1),
  environment: z.string().min(1),
  uptime: z.number().finite().nonnegative(),
});

export const ServiceEnvelopeSchema = z.object({
  timestamp: z.iso.datetime(),
  service: ServiceMetadataSchema,
});

export const ApiErrorSchema = ServiceEnvelopeSchema.extend({
  success: z.literal(false),
  error: z.string().min(1),
});

export const SimpleApiErrorSchema = z.object({
  error: z.string().min(1),
});

export type SolanaAddress = z.infer<typeof SolanaAddressSchema>;
export type SolanaSignature = z.infer<typeof SolanaSignatureSchema>;
export type Base64Transaction = z.infer<typeof Base64TransactionSchema>;
export type U64String = z.infer<typeof U64StringSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;

export interface RestEndpoint<
  TMethod extends "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
  TPath extends string,
  TQuery extends z.ZodType = z.ZodType,
  TBody extends z.ZodType = z.ZodType,
  TResponses extends Readonly<Record<number, z.ZodType>> = Readonly<
    Record<number, z.ZodType>
  >,
> {
  readonly method: TMethod;
  readonly path: TPath;
  readonly authenticated: boolean;
  readonly query?: TQuery;
  readonly body?: TBody;
  readonly responses: TResponses;
}

export function defineEndpoint<
  const TEndpoint extends RestEndpoint<any, any, any, any, any>,
>(endpoint: TEndpoint): TEndpoint {
  return endpoint;
}

export async function parseJsonResponse<S extends z.ZodType>(
  response: Response,
  schema: S,
): Promise<z.output<S>> {
  const value: unknown = await response.json();
  return schema.parse(value);
}

export function jsonResponse<S extends z.ZodType>(
  schema: S,
  value: unknown,
  init?: ResponseInit,
): Response {
  return Response.json(schema.parse(value), init);
}
