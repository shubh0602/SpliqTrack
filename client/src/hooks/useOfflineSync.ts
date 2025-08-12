import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface OfflineOperation {
  id: string;
  operation: "create" | "update" | "delete";
  entity: string;
  entityId: string;
  data: any;
  timestamp: number;
}

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingOperations, setPendingOperations] = useState<OfflineOperation[]>([]);
  const queryClient = useQueryClient();

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      syncPendingOperations();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Load pending operations from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('spliq_pending_operations');
    if (stored) {
      try {
        setPendingOperations(JSON.parse(stored));
      } catch (error) {
        console.error('Failed to parse pending operations:', error);
        localStorage.removeItem('spliq_pending_operations');
      }
    }
  }, []);

  // Save pending operations to localStorage
  useEffect(() => {
    localStorage.setItem('spliq_pending_operations', JSON.stringify(pendingOperations));
  }, [pendingOperations]);

  // Query for server sync status when online
  const { data: syncStatus } = useQuery({
    queryKey: ["/api/sync/status"],
    enabled: isOnline,
    refetchInterval: isOnline ? 30000 : false, // Check every 30 seconds when online
  });

  // Mutation to sync operations with server
  const syncMutation = useMutation({
    mutationFn: async (operations: OfflineOperation[]) => {
      return apiRequest("/api/sync/queue", {
        method: "POST",
        body: JSON.stringify({ operations }),
      });
    },
    onSuccess: (_, operations) => {
      // Remove synced operations from local storage
      setPendingOperations(prev => 
        prev.filter(op => !operations.some(syncOp => syncOp.id === op.id))
      );
      // Refresh relevant queries
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
    },
  });

  // Add operation to pending queue
  const addPendingOperation = (operation: Omit<OfflineOperation, 'id' | 'timestamp'>) => {
    const newOperation: OfflineOperation = {
      ...operation,
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    setPendingOperations(prev => [...prev, newOperation]);

    // If online, sync immediately
    if (isOnline && !syncMutation.isPending) {
      syncPendingOperations();
    }
  };

  // Sync all pending operations
  const syncPendingOperations = async () => {
    if (pendingOperations.length === 0 || !isOnline || syncMutation.isPending) {
      return;
    }

    try {
      await syncMutation.mutateAsync(pendingOperations);
    } catch (error) {
      console.error('Failed to sync operations:', error);
    }
  };

  // Enhanced API request that handles offline scenarios
  const offlineAwareRequest = async (url: string, options: RequestInit = {}) => {
    if (!isOnline) {
      // Queue the operation for later sync
      if (options.method && ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method)) {
        const operation = extractOperationFromRequest(url, options);
        if (operation) {
          addPendingOperation(operation);
          return { success: true, offline: true };
        }
      }
      throw new Error('No internet connection. Operation will be synced when online.');
    }

    return apiRequest(url, options);
  };

  // Extract operation details from API request
  const extractOperationFromRequest = (url: string, options: RequestInit): Omit<OfflineOperation, 'id' | 'timestamp'> | null => {
    try {
      const body = options.body ? JSON.parse(options.body as string) : {};
      
      if (url.includes('/api/expenses')) {
        return {
          operation: options.method === 'POST' ? 'create' : 
                    options.method === 'DELETE' ? 'delete' : 'update',
          entity: 'expense',
          entityId: body.id || 'pending',
          data: body,
        };
      }

      if (url.includes('/api/settlements')) {
        return {
          operation: 'create',
          entity: 'settlement',
          entityId: body.id || 'pending',
          data: body,
        };
      }

      return null;
    } catch (error) {
      console.error('Failed to extract operation from request:', error);
      return null;
    }
  };

  // Optimistic updates for offline operations
  const performOptimisticUpdate = (operation: OfflineOperation) => {
    switch (operation.entity) {
      case 'expense':
        if (operation.operation === 'create') {
          // Add temporary expense to cache
          queryClient.setQueryData(['/api/expenses'], (oldData: any) => {
            if (!oldData) return [{ ...operation.data, id: operation.id, pending: true }];
            return [{ ...operation.data, id: operation.id, pending: true }, ...oldData];
          });
        }
        break;

      case 'settlement':
        if (operation.operation === 'create') {
          queryClient.setQueryData(['/api/settlements'], (oldData: any) => {
            if (!oldData) return [{ ...operation.data, id: operation.id, pending: true }];
            return [{ ...operation.data, id: operation.id, pending: true }, ...oldData];
          });
        }
        break;
    }
  };

  return {
    isOnline,
    hasPendingOperations: pendingOperations.length > 0,
    pendingCount: pendingOperations.length,
    pendingOperations,
    addPendingOperation,
    syncPendingOperations,
    offlineAwareRequest,
    isSyncing: syncMutation.isPending,
    syncError: syncMutation.error,
  };
}