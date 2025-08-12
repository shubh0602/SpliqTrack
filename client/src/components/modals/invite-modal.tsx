import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Copy, 
  Share2, 
  Users, 
  Clock, 
  ExternalLink,
  QrCode,
  Mail,
  MessageCircle
} from "lucide-react";

const inviteSchema = z.object({
  inviteType: z.enum(["friend", "group", "expense"]),
  targetId: z.string().optional(),
  maxUses: z.number().min(1).max(100).default(1),
  expiresInHours: z.number().min(1).max(168).default(168), // 1 week default
});

type InviteForm = z.infer<typeof inviteSchema>;

interface InviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  inviteType?: "friend" | "group" | "expense";
  targetId?: string;
  targetName?: string;
}

export default function InviteModal({ 
  isOpen, 
  onClose, 
  inviteType = "friend",
  targetId,
  targetName 
}: InviteModalProps) {
  const [generatedLink, setGeneratedLink] = useState<string>("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InviteForm>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      inviteType,
      targetId,
      maxUses: 1,
      expiresInHours: 168,
    },
  });

  const createInviteMutation = useMutation({
    mutationFn: async (data: InviteForm) => {
      return apiRequest("/api/invitations", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: (data) => {
      const shareUrl = `${window.location.origin}/invite/${data.inviteCode}`;
      setGeneratedLink(shareUrl);
      
      // Generate QR code URL (using a free QR service)
      const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(shareUrl)}`;
      setQrCodeUrl(qrUrl);
      
      queryClient.invalidateQueries({ queryKey: ["/api/invitations"] });
      
      toast({
        title: "Invitation created!",
        description: "Share the link to invite others to join.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create invitation",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard!",
        description: "Share this link with others.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join me on Spliq!`,
          text: `I'd like to invite you to join ${targetName ? `"${targetName}"` : "my group"} on Spliq for expense sharing.`,
          url: generatedLink,
        });
      } catch (error) {
        console.log("Share cancelled or failed");
      }
    } else {
      copyToClipboard(generatedLink);
    }
  };

  const getInviteTypeDescription = () => {
    switch (form.watch("inviteType")) {
      case "friend":
        return "Invite someone to become your friend on Spliq";
      case "group":
        return `Invite someone to join the group "${targetName}"`;
      case "expense":
        return `Invite someone to contribute to the expense "${targetName}"`;
      default:
        return "Create an invitation link";
    }
  };

  const getExpiryDescription = (hours: number) => {
    if (hours <= 24) return `${hours} hour${hours > 1 ? 's' : ''}`;
    const days = Math.floor(hours / 24);
    return `${days} day${days > 1 ? 's' : ''}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cred-gray border-gray-800 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-cred-gradient bg-clip-text text-transparent flex items-center gap-2">
            <Share2 className="w-6 h-6" />
            Create Invitation
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="create" className="w-full">
          <TabsList className="bg-cred-light border-gray-700">
            <TabsTrigger value="create" className="data-[state=active]:bg-cred-purple">
              Create Invite
            </TabsTrigger>
            {generatedLink && (
              <TabsTrigger value="share" className="data-[state=active]:bg-cred-purple">
                Share Link
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="create" className="space-y-6 mt-6">
            <Card className="bg-cred-light border-gray-700">
              <CardContent className="p-4">
                <p className="text-gray-300 text-sm">{getInviteTypeDescription()}</p>
              </CardContent>
            </Card>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => createInviteMutation.mutate(data))}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="inviteType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invitation Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-cred-light border-gray-700 text-white">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-cred-gray border-gray-700">
                            <SelectItem value="friend" className="text-white hover:bg-gray-700">
                              Friend Invitation
                            </SelectItem>
                            <SelectItem value="group" className="text-white hover:bg-gray-700">
                              Group Invitation
                            </SelectItem>
                            <SelectItem value="expense" className="text-white hover:bg-gray-700">
                              Expense Contribution
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="maxUses"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maximum Uses</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            max="100"
                            className="bg-cred-light border-gray-700 text-white"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="expiresInHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Expires In
                      </FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(parseInt(value))}
                        defaultValue={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger className="bg-cred-light border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-cred-gray border-gray-700">
                          <SelectItem value="1" className="text-white hover:bg-gray-700">1 Hour</SelectItem>
                          <SelectItem value="6" className="text-white hover:bg-gray-700">6 Hours</SelectItem>
                          <SelectItem value="24" className="text-white hover:bg-gray-700">1 Day</SelectItem>
                          <SelectItem value="72" className="text-white hover:bg-gray-700">3 Days</SelectItem>
                          <SelectItem value="168" className="text-white hover:bg-gray-700">1 Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className="flex justify-between gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    className="border-gray-700 text-white hover:bg-gray-800"
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="bg-cred-gradient hover:opacity-90"
                    disabled={createInviteMutation.isPending}
                  >
                    {createInviteMutation.isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Share2 className="w-4 h-4" />
                        Create Invitation
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          {generatedLink && (
            <TabsContent value="share" className="space-y-6 mt-6">
              <Card className="bg-cred-light border-gray-700">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-white">Invitation Link</h3>
                    <div className="flex gap-1">
                      <Badge variant="outline" className="border-green-500 text-green-400">
                        <Users className="w-3 h-3 mr-1" />
                        {form.watch("maxUses")} use{form.watch("maxUses") > 1 ? 's' : ''}
                      </Badge>
                      <Badge variant="outline" className="border-blue-500 text-blue-400">
                        <Clock className="w-3 h-3 mr-1" />
                        {getExpiryDescription(form.watch("expiresInHours"))}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-cred-gray rounded-lg">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="bg-transparent border-0 text-white font-mono text-sm"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(generatedLink)}
                      className="border-gray-600 hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  {qrCodeUrl && (
                    <div className="flex flex-col items-center gap-4">
                      <div className="text-center">
                        <h4 className="font-medium text-white mb-2">QR Code</h4>
                        <div className="bg-white p-2 rounded-lg inline-block">
                          <img src={qrCodeUrl} alt="QR Code" className="w-32 h-32" />
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <Button
                      variant="outline"
                      onClick={shareViaWebShare}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open(`mailto:?subject=Join me on Spliq!&body=I'd like to invite you to join me on Spliq for expense sharing: ${generatedLink}`)}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Email
                    </Button>
                    
                    <Button
                      variant="outline"
                      onClick={() => window.open(generatedLink, '_blank')}
                      className="border-gray-600 text-white hover:bg-gray-700"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}