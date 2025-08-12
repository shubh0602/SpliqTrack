interface BalanceOverviewProps {
  balances: {
    totalOwed: number;
    totalOwing: number;
    friendBalances: any[];
  };
}

export default function BalanceOverview({ balances }: BalanceOverviewProps) {
  const totalBalance = balances.totalOwing - balances.totalOwed;
  const settledFriends = balances.friendBalances.filter(fb => fb.balance === 0).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-dark-gradient p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">Total Balance</h3>
          <i className="fas fa-wallet text-cred-purple"></i>
        </div>
        <div className={`text-2xl font-bold ${
          totalBalance === 0 ? 'text-white' : 
          totalBalance > 0 ? 'text-green-400' : 'text-red-400'
        }`}>
          {totalBalance === 0 ? '$0.00' : 
           totalBalance > 0 ? `+$${totalBalance.toFixed(2)}` : 
           `$${Math.abs(totalBalance).toFixed(2)}`}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {totalBalance === 0 ? 'All settled up!' :
           totalBalance > 0 ? 'In your favor' : 'You owe'}
        </div>
      </div>
      
      <div className="bg-dark-gradient p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">You Owe</h3>
          <i className="fas fa-arrow-up text-red-400"></i>
        </div>
        <div className="text-2xl font-bold text-red-400">
          ${balances.totalOwed.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {balances.friendBalances.filter(fb => fb.balance < 0).length > 0 ? 
           `To ${balances.friendBalances.filter(fb => fb.balance < 0).length} friends` : 
           'No outstanding debts'}
        </div>
      </div>
      
      <div className="bg-dark-gradient p-6 rounded-2xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-gray-400 text-sm font-medium">You're Owed</h3>
          <i className="fas fa-arrow-down text-green-400"></i>
        </div>
        <div className="text-2xl font-bold text-green-400">
          ${balances.totalOwing.toFixed(2)}
        </div>
        <div className="text-sm text-gray-500 mt-1">
          {balances.friendBalances.filter(fb => fb.balance > 0).length > 0 ? 
           `From ${balances.friendBalances.filter(fb => fb.balance > 0).length} friends` : 
           'No money owed to you'}
        </div>
      </div>
    </div>
  );
}
