import * as z from "zod";
const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BASE64_PATTERN = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const U64_MAX = "18446744073709551615";
export const SolanaAddressSchema = z
    .string()
    .min(32)
    .max(44)
    .regex(BASE58_PATTERN)
    .brand();
export const SolanaSignatureSchema = z
    .string()
    .min(64)
    .max(128)
    .regex(BASE58_PATTERN)
    .brand();
export const Base64TransactionSchema = z
    .string()
    .min(1)
    .max(16_384)
    .regex(BASE64_PATTERN)
    .brand();
export const Hex32Schema = z
    .string()
    .length(64)
    .regex(/^[0-9a-f]+$/i)
    .brand();
export const U64StringSchema = z
    .string()
    .max(U64_MAX.length)
    .regex(/^(0|[1-9]\d*)$/)
    .refine((value) => value.length < U64_MAX.length || value <= U64_MAX, "Value exceeds u64")
    .brand();
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
export function defineEndpoint(endpoint) {
    return endpoint;
}
export async function parseJsonResponse(response, schema) {
    const value = await response.json();
    return schema.parse(value);
}
export function jsonResponse(schema, value, init) {
    return Response.json(schema.parse(value), init);
}
//# sourceMappingURL=index.js.map