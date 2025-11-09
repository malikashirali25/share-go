import { useState, useRef, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, 
  X, 
  DollarSign, 
  MapPin, 
  ArrowLeft,
  Save,
  Eye,
  Camera,
  FileImage,
  Trash2,
  CheckCircle,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import MapComponent from '../components/MapComponent';
import { useAuth } from '../contexts/AuthContext';
import { useAds } from '../contexts/AdContext';
import UserAvatar from '../components/UserAvatar';

const ShareItem = () => {
  const navigate = useNavigate();
  const { itemId } = useParams<{ itemId?: string }>();
  const { user } = useAuth();
  const { postAd, updateAd, getAdById } = useAds();
  
  // Determine if we're in edit mode
  const isEditMode = !!itemId;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    location: '',
    condition: 'excellent',
    images: [] as string[],
    contactMethod: 'message'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [fileKeys, setFileKeys] = useState<string[]>([]);
  const [fileStatuses, setFileStatuses] = useState<{ [key: string]: 'uploading' | 'completed' }>({});
  
  // Enhanced state for file metadata with unique IDs
  interface FileMetadata {
    id: string;
    name: string;
    size: number;
    base64: string;
    file: File;
  }
  const [fileMetadata, setFileMetadata] = useState<FileMetadata[]>([]);
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load ad data when in edit mode
  useEffect(() => {
    if (isEditMode && adId) {
      const ad = getAdById(adId);
      if (ad) {
        setFormData({
          title: ad.title,
          description: ad.description,
          price: ad.price.toString(),
          category: ad.category,
          location: ad.location,
          condition: ad.condition,
          images: ad.images,
          contactMethod: 'message'
        });
        
        // Set existing images as file metadata
        if (ad.images && ad.images.length > 0) {
          const existingMetadata: FileMetadata[] = ad.images.map((image, index) => ({
            id: `existing-${index}`,
            name: `existing-image-${index + 1}`,
            size: 0, // Unknown size for existing images
            base64: image,
            file: new File([], `existing-image-${index + 1}`) // Dummy file
          }));
          setFileMetadata(existingMetadata);
        }
      }
    }
  }, [isEditMode, adId, getAdById]);

  // Helper function to convert file to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  // Helper function to generate unique ID for file
  const generateFileId = (file: File): string => {
    return `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // Helper function to check if file already exists
  const isFileDuplicate = (file: File): boolean => {
    return fileMetadata.some(metadata => 
      metadata.name === file.name && metadata.size === file.size
    );
  };

  const categories = [
    'Electronics',
    'Furniture',
    'Musical Instruments',
    'Clothing',
    'Books',
    'Sports & Recreation',
    'Home & Garden',
    'Automotive',
    'Toys & Games',
    'Other'
  ];

  const conditions = [
    { value: 'new', label: 'New' },
    { value: 'excellent', label: 'Excellent' },
    { value: 'good', label: 'Good' },
    { value: 'fair', label: 'Fair' },
    { value: 'poor', label: 'Poor' }
  ];

  const contactMethods = [
    { value: 'message', label: 'Messages Only' },
    { value: 'call', label: 'Calls & Messages' },
    { value: 'email', label: 'Email & Messages' },
    { value: 'all', label: 'All Methods' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  // Image upload functions
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    
    const validFiles: File[] = [];
    const errors: string[] = [];
    
    Array.from(files).forEach(file => {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        errors.push(`${file.name} is not an image file`);
        return;
      }
      
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        errors.push(`${file.name} is too large (max 5MB)`);
        return;
      }
      
      // Check for duplicates
      if (isFileDuplicate(file)) {
        errors.push(`${file.name} is already uploaded`);
        return;
      }
      
      // Check total number of images (max 10)
      if (fileMetadata.length + validFiles.length >= 10) {
        errors.push('Maximum 10 images allowed');
        return;
      }
      
      validFiles.push(file);
    });
    
    setUploadErrors(errors);
    
    if (validFiles.length > 0) {
      // Process each file individually to create metadata
      const processFiles = async () => {
        const newMetadata: FileMetadata[] = [];
        const newFileKeys: string[] = [];
        const newStatuses: { [key: string]: 'uploading' | 'completed' } = {};
        const newProgress: { [key: string]: number } = {};
        
        for (const file of validFiles) {
          try {
            // Generate unique ID for this file
            const fileId = generateFileId(file);
            const fileKey = `${fileId}-${Date.now()}`;
            
            // Convert file to Base64
            const base64String = await fileToBase64(file);
            
            // Create metadata object
            const metadata: FileMetadata = {
              id: fileId,
              name: file.name,
              size: file.size,
              base64: base64String,
              file: file
            };
            
            newMetadata.push(metadata);
            newFileKeys.push(fileKey);
            newStatuses[fileKey] = 'uploading';
            newProgress[fileKey] = 0;
            
          } catch (error) {
            console.error('Error converting file to Base64:', error);
            setUploadErrors(prev => [...prev, `Failed to process ${file.name}`]);
          }
        }
        
        // Update all states with new metadata
        if (newMetadata.length > 0) {
          setFileMetadata(prev => [...prev, ...newMetadata]);
          setUploadedImages(prev => [...prev, ...validFiles]);
          setFileKeys(prev => [...prev, ...newFileKeys]);
          setFileStatuses(prev => ({ ...prev, ...newStatuses }));
          setUploadProgress(prev => ({ ...prev, ...newProgress }));
          
          // Update form data with Base64 images
          const base64Strings = newMetadata.map(meta => meta.base64);
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, ...base64Strings]
          }));
          
          // Start progress simulation for each file
          newFileKeys.forEach(fileKey => {
            // Simulate progress over 1.5 seconds
            const duration = 1500; // 1.5 seconds
            const steps = 20; // 20 steps
            const stepDuration = duration / steps;
            const stepSize = 100 / steps;
            
            let currentStep = 0;
            const interval = setInterval(() => {
              currentStep++;
              const progress = Math.min(currentStep * stepSize, 100);
              
              setUploadProgress(prev => ({ ...prev, [fileKey]: progress }));
              
              if (currentStep >= steps) {
                // Mark as completed when progress reaches 100%
                setFileStatuses(prev => ({ ...prev, [fileKey]: 'completed' }));
                clearInterval(interval);
              }
            }, stepDuration);
          });
        }
      };
      
      processFiles();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const fileKeyToRemove = fileKeys[index];
    
    // Remove from all state arrays
    setFileMetadata(prev => prev.filter((_, i) => i !== index));
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setFileKeys(prev => prev.filter((_, i) => i !== index));
    
    // Update form data to remove the image
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    
    // Clean up status and progress for removed file
    if (fileKeyToRemove) {
      setFileStatuses(prev => {
        const newStatuses = { ...prev };
        delete newStatuses[fileKeyToRemove];
        return newStatuses;
      });
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileKeyToRemove];
        return newProgress;
      });
    }
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      location: location.address
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Create ad data for AdContext (without id, createdAt, views, user - these are auto-generated)
      const adData = {
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price),
        category: formData.category,
        location: formData.location || user?.location || 'Not specified',
        condition: formData.condition as 'new' | 'like-new' | 'good' | 'fair' | 'poor',
        images: formData.images,
        status: 'active' as 'active' | 'sold' | 'pending'
      };
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      if (isEditMode && adId) {
        // Update existing ad
        updateAd(adId, adData);
      } else {
        // Create new ad
        postAd(adData);
      }
      
      setIsSubmitting(false);
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error posting ad:', error);
      alert(isEditMode ? 'Failed to update ad. Please try again.' : 'There was an error posting your ad. Please try again.');
      setIsSubmitting(false);
    }
  };

  const handlePreview = () => {
    // In a real app, this would open a preview modal
    console.log('Preview ad:', formData);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                {isEditMode ? 'Edit Your Ad' : 'Post Your Ad'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isEditMode ? 'Update your item details' : 'Share your item with the community'}
              </p>
              <div className="flex items-center space-x-2 mt-2">
                <UserAvatar
                  src={user?.avatar}
                  alt={user?.name || "User"}
                  className="h-6 w-6 rounded-full"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Posting as <span className="font-medium">{user?.name || "User"}</span>
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card>
              <CardHeader>
                <CardTitle>Item Details</CardTitle>
                <CardDescription>
                  Tell us about the item you want to sell. Only registered users can post ads.
                </CardDescription>
                <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-700">
                      ✓ Verified user: {user?.name || "User"} ({user?.email || "user@example.com"})
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title">Item Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., MacBook Pro 16&quot; M2 - Like New"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="Describe your item in detail..."
                      value={formData.description}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>

                  {/* Price and Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
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
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location and Condition */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location *</Label>
                      <div className="space-y-2">
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400 dark:text-gray-500" />
                          <Input
                            id="location"
                            name="location"
                            placeholder="City, State"
                            value={formData.location}
                            onChange={handleInputChange}
                            className="pl-10"
                            required
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setShowMap(!showMap)}
                            className="flex items-center gap-2"
                          >
                            <MapPin className="w-4 h-4" />
                            {showMap ? 'Hide Map' : 'Show Map'}
                          </Button>
                          {selectedLocation && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedLocation(null);
                                setFormData(prev => ({ ...prev, location: '' }));
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                        {selectedLocation && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                            <div className="flex items-center gap-2 text-green-700">
                              <CheckCircle className="w-4 h-4" />
                              <span className="text-sm font-medium">Location Selected</span>
                            </div>
                            <p className="text-sm text-green-600 mt-1">{selectedLocation.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="condition">Condition *</Label>
                      <select
                        id="condition"
                        name="condition"
                        value={formData.condition}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      >
                        {conditions.map(condition => (
                          <option key={condition.value} value={condition.value}>
                            {condition.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Contact Method */}
                  <div className="space-y-2">
                    <Label htmlFor="contactMethod">Preferred Contact Method</Label>
                    <select
                      id="contactMethod"
                      name="contactMethod"
                      value={formData.contactMethod}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {contactMethods.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Map Component */}
                  {showMap && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label>Select Location on Map</Label>
                      <MapComponent
                        onLocationSelect={handleLocationSelect}
                        initialLocation={selectedLocation || undefined}
                        height="300px"
                        showSearch={true}
                        showCurrentLocation={true}
                        className="rounded-lg"
                      />
                    </motion.div>
                  )}

                  {/* Enhanced Image Upload */}
                  <div className="space-y-4">
                    <Label>Photos (Max 10)</Label>
                    
                    {/* Upload Area */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleFileSelect(e.target.files)}
                        className="hidden"
                        id="image-upload"
                      />
                      
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          {dragActive ? (
                            <Upload className="h-12 w-12 text-blue-500 animate-bounce" />
                          ) : (
                            <Camera className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                          )}
                        </div>
                        
                        <div>
                          <p className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                            {dragActive ? 'Drop images here' : 'Upload your photos'}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Drag and drop images here, or click to select files
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => fileInputRef.current?.click()}
                            className="mb-2"
                          >
                            <FileImage className="w-4 h-4 mr-2" />
                            Choose Files
                          </Button>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            PNG, JPG, GIF up to 5MB each • Max 10 images
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Upload Errors */}
                    {uploadErrors.length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-red-800">Upload Errors</h4>
                            <ul className="text-sm text-red-700 mt-1">
                              {uploadErrors.map((error, index) => (
                                <li key={index}>• {error}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Image Previews */}
                    {fileMetadata.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">
                            Uploaded Images ({fileMetadata.length}/10)
                          </h4>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setFileMetadata([]);
                              setUploadedImages([]);
                              setFileKeys([]);
                              setUploadProgress({});
                              setFileStatuses({});
                              setUploadErrors([]);
                              setFormData(prev => ({ ...prev, images: [] }));
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear All
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                          {/* Uploaded images */}
                          {fileMetadata.map((metadata, index) => (
                            <motion.div
                              key={metadata.id}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="relative group"
                            >
                              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                                <img
                                  src={metadata.base64}
                                  alt={`Upload ${index + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              
                              {/* Upload Progress */}
                              {uploadedImages[index] && fileKeys[index] && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                  <div className="text-center text-white">
                                    {fileStatuses[fileKeys[index]] === 'uploading' && (
                                      <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    )}
                                    {fileStatuses[fileKeys[index]] === 'completed' && (
                                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <CheckCircle className="h-5 w-5 text-white" />
                                      </div>
                                    )}
                                    <p className="text-xs">
                                      {uploadProgress[fileKeys[index]] || 0}%
                                    </p>
                                  </div>
                                </div>
                              )}
                              
                              {/* Actions */}
                              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="flex gap-1">
                                  <Button
                                    type="button"
                                    size="icon"
                                    variant="secondary"
                                    className="h-8 w-8"
                                    onClick={() => removeImage(index)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Buttons */}
                  <div className="flex space-x-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePreview}
                      className="flex-1"
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      Preview
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1"
                    >
                      {isSubmitting ? (
                        <>
                          <Save className="mr-2 h-4 w-4 animate-spin" />
                          {isEditMode ? 'Saving...' : 'Posting...'}
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          {isEditMode ? 'Save Changes' : 'Post Ad'}
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            {/* Tips Card */}
            <Card>
              <CardHeader>
                <CardTitle>Tips for Success</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Great Photos</h4>
                  <p className="text-sm text-gray-600">
                    Take clear, well-lit photos from multiple angles to showcase your item.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Detailed Description</h4>
                  <p className="text-sm text-gray-600">
                    Include all relevant details, condition, and any flaws or wear.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Fair Pricing</h4>
                  <p className="text-sm text-gray-600">
                    Research similar items to set a competitive price.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Quick Response</h4>
                  <p className="text-sm text-gray-600">
                    Respond to messages quickly to increase your chances of selling.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Guidelines Card */}
            <Card>
              <CardHeader>
                <CardTitle>Community Guidelines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Be honest about the condition of your item
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Use clear, accurate photos
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Respond to inquiries promptly
                  </p>
                </div>
                <div className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <p className="text-sm text-gray-600">
                    Meet in safe, public locations
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white dark:bg-slate-800 rounded-lg p-8 text-center max-w-md mx-4 shadow-xl"
            >
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {isEditMode ? 'Ad Updated Successfully!' : 'Ad Posted Successfully!'}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                {isEditMode 
                  ? 'Your ad has been updated and is now live.' 
                  : 'Your ad has been posted and will be visible to other users shortly.'
                }
              </p>
              <Button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/dashboard/ads');
                }}
                className="w-full"
              >
                View My Items
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ShareItem;
