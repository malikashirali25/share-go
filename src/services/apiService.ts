// API service for authentication
import config from '../config';
import type {
  LoginRequest,
  LoginResponse,
  SignupRequest,
  SignupResponse,
  VerifyOTPRequest,
  VerifyOTPResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  UpdatePasswordRequest,
  UpdatePasswordResponse,
  ApiError
} from '../interfaces';

class ApiService {
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
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` }),
        ...options.headers,
      },
      mode: 'cors', // Enable CORS
      credentials: 'include', // Include credentials
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        const apiError: ApiError = {
          status: response.status,
          message: data.message || 'An error occurred',
          error: data.error,
        };
        throw apiError;
      }

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        // Network error or CORS error
        const networkError: ApiError = {
          status: 0,
          message: 'Network error. Please check your connection and ensure the backend server is running.',
          error: 'NetworkError',
        };
        throw networkError;
      }
      throw error;
    }
  }

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(userData: SignupRequest): Promise<SignupResponse> {
    return this.request<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyOTP(userData: VerifyOTPRequest): Promise<VerifyOTPResponse> {
    return this.request<VerifyOTPResponse>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async resendOTP(userData: ResendOTPRequest): Promise<ResendOTPResponse> {
    return this.request<ResendOTPResponse>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  // Password Management APIs
  async forgotPassword(data: ForgotPasswordRequest): Promise<ForgotPasswordResponse> {
    return this.request<ForgotPasswordResponse>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    return this.request<ResetPasswordResponse>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePassword(data: UpdatePasswordRequest): Promise<UpdatePasswordResponse> {
    return this.request<UpdatePasswordResponse>('/auth/update-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Helper method to get auth headers with token
  getAuthHeaders(token: string): Record<string, string> {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Helper method to clear auth data from localStorage
  clearAuthData(): void {
    localStorage.removeItem('sharego_token');
    localStorage.removeItem('sharego_user');
  }

  // Helper method to set auth data in localStorage
  setAuthData(token: string, userData: Record<string, any>): void {
    localStorage.setItem('sharego_token', token);
    localStorage.setItem('sharego_user', JSON.stringify(userData));
  }

  // Helper method to get current token
  getToken(): string | null {
    return localStorage.getItem('sharego_token');
  }

  // Helper method to get current user data
  getUserData(): Record<string, any> | null {
    const userData = localStorage.getItem('sharego_user');
    return userData ? JSON.parse(userData) : null;
  }

  // Helper method to check if user is authenticated
  isAuthenticated(): boolean {
    return !!(this.getToken() && this.getUserData());
  }

  // Example of an authenticated API call
  async getUserProfile(): Promise<any> {
    // This will automatically include the Bearer token if available
    return this.request<any>('/user/profile', {
      method: 'GET',
    });
  }

  // Example of creating an ad (authenticated)
  async createAd(adData: any): Promise<any> {
    // This will automatically include the Bearer token if available
    return this.request<any>('/ads', {
      method: 'POST',
      body: JSON.stringify(adData),
    });
  }

  // Helper method to get current auth state
  getAuthState(): { token: string | null; user: Record<string, any> | null; isAuthenticated: boolean } {
    return {
      token: this.getToken(),
      user: this.getUserData(),
      isAuthenticated: this.isAuthenticated()
    };
  }
}

export const apiService = new ApiService(config.api.baseUrl);

