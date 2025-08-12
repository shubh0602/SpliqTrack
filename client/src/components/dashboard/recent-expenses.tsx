import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RecentExpensesProps {
  expenses: any[];
}

export default function RecentExpenses({ expenses }: RecentExpensesProps) {
  const getCategoryIcon = (category: any) => {
    return category?.icon || "fas fa-receipt";
  };

  const getCategoryColor = (category: any) => {
    const colorMap: { [key: string]: string } = {
      orange: "bg-orange-500",
      blue: "bg-blue-500", 
      purple: "bg-purple-500",
      pink: "bg-pink-500",
      green: "bg-green-500",
      cyan: "bg-cyan-500",
      gray: "bg-gray-500"
    };
    return colorMap[category?.color] || "bg-gray-500";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "Today";
    if (diffDays === 2) return "Yesterday";
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="bg-dark-gradient border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white">Recent Expenses</CardTitle>
          <Button variant="link" className="text-cred-purple hover:text-cred-blue">
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!expenses || expenses.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-receipt text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-400">No expenses yet</p>
            <p className="text-sm text-gray-500 mt-1">Add your first expense to get started</p>
          </div>
        ) : (
          <div className="space-y-4">
            {expenses.slice(0, 5).map((expense, index) => {
              const userSplit = expense.splits?.find((split: any) => split.user);
              const userOwes = userSplit ? parseFloat(userSplit.amount) : 0;
              const isPayer = expense.payer?.id;
              
              return (
                <div 
                  key={expense.id || index} 
                  className="flex items-center justify-between p-4 bg-cred-gray rounded-xl hover:bg-opacity-80 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${getCategoryColor(expense.category)} rounded-xl flex items-center justify-center`}>
                      <i className={`${getCategoryIcon(expense.category)} text-white`}></i>
                    </div>
                    <div>
                      <div className="font-medium text-white">{expense.description}</div>
                      <div className="text-sm text-gray-400">
                        {expense.group?.name || "Personal"}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(expense.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-white">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </div>
                    <div className={`text-sm ${isPayer ? 'text-green-400' : 'text-red-400'}`}>
                      {isPayer ? `You paid` : `You owe $${userOwes.toFixed(2)}`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
