import { useState, useEffect, useCallback, useRef } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';
import type { Message, Chat } from '../interfaces/chat';
import type {
  SocketNewMessageEvent,
  SocketUserTypingEvent,
  SocketMessagesReadEvent,
  SocketChatUpdatedEvent,
} from '../interfaces/chat';

interface UseChatReturn {
  messages: Message[];
  typing: boolean;
  connected: boolean;
  sendMessage: (content: string) => void;
  sendTyping: (isTyping: boolean) => void;
  markAsRead: () => void;
  fetchMessages: (page?: number) => Promise<void>;
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => Promise<void>;
}

export const useChat = (chatId: number | null): UseChatReturn => {
  const { socket, connected } = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [typing, setTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typingUserIdRef = useRef<number | null>(null);

  // Join chat room when chatId changes
  useEffect(() => {
    if (!socket || !chatId || !connected) return;

    console.log('Joining chat:', chatId);
    socket.emit('joinChat', { chatId });

    return () => {
      console.log('Leaving chat:', chatId);
      socket.emit('leaveChat', { chatId });
    };
  }, [socket, chatId, connected]);

  // Listen for new messages
  useEffect(() => {
    if (!socket || !chatId) return;

    const handleNewMessage = (data: SocketNewMessageEvent) => {
      if (data.chatId === chatId) {
        console.log('New message received:', data);
        setMessages((prev) => {
          // Check if message already exists (avoid duplicates)
          const exists = prev.some((msg) => msg.id === data.message.id);
          if (exists) return prev;
          // Append new message at the end (messages are sorted oldest to newest)
          return [...prev, data.message];
        });
      }
    };

    const handleUserTyping = (data: SocketUserTypingEvent) => {
      const currentUserId = user?.id ? Number.parseInt(user.id, 10) : null;
      if (data.chatId === chatId && data.userId !== currentUserId) {
        setTyping(data.isTyping);
        typingUserIdRef.current = data.userId;
        
        // Auto-hide typing indicator after 3 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        if (data.isTyping) {
          typingTimeoutRef.current = setTimeout(() => {
            setTyping(false);
          }, 3000);
        }
      }
    };

    const handleMessagesRead = (data: SocketMessagesReadEvent) => {
      if (data.chatId === chatId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.senderId !== data.readBy ? { ...msg, isRead: true, readAt: new Date().toISOString() } : msg
          )
        );
      }
    };

    const handleChatUpdated = (data: SocketChatUpdatedEvent) => {
      if (data.chatId === chatId) {
        // Chat updated, could refresh chat list if needed
        console.log('Chat updated:', data);
      }
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('userTyping', handleUserTyping);
    socket.on('messagesRead', handleMessagesRead);
    socket.on('chatUpdated', handleChatUpdated);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('userTyping', handleUserTyping);
      socket.off('messagesRead', handleMessagesRead);
      socket.off('chatUpdated', handleChatUpdated);
    };
  }, [socket, chatId, user?.id]);

  // Fetch messages from API
  const fetchMessages = useCallback(
    async (page = 1) => {
      if (!chatId) return;

      try {
        setIsLoading(true);
        const response = await chatService.getMessages(chatId, page, 50);
        
        if (response.status && response.data) {
          // Sort messages by createdAt ascending (oldest to newest)
          // This ensures consistent ordering regardless of backend order
          const sortedMessages = [...response.data.messages].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return dateA - dateB;
          });
          
          if (page === 1) {
            // First page: replace all messages
            setMessages(sortedMessages);
          } else {
            // Subsequent pages: prepend older messages
            setMessages((prev) => [...sortedMessages, ...prev]);
          }
          
          setCurrentPage(page);
          setHasMore(response.data.totalPages > page);
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setIsLoading(false);
      }
    },
    [chatId]
  );

  // Load more messages (pagination)
  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchMessages(currentPage + 1);
  }, [hasMore, isLoading, currentPage, fetchMessages]);

  // Send message via WebSocket
  const sendMessage = useCallback(
    (content: string) => {
      if (!socket || !chatId || !content.trim()) return;

      socket.emit('sendMessage', {
        chatId,
        content: content.trim(),
      });

      // Stop typing indicator
      sendTyping(false);
    },
    [socket, chatId]
  );

  // Send typing indicator
  const sendTyping = useCallback(
    (isTyping: boolean) => {
      if (!socket || !chatId) return;

      socket.emit('typing', {
        chatId,
        isTyping,
      });
    },
    [socket, chatId]
  );

  // Mark messages as read
  const markAsRead = useCallback(async () => {
    if (!socket || !chatId) return;

    try {
      // Mark as read via WebSocket
      socket.emit('markAsRead', { chatId });

      // Also call REST API as backup
      await chatService.markAsRead({ chatId });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [socket, chatId]);

  // Load messages when chatId changes
  useEffect(() => {
    if (chatId) {
      fetchMessages(1);
      markAsRead();
    } else {
      setMessages([]);
    }
  }, [chatId, fetchMessages, markAsRead]);

  return {
    messages,
    typing,
    connected,
    sendMessage,
    sendTyping,
    markAsRead,
    fetchMessages,
    isLoading,
    hasMore,
    loadMore,
  };
};

