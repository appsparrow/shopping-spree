
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export interface ShoppingItem {
  id: string;
  name: string;
  photo: string;
  price_original: number;
  price_converted: number;
  original_currency: string;
  converted_currency: string;
  exchange_rate: number;
  liked: boolean;
  purchased: boolean;
  timestamp: string;
  created_at: string;
  updated_at: string;
  user_id?: string;
}

const OFFLINE_KEY = 'offline_shopping_items';

export const useShoppingItems = () => {
  const queryClient = useQueryClient();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Fetch items from Supabase
  const { data: items = [], isLoading, error } = useQuery({
    queryKey: ['shopping-items'],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as ShoppingItem[];
    },
    enabled: isOnline,
  });

  // Get offline items from localStorage
  const getOfflineItems = (): ShoppingItem[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save items to localStorage
  const saveOfflineItems = (items: ShoppingItem[]) => {
    try {
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(items));
    } catch (error) {
      console.error('Failed to save offline items:', error);
    }
  };

  // Sync offline data when coming online
  const syncOfflineData = async () => {
    const offlineItems = getOfflineItems();
    if (offlineItems.length === 0) return;

    setSyncStatus('syncing');
    try {
      const user = await getCurrentUser();
      if (!user) return;

      for (const item of offlineItems) {
        const { user_id, ...itemData } = item;
        await supabase
          .from('shopping_items')
          .upsert({ ...itemData, user_id: user.id });
      }

      // Clear offline storage after successful sync
      localStorage.removeItem(OFFLINE_KEY);
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      setSyncStatus('idle');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (newItem: Omit<ShoppingItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const user = await getCurrentUser();
      if (!user) throw new Error('Not authenticated');

      const itemWithUser = {
        ...newItem,
        user_id: user.id,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isOnline) {
        const { data, error } = await supabase
          .from('shopping_items')
          .insert(itemWithUser)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Store offline
        const offlineItems = getOfflineItems();
        offlineItems.unshift(itemWithUser);
        saveOfflineItems(offlineItems);
        return itemWithUser;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: ShoppingItem) => {
      if (isOnline) {
        const { user_id, ...updateData } = updatedItem;
        const { data, error } = await supabase
          .from('shopping_items')
          .update({ ...updateData, updated_at: new Date().toISOString() })
          .eq('id', updatedItem.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Update offline
        const offlineItems = getOfflineItems();
        const index = offlineItems.findIndex(item => item.id === updatedItem.id);
        if (index !== -1) {
          offlineItems[index] = { ...updatedItem, updated_at: new Date().toISOString() };
        } else {
          offlineItems.unshift({ ...updatedItem, updated_at: new Date().toISOString() });
        }
        saveOfflineItems(offlineItems);
        return updatedItem;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      if (isOnline) {
        const { error } = await supabase
          .from('shopping_items')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Remove from offline storage
        const offlineItems = getOfflineItems();
        const filtered = offlineItems.filter(item => item.id !== id);
        saveOfflineItems(filtered);
      }
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
    },
  });

  // Combine online and offline items
  const allItems = isOnline ? items : getOfflineItems();

  return {
    items: allItems,
    isLoading: isOnline ? isLoading : false,
    error,
    isOnline,
    syncStatus,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
  };
};
