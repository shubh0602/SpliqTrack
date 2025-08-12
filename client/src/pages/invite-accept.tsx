import { useState, useEffect } from "react";
import { useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  UserPlus, 
  Users, 
  Clock, 
  Shield, 
  CheckCircle,
  AlertCircle,
  ExternalLink
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const guestRegistrationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional(),
});

type GuestRegistrationForm = z.infer<typeof guestRegistrationSchema>;

export default function InviteAccept() {
  const [, params] = useRoute("/invite/:inviteCode");
  const inviteCode = params?.inviteCode;
  const [acceptanceMethod, setAcceptanceMethod] = useState<"existing" | "guest" | "google">("existing");
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  const form = useForm<GuestRegistrationForm>({
    resolver: zodResolver(guestRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
    },
  });

  // Fetch invitation details
  const { data: invitation, isLoading, error } = useQuery({
    queryKey: ["/api/invitations", inviteCode],
    queryParams: { code: inviteCode },
    enabled: !!inviteCode,
  });

  // Accept invitation mutation
  const acceptInviteMutation = useMutation({
    mutationFn: async (data?: GuestRegistrationForm) => {
      const requestData: any = { inviteCode };
      
      if (acceptanceMethod === "guest" && data) {
        requestData.guestRegistration = data;
      }
      
      return apiRequest("/api/invitations/accept", {
        method: "POST",
        body: JSON.stringify(requestData),
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Invitation accepted!",
        description: data.message || "Welcome to Spliq!",
      });
      
      // Redirect based on invitation type
      setTimeout(() => {
        if (data.redirectTo) {
          window.location.href = data.redirectTo;
        } else {
          window.location.href = "/";
        }
      }, 1500);
    },
    onError: (error: any) => {
      toast({
        title: "Failed to accept invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGoogleSignIn = () => {
    // Store invite code in session storage for after authentication
    sessionStorage.setItem('pendingInviteCode', inviteCode || '');
    window.location.href = '/api/login';
  };

  const getInvitationTypeIcon = (type: string) => {
    switch (type) {
      case "friend": return <UserPlus className="w-6 h-6" />;
      case "group": return <Users className="w-6 h-6" />;
      case "expense": return <Clock className="w-6 h-6" />;
      default: return <UserPlus className="w-6 h-6" />;
    }
  };

  const getInvitationDescription = (invitation: any) => {
    const inviterName = `${invitation.inviter?.firstName || ''} ${invitation.inviter?.lastName || ''}`.trim();
    
    switch (invitation.invitation.inviteType) {
      case "friend":
        return `${inviterName} wants to connect with you on Spliq`;
      case "group":
        const groupName = invitation.invitation.metadata?.groupName || "a group";
        return `${inviterName} has invited you to join "${groupName}"`;
      case "expense":
        const expenseName = invitation.invitation.metadata?.expenseName || "an expense";
        return `${inviterName} wants you to contribute to "${expenseName}"`;
      default:
        return `${inviterName} has sent you an invitation`;
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-cred-dark text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cred-purple mx-auto mb-4"></div>
          <p className="text-gray-400">Loading invitation...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-cred-dark text-white flex items-center justify-center p-4">
        <Card className="bg-cred-gray border-gray-800 max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Invalid Invitation</h2>
            <p className="text-gray-400 mb-6">
              This invitation link is invalid, expired, or has been used up.
            </p>
            <Button 
              onClick={() => window.location.href = "/"}
              className="bg-cred-gradient hover:opacity-90"
            >
              Go to Spliq
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If user is already authenticated, show quick accept
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-cred-dark text-white flex items-center justify-center p-4">
        <Card className="bg-cred-gray border-gray-800 max-w-lg w-full">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-cred-gradient rounded-full flex items-center justify-center mx-auto mb-4">
              {getInvitationTypeIcon(invitation.invitation.inviteType)}
            </div>
            <CardTitle className="text-2xl font-bold">
              You're Invited!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-4">{getInvitationDescription(invitation)}</p>
              
              <div className="flex justify-center gap-2 mb-4">
                <Badge variant="outline" className="border-green-500 text-green-400">
                  {invitation.invitation.usedCount}/{invitation.invitation.maxUses} uses
                </Badge>
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  Expires {new Date(invitation.invitation.expiresAt).toLocaleDateString()}
                </Badge>
              </div>
            </div>

            <Separator className="bg-gray-700" />

            <div className="text-center space-y-4">
              <p className="text-gray-400">
                Signed in as <span className="text-white font-medium">
                  {user?.firstName} {user?.lastName}
                </span>
              </p>
              
              <Button
                onClick={() => acceptInviteMutation.mutate()}
                disabled={acceptInviteMutation.isPending}
                className="w-full bg-cred-gradient hover:opacity-90"
                size="lg"
              >
                {acceptInviteMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Accepting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Accept Invitation
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show sign up options for unauthenticated users
  return (
    <div className="min-h-screen bg-cred-dark text-white flex items-center justify-center p-4">
      <Card className="bg-cred-gray border-gray-800 max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-cred-gradient rounded-full flex items-center justify-center mx-auto mb-4">
            {getInvitationTypeIcon(invitation.invitation.inviteType)}
          </div>
          <CardTitle className="text-2xl font-bold">Join Spliq</CardTitle>
          <p className="text-gray-400">{getInvitationDescription(invitation)}</p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="flex justify-center gap-2 mb-6">
            <Badge variant="outline" className="border-green-500 text-green-400">
              {invitation.invitation.usedCount}/{invitation.invitation.maxUses} uses
            </Badge>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              Expires {new Date(invitation.invitation.expiresAt).toLocaleDateString()}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Sign In Option */}
            <Card className="bg-cred-light border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                  onClick={() => setAcceptanceMethod("google")}>
              <CardContent className="p-6 text-center">
                <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Sign in with Google</h3>
                <p className="text-sm text-gray-400">
                  Use your Google account for secure access
                </p>
                {acceptanceMethod === "google" && (
                  <Button
                    onClick={handleGoogleSignIn}
                    className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Continue with Google
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Guest Registration Option */}
            <Card className="bg-cred-light border-gray-700 hover:border-gray-600 cursor-pointer transition-colors"
                  onClick={() => setAcceptanceMethod("guest")}>
              <CardContent className="p-6 text-center">
                <UserPlus className="w-8 h-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Join as Guest</h3>
                <p className="text-sm text-gray-400">
                  Quick join with just your name
                </p>
                {acceptanceMethod === "guest" && (
                  <Form {...form}>
                    <form
                      onSubmit={form.handleSubmit((data) => acceptInviteMutation.mutate(data))}
                      className="space-y-4 mt-4"
                    >
                      <div className="grid grid-cols-2 gap-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="First name"
                                  className="bg-cred-gray border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <Input
                                  placeholder="Last name"
                                  className="bg-cred-gray border-gray-600 text-white"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="Email (optional)"
                                className="bg-cred-gray border-gray-600 text-white"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button
                        type="submit"
                        disabled={acceptInviteMutation.isPending}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {acceptInviteMutation.isPending ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Joining...
                          </div>
                        ) : (
                          "Join as Guest"
                        )}
                      </Button>
                    </form>
                  </Form>
                )}
              </CardContent>
            </Card>
          </div>

          <Separator className="bg-gray-700" />

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">
              Already have an account?
            </p>
            <Button
              variant="outline"
              onClick={() => {
                sessionStorage.setItem('pendingInviteCode', inviteCode || '');
                window.location.href = '/api/login';
              }}
              className="border-gray-600 text-white hover:bg-gray-700"
            >
              Sign In
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}