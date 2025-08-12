import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const friendSchema = z.object({
  friendId: z.string().min(1, "Friend ID is required"),
});

type FriendForm = z.infer<typeof friendSchema>;

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FriendForm) => void;
  isLoading: boolean;
}

export default function AddFriendModal({ isOpen, onClose, onSubmit, isLoading }: AddFriendModalProps) {
  const form = useForm<FriendForm>({
    resolver: zodResolver(friendSchema),
    defaultValues: {
      friendId: "",
    },
  });

  const handleSubmit = (data: FriendForm) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cred-gray border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Friend</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="friendId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Friend's User ID</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your friend's user ID"
                      className="bg-cred-light border-gray-700 text-white placeholder-gray-400 focus:border-cred-purple"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                  <p className="text-xs text-gray-400 mt-1">
                    Ask your friend to share their user ID with you. You can find your ID in your profile settings.
                  </p>
                </FormItem>
              )}
            />
            
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-700 text-white hover:bg-gray-800"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-cred-gradient hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? "Adding..." : "Add Friend"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
