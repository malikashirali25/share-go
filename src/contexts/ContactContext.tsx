import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Message, Call, Email, Ad } from '../types';
import { mockAds, mockCalls, mockEmails } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface ContactContextType {
  // Conversations
  conversations: Conversation[];
  createConversation: (otherUserId: string, adId?: string) => string;
  sendMessage: (conversationId: string, content: string) => void;
  
  // Calls
  calls: Call[];
  createCall: (otherUserId: string, adId?: string, type?: 'voice' | 'video') => void;
  initiateCall: (receiverId: string, callType: 'audio' | 'video') => void;
  
  // Emails
  emails: Email[];
  sendEmail: (emailData: { receiverId: string; subject: string; content: string; threadId?: string }) => void;
  deleteEmail: (emailId: string) => void;
  
  // Get data
  getConversationWithUser: (userId: string) => Conversation | null;
  getCallsWithUser: (userId: string) => Call[];
  getEmailsWithUser: (userId: string) => Email[];
  
  // User-specific getters (secure data isolation)
  getUserConversations: () => Conversation[];
  getUserCalls: () => Call[];
  getUserEmails: () => Email[];
  
  // Unread count functions
  getUnreadMessageCount: () => number;
  getUnreadCallCount: () => number;
  getUnreadEmailCount: () => number;
  
  // Mark as read functions
  markEmailAsRead: (emailId: string) => void;
  markConversationAsRead: (conversationId: string) => void;
  markMissedCallsAsRead: () => void;
}

interface Conversation {
  id: string;
  participant1Id: string; // First user in the conversation
  participant2Id: string; // Second user in the conversation
  adId?: string; // Optional - conversation might be about a specific ad
  adTitle?: string; // Optional - conversation might be about a specific ad
  messages: Message[];
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
}

const ContactContext = createContext<ContactContextType | undefined>(undefined);

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

interface ContactProviderProps {
  children: ReactNode;
}

