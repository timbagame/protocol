import * as z from "zod";

const BASE58_PATTERN = /^[1-9A-HJ-NP-Za-km-z]+$/;
const BASE64_PATTERN =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const U64_MAX = "18446744073709551615";

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
  .max(U64_MAX.length)
  .regex(/^(0|[1-9]\d*)$/)
  .refine(
    (value) => value.length < U64_MAX.length || value <= U64_MAX,
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

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export interface RestEndpoint<
  TMethod extends HttpMethod,
  TPath extends string,
  TParams extends z.ZodType | undefined = undefined,
  TQuery extends z.ZodType | undefined = undefined,
  TBody extends z.ZodType | undefined = undefined,
  TResponses extends Readonly<Record<number, z.ZodType>> = Readonly<
    Record<number, z.ZodType>
  >,
> {
  readonly method: TMethod;
  readonly path: TPath;
  readonly authenticated: boolean;
  readonly params?: TParams;
  readonly query?: TQuery;
  readonly body?: TBody;
  readonly responses: TResponses;
}

export type AnyRestEndpoint = RestEndpoint<
  HttpMethod,
  string,
  z.ZodType | undefined,
  z.ZodType | undefined,
  z.ZodType | undefined,
  Readonly<Record<number, z.ZodType>>
>;

export function defineEndpoint<const TEndpoint extends AnyRestEndpoint>(
  endpoint: TEndpoint,
): TEndpoint {
  return endpoint;
}

type EndpointSchemaInput<TEndpoint, TKey extends "params" | "query" | "body"> =
  TEndpoint extends Record<TKey, infer TSchema>
    ? TSchema extends z.ZodType
      ? z.input<TSchema>
      : never
    : never;

type EndpointPayload<TEndpoint> = (TEndpoint extends {
  params: z.ZodType;
}
  ? { params: EndpointSchemaInput<TEndpoint, "params"> }
  : object) &
  (TEndpoint extends { query: z.ZodType }
    ? { query: EndpointSchemaInput<TEndpoint, "query"> }
    : object) &
  (TEndpoint extends { body: z.ZodType }
    ? { body: EndpointSchemaInput<TEndpoint, "body"> }
    : object);

export interface EndpointRequestOptions {
  readonly request?: Omit<RequestInit, "body" | "method">;
}

export type EndpointInput<TEndpoint extends AnyRestEndpoint> =
  EndpointPayload<TEndpoint> & EndpointRequestOptions;

type HasEndpointPayload<TEndpoint> = TEndpoint extends
  { params: z.ZodType } | { query: z.ZodType } | { body: z.ZodType }
  ? true
  : false;

type EndpointArguments<TEndpoint extends AnyRestEndpoint> =
  HasEndpointPayload<TEndpoint> extends true
    ? [input: EndpointInput<TEndpoint>]
    : [input?: EndpointRequestOptions];

type EndpointResponses<TEndpoint extends AnyRestEndpoint> = TEndpoint extends {
  responses: infer TResponses extends Readonly<Record<number, z.ZodType>>;
}
  ? TResponses
  : never;

type EndpointStatus<TEndpoint extends AnyRestEndpoint> = Extract<
  keyof EndpointResponses<TEndpoint>,
  number
>;

export type EndpointResult<TEndpoint extends AnyRestEndpoint> = {
  [TStatus in EndpointStatus<TEndpoint>]: {
    readonly status: TStatus;
    readonly data: z.output<EndpointResponses<TEndpoint>[TStatus]>;
    readonly response: Response;
  };
}[EndpointStatus<TEndpoint>];

export type RestContract = Readonly<Record<string, AnyRestEndpoint>>;

export type RestClient<TContract extends RestContract> = {
  readonly [TName in keyof TContract]: (
    ...args: EndpointArguments<TContract[TName]>
  ) => Promise<EndpointResult<TContract[TName]>>;
};

export type FetchLike = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

export interface RestClientOptions {
  readonly baseUrl: string;
  readonly fetch?: FetchLike;
  readonly headers?: HeadersInit;
  readonly getHeaders?: (
    endpoint: AnyRestEndpoint,
  ) => HeadersInit | Promise<HeadersInit>;
}

export class ProtocolHttpError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly response: Response,
    readonly data?: unknown,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ProtocolHttpError";
  }
}

export class ProtocolResponseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly response: Response,
    options?: ErrorOptions,
  ) {
    super(message, options);
    this.name = "ProtocolResponseError";
  }
}

