import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Grid, 
  List, 
  MapPin, 
  Heart, 
  Star,
  X,
  SlidersHorizontal,
  DollarSign,
  Tag,
  ChevronDown,
  Check,
  Sparkles
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent } from '../components/ui/card';
import { SearchableSelect } from '../components/ui/searchable-select';
import { productService } from '../services/productService';
import { ProductCategory, PublicProduct } from '../interfaces/product';
import { Ad } from '../types';
import UserAvatar from '../components/UserAvatar';
import config from '../config';
import { getAllCitiesWithStates } from '../data/usLocations';

const FindItems = () => {
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const conditions = ['All', 'New', 'Like New', 'Good', 'Fair', 'Poor'];
  
  // Generate location options with cities grouped by state
  const locationOptions = [
    { value: 'All', label: 'All Locations', group: '' },
    ...getAllCitiesWithStates()
  ];
  
  const sortOptions = [
    { value: 'newest', label: 'Recently Shared' },
    { value: 'oldest', label: 'Shared Long Ago' },
    { value: 'price-high', label: 'Price High to Low' },
    { value: 'price-low', label: 'Price Low to High' }
  ];

  // Map PublicProduct to Ad interface
  const mapProductToAd = (product: PublicProduct): Ad => {
    // Map media URLs - prepend mediaUrl if needed
    const sortedMedia = [...product.media].sort((a, b) => a.sequence - b.sequence);
    const images = sortedMedia.map(media => {
        const mediaUrl = media.mediaUrl;
        // If mediaUrl doesn't start with http, prepend the base media URL
        if (mediaUrl && !mediaUrl.startsWith('http')) {
          return `${config.api.mediaUrl}${mediaUrl}`;
        }
        return mediaUrl;
      });

    // Default image if no media
    if (images.length === 0) {
      images.push('/icons/product_placeholder.jpg');
    }

    // Capitalize product name
    const capitalizeName = (name: string) => {
      return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };

    return {
      id: product.id.toString(),
      title: capitalizeName(product.name),
      description: product.description,
      price: Number.parseFloat(product.price.toString()),
      category: product.category.name,
      location: product.address?.city || 'Not specified',
      images: images,
      user: {
        id: product.user.id.toString(),
        name: `${product.user.firstName} ${product.user.lastName}`,
        email: '',
        avatar: product.user.image?.startsWith('http') 
          ? product.user.image 
          : `${config.api.mediaUrl}${product.user.image}`,
        rating: 5, // Default rating as API doesn't provide it
        role: 'user' as const,
        location: '',
        joinDate: new Date().toISOString(),
      },
      createdAt: product.createdAt,
      status: 'active' as const, // API only returns active products
      views: product.views || 0,
      condition: 'good' as const, // Default condition as API doesn't provide it
      nameSlug: product.nameSlug,
    };
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const categoriesData = await productService.getCategories();
      
      // Handle wrapped response format
      let categoriesArray: ProductCategory[] = [];
      if (Array.isArray(categoriesData)) {
        categoriesArray = categoriesData;
      } else if (categoriesData && typeof categoriesData === 'object') {
        const res = categoriesData as any;
        if ('data' in res && Array.isArray(res.data)) {
          categoriesArray = res.data;
        } else if ('categories' in res && Array.isArray(res.categories)) {
          categoriesArray = res.categories;
        }
      }
      
      setCategories(categoriesArray);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]); // Ensure it's always an array
    }
  };

  // Load products from API
  const loadProducts = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      }

      const params: {
        categoryId?: number;
        minPrice?: number;
        maxPrice?: number;
        searchKeywords?: string;
        location?: string;
        page?: number;
        limit?: number;
      } = {
        page: page,
        limit: 20,
      };

      // Add category filter
      if (selectedCategory !== 'All') {
        const category = categories.find(cat => cat.name === selectedCategory);
        if (category) {
          params.categoryId = category.id;
        }
      }

      // Add price range filter (server-side)
      if (priceRange[0] > 0) {
        params.minPrice = priceRange[0];
      }
      if (priceRange[1] < 10000) {
        params.maxPrice = priceRange[1];
      }

      // Add location filter (server-side)
      if (selectedLocation !== 'All') {
        params.location = selectedLocation;
      }

      // Add search keywords (only if 3+ characters)
      if (searchTerm.length >= 3) {
        params.searchKeywords = searchTerm;
      }

      const response = await productService.getPublicProducts(params);
      
      if (response.status && response.data) {
        setProducts(response.data.products);
        setTotal(response.data.total);
        setPage(response.data.page);
        setTotalPages(response.data.totalPages);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Load products when filters change
  useEffect(() => {
    if (categories.length > 0 || selectedCategory === 'All') {
      // Reset to page 1 when filters change (but not when page itself changes)
      if (page !== 1) {
        setPage(1);
        return;
      }
      loadProducts(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, selectedLocation, priceRange[0], priceRange[1]]);

  // Load products when page changes
  useEffect(() => {
    if (categories.length > 0 || selectedCategory === 'All') {
      loadProducts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      searchTimeoutRef.current = setTimeout(() => {
        setPage(1); // Reset to first page on new search
        loadProducts();
      }, 500);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);


  // Map products to ads
  const ads = products.map(mapProductToAd);

  // Client-side filtering for condition only (location is now server-side)
  const filteredAds = ads.filter(ad => {
    const matchesCondition = selectedCondition === 'All' || ad.condition === selectedCondition.toLowerCase().replace(' ', '-');
    return matchesCondition;
  });

  // Client-side sorting
  const sortedAds = [...filteredAds].sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'price-high':
        return b.price - a.price;
      case 'price-low':
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const toggleFavorite = (adId: string) => {
    setFavorites(prev => 
      prev.includes(adId) 
        ? prev.filter(id => id !== adId)
        : [...prev, adId]
    );
  };

  const addToRecentSearches = (term: string) => {
    if (term && !recentSearches.includes(term)) {
      setRecentSearches(prev => [term, ...prev.slice(0, 4)]);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('All');
    setSelectedLocation('All');
    setSelectedCondition('All');
    setPriceRange([0, 10000]);
    setPage(1);
  };

  const activeFiltersCount = [
    selectedCategory !== 'All',
    selectedLocation !== 'All',
    selectedCondition !== 'All',
    priceRange[0] > 0 || priceRange[1] < 10000
  ].filter(Boolean).length;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    // Less than 1 minute
    if (diffInSeconds < 60) {
      return 'just now';
    }
    
    // Less than 1 hour - show minutes
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    // Less than 24 hours - show hours
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    // Less than 7 days - show days
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    // Less than 4 weeks - show weeks
    const diffInWeeks = Math.floor(diffInDays / 7);
    if (diffInWeeks < 4) {
      return `${diffInWeeks}w ago`;
    }
    
    // Less than 12 months - show months
    const diffInMonths = Math.floor(diffInDays / 30);
    if (diffInMonths < 12) {
      return `${diffInMonths}mo ago`;
    }
    
    // Show years
    const diffInYears = Math.floor(diffInDays / 365);
    return `${diffInYears}y ago`;
  };

  // Removed unused getConditionColor function

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 px-4 sm:px-6 lg:px-8">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, 100, 0],
              y: [0, -50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"
            animate={{
              x: [0, -100, 0],
              y: [0, 50, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          {/* <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary font-medium mb-6">
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="mr-2 h-4 w-4" />
              </motion.div>
              Find Items to Share
            </div>
          </motion.div> */}

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-slate-100 mb-6"
          >
            Browse & Find
            <br />
            <span className="text-primary">Shared Items</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto mb-12"
          >
            Discover items shared by caring community members. 
            Give items a second life and help reduce waste in your neighborhood.
          </motion.p>

          {/* Enhanced Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="max-w-2xl mx-auto mb-8"
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl p-2 border border-slate-200/50 dark:border-slate-700/50 shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      type="text"
                      placeholder="Search for items you need or want to share..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        addToRecentSearches(e.target.value);
                      }}
                      className="pl-12 pr-4 py-4 bg-transparent border-0 text-lg placeholder:text-slate-400 focus:ring-0 focus:outline-none"
                    />
                    {searchTerm && (
                      <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={() => setSearchTerm('')}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                      >
                        <X className="h-4 w-4 text-slate-400" />
                      </motion.button>
                    )}
                  </div>
                  <Button
                    onClick={() => setShowFilters(!showFilters)}
                    className="px-6 py-4 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group"
                  >
                    <SlidersHorizontal className="mr-2 h-5 w-5 group-hover:rotate-180 transition-transform duration-300" />
                    Filters
                    {activeFiltersCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="ml-2 px-2 py-1 bg-white/20 rounded-full text-xs font-medium"
                      >
                        {activeFiltersCount}
                      </motion.span>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </section>

      {/* Modern Advanced Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -20 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="relative overflow-hidden"
          >
            {/* Animated Background */}
            <div className="absolute inset-0">
              <motion.div
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, #3b82f6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #8b5cf6 0%, transparent 50%)`,
                  backgroundSize: '400px 400px',
                }}
                animate={{
                  backgroundPosition: ['0% 0%', '100% 100%'],
                }}
                transition={{
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
              />
            </div>

            <div className="relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-t border-slate-200/50 dark:border-slate-700/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Filter Header */}
                {/* <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <div className="inline-flex items-center px-4 py-2 bg-primary/10 dark:bg-primary/20 rounded-full text-primary font-medium mb-4">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                    </motion.div>
                    Advanced Filters
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                    Find What You Need
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400">
                    Discover items shared by community members with our helpful filters
                  </p>
                </motion.div> */}

                {/* Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Category Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                    className="group"
                  >
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 group-hover:text-primary transition-colors duration-300">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                            <Tag className="h-4 w-4 text-white" />
                          </div>
                          Category
                        </div>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCategory}
                          onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setPage(1); // Reset to first page when category changes
                          }}
                          className="w-full px-4 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 shadow-lg hover:shadow-xl appearance-none cursor-pointer"
                        >
                          <option value="All">All Categories</option>
                          {Array.isArray(categories) && categories.map(category => (
                            <option key={category.id} value={category.name}>{category.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>

                  {/* Location Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.3 }}
                    className="group"
                  >
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 group-hover:text-primary transition-colors duration-300">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                            <MapPin className="h-4 w-4 text-white" />
                          </div>
                          Location
                        </div>
                      </label>
                      <SearchableSelect
                        options={locationOptions}
                        value={selectedLocation}
                        onChange={(value) => setSelectedLocation(value)}
                        placeholder="All Locations"
                        searchPlaceholder="Search cities..."
                        grouped={true}
                      />
                    </div>
                  </motion.div>

                  {/* Condition Filter */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    className="group"
                  >
                    <div className="relative">
                      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4 group-hover:text-primary transition-colors duration-300">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-300">
                            <Star className="h-4 w-4 text-white" />
                          </div>
                          Condition
                        </div>
                      </label>
                      <div className="relative">
                        <select
                          value={selectedCondition}
                          onChange={(e) => setSelectedCondition(e.target.value)}
                          className="w-full px-4 py-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50 text-slate-900 dark:text-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all duration-300 hover:border-primary/30 shadow-lg hover:shadow-xl appearance-none cursor-pointer"
                        >
                          {conditions.map(condition => (
                            <option key={condition} value={condition}>{condition}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                  </motion.div>

                </div>

                {/* Price Range Section */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                  className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-200/50 dark:border-slate-700/50 shadow-lg mb-8"
                >
                  <div className="flex items-center mb-6">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center mr-3">
                      <DollarSign className="h-4 w-4 text-white" />
                    </div>
                    <h4 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                      Estimated Value Range
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {formatPrice(priceRange[0])}
                      </span>
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                        {formatPrice(priceRange[1])}
                      </span>
                    </div>
                    
                    <div className="relative">
                      <input
                        type="range"
                        min="0"
                        max="10000"
                        value={priceRange[1]}
                        onChange={(e) => {
                          setPriceRange([priceRange[0], Number.parseInt(e.target.value, 10)]);
                          setPage(1); // Reset to first page when price changes
                        }}
                        className="w-full h-3 bg-gradient-to-r from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-600 rounded-full appearance-none cursor-pointer slider-thumb"
                        style={{
                          background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(priceRange[1] / 10000) * 100}%, #e2e8f0 ${(priceRange[1] / 10000) * 100}%, #e2e8f0 100%)`
                        }}
                      />
                      <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
                        <span>$0</span>
                        <span>$10,000+</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.7 }}
                  className="flex flex-col sm:flex-row justify-between items-center gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">{activeFiltersCount}</span> filters active
                    </div>
                    {activeFiltersCount > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex gap-2"
                      >
                        {selectedCategory !== 'All' && (
                          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 rounded-full text-xs font-medium">
                            {selectedCategory}
                          </span>
                        )}
                        {selectedLocation !== 'All' && (
                          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 rounded-full text-xs font-medium">
                            {selectedLocation}
                          </span>
                        )}
                        {selectedCondition !== 'All' && (
                          <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                            {selectedCondition}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={clearFilters}
                      variant="outline"
                      className="px-6 py-3 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-300 hover:scale-105"
                    >
                      <X className="mr-2 h-4 w-4" />
                      Clear All
                    </Button>
                    <Button
                      onClick={() => setShowFilters(false)}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <Check className="mr-2 h-4 w-4" />
                      Apply Filters
                    </Button>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Results Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {searchTerm ? `Items matching "${searchTerm}"` : 'Available Items'}
              </h2>
              <p className="text-slate-600 dark:text-slate-400">
                {total} {total === 1 ? 'item' : 'items'} available
                {selectedCondition !== 'All' && sortedAds.length !== total && (
                  <span className="ml-2 text-sm text-blue-600 dark:text-blue-400">
                    (Showing {sortedAds.length} after condition filter)
                  </span>
                )}
              </p>
            </div>

            {/* Sort and View Controls */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-600 dark:text-slate-400 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm min-w-0 flex-1 sm:flex-none transition-all duration-300 hover:border-primary/50"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="px-3 py-2"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="px-3 py-2"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Ads Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {[...new Array(8)].map((_, i) => (
                  <div key={`skeleton-${i}`} className="animate-pulse">
                    <div className="bg-slate-200 dark:bg-slate-700 rounded-lg aspect-square mb-4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <motion.div
                key={viewMode}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className={`grid gap-6 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}
              >
                {sortedAds.map((ad, index) => (
                <motion.div
                  key={ad.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm overflow-hidden">
                    <div className="relative">
                      {/* Image */}
                        <div className="aspect-square overflow-hidden cursor-pointer">
                          <img
                            src={ad.images && ad.images.length > 0 ? ad.images[0] : '/icons/product_placeholder.jpg'}
                            alt={ad.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                            }}
                          />
                        </div>

                        {/* Favorite Button - Always Visible */}
                        <div className="absolute top-4 right-4 z-10">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              toggleFavorite(ad.id);
                            }}
                            className="p-2 hover:scale-110 transition-all duration-300 rounded-full"
                          >
                            <Heart className={`h-6 w-6 drop-shadow-lg ${favorites.includes(ad.id) ? 'fill-red-500 text-red-500' : 'fill-gray-400 text-gray-400'}`} />
                          </button>
                        </div>

                      {/* Condition Badge - Commented out */}
                      {/* <div className="absolute top-4 left-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getConditionColor(ad.condition)}`}>
                          {ad.condition.replace('-', ' ')}
                        </span>
                      </div> */}

                      {/* Status Badge - Removed */}
                    </div>

                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* Title and Price */}
                        <div>
                          <Link to={`/product/${ad.nameSlug || ad.id}`}>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors cursor-pointer hover:underline">
                              {ad.title}
                            </h3>
                          </Link>
                            <div className="flex items-center justify-between">
                              <span className="text-2xl font-bold text-primary">
                                {ad.price === 0 ? 'Free' : formatPrice(ad.price)}
                              </span>
                            </div>
                        </div>

                        {/* Category and Location */}
                        <div className="flex items-center justify-between text-sm">
                          <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded-md text-slate-600 dark:text-slate-400">
                            {ad.category}
                          </span>
                          <div className="flex items-center text-slate-500 dark:text-slate-400">
                            <MapPin className="mr-1 h-4 w-4" />
                            {ad.location}
                          </div>
                        </div>

                        {/* Community Member Info */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <UserAvatar
                              src={ad.user.avatar}
                              alt={ad.user.name}
                              className="w-8 h-8 rounded-full"
                            />
                            <div>
                              <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                {ad.user.name}
                              </div>
                            </div>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400">
                            {formatTimeAgo(ad.createdAt)}
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Pagination */}
          {!isLoading && totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                Page {page} of {totalPages} ({total} total items)
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}

          {/* Empty State */}
          {sortedAds.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="h-12 w-12 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                No items available
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                No items match your search criteria. Try adjusting your filters or check back later for new shared items.
              </p>
              <Button onClick={clearFilters} variant="outline">
                Clear Filters
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    </div>
  );
};

export default FindItems;