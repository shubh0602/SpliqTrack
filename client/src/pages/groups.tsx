import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import CreateGroupModal from "@/components/modals/create-group-modal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Groups() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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

  const { data: groups, isLoading: isGroupsLoading, error } = useQuery({
    queryKey: ["/api/groups"],
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

  const createGroupMutation = useMutation({
    mutationFn: async (groupData: { name: string; description: string }) => {
      await apiRequest("POST", "/api/groups", groupData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/groups"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Success",
        description: "Group created successfully!",
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
        description: "Failed to create group. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading || isGroupsLoading) {
    return (
      <div className="min-h-screen bg-cred-dark">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-700 rounded w-48 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-gray-800 rounded-2xl p-6 h-48"></div>
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

  const getGroupIcon = (index: number) => {
    const icons = [
      "fas fa-mountain",
      "fas fa-home", 
      "fas fa-briefcase",
      "fas fa-plane",
      "fas fa-users",
      "fas fa-heart"
    ];
    return icons[index % icons.length];
  };

  const getGroupGradient = (index: number) => {
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
            <h1 className="text-3xl font-bold mb-2">Your Groups</h1>
            <p className="text-gray-400">Manage your expense groups</p>
          </div>
          <Button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-cred-gradient hover:opacity-90 px-6 py-3 rounded-xl font-medium"
          >
            <i className="fas fa-plus mr-2"></i>Create Group
          </Button>
        </div>

        {/* Groups Grid */}
        {!groups || groups.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <i className="fas fa-users text-3xl text-gray-400"></i>
            </div>
            <h3 className="text-xl font-semibold mb-2">No groups yet</h3>
            <p className="text-gray-400 mb-6">Create your first group to start splitting expenses</p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-cred-gradient hover:opacity-90 px-8 py-3 rounded-xl font-medium"
            >
              <i className="fas fa-plus mr-2"></i>Create Your First Group
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group: any, index: number) => (
              <Card key={group.id} className="bg-dark-gradient border-gray-800 hover:bg-opacity-80 transition-all cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${getGroupGradient(index)} rounded-full flex items-center justify-center`}>
                      <i className={`${getGroupIcon(index)} text-white text-sm`}></i>
                    </div>
                    <Badge variant="secondary" className="bg-cred-light text-gray-300">
                      {group.members?.length || 0} members
                    </Badge>
                  </div>
                  <CardTitle className="text-white">{group.name}</CardTitle>
                  {group.description && (
                    <p className="text-sm text-gray-400">{group.description}</p>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="flex -space-x-2 mb-4">
                    {group.members?.slice(0, 4).map((member: any, memberIndex: number) => (
                      <div 
                        key={member.id} 
                        className={`w-8 h-8 bg-gradient-to-br ${getGroupGradient(memberIndex)} rounded-full border-2 border-cred-gray flex items-center justify-center`}
                      >
                        <span className="text-xs font-medium text-white">
                          {(member.user.firstName?.[0] || '') + (member.user.lastName?.[0] || '')}
                        </span>
                      </div>
                    ))}
                    {(group.members?.length || 0) > 4 && (
                      <div className="w-8 h-8 bg-gray-600 rounded-full border-2 border-cred-gray flex items-center justify-center">
                        <span className="text-xs text-white">+{(group.members?.length || 0) - 4}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-gray-400">
                      Created {new Date(group.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <CreateGroupModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={(data) => createGroupMutation.mutate({ ...data, description: data.description || "" })}
        isLoading={createGroupMutation.isPending}
      />

      <MobileNav />
    </div>
  );
}