type RuntimeEndpointInput = {
  readonly params?: unknown;
  readonly query?: unknown;
  readonly body?: unknown;
  readonly request?: Omit<RequestInit, "body" | "method">;
};

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl.replace(/\/$/, "")}/${path.replace(/^\//, "")}`;
}

function interpolatePath(path: string, params: unknown): string {
  const values =
    typeof params === "object" && params !== null
      ? (params as Readonly<Record<string, unknown>>)
      : {};
  const rendered = path.replace(
    /:([A-Za-z][A-Za-z0-9_]*)/g,
    (_, name: string) => {
      const value = values[name];
      if (typeof value !== "string" && typeof value !== "number") {
        throw new TypeError(`Missing path parameter: ${name}`);
      }
      return encodeURIComponent(String(value));
    },
  );
  if (/:([A-Za-z][A-Za-z0-9_]*)/.test(rendered)) {
    throw new TypeError(`Unresolved path parameters in ${rendered}`);
  }
  return rendered;
}

function appendQuery(url: string, query: unknown): string {
  if (typeof query !== "object" || query === null) return url;
  const search = new URLSearchParams();
  for (const [name, rawValue] of Object.entries(query)) {
    if (rawValue === undefined || rawValue === null) continue;
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    for (const value of values) {
      if (!["string", "number", "boolean"].includes(typeof value)) {
        throw new TypeError(
          `Query parameter ${name} must be a primitive value`,
        );
      }
      search.append(name, String(value));
    }
  }
  const serialized = search.toString();
  return serialized ? `${url}?${serialized}` : url;
}

function errorMessage(data: unknown): string | undefined {
  if (typeof data !== "object" || data === null || !("error" in data)) {
    return undefined;
  }
  return typeof data.error === "string" ? data.error : undefined;
}

async function callEndpoint<TEndpoint extends AnyRestEndpoint>(
  endpoint: TEndpoint,
  input: EndpointInput<TEndpoint> | EndpointRequestOptions | undefined,
  options: RestClientOptions,
): Promise<EndpointResult<TEndpoint>> {
  const runtimeInput = (input ?? {}) as RuntimeEndpointInput;
  const params = endpoint.params?.parse(runtimeInput.params);
  const query = endpoint.query?.parse(runtimeInput.query);
  const body = endpoint.body?.parse(runtimeInput.body);
  const path = interpolatePath(endpoint.path, params);
  const url = appendQuery(joinUrl(options.baseUrl, path), query);
  const headers = new Headers(options.headers);
  new Headers(runtimeInput.request?.headers).forEach((value, name) =>
    headers.set(name, value),
  );
  const endpointHeaders = await options.getHeaders?.(endpoint);
  new Headers(endpointHeaders).forEach((value, name) =>
    headers.set(name, value),
  );
  headers.set("Accept", "application/json");
  if (endpoint.body) headers.set("Content-Type", "application/json");

  const fetcher = options.fetch ?? globalThis.fetch;
  const requestInit: RequestInit = {
    ...runtimeInput.request,
    method: endpoint.method,
    headers,
  };
  if (endpoint.body) requestInit.body = JSON.stringify(body);
  const response = await fetcher(url, requestInit);
  const schema = endpoint.responses[response.status];
  if (!schema) {
    throw new ProtocolHttpError(
      `Unexpected HTTP status ${response.status} for ${endpoint.method} ${endpoint.path}`,
      response.status,
      response,
    );
  }

  let value: unknown;
  try {
    value = await response.json();
  } catch (cause) {
    throw new ProtocolResponseError(
      `Invalid JSON response for ${endpoint.method} ${endpoint.path}`,
      response.status,
      response,
      { cause },
    );
  }

  let data: unknown;
  try {
    data = schema.parse(value);
  } catch (cause) {
    throw new ProtocolResponseError(
      `Invalid HTTP ${response.status} response for ${endpoint.method} ${endpoint.path}`,
      response.status,
      response,
      { cause },
    );
  }

  return {
    status: response.status,
    data,
    response,
  } as EndpointResult<TEndpoint>;
}

export function createRestClient<const TContract extends RestContract>(
  contract: TContract,
  options: RestClientOptions,
): RestClient<TContract> {
  if (!options.baseUrl.trim()) throw new TypeError("baseUrl must not be empty");
  return Object.fromEntries(
    Object.entries(contract).map(([name, endpoint]) => [
      name,
      (input?: EndpointRequestOptions) =>
        callEndpoint(endpoint, input, options),
    ]),
  ) as unknown as RestClient<TContract>;
}

export function expectStatus<
  TResult extends {
    readonly status: number;
    readonly data: unknown;
    readonly response: Response;
  },
  const TStatus extends TResult["status"],
>(
  result: TResult,
  status: TStatus,
): Extract<TResult, { readonly status: TStatus }> {
  if (result.status !== status) {
    const detail = errorMessage(result.data);
    throw new ProtocolHttpError(
      `Expected HTTP ${status}, received ${result.status}${detail ? `: ${detail}` : ""}`,
      result.status,
      result.response,
      result.data,
    );
  }
  return result as Extract<TResult, { readonly status: TStatus }>;
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
