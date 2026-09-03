import timbaIdlJson from "./timba.json" with { type: "json" };
import type { Timba } from "./timba.js";

export const CONTRACT_VERSION = "0.3.0" as const;
export const timbaIdlV030 = timbaIdlJson as unknown as Timba;
export type { Timba as TimbaV030 } from "./timba.js";
