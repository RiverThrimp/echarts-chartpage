import type { ChartDataRecord, FieldsMapping, FieldsMappingInput } from "../types/index.js";

export type FieldKind = "number" | "time" | "string" | "boolean" | "unknown";

export function normalizeFields(fields: FieldsMappingInput): FieldsMapping {
  return {
    x: fields.x,
    y: Array.isArray(fields.y) ? Array.from(new Set(fields.y)) : [fields.y],
    series: fields.series,
    category: fields.category
  };
}

export function collectFieldNames(data: ChartDataRecord[]): string[] {
  const fieldSet = new Set<string>();
  for (const row of data) {
    for (const key of Object.keys(row)) {
      fieldSet.add(key);
    }
  }
  return Array.from(fieldSet);
}

export function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function toNumber(value: unknown): number | null {
  if (isFiniteNumber(value)) {
    return value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

export function inferFieldKind(data: ChartDataRecord[], field: string): FieldKind {
  const values = data
    .map((row) => row[field])
    .filter((value): value is Exclude<typeof value, undefined | null> => value !== undefined && value !== null);

  if (values.length === 0) {
    return "unknown";
  }

  if (values.every((value) => isFiniteNumber(value) || toNumber(value) !== null)) {
    return "number";
  }

  if (
    values.every(
      (value) =>
        typeof value === "string" &&
        value.trim().length > 0 &&
        !Number.isNaN(Date.parse(value))
    )
  ) {
    return "time";
  }

  if (values.every((value) => typeof value === "boolean")) {
    return "boolean";
  }

  return "string";
}

export function uniqueValues(data: ChartDataRecord[], field: string): Array<string | number | boolean | null> {
  const seen = new Set<string>();
  const values: Array<string | number | boolean | null> = [];
  for (const row of data) {
    const value = row[field] ?? null;
    const key = JSON.stringify(value);
    if (!seen.has(key)) {
      seen.add(key);
      values.push(value);
    }
  }
  return values;
}

export function sanitizeDataset(
  data: ChartDataRecord[],
  fields: string[],
  numericFields: string[]
): ChartDataRecord[] {
  return data.map((row) => {
    const nextRow: ChartDataRecord = {};
    for (const field of fields) {
      const value = row[field];
      if (numericFields.includes(field)) {
        nextRow[field] = toNumber(value);
      } else if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean" ||
        value === null
      ) {
        nextRow[field] = value;
      } else {
        nextRow[field] = value == null ? null : String(value);
      }
    }
    return nextRow;
  });
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export function titleCase(input: string): string {
  return input
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
