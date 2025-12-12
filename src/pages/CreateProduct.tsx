import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, X, Camera, Tag, DollarSign, AlignLeft, Package } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { productService } from '../services/productService';
import { addressService } from '../services/addressService';
import config from '../config';
import type { CreateProductRequest, UpdateProductRequest, ProductCategory } from '../interfaces/product';
import { ProductStatus, ProductCondition, CONDITION_LABELS } from '../interfaces/product';
import type { Address, CreateAddressRequest } from '../interfaces/address';
import { US_STATES, getCitiesByState } from '../data/usLocations';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const productId = searchParams.get('id');
  const isEditMode = !!productId;
  
  const [formData, setFormData] = useState({
    name: '',
    categoryId: 0,
    addressId: 0,
    price: 0,
    description: '',
    status: ProductStatus.ACTIVE,
    condition: ProductCondition.GOOD
  });

  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<Array<{ id: number; url: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  
  const [newAddress, setNewAddress] = useState<CreateAddressRequest>({
    address1: '',
    address2: '',
    zipcode: '',
    city: '',
    state: '',
    country: 'United States',
    isDefault: false,
    lat: 0,
    lng: 0
  });
  const [availableCities, setAvailableCities] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load categories, addresses, and product data on mount
  useEffect(() => {
    console.log('CreateProduct component mounted, isEditMode:', isEditMode);
    loadCategories();
    loadAddresses();
    if (isEditMode && productId) {
      loadProductData(Number(productId));
    }
  }, [productId, isEditMode]);

  // Update available cities when state changes in address modal
  useEffect(() => {
    if (newAddress.state) {
      const cities = getCitiesByState(newAddress.state);
      setAvailableCities(cities);
      // Reset city if it's not in the new state's cities
      if (newAddress.city && !cities.includes(newAddress.city)) {
        setNewAddress(prev => ({ ...prev, city: '' }));
      }
    } else {
      setAvailableCities([]);
      setNewAddress(prev => ({ ...prev, city: '' }));
    }
  }, [newAddress.state]);

  const loadProductData = async (id: number) => {
    setIsLoading(true);
    try {
      console.log('Loading product data for id:', id);
      const response = await productService.getProductById(id);
      console.log('Product response:', response);
      
      // Handle nested response structure
      const product = (response as any).data || response;
      
      setFormData({
        name: product.name,
        categoryId: product.categoryId,
        addressId: product.addressId,
        price: product.price,
        description: product.description,
        status: product.status,
        condition: product.condition || ProductCondition.GOOD
      });

      // Set tags from comma-separated string
      if (product.tags) {
        setTags(product.tags.split(',').map((tag: string) => tag.trim()).filter(Boolean));
      }

      // Set existing media URLs
      if (product.media && Array.isArray(product.media)) {
        console.log('Product media:', product.media);
        // Extract media objects with id and url - handle both string and object formats
        const mediaItems = product.media.map((item: any) => {
          if (typeof item === 'string') {
            // If it's just a string, we can't get the ID - use the URL itself as a placeholder
            return { id: 0, url: item };
          }
          // Handle object format - check common properties for URL and ID
          return {
            id: item.id || item.mediaId || 0,
            url: item.url || item.imageUrl || item.mediaUrl || item.src || ''
          };
        });
        console.log('Extracted media items:', mediaItems);
        setExistingImages(mediaItems);
      }
    } catch (error: any) {
      console.error('Error loading product:', error);
      
      // Check if product not found (404 or similar)
      if (error?.status === 404 || error?.message?.toLowerCase().includes('not found')) {
        setError('Product not found.');
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/dashboard/products');
        }, 2000);
      } else {
        setError('Failed to load product data. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      console.log('Loading categories...');
      const response = await productService.getCategories();
      console.log('Categories response:', response);
      
      // Handle different response formats
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
      
      console.log('Category array:', categoryArray);
      setCategories(categoryArray);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadAddresses = async () => {
    try {
      console.log('Loading addresses...');
      const response = await addressService.getAddresses();
      console.log('Addresses response:', response);
      
      // Handle different response formats
      let addressArray: Address[] = [];
      
      if (Array.isArray(response)) {
        addressArray = response;
      } else if (response && typeof response === 'object') {
        const res = response as any;
        if ('data' in res && Array.isArray(res.data)) {
          addressArray = res.data as Address[];
        } else if ('addresses' in res && Array.isArray(res.addresses)) {
          addressArray = res.addresses as Address[];
        }
      }
      
      console.log('Address array:', addressArray);
      setAddresses(addressArray);
      if (addressArray.length > 0 && !formData.addressId) {
        setFormData(prev => ({ ...prev, addressId: addressArray[0].id }));
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'categoryId' || name === 'addressId' || name === 'status' 
        ? Number(value) 
        : value
    }));
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImages = Array.from(e.target.files);
      setImages(prev => [...prev, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags(prev => [...prev, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleDeleteMedia = async (mediaId: number, index: number) => {
    if (!globalThis.confirm('Are you sure you want to delete this image?')) {
      return;
    }

    try {
      console.log('Deleting media with id:', mediaId);
      await productService.deleteProductMedia(mediaId);
      console.log('Media deleted successfully');
      
      // Remove from state
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } catch (error: any) {
      console.error('Error deleting media:', error);
      alert(error.message || 'Failed to delete image. Please try again.');
    }
  };

  const handleCreateAddress = async () => {
    try {
      const address = await addressService.createAddress(newAddress);
      await loadAddresses();
      setFormData(prev => ({ ...prev, addressId: address.id }));
      setShowAddressModal(false);
      setNewAddress({
        address1: '',
        address2: '',
        zipcode: '',
        city: '',
        state: '',
        country: 'United States',
        isDefault: false,
        lat: 0,
        lng: 0
      });
    } catch (error) {
      console.error('Error creating address:', error);
      alert('Failed to create address. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (isEditMode && productId) {
        // Update existing product
        const updateData: UpdateProductRequest = {
          name: formData.name,
          categoryId: formData.categoryId,
          addressId: formData.addressId,
          price: formData.price,
          description: formData.description,
          tags: tags.join(','), // Convert tags array to comma-separated string
          status: formData.status,
          condition: formData.condition
        };

        console.log('Updating product:', productId, updateData);
        const response = await productService.updateProduct(Number(productId), updateData);
        const product = (response as any).data || response;
        console.log('Product updated:', product);

        // Upload new images if any
        if (images.length > 0) {
          console.log(`Uploading ${images.length} new images for product ${productId}...`);
          await productService.uploadProductImages(Number(productId), images);
          console.log('All new images uploaded successfully');
        }
      } else {
        // Create new product
        const productData: CreateProductRequest = {
          name: formData.name,
          categoryId: formData.categoryId,
          addressId: formData.addressId,
          price: formData.price,
          description: formData.description,
          tags: tags.join(','), // Convert tags array to comma-separated string
          status: formData.status,
          condition: formData.condition
        };

        // Get product from response (checking for nested data property)
        const response = await productService.createProduct(productData);
        const product = (response as any).data || response;
        
        console.log('Product created:', product);
        
        // Get productId from the product object
        const newProductId = product.id;
        
        // Upload images one by one immediately after getting productId
        if (images.length > 0 && newProductId) {
          console.log(`Uploading ${images.length} images for product ${newProductId}...`);
          await productService.uploadProductImages(newProductId, images);
          console.log('All images uploaded successfully');
        }
      }

      // Navigate to products page
      navigate('/dashboard/products');
    } catch (error: any) {
      console.error(`Product ${isEditMode ? 'update' : 'creation'} error:`, error);
      setError(error.message || `Failed to ${isEditMode ? 'update' : 'create'} product. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log('CreateProduct rendering, categories:', categories.length, 'addresses:', addresses.length);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{isEditMode ? 'Edit Product' : 'Create New Product'}</CardTitle>
              <CardDescription>
                {isEditMode ? 'Update your product details' : 'Fill in the details to list your product for sale'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
                  <p className="mt-4 text-gray-600 dark:text-gray-400">Loading product data...</p>
                </div>
              ) : (
                <>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                      {error}
                    </div>
                  )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Product Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name *</Label>
                  <div className="relative">
                    <Package className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="Enter product name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="categoryId">Category *</Label>
                  <select
                    id="categoryId"
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="0">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                {/* Condition */}
                <div className="space-y-2">
                  <Label htmlFor="condition">Condition *</Label>
                  <select
                    id="condition"
                    name="condition"
                    value={formData.condition}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    {Object.values(ProductCondition).map(condition => (
                      <option key={condition} value={condition}>
                        {CONDITION_LABELS[condition]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Address Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="addressId">Pickup Address *</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddressModal(true)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add New
                    </Button>
                  </div>
                  <select
                    id="addressId"
                    name="addressId"
                    value={formData.addressId}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  >
                    <option value="0">Select an address</option>
                    {addresses.map(addr => (
                      <option key={addr.id} value={addr.id}>
                        {addr.address1}, {addr.city}, {addr.state} {addr.zipcode}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price */}
                <div className="space-y-2">
                  <Label htmlFor="price">Price *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      placeholder="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        if (e.key === 'ArrowDown') {
                          e.preventDefault();
                        }
                        if (e.key === '-' || e.key === '+' || e.key === 'e' || e.key === 'E') {
                          e.preventDefault();
                        }
                      }}
                      min="0"
                      step="1"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Describe your product..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Enter a tag and press Enter"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleTagInputKeyDown}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddTag}
                    >
                      Add
                    </Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tags.map((tag, index) => (
                        <div
                          key={index}
                          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 hover:bg-primary/20 rounded-full p-0.5"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Images */}
                <div className="space-y-2">
                  <Label>Product Images {isEditMode && '(Add new images)'}</Label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    {isEditMode ? 'Add More Images' : 'Upload Images'}
                  </Button>

                  {/* Existing Images in Edit Mode */}
                  {isEditMode && existingImages.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Current Images:</p>
                      <div className="grid grid-cols-4 gap-4">
                        {existingImages.map((img, index) => (
                          <div key={index} className="relative group">
                            <img
                              src={img.url.startsWith('http') ? img.url : `${config.api.mediaUrl}${img.url}`}
                              alt={`Existing ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md"
                            />
                            {img.id > 0 && (
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteMedia(img.id, index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      {images.map((img, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(img)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full"
                  size="lg"
                >
                  {isEditMode 
                    ? (isSubmitting ? 'Updating Product...' : 'Update Product')
                    : (isSubmitting ? 'Creating Product...' : 'Create Product')}
                </Button>
              </form>
                </>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Add Address Modal */}
        {showAddressModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <CardTitle>Add New Address</CardTitle>
                <CardDescription>Enter your pickup address details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select
                    id="country"
                    value={newAddress.country}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                    disabled
                    required
                  >
                    <option value="United States">United States</option>
                  </Select>
                  <p className="text-xs text-gray-500">Currently only USA addresses are supported</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address1">Street Address *</Label>
                  <Input
                    id="address1"
                    value={newAddress.address1}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, address1: e.target.value }))}
                    placeholder="Street address, P.O. box"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select
                      id="state"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value, city: '' }))}
                      required
                    >
                      <option value="">Select a state</option>
                      {US_STATES.map((state) => (
                        <option key={state.code} value={state.code}>
                          {state.name}
                        </option>
                      ))}
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">City *</Label>
                    <Select
                      id="city"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                      disabled={!newAddress.state || availableCities.length === 0}
                      required
                    >
                      <option value="">Select a city</option>
                      {availableCities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </Select>
                    {!newAddress.state && (
                      <p className="text-xs text-gray-500">Please select a state first</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zipcode">ZIP Code *</Label>
                  <Input
                    id="zipcode"
                    value={newAddress.zipcode}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, zipcode: e.target.value }))}
                    placeholder="12345"
                    maxLength={10}
                    required
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={newAddress.isDefault}
                    onChange={(e) => setNewAddress(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <Label htmlFor="isDefault">Set as default address</Label>
                </div>

                <div className="flex space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowAddressModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCreateAddress}
                    className="flex-1"
                  >
                    Save Address
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateProduct;
