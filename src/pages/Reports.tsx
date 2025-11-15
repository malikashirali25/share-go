import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Flag,
  Package,
  Calendar,
  DollarSign,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
  X,
  User,
  FileText
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { productService } from '../services/productService';
import UserAvatar from '../components/UserAvatar';
import config from '../config';
import { useAuth } from '../contexts/AuthContext';
import type { ReportListingItem } from '../interfaces/product';

const Reports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState<ReportListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalReports, setTotalReports] = useState(0);
  const [pendingReportsCount, setPendingReportsCount] = useState(0);
  const [resolvedReportsCount, setResolvedReportsCount] = useState(0);
  const limit = 10;

  // Filter state
  const [statusFilter, setStatusFilter] = useState<number | null>(null); // null = all, 0 = pending, 1 = resolved

  // Report details modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ReportListingItem | null>(null);
  const [formData, setFormData] = useState({
    status: 0,
    notes: '',
    deactivateProduct: 'no' as 'yes' | 'no',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [currentPage, statusFilter]);

  const fetchReports = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await productService.getReportsListing({
        page: currentPage,
        limit,
        status: statusFilter ?? undefined,
      });

      if (response.status && response.data) {
        setReports(response.data.reports || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalReports(response.data.total || 0);
        setPendingReportsCount(response.data.pendingReportsCount || 0);
        setResolvedReportsCount(response.data.resolvedReportsCount || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch reports:', err);
      setError(err.message || 'Failed to load reports');
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    const newFilter = value === 'all' ? null : Number.parseInt(value, 10);
    setStatusFilter(newFilter);
    setCurrentPage(1); // Reset pagination when filter changes
  };

  const handleViewDetails = (report: ReportListingItem) => {
    setSelectedReport(report);
    setFormData({
      status: report.status || 0,
      notes: report.notes || '',
      deactivateProduct: 'no',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedReport(null);
    setFormData({
      status: 0,
      notes: '',
      deactivateProduct: 'no',
    });
  };

  const handleSubmit = async () => {
    if (!selectedReport || !user) return;

    setIsSubmitting(true);
    try {
      // If deactivate product is selected (yes) and product is active, deactivate it first
      if (formData.deactivateProduct === 'yes' && selectedReport.product.status === 1) {
        const userId = Number.parseInt(user.id, 10);
        await productService.updateProductStatusAdmin(selectedReport.product.id, 0, userId);
      }

      // Update report
      await productService.updateReport(selectedReport.id, {
        status: formData.status,
        notes: formData.notes,
      });

      // Refresh the reports list after update
      await fetchReports();
      handleCloseModal();
    } catch (err: any) {
      console.error('Failed to update report:', err);
      alert(err.message || 'Failed to update report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (image: string) => {
    if (!image) return '/icons/product_placeholder.jpg';
    return image.startsWith('http') ? image : `${config.api.mediaUrl}${image}`;
  };

  const getUserImageUrl = (image?: string) => {
    if (!image) return undefined;
    return image.startsWith('http') ? image : `${config.api.mediaUrl}${image}`;
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

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            Pending
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            Resolved
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Reports Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          View and manage all product reports
        </p>
      </div>

      {/* Stats Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {pendingReportsCount + resolvedReportsCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Reports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">
                {pendingReportsCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Reports</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {resolvedReportsCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Resolved Reports</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filter Section */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
              Filter by Status:
            </Label>
            <select
              id="statusFilter"
              value={statusFilter === null ? 'all' : statusFilter.toString()}
              onChange={(e) => handleStatusFilterChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[150px]"
            >
              <option value="all">All Reports</option>
              <option value="0">Pending</option>
              <option value="1">Resolved</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{reports.length}</span> of{' '}
          <span className="font-semibold">{totalReports}</span> reports
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchReports} className="mt-4">
            Try Again
          </Button>
        </Card>
      ) : reports.length === 0 ? (
        <Card className="p-12 text-center">
          <Flag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No reports found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Report ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {reports.map((report) => (
                  <motion.tr
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {/* <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center flex-shrink-0">
                          <Flag className="h-4 w-4 text-red-600 dark:text-red-400" />
                        </div> */}
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          #{report.id}
                        </span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={getUserImageUrl(report.user.image)}
                          alt={`${report.user.firstName} ${report.user.lastName}`}
                          className="w-8 h-8"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {report.user.firstName} {report.user.lastName}
                          </p>
                          <a 
                            href={`mailto:${report.user.email}`}
                            className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 truncate underline"
                          >
                            {report.user.email}
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 min-w-0">
                        <UserAvatar
                          src={getImageUrl(report.product.image)}
                          alt={report.product.name}
                          className="w-8 h-8"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1 mb-1">
                            <Package className="h-3 w-3 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {report.product.name}
                            </p>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {report.product.price}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={report.message || 'No message provided'}>
                        {report.message || 'No message provided'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(report.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate" title={report.notes || 'No notes'}>
                        {report.notes || '—'}
                      </p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {report.status === 0 ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500">—</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || isLoading}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Report Details Modal */}
      <AnimatePresence>
        {isModalOpen && selectedReport && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
              onClick={handleCloseModal}
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                      <Flag className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Report #{selectedReport.id}
                      </h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(selectedReport.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6 space-y-6">
                  {/* Report Message */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Report Message
                    </Label>
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {selectedReport.message || 'No message provided'}
                      </p>
                    </div>
                  </div>

                  {/* User Info */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Reported By
                    </Label>
                    <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <UserAvatar
                        src={getUserImageUrl(selectedReport.user.image)}
                        alt={`${selectedReport.user.firstName} ${selectedReport.user.lastName}`}
                        className="w-12 h-12"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {selectedReport.user.firstName} {selectedReport.user.lastName}
                        </p>
                        <a 
                          href={`mailto:${selectedReport.user.email}`}
                          className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                        >
                          {selectedReport.user.email}
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Product Info */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Reported Product
                    </Label>
                    <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                      <img
                        src={getImageUrl(selectedReport.product.image)}
                        alt={selectedReport.product.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icons/product_placeholder.jpg';
                        }}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
                          {selectedReport.product.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {selectedReport.product.price}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Status: {getStatusBadge(selectedReport.product.status)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Deactivate Product Radio */}
                  <div>
                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 block">
                      Deactivate Product?
                    </Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="deactivateProduct"
                          value="yes"
                          checked={formData.deactivateProduct === 'yes'}
                          onChange={(e) => setFormData({ ...formData, deactivateProduct: e.target.value as 'yes' | 'no' })}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Yes</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="deactivateProduct"
                          value="no"
                          checked={formData.deactivateProduct === 'no'}
                          onChange={(e) => setFormData({ ...formData, deactivateProduct: e.target.value as 'yes' | 'no' })}
                          className="w-4 h-4 text-red-600 focus:ring-red-500"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">No</span>
                      </label>
                    </div>
                    {formData.deactivateProduct === 'yes' && selectedReport.product.status === 1 && (
                      <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                        The product will be deactivated upon submitting this form.
                      </p>
                    )}
                    {formData.deactivateProduct === 'yes' && selectedReport.product.status !== 1 && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Product is already inactive.
                      </p>
                    )}
                  </div>

                  {/* Status Dropdown */}
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Status
                    </Label>
                    <select
                      id="status"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: Number.parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value={0}>Pending</option>
                      <option value={1}>Resolved</option>
                    </select>
                  </div>

                  {/* Notes Textarea */}
                  <div>
                    <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                      Notes
                    </Label>
                    <textarea
                      id="notes"
                      rows={4}
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Add notes about this report..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="outline"
                    onClick={handleCloseModal}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Reports;

