import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  Flag, 
  MapPin, 
  Calendar, 
  Eye, 
  Star,
  MessageCircle,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  User,
  Clock,
  Lock,
  X,
  Send
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import MapComponent from '../components/MapComponent';
import RatingSystem from '../components/RatingSystem';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';
import { productService } from '../services/productService';
import { chatService } from '../services/chatService';
import { PublicProduct } from '../interfaces/product';
import config from '../config';

const ItemDetails = () => {
  const { id, nameSlug } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useAuth();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [product, setProduct] = useState<PublicProduct | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  useEffect(() => {
    // Use nameSlug if available, otherwise fall back to id
    const identifier = nameSlug || id;
    if (identifier) {
      loadProduct(identifier);
    }
  }, [id, nameSlug]);

  const loadProduct = async (nameSlug: string) => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Loading product with nameSlug:', nameSlug);
      const response = await productService.getPublicProductBySlug(nameSlug);
      console.log('API Response:', response);
      console.log('Response success:', response.success);
      console.log('Response data:', response.data);
      
      // Handle both 'success' and 'status' response formats
      const isSuccess = response.success === true || response.status === true;
      
      // Check if data exists - could be response.data or response directly
      const productData = response.data || (isSuccess ? response : null);
      
      if (isSuccess && productData) {
        // Validate that we have required fields (id, name)
        if (productData.id && productData.name) {
          console.log('Setting product:', productData);
          setProduct(productData);
        } else {
          console.warn('Product data missing required fields:', productData);
          setError('Invalid product data received');
        }
      } else {
        console.warn('Product not found or invalid response:', {
          success: response.success,
          status: response.status,
          hasData: !!response.data,
          response
        });
        setError('Product not found');
      }
    } catch (err: any) {
      console.error('Error loading product:', err);
      console.error('Error details:', {
        status: err.status,
        message: err.message,
        error: err.error
      });
      setError(err.message || 'Failed to load product');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    if (!product) {
      return;
    }

    const slugToUse = product.nameSlug || nameSlug;
    if (!slugToUse) {
      console.warn('Unable to increment product view: missing product slug');
      return;
    }

    const storageKey = 'sharego_viewed_products';
    const viewKey = product.id ? `id:${product.id}` : `slug:${slugToUse}`;

    let storedViews: string[] = [];
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          storedViews = parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse viewed products from localStorage', err);
    }

    if (storedViews.includes(viewKey)) {
      return;
    }

    const updatedViews = [...storedViews, viewKey];
    try {
      localStorage.setItem(storageKey, JSON.stringify(updatedViews));
    } catch (err) {
      console.warn('Failed to persist viewed products to localStorage', err);
    }

    const incrementView = async () => {
      try {
        const response = await productService.incrementProductView(slugToUse);
        setProduct((prev) => {
          if (!prev) return prev;
          const newViews =
            response?.data?.views ??
            (typeof prev.views === 'number' ? prev.views + 1 : prev.views);
          return {
            ...prev,
            views: newViews,
          };
        });
      } catch (err) {
        console.error('Failed to increment product view', err);
        try {
          const rawAfterError = localStorage.getItem(storageKey);
          if (rawAfterError) {
            const parsedAfterError = JSON.parse(rawAfterError);
            if (Array.isArray(parsedAfterError)) {
              const rolledBack = parsedAfterError.filter(
                (storedKey) => storedKey !== viewKey
              );
              localStorage.setItem(storageKey, JSON.stringify(rolledBack));
            }
          }
        } catch (rollbackError) {
          console.warn('Failed to rollback viewed products cache', rollbackError);
        }
      }
    };

    incrementView();
  }, [product, nameSlug]);

  // Get image URLs
  const getImageUrls = () => {
    if (!product || !product.media || product.media.length === 0) {
      return ['/icons/product_placeholder.jpg'];
    }
    
    return product.media.map(mediaItem => {
      const mediaUrl = mediaItem.mediaUrl || '';
      return mediaUrl.startsWith('http') ? mediaUrl : `${config.api.mediaUrl}${mediaUrl}`;
    });
  };

  const images = getImageUrls();

  const formatPrice = (price: number | string) => {
    // Convert to number if it's a string
    const priceNum = typeof price === 'string' ? Number.parseFloat(price) : price;
    
    // Check if price is 0, null, undefined, or NaN
    if (priceNum === 0 || priceNum === null || priceNum === undefined || Number.isNaN(priceNum)) {
      return 'Free';
    }
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(priceNum);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatMemberSince = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const handleContactSeller = () => {
    if (!isLoggedIn) {
      const pathname = nameSlug ? `/product/${nameSlug}` : `/item/${id}`;
      navigate('/login', { state: { from: { pathname } } });
      return;
    }
    setShowContactModal(true);
  };

  const handleSendMessage = async () => {
    if (!product || !message.trim() || !user || isSendingMessage) return;

    try {
      setIsSendingMessage(true);
      
      const currentUserId = Number.parseInt(user.id, 10);
      const ownerId = product.user.id;

      // Don't allow users to chat with themselves
      if (ownerId === currentUserId) {
        alert('You cannot contact yourself');
        setShowContactModal(false);
        return;
      }

      // Initiate chat
      const response = await chatService.initiateChat({
        productId: product.id,
        userBId: currentUserId,
      });

      if (response.status && response.data) {
        // Send the initial message
        await chatService.sendMessage({
          chatId: response.data.id,
          content: message.trim(),
        });

        // Close modal and navigate to messages
        setShowContactModal(false);
        setMessage('');
        navigate(`/dashboard/messages?chatId=${response.data.id}`);
      }
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert(err.message || 'Failed to send message. Please try again.');
    } finally {
      setIsSendingMessage(false);
    }
  };

  // Get location string
  const getLocationString = () => {
    if (!product?.address) return 'Not specified';
    const addr = product.address;
    return `${addr.city}, ${addr.state}, ${addr.country}`;
  };

  // Check if map coordinates are available
  const hasMapCoordinates = () => {
    if (!product?.address) return false;
    const addr = product.address;
    return addr.lat && addr.lng && addr.lat !== '' && addr.lng !== '';
  };

  // Get map coordinates
  const getMapCoordinates = () => {
    if (!product?.address || !hasMapCoordinates()) return null;
    const addr = product.address;
    const lat = typeof addr.lat === 'string' ? parseFloat(addr.lat) : addr.lat;
    const lng = typeof addr.lng === 'string' ? parseFloat(addr.lng) : addr.lng;
    
    if (isNaN(lat as number) || isNaN(lng as number)) return null;
    
    return {
      lat: lat as number,
      lng: lng as number,
    };
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading item...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Item Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The item you\'re looking for doesn\'t exist.'}</p>
          <Button onClick={() => navigate('/explore')}>
            Back to Browse
          </Button>
        </div>
      </div>
    );
  }

  const seller = product.user;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 capitalize">{product.name}</h1>
              <div className="flex items-center space-x-4 mt-2 text-sm text-gray-600">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-1" />
                  {getLocationString()}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  Posted {formatDate(product.createdAt)}
                </div>
                <div className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {product.views || 0} views
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsFavorited(!isFavorited)}
              >
                <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Flag className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            {/* Image Gallery */}
            <Card>
              <CardContent className="p-0">
                <div className="relative">
                  <img
                    src={images[currentImageIndex]}
                    alt={product.name}
                    className="w-full h-96 object-cover rounded-t-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                    }}
                  />
                  
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 transform -translate-y-1/2"
                        onClick={prevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 transform -translate-y-1/2"
                        onClick={nextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </>
                  )}

                  <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                </div>

                {/* Thumbnail Navigation */}
                {images.length > 1 && (
                  <div className="p-4">
                    <div className="flex space-x-2 overflow-x-auto">
                      {images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 ${
                            index === currentImageIndex ? 'border-primary' : 'border-gray-200'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                            }}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{product.description}</p>
              </CardContent>
            </Card>

            {/* Item Details */}
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Category</h4>
                    <p className="text-gray-600">{product.category.name}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Location</h4>
                    <div className="flex items-center gap-2">
                      <p className="text-gray-600">{getLocationString()}</p>
                      {hasMapCoordinates() && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowMap(!showMap)}
                          className="flex items-center gap-1"
                        >
                          <MapPin className="w-4 h-4" />
                          {showMap ? 'Hide Map' : 'Show Map'}
                        </Button>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">Posted</h4>
                    <p className="text-gray-600">{formatDate(product.createdAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Map Component */}
            {showMap && hasMapCoordinates() && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      Location Map
                    </CardTitle>
                    <CardDescription>
                      View the exact location of this item
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const coords = getMapCoordinates();
                      if (!coords) return null;
                      return (
                        <MapComponent
                          initialLocation={{
                            lat: coords.lat,
                            lng: coords.lng,
                            address: getLocationString()
                          }}
                          height="300px"
                          showSearch={false}
                          showCurrentLocation={false}
                          className="rounded-lg"
                        />
                      );
                    })()}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Price and Contact */}
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="text-4xl font-bold text-primary mb-2">
                    {formatPrice(product.price)}
                  </div>
                </div>

                <div className="space-y-3">
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleContactSeller}
                    disabled={!isLoggedIn}
                  >
                    {!isLoggedIn ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Login to Contact
                      </>
                    ) : (
                      <>
                        <MessageCircle className="mr-2 h-4 w-4" />
                        Contact Seller
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Seller Info */}
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <UserAvatar
                    src={
                      seller.image?.startsWith('http')
                        ? seller.image
                        : `${config.api.mediaUrl}${seller.image}`
                    }
                    alt={`${seller.firstName} ${seller.lastName}`}
                    className="h-12 w-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {seller.firstName} {seller.lastName}
                    </h3>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Member since {formatMemberSince(seller.createdAt)}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle>Safety Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Meet in a public place
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Bring a friend if possible
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Inspect the item before paying
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Trust your instincts
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Report */}
            <Card>
              <CardContent className="p-4">
                <Button variant="outline" className="w-full">
                  <Flag className="mr-2 h-4 w-4" />
                  Report This Ad
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Contact Seller Modal */}
      <AnimatePresence>
        {showContactModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowContactModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Contact Seller</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowContactModal(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-4">
                <div className="flex items-center space-x-3 mb-2">
                  <UserAvatar
                    src={
                      seller.image?.startsWith('http')
                        ? seller.image
                        : `${config.api.mediaUrl}${seller.image}`
                    }
                    alt={`${seller.firstName} ${seller.lastName}`}
                    className="h-10 w-10 rounded-full"
                  />
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {seller.firstName} {seller.lastName}
                    </p>
                    <p className="text-sm text-gray-600 capitalize">{product.name}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <Label htmlFor="message">Your Message</Label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Hi! I'm interested in this item. Is it still available?"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  rows={5}
                  disabled={isSendingMessage}
                />
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowContactModal(false);
                    setMessage('');
                  }}
                  disabled={isSendingMessage}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSendMessage}
                  disabled={!message.trim() || isSendingMessage}
                >
                  {isSendingMessage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Send Message
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ItemDetails;
