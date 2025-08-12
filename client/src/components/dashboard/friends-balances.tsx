import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FriendsBalancesProps {
  friendBalances: Array<{
    friend: any;
    balance: number;
  }>;
}

export default function FriendsBalances({ friendBalances }: FriendsBalancesProps) {
  const getGradient = (index: number) => {
    const gradients = [
      "bg-gradient-to-br from-purple-500 to-pink-500",
      "bg-gradient-to-br from-blue-500 to-cyan-500", 
      "bg-gradient-to-br from-green-500 to-emerald-500",
      "bg-gradient-to-br from-orange-500 to-red-500",
      "bg-gradient-to-br from-indigo-500 to-purple-500",
      "bg-gradient-to-br from-teal-500 to-blue-500"
    ];
    return gradients[index % gradients.length];
  };

  return (
    <Card className="mt-8 bg-dark-gradient border-gray-800">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-bold text-white">Friends & Balances</CardTitle>
          <Button variant="link" className="text-cred-purple hover:text-cred-blue">
            <i className="fas fa-user-plus mr-2"></i>Add Friend
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!friendBalances || friendBalances.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-800 rounded-xl flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-user-friends text-2xl text-gray-400"></i>
            </div>
            <p className="text-gray-400">No friends yet</p>
            <p className="text-sm text-gray-500 mt-1">Add friends to start sharing expenses</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {friendBalances.slice(0, 6).map((friendBalance, index) => (
              <div 
                key={friendBalance.friend.id} 
                className="p-4 bg-cred-gray rounded-xl hover:bg-opacity-80 transition-all cursor-pointer"
              >
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`w-12 h-12 ${getGradient(index)} rounded-full flex items-center justify-center`}>
                    <span className="font-medium text-white">
                      {(friendBalance.friend.firstName?.[0] || '') + (friendBalance.friend.lastName?.[0] || '')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-white">
                      {friendBalance.friend.firstName} {friendBalance.friend.lastName}
                    </div>
                    <div className="text-sm text-gray-400">
                      {friendBalance.friend.email}
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  {friendBalance.balance === 0 ? (
                    <>
                      <div className="text-lg font-bold text-gray-400">$0.00</div>
                      <div className="text-xs text-gray-500">settled up</div>
                    </>
                  ) : friendBalance.balance > 0 ? (
                    <>
                      <div className="text-lg font-bold text-green-400">
                        +${friendBalance.balance.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">owes you</div>
                    </>
                  ) : (
                    <>
                      <div className="text-lg font-bold text-red-400">
                        ${Math.abs(friendBalance.balance).toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">you owe</div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
