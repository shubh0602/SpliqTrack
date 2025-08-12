import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Amount must be a positive number",
  }),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  participants: z.array(z.string()).min(1, "At least one participant is required"),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

export default function AddExpenseModal({ isOpen, onClose, onSubmit, isLoading }: AddExpenseModalProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      categoryId: "",
      groupId: "",
      participants: user ? [user.id] : [],
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
    enabled: isOpen,
  });

  const { data: groups } = useQuery({
    queryKey: ["/api/groups"],
    enabled: isOpen,
  });

  const { data: friends } = useQuery({
    queryKey: ["/api/friends"],
    enabled: isOpen,
  });

  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: any) => {
      await apiRequest("POST", "/api/expenses", expenseData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
      form.reset();
      onClose();
      toast({
        title: "Success",
        description: "Expense added successfully!",
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
        description: "Failed to add expense. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: ExpenseForm) => {
    const amount = parseFloat(data.amount);
    const participantCount = data.participants.length;
    const amountPerPerson = amount / participantCount;

    const splits = data.participants.map((participantId) => ({
      userId: participantId,
      amount: amountPerPerson.toFixed(2),
    }));

    createExpenseMutation.mutate({
      description: data.description,
      amount: amount.toFixed(2),
      categoryId: data.categoryId || null,
      groupId: data.groupId || null,
      splitType: "equal",
      splits,
    });
  };

  const toggleParticipant = (participantId: string, checked: boolean) => {
    const currentParticipants = form.getValues("participants");
    if (checked) {
      form.setValue("participants", [...currentParticipants, participantId]);
    } else {
      form.setValue("participants", currentParticipants.filter(id => id !== participantId));
    }
  };

  useEffect(() => {
    if (user && isOpen) {
      form.setValue("participants", [user.id]);
    }
  }, [user, isOpen, form]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cred-gray border-gray-800 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add Expense</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="What was this expense for?"
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
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-400">$</span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className="bg-cred-light border-gray-700 text-white placeholder-gray-400 focus:border-cred-purple pl-8"
                        {...field}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-cred-light border-gray-700 text-white focus:border-cred-purple">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-cred-light border-gray-700">
                      {categories?.map((category: any) => (
                        <SelectItem key={category.id} value={category.id}>
                          <div className="flex items-center">
                            <i className={`${category.icon} mr-2`}></i>
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="groupId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Group (Optional)</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-cred-light border-gray-700 text-white focus:border-cred-purple">
                        <SelectValue placeholder="Select a group" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-cred-light border-gray-700">
                      {groups?.map((group: any) => (
                        <SelectItem key={group.id} value={group.id}>
                          {group.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="participants"
              render={() => (
                <FormItem>
                  <FormLabel>Split Between</FormLabel>
                  <div className="space-y-2">
                    {user && (
                      <div className="flex items-center space-x-3 p-3 bg-cred-light rounded-xl">
                        <Checkbox
                          checked={form.watch("participants").includes(user.id)}
                          onCheckedChange={(checked) => toggleParticipant(user.id, !!checked)}
                          className="border-gray-600"
                        />
                        <span>You ({user.firstName} {user.lastName})</span>
                      </div>
                    )}
                    {friends?.map((friendship: any) => {
                      const friend = friendship.friend;
                      return (
                        <div key={friend.id} className="flex items-center space-x-3 p-3 bg-cred-light rounded-xl">
                          <Checkbox
                            checked={form.watch("participants").includes(friend.id)}
                            onCheckedChange={(checked) => toggleParticipant(friend.id, !!checked)}
                            className="border-gray-600"
                          />
                          <span>{friend.firstName} {friend.lastName}</span>
                        </div>
                      );
                    })}
                  </div>
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
                disabled={createExpenseMutation.isPending}
              >
                {createExpenseMutation.isPending ? "Adding..." : "Add Expense"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
