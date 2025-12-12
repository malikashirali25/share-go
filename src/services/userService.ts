import config from '../config';
import type { UserListingResponse } from '../interfaces/user';

// User profile with address response
export interface UserProfileResponse {
  status: boolean;
  message: string;
  data: {
    user: {
      id: number;
      firstName: string;
      lastName: string;
      name: string;
      email: string;
      countryCode?: string;
      phoneNumber?: string;
      gender?: string;
      status: number;
      image?: string;
      isEmailVerified: boolean;
      isPhoneVerified: boolean;
      role: string;
      createdAt: string;
      updatedAt: string;
    };
    address?: {
      id: number;
      userId: number;
      address1: string;
      address2?: string;
      zipcode: string;
      city: string;
      state: string;
      country: string;
      isDefault: boolean;
      lat?: number;
      lng?: number;
    };
  };
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  countryCode?: string;
  phoneNumber?: string;
}

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

  // Get current user profile with address
  async getUserProfile(): Promise<UserProfileResponse> {
    return this.request<UserProfileResponse>('/users/me');
  }

  // Update user profile
  async updateProfile(data: UpdateProfileRequest): Promise<any> {
    return this.request<any>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
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

  // Delete user (admin)
  async deleteUser(userId: number): Promise<void> {
    const url = `${this.baseURL}/users/${userId}`;
    const token = localStorage.getItem('sharego_token');
    
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
      },
      mode: 'cors',
      credentials: 'include',
    });

    if (!response.ok) {
      // Try to parse error message if available
      let errorMessage = 'Failed to delete user';
      try {
        const data = await response.json();
        errorMessage = data.message || errorMessage;
      } catch {
        // Response body might be empty, use status text
        errorMessage = response.statusText || errorMessage;
      }
      throw { status: response.status, message: errorMessage };
    }
    
    // Success - don't try to parse empty response
  }
}

export const userService = new UserService(config.api.baseUrl);

