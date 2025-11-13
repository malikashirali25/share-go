import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Calendar, AlertTriangle } from 'lucide-react';
import { Button } from './ui/button';
import { productService } from '../services/productService';
import type { ProductReport } from '../interfaces/product';

interface ProductReportsModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productName: string;
}

const ProductReportsModal = ({ isOpen, onClose, productId, productName }: ProductReportsModalProps) => {
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && productId) {
      fetchReports();
    }
  }, [isOpen, productId]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getProductReports(productId);
      console.log('Reports API Response:', response);
      
      // Response structure: { reports: [...], total: number }
      if (response?.data?.reports) {
        setReports(response.data.reports);
      } else {
        console.warn('No reports found in response:', response);
        setReports([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Product Reports
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {productName}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="mt-4 text-gray-500 dark:text-gray-400">Loading reports...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <p className="text-red-600 dark:text-red-400 text-center">{error}</p>
                <Button
                  onClick={fetchReports}
                  variant="outline"
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertTriangle className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No reports found for this product</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <motion.div
                    key={report.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                          <User className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                            {report.reportedUser.firstName} {report.reportedUser.lastName}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {report.reportedUser.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        {formatDate(report.createdAt)}
                      </div>
                    </div>
                    
                    <div className="ml-11">
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {report.message}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total Reports: <span className="font-semibold text-gray-900 dark:text-gray-100">{reports.length}</span>
            </p>
            <Button onClick={onClose} variant="outline">
              Close
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ProductReportsModal;

