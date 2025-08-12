import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import AddFriendModal from "@/components/modals/add-friend-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Friends() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: friends, isLoading: isFriendsLoading, error } = useQuery({
    queryKey: ["/api/friends"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: balances } = useQuery({
    queryKey: ["/api/balances"],
    enabled: isAuthenticated,
    retry: false,
  });

  useEffect(() => {
    if (error && isUnauthorizedError(error)) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
    }
  }, [error, toast]);

  const addFriendMutation = useMutation({
    mutationFn: async (friendData: { friendId: string }) => {
      await apiRequest("POST", "/api/friends", friendData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
      setIsAddModalOpen(false);
      toast({
        title: "Success",
        description: "Friend added successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add friend. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: async (friendId: string) => {
      await apiRequest("DELETE", `/api/friends/${friendId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/friends"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
      toast({
        title: "Success",
        description: "Friend removed successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to remove friend. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isFriendsLoading) {
    return (
      <div className="min-h-screen bg-cred-dark">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-6 h-32"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getFriendBalance = (friendId: string) => {
    const friendBalance = balances?.friendBalances?.find((fb: any) => fb.friend.id === friendId);
    return friendBalance?.balance || 0;
  };

  const getGradient = (index: number) => {
    const gradients = [
      "from-purple-500 to-pink-500",
      "from-blue-500 to-cyan-500", 
      "from-green-500 to-emerald-500",
      "from-orange-500 to-red-500",
      "from-indigo-500 to-purple-500",
      "from-teal-500 to-blue-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <div className="min-h-screen bg-cred-dark text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Your Friends</h1>
            <p className="text-gray-400">Manage your friends and view balances</p>
          </div>
          <Button 
            onClick={() => setIsAddModalOpen(true)}
            className="bg-cred-gradient hover:opacity-90 px-6 py-3 rounded-xl font-medium"
          >
            <i className="fas fa-user-plus mr-2"></i>Add Friend
          </Button>
        </div>

        {/* Friends Grid */}
        {!friends || friends.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-user-friends text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">No friends yet</h3>
            <p className="text-gray-400 mb-6">Add friends to start sharing expenses</p>
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-cred-gradient hover:opacity-90 px-8 py-3 rounded-xl font-medium"
            >
              <i className="fas fa-user-plus mr-2"></i>Add Your First Friend
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {friends.map((friendship: any, index: number) => {
              const friend = friendship.friend;
              const balance = getFriendBalance(friend.id);
              
              return (
                <Card key={friendship.id} className="bg-dark-gradient border-gray-800 hover:bg-opacity-80 transition-all">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`w-16 h-16 bg-gradient-to-br ${getGradient(index)} rounded-full flex items-center justify-center`}>
                        <span className="text-lg font-medium text-white">
                          {(friend.firstName?.[0] || '') + (friend.lastName?.[0] || '')}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-white">
                          {friend.firstName} {friend.lastName}
                        </div>
                        {friend.email && (
                          <div className="text-sm text-gray-400">{friend.email}</div>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFriendMutation.mutate(friend.id)}
                        disabled={removeFriendMutation.isPending}
                        className="text-gray-400 hover:text-red-400 hover:bg-red-400/10"
                      >
                        <i className="fas fa-trash text-sm"></i>
                      </Button>
                    </div>
                    
                    <div className="text-center pt-4 border-t border-gray-700">
                      {balance === 0 ? (
                        <>
                          <div className="text-lg font-bold text-gray-400">$0.00</div>
                          <div className="text-xs text-gray-500">settled up</div>
                        </>
                      ) : balance > 0 ? (
                        <>
                          <div className="text-lg font-bold text-green-400">+${balance.toFixed(2)}</div>
                          <div className="text-xs text-gray-500">owes you</div>
                        </>
                      ) : (
                        <>
                          <div className="text-lg font-bold text-red-400">${Math.abs(balance).toFixed(2)}</div>
                          <div className="text-xs text-gray-500">you owe</div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <AddFriendModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={(data) => addFriendMutation.mutate(data)}
        isLoading={addFriendMutation.isPending}
      />

      <MobileNav />
    </div>
  );
}
