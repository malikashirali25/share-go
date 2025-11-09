import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  CheckCircle, 
  XCircle, 
  Eye, 
  User,
  Calendar,
  DollarSign,
  MapPin,
  Flag,
  AlertTriangle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdContext';
import { productService } from '../services/productService';
import type { Product } from '../interfaces/product';

const AdminAds = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adToDelete, setAdToDelete] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const { ads, getUserAds, deleteAd, updateAdStatus } = useAds();

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await productService.getProducts();
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
      
      setProducts(productArray);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate ads to display based on user role - use products from API
  // For now, show all active products (status !== 2 means not completed)
  const adsToDisplay = products.filter(p => p.status !== 2);

  const filteredAds = adsToDisplay.filter(product => {
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.tags.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || String(product.status) === filterStatus;
    const matchesCategory = filterCategory === 'all' || String(product.categoryId) === filterCategory;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEditAd = (adId: string) => {
    navigate(`/dashboard/edit-item/${adId}`);
  };

  const handleDeleteAd = (adId: string) => {
    setAdToDelete(adId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (adToDelete) {
      deleteAd(adToDelete);
      setAdToDelete(null);
      setIsDeleteModalOpen(false);
    }
  };

  const cancelDelete = () => {
    setAdToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleViewAd = (adId: string) => {
    navigate(`/item/${adId}`);
  };

  const handleApproveAd = (adId: string) => {
    updateAdStatus(adId, 'active');
  };

  const handleRejectAd = (adId: string) => {
    updateAdStatus(adId, 'rejected');
  };

  const handleRemoveAd = (adId: string) => {
    setAdToDelete(adId);
    setIsDeleteModalOpen(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'sold':
        return 'text-blue-600 bg-blue-100';
      case 'expired':
        return 'text-gray-600 bg-gray-100';
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'rejected':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {isAdmin ? 'All Ads Management' : 'My Items'}
          </h1>
          <p className="text-gray-600">
            {isAdmin ? 'Manage all marketplace advertisements' : 'Manage your posted advertisements'}
          </p>
          <div className="mt-2 flex items-center space-x-2 text-sm text-gray-500">
            <div className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-red-500' : 'bg-blue-500'}`}></div>
            <span>
              {isAdmin 
                ? `Showing all ${adsToDisplay.length} ads from all users` 
                : `Showing ${adsToDisplay.length} of your ads`
              }
            </span>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search ads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending Review</option>
                  <option value="sold">Sold</option>
                  <option value="expired">Expired</option>
                  {isAdmin && (
                    <>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </>
                  )}
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Musical Instruments">Musical Instruments</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Ads List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-4"
        >
          {filteredAds.map((ad, index) => (
            <motion.div
              key={ad.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <img
                      src={ad.images[0]}
                      alt={ad.title}
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className="font-semibold text-gray-900">{ad.title}</h3>
                            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ad.status)}`}>
                              {ad.status.charAt(0).toUpperCase() + ad.status.slice(1)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{ad.description}</p>
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatPrice(ad.price)}
                            </div>
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              {ad.location}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(ad.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              {ad.views} views
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={ad.user.avatar}
                            alt={ad.user.name}
                            className="h-6 w-6 rounded-full"
                          />
                          <span className="text-sm text-gray-600">{ad.user.name}</span>
                          <div className="flex items-center">
                            <span className="text-xs text-gray-500">{ad.user.rating}★</span>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewAd(ad.id)}
                            className="text-blue-600 border-blue-600 hover:bg-blue-50"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                          
                          {isAdmin ? (
                            // Admin actions
                            <>
                              {ad.status === 'pending' && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleApproveAd(ad.id)}
                                    className="text-green-600 border-green-600 hover:bg-green-50"
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRejectAd(ad.id)}
                                    className="text-red-600 border-red-600 hover:bg-red-50"
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveAd(ad.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Remove
                              </Button>
                            </>
                          ) : (
                            // User actions (only for their own ads)
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEditAd(ad.id)}
                                className="text-green-600 border-green-600 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDeleteAd(ad.id)}
                                className="text-red-600 border-red-600 hover:bg-red-50"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </>
                          )}
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">
                  {adsToDisplay.length}
                </div>
                <div className="text-gray-600">Total Ads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-yellow-600 mb-2">
                  {adsToDisplay.filter(ad => ad.status === 'pending').length}
                </div>
                <div className="text-gray-600">Pending Review</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-green-600 mb-2">
                  {adsToDisplay.filter(ad => ad.status === 'active').length}
                </div>
                <div className="text-gray-600">Approved</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-2xl font-bold text-red-600 mb-2">
                  {adsToDisplay.filter(ad => ad.status === 'sold').length}
                </div>
                <div className="text-gray-600">Sold</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 mx-auto bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {isAdmin ? 'Remove Ad' : 'Delete Ad'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                {isAdmin 
                  ? 'Are you sure you want to remove this ad from the marketplace? This action cannot be undone.'
                  : 'Are you sure you want to delete this ad? This action cannot be undone.'
                }
              </p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={cancelDelete}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={confirmDelete}
                  className="flex-1"
                >
                  {isAdmin ? 'Remove' : 'Delete'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAds;
