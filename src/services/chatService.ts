import config from '../config';
import type {
  Chat,
  Message,
  InitiateChatRequest,
  SendMessageRequest,
  MarkReadRequest,
  ChatHeadsResponse,
  ChatResponse,
  MessagesResponse,
  MessageResponse,
  UnreadCountResponse,
} from '../interfaces/chat';

class ChatService {
  private readonly baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
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

  // Initiate a chat
  async initiateChat(data: InitiateChatRequest): Promise<ChatResponse> {
    return this.request<ChatResponse>('/chat/initiate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get chat heads (list of chats)
  async getChatHeads(page = 1, limit = 20): Promise<ChatHeadsResponse> {
    return this.request<ChatHeadsResponse>(`/chat/heads?page=${page}&limit=${limit}`);
  }

  // Get chat by ID
  async getChatById(chatId: number): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/chat/${chatId}`);
  }

  // Get messages for a chat
  async getMessages(chatId: number, page = 1, limit = 50): Promise<MessagesResponse> {
    return this.request<MessagesResponse>(`/chat/${chatId}/messages?page=${page}&limit=${limit}`);
  }

  // Send a message (REST API)
  async sendMessage(data: SendMessageRequest): Promise<MessageResponse> {
    return this.request<MessageResponse>('/chat/message', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Mark messages as read
  async markAsRead(data: MarkReadRequest): Promise<{ message: string; status: boolean; data: null }> {
    return this.request(`/chat/mark-read`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  // Get unread count
  async getUnreadCount(): Promise<UnreadCountResponse> {
    return this.request<UnreadCountResponse>('/chat/unread-count');
  }

  // Get online status for chat partners
  async getOnlineStatus(): Promise<{ status: boolean; data: { onlineStatus: Record<number, boolean> } }> {
    return this.request<{ status: boolean; data: { onlineStatus: Record<number, boolean> } }>('/chat/online-status');
  }
}

export const chatService = new ChatService(config.api.baseUrl);

