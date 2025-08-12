import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Minus, Upload, Camera, DollarSign, Users, Calculator } from "lucide-react";

const SUPPORTED_CURRENCIES = {
  USD: { name: "US Dollar", symbol: "$" },
  EUR: { name: "Euro", symbol: "€" },
  GBP: { name: "British Pound", symbol: "£" },
  JPY: { name: "Japanese Yen", symbol: "¥" },
  CAD: { name: "Canadian Dollar", symbol: "C$" },
  AUD: { name: "Australian Dollar", symbol: "A$" },
  INR: { name: "Indian Rupee", symbol: "₹" },
  SGD: { name: "Singapore Dollar", symbol: "S$" },
};

const expenseSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.string().min(1, "Amount is required"),
  currency: z.string().default("USD"),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  splitType: z.enum(["equal", "custom", "percentage", "shares"]).default("equal"),
  receiptUrl: z.string().optional(),
  splits: z.array(z.object({
    userId: z.string(),
    amount: z.string().optional(),
    percentage: z.string().optional(),
    shares: z.number().optional(),
  })),
});

type ExpenseForm = z.infer<typeof expenseSchema>;

interface EnhancedExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId?: string;
  participants?: Array<{ id: string; firstName: string; lastName: string }>;
}

export default function EnhancedExpenseModal({ 
  isOpen, 
  onClose, 
  groupId,
  participants = []
}: EnhancedExpenseModalProps) {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);
  const [splitPreviews, setSplitPreviews] = useState<Array<{ userId: string; amount: number; percentage: number }>>([]);
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: friends } = useQuery({
    queryKey: ["/api/friends"],
  });

  const allParticipants = participants.length > 0 ? participants : friends || [];

  const form = useForm<ExpenseForm>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      currency: "USD",
      splitType: "equal",
      groupId: groupId || "",
      splits: allParticipants.map(p => ({ userId: p.id, amount: "0", percentage: "0", shares: 1 })),
    },
  });

  const splitType = form.watch("splitType");
  const amount = parseFloat(form.watch("amount") || "0");

  // Calculate split previews when amount or split type changes
  useEffect(() => {
    if (amount > 0 && allParticipants.length > 0) {
      const splits = form.getValues("splits");
      calculateSplitPreviews(amount, splitType, splits);
    }
  }, [amount, splitType, allParticipants.length]);

  const calculateSplitPreviews = (
    totalAmount: number, 
    type: string, 
    splits: any[]
  ) => {
    let previews: Array<{ userId: string; amount: number; percentage: number }> = [];

    switch (type) {
      case "equal":
        const equalAmount = totalAmount / allParticipants.length;
        previews = allParticipants.map(p => ({
          userId: p.id,
          amount: equalAmount,
          percentage: 100 / allParticipants.length,
        }));
        break;

      case "custom":
        previews = splits.map(split => ({
          userId: split.userId,
          amount: parseFloat(split.amount || "0"),
          percentage: (parseFloat(split.amount || "0") / totalAmount) * 100,
        }));
        break;

      case "percentage":
        previews = splits.map(split => {
          const percentage = parseFloat(split.percentage || "0");
          return {
            userId: split.userId,
            amount: (totalAmount * percentage) / 100,
            percentage,
          };
        });
        break;

      case "shares":
        const totalShares = splits.reduce((sum, split) => sum + (split.shares || 1), 0);
        previews = splits.map(split => {
          const shares = split.shares || 1;
          const percentage = (shares / totalShares) * 100;
          return {
            userId: split.userId,
            amount: (totalAmount * shares) / totalShares,
            percentage,
          };
        });
        break;
    }

    setSplitPreviews(previews);
  };

  const createExpenseMutation = useMutation({
    mutationFn: async (data: ExpenseForm) => {
      // Process OCR data if receipt was uploaded
      let ocrData = null;
      if (receiptFile) {
        ocrData = await processReceiptOCR(receiptFile);
      }

      return apiRequest("/api/expenses", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          ocrData,
          splits: splitPreviews.map(preview => ({
            userId: preview.userId,
            amount: preview.amount.toFixed(2),
            percentage: preview.percentage.toFixed(2),
            shares: splitType === "shares" ? form.getValues("splits").find(s => s.userId === preview.userId)?.shares : undefined,
          })),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/balances"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      form.reset();
      setReceiptFile(null);
      setSplitPreviews([]);
      onClose();
    },
  });

  const processReceiptOCR = async (file: File) => {
    setOcrProcessing(true);
    try {
      // This would integrate with an OCR service like Google Vision API
      // For now, we'll return mock data
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
      
      return {
        extractedText: "Sample receipt text",
        detectedAmount: amount,
        detectedDate: new Date().toISOString(),
        confidence: 0.95,
      };
    } catch (error) {
      console.error("OCR processing failed:", error);
      return null;
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setReceiptFile(file);
    }
  };

  const adjustSplitValue = (userId: string, field: string, delta: number) => {
    const splits = form.getValues("splits");
    const updatedSplits = splits.map(split => {
      if (split.userId === userId) {
        const currentValue = parseFloat(split[field as keyof typeof split] as string || "0");
        const newValue = Math.max(0, currentValue + delta);
        return { ...split, [field]: newValue.toString() };
      }
      return split;
    });
    form.setValue("splits", updatedSplits);
    calculateSplitPreviews(amount, splitType, updatedSplits);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-cred-gray border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-cred-gradient bg-clip-text text-transparent flex items-center gap-2">
            <DollarSign className="w-6 h-6" />
            Add New Expense
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => createExpenseMutation.mutate(data))} className="space-y-6">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="bg-cred-light border-gray-700">
                <TabsTrigger value="basic" className="data-[state=active]:bg-cred-purple">Basic Info</TabsTrigger>
                <TabsTrigger value="splits" className="data-[state=active]:bg-cred-purple">Split Details</TabsTrigger>
                <TabsTrigger value="receipt" className="data-[state=active]:bg-cred-purple">Receipt</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Dinner at restaurant"
                            className="bg-cred-light border-gray-700 text-white placeholder-gray-400"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              className="bg-cred-light border-gray-700 text-white"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="currency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Currency</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="bg-cred-light border-gray-700 text-white">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-cred-gray border-gray-700">
                              {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                                <SelectItem key={code} value={code} className="text-white hover:bg-gray-700">
                                  {info.symbol} {code} - {info.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-cred-light border-gray-700 text-white">
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-cred-gray border-gray-700">
                          {categories?.map((category: any) => (
                            <SelectItem key={category.id} value={category.id} className="text-white hover:bg-gray-700">
                              <i className={category.icon}></i> {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="splits" className="space-y-4 mt-6">
                <FormField
                  control={form.control}
                  name="splitType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Split Method
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="bg-cred-light border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="bg-cred-gray border-gray-700">
                          <SelectItem value="equal" className="text-white hover:bg-gray-700">
                            Equal Split - Everyone pays the same amount
                          </SelectItem>
                          <SelectItem value="custom" className="text-white hover:bg-gray-700">
                            Custom Amount - Set exact amounts for each person
                          </SelectItem>
                          <SelectItem value="percentage" className="text-white hover:bg-gray-700">
                            Percentage - Set percentage for each person
                          </SelectItem>
                          <SelectItem value="shares" className="text-white hover:bg-gray-700">
                            Shares - Proportional based on shares
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                {allParticipants.length > 0 && (
                  <Card className="bg-cred-light border-gray-700">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-white">Split Preview</h4>
                          <Badge variant="outline" className="border-cred-purple text-cred-purple">
                            Total: {SUPPORTED_CURRENCIES[form.watch("currency") as keyof typeof SUPPORTED_CURRENCIES]?.symbol}{amount.toFixed(2)}
                          </Badge>
                        </div>
                        
                        {allParticipants.map((participant, index) => {
                          const preview = splitPreviews.find(p => p.userId === participant.id);
                          return (
                            <div key={participant.id} className="flex items-center justify-between p-3 bg-cred-gray rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-cred-gradient rounded-full flex items-center justify-center">
                                  <span className="text-xs font-medium">
                                    {participant.firstName[0]}{participant.lastName[0]}
                                  </span>
                                </div>
                                <span className="font-medium">{participant.firstName} {participant.lastName}</span>
                              </div>

                              <div className="flex items-center gap-2">
                                {splitType !== "equal" && (
                                  <div className="flex items-center gap-1">
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="w-6 h-6 p-0"
                                      onClick={() => {
                                        const field = splitType === "shares" ? "shares" : 
                                                     splitType === "percentage" ? "percentage" : "amount";
                                        adjustSplitValue(participant.id, field, -1);
                                      }}
                                    >
                                      <Minus className="w-3 h-3" />
                                    </Button>
                                    
                                    <Input
                                      type="number"
                                      step={splitType === "percentage" ? "0.1" : "0.01"}
                                      className="w-20 text-center bg-cred-dark border-gray-600"
                                      value={
                                        splitType === "shares" ? 
                                          form.watch("splits")[index]?.shares || 1 :
                                        splitType === "percentage" ? 
                                          form.watch("splits")[index]?.percentage || "0" :
                                          form.watch("splits")[index]?.amount || "0"
                                      }
                                      onChange={(e) => {
                                        const field = splitType === "shares" ? "shares" : 
                                                     splitType === "percentage" ? "percentage" : "amount";
                                        const splits = form.getValues("splits");
                                        splits[index] = { ...splits[index], [field]: e.target.value };
                                        form.setValue("splits", splits);
                                        calculateSplitPreviews(amount, splitType, splits);
                                      }}
                                    />
                                    
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      className="w-6 h-6 p-0"
                                      onClick={() => {
                                        const field = splitType === "shares" ? "shares" : 
                                                     splitType === "percentage" ? "percentage" : "amount";
                                        adjustSplitValue(participant.id, field, 1);
                                      }}
                                    >
                                      <Plus className="w-3 h-3" />
                                    </Button>
                                  </div>
                                )}

                                <div className="text-right">
                                  <div className="font-semibold text-green-400">
                                    {SUPPORTED_CURRENCIES[form.watch("currency") as keyof typeof SUPPORTED_CURRENCIES]?.symbol}{preview?.amount.toFixed(2) || "0.00"}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    {preview?.percentage.toFixed(1) || "0"}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="receipt" className="space-y-4 mt-6">
                <div className="space-y-4">
                  <div className="text-center p-8 border-2 border-dashed border-gray-600 rounded-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleReceiptUpload}
                      className="hidden"
                      id="receipt-upload"
                    />
                    <label htmlFor="receipt-upload" className="cursor-pointer">
                      <div className="flex flex-col items-center gap-4">
                        {receiptFile ? (
                          <div className="text-green-400">
                            <Upload className="w-8 h-8 mx-auto mb-2" />
                            <p>Receipt uploaded: {receiptFile.name}</p>
                            {ocrProcessing && (
                              <div className="mt-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-cred-purple mx-auto"></div>
                                <p className="text-sm text-gray-400 mt-1">Processing with OCR...</p>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <Camera className="w-8 h-8 mx-auto mb-2" />
                            <p>Upload receipt for automatic expense detection</p>
                            <p className="text-sm">Supports JPG, PNG formats</p>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-between gap-4 pt-4 border-t border-gray-700">
              <Button
                type="button"
                variant="outline"
                className="border-gray-700 text-white hover:bg-gray-800"
                onClick={onClose}
                disabled={createExpenseMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cred-gradient hover:opacity-90"
                disabled={createExpenseMutation.isPending || amount === 0}
              >
                {createExpenseMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Creating...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Calculator className="w-4 h-4" />
                    Create Expense
                  </div>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}