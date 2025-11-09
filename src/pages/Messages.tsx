import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Send,
  MessageCircle,
  Check,
  CheckCheck,
  ArrowLeft,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useSocket } from '../contexts/SocketContext';
import { useChat } from '../hooks/useChat';
import { chatService } from '../services/chatService';
import { Chat, ChatUser, ChatProduct } from '../interfaces/chat';
import UserAvatar from '../components/UserAvatar';
import config from '../config';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const chatIdParam = searchParams.get('chatId');
  const selectedChatId = chatIdParam ? Number.parseInt(chatIdParam, 10) : null;

  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isSending, setIsSending] = useState(false);

  const { user: currentUser } = useAuth();
  const { connected } = useSocket();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    messages,
    typing,
    connected: chatConnected,
    sendMessage: sendChatMessage,
    sendTyping,
    markAsRead,
    isLoading: isLoadingMessages,
    hasMore,
    loadMore,
  } = useChat(selectedChatId);

  // Load chat heads
  const loadChats = useCallback(async () => {
    try {
      setIsLoadingChats(true);
      const response = await chatService.getChatHeads(1, 50);
      if (response.status && response.data) {
        setChats(response.data.chats);
      }
    } catch (error) {
      console.error('Error loading chats:', error);
      setChats([]);
    } finally {
      setIsLoadingChats(false);
    }
  }, []);

  // Load unread count
  const loadUnreadCount = useCallback(async () => {
    try {
      const response = await chatService.getUnreadCount();
      if (response.status && response.data) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  }, []);

  // Load chats on mount
  useEffect(() => {
    loadChats();
    loadUnreadCount();
    
    // Refresh chats periodically
    const interval = setInterval(() => {
      loadChats();
      loadUnreadCount();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [loadChats, loadUnreadCount]);

  // Select chat when chatId param changes
  useEffect(() => {
    if (selectedChatId && chats.length > 0) {
      const chat = chats.find((c) => c.id === selectedChatId);
      if (chat) {
        setSelectedChat(chat);
        markAsRead();
      }
    } else if (chats.length > 0 && !selectedChatId) {
      // Auto-select first chat if none selected
      setSelectedChat(chats[0]);
      setSearchParams({ chatId: chats[0].id.toString() });
    }
  }, [selectedChatId, chats, markAsRead, setSearchParams]);

  // Get other user from chat
  const getOtherUser = (chat: Chat): ChatUser | null => {
    if (!currentUser) return null;
    const currentUserId = Number.parseInt(currentUser.id, 10);
    
    if (chat.userA?.id === currentUserId) {
      return chat.userB || null;
    } else if (chat.userB?.id === currentUserId) {
      return chat.userA || null;
    }
    return null;
  };

  // Get unread count for a chat
  const getChatUnreadCount = (chat: Chat): number => {
    if (!currentUser) return 0;
    const currentUserId = Number.parseInt(currentUser.id, 10);
    
    if (chat.userA?.id === currentUserId) {
      return chat.unreadCountUserA;
    } else if (chat.userB?.id === currentUserId) {
      return chat.unreadCountUserB;
    }
    return 0;
  };

  // Handle typing indicator
  const handleTyping = () => {
    if (selectedChat?.status === 2) {
      return;
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    sendTyping(true);
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTyping(false);
    }, 2000);
  };

  // Handle send message
  const handleSendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!newMessage.trim() || !selectedChatId || isSending || selectedChat?.status === 2) return;

    try {
      setIsSending(true);
      sendChatMessage(newMessage.trim());
      setNewMessage('');
      sendTyping(false);
      
      // Refresh chats to update last message
      setTimeout(() => {
        loadChats();
      }, 500);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  // Filter chats based on search
  const filteredChats = chats.filter((chat) => {
    if (!searchTerm) return true;
    
    const otherUser = getOtherUser(chat);
    const searchLower = searchTerm.toLowerCase();
    
    return (
      otherUser?.firstName.toLowerCase().includes(searchLower) ||
      otherUser?.lastName.toLowerCase().includes(searchLower) ||
      chat.product?.name.toLowerCase().includes(searchLower) ||
      chat.lastMessage?.toLowerCase().includes(searchLower)
    );
  });

  // Format time
  const formatTime = (dateString: string | null) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatProductPrice = (price?: number | string) => {
    if (price === null || price === undefined) {
      return 'Free';
    }
    const priceNumber = typeof price === 'string' ? Number.parseFloat(price) : price;
    if (!Number.isFinite(priceNumber) || priceNumber <= 0) {
      return 'Free';
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(priceNumber);
  };

  const getProductImageUrl = (product?: ChatProduct): string | undefined => {
    if (!product) return undefined;

    if ((product.image) && product.image !== null && product.image !== undefined) {
      return product.image.startsWith('http') ? product.image : `${config.api.mediaUrl}${product.image}`;
    }

    const fallbackImage = (product as unknown as { image?: string })?.image;
    if (fallbackImage) {
      return fallbackImage.startsWith('http') ? fallbackImage : `${config.api.mediaUrl}${fallbackImage}`;
    }

    return undefined;
  };

  const otherUser = selectedChat ? getOtherUser(selectedChat) : null;
  const isChatInactive = selectedChat?.status === 2;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xpy-8">
        {/* Header */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Messages</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {connected ? 'Connected' : 'Connecting...'}
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-1 bg-primary text-white text-xs rounded-full">
                  {unreadCount} unread
                </span>
              )}
            </p>
          </div>
        </motion.div> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)] min-h-0">
          {/* Chat List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-1 min-h-0"
          >
            <Card className="flex h-full flex-col overflow-hidden">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                {/* Search */}
                <div className="p-4 border-b dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Chat List */}
                <div className="flex-1 overflow-y-auto min-h-0">
                  {isLoadingChats ? (
                    <div className="p-4 text-center text-gray-500">Loading chats...</div>
                  ) : filteredChats.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {searchTerm ? 'No conversations found' : 'No conversations yet'}
                    </div>
                  ) : (
                    filteredChats.map((chat) => {
                      const other = getOtherUser(chat);
                      const unread = getChatUnreadCount(chat);
                      const isSelected = selectedChat?.id === chat.id;
                      const productName = chat.product?.name || 'Untitled Product';
                      const otherName = other ? `${other.firstName} ${other.lastName}`.trim() : '';
                      const productImage = getProductImageUrl(chat.product);

                      if (!other) return null;

                      return (
                        <motion.div
                          key={chat.id}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                          className={`p-4 border-b dark:border-gray-700 cursor-pointer ${
                            isSelected ? 'bg-primary/5 border-l-4 border-l-primary' : ''
                          }`}
                          onClick={() => {
                            setSelectedChat(chat);
                            setSearchParams({ chatId: chat.id.toString() });
                            markAsRead();
                          }}
                        >
                          <div className="flex items-center space-x-3">
                            <div className="relative flex-shrink-0">
                              <UserAvatar
                                src={productImage}
                                alt={productName}
                                className="h-12 w-12 rounded-full"
                              />
                              {connected && (
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
                                  {productName}
                                </h3>
                                <span className="text-xs text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">
                                  {formatTime(chat.lastMessageAt)}
                                </span>
                              </div>
                              <div className="flex items-center justify-between mt-1">
                                <div className="flex-1 min-w-0">
                                  {otherName && (
                                    <span className="text-xs text-primary font-medium truncate block">
                                      {otherName}
                                    </span>
                                  )}
                                  <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                    {chat.lastMessage || 'No messages yet'}
                                  </p>
                                </div>
                                {unread > 0 && (
                                  <div className="bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center flex-shrink-0 ml-2">
                                    {unread}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Chat Window */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:col-span-2 min-h-0"
          >
            <Card className="flex h-full flex-col overflow-hidden">
              {selectedChat && otherUser ? (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="lg:hidden"
                        onClick={() => {
                          setSearchParams({});
                          setSelectedChat(null);
                        }}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <div className="relative">
                        <UserAvatar
                          src={getProductImageUrl(selectedChat.product)}
                          alt={selectedChat.product?.name || 'Product'}
                          className="h-10 w-10 rounded-full"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                          {`${otherUser.firstName} ${otherUser.lastName}`.trim() || 'Unknown User'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-xs uppercase tracking-wide">
                            {chatConnected ? 'Online' : 'Offline'}
                          </span>
                        </p>
                      </div>
                    </div>
                    {selectedChat.product && (
                      <div className="text-right">
                        <Link
                          to={`/item/${selectedChat.product?.id ?? selectedChat.productId}`}
                          className="text-sm font-medium text-gray-900 dark:text-gray-100 hover:text-primary hover:underline transition-colors"
                        >
                          {selectedChat.product.name}
                        </Link>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatProductPrice(selectedChat.product.price)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Messages */}
                  <div
                    ref={messagesContainerRef}
                    className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4"
                  >
                    {hasMore && (
                      <div className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={loadMore}
                          disabled={isLoadingMessages}
                        >
                          {isLoadingMessages ? 'Loading...' : 'Load older messages'}
                        </Button>
                      </div>
                    )}

                    {isLoadingMessages && messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">No messages yet. Start the conversation!</div>
                    ) : (
                      messages.map((message) => {
                        const isOwn = message.senderId === Number.parseInt(currentUser?.id || '0', 10);
                        const sender = message.sender || otherUser;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-primary text-white'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                              }`}
                            >
                              {!isOwn && (
                                <p className="text-xs font-medium mb-1 opacity-75">
                                  {sender.firstName} {sender.lastName}
                                </p>
                              )}
                              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                              <div
                                className={`flex items-center justify-end mt-1 text-xs ${
                                  isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                }`}
                              >
                                <span>{new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                {isOwn && (
                                  <span className="ml-1">
                                    {message.isRead ? (
                                      <CheckCheck className="h-3 w-3 inline" />
                                    ) : (
                                      <Check className="h-3 w-3 inline" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                    )}

                    {/* Typing Indicator */}
                    {typing && !isChatInactive && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  {isChatInactive ? (
                    <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40">
                      <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                        This conversation is inactive. Messaging has been disabled.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
                      <div className="flex items-center space-x-2">
                        <div className="flex-1 relative">
                          <Input
                            ref={inputRef}
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => {
                              setNewMessage(e.target.value);
                              handleTyping();
                            }}
                            onKeyDown={handleKeyPress}
                            disabled={!chatConnected || isSending}
                            className="pr-12"
                          />
                        </div>
                        <Button
                          type="submit"
                          disabled={!newMessage.trim() || !chatConnected || isSending}
                        >
                          <Send className="h-4 w-4" />
                        </Button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Choose a conversation from the list to start messaging
                    </p>
                  </div>
                </div>
              )}
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
