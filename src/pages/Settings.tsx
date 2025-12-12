import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Mail, 
  MapPin, 
  Phone, 
  Camera, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff,
  Save,
  Upload,
  Trash2,
  Loader2
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/toast';
import { useAuth } from '../contexts/AuthContext';
import { userService } from '../services/userService';
import config from '../config';

const Settings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    location: '',
    bio: 'I love sharing and discovering great items in my community!',
    image: ''
  });

  // Fetch user profile with address on mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getUserProfile();
        
        if (response.status && response.data) {
          const { user: userData, address } = response.data;
          
          // Build location string from address
          let locationString = '';
          if (address) {
            const parts = [address.city, address.state, address.country].filter(Boolean);
            locationString = parts.join(', ');
          }
          
          setProfileData({
            firstName: userData.firstName || '',
            lastName: userData.lastName || '',
            email: userData.email || '',
            countryCode: userData.countryCode || '+1',
            phoneNumber: userData.phoneNumber || '',
            location: locationString,
            bio: 'I love sharing and discovering great items in my community!',
            image: userData.image || ''
          });
        }
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        // Fallback to auth context user data
        if (user) {
          setProfileData(prev => ({
            ...prev,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || ''
          }));
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, [user]);

  // Notification settings
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newMessages: true,
    newCalls: true,
    newEmails: true,
    adUpdates: true,
    systemUpdates: true
  });

  // Privacy settings
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    showLocation: true,
    allowDirectMessages: true,
    allowCalls: true
  });

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: string, value: boolean) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handlePrivacyChange = (field: string, value: string | boolean) => {
    setPrivacySettings(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await userService.updateProfile({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        countryCode: profileData.countryCode,
        phoneNumber: profileData.phoneNumber,
      });
      toast.success('Profile Updated', 'Your profile has been updated successfully.');
    } catch (error: any) {
      console.error('Failed to save profile:', error);
      toast.error('Failed to Update Profile', error.message || 'An error occurred while saving your profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveNotifications = () => {
    console.log('Saving notification settings:', notificationSettings);
    // Here you would typically save to backend
  };

  const handleSavePrivacy = () => {
    console.log('Saving privacy settings:', privacySettings);
    // Here you would typically save to backend
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notifications */}
      <toast.ToastContainer />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card>
            <CardContent className="p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <tab.icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-3"
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and profile details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <img
                      src={profileData.image ? (profileData.image.startsWith('http') ? profileData.image : `${config.api.mediaUrl}${profileData.image}`) : "https://i.pravatar.cc/150?img=1"}
                      alt="Profile"
                      className="h-20 w-20 rounded-full object-cover"
                    />
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">Profile Picture</h3>
                    <p className="text-sm text-gray-500">Click to upload a new photo</p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => handleProfileChange('firstName', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => handleProfileChange('lastName', e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="flex gap-2">
                      <Input
                        id="countryCode"
                        value={profileData.countryCode}
                        onChange={(e) => handleProfileChange('countryCode', e.target.value)}
                        className="w-20"
                        placeholder="+1"
                        disabled={isLoading}
                      />
                      <Input
                        id="phone"
                        value={profileData.phoneNumber}
                        onChange={(e) => handleProfileChange('phoneNumber', e.target.value)}
                        className="flex-1"
                        placeholder="1234567890"
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={profileData.location}
                      disabled
                      className="bg-gray-100 cursor-not-allowed"
                      placeholder="No address set"
                    />
                    <p className="text-xs text-gray-500 mt-1">Location is managed through your addresses</p>
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    rows={3}
                    value={profileData.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <Button onClick={handleSaveProfile} className="w-full" disabled={isSaving || isLoading}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Choose how you want to be notified about activity
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Email Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">Push Notifications</h3>
                      <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.pushNotifications}
                      onChange={(e) => handleNotificationChange('pushNotifications', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900">SMS Notifications</h3>
                      <p className="text-sm text-gray-500">Receive notifications via SMS</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.smsNotifications}
                      onChange={(e) => handleNotificationChange('smsNotifications', e.target.checked)}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-3">Notification Types</h4>
                    <div className="space-y-3">
                      {[
                        { key: 'newMessages', label: 'New Messages', desc: 'When someone sends you a message' },
                        { key: 'newCalls', label: 'New Calls', desc: 'When someone calls you' },
                        { key: 'newEmails', label: 'New Emails', desc: 'When you receive an email' },
                        { key: 'adUpdates', label: 'Ad Updates', desc: 'Updates about your ads' },
                        { key: 'systemUpdates', label: 'System Updates', desc: 'Important system announcements' }
                      ].map((setting) => (
                        <div key={setting.key} className="flex items-center justify-between">
                          <div>
                            <h5 className="font-medium text-gray-900">{setting.label}</h5>
                            <p className="text-sm text-gray-500">{setting.desc}</p>
                          </div>
                          <input
                            type="checkbox"
                            checked={notificationSettings[setting.key as keyof typeof notificationSettings]}
                            onChange={(e) => handleNotificationChange(setting.key, e.target.checked)}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveNotifications} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Notification Settings
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Privacy Tab */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
                <CardDescription>
                  Control who can see your information and contact you
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="profileVisibility">Profile Visibility</Label>
                    <select
                      id="profileVisibility"
                      value={privacySettings.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="public">Public - Anyone can see your profile</option>
                      <option value="friends">Friends Only - Only your connections can see your profile</option>
                      <option value="private">Private - Only you can see your profile</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    {[
                      { key: 'showEmail', label: 'Show Email Address', desc: 'Allow others to see your email' },
                      { key: 'showPhone', label: 'Show Phone Number', desc: 'Allow others to see your phone number' },
                      { key: 'showLocation', label: 'Show Location', desc: 'Allow others to see your location' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{setting.label}</h5>
                          <p className="text-sm text-gray-500">{setting.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings[setting.key as keyof typeof privacySettings] as boolean}
                          onChange={(e) => handlePrivacyChange(setting.key, e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Communication</h4>
                    {[
                      { key: 'allowDirectMessages', label: 'Allow Direct Messages', desc: 'Let others send you direct messages' },
                      { key: 'allowCalls', label: 'Allow Calls', desc: 'Let others call you directly' }
                    ].map((setting) => (
                      <div key={setting.key} className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{setting.label}</h5>
                          <p className="text-sm text-gray-500">{setting.desc}</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={privacySettings[setting.key as keyof typeof privacySettings] as boolean}
                          onChange={(e) => handlePrivacyChange(setting.key, e.target.checked)}
                          className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={handleSavePrivacy} className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Save Privacy Settings
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;



