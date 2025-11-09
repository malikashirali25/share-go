import { User, Ad, Message, Call, Email, Notification, Testimonial, FAQ } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@email.com',
    avatar: 'https://i.pravatar.cc/150?img=1',
    location: 'New York, NY',
    rating: 4.9,
    joinDate: '2023-01-15',
    role: 'user',
    isBlocked: false
  },
  {
    id: '2',
    name: 'Mike Chen',
    email: 'mike.chen@email.com',
    avatar: 'https://i.pravatar.cc/150?img=2',
    location: 'San Francisco, CA',
    rating: 4.8,
    joinDate: '2023-02-20',
    role: 'user',
    isBlocked: false
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@email.com',
    avatar: 'https://i.pravatar.cc/150?img=3',
    location: 'Austin, TX',
    rating: 4.7,
    joinDate: '2023-03-10',
    role: 'user',
    isBlocked: false
  },
  {
    id: '4',
    name: 'David Wilson',
    email: 'david.wilson@email.com',
    avatar: 'https://i.pravatar.cc/150?img=4',
    location: 'Seattle, WA',
    rating: 4.6,
    joinDate: '2023-04-05',
    role: 'admin',
    isBlocked: false
  }
];

export const mockAds: Ad[] = [
  {
    id: '1',
    title: 'MacBook Pro 16" M2 - Like New',
    description: 'Selling my MacBook Pro 16" with M2 chip. Used for 6 months, excellent condition. Comes with original charger and box.',
    price: 2200,
    category: 'Electronics',
    location: 'New York, NY',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop',
      'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400&h=300&fit=crop'
    ],
    user: mockUsers[0],
    createdAt: '2024-01-15T10:30:00Z',
    status: 'active',
    views: 156,
    condition: 'like-new'
  },
  {
    id: '2',
    title: 'Vintage Gibson Les Paul Guitar',
    description: 'Beautiful 1970s Gibson Les Paul in cherry sunburst. Recently serviced, plays perfectly. Includes hard case.',
    price: 3500,
    category: 'Musical Instruments',
    location: 'San Francisco, CA',
    images: [
      'https://images.unsplash.com/photo-1564186763535-ebb21ef5277f?w=400&h=300&fit=crop'
    ],
    user: mockUsers[1],
    createdAt: '2024-01-14T14:20:00Z',
    status: 'active',
    views: 89,
    condition: 'good'
  },
  {
    id: '3',
    title: 'Designer Leather Sofa Set',
    description: 'Luxury Italian leather sofa set in excellent condition. Perfect for modern living room. Moving sale!',
    price: 1200,
    category: 'Furniture',
    location: 'Austin, TX',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    ],
    user: mockUsers[2],
    createdAt: '2024-01-13T09:15:00Z',
    status: 'active',
    views: 234,
    condition: 'like-new'
  },
  {
    id: '4',
    title: 'iPhone 14 Pro Max 256GB',
    description: 'iPhone 14 Pro Max in Space Black, 256GB storage. Used for 8 months, excellent condition with screen protector and case.',
    price: 900,
    category: 'Electronics',
    location: 'New York, NY',
    images: [
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400&h=300&fit=crop'
    ],
    user: mockUsers[0], // Sarah Johnson
    createdAt: '2024-01-12T16:45:00Z',
    status: 'active',
    views: 78,
    condition: 'good'
  },
  {
    id: '5',
    title: 'Vintage Chanel Handbag',
    description: 'Classic Chanel quilted handbag in black leather. Timeless piece, well-maintained. Perfect for special occasions.',
    price: 2800,
    category: 'Clothing',
    location: 'New York, NY',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
    ],
    user: mockUsers[0], // Sarah Johnson
    createdAt: '2024-01-10T11:20:00Z',
    status: 'sold',
    views: 145,
    condition: 'like-new'
  },
  // Mike Chen's additional ads
  {
    id: '6',
    title: 'Professional Camera Lens Set',
    description: 'Canon EF 24-70mm f/2.8L II USM lens. Professional quality, used for photography business. Excellent condition.',
    price: 1200,
    category: 'Electronics',
    location: 'San Francisco, CA',
    images: [
      'https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400&h=300&fit=crop'
    ],
    user: mockUsers[1], // Mike Chen
    createdAt: '2024-01-11T08:30:00Z',
    status: 'active',
    views: 67,
    condition: 'good'
  },
  {
    id: '7',
    title: 'Vintage Vinyl Record Collection',
    description: 'Collection of 50+ classic rock and jazz vinyl records from 60s-80s. Well-preserved, great sound quality.',
    price: 450,
    category: 'Musical Instruments',
    location: 'San Francisco, CA',
    images: [
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
    ],
    user: mockUsers[1], // Mike Chen
    createdAt: '2024-01-09T15:45:00Z',
    status: 'active',
    views: 123,
    condition: 'fair'
  },
  // Emily Rodriguez's additional ads
  {
    id: '8',
    title: 'Modern Dining Table Set',
    description: 'Glass top dining table with 6 chairs. Perfect for entertaining. Moving to smaller place, must sell.',
    price: 800,
    category: 'Furniture',
    location: 'Austin, TX',
    images: [
      'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop'
    ],
    user: mockUsers[2], // Emily Rodriguez
    createdAt: '2024-01-08T12:20:00Z',
    status: 'active',
    views: 89,
    condition: 'good'
  },
  {
    id: '9',
    title: 'Designer Handbag Collection',
    description: '3 designer handbags: Louis Vuitton, Gucci, and Prada. All authentic, excellent condition. Selling as set.',
    price: 3200,
    category: 'Clothing',
    location: 'Austin, TX',
    images: [
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop'
    ],
    user: mockUsers[2], // Emily Rodriguez
    createdAt: '2024-01-07T14:10:00Z',
    status: 'sold',
    views: 201,
    condition: 'like-new'
  },
  // David Wilson's ads
  {
    id: '10',
    title: 'Gaming PC Setup Complete',
    description: 'High-end gaming PC with RTX 4080, 32GB RAM, 1TB SSD. Includes monitor, keyboard, mouse, and headset.',
    price: 2800,
    category: 'Electronics',
    location: 'Seattle, WA',
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=400&h=300&fit=crop'
    ],
    user: mockUsers[3], // David Wilson
    createdAt: '2024-01-06T16:30:00Z',
    status: 'active',
    views: 156,
    condition: 'like-new'
  },
  {
    id: '11',
    title: 'Mountain Bike - Trek Fuel EX',
    description: '2023 Trek Fuel EX 8 mountain bike. Used for trail riding, excellent condition. Size Large, perfect for 5\'10"-6\'2" riders.',
    price: 1800,
    category: 'Sports',
    location: 'Seattle, WA',
    images: [
      'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&auto=format'
    ],
    user: mockUsers[3], // David Wilson
    createdAt: '2024-01-05T11:15:00Z',
    status: 'active',
    views: 94,
    condition: 'good'
  },
  {
    id: '12',
    title: 'Vintage Book Collection',
    description: 'Rare first edition books from 1950s-1970s. Includes Hemingway, Fitzgerald, and other classics. Collector\'s items.',
    price: 650,
    category: 'Books',
    location: 'Seattle, WA',
    images: [
      'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop'
    ],
    user: mockUsers[3], // David Wilson
    createdAt: '2024-01-04T09:45:00Z',
    status: 'pending',
    views: 45,
    condition: 'fair'
  }
];

