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
