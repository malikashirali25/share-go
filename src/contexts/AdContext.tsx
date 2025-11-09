import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Ad } from '../types';
import { mockAds } from '../data/mockData';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';

interface AdContextType {
  ads: Ad[];
  postAd: (adData: Omit<Ad, 'id' | 'createdAt' | 'views' | 'user'>) => void;
  deleteAd: (adId: string) => void;
  updateAd: (adId: string, updatedData: Partial<Omit<Ad, 'id' | 'createdAt' | 'views' | 'user'>>) => void;
  updateAdStatus: (adId: string, status: 'active' | 'sold' | 'pending' | 'rejected') => void;
  getUserAds: (userId: string) => Ad[];
  getAdById: (adId: string) => Ad | undefined;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

interface AdProviderProps {
  children: ReactNode;
}

export const AdProvider = ({ children }: AdProviderProps) => {
  // Initialize ads from localStorage or fall back to mockAds
  const [ads, setAds] = useState<Ad[]>(() => {
    try {
      const savedAds = localStorage.getItem('share-and-go-ads');
      if (savedAds) {
        const parsedAds = JSON.parse(savedAds);
        
        // Validate and migrate ads to ensure they have valid status
        const validatedAds = parsedAds.map((ad: any) => {
          const validStatuses = ['active', 'pending', 'sold', 'rejected'];
          
          // If ad is missing status or has invalid status, default to 'pending'
          if (!ad.status || !validStatuses.includes(ad.status)) {
            console.log(`Migrating ad "${ad.title}" to pending status (was: ${ad.status || 'undefined'})`);
            return {
              ...ad,
              status: 'pending'
            };
          }
          
          return ad;
        });
        
        return validatedAds;
      }
    } catch (error) {
      console.error('Error loading ads from localStorage:', error);
    }
    return mockAds;
  });
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  // Save ads to localStorage whenever the ads state changes
  useEffect(() => {
    try {
      localStorage.setItem('share-and-go-ads', JSON.stringify(ads));
    } catch (error) {
      console.error('Error saving ads to localStorage:', error);
    }
  }, [ads]);

  const postAd = useCallback((adData: Omit<Ad, 'id' | 'createdAt' | 'views' | 'user'>) => {
    if (!user) {
      console.error('User must be logged in to post an ad');
      return;
    }

    const newAd: Ad = {
      id: `ad_${Date.now()}`,
      createdAt: new Date().toISOString(),
      views: 0,
      user: user, // Assign the current logged-in user
      ...adData,
      status: 'pending', // Always set new ads to pending for admin approval
    };

    setAds(prev => [newAd, ...prev]);

    // Add notification for ad submission
    addNotification({
      type: 'ad',
      title: 'Ad Submitted',
      message: 'Your new ad is pending review.',
      actionUrl: '/dashboard/ads',
      userId: user.id
    });
  }, [user, addNotification]);

  const deleteAd = useCallback((adId: string) => {
    // Find the ad being deleted to get its title for the notification
    const adToDelete = ads.find(ad => ad.id === adId);
    
    setAds(prev => prev.filter(ad => ad.id !== adId));

    // Add notification for ad deletion
    if (adToDelete) {
      addNotification({
        type: 'ad',
        title: 'Ad Deleted',
        message: `"${adToDelete.title}" has been deleted.`,
        actionUrl: '/dashboard/ads',
        userId: adToDelete.user.id
      });
    }
  }, [ads, addNotification]);

  const updateAd = useCallback((adId: string, updatedData: Partial<Omit<Ad, 'id' | 'createdAt' | 'views' | 'user'>>) => {
    setAds(prev =>
      prev.map(ad =>
        ad.id === adId
          ? { ...ad, ...updatedData }
          : ad
      )
    );
  }, []);

  const updateAdStatus = useCallback((adId: string, status: 'active' | 'sold' | 'pending' | 'rejected') => {
    // Find the ad being updated to get its title and current status
    const adToUpdate = ads.find(ad => ad.id === adId);
    
    setAds(prev => 
      prev.map(ad => 
        ad.id === adId 
          ? { ...ad, status }
          : ad
      )
    );

    // Add notification based on status change
    if (adToUpdate) {
      let notificationTitle = '';
      let notificationMessage = '';

      switch (status) {
        case 'active':
          notificationTitle = 'Ad Approved';
          notificationMessage = `"${adToUpdate.title}" has been approved and is now live!`;
          break;
        case 'rejected':
          notificationTitle = 'Ad Rejected';
          notificationMessage = `"${adToUpdate.title}" has been rejected. Please review and resubmit.`;
          break;
        case 'sold':
          notificationTitle = 'Ad Marked as Sold';
          notificationMessage = `"${adToUpdate.title}" has been marked as sold.`;
          break;
        case 'pending':
          notificationTitle = 'Ad Status Updated';
          notificationMessage = `"${adToUpdate.title}" status has been updated to pending.`;
          break;
        default:
          notificationTitle = 'Ad Status Updated';
          notificationMessage = `"${adToUpdate.title}" status has been updated.`;
      }

      addNotification({
        type: 'ad',
        title: notificationTitle,
        message: notificationMessage,
        actionUrl: '/dashboard/ads',
        userId: adToUpdate.user.id
      });
    }
  }, [ads, addNotification]);

  const getUserAds = useCallback((userId: string): Ad[] => {
    return ads.filter(ad => ad.user.id === userId);
  }, [ads]);

  const getAdById = useCallback((adId: string): Ad | undefined => {
    return ads.find(ad => ad.id === adId);
  }, [ads]);

  const value: AdContextType = {
    ads,
    postAd,
    deleteAd,
    updateAd,
    updateAdStatus,
    getUserAds,
    getAdById,
  };

  return (
    <AdContext.Provider value={value}>
      {children}
    </AdContext.Provider>
  );
};

export const useAds = () => {
  const context = useContext(AdContext);
  if (context === undefined) {
    throw new Error('useAds must be used within an AdProvider');
  }
  return context;
};
