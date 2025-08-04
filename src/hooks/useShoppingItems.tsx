
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
  const [offlineItems, setOfflineItems] = useState<ShoppingItem[]>([]);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      console.log('Coming back online, starting sync...');
      setIsOnline(true);
      syncOfflineData();
    };
    const handleOffline = () => {
      console.log('Going offline...');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load offline items on mount
  useEffect(() => {
    if (!isOnline) {
      const items = getOfflineItems();
      setOfflineItems(items);
    }
  }, [isOnline]);

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
      console.log('Fetched online items:', data?.length);
      return data as ShoppingItem[];
    },
    enabled: isOnline,
  });

  // Get offline items from localStorage
  const getOfflineItems = (): ShoppingItem[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_KEY);
      const items = stored ? JSON.parse(stored) : [];
      console.log('Retrieved offline items:', items.length);
      return items;
    } catch (error) {
      console.error('Error loading offline items:', error);
      return [];
    }
  };

  // Save items to localStorage
  const saveOfflineItems = (items: ShoppingItem[]) => {
    try {
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(items));
      setOfflineItems(items);
      console.log('Saved offline items:', items.length);
    } catch (error) {
      console.error('Failed to save offline items:', error);
    }
  };

  // Sync offline data when coming online
  const syncOfflineData = async () => {
    const storedOfflineItems = getOfflineItems();
    if (storedOfflineItems.length === 0) {
      console.log('No offline items to sync');
      return;
    }

    setSyncStatus('syncing');
    console.log('Starting sync of', storedOfflineItems.length, 'offline items');
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('No user found, cannot sync');
        setSyncStatus('error');
        return;
      }

      for (const item of storedOfflineItems) {
        try {
          const { user_id, ...itemData } = item;
          console.log('Syncing item:', item.name);
          
          // Check if item already exists
          const { data: existingItem } = await supabase
            .from('shopping_items')
            .select('id')
            .eq('id', item.id)
            .single();

          if (existingItem) {
            // Update existing item
            await supabase
              .from('shopping_items')
              .update({ ...itemData, user_id: user.id, updated_at: new Date().toISOString() })
              .eq('id', item.id);
          } else {
            // Insert new item
            await supabase
              .from('shopping_items')
              .insert({ ...itemData, user_id: user.id });
          }
        } catch (itemError) {
          console.error('Error syncing item:', item.name, itemError);
        }
      }

      // Clear offline storage after successful sync
      localStorage.removeItem(OFFLINE_KEY);
      setOfflineItems([]);
      queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      setSyncStatus('idle');
      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
    }
  };

  // Create item mutation
  const createItemMutation = useMutation({
    mutationFn: async (newItem: Omit<ShoppingItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const user = await getCurrentUser();
      if (!user && isOnline) throw new Error('Not authenticated');

      const itemWithUser = {
        ...newItem,
        user_id: user?.id || '',
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isOnline && user) {
        console.log('Creating item online:', itemWithUser.name);
        const { data, error } = await supabase
          .from('shopping_items')
          .insert(itemWithUser)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        console.log('Creating item offline:', itemWithUser.name);
        const currentOfflineItems = getOfflineItems();
        const updatedItems = [itemWithUser, ...currentOfflineItems];
        saveOfflineItems(updatedItems);
        return itemWithUser;
      }
    },
    onSuccess: (newItem) => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      }
    },
  });

  // Update item mutation
  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: ShoppingItem) => {
      console.log('Updating item:', updatedItem.name, 'Online:', isOnline);
      
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
        const currentOfflineItems = getOfflineItems();
        const index = currentOfflineItems.findIndex(item => item.id === updatedItem.id);
        const itemWithTimestamp = { ...updatedItem, updated_at: new Date().toISOString() };
        
        if (index !== -1) {
          currentOfflineItems[index] = itemWithTimestamp;
        } else {
          currentOfflineItems.unshift(itemWithTimestamp);
        }
        saveOfflineItems(currentOfflineItems);
        return itemWithTimestamp;
      }
    },
    onSuccess: () => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      }
    },
  });

  // Delete item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log('Deleting item:', id, 'Online:', isOnline);
      
      if (isOnline) {
        const { error } = await supabase
          .from('shopping_items')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
      } else {
        // Remove from offline storage
        const currentOfflineItems = getOfflineItems();
        const filtered = currentOfflineItems.filter(item => item.id !== id);
        saveOfflineItems(filtered);
      }
      return id;
    },
    onSuccess: () => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      }
    },
  });

  // Combine online and offline items
  const allItems = isOnline ? items : offlineItems;

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
