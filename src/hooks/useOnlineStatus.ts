import { useState, useEffect, useCallback } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { chatService } from '../services/chatService';
import { useAuth } from '../contexts/AuthContext';

interface OnlineStatusMap {
  [userId: number]: boolean;
}

/**
 * Hook to manage online status for chat partners
 * Fetches initial status and listens for real-time updates via WebSocket
 */
export const useOnlineStatus = () => {
  const [onlineStatus, setOnlineStatus] = useState<OnlineStatusMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const { socket, connected } = useSocket();
  const { isLoggedIn } = useAuth();

  // Fetch initial online status
  const fetchOnlineStatus = useCallback(async () => {
    if (!isLoggedIn) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await chatService.getOnlineStatus();
      
      // Handle different response formats
      let statusMap: OnlineStatusMap = {};
      const resp = response as any;
      
      // Format 1: { status: true, data: { onlineStatus: {...} } }
      if (resp.status && resp.data?.onlineStatus) {
        statusMap = resp.data.onlineStatus;
      }
      // Format 2: { success: true, data: { onlineStatus: {...} } }
      else if (resp.success && resp.data?.onlineStatus) {
        statusMap = resp.data.onlineStatus;
      }
      // Format 3: { data: { onlineStatus: {...} } }
      else if (resp.data?.onlineStatus) {
        statusMap = resp.data.onlineStatus;
      }
      // Format 4: { data: {...} } where data IS the map
      else if (resp.data && typeof resp.data === 'object' && !Array.isArray(resp.data)) {
        // Check if data has numeric keys (likely the status map)
        const keys = Object.keys(resp.data);
        if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
          statusMap = resp.data;
        }
      }
      // Format 5: Direct map { userId: boolean, ... }
      else if (typeof resp === 'object' && !resp.status && !resp.success && !resp.data) {
        const keys = Object.keys(resp);
        if (keys.length > 0 && keys.every(k => !isNaN(Number(k)))) {
          statusMap = resp;
        }
      }
      
      // Convert string keys to numbers if needed
      const normalizedMap: OnlineStatusMap = {};
      Object.keys(statusMap).forEach((key) => {
        const numKey = typeof key === 'string' ? Number.parseInt(key, 10) : Number(key);
        if (!isNaN(numKey)) {
          // Use the original key to access the value (statusMap uses string keys from API)
          normalizedMap[numKey] = Boolean(statusMap[key as keyof typeof statusMap]);
        }
      });
      
      if (Object.keys(normalizedMap).length > 0) {
        console.log('[useOnlineStatus] Loaded online status for users:', Object.keys(normalizedMap), normalizedMap);
      } else {
        console.warn('[useOnlineStatus] No online status data received from API. Response:', resp);
      }
      setOnlineStatus(normalizedMap);
    } catch (error: any) {
      console.error('[useOnlineStatus] Failed to fetch online status:', error?.message || error);
      // Set empty map on error so UI doesn't break
      setOnlineStatus({});
    } finally {
      setIsLoading(false);
    }
  }, [isLoggedIn]);

  // Listen for online status changes via WebSocket
  useEffect(() => {
    if (!socket || !connected) {
      console.log('[useOnlineStatus] WebSocket not ready:', { socket: !!socket, connected });
      return;
    }

    console.log('[useOnlineStatus] Listening for userOnlineStatusChanged events');

    const handleStatusChange = (data: { userId: number | string; isOnline: boolean; timestamp?: string }) => {
      console.log('[useOnlineStatus] Received status change event:', data);
      const userId = typeof data.userId === 'string' ? Number.parseInt(data.userId, 10) : data.userId;
      
      if (!isNaN(userId)) {
        setOnlineStatus((prev) => {
          const updated = {
            ...prev,
            [userId]: Boolean(data.isOnline),
          };
          console.log('[useOnlineStatus] Updated status map:', updated);
          return updated;
        });
      } else {
        console.warn('[useOnlineStatus] Invalid userId in status change event:', data);
      }
    };

    socket.on('userOnlineStatusChanged', handleStatusChange);

    return () => {
      console.log('[useOnlineStatus] Cleaning up WebSocket listener');
      socket.off('userOnlineStatusChanged', handleStatusChange);
    };
  }, [socket, connected]);

  // Fetch initial status on mount and when socket connects
  useEffect(() => {
    if (isLoggedIn) {
      // Fetch immediately, don't wait for socket connection
      // Socket connection might take time, but we can still show cached status
      fetchOnlineStatus();
    }
  }, [isLoggedIn, fetchOnlineStatus]);

  // Also fetch when socket connects to get latest status
  useEffect(() => {
    if (connected && isLoggedIn) {
      // Small delay to ensure socket is fully ready
      const timer = setTimeout(() => {
        fetchOnlineStatus();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [connected, isLoggedIn, fetchOnlineStatus]);

  // Check if a specific user is online
  const isUserOnline = useCallback(
    (userId: number | string | undefined | null): boolean => {
      if (!userId) {
        return false;
      }
      const userIdNum = typeof userId === 'string' ? Number.parseInt(userId, 10) : userId;
      
      if (isNaN(userIdNum)) {
        return false;
      }
      
      return onlineStatus[userIdNum] === true;
    },
    [onlineStatus]
  );

  return {
    onlineStatus,
    isUserOnline,
    isLoading,
    refresh: fetchOnlineStatus,
  };
};

