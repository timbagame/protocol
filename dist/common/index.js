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
export class ProtocolHttpError extends Error {
    status;
    response;
    data;
    constructor(message, status, response, data, options) {
        super(message, options);
        this.status = status;
        this.response = response;
        this.data = data;
        this.name = "ProtocolHttpError";
    }
}
export class ProtocolResponseError extends Error {
    status;
    response;
    constructor(message, status, response, options) {
        super(message, options);
        this.status = status;
        this.response = response;
        this.name = "ProtocolResponseError";
    }
}
function joinUrl(baseUrl, path) {
    return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}
function interpolatePath(path, params) {
    const values = typeof params === "object" && params !== null
        ? params
        : {};
    const rendered = path.replace(/:([A-Za-z][A-Za-z0-9_]*)/g, (_, name) => {
        const value = values[name];
        if (typeof value !== "string" && typeof value !== "number") {
            throw new TypeError(`Missing path parameter: ${name}`);
        }
        return encodeURIComponent(String(value));
    });
    if (/:([A-Za-z][A-Za-z0-9_]*)/.test(rendered)) {
        throw new TypeError(`Unresolved path parameters in ${rendered}`);
    }
    return rendered;
}
function appendQuery(url, query) {
    if (typeof query !== "object" || query === null)
        return url;
    const search = new URLSearchParams();
    for (const [name, rawValue] of Object.entries(query)) {
        if (rawValue === undefined || rawValue === null)
            continue;
        const values = Array.isArray(rawValue) ? rawValue : [rawValue];
        for (const value of values) {
            if (!["string", "number", "boolean"].includes(typeof value)) {
                throw new TypeError(`Query parameter ${name} must be a primitive value`);
            }
            search.append(name, String(value));
        }
    }
    const serialized = search.toString();
    return serialized ? `${url}?${serialized}` : url;
}
function errorMessage(data) {
    if (typeof data !== "object" || data === null || !("error" in data)) {
        return undefined;
    }
    return typeof data.error === "string" ? data.error : undefined;
}
async function callEndpoint(endpoint, input, options) {
    const runtimeInput = (input ?? {});
    const params = endpoint.params?.parse(runtimeInput.params);
    const query = endpoint.query?.parse(runtimeInput.query);
    const body = endpoint.body?.parse(runtimeInput.body);
    const path = interpolatePath(endpoint.path, params);
    const url = appendQuery(joinUrl(options.baseUrl, path), query);
    const headers = new Headers(options.headers);
    new Headers(runtimeInput.request?.headers).forEach((value, name) => headers.set(name, value));
    const endpointHeaders = await options.getHeaders?.(endpoint);
    new Headers(endpointHeaders).forEach((value, name) => headers.set(name, value));
    headers.set("Accept", "application/json");
    if (endpoint.body)
        headers.set("Content-Type", "application/json");
    const fetcher = options.fetch ?? globalThis.fetch;
    const requestInit = {
        ...runtimeInput.request,
        method: endpoint.method,
        headers,
    };
    if (endpoint.body)
        requestInit.body = JSON.stringify(body);
    const response = await fetcher(url, requestInit);
    const schema = endpoint.responses[response.status];
    if (!schema) {
        throw new ProtocolHttpError(`Unexpected HTTP status ${response.status} for ${endpoint.method} ${endpoint.path}`, response.status, response);
    }
    let value;
    try {
        value = await response.json();
    }
    catch (cause) {
        throw new ProtocolResponseError(`Invalid JSON response for ${endpoint.method} ${endpoint.path}`, response.status, response, { cause });
    }
    let data;
    try {
        data = schema.parse(value);
    }
    catch (cause) {
        throw new ProtocolResponseError(`Invalid HTTP ${response.status} response for ${endpoint.method} ${endpoint.path}`, response.status, response, { cause });
    }
    return {
        status: response.status,
        data,
        response,
    };
}
export function createRestClient(contract, options) {
    if (!options.baseUrl.trim())
        throw new TypeError("baseUrl must not be empty");
    return Object.fromEntries(Object.entries(contract).map(([name, endpoint]) => [
        name,
        (input) => callEndpoint(endpoint, input, options),
    ]));
}
export function expectStatus(result, status) {
    if (result.status !== status) {
        const detail = errorMessage(result.data);
        throw new ProtocolHttpError(`Expected HTTP ${status}, received ${result.status}${detail ? `: ${detail}` : ""}`, result.status, result.response, result.data);
    }
    return result;
}
export async function parseJsonResponse(response, schema) {
    const value = await response.json();
    return schema.parse(value);
}
export function jsonResponse(schema, value, init) {
    return Response.json(schema.parse(value), init);
}
//# sourceMappingURL=index.js.map