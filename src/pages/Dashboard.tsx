import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { 
  Home, 
  ShoppingBag, 
  Bell, 
  Settings, 
  Plus,
  TrendingUp,
  ArrowUpRight,
  Menu,
  X,
  Package,
  MapPin,
  MessageCircle,
  Flag,
  Users,
  Eye,
  CheckCircle,
  BarChart3,
  Mail
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useNotifications } from '../contexts/NotificationContext';
import { productService } from '../services/productService';
import { userService } from '../services/userService';
import type { Product } from '../interfaces/product';
import config from '../config';

const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { getUnreadCount } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    activeItems: 0,
    completedItems: 0,
    totalItems: 0,
    unreadNotifications: 0,
    unreadMessages: 0
  });

  const navigation = [
    ...(isAdmin ? [
      { name: 'All Products', href: '/dashboard/admin/products', icon: ShoppingBag },
      { name: 'Reports', href: '/dashboard/admin/reports', icon: Flag },
      { name: 'Users', href: '/dashboard/admin/users', icon: Users },
    ] : [
      { name: 'Dashboard', href: '/dashboard', icon: Home },
      { name: 'Items', href: '/dashboard/products', icon: Package },
      { name: 'Addresses', href: '/dashboard/addresses', icon: MapPin },
      { name: 'Messages', href: '/dashboard/messages', icon: MessageCircle },
      { name: 'My Reports', href: '/dashboard/reports', icon: Flag },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]),
  ];

  const isActive = (path: string) => location.pathname === path;

  // Fetch dashboard stats from dedicated endpoint
  useEffect(() => {
    const fetchDashboardStats = async () => {
      if (isAdmin || !user) return; // Don't fetch for admins or if not logged in
      
      try {
        setIsLoadingStats(true);
        const response = await userService.getDashboardStats();
        
        if (response.status && response.data) {
          setStats({
            totalViews: response.data.totalViews || 0,
            activeItems: response.data.activeItems || 0,
            completedItems: response.data.completedItems || 0,
            totalItems: response.data.totalItems || 0,
            unreadNotifications: response.data.unreadNotifications || 0,
            unreadMessages: response.data.unreadMessages || 0
          });
        }
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
        setStats({ totalViews: 0, activeItems: 0, completedItems: 0, totalItems: 0, unreadNotifications: 0, unreadMessages: 0 });
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchDashboardStats();
  }, [isAdmin, user]);

  // Fetch recent products for display (only for recent items section)
  useEffect(() => {
    const fetchRecentProducts = async () => {
      if (isAdmin || !user) return; // Don't fetch for admins or if not logged in
      
      try {
        setIsLoadingProducts(true);
        const response = await productService.getProducts();
        
        // Handle different response formats
        let productArray: Product[] = [];
        
        if (Array.isArray(response)) {
          productArray = response;
        } else if (response && typeof response === 'object') {
          const res = response as any;
          if ('data' in res && res.data && typeof res.data === 'object') {
            if ('products' in res.data && Array.isArray(res.data.products)) {
              productArray = res.data.products as Product[];
            } else if (Array.isArray(res.data)) {
              productArray = res.data as Product[];
            }
          } else if ('products' in res && Array.isArray(res.products)) {
            productArray = res.products as Product[];
          }
        }
        
        // Get only the 5 most recent products for display
        setRecentProducts(productArray.slice(0, 5));
      } catch (error) {
        console.error('Error loading recent products:', error);
        setRecentProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchRecentProducts();
  }, [isAdmin, user]);

  // Redirect admins to product listing page
  useEffect(() => {
    if (isAdmin && location.pathname === '/dashboard') {
      navigate('/dashboard/admin/products', { replace: true });
    }
  }, [isAdmin, location.pathname, navigate]);

  // Close sidebar on route change
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.3 }}
        className={`
          w-64 bg-white shadow-lg flex-shrink-0
          fixed lg:static inset-y-0 left-0 z-50
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">SharinGo</h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <nav className="mt-6 px-3">
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {item.name === 'Notifications' && user && getUnreadCount(user.id) > 0 && (
                  <span className={`ml-2 h-5 w-5 ${isActive(item.href) ? 'bg-white text-red-600' : 'bg-red-500 text-white'} text-xs rounded-full flex items-center justify-center font-medium shadow-lg`}>
                    {getUnreadCount(user.id) > 99 ? '99+' : getUnreadCount(user.id)}
                  </span>
                )}
              </Link>
            ))}
          </div>
          
          {!isAdmin && (
            <div className="mt-6">
              <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                <Link to="/dashboard/create-product" className="flex flex-row items-center justify-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Post Your Item
                </Link>
              </Button>
            </div>
          )}
        </nav>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">SharinGo</h1>
          <div className="w-9"></div> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <div className="p-6 sm:p-8 lg:p-10">
          {location.pathname === '/dashboard' ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
            <div className="mb-8">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">Welcome back! Here's what's happening with your account.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {[
                { name: 'Total Views', value: stats.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600 dark:text-blue-400', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
                { name: 'Active Items', value: stats.activeItems.toString(), icon: Package, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100 dark:bg-green-900/20' },
                { name: 'Completed', value: stats.completedItems.toString(), icon: CheckCircle, color: 'text-purple-600 dark:text-purple-400', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
                { name: 'Total Items', value: stats.totalItems.toString(), icon: BarChart3, color: 'text-orange-600 dark:text-orange-400', bgColor: 'bg-orange-100 dark:bg-orange-900/20' },
                { name: 'Unread Notifications', value: stats.unreadNotifications.toString(), icon: Bell, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100 dark:bg-red-900/20' },
                { name: 'Unread Messages', value: stats.unreadMessages.toString(), icon: Mail, color: 'text-indigo-600 dark:text-indigo-400', bgColor: 'bg-indigo-100 dark:bg-indigo-900/20' },
              ].map((stat, index) => {
                const IconComponent = stat.icon;
                return (
                  <motion.div
                    key={stat.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow duration-300 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{stat.name}</p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                              {isLoadingStats ? (
                                <span className="inline-block h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></span>
                              ) : (
                                stat.value
                              )}
                            </p>
                          </div>
                          <div className={`p-3 rounded-lg ${stat.bgColor} ${stat.color}`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Your Recent Items */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="lg:col-span-2"
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Your Recent Items</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Latest items you've posted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoadingProducts ? (
                      <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                          <div key={i} className="flex items-center gap-3 p-3">
                            <div className="h-16 w-16 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                            <div className="flex-1 space-y-2">
                              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : recentProducts.length === 0 ? (
                      <div className="py-12 text-center">
                        <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No items yet</p>
                        <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Start by posting your first item</p>
                      </div>
                    ) : (
                      <>
                        <div className="space-y-3">
                          {recentProducts.map((product, index) => {
                            const imageUrl = product.media && product.media.length > 0
                              ? (typeof product.media[0] === 'string'
                                  ? product.media[0]
                                  : (product.media[0] as any)?.mediaUrl || '')
                              : '/icons/product_placeholder.jpg';
                            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${config.api.mediaUrl}${imageUrl}`;
                            
                            return (
                              <motion.div
                                key={product.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                                onClick={() => navigate(`/product/${product.id}`)}
                              >
                                <img
                                  src={fullImageUrl}
                                  alt={product.name}
                                  className="h-16 w-16 rounded-lg object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-blue-500 transition-all"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                                  }}
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{product.name}</p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    ${product.price}
                                  </p>
                                </div>
                                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <ArrowUpRight className="h-4 w-4" />
                                </Button>
                              </motion.div>
                            );
                          })}
                        </div>
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <Button asChild variant="outline" className="w-full">
                            <Link to="/dashboard/products">View All Items</Link>
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-semibold">Quick Actions</CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">Common tasks and shortcuts</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {!isAdmin && (
                      <Button asChild className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                        <Link to="/dashboard/create-product" className="flex flex-row items-center justify-center">
                          <Plus className="mr-2 h-4 w-4" />
                          Post Your Item
                        </Link>
                      </Button>
                    )}
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/explore">
                        <ShoppingBag className="mr-2 h-4 w-4" />
                        Browse Items
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link to="/dashboard/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        Account Settings
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
            </motion.div>
          ) : (
            <Outlet />
          )}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
