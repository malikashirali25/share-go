// Product Status Enum
export enum ProductStatus {
  PENDING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
}

// Report Status Enum
export enum ReportStatus {
  PENDING = 0,
  COMPLETED = 1,  // Backend uses "Completed", frontend can display as "Resolved" or "Completed"
}

// Product Condition Enum
export enum ProductCondition {
  NEW = 'new',
  LIKE_NEW = 'like_new',
  GOOD = 'good',
  FAIR = 'fair',
  POOR = 'poor',
}

// Condition display labels
export const CONDITION_LABELS: Record<ProductCondition, string> = {
  [ProductCondition.NEW]: 'New',
  [ProductCondition.LIKE_NEW]: 'Like New',
  [ProductCondition.GOOD]: 'Good',
  [ProductCondition.FAIR]: 'Fair',
  [ProductCondition.POOR]: 'Poor',
};

export interface Product {
  id: number;
  name: string;
  categoryId: number;
  addressId: number;
  price: number;
  description: string;
  tags: string;
  status: number;
  condition?: ProductCondition;
  views?: number;
  media?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProductRequest {
  name: string;
  categoryId: number;
  addressId: number;
  price: number;
  description: string;
  tags: string;
  status: number;
  condition?: ProductCondition;
}

export interface UpdateProductRequest {
  name?: string;
  categoryId?: number;
  addressId?: number;
  price?: number;
  description?: string;
  tags?: string;
  status?: number;
  condition?: ProductCondition;
}

export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
}

export interface ProductImage {
  id: number;
  productId: number;
  imageUrl: string;
  isPrimary?: boolean;
}

export interface ProductsResponse {
  products: Product[];
  counts: {
    active: number;
    completed: number;
  };
}

// Public Product interfaces (for public API endpoint)
export interface PublicProductMedia {
  id: number;
  productId: number;
  mediaUrl: string;
  type: string;
  sequence: number;
}

export interface PublicProductUser {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
  createdAt?: string;
}

export interface PublicProductAddress {
  id: number;
  address1: string;
  address2?: string;
  zipcode: string;
  city: string;
  state: string;
  country: string;
  lat?: number | string;
  lng?: number | string;
}

export interface PublicProduct {
  id: number;
  name: string;
  nameSlug: string;
  categoryId: number;
  price: number;
  description: string;
  views: number;
  tags: string;
  status: number;
  condition?: ProductCondition;
  createdAt: string;
  updatedAt: string;
  category: ProductCategory;
  user: PublicProductUser;
  media: PublicProductMedia[];
  address?: PublicProductAddress;
}

export interface PublicProductsResponse {
  message: string;
  status: boolean;
  data: {
    products: PublicProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface PublicProductDetailResponse {
  message: string;
  success?: boolean;
  status?: boolean; // Some APIs use 'status' instead of 'success'
  data: PublicProduct;
}

export interface ProductViewResponse {
  message: string;
  success?: boolean;
  status?: boolean;
  data: {
    id: number;
    views: number;
  };
}

export interface ProductReportUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ProductReport {
  id: number;
  reportedUserId: number;
  productId: number;
  message: string;
  createdAt: string;
  updatedAt: string;
  reportedUser: ProductReportUser;
}

export interface ProductReportsResponse {
  message: string;
  status: boolean;
  data: {
    reports: ProductReport[];
    total: number;
  };
  total: number;
}

// Reports listing response (GET /products/reports)
export interface ReportListingUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
}

export interface ReportListingProduct {
  id: number;
  name: string;
  nameSlug: string;
  image: string;
  price: number;
  status: number;
}

export interface ReportListingItem {
  id: number;
  message: string;
  status: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user: ReportListingUser;
  product: ReportListingProduct;
}

export interface ReportListingResponse {
  message: string;
  status: boolean;
  data: {
    reports: ReportListingItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    pendingReportsCount: number;
    resolvedReportsCount: number;
  };
}

// User's own reports response (GET /products/my-reports)
export interface MyReportProductOwner {
  id: number;
  firstName: string;
  lastName: string;
  image: string | null;
}

export interface MyReportProduct {
  id: number;
  name: string;
  nameSlug: string;
  image: string | null;
  price: string;
  status: number;
  owner: MyReportProductOwner | null;
}

export interface MyReport {
  id: number;
  productId: number;
  message: string | null;
  status: 0 | 1;  // 0 = Pending, 1 = Completed
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  product: MyReportProduct;
}

export interface MyReportsResponse {
  status: boolean;
  message: string;
  data: {
    reports: MyReport[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}