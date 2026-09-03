import timbaIdlJson from "./timba.json" with { type: "json" };
import type { Timba } from "./timba.js";

export const CONTRACT_VERSION = "0.2.0" as const;
export const timbaIdlV020 = timbaIdlJson as unknown as Timba;
export type { Timba as TimbaV020 } from "./timba.js";