const sampleConversations: Conversation[] = [
  {
    id: 'conv_1',
    participant1Id: '1', // Sarah Johnson
    participant2Id: '2', // Mike Chen
    adId: 'ad_1',
    adTitle: 'Classic Leather Jacket',
    messages: [
      {
        id: 'msg_1',
        senderId: '1',
        receiverId: '2',
        content: "Hi! I'm interested in your Classic Leather Jacket. Is it still available?",
        timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        read: true,
        type: 'text'
      },
      {
        id: 'msg_2',
        senderId: '2',
        receiverId: '1',
        content: "Hey! Yes, it's still available. It's in great condition.",
        timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        read: false,
        type: 'text'
      }
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    lastMessageAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    unreadCount: 1
  }
];

export const ContactProvider = ({ children }: ContactProviderProps) => {
  const { user: currentUser } = useAuth();
  const { addNotification } = useNotifications();
  
  // Initialize conversations from localStorage or fall back to sample data
  const [conversations, setConversations] = useState<Conversation[]>(() => {
    try {
      const savedConversations = localStorage.getItem('share-and-go-conversations');
      if (savedConversations) {
        return JSON.parse(savedConversations);
      }
    } catch (error) {
      console.error('Error loading conversations from localStorage:', error);
    }
    return sampleConversations;
  });
  
  // Initialize calls from localStorage or fall back to mock data
  const [calls, setCalls] = useState<Call[]>(() => {
    try {
      const savedCalls = localStorage.getItem('share-and-go-calls');
      if (savedCalls) {
        const parsedCalls = JSON.parse(savedCalls);
        
        // Validate and migrate calls to ensure they have all required properties
        const validatedCalls = parsedCalls.map((call: any) => {
          const validStatuses = ['answered', 'missed', 'outgoing'];
          const validTypes = ['voice', 'video'];
          
          // Ensure all required properties exist with valid values
          const validatedCall: Call = {
            id: call.id || `call_${Date.now()}`,
            callerId: call.callerId || call.userId || 'unknown', // Handle old userId property
            receiverId: call.receiverId || 'unknown',
            type: validTypes.includes(call.type) ? call.type : 'voice',
            duration: typeof call.duration === 'number' ? call.duration : 0,
            timestamp: call.timestamp || new Date().toISOString(),
            status: validStatuses.includes(call.status) ? call.status : 'outgoing',
            read: typeof call.read === 'boolean' ? call.read : false // Default to false if missing
          };
          
          // Log migration if needed
          if (call.userId && !call.callerId) {
            console.log(`Migrating call "${call.id}" from userId to callerId/receiverId structure`);
          }
          if (!validStatuses.includes(call.status)) {
            console.log(`Migrating call "${call.id}" status from "${call.status}" to "outgoing"`);
          }
          if (typeof call.read !== 'boolean') {
            console.log(`Adding missing read property to call "${call.id}"`);
          }
          
          return validatedCall;
        });
        
        return validatedCalls;
      }
    } catch (error) {
      console.error('Error loading calls from localStorage:', error);
    }
    return mockCalls;
  });
  
  // Initialize emails from localStorage or fall back to empty array
  const [emails, setEmails] = useState<Email[]>(() => {
    try {
      const savedEmails = localStorage.getItem('share-and-go-emails');
      if (savedEmails) {
        return JSON.parse(savedEmails);
      }
    } catch (error) {
      console.error('Error loading emails from localStorage:', error);
    }
    return [];
  });

  // Save conversations to localStorage whenever conversations state changes
  useEffect(() => {
    try {
      localStorage.setItem('share-and-go-conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Error saving conversations to localStorage:', error);
    }
  }, [conversations]);

  // Save calls to localStorage whenever calls state changes
  useEffect(() => {
    try {
      localStorage.setItem('share-and-go-calls', JSON.stringify(calls));
    } catch (error) {
      console.error('Error saving calls to localStorage:', error);
    }
  }, [calls]);

  // Save emails to localStorage whenever emails state changes
  useEffect(() => {
    try {
      localStorage.setItem('share-and-go-emails', JSON.stringify(emails));
    } catch (error) {
      console.error('Error saving emails to localStorage:', error);
    }
  }, [emails]);

  const createConversation = (otherUserId: string, adId?: string): string => {
    try {
      console.log('=== CREATING CONVERSATION ===');
      console.log('Current User:', currentUser?.name, 'ID:', currentUser?.id);
      console.log('Other User ID:', otherUserId, 'Type:', typeof otherUserId);
      console.log('Ad ID:', adId);
      
      const currentUserId = currentUser?.id || 'current_user';
      console.log('Current User ID for conversation:', currentUserId, 'Type:', typeof currentUserId);
      
      // Check if conversation already exists between these two users
      const existingConversation = conversations.find(conv => 
        (conv.participant1Id === currentUserId && conv.participant2Id === otherUserId) ||
        (conv.participant1Id === otherUserId && conv.participant2Id === currentUserId)
      );
      
      if (existingConversation) {
        return existingConversation.id;
      }

      // Get ad data if provided
      let adTitle = 'General Chat';
      if (adId) {
        const ad = mockAds.find(a => a.id === adId);
        adTitle = ad?.title || 'Unknown Item';
      }
      
      const conversationId = `conv_${Date.now()}`;
      const newConversation: Conversation = {
        id: conversationId,
        participant1Id: currentUserId,
        participant2Id: otherUserId,
        adId,
        adTitle,
        messages: [
          {
            id: `msg_${Date.now()}`,
            senderId: currentUserId,
            receiverId: otherUserId,
            content: adId ? `Hi! I'm interested in your ${adTitle}. Is it still available?` : 'Hi! How are you doing?',
            timestamp: new Date().toISOString(),
            read: false,
            type: 'text'
          }
        ],
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0
      };
      
      setConversations(prev => [...prev, newConversation]);
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return '';
    }
  };

  const sendMessage = (conversationId: string, content: string) => {
    if (!currentUser) {
      console.error('User must be logged in to send messages');
      return;
    }

    const conversation = conversations.find(conv => conv.id === conversationId);
    if (!conversation) {
      console.error('Conversation not found:', conversationId);
      return;
    }

    // Check if current user is a participant in this conversation
    const isParticipant = conversation.participant1Id === currentUser.id || 
                         conversation.participant2Id === currentUser.id;
    
    if (!isParticipant) {
      console.error('User is not a participant in this conversation');
      return;
    }

    const currentUserId = currentUser.id;
    // Find the other participant in the conversation
    const otherUserId = conversation.participant1Id === currentUserId 
      ? conversation.participant2Id 
      : conversation.participant1Id;
    
    const newMessage: Message = {
      id: `msg_${Date.now()}`,
      senderId: currentUserId,
      receiverId: otherUserId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'text'
    };

    console.log('Sending message:', newMessage);
    
    // Update conversation with new message and increment unread count for receiver
    setConversations(prev => 
      prev.map(conv => 
        conv.id === conversationId 
          ? {
              ...conv,
              messages: [...conv.messages, newMessage],
              lastMessageAt: newMessage.timestamp,
              unreadCount: conv.unreadCount + 1 // Increment for receiver
            }
          : conv
      )
    );

    // Send notification to the receiver (otherUserId), not the sender
    addNotification({
      type: 'message',
      title: 'New Message',
      message: `${currentUser.name} sent you a message`,
      userId: otherUserId, // Send to receiver, not sender
      actionUrl: '/messages'
    });
  };

  const createCall = (otherUserId: string, adId?: string, type: 'voice' | 'video' = 'voice') => {
    if (!currentUser) {
      console.error('User must be logged in to make calls');
      return;
    }

    const newCall: Call = {
      id: `call_${Date.now()}`,
      callerId: currentUser.id,
      receiverId: otherUserId,
      type,
      duration: 0,
      timestamp: new Date().toISOString(),
      status: 'outgoing',
      read: false
    };

    setCalls(prev => [...prev, newCall]);
  };

  const initiateCall = (receiverId: string, callType: 'audio' | 'video') => {
    if (!currentUser) {
      console.error("User must be logged in to initiate a call.");
      return;
    }

    const timestamp = new Date().toISOString();
    const callTypeValue = callType === 'audio' ? 'voice' : 'video';

    // Create outgoing call record for the caller (marked as read)
    const outgoingCall: Call = {
      id: `call_outgoing_${Date.now()}`,
      callerId: currentUser.id,
      receiverId: receiverId,
      type: callTypeValue,
      status: 'outgoing',
      timestamp: timestamp,
      duration: 0,
      read: true // Read for caller since they initiated it
    };

    // Create missed call record for the receiver (marked as unread)
    const missedCall: Call = {
      id: `call_missed_${Date.now() + 1}`, // Ensure unique ID
      callerId: currentUser.id,
      receiverId: receiverId,
      type: callTypeValue,
      status: 'missed',
      timestamp: timestamp,
      duration: 0,
      read: false // Unread for receiver
    };

    // Add both call records to the state
    setCalls(prevCalls => [outgoingCall, missedCall, ...prevCalls]);
    
    // Send notification to the receiver (receiverId), not the sender
    addNotification({
      type: 'call',
      title: 'Incoming Call',
      message: `${currentUser.name} is calling you`,
      userId: receiverId, // Send to receiver, not sender
      actionUrl: '/calls'
    });
    
    // In a real app, you would navigate to a call screen here.
    // For now, we just add it to the history.
  };

  const sendEmail = (emailData: { receiverId: string; subject: string; content: string; threadId?: string }) => {
    if (!currentUser) {
      console.error('User must be logged in to send emails');
      return;
    }

    const newEmailId = `email_${Date.now()}`;
    
    // If a threadId is provided, use it. Otherwise, this is a new thread,
    // so the email's own ID becomes the threadId.
    const threadId = emailData.threadId || newEmailId;

    const newEmail: Email = {
      id: newEmailId,
      senderId: currentUser.id,
      receiverId: emailData.receiverId,
      subject: emailData.subject,
      content: emailData.content,
      timestamp: new Date().toISOString(),
      read: false, // Unread for receiver
      priority: 'medium',
      threadId: threadId,
    };

    setEmails(prev => [newEmail, ...prev]);

    // Send notification to the receiver (emailData.receiverId), not the sender
    addNotification({
      type: 'email',
      title: 'New Email',
      message: `${currentUser.name} sent you an email: ${emailData.subject}`,
      userId: emailData.receiverId, // Send to receiver, not sender
      actionUrl: '/emails'
    });
  };

  const deleteEmail = (emailId: string) => {
    setEmails(prevEmails => prevEmails.filter(email => email.id !== emailId));
  };

  const getConversationWithUser = (userId: string): Conversation | null => {
    if (!currentUser) return null;
    
    return conversations.find(conv => 
      (conv.participant1Id === currentUser.id && conv.participant2Id === userId) ||
      (conv.participant1Id === userId && conv.participant2Id === currentUser.id)
    ) || null;
  };

  const getCallsWithUser = (userId: string): Call[] => {
    return calls.filter(call => 
      call.callerId === userId || call.receiverId === userId
    );
  };

  const getEmailsWithUser = (userId: string): Email[] => {
    return emails.filter(email => 
      email.senderId === userId || email.receiverId === userId
    );
  };

  // User-specific getters (secure data isolation)
  const getUserConversations = (): Conversation[] => {
    if (!currentUser) return [];
    return conversations.filter(conversation => 
      conversation.participant1Id === currentUser.id || 
      conversation.participant2Id === currentUser.id
    );
  };

  const getUserCalls = (): Call[] => {
    if (!currentUser) return [];
    return calls.filter(call => {
      // Check if current user is involved in this call
      const isCaller = call.callerId === currentUser.id;
      const isReceiver = call.receiverId === currentUser.id;
      
      if (!isCaller && !isReceiver) {
        return false; // User is not involved in this call
      }
      
      // Perspective-aware filtering:
      // - If user is the caller, only show outgoing calls
      // - If user is the receiver, only show missed or answered calls
      if (isCaller) {
        return call.status === 'outgoing';
      } else if (isReceiver) {
        return call.status === 'missed' || call.status === 'answered';
      }
      
      return false;
    });
  };

  const getUserEmails = (): Email[] => {
    if (!currentUser) return [];
    return emails.filter(email => 
      email.senderId === currentUser.id || email.receiverId === currentUser.id
    );
  };

  // Unread count functions
  const getUnreadMessageCount = (): number => {
    if (!currentUser) return 0;
    const userConversations = getUserConversations();
    return userConversations.reduce((count, conversation) => {
      // Only count as unread if:
      // 1. The conversation has unread messages (unreadCount > 0)
      // 2. The last message was NOT sent by the current user (they are the receiver)
      if (conversation.unreadCount > 0 && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        if (lastMessage.senderId !== currentUser.id) {
          return count + 1;
        }
      }
      return count;
    }, 0);
  };

  const getUnreadCallCount = (): number => {
    if (!currentUser) return 0;
    const userCalls = getUserCalls();
    return userCalls.filter(call => 
      call.receiverId === currentUser.id && 
      call.status === 'missed' && 
      call.read === false
    ).length;
  };

  const getUnreadEmailCount = (): number => {
    if (!currentUser) return 0;
    const userEmails = getUserEmails();
    return userEmails.filter(email => 
      !email.read && email.senderId !== currentUser.id
    ).length;
  };

  // Mark as read functions
  const markEmailAsRead = (emailId: string): void => {
    setEmails(prevEmails => 
      prevEmails.map(email => 
        email.id === emailId 
          ? { ...email, read: true }
          : email
      )
    );
  };

  const markConversationAsRead = (conversationId: string): void => {
    setConversations(prevConversations => 
      prevConversations.map(conversation => 
        conversation.id === conversationId 
          ? { ...conversation, unreadCount: 0 }
          : conversation
      )
    );
  };

  const markMissedCallsAsRead = (): void => {
    if (!currentUser) return;
    setCalls(prevCalls => 
      prevCalls.map(call => 
        (call.callerId === currentUser.id || call.receiverId === currentUser.id) && 
        call.status === 'missed' && call.read === false
          ? { ...call, read: true }
          : call
      )
    );
  };

  const value: ContactContextType = {
    conversations,
    createConversation,
    sendMessage,
    calls,
    createCall,
    initiateCall,
    emails,
    sendEmail,
    deleteEmail,
    getConversationWithUser,
    getCallsWithUser,
    getEmailsWithUser,
    getUserConversations,
    getUserCalls,
    getUserEmails,
    getUnreadMessageCount,
    getUnreadCallCount,
    getUnreadEmailCount,
    markEmailAsRead,
    markConversationAsRead,
    markMissedCallsAsRead
  };

  return (
    <ContactContext.Provider value={value}>
      {children}
    </ContactContext.Provider>
  );
};
