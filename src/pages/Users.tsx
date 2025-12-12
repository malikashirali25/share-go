import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Users as UsersIcon,
  Search,
  Calendar,
  Package,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Shield,
  ShieldCheck,
  ShieldOff,
  Trash2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { useToast } from '../components/ui/toast';
import { userService } from '../services/userService';
import UserAvatar from '../components/UserAvatar';
import ConfirmDialog from '../components/ConfirmDialog';
import config from '../config';
import type { UserListingItem } from '../interfaces/user';

const Users = () => {
  const toast = useToast();
  const [users, setUsers] = useState<UserListingItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [activeUsersCount, setActiveUsersCount] = useState(0);
  const [inactiveUsersCount, setInactiveUsersCount] = useState(0);
  const limit = 10;

  // Filter and search state
  const [statusFilter, setStatusFilter] = useState<number | null>(null); // null = all, 0 = inactive, 1 = active
  const [searchTerm, setSearchTerm] = useState('');
  const [searchInput, setSearchInput] = useState('');

  // Confirmation dialog state for status change
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState<{ id: number; name: string; currentStatus: number } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete confirmation dialog state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getUsersListing({
        page: currentPage,
        limit,
        status: statusFilter ?? undefined,
        search: searchTerm || undefined,
      });

      if (response.status && response.data) {
        setUsers(response.data.users || []);
        setTotalPages(response.data.totalPages || 1);
        setTotalUsers(response.data.total || 0);
        setActiveUsersCount(response.data.activeUsersCount || 0);
        setInactiveUsersCount(response.data.inactiveUsersCount || 0);
      }
    } catch (err: any) {
      console.error('Failed to fetch users:', err);
      setError(err.message || 'Failed to load users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusFilterChange = (value: string) => {
    const newFilter = value === 'all' ? null : Number.parseInt(value, 10);
    setStatusFilter(newFilter);
    setCurrentPage(1); // Reset pagination when filter changes
  };

  const handleSearch = () => {
    setSearchTerm(searchInput);
    setCurrentPage(1); // Reset pagination when search changes
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleStatusChangeClick = (user: UserListingItem) => {
    setUserToUpdate({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      currentStatus: user.status,
    });
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!userToUpdate) return;

    setIsUpdating(true);
    try {
      const newStatus = userToUpdate.currentStatus === 1 ? 0 : 1;
      await userService.updateUserStatus(userToUpdate.id, newStatus);
      
      // Refresh the users list after status update
      await fetchUsers();
      setIsConfirmDialogOpen(false);
      toast.success(
        newStatus === 1 ? 'User Activated' : 'User Deactivated',
        `${userToUpdate.name} has been ${newStatus === 1 ? 'activated' : 'deactivated'} successfully.`
      );
      setUserToUpdate(null);
    } catch (err: any) {
      console.error('Failed to update user status:', err);
      toast.error('Failed to Update Status', err.message || 'An error occurred while updating user status.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelStatusChange = () => {
    setIsConfirmDialogOpen(false);
    setUserToUpdate(null);
  };

  const handleDeleteClick = (user: UserListingItem) => {
    setUserToDelete({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
    });
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(true);
    try {
      await userService.deleteUser(userToDelete.id);
      
      // Refresh the users list after deletion
      await fetchUsers();
      setIsDeleteDialogOpen(false);
      toast.success('User Deleted', `${userToDelete.name} has been deleted successfully.`);
      setUserToDelete(null);
    } catch (err: any) {
      console.error('Failed to delete user:', err);
      
      // Check for foreign key constraint error
      let errorMessage = err.message || 'An error occurred while deleting the user.';
      if (errorMessage.includes('foreign key constraint') || errorMessage.includes('violates')) {
        errorMessage = 'Cannot delete this user because they have associated products or data. Please delete their products first.';
      }
      
      toast.error('Failed to Delete User', errorMessage);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
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
    });
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
            <ShieldOff className="h-3 w-3" />
            Inactive
          </span>
        );
      case 1:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
            <ShieldCheck className="h-3 w-3" />
            Active
          </span>
        );
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
          <Shield className="h-3 w-3" />
          Admin
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
        <UsersIcon className="h-3 w-3" />
        User
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <toast.ToastContainer />

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          User Management
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-2">
          View and manage all users in the system
        </p>
      </div>

      {/* Stats Card */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                {totalUsers}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {activeUsersCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-600 dark:text-gray-400 mb-2">
                {inactiveUsersCount}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Inactive Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search and Filter Section */}
      <Card className="border-0 shadow-lg">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10"
                  />
                </div>
                <Button onClick={handleSearch}>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                {searchTerm && (
                  <Button variant="outline" onClick={handleClearSearch}>
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Status Filter */}
            <div className="md:w-48">
              <Label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Filter by Status:
              </Label>
              <select
                id="statusFilter"
                value={statusFilter === null ? 'all' : statusFilter.toString()}
                onChange={(e) => handleStatusFilterChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Users</option>
                <option value="1">Active</option>
                <option value="0">Inactive</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold">{users.length}</span> of{' '}
          <span className="font-semibold">{totalUsers}</span> users
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Page {currentPage} of {totalPages}
        </p>
      </div>

      {/* Users List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-red-400 mb-4" />
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <Button onClick={fetchUsers} className="mt-4">
            Try Again
          </Button>
        </Card>
      ) : users.length === 0 ? (
        <Card className="p-12 text-center">
          <UsersIcon className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">No users found</p>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Verified
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map((user) => (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <UserAvatar
                          src={getUserImageUrl(user.image)}
                          alt={user.firstName + ' ' + user.lastName}
                          className="w-10 h-10"
                        />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            #{user.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a 
                        href={`mailto:${user.email}`}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
                      >
                        {user.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRoleBadge(user.role)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Package className="h-4 w-4" />
                        <span>{user.productCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {user.isEmailVerified ? (
                          <div className="flex items-center gap-1 text-green-600 dark:text-green-400" title="Email Verified">
                            <CheckCircle className="h-4 w-4" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-gray-400" title="Email Not Verified">
                            <XCircle className="h-4 w-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(user.createdAt)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status === 1 ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleStatusChangeClick(user)}
                            disabled={isUpdating || isDeleting}
                          >
                            <ShieldOff className="h-4 w-4 mr-1" />
                            Deactivate
                          </Button>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleStatusChangeClick(user)}
                            disabled={isUpdating || isDeleting}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Activate
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteClick(user)}
                          disabled={isUpdating || isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
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

      {/* Status Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={handleCancelStatusChange}
        onConfirm={handleConfirmStatusChange}
        title={userToUpdate?.currentStatus === 1 ? 'Deactivate User' : 'Activate User'}
        message={`Are you sure you want to ${userToUpdate?.currentStatus === 1 ? 'deactivate' : 'activate'} the user "${userToUpdate?.name}"?`}
        confirmText={isUpdating ? (userToUpdate?.currentStatus === 1 ? 'Deactivating...' : 'Activating...') : (userToUpdate?.currentStatus === 1 ? 'Deactivate' : 'Activate')}
        cancelText="Cancel"
        variant={userToUpdate?.currentStatus === 1 ? 'danger' : 'default'}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Delete User"
        message={`Are you sure you want to permanently delete the user "${userToDelete?.name}"? This action cannot be undone.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete User'}
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default Users;

