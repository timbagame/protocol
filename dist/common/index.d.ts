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
export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
export interface RestEndpoint<TMethod extends HttpMethod, TPath extends string, TParams extends z.ZodType | undefined = undefined, TQuery extends z.ZodType | undefined = undefined, TBody extends z.ZodType | undefined = undefined, TResponses extends Readonly<Record<number, z.ZodType>> = Readonly<Record<number, z.ZodType>>> {
    readonly method: TMethod;
    readonly path: TPath;
    readonly authenticated: boolean;
    readonly params?: TParams;
    readonly query?: TQuery;
    readonly body?: TBody;
    readonly responses: TResponses;
}
export type AnyRestEndpoint = RestEndpoint<HttpMethod, string, z.ZodType | undefined, z.ZodType | undefined, z.ZodType | undefined, Readonly<Record<number, z.ZodType>>>;
export declare function defineEndpoint<const TEndpoint extends AnyRestEndpoint>(endpoint: TEndpoint): TEndpoint;
type EndpointSchemaInput<TEndpoint, TKey extends "params" | "query" | "body"> = TEndpoint extends Record<TKey, infer TSchema> ? TSchema extends z.ZodType ? z.input<TSchema> : never : never;
type EndpointPayload<TEndpoint> = (TEndpoint extends {
    params: z.ZodType;
} ? {
    params: EndpointSchemaInput<TEndpoint, "params">;
} : object) & (TEndpoint extends {
    query: z.ZodType;
} ? {
    query: EndpointSchemaInput<TEndpoint, "query">;
} : object) & (TEndpoint extends {
    body: z.ZodType;
} ? {
    body: EndpointSchemaInput<TEndpoint, "body">;
} : object);
export interface EndpointRequestOptions {
    readonly request?: Omit<RequestInit, "body" | "method">;
}
export type EndpointInput<TEndpoint extends AnyRestEndpoint> = EndpointPayload<TEndpoint> & EndpointRequestOptions;
type HasEndpointPayload<TEndpoint> = TEndpoint extends {
    params: z.ZodType;
} | {
    query: z.ZodType;
} | {
    body: z.ZodType;
} ? true : false;
type EndpointArguments<TEndpoint extends AnyRestEndpoint> = HasEndpointPayload<TEndpoint> extends true ? [input: EndpointInput<TEndpoint>] : [input?: EndpointRequestOptions];
type EndpointResponses<TEndpoint extends AnyRestEndpoint> = TEndpoint extends {
    responses: infer TResponses extends Readonly<Record<number, z.ZodType>>;
} ? TResponses : never;
type EndpointStatus<TEndpoint extends AnyRestEndpoint> = Extract<keyof EndpointResponses<TEndpoint>, number>;
export type EndpointResult<TEndpoint extends AnyRestEndpoint> = {
    [TStatus in EndpointStatus<TEndpoint>]: {
        readonly status: TStatus;
        readonly data: z.output<EndpointResponses<TEndpoint>[TStatus]>;
        readonly response: Response;
    };
}[EndpointStatus<TEndpoint>];
export type RestContract = Readonly<Record<string, AnyRestEndpoint>>;
export type RestClient<TContract extends RestContract> = {
    readonly [TName in keyof TContract]: (...args: EndpointArguments<TContract[TName]>) => Promise<EndpointResult<TContract[TName]>>;
};
export type FetchLike = (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
export interface RestClientOptions {
    readonly baseUrl: string;
    readonly fetch?: FetchLike;
    readonly headers?: HeadersInit;
    readonly getHeaders?: (endpoint: AnyRestEndpoint) => HeadersInit | Promise<HeadersInit>;
}
export declare class ProtocolHttpError extends Error {
    readonly status: number;
    readonly response: Response;
    readonly data?: unknown;
    constructor(message: string, status: number, response: Response, data?: unknown, options?: ErrorOptions);
}
export declare class ProtocolResponseError extends Error {
    readonly status: number;
    readonly response: Response;
    constructor(message: string, status: number, response: Response, options?: ErrorOptions);
}
export declare function createRestClient<const TContract extends RestContract>(contract: TContract, options: RestClientOptions): RestClient<TContract>;
export declare function expectStatus<TResult extends {
    readonly status: number;
    readonly data: unknown;
    readonly response: Response;
}, const TStatus extends TResult["status"]>(result: TResult, status: TStatus): Extract<TResult, {
    readonly status: TStatus;
}>;
export declare function parseJsonResponse<S extends z.ZodType>(response: Response, schema: S): Promise<z.output<S>>;
export declare function jsonResponse<S extends z.ZodType>(schema: S, value: unknown, init?: ResponseInit): Response;
export {};
//# sourceMappingURL=index.d.ts.map