import config from '../config';
import type {
  Address,
  CreateAddressRequest,
  UpdateAddressRequest
} from '../interfaces/address';

class AddressService {
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

  // Get all addresses for the current user
  async getAddresses(): Promise<Address[]> {
    return this.request<Address[]>('/addresses');
  }

  // Get a single address by ID
  async getAddressById(addressId: number): Promise<Address> {
    return this.request<Address>(`/addresses/${addressId}`);
  }

  // Create a new address
  async createAddress(addressData: CreateAddressRequest): Promise<Address> {
    return this.request<Address>('/addresses', {
      method: 'POST',
      body: JSON.stringify(addressData),
    });
  }

  // Update an address
  async updateAddress(addressId: number, addressData: UpdateAddressRequest): Promise<Address> {
    return this.request<Address>(`/addresses/${addressId}`, {
      method: 'PATCH',
      body: JSON.stringify(addressData),
    });
  }

  // Delete an address
  async deleteAddress(addressId: number): Promise<void> {
    await this.request(`/addresses/${addressId}`, {
      method: 'DELETE',
    });
  }
}

export const addressService = new AddressService(config.api.baseUrl);
