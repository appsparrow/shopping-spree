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
const LAST_SYNC_KEY = 'last_sync_timestamp';

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
      // Add a small delay to ensure network is stable
      setTimeout(() => {
        syncOfflineData();
      }, 1000);
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

  // Load offline items on mount and when going offline
  useEffect(() => {
    const items = getOfflineItems();
    setOfflineItems(items);
    console.log('Loaded offline items on mount:', items.length);
  }, []);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && syncStatus === 'idle') {
      const offlineData = getOfflineItems();
      if (offlineData.length > 0) {
        console.log('Found offline data on startup, syncing...', offlineData.length);
        syncOfflineData();
      }
    }
  }, [isOnline]);

  // Get current user
  const getCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  };

  // Fetch items from Supabase with timestamp tracking
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
      
      // Update last sync timestamp when we successfully fetch online data
      if (data) {
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        console.log('Fetched online items:', data?.length);
        // Clear offline items after successful fetch to prevent duplicates
        if (getOfflineItems().length > 0 && data.length > 0) {
          console.log('Clearing offline items after successful online fetch');
          localStorage.removeItem(OFFLINE_KEY);
          setOfflineItems([]);
        }
      }
      
      return data as ShoppingItem[];
    },
    enabled: isOnline,
    refetchOnWindowFocus: false,
    staleTime: 1 * 60 * 1000, // 1 minute
    retry: 3,
  });

  // Get offline items from localStorage
  const getOfflineItems = (): ShoppingItem[] => {
    try {
      const stored = localStorage.getItem(OFFLINE_KEY);
      const items = stored ? JSON.parse(stored) : [];
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

  // Update exchange rates for all items - Fixed to update all items properly
  const updateExchangeRates = (newRate: number, fromCurrency: string, toCurrency: string) => {
    console.log('Updating exchange rates:', newRate, fromCurrency, toCurrency);
    
    const currentItems = isOnline ? items : offlineItems;
    const updatedItems = currentItems.map(item => ({
      ...item,
      price_converted: item.price_original / newRate,
      exchange_rate: newRate,
      original_currency: fromCurrency,
      converted_currency: toCurrency,
      updated_at: new Date().toISOString()
    }));

    console.log('Updated items with new rates:', updatedItems.length);

    if (isOnline) {
      // Update cache immediately for better UX
      queryClient.setQueryData(['shopping-items'], updatedItems);
      // Update all items in database in batches to avoid overwhelming the server
      updatedItems.forEach((item, index) => {
        setTimeout(() => {
          updateItemMutation.mutate(item);
        }, index * 100); // Stagger updates by 100ms
      });
    } else {
      saveOfflineItems(updatedItems);
    }
  };

  // Enhanced sync function with better conflict resolution
  const syncOfflineData = async () => {
    const storedOfflineItems = getOfflineItems();
    if (storedOfflineItems.length === 0) {
      console.log('No offline items to sync');
      setSyncStatus('idle');
      return;
    }

    setSyncStatus('syncing');
    console.log('Starting comprehensive sync of', storedOfflineItems.length, 'offline items');
    
    try {
      const user = await getCurrentUser();
      if (!user) {
        console.log('No user found, cannot sync');
        setSyncStatus('error');
        return;
      }

      // First, fetch current server state to compare
      const { data: serverItems, error: fetchError } = await supabase
        .from('shopping_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching server items for sync:', fetchError);
        setSyncStatus('error');
        return;
      }

      console.log('Current server items:', serverItems?.length || 0);

      const syncResults = {
        created: 0,
        updated: 0,
        skipped: 0,
        errors: 0
      };

      // Process each offline item
      for (const offlineItem of storedOfflineItems) {
        try {
          const { user_id, ...itemData } = offlineItem;
          
          // Check if item exists on server
          const existingServerItem = serverItems?.find(si => si.id === offlineItem.id);
          
          if (existingServerItem) {
            // Item exists on server - check timestamps to resolve conflicts
            const offlineTime = new Date(offlineItem.updated_at).getTime();
            const serverTime = new Date(existingServerItem.updated_at).getTime();
            
            if (offlineTime > serverTime) {
              // Offline version is newer - update server
              const { error: updateError } = await supabase
                .from('shopping_items')
                .update({ ...itemData, user_id: user.id, updated_at: new Date().toISOString() })
                .eq('id', offlineItem.id);
              
              if (updateError) {
                console.error('Error updating item:', updateError);
                syncResults.errors++;
              } else {
                console.log('Updated server with newer offline version:', offlineItem.name);
                syncResults.updated++;
              }
            } else {
              // Server version is same or newer - skip
              console.log('Server version is up to date:', offlineItem.name);
              syncResults.skipped++;
            }
          } else {
            // Item doesn't exist on server - create it
            const { error: insertError } = await supabase
              .from('shopping_items')
              .insert({ ...itemData, user_id: user.id });
            
            if (insertError) {
              console.error('Error creating item:', insertError);
              syncResults.errors++;
            } else {
              console.log('Created new server item:', offlineItem.name);
              syncResults.created++;
            }
          }
          
          // Small delay to avoid overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 200));
          
        } catch (itemError) {
          console.error('Error syncing item:', offlineItem.name, itemError);
          syncResults.errors++;
        }
      }

      console.log('Sync completed:', syncResults);

      // Clear offline storage after successful sync (if most items were processed successfully)
      if (syncResults.errors < storedOfflineItems.length / 2) {
        localStorage.removeItem(OFFLINE_KEY);
        setOfflineItems([]);
        localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
        console.log('Cleared offline storage after successful sync');
      }

      // Refresh the items list
      await queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      
      setSyncStatus('idle');
      
      if (syncResults.errors > 0) {
        console.warn(`Sync completed with ${syncResults.errors} errors out of ${storedOfflineItems.length} items`);
      } else {
        console.log(`Sync successful: ${syncResults.created} created, ${syncResults.updated} updated, ${syncResults.skipped} skipped`);
      }
      
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      // Retry sync after a delay if we're still online
      setTimeout(() => {
        if (navigator.onLine && syncStatus !== 'syncing') {
          console.log('Retrying sync after error...');
          syncOfflineData();
        }
      }, 10000); // Retry after 10 seconds
    }
  };

  // Create item mutation with enhanced offline support
  const createItemMutation = useMutation({
    mutationFn: async (newItem: Omit<ShoppingItem, 'id' | 'created_at' | 'updated_at' | 'user_id'>) => {
      const user = await getCurrentUser();
      
      const itemWithMetadata = {
        ...newItem,
        user_id: user?.id || '',
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      if (isOnline && user) {
        console.log('Creating item online:', itemWithMetadata.name);
        const { data, error } = await supabase
          .from('shopping_items')
          .insert(itemWithMetadata)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        console.log('Creating item offline:', itemWithMetadata.name);
        const currentOfflineItems = getOfflineItems();
        const updatedItems = [itemWithMetadata, ...currentOfflineItems];
        saveOfflineItems(updatedItems);
        return itemWithMetadata;
      }
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-items'] });
      const previousItems = queryClient.getQueryData(['shopping-items']) as ShoppingItem[] || [];

      const optimisticItem = {
        ...newItem,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: '',
      };

      const newItems = [optimisticItem, ...previousItems];
      queryClient.setQueryData(['shopping-items'], newItems);

      return { previousItems };
    },
    onError: (err, newItem, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shopping-items'], context.previousItems);
      }
      console.error('Create item error:', err);
    },
    onSuccess: () => {
      console.log('Item created successfully');
    },
    onSettled: () => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      }
    },
  });

  // Update item mutation with enhanced conflict resolution
  const updateItemMutation = useMutation({
    mutationFn: async (updatedItem: ShoppingItem) => {
      console.log('Updating item:', updatedItem.name, 'Online:', isOnline);
      
      const itemWithTimestamp = { 
        ...updatedItem, 
        updated_at: new Date().toISOString() 
      };
      
      if (isOnline) {
        const { user_id, ...updateData } = itemWithTimestamp;
        const { data, error } = await supabase
          .from('shopping_items')
          .update(updateData)
          .eq('id', updatedItem.id)
          .select()
          .single();
        
        if (error) throw error;
        return data;
      } else {
        // Update offline
        const currentOfflineItems = getOfflineItems();
        const index = currentOfflineItems.findIndex(item => item.id === updatedItem.id);
        
        if (index !== -1) {
          currentOfflineItems[index] = itemWithTimestamp;
        } else {
          // Item doesn't exist in offline storage, add it
          currentOfflineItems.unshift(itemWithTimestamp);
        }
        saveOfflineItems(currentOfflineItems);
        return itemWithTimestamp;
      }
    },
    onMutate: async (updatedItem) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-items'] });
      const previousItems = queryClient.getQueryData(['shopping-items']) as ShoppingItem[] || [];
      
      const updatedItems = previousItems.map(item => 
        item.id === updatedItem.id ? { ...updatedItem, updated_at: new Date().toISOString() } : item
      );
      queryClient.setQueryData(['shopping-items'], updatedItems);
      
      return { previousItems };
    },
    onError: (err, updatedItem, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shopping-items'], context.previousItems);
      }
      console.error('Update item error:', err);
    },
    onSettled: () => {
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
        // For offline deletion, remove from offline storage
        const currentOfflineItems = getOfflineItems();
        const filtered = currentOfflineItems.filter(item => item.id !== id);
        saveOfflineItems(filtered);
      }
      return id;
    },
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ queryKey: ['shopping-items'] });
      const previousItems = queryClient.getQueryData(['shopping-items']) as ShoppingItem[] || [];
      
      const filteredItems = previousItems.filter(item => item.id !== deletedId);
      queryClient.setQueryData(['shopping-items'], filteredItems);
      
      return { previousItems };
    },
    onError: (err, deletedId, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(['shopping-items'], context.previousItems);
      }
      console.error('Delete item error:', err);
    },
    onSuccess: (deletedId) => {
      if (!isOnline) {
        setOfflineItems(prev => prev.filter(item => item.id !== deletedId));
      }
    },
    onSettled: () => {
      if (isOnline) {
        queryClient.invalidateQueries({ queryKey: ['shopping-items'] });
      }
    },
  });

  // Combine online and offline items intelligently
  const allItems = (() => {
    if (isOnline) {
      return items || [];
    } else {
      // When offline, merge cached online items with offline items
      const cachedOnlineItems = queryClient.getQueryData(['shopping-items']) as ShoppingItem[] || [];
      const currentOfflineItems = offlineItems;
      
      // Create a map to avoid duplicates, preferring offline versions
      const itemMap = new Map<string, ShoppingItem>();
      
      // First add cached online items
      cachedOnlineItems.forEach(item => itemMap.set(item.id, item));
      
      // Then add/override with offline items (they're more recent)
      currentOfflineItems.forEach(item => itemMap.set(item.id, item));
      
      return Array.from(itemMap.values()).sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  })();

  return {
    items: allItems,
    isLoading: isOnline ? isLoading : false,
    error,
    isOnline,
    syncStatus,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    updateExchangeRates,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    // Expose sync function for manual triggering
    syncOfflineData,
  };
};
