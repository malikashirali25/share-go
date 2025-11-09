import { useState, useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Plus, Package, Edit, Trash2, CheckCircle, Calendar, Search, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import ConfirmDialog from '../components/ConfirmDialog';
import { productService } from '../services/productService';
import config from '../config';
import type { Product, ProductCategory } from '../interfaces/product';
import { ProductStatus } from '../interfaces/product';
import { chatService } from '../services/chatService';
import type { Chat, ChatUser } from '../interfaces/chat';
import { useAuth } from '../contexts/AuthContext';
import UserAvatar from '../components/UserAvatar';

interface ChatHeadUserOption {
  id: number;
  name: string;
  avatar?: string;
}

const Products = () => {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isItemsPage = location.pathname.includes('/products');
  
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [counts, setCounts] = useState({ active: 0, completed: 0 });
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    type: 'delete' | null;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    type: null,
    productId: null,
    productName: ''
  });
  const [statusModalState, setStatusModalState] = useState<{
    isOpen: boolean;
    productId: number | null;
    productName: string;
  }>({
    isOpen: false,
    productId: null,
    productName: ''
  });
  const [chatUsers, setChatUsers] = useState<ChatHeadUserOption[]>([]);
  const [chatUserSearch, setChatUserSearch] = useState('');
  const [selectedChatUserId, setSelectedChatUserId] = useState<number | null>(null);
  const [isLoadingChatUsers, setIsLoadingChatUsers] = useState(false);
  const [chatUsersError, setChatUsersError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    loadProducts(true);
    loadCategories();
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Only search if searchTerm has 3+ characters
    if (searchTerm.length >= 3 || searchTerm.length === 0) {
      setIsSearching(true);
      searchTimeoutRef.current = setTimeout(() => {
        loadProducts();
      }, 500); // 500ms debounce
    }

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  // Reload products when category or status changes
  useEffect(() => {
    setIsSearching(true);
    loadProducts();
  }, [selectedCategory, filterStatus]);

  const loadCategories = async () => {
    try {
      const response = await productService.getCategories();
      let categoryArray: ProductCategory[] = [];
      
      if (Array.isArray(response)) {
        categoryArray = response;
      } else if (response && typeof response === 'object') {
        const res = response as any;
        if ('data' in res && Array.isArray(res.data)) {
          categoryArray = res.data as ProductCategory[];
        } else if ('categories' in res && Array.isArray(res.categories)) {
          categoryArray = res.categories as ProductCategory[];
        }
      }
      
      setCategories(categoryArray);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadChatUsersForProduct = async (productId: number) => {
    setIsLoadingChatUsers(true);
    setChatUsersError(null);
    try {
      const response = await chatService.getChatHeads(1, 100);
      const chats: Chat[] = response?.data?.chats ?? [];
      const currentUserId = currentUser ? Number.parseInt(currentUser.id, 10) : null;
      const uniqueUsers = new Map<number, ChatHeadUserOption>();

      for (const chat of chats) {
        if (chat.productId !== productId) {
          continue;
        }

        let otherUser: ChatUser | undefined;
        if (currentUserId) {
          if (chat.userA?.id === currentUserId) {
            otherUser = chat.userB ?? undefined;
          } else if (chat.userB?.id === currentUserId) {
            otherUser = chat.userA ?? undefined;
          }
        }

        otherUser ??= chat.userB ?? chat.userA ?? undefined;

        if (!otherUser) {
          continue;
        }

        let avatar: string | undefined;
        if (otherUser.image) {
          avatar = otherUser.image.startsWith('http')
            ? otherUser.image
            : `${config.api.mediaUrl}${otherUser.image}`;
        }

        const trimmedName = `${otherUser.firstName} ${otherUser.lastName}`.trim();
        const displayName = trimmedName.length > 0 ? trimmedName : `User ${otherUser.id}`;

        uniqueUsers.set(otherUser.id, {
          id: otherUser.id,
          name: displayName,
          avatar,
        });
      }

      const usersArray = Array.from(uniqueUsers.values());
      setChatUsers(usersArray);
      if (usersArray.length === 1) {
        setSelectedChatUserId(usersArray[0].id);
      }
      if (usersArray.length === 0) {
        setChatUsersError('No interested users found for this product yet.');
      }
    } catch (error: any) {
      console.error('Error loading chat users:', error);
      setChatUsersError(error?.message || 'Failed to load users. Please try again.');
    } finally {
      setIsLoadingChatUsers(false);
    }
  };

  const getCategoryName = (categoryId: number): string => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown';
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusLabel = (status: number): string => {
    switch (status) {
      case ProductStatus.PENDING:
        return 'Inactive';
      case ProductStatus.ACTIVE:
        return 'Active';
      case ProductStatus.COMPLETED:
        return 'Completed';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status: number): string => {
    switch (status) {
      case ProductStatus.PENDING:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
      case ProductStatus.ACTIVE:
        return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400';
      case ProductStatus.COMPLETED:
        return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
  };

  const loadProducts = async (isInitialLoad = false) => {
    try {
      if (isInitialLoad) {
        setIsLoading(true);
      } else {
        setIsSearching(true);
      }
      console.log('Loading products...');
      
      // Build search params
      const params: { categoryId?: number; searchKeywords?: string } = {};
      if (selectedCategory) {
        params.categoryId = Number(selectedCategory);
      }
      if (searchTerm.length >= 3) {
        params.searchKeywords = searchTerm;
      }
      
      const response = await productService.getProducts(Object.keys(params).length > 0 ? params : undefined);
      console.log('Products response:', response);
      
      // Handle different response formats
      let productArray: Product[] = [];
      let productCounts = { active: 0, completed: 0 };
      
      if (Array.isArray(response)) {
        productArray = response;
      } else if (response && typeof response === 'object') {
        const res = response as any;
        // Check for nested structure: response.data.products
        if ('data' in res && res.data && typeof res.data === 'object') {
          if ('products' in res.data && Array.isArray(res.data.products)) {
            productArray = res.data.products as Product[];
            // Check for counts in data
            if (res.data.counts) {
              productCounts = res.data.counts;
            }
          } else if (Array.isArray(res.data)) {
            productArray = res.data as Product[];
          }
        } else if ('products' in res && Array.isArray(res.products)) {
          productArray = res.products as Product[];
          // Check for counts at root level
          if (res.counts) {
            productCounts = res.counts;
          }
        }
      }
      
      console.log('Product array:', productArray);
      console.log('Product counts:', productCounts);
      // Log the first product's media structure for debugging
      if (productArray.length > 0) {
        console.log('First product media:', productArray[0].media);
      }
      setProducts(productArray);
      setCounts(productCounts);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]); // Set empty array on error
      setCounts({ active: 0, completed: 0 });
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  const openDeleteDialog = (productId: number, productName: string) => {
    setDialogState({
      isOpen: true,
      type: 'delete',
      productId,
      productName
    });
  };

  const openSoldDialog = async (productId: number, productName: string) => {
    setStatusModalState({
      isOpen: true,
      productId,
      productName
    });
    setSelectedChatUserId(null);
    setChatUserSearch('');
    setChatUsers([]);
    setChatUsersError(null);
    await loadChatUsersForProduct(productId);
  };

  const handleEdit = (productId: number) => {
    navigate(`/dashboard/create-product?id=${productId}`);
  };

  const handleConfirm = async () => {
    if (!dialogState.productId || dialogState.type !== 'delete') return;

    try {
      await productService.deleteProduct(dialogState.productId);
      await loadProducts();
    } catch (error: any) {
      console.error('Error deleting item:', error);
      const errorMessage = error?.message || error?.error || 'Unknown error occurred';
      alert(`Failed to delete item: ${errorMessage}. Please try again.`);
    }
  };

  const closeDialog = () => {
    setDialogState({
      isOpen: false,
      type: null,
      productId: null,
      productName: ''
    });
  };

  const closeStatusModal = () => {
    setStatusModalState({
      isOpen: false,
      productId: null,
      productName: ''
    });
    setChatUsers([]);
    setChatUsersError(null);
    setSelectedChatUserId(null);
    setChatUserSearch('');
    setIsLoadingChatUsers(false);
  };

  const handleMarkCompleted = async () => {
    if (!statusModalState.productId || !selectedChatUserId) {
      return;
    }

    try {
      setIsUpdatingStatus(true);
      await productService.updateProductStatus(
        statusModalState.productId,
        ProductStatus.COMPLETED,
        selectedChatUserId
      );
      closeStatusModal();
      await loadProducts();
    } catch (error: any) {
      console.error('Error marking item as completed:', error);
      const errorMessage = error?.message || error?.error || 'Failed to mark item as completed. Please try again.';
      alert(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Filter products based on status (only client-side filtering for status)
  let availableProducts = products;
  if (filterStatus === 'active') {
    availableProducts = products.filter(p => p.status === ProductStatus.ACTIVE);
  } else if (filterStatus === 'completed') {
    availableProducts = products.filter(p => p.status === ProductStatus.COMPLETED);
  } else if (filterStatus === 'pending') {
    availableProducts = products.filter(p => p.status === ProductStatus.PENDING);
  }
  
  const totalProducts = products.length;
  const completedProducts = counts.completed;
  const activeProducts = counts.active;
  const filteredChatUsers = chatUsers.filter(user => {
    if (!chatUserSearch.trim()) {
      return true;
    }
    return user.name.toLowerCase().includes(chatUserSearch.toLowerCase());
  });
  const userSearchInputId = 'status-user-search';
  const emptyUserMessage = chatUsers.length === 0
    ? 'No conversations found for this item yet.'
    : 'No users match your search.';
  let chatUserListContent: ReactNode;

  if (isLoadingChatUsers) {
    chatUserListContent = (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        Loading users...
      </div>
    );
  } else if (chatUsersError) {
    chatUserListContent = (
      <div className="p-4 text-sm text-red-500 text-center">{chatUsersError}</div>
    );
  } else if (filteredChatUsers.length === 0) {
    chatUserListContent = (
      <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        {emptyUserMessage}
      </div>
    );
  } else {
    chatUserListContent = (
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {filteredChatUsers.map((user) => {
          const isSelected = selectedChatUserId === user.id;
          return (
            <button
              key={user.id}
              type="button"
              onClick={() => setSelectedChatUserId(user.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isSelected
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-l-blue-500'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-800/60'
              }`}
            >
              <UserAvatar
                src={user.avatar}
                alt={user.name}
                className="h-10 w-10"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
              </div>
              {isSelected && (
                <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-10 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
        
        {/* Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="flex gap-2 mt-4">
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-10 flex-1 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            {isItemsPage ? 'Items' : 'My Items'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {isItemsPage ? 'Manage all items' : 'View your items'}
          </p>
        </div>
        {isItemsPage && (
          <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Link to="/dashboard/create-product">
              <Plus className="mr-2 h-4 w-4" />
              Create Item
            </Link>
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {totalProducts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Total Items</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {activeProducts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Active</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {completedProducts}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
              />
              {searchTerm.length > 0 && searchTerm.length < 3 && (
                <p className="text-xs text-gray-500 mt-1">Type at least 3 characters to search</p>
              )}
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id.toString()}>{cat.name}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All Status</option>
              <option value="pending">Inactive</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {totalProducts === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No items yet</h3>
            <p className="text-gray-500 dark:text-gray-400 text-center mb-4">Get started by creating your first item.</p>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
              <Link to="/dashboard/create-product">
                <Plus className="mr-2 h-4 w-4" />
                Create Item
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        isItemsPage ? (
          // Table layout for Items page
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Item</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Category</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Price</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Description</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Status</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Date</th>
                      <th className="text-center py-3 px-4 font-semibold text-gray-700 dark:text-gray-300 text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isSearching ? (
                      // Shimmer rows while searching
                      [1, 2, 3, 4, 5].map((i) => (
                        <tr key={`shimmer-${i}`} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center gap-1">
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      availableProducts.map((product) => (
                        <tr key={product.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                              {product.media && product.media.length > 0 ? (
                                <img
                                  src={(() => {
                                    const mediaUrl = typeof product.media[0] === 'string' 
                                      ? product.media[0] 
                                      : (product.media[0] as any)?.mediaUrl || '';
                                    return mediaUrl.startsWith('http') ? mediaUrl : `${config.api.mediaUrl}${mediaUrl}`;
                                  })()}
                                  alt={product.name}
                                  className="w-10 h-10 object-cover rounded"
                                />
                              ) : (
                                <Package className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                            <div className="font-medium text-gray-900 dark:text-gray-100">{product.name}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
                            {getCategoryName(product.categoryId)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900 dark:text-gray-100">${product.price}</div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-sm text-gray-600 dark:text-gray-400 max-w-md truncate">
                            {product.description}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusColor(product.status)}`}>
                            {getStatusLabel(product.status)}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {product.createdAt ? formatDate(product.createdAt) : 'N/A'}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {product.status !== ProductStatus.COMPLETED && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleEdit(product.id)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openSoldDialog(product.id, product.name)}
                                  className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(product.id, product.name)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          // Card layout for My Items page
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableProducts.map((product) => (
              <Card 
                key={product.id} 
                className="relative overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => navigate(`/item/${product.id}`)}
              >
                {/* Image */}
                <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                  {product.media && product.media.length > 0 ? (
                    <img
                      src={(() => {
                        const mediaUrl = typeof product.media[0] === 'string' 
                          ? product.media[0] 
                          : (product.media[0] as any)?.mediaUrl || '';
                        return mediaUrl.startsWith('http') ? mediaUrl : `${config.api.mediaUrl}${mediaUrl}`;
                      })()}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-gray-400" />
                  )}
                </div>

                {/* Content */}
                <CardContent className="p-4 space-y-3">
                  {/* Title and Price */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 mb-1">
                      {product.name}
                    </h3>
                    <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      ${product.price}
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded">
                      {getCategoryName(product.categoryId)}
                    </span>
                    {product.createdAt && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(product.createdAt)}
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Tags */}
                  {product.tags && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {product.tags}
                    </p>
                  )}

                  {/* My Items is view only - no action buttons */}
                </CardContent>
              </Card>
            ))}
          </div>
        )
      )}

      {/* Mark as Completed Modal */}
      {statusModalState.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 relative">
          <button
            type="button"
            aria-label="Close mark as completed dialog"
            className="absolute inset-0 w-full h-full bg-black/50 transition-opacity"
            onClick={closeStatusModal}
          />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-xl w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Mark as Completed</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select the user this item was completed with.
                </p>
              </div>
              <button
                type="button"
                onClick={closeStatusModal}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Item</p>
                <p className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {statusModalState.productName}
                </p>
              </div>

              <div>
                <label
                  htmlFor={userSearchInputId}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block"
                >
                  Search users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    id={userSearchInputId}
                    type="text"
                    value={chatUserSearch}
                    onChange={(e) => setChatUserSearch(e.target.value)}
                    placeholder="Search by name..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>

              <div className="border border-gray-200 dark:border-gray-700 rounded-lg max-h-60 overflow-y-auto">
                {chatUserListContent}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <Button variant="outline" onClick={closeStatusModal} disabled={isUpdatingStatus}>
                Cancel
              </Button>
              <Button
                onClick={handleMarkCompleted}
                disabled={
                  isUpdatingStatus ||
                  !selectedChatUserId ||
                  chatUsers.length === 0 ||
                  Boolean(chatUsersError)
                }
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {isUpdatingStatus ? 'Marking...' : 'Mark as Completed'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={dialogState.isOpen && dialogState.type === 'delete'}
        onClose={closeDialog}
        onConfirm={handleConfirm}
        title="Delete Item"
        message={`Are you sure you want to delete "${dialogState.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Products;