export const mockMessages: Message[] = [
  {
    id: '1',
    senderId: '1',
    receiverId: '2',
    content: 'Hi! I\'m interested in your MacBook Pro. Is it still available?',
    timestamp: '2024-01-15T11:30:00Z',
    read: true,
    type: 'text'
  },
  {
    id: '2',
    senderId: '2',
    receiverId: '1',
    content: 'Yes, it\'s still available! Would you like to see it in person?',
    timestamp: '2024-01-15T11:35:00Z',
    read: true,
    type: 'text'
  },
  {
    id: '3',
    senderId: '1',
    receiverId: '2',
    content: 'That would be great! When would be a good time?',
    timestamp: '2024-01-15T11:40:00Z',
    read: false,
    type: 'text'
  }
];

export const mockCalls: Call[] = [
  {
    id: 'call_1',
    callerId: '2', // Mike Chen
    receiverId: '1', // Sarah Johnson
    type: 'voice',
    status: 'missed',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    duration: 0,
    read: false, // Missed call is unread
  },
  {
    id: 'call_2',
    callerId: '1', // Sarah Johnson
    receiverId: '3', // Emily Rodriguez
    type: 'video',
    status: 'answered',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    duration: 320, // 5 minutes 20 seconds
    read: true, // Answered call is read
  },
];

