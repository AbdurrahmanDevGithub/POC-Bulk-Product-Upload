export type ProductUploadRow = {
  name: string;
  description?: string;
  rich_description?: string;
  brand_id?: string;
  category_id?: string;
  sku?: string;
  base_price?: string | number;
  price?: string | number;
  discounted_price?: string | number;
  stock?: string | number;
  condition?: string;
  has_variants?: string | boolean;
  is_private?: string | boolean;
  block_order?: string | boolean;
  enable_seo?: string | boolean;
  seo_keywords?: string;
  seo_meta_title?: string;
  seo_meta_description?: string;
  images?: string;
  variant_types?: string;
  variant_combinations?: string;
};

export type RowError = {
  rowNumber: number;
  field: string;
  issue: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: RowError[];
};