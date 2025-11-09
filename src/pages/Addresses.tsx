import { useState, useEffect } from 'react';
import { Plus, MapPin, Edit, Trash2, Star, X } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { addressService } from '../services/addressService';
import type { Address, CreateAddressRequest } from '../interfaces/address';

const Addresses = () => {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<number | null>(null);
  const [newAddress, setNewAddress] = useState({
    address1: '',
    address2: '',
    zipcode: '',
    city: '',
    state: '',
    country: '',
    isDefault: false,
    lat: 0,
    lng: 0
  });

  useEffect(() => {
    console.log('Addresses component mounted');
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    try {
      const response = await addressService.getAddresses();
      console.log('Addresses response:', response);
      
      // Handle different response formats
      let addressArray: Address[] = [];
      
      if (Array.isArray(response)) {
        addressArray = response;
      } else if (response && typeof response === 'object') {
        const res = response as any;
        if ('data' in res && Array.isArray(res.data)) {
          // If response is wrapped in a data property
          addressArray = res.data as Address[];
        } else if ('addresses' in res && Array.isArray(res.addresses)) {
          // If response has addresses property
          addressArray = res.addresses as Address[];
        }
      }
      
      setAddresses(addressArray);
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]); // Set empty array on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (addressId: number) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        await addressService.deleteAddress(addressId);
        await loadAddresses();
      } catch (error) {
        console.error('Error deleting address:', error);
        alert('Failed to delete address. Please try again.');
      }
    }
  };

  const handleSetDefault = async (addressId: number) => {
    try {
      await addressService.updateAddress(addressId, { isDefault: true });
      await loadAddresses();
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to set default address. Please try again.');
    }
  };

  const handleCreateAddress = async () => {
    try {
      const addressData: CreateAddressRequest = {
        address1: newAddress.address1,
        address2: newAddress.address2,
        zipcode: newAddress.zipcode,
        city: newAddress.city,
        state: newAddress.state,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
        lat: newAddress.lat,
        lng: newAddress.lng
      };
      
      await addressService.createAddress(addressData);
      await loadAddresses();
      setShowCreateModal(false);
      setNewAddress({
        address1: '',
        address2: '',
        zipcode: '',
        city: '',
        state: '',
        country: '',
        isDefault: false,
        lat: 0,
        lng: 0
      });
    } catch (error) {
      console.error('Error creating address:', error);
      alert('Failed to create address. Please try again.');
    }
  };

  const handleEditClick = (address: Address) => {
    setEditingAddressId(address.id);
    setNewAddress({
      address1: address.address1,
      address2: address.address2,
      zipcode: address.zipcode,
      city: address.city,
      state: address.state,
      country: address.country,
      isDefault: address.isDefault,
      lat: address.lat,
      lng: address.lng
    });
    setShowEditModal(true);
  };

  const handleUpdateAddress = async () => {
    if (!editingAddressId) return;
    
    try {
      const addressData = {
        address1: newAddress.address1,
        address2: newAddress.address2,
        zipcode: newAddress.zipcode,
        city: newAddress.city,
        state: newAddress.state,
        country: newAddress.country,
        isDefault: newAddress.isDefault,
        lat: newAddress.lat,
        lng: newAddress.lng
      };
      
      await addressService.updateAddress(editingAddressId, addressData);
      await loadAddresses();
      setShowEditModal(false);
      setEditingAddressId(null);
      setNewAddress({
        address1: '',
        address2: '',
        zipcode: '',
        city: '',
        state: '',
        country: '',
        isDefault: false,
        lat: 0,
        lng: 0
      });
    } catch (error) {
      console.error('Error updating address:', error);
      alert('Failed to update address. Please try again.');
    }
  };

  const closeModals = () => {
    setShowCreateModal(false);
    setShowEditModal(false);
    setEditingAddressId(null);
    setNewAddress({
      address1: '',
      address2: '',
      zipcode: '',
      city: '',
      state: '',
      country: '',
      isDefault: false,
      lat: 0,
      lng: 0
    });
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Addresses</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your delivery addresses</p>
          </div>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Loading addresses...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Addresses</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your delivery addresses</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MapPin className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-500 text-center mb-4">Add your first delivery address to get started.</p>
            <Button onClick={() => setShowCreateModal(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Address
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {addresses.map((address) => (
            <Card key={address.id} className="relative">
              {address.isDefault && (
                <div
                  className="absolute top-4 right-4 text-primary"
                  title="Default Address"
                >
                  <Star className="h-6 w-6 fill-current" />
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  {address.city}, {address.state}
                </CardTitle>
                <CardDescription>{address.country}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <p>{address.address1}</p>
                  {address.address2 && <p>{address.address2}</p>}
                  <p>
                    {address.city}, {address.state} {address.zipcode}
                  </p>
                  <p>{address.country}</p>
                </div>
                <div className="flex space-x-2">
                  {!address.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSetDefault(address.id)}
                    >
                      Set Default
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1"
                    onClick={() => handleEditClick(address)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
                 </div>
       )}

               {/* Create/Edit Address Modal */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{showEditModal ? 'Edit Address' : 'Add New Address'}</CardTitle>
                    <CardDescription>Enter your address details</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={closeModals}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
             <CardContent className="space-y-4">
               <div className="grid grid-cols-1 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="address1">Address *</Label>
                   <Input
                     id="address1"
                     value={newAddress.address1}
                     onChange={(e) => setNewAddress(prev => ({ ...prev, address1: e.target.value }))}
                     placeholder="Street address"
                     required
                   />
                 </div>
                 {/* <div className="space-y-2">
                   <Label htmlFor="address2">Address Line 2</Label>
                   <Input
                     id="address2"
                     value={newAddress.address2}
                     onChange={(e) => setNewAddress(prev => ({ ...prev, address2: e.target.value }))}
                     placeholder="Apartment, suite, etc."
                   />
                 </div> */}
               </div>

               <div className="grid grid-cols-3 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="city">City *</Label>
                   <Input
                     id="city"
                     value={newAddress.city}
                     onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                     placeholder="City"
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="state">State *</Label>
                   <Input
                     id="state"
                     value={newAddress.state}
                     onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value }))}
                     placeholder="State"
                     required
                   />
                 </div>
                 <div className="space-y-2">
                   <Label htmlFor="zipcode">Zipcode *</Label>
                   <Input
                     id="zipcode"
                     value={newAddress.zipcode}
                     onChange={(e) => setNewAddress(prev => ({ ...prev, zipcode: e.target.value }))}
                     placeholder="Zipcode"
                     required
                   />
                 </div>
               </div>

               <div className="space-y-2">
                 <Label htmlFor="country">Country *</Label>
                 <Input
                   id="country"
                   value={newAddress.country}
                   onChange={(e) => setNewAddress(prev => ({ ...prev, country: e.target.value }))}
                   placeholder="Country"
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
                    variant="outline"
                    onClick={closeModals}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={showEditModal ? handleUpdateAddress : handleCreateAddress}
                    className="flex-1"
                    disabled={!newAddress.address1 || !newAddress.city || !newAddress.state || !newAddress.zipcode || !newAddress.country}
                  >
                    {showEditModal ? 'Update Address' : 'Save Address'}
                  </Button>
                </div>
             </CardContent>
           </Card>
         </div>
       )}
     </div>
   );
 };
 
 export default Addresses;
