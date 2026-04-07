import type { ProductUploadRow, RowError, ValidationResult } from "./types";
import { parseJsonField, toBoolean, toNumber } from "./utils";

const allowedConditions = ["new", "used", "refurbished"];

const validateCommonFields = (
  row: ProductUploadRow,
  rowNumber: number,
): RowError[] => {
  const errors: RowError[] = [];

  if (!row.name || String(row.name).trim() === "") {
    errors.push({ rowNumber, field: "name", issue: "Missing name" });
  }

  const numericFields: Array<keyof ProductUploadRow> = [
    "base_price",
    "price",
    "discounted_price",
    "stock",
  ];

  numericFields.forEach((field) => {
    const value = row[field];
    if (value !== "" && value !== undefined && value !== null) {
      if (toNumber(value) === null) {
        errors.push({ rowNumber, field, issue: `Invalid ${String(field)}` });
      }
    }
  });

  const booleanFields: Array<keyof ProductUploadRow> = [
    "has_variants",
    "is_private",
    "block_order",
    "enable_seo",
  ];

  booleanFields.forEach((field) => {
    const value = row[field];
    if (toBoolean(value) === null) {
      errors.push({
        rowNumber,
        field,
        issue: `Invalid boolean value for ${String(field)}`,
      });
    }
  });

  if (
    row.condition &&
    !allowedConditions.includes(String(row.condition).trim().toLowerCase())
  ) {
    errors.push({ rowNumber, field: "condition", issue: "Invalid condition" });
  }

  const jsonFields: Array<keyof ProductUploadRow> = [
    "images",
    "variant_types",
    "variant_combinations",
  ];

  jsonFields.forEach((field) => {
    const value = row[field];
    if (value !== "" && value !== undefined && value !== null) {
      const parsedValue = parseJsonField(value);
      if (parsedValue === null) {
        errors.push({
          rowNumber,
          field,
          issue: `Invalid JSON in ${String(field)}`,
        });
      }
    }
  });

  return errors;
};

const validateSimpleProduct = (
  row: ProductUploadRow,
  rowNumber: number,
  seenSkus: Set<string>,
): RowError[] => {
  const errors: RowError[] = [];

  const sku = String(row.sku || "").trim();

  if (!sku) {
    errors.push({ rowNumber, field: "sku", issue: "Missing sku" });
  } else if (seenSkus.has(sku)) {
    errors.push({ rowNumber, field: "sku", issue: "Duplicate SKU" });
  } else {
    seenSkus.add(sku);
  }

  if (toNumber(row.price) === null && toNumber(row.base_price) === null) {
    errors.push({
      rowNumber,
      field: "price",
      issue: "price or base_price is required",
    });
  }

  if (toNumber(row.stock) === null) {
    errors.push({ rowNumber, field: "stock", issue: "Missing stock" });
  }

  if (String(row.variant_types || "").trim() !== "") {
    errors.push({
      rowNumber,
      field: "variant_types",
      issue: "variant_types must be empty for non-variant product",
    });
  }

  if (String(row.variant_combinations || "").trim() !== "") {
    errors.push({
      rowNumber,
      field: "variant_combinations",
      issue: "variant_combinations must be empty for non-variant product",
    });
  }

  return errors;
};

const validateVariantProduct = (
  row: ProductUploadRow,
  rowNumber: number,
  seenSkus: Set<string>,
): RowError[] => {
  const errors: RowError[] = [];

  const variantTypes = parseJsonField(row.variant_types);
  const variantCombinations = parseJsonField(row.variant_combinations);

  if (!Array.isArray(variantTypes) || variantTypes.length === 0) {
    errors.push({
      rowNumber,
      field: "variant_types",
      issue: "variant_types is required for variant product",
    });
  }

  if (!Array.isArray(variantCombinations) || variantCombinations.length === 0) {
    errors.push({
      rowNumber,
      field: "variant_combinations",
      issue: "variant_combinations is required for variant product",
    });
  }

  if (errors.length > 0) return errors;

  const variantTypeNames = variantTypes
    .map((vt: { name?: string }) => vt?.name)
    .filter(Boolean) as string[];

  variantCombinations.forEach(
    (
      variant: {
        sku?: string;
        price?: unknown;
        stock?: unknown;
        attributes?: Record<string, string>;
      },
      index: number,
    ) => {
      const variantSku = String(variant?.sku || "").trim();

      if (!variantSku) {
        errors.push({
          rowNumber,
          field: "variant_combinations",
          issue: `Variant ${index + 1} missing sku`,
        });
      } else if (seenSkus.has(variantSku)) {
        errors.push({
          rowNumber,
          field: "variant_combinations",
          issue: `Duplicate SKU: ${variantSku}`,
        });
      } else {
        seenSkus.add(variantSku);
      }

      if (toNumber(variant?.price) === null) {
        errors.push({
          rowNumber,
          field: "variant_combinations",
          issue: `Variant ${index + 1} has invalid price`,
        });
      }

      if (toNumber(variant?.stock) === null) {
        errors.push({
          rowNumber,
          field: "variant_combinations",
          issue: `Variant ${index + 1} has invalid stock`,
        });
      }

      if (!variant?.attributes || typeof variant.attributes !== "object") {
        errors.push({
          rowNumber,
          field: "variant_combinations",
          issue: `Variant ${index + 1} missing attributes`,
        });
        return;
      }

      const attributeKeys = Object.keys(variant.attributes);

      variantTypeNames.forEach((variantTypeName) => {
        if (!attributeKeys.includes(variantTypeName)) {
          errors.push({
            rowNumber,
            field: "variant_combinations",
            issue: `Variant attribute mismatch: missing ${variantTypeName}`,
          });
        }
      });
    },
  );

  return errors;
};

export const validateRow = (
  row: ProductUploadRow,
  rowNumber: number,
  seenSkus: Set<string>,
): ValidationResult => {
  const errors: RowError[] = [];

  errors.push(...validateCommonFields(row, rowNumber));

  const hasVariants = toBoolean(row.has_variants);

  if (hasVariants === false) {
    errors.push(...validateSimpleProduct(row, rowNumber, seenSkus));
  }

  if (hasVariants === true) {
    errors.push(...validateVariantProduct(row, rowNumber, seenSkus));
  }

  return { isValid: errors.length === 0, errors };
};