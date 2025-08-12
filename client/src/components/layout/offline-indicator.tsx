import { useOfflineSync } from "@/hooks/useOfflineSync";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Wifi, WifiOff, RotateCcw, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function OfflineIndicator() {
  const {
    isOnline,
    hasPendingOperations,
    pendingCount,
    syncPendingOperations,
    isSyncing,
    syncError
  } = useOfflineSync();

  if (isOnline && !hasPendingOperations) {
    return null; // Don't show anything when online and synced
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="bg-cred-gray border-gray-800 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            {/* Connection Status */}
            <div className="flex items-center gap-2">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-green-400" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-400" />
              )}
              <span className={`text-sm font-medium ${isOnline ? 'text-green-400' : 'text-red-400'}`}>
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>

            {/* Pending Operations */}
            {hasPendingOperations && (
              <>
                <Badge 
                  variant="outline" 
                  className="border-yellow-500 text-yellow-400 bg-yellow-500/10"
                >
                  {pendingCount} pending
                </Badge>
                
                {isOnline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncPendingOperations}
                    disabled={isSyncing}
                    className="border-cred-purple text-cred-purple hover:bg-cred-purple hover:text-white"
                  >
                    {isSyncing ? (
                      <div className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3 animate-spin" />
                        Syncing...
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <RotateCcw className="w-3 h-3" />
                        Sync Now
                      </div>
                    )}
                  </Button>
                )}
              </>
            )}

            {/* Sync Error */}
            {syncError && (
              <div className="flex items-center gap-1 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs">Sync failed</span>
              </div>
            )}
          </div>

          {/* Offline Message */}
          {!isOnline && (
            <div className="mt-2 text-xs text-gray-400">
              Changes will sync when you're back online
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}