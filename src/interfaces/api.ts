// Authentication API interfaces
export interface LoginRequest {
  email: string;
  password: string;
  fcmToken?: string;
}

export interface LoginResponse {
  message: string;
  status: boolean;
  data: {
    accessToken: string;
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      image?: string;
      latitude?: number;
      longitude?: number;
      createdAt?: string;
      role?: 'user' | 'admin';
    };
  };
}

export interface SignupRequest {
  firstName: string;
  lastName: string;
  email: string;
  countryCode?: string;
  phoneNumber?: string;
  password: string;
}

export interface SignupResponse {
  status: boolean | number;
  message: string;
  error?: string;
  data?: {
    userId: number;
  };
}

export interface VerifyOTPRequest {
  userId: number;
  otp: string;
}

export interface VerifyOTPResponse {
  status: boolean | number;
  message: string;
  error?: string;
  data?: {
    user: {
      id: number;
      firstName: string;
      lastName: string;
      email: string;
      image?: string;
      latitude?: number;
      longitude?: number;
      createdAt?: string;
      role: 'user' | 'admin';
    };
    accessToken: string;
  };
}

export interface ResendOTPRequest {
  userId: number;
}

export interface ResendOTPResponse {
  status: boolean | number;
  message: string;
  error?: string;
  data?: {
    userId: number;
  };
}

export interface ApiError {
  status: number;
  message: string;
  error?: string;
}
