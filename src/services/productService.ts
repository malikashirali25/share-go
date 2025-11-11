import config from '../config';
import type {
  CreateProductRequest,
  UpdateProductRequest,
  Product,
  ProductCategory,
  PublicProductsResponse,
  PublicProductDetailResponse,
  ProductViewResponse,
} from '../interfaces/product';

class ProductService {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    // Get access token from localStorage if available
    const token = localStorage.getItem('sharego_token');
    
    const configOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      mode: 'cors',
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, configOptions);
      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'An error occurred',
          error: data.error,
        };
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw {
          status: 0,
          message: 'Network error. Please check your connection and ensure the backend server is running.',
          error: 'NetworkError',
        };
      }
      throw error;
    }
  }

  // Get product categories
  async getCategories(): Promise<ProductCategory[]> {
    return this.request<ProductCategory[]>('/products/categories');
  }

  // Create a new product
  async createProduct(productData: CreateProductRequest): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(productData),
    });
  }

  // Upload product images
  async uploadProductImages(productId: number, images: File[]): Promise<any> {
    const token = localStorage.getItem('sharego_token');
    const uploadResults = [];
    
    // Upload each image individually with sequence parameter
    for (let i = 0; i < images.length; i++) {
      const url = `${this.baseURL}/products/${productId}/upload`;
      const formData = new FormData();
      
      // Append the image file with field name 'file'
      formData.append('file', images[i]);
      
      // Append optional sequence parameter
      formData.append('sequence', (i + 1).toString());

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          ...(token && { 'Authorization': `Bearer ${token}` }),
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || `Image ${i + 1} upload failed`,
          error: data.error,
        };
      }

      uploadResults.push(data);
    }

    return uploadResults;
  }

  // Get all products
  async getProducts(params?: { categoryId?: number; searchKeywords?: string }): Promise<Product[]> {
    const queryParams = new URLSearchParams();
    if (params?.categoryId) {
      queryParams.append('categoryId', params.categoryId.toString());
    }
    if (params?.searchKeywords) {
      queryParams.append('searchKeywords', params.searchKeywords);
    }
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/products?${queryString}` : '/products';
    return this.request<Product[]>(endpoint);
  }

  // Get a single product by ID
  async getProductById(productId: number): Promise<Product> {
    return this.request<Product>(`/products/${productId}`);
  }

  // Update a product
  async updateProduct(productId: number, productData: UpdateProductRequest): Promise<Product> {
    return this.request<Product>(`/products/${productId}`, {
      method: 'PATCH',
      body: JSON.stringify(productData),
    });
  }

  // Update product status (for marking as sold/given away)
  async updateProductStatus(productId: number, status: number, userId?: number): Promise<Product> {
    const payload: { status: number; userId?: number } = { status };
    if (typeof userId === 'number') {
      payload.userId = userId;
    }

    return this.request<Product>(`/products/${productId}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
  }

  // Delete a product
  async deleteProduct(productId: number): Promise<void> {
    await this.request(`/products/${productId}`, {
      method: 'DELETE',
    });
  }

  // Delete product media
  async deleteProductMedia(mediaId: number): Promise<void> {
    await this.request(`/products/media/${mediaId}`, {
      method: 'DELETE',
    });
  }

  // Get public products (no authentication required)
  async getPublicProducts(params?: {
    categoryId?: number;
    minPrice?: number;
    maxPrice?: number;
    searchKeywords?: string;
    location?: string;
    page?: number;
    limit?: number;
  }): Promise<PublicProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.categoryId) {
      queryParams.append('categoryId', params.categoryId.toString());
    }
    if (params?.minPrice !== undefined) {
      queryParams.append('minPrice', params.minPrice.toString());
    }
    if (params?.maxPrice !== undefined) {
      queryParams.append('maxPrice', params.maxPrice.toString());
    }
    if (params?.searchKeywords) {
      queryParams.append('searchKeywords', params.searchKeywords);
    }
    if (params?.location) {
      queryParams.append('location', params.location);
    }
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/products/public${queryString ? `?${queryString}` : ''}`;
    
    // For public endpoint, we don't need auth token
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        error: data.error,
      };
    }

    return data;
  }

  // Get public product by nameSlug (no authentication required)
  async getPublicProductBySlug(nameSlug: string): Promise<PublicProductDetailResponse> {
    const url = `${this.baseURL}/products/public/${nameSlug}`;
    console.log('Fetching product from URL:', url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      mode: 'cors',
      credentials: 'include',
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const data = await response.json();
    console.log('Response data:', data);

    if (!response.ok) {
      console.error('API Error:', {
        status: response.status,
        message: data.message,
        error: data.error
      });
      throw {
        status: response.status,
        message: data.message || 'An error occurred',
        error: data.error,
      };
    }

    // Check if response has success/status field, if not assume it's successful if we got 200
    if (!data.success && !data.status && response.ok) {
      console.warn('Response missing success/status field, assuming success');
      data.success = true;
    }

    return data;
  }

  async incrementProductView(nameSlug: string): Promise<ProductViewResponse> {
    return this.request<ProductViewResponse>(`/products/public/${nameSlug}/view`, {
      method: 'POST',
    });
  }
}

export const productService = new ProductService(config.api.baseUrl);
