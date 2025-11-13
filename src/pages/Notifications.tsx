import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  MessageCircle, 
  Phone, 
  Mail, 
  ShoppingBag,
  Clock,
  Search,
  RefreshCw,
  Package
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { notificationService, type Notification } from '../services/notificationService';
import config from '../config';

const Notifications = () => {
  const { user, isLoggedIn } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch notifications from API
  const fetchNotifications = async (pageNum: number = 1) => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await notificationService.getNotifications({ page: pageNum, limit: 20 });
      
      if (response.status && response.data) {
        setNotifications(response.data.notifications);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Initial fetch and polling
  useEffect(() => {
    if (!isLoggedIn) {
      setNotifications([]);
      return;
    }

    fetchNotifications(page);
    
    // Poll for new notifications every 30 seconds
    // Only poll the first page to check for new notifications
    const interval = setInterval(() => {
      // Fetch first page to check for new notifications, but don't change current page view
      notificationService.getNotifications({ page: 1, limit: 20 })
        .then(response => {
          if (response.status && response.data) {
            // Only update if we're on the first page, otherwise just check for new ones
            if (page === 1) {
              setNotifications(response.data.notifications);
              setTotalPages(response.data.totalPages);
              setTotal(response.data.total);
            } else {
              // Update total count if on other pages
              setTotal(response.data.total);
            }
          }
        })
        .catch(error => {
          console.error('Failed to poll notifications:', error);
        });
    }, 30000);
    
    return () => clearInterval(interval);
  }, [isLoggedIn, page]);

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const refreshNotifications = async () => {
    setIsRefreshing(true);
    try {
      const response = await notificationService.getNotifications({ page: page, limit: 20 });
      
      if (response.status && response.data) {
        setNotifications(response.data.notifications);
        setTotalPages(response.data.totalPages);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read if not already read
      if (!notification.isRead) {
        await handleMarkAsRead(notification.id);
      }

      // Navigate based on module
      if (notification.module === 'product' && notification.product) {
        navigate(`/product/${notification.product.nameSlug}`);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const getNotificationIcon = (module: string) => {
    switch (module) {
      case 'product': return Package;
      case 'ad': return ShoppingBag;
      case 'message': return MessageCircle;
      case 'call': return Phone;
      case 'email': return Mail;
      default: return Bell;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - notificationTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600 mt-2">Stay updated with your activity</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refreshNotifications}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading && notifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-500">Loading notifications...</p>
            </CardContent>
          </Card>
        ) : filteredNotifications.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">You're all caught up! New notifications will appear here.</p>
            </CardContent>
          </Card>
        ) : (
          <AnimatePresence>
            {filteredNotifications.map((notification, index) => {
              const IconComponent = getNotificationIcon(notification.module);
              const productImage = notification.product?.image 
                ? (notification.product.image.startsWith('http') 
                    ? notification.product.image 
                    : `${config.api.mediaUrl}${notification.product.image}`)
                : null;
              
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <Card 
                    className={`hover:shadow-md transition-all duration-200 cursor-pointer ${
                      !notification.isRead ? 'border-l-4 border-l-blue-500 bg-blue-50/30 dark:bg-blue-900/20' : ''
                    }`}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {productImage ? (
                          <img 
                            src={productImage} 
                            alt={notification.product?.name}
                            className="w-12 h-12 rounded object-cover flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                            }}
                          />
                        ) : (
                          <div className={`p-2 rounded-full flex-shrink-0 ${
                            !notification.isRead ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-100 dark:bg-gray-600'
                          }`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                        )}
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className={`font-medium ${
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
                            
                            <div className="flex items-center gap-2 ml-4" onClick={(e) => e.stopPropagation()}>
                              {!notification.isRead && (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleMarkAsRead(notification.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Actions */}
      {filteredNotifications.length > 0 && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {filteredNotifications.filter(n => !n.isRead).length} unread notifications
            {total > filteredNotifications.length && ` (${total} total)`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={filteredNotifications.every(n => n.isRead)}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark All Read
            </Button>
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.max(1, prev - 1))}
            disabled={page === 1 || isLoading}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
            disabled={page === totalPages || isLoading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default Notifications;