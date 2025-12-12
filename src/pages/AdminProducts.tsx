import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Eye, 
  Flag,
  ToggleLeft,
  ToggleRight,
  Package,
  CheckCircle,
  Clock,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../components/ui/toast';
import { productService } from '../services/productService';
import ProductReportsModal from '../components/ProductReportsModal';
import ConfirmDialog from '../components/ConfirmDialog';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';
import type { PublicProduct, ProductCategory } from '../interfaces/product';

const AdminProducts = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [products, setProducts] = useState<PublicProduct[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState<'name' | 'createdAt' | 'price'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');
  const [keyword, setKeyword] = useState('');
  const [searchInput, setSearchInput] = useState('');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  const limit = 20;

  // Reports Modal
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; name: string } | null>(null);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Fetch products when filters change
  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, sortBy, order, keyword, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await productService.getCategories();
      console.log('Categories response:', response);
      
      // Handle different response formats
      if (Array.isArray(response)) {
        setCategories(response);
      } else if (response && typeof response === 'object' && 'data' in response) {
        // If response has a data property, use that
        setCategories(Array.isArray((response as any).data) ? (response as any).data : []);
      } else {
        console.warn('Unexpected categories response format:', response);
        setCategories([]);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setCategories([]); // Set empty array on error
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getAuthenticatedProductListing({
        categoryId: selectedCategory,
        sortBy,
        order,
        keyword: keyword || undefined,
        page: currentPage,
        limit,
      });

      if (response.status && response.data) {
        setProducts(response.data.products || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalProducts(response.data.total || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch products:', err);
      setError(err.message || 'Failed to load products');
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setKeyword(searchInput);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSelectedCategory(undefined);
    setSortBy('createdAt');
    setOrder('DESC');
    setKeyword('');
    setSearchInput('');
    setCurrentPage(1);
  };

  const handleToggleStatus = async (product: PublicProduct) => {
    // Can't change status if completed
    if (product.status === 2) {
      toast.warning('Cannot Change Status', 'Cannot change status of completed products.');
      return;
    }

    if (!user) {
      toast.error('Authentication Required', 'You must be logged in to perform this action.');
      return;
    }

    const newStatus = product.status === 1 ? 0 : 1; // Toggle between active (1) and inactive (0)
    const userId = Number.parseInt(user.id, 10);
    
    try {
      await productService.updateProductStatusAdmin(product.id, newStatus, userId);
      // Refresh the list
      fetchProducts();
      toast.success(
        newStatus === 1 ? 'Product Activated' : 'Product Deactivated',
        `"${product.name}" has been ${newStatus === 1 ? 'activated' : 'deactivated'} successfully.`
      );
    } catch (err: any) {
      console.error('Failed to update product status:', err);
      toast.error('Failed to Update Status', err.message || 'An error occurred while updating product status.');
    }
  };

  const handleViewReports = (product: PublicProduct) => {
    setSelectedProduct({ id: product.id, name: product.name });
    setIsReportsModalOpen(true);
  };

  const handleDeleteClick = (product: PublicProduct) => {
    setProductToDelete({ id: product.id, name: product.name });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await productService.deleteProduct(productToDelete.id);
      
      // Refresh the products list after deletion
      await fetchProducts();
      setIsDeleteDialogOpen(false);
      toast.success('Product Deleted', `"${productToDelete.name}" has been deleted successfully.`);
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete product:', err);
      
      // Check for common errors
      let errorMessage = err.message || 'An error occurred while deleting the product.';
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates')) {
        errorMessage = 'Cannot delete this product because it has associated data. Please contact support.';
      } else if (errorMessage.includes('not found') || errorMessage.includes('Not found')) {
        errorMessage = 'This product was not found. It may have already been deleted.';
      }
      
      toast.error('Failed to Delete Product', errorMessage);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setProductToDelete(null);
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <Clock className="h-3 w-3" />
            Inactive
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <Package className="h-3 w-3" />
            Active
          </span>
        );
      case 2:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
            <CheckCircle className="h-3 w-3" />
            Completed
          </span>
        );
      default:
        return null;
    }
  };

  const getImageUrl = (media: any[]) => {
    if (!media || media.length === 0) return '/icons/product_placeholder.jpg';
    const firstMedia = media[0];
    return firstMedia.mediaUrl?.startsWith('http') 
      ? firstMedia.mediaUrl 
      : `${config.api.mediaUrl}${firstMedia.mediaUrl}`;
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <toast.ToastContainer />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Product Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          Manage all products in the system
        </p>
      </div>

      {/* Filters */}
      <Card className="p-6">
        <div className="space-y-4">
          {/* Search */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search products by name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full"
              />
            </div>
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Category
              </label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  setSelectedCategory(e.target.value ? Number(e.target.value) : undefined);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort By */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'name' | 'createdAt' | 'price');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="createdAt">Date Created</option>
                <option value="name">Name</option>
                <option value="price">Price</option>
              </select>
            </div>

            {/* Order */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Order
              </label>
              <select
                value={order}
                onChange={(e) => {
                  setOrder(e.target.value as 'ASC' | 'DESC');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="DESC">Descending</option>
                <option value="ASC">Ascending</option>
              </select>
            </div>

            <div className="flex items-end">
              <Button variant="outline" onClick={handleClearFilters}>
                Clear Filters
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{products.length}</span> of{' '}
          <span className="font-semibold">{totalProducts}</span> products
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Products List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchProducts} className="mt-4">
            Try Again
          </Button>
        </Card>
      ) : products.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No products found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex gap-4">
                  {/* Product Image */}
                  <img
                    src={getImageUrl(product.media)}
                    alt={product.name}
                    className="w-24 h-24 object-cover rounded-lg"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                    }}
                  />

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {product.category.name} • ${product.price}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {product.views} views
                          </span>
                          <span>
                            by {product.user.firstName} {product.user.lastName}
                          </span>
                          <span>
                            {new Date(product.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div>
                        {getStatusBadge(product.status)}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    {/* Toggle Status Button */}
                    <Button
                      size="sm"
                      variant={product.status === 2 ? "outline" : "default"}
                      onClick={() => handleToggleStatus(product)}
                      disabled={product.status === 2 || isDeleting}
                      title={product.status === 2 ? "Cannot change status of completed products" : "Toggle status"}
                    >
                      {product.status === 1 ? (
                        <>
                          Deactivate
                        </>
                      ) : product.status === 0 ? (
                        <>
                          Activate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Completed
                        </>
                      )}
                    </Button>

                    {/* View Reports Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewReports(product)}
                      disabled={isDeleting}
                    >
                      <Flag className="h-4 w-4 mr-1" />
                      Reports
                    </Button>

                    {/* Delete Button */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteClick(product)}
                      disabled={isDeleting}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Reports Modal */}
      {selectedProduct && (
        <ProductReportsModal
          isOpen={isReportsModalOpen}
          onClose={() => {
            setIsReportsModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Product"
        message={`Are you sure you want to permanently delete "${productToDelete?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Product'}
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default AdminProducts;

