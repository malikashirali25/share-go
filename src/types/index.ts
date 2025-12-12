export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  location: string;
  rating: number;
  joinDate: string;
  role?: 'admin' | 'user';
  isBlocked?: boolean;
}

export interface Ad {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images: string[];
  user: User;
  createdAt: string;
  status: 'active' | 'sold' | 'pending' | 'rejected';
  views: number;
  condition: 'new' | 'like_new' | 'good' | 'fair' | 'poor';
  nameSlug?: string;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'text' | 'image' | 'file';
}

export interface Call {
  id: string;
  callerId: string;
  receiverId: string;
  type: 'voice' | 'video';
  duration: number;
  timestamp: string;
  status: 'answered' | 'missed' | 'outgoing';
  read: boolean;
}

export interface Email {
  id: string;
  senderId: string;
  receiverId: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
  threadId?: string;
}

export interface Notification {
  id: string;
  type: 'message' | 'call' | 'email' | 'ad' | 'system';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  userId: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}
