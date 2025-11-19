import config from '../config';
import type { UserListingResponse } from '../interfaces/user';

class UserService {
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

  // Get users listing (for admin)
  async getUsersListing(params?: {
    page?: number;
    limit?: number;
    status?: number;
    search?: string;
  }): Promise<UserListingResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }
    if (params?.status !== undefined && params?.status !== null) {
      queryParams.append('status', params.status.toString());
    }
    if (params?.search) {
      queryParams.append('search', params.search);
    }

    const queryString = queryParams.toString();
    const endpoint = `/users/admin/list${queryString ? `?${queryString}` : ''}`;
    
    return this.request<UserListingResponse>(endpoint);
  }

  // Update user status (admin)
  async updateUserStatus(userId: number, status: number): Promise<any> {
    return this.request<any>(`/users/admin/${userId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }
}

export const userService = new UserService(config.api.baseUrl);

