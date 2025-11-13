import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ShoppingBag, Bell, User, LogOut, Clock, ChevronDown, Package } from 'lucide-react';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import UserAvatar from './UserAvatar';
import { notificationService, type Notification } from '../services/notificationService';
import config from '../config';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn, user, logout, isAdmin } = useAuth();
  const notificationDropdownRef = useRef<HTMLDivElement>(null);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch notifications when user is logged in
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!isLoggedIn) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      try {
        setIsLoadingNotifications(true);
        const response = await notificationService.getNotifications({ page: 1, limit: 10 });
        console.log('📬 Notifications response:', response);
        
        if (response.status && response.data) {
          console.log('✅ Setting notifications:', response.data.notifications);
          setNotifications(response.data.notifications);
          const unread = response.data.notifications.filter(n => !n.isRead).length;
          setUnreadCount(unread);
          console.log(`📊 Total: ${response.data.notifications.length}, Unread: ${unread}`);
        } else {
          console.log('❌ Response not successful or no data:', response);
        }
      } catch (error) {
        console.error('❌ Failed to fetch notifications:', error);
      } finally {
        setIsLoadingNotifications(false);
      }
    };

    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationDropdownRef.current && !notificationDropdownRef.current.contains(event.target as Node)) {
        setIsNotificationDropdownOpen(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Find Items', href: '/explore' },
    { name: 'How It Works', href: '/how-it-works' },
    { name: 'Contact', href: '/contact' },
  ];

  const isActive = (path: string) => location.pathname === path;

  // Debug: Log notifications state whenever it changes
  useEffect(() => {
    console.log('🔔 Notifications state changed:', {
      count: notifications.length,
      unreadCount,
      isLoading: isLoadingNotifications,
      notifications: notifications.slice(0, 2) // Log first 2 for debugging
    });
  }, [notifications, unreadCount, isLoadingNotifications]);

  // Helper function to format time
  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Helper function to get notification icon based on module
  const getNotificationIcon = (module: string) => {
    switch (module) {
      case 'product': return Package;
      case 'ad': return ShoppingBag;
      default: return Bell;
    }
  };

  // Handle notification click
  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await notificationService.markAsRead(notification.id);
        // Update local state
        setNotifications(prev => prev.map(n => 
          n.id === notification.id ? { ...n, isRead: true } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate based on module
      if (notification.module === 'product' && notification.product) {
        navigate(`/product/${notification.product.nameSlug}`);
      }
      
      setIsNotificationDropdownOpen(false);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Still navigate even if marking as read fails
      if (notification.module === 'product' && notification.product) {
        navigate(`/product/${notification.product.nameSlug}`);
      }
      setIsNotificationDropdownOpen(false);
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white shadow-sm border-b sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Logo size="medium" showText={true} className="text-gray-900 dark:text-gray-100" />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`px-4 py-2 rounded-md text-base font-semibold transition-colors ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/10'
                    : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {isLoggedIn ? (
              <>
                <div className="relative" ref={notificationDropdownRef}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => setIsNotificationDropdownOpen(!isNotificationDropdownOpen)}
                  >
                    <Bell className="h-5 w-5" />
                    {/* Show count badge only if there are unread notifications */}
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </Button>
                  
                  {/* Notification Dropdown */}
                  <AnimatePresence>
                    {isNotificationDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                        style={{ maxHeight: '24rem', overflowY: 'auto' }}
                      >
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
                            <Link 
                              to="/dashboard/notifications"
                              className="text-sm text-primary hover:text-primary/80"
                              onClick={() => setIsNotificationDropdownOpen(false)}
                            >
                              View all
                            </Link>
                          </div>
                        </div>
                        
                        <div>
                          {isLoadingNotifications ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                              <p>Loading notifications...</p>
                            </div>
                          ) : notifications.length > 0 ? (
                            notifications.slice(0, 5).map((notification) => {
                              const IconComponent = getNotificationIcon(notification.module);
                              const productImage = notification.product?.image 
                                ? (notification.product.image.startsWith('http') 
                                    ? notification.product.image 
                                    : `${config.api.mediaUrl}${notification.product.image}`)
                                : null;
                              
                              return (
                                <div
                                  key={notification.id}
                                  className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors ${
                                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                  }`}
                                  onClick={() => handleNotificationClick(notification)}
                                >
                                  <div className="flex items-start gap-3">
                                    {productImage ? (
                                      <img 
                                        src={productImage} 
                                        alt={notification.product?.name}
                                        className="w-10 h-10 rounded object-cover"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                                        }}
                                      />
                                    ) : (
                                      <div className={`p-2 rounded-full ${
                                        !notification.isRead ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-600'
                                      }`}>
                                        <IconComponent className="w-4 h-4" />
                                      </div>
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                      <h4 className={`font-medium text-sm ${
                                        !notification.isRead ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'
                                      }`}>
                                        {notification.title}
                                      </h4>
                                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {notification.message}
                                      </p>
                                      <div className="flex items-center gap-2 mt-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          {formatTimeAgo(notification.createdAt)}
                                        </span>
                                        {!notification.isRead && (
                                          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                              <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                              <p>No notifications yet</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                {/* User Dropdown */}
                <div className="relative" ref={userDropdownRef}>
                  <button
                    onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                    className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800 px-3 py-2 rounded-md transition-colors"
                  >
                    <UserAvatar
                      src={user?.image}
                      alt={`${user?.firstName} ${user?.lastName}` || 'User'}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.firstName} {user?.lastName}</span>
                      {isAdmin && (
                        <span className="text-xs text-primary">Admin</span>
                      )}
                    </div>
                    <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isUserDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  <AnimatePresence>
                    {isUserDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                      >
                        <div className="py-1">
                          <Link
                            to="/dashboard"
                            onClick={() => setIsUserDropdownOpen(false)}
                            className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <User className="mr-3 h-4 w-4" />
                            Dashboard
                          </Link>
                          <button
                            onClick={() => {
                              setIsUserDropdownOpen(false);
                              logout();
                            }}
                            className="w-full flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <LogOut className="mr-3 h-4 w-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <>
                <Button asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t"
          >
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    isActive(item.href)
                      ? 'text-primary bg-primary/10'
                      : 'text-gray-700 dark:text-gray-300 hover:text-primary hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              <div className="pt-4 space-y-2">
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-sm font-medium text-gray-700">Theme</span>
                  <ThemeToggle />
                </div>
                {isLoggedIn ? (
                  <>
                    <Link 
                      to="/dashboard" 
                      className="flex items-center space-x-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserAvatar
                        src={user?.image}
                        alt={`${user?.firstName} ${user?.lastName}` || 'User'}
                        className="h-8 w-8 rounded-full"
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user?.firstName} {user?.lastName}</span>
                        {isAdmin && (
                          <span className="text-xs text-primary">Admin</span>
                        )}
                      </div>
                    </Link>
                    <div className="space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-md transition-colors"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <Button asChild className="w-full">
                      <Link to="/login">Login</Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
