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

class NotificationService {
  private readonly endpoint = `${config.api.baseUrl}/notifications/token-update`;

  async updatePublicFcmToken(payload: UpdateFcmTokenPayload): Promise<UpdateFcmTokenResponse> {
    const response = await fetch(this.endpoint, {
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
}

export const notificationService = new NotificationService();

