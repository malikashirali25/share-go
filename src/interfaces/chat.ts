// Chat interfaces based on the API documentation

export interface ChatUser {
  id: number;
  firstName: string;
  lastName: string;
  image: string;
}

export interface ChatProduct {
  id: number;
  name: string;
  price: number;
  description: string;
  image?: string;
}

export interface Chat {
  id: number;
  productId: number;
  userAId: number;
  userBId: number;
  status?: number;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCountUserA: number;
  unreadCountUserB: number;
  createdAt: string;
  updatedAt: string;
  product?: ChatProduct;
  userA?: ChatUser;
  userB?: ChatUser;
}

export interface Message {
  id: number;
  chatId: number;
  senderId: number;
  content: string;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
  updatedAt: string;
  sender?: ChatUser;
}

export interface InitiateChatRequest {
  productId: number;
  userBId: number;
}

export interface SendMessageRequest {
  chatId: number;
  content: string;
}

export interface MarkReadRequest {
  chatId: number;
}

export interface ChatHeadsResponse {
  message: string;
  status: boolean;
  data: {
    chats: Chat[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ChatResponse {
  message: string;
  status: boolean;
  data: Chat;
}

export interface MessagesResponse {
  message: string;
  status: boolean;
  data: {
    messages: Message[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MessageResponse {
  message: string;
  status: boolean;
  data: Message;
}

export interface UnreadCountResponse {
  message: string;
  status: boolean;
  data: {
    count: number;
  };
}

// WebSocket event types
export interface SocketConnectedEvent {
  userId: number;
  message: string;
}

export interface SocketNewMessageEvent {
  message: Message;
  chatId: number;
}

export interface SocketChatUpdatedEvent {
  chatId: number;
  lastMessage: string;
  lastMessageAt: string;
}

export interface SocketUserTypingEvent {
  chatId: number;
  userId: number;
  isTyping: boolean;
}

export interface SocketMessagesReadEvent {
  chatId: number;
  readBy: number;
}

export interface SocketErrorEvent {
  message: string;
  error?: string;
}

