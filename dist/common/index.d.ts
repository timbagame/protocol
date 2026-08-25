import * as z from "zod";
export declare const SolanaAddressSchema: z.core.$ZodBranded<z.ZodString, "SolanaAddress", "out">;
export declare const SolanaSignatureSchema: z.core.$ZodBranded<z.ZodString, "SolanaSignature", "out">;
export declare const Base64TransactionSchema: z.core.$ZodBranded<z.ZodString, "Base64Transaction", "out">;
export declare const Hex32Schema: z.core.$ZodBranded<z.ZodString, "Hex32", "out">;
export declare const U64StringSchema: z.core.$ZodBranded<z.ZodString, "U64String", "out">;
export declare const NonNegativeIntegerSchema: z.ZodNumber;
export declare const PositiveIntegerSchema: z.ZodNumber;
export declare const UnixTimestampSchema: z.ZodNumber;
export declare const SlotSchema: z.ZodNumber;
export declare const NullablePriceUsdSchema: z.ZodNullable<z.ZodNumber>;
export declare const ServiceMetadataSchema: z.ZodObject<{
    name: z.ZodString;
    version: z.ZodString;
    environment: z.ZodString;
    uptime: z.ZodNumber;
}, z.core.$strip>;
export declare const ServiceEnvelopeSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const ApiErrorSchema: z.ZodObject<{
    timestamp: z.ZodISODateTime;
    service: z.ZodObject<{
        name: z.ZodString;
        version: z.ZodString;
        environment: z.ZodString;
        uptime: z.ZodNumber;
    }, z.core.$strip>;
    success: z.ZodLiteral<false>;
    error: z.ZodString;
}, z.core.$strip>;
export declare const SimpleApiErrorSchema: z.ZodObject<{
    error: z.ZodString;
}, z.core.$strip>;
export type SolanaAddress = z.infer<typeof SolanaAddressSchema>;
export type SolanaSignature = z.infer<typeof SolanaSignatureSchema>;
export type Base64Transaction = z.infer<typeof Base64TransactionSchema>;
export type U64String = z.infer<typeof U64StringSchema>;
export type ApiError = z.infer<typeof ApiErrorSchema>;
export interface RestEndpoint<TMethod extends "GET" | "POST" | "PUT" | "PATCH" | "DELETE", TPath extends string, TQuery extends z.ZodType = z.ZodType, TBody extends z.ZodType = z.ZodType, TResponses extends Readonly<Record<number, z.ZodType>> = Readonly<Record<number, z.ZodType>>> {
    readonly method: TMethod;
    readonly path: TPath;
    readonly authenticated: boolean;
    readonly query?: TQuery;
    readonly body?: TBody;
    readonly responses: TResponses;
}
export declare function defineEndpoint<const TEndpoint extends RestEndpoint<any, any, any, any, any>>(endpoint: TEndpoint): TEndpoint;
export declare function parseJsonResponse<S extends z.ZodType>(response: Response, schema: S): Promise<z.output<S>>;
export declare function jsonResponse<S extends z.ZodType>(schema: S, value: unknown, init?: ResponseInit): Response;
//# sourceMappingURL=index.d.ts.map