import config from '../config';

interface UpdateFcmTokenPayload {
  deviceId: string;
  fcmToken: string;
  userId?: number;
}

interface UpdateFcmTokenResponse {
  message: string;
  success?: boolean;
  status?: boolean;
  data?: unknown;
}

export interface NotificationProduct {
  id: number;
  name: string;
  nameSlug: string;
  image: string;
}

export interface Notification {
  id: number;
  userId: number;
  title: string;
  message: string;
  module: string;
  resourceId: number;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
  product?: NotificationProduct;
}

export interface NotificationsResponse {
  message: string;
  status: boolean;
  data: {
    notifications: Notification[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

class NotificationService {
  private readonly baseUrl = config.api.baseUrl;

  async updatePublicFcmToken(payload: UpdateFcmTokenPayload): Promise<UpdateFcmTokenResponse> {
    const response = await fetch(`${this.baseUrl}/notifications/token-update`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || 'Failed to update FCM token';
      throw new Error(message);
    }

    return data;
  }

  async getNotifications(params?: {
    page?: number;
    limit?: number;
  }): Promise<NotificationsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params?.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const queryString = queryParams.toString();
    const endpoint = `/notifications${queryString ? `?${queryString}` : ''}`;
    
    const token = localStorage.getItem('sharego_token');
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || 'Failed to fetch notifications';
      throw new Error(message);
    }

    return data;
  }

  async markAsRead(notificationId: number): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('sharego_token');
    const response = await fetch(`${this.baseUrl}/notifications/${notificationId}/read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || 'Failed to mark notification as read';
      throw new Error(message);
    }

    return data;
  }

  async markAllAsRead(): Promise<{ success: boolean; message: string }> {
    const token = localStorage.getItem('sharego_token');
    const response = await fetch(`${this.baseUrl}/notifications/mark-all-read`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      credentials: 'include',
      mode: 'cors',
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = data?.message || 'Failed to mark all notifications as read';
      throw new Error(message);
    }

    return data;
  }
}

export const notificationService = new NotificationService();

