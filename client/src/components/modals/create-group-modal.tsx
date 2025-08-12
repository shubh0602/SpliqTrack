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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const groupSchema = z.object({
  name: z.string().min(1, "Group name is required"),
  description: z.string().transform(val => val || ""),
});

type GroupForm = z.infer<typeof groupSchema>;

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: GroupForm) => void;
  isLoading: boolean;
}

export default function CreateGroupModal({ isOpen, onClose, onSubmit, isLoading }: CreateGroupModalProps) {
  const form = useForm<GroupForm>({
    resolver: zodResolver(groupSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const handleSubmit = (data: GroupForm) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cred-gray border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create Group</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Weekend Trip, Roommates, Work Lunch"
                      className="bg-cred-light border-gray-700 text-white placeholder-gray-400 focus:border-cred-purple"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add a description for your group..."
                      className="bg-cred-light border-gray-700 text-white placeholder-gray-400 focus:border-cred-purple resize-none"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
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
                {isLoading ? "Creating..." : "Create Group"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
