export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  latitude?: number;
  longitude?: number;
  createdAt: string;
  role: 'user' | 'admin';
  isBlocked?: boolean;
}

// User listing interfaces (for admin)
export interface UserListingItem {
  id: number;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: string;
  status: number;
  image: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserListingResponse {
  message: string;
  status: boolean;
  data: {
    users: UserListingItem[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    activeUsersCount: number;
    inactiveUsersCount: number;
  };
}