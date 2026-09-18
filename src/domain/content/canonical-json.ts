/**
 * AI School V3 — Project-Specific Deterministic Stable Canonical JSON V1 (stableCanonicalJsonV1)
 * 
 * NOTE: This is a project-specific deterministic JSON serialization format designed for
 * stable canonical content hashing. It does NOT claim official RFC 8785 / JCS compliance.
 * 
 * Guarantees byte-for-byte reproducibility:
 * - Deterministic UTF-16 code unit key ordering
 * - Normalized separators (',' and ':') without extraneous whitespace
 * - Strictly rejects NaN, Infinity, -Infinity, and undefined in root/primitive positions
 * - Normalized number serialization
 * - UTF-8 output encoding
 */

import * as crypto from "crypto";

export class CanonicalJsonSerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CanonicalJsonSerializationError";
  }
}

/**
 * Deterministically serializes JSON-compatible value to stable canonical string (V1).
 */
export function stableCanonicalJsonV1(value: unknown): string {
  if (value === null) {
    return "null";
  }

  const t = typeof value;

  if (t === "boolean") {
    return value ? "true" : "false";
  }

  if (t === "number") {
    const num = value as number;
    if (!Number.isFinite(num)) {
      throw new CanonicalJsonSerializationError(
        `Non-finite number (${num}) is forbidden in canonical JSON`
      );
    }
    if (Object.is(num, -0)) {
      return "0";
    }
    return num.toString();
  }

  if (t === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map((item) => {
      if (item === undefined || typeof item === "function" || typeof item === "symbol") {
        return "null";
      }
      return stableCanonicalJsonV1(item);
    });
    return "[" + items.join(",") + "]";
  }

  if (t === "object") {
    if (value === undefined) {
      throw new CanonicalJsonSerializationError("undefined is forbidden in canonical JSON");
    }

    const obj = value as Record<string, unknown>;
    // Deterministic sorting of object keys by UTF-16 code unit
    const sortedKeys = Object.keys(obj).sort();
    const pairs: string[] = [];

    for (const key of sortedKeys) {
      const val = obj[key];
      if (val === undefined || typeof val === "function" || typeof val === "symbol") {
        continue;
      }
      const serializedKey = JSON.stringify(key);
      const serializedVal = stableCanonicalJsonV1(val);
      pairs.push(`${serializedKey}:${serializedVal}`);
    }

    return "{" + pairs.join(",") + "}";
  }

  throw new CanonicalJsonSerializationError(`Unsupported type '${t}' in canonical JSON`);
}

/**
 * Serializes value to canonical UTF-8 bytes.
 */
export function stableCanonicalJsonBytes(value: unknown): Buffer {
  return Buffer.from(stableCanonicalJsonV1(value), "utf-8");
}

/**
 * Computes SHA-256 hash of deterministic stable canonical JSON representation.
 */
export function stableCanonicalJsonSha256(value: unknown): string {
  return crypto.createHash("sha256").update(stableCanonicalJsonBytes(value)).digest("hex");
}

// Backward-compatibility aliases
export const canonicalJsonStringify = stableCanonicalJsonV1;
export const canonicalJsonBytes = stableCanonicalJsonBytes;
export const canonicalJsonSha256 = stableCanonicalJsonSha256;
