import type { ProductUploadRow } from "./types";
import { parseJsonField, toBoolean, toNumber } from "./utils";

export const transformRow = (row: ProductUploadRow) => {
  const hasVariants = toBoolean(row.has_variants) ?? false;

  return {
    name: row.name?.trim() || null,
    description: row.description?.trim() || null,
    rich_description: row.rich_description?.trim() || null,
    brand_id: row.brand_id?.trim() || null,
    category_id: row.category_id?.trim() || null,
    sku: hasVariants ? null : row.sku?.trim() || null,
    base_price: toNumber(row.base_price),
    price: toNumber(row.price),
    discounted_price: toNumber(row.discounted_price),
    stock: hasVariants ? null : toNumber(row.stock),
    condition: row.condition?.trim().toLowerCase() || "new",
    has_variants: hasVariants,
    is_private: toBoolean(row.is_private) ?? false,
    block_order: toBoolean(row.block_order) ?? false,
    enable_seo: toBoolean(row.enable_seo) ?? false,
    seo_keywords: parseJsonField(row.seo_keywords) ?? [],
    seo_meta_title: row.seo_meta_title?.trim() || null,
    seo_meta_description: row.seo_meta_description?.trim() || null,
    images: parseJsonField(row.images) ?? [],
    variant_types: hasVariants ? parseJsonField(row.variant_types) ?? [] : [],
    variant_combinations: hasVariants
      ? parseJsonField(row.variant_combinations) ?? []
      : [],
  };
};