export const mockEmails: Email[] = [
  {
    id: '1',
    senderId: 'system_support',
    receiverId: '1', // Sarah Johnson
    subject: 'Welcome to Share & Go!',
    content: 'Thank you for joining our community. Start sharing and discovering amazing items today!',
    timestamp: '2024-01-15T08:00:00Z',
    read: true,
    priority: 'medium'
  },
  {
    id: '2',
    senderId: 'system_notifications',
    receiverId: '1', // Sarah Johnson
    subject: 'New message from Mike Chen',
    content: 'You have received a new message about your MacBook Pro listing.',
    timestamp: '2024-01-15T11:30:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '3',
    senderId: '2', // Mike Chen
    receiverId: '1', // Sarah Johnson
    subject: 'Interested in your MacBook Pro',
    content: 'Hi Sarah! I saw your MacBook Pro listing and I\'m very interested. Could we discuss the details?',
    timestamp: '2024-01-15T14:20:00Z',
    read: false,
    priority: 'high'
  },
  {
    id: '4',
    senderId: '3', // Emily Rodriguez
    receiverId: '2', // Mike Chen
    subject: 'Re: Classic Leather Jacket',
    content: 'Thanks for the quick response! When would be a good time to meet up?',
    timestamp: '2024-01-15T16:45:00Z',
    read: true,
    priority: 'medium'
  }
];

export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New Message',
    message: 'Sarah Johnson sent you a message about MacBook Pro',
    timestamp: '2024-01-15T11:30:00Z',
    read: false,
    actionUrl: '/messages',
    userId: '1' // Sarah Johnson
  },
  {
    id: '2',
    type: 'call',
    title: 'Missed Call',
    message: 'Emily Rodriguez tried to call you',
    timestamp: '2024-01-15T14:30:00Z',
    read: true,
    actionUrl: '/calls',
    userId: '1' // Sarah Johnson
  },
  {
    id: '3',
    type: 'ad',
    title: 'Ad Approved',
    message: 'Your MacBook Pro listing has been approved and is now live',
    timestamp: '2024-01-15T10:00:00Z',
    read: true,
    actionUrl: '/my-ads',
    userId: '1' // Sarah Johnson
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Alex Thompson',
    role: 'Community Member',
    content: 'Share & Go has helped me give my unused items a second life while helping others in need. The community is so caring and supportive!',
    avatar: 'https://i.pravatar.cc/150?img=5',
    rating: 5
  },
  {
    id: '2',
    name: 'Maria Garcia',
    role: 'Environmental Advocate',
    content: 'I love how this platform reduces waste and helps people. I\'ve shared furniture, clothes, and books that would have ended up in landfills.',
    avatar: 'https://i.pravatar.cc/150?img=6',
    rating: 5
  },
  {
    id: '3',
    name: 'David Kim',
    role: 'Student',
    content: 'As a student, Share & Go has been a lifesaver! I\'ve found free textbooks, furniture, and even winter clothes. The community is amazing!',
    avatar: 'https://i.pravatar.cc/150?img=4',
    rating: 4
  }
];

export const mockFAQs: FAQ[] = [
  {
    id: '1',
    question: 'How do I post an ad?',
    answer: 'Simply click the "Post Your Ad" button, fill out the form with your item details, upload photos, and submit. Your ad will be reviewed and go live within 24 hours.',
    category: 'General'
  },
  {
    id: '2',
    question: 'Is it safe to meet with buyers/sellers?',
    answer: 'We recommend meeting in public places and bringing a friend. Always trust your instincts and use our built-in communication tools to verify the other party before meeting.',
    category: 'Safety'
  },
  {
    id: '3',
    question: 'How do I contact a seller?',
    answer: 'You can contact sellers through our messaging system, voice calls, or email directly from the ad page. All communication is tracked for your safety.',
    category: 'Communication'
  },
  {
    id: '4',
    question: 'What payment methods are accepted?',
    answer: 'We don\'t handle payments directly. You can arrange payment with the seller using cash, bank transfer, or other secure payment methods of your choice.',
    category: 'Payment'
  }
];
