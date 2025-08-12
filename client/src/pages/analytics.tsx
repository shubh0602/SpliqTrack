import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "@/components/layout/navigation";
import MobileNav from "@/components/layout/mobile-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Users, 
  Calendar,
  CreditCard,
  PieChart as PieChartIcon,
  BarChart3,
  Download
} from "lucide-react";
import { Button } from "@/components/ui/button";

const COLORS = ['#8B5CF6', '#06D6A0', '#FFD166', '#F72585', '#4ECDC4', '#45B7D1'];

export default function Analytics() {
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const { user } = useAuth();

  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/analytics", selectedPeriod, selectedCurrency],
    queryParams: { period: selectedPeriod, currency: selectedCurrency },
  });

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cred-dark">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700 rounded w-64"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-80 bg-gray-800 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = analyticsData?.overview || {};
  const spendingTrend = analyticsData?.spendingTrend || [];
  const categoryBreakdown = analyticsData?.categoryBreakdown || [];
  const monthlyComparison = analyticsData?.monthlyComparison || [];
  const friendBalances = analyticsData?.friendBalances || [];

  const exportData = () => {
    const csvContent = [
      ["Category", "Amount", "Percentage"],
      ...categoryBreakdown.map((item: any) => [item.name, item.value, `${item.percentage}%`])
    ].map(row => row.join(",")).join("\n");
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense-analytics-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-cred-dark text-white">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 bg-cred-gradient bg-clip-text text-transparent">
              Spending Analytics
            </h1>
            <p className="text-gray-400">Deep insights into your expense patterns</p>
          </div>
          
          <div className="flex gap-4 mt-4 sm:mt-0">
            <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
              <SelectTrigger className="bg-cred-light border-gray-700 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cred-gray border-gray-700">
                <SelectItem value="USD" className="text-white">USD ($)</SelectItem>
                <SelectItem value="EUR" className="text-white">EUR (€)</SelectItem>
                <SelectItem value="GBP" className="text-white">GBP (£)</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="bg-cred-light border-gray-700 text-white w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-cred-gray border-gray-700">
                <SelectItem value="7" className="text-white">Last 7 days</SelectItem>
                <SelectItem value="30" className="text-white">Last 30 days</SelectItem>
                <SelectItem value="90" className="text-white">Last 3 months</SelectItem>
                <SelectItem value="365" className="text-white">Last year</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={exportData} 
              variant="outline" 
              className="border-cred-purple text-cred-purple hover:bg-cred-purple hover:text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-cred-purple to-purple-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-200">Total Spent</p>
                  <p className="text-2xl font-bold">${stats.totalSpent?.toFixed(2) || '0.00'}</p>
                  <div className="flex items-center mt-2">
                    {stats.spentChange >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-300 mr-1" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-300 mr-1" />
                    )}
                    <span className="text-sm">{Math.abs(stats.spentChange || 0)}% from last period</span>
                  </div>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-200">You Owe</p>
                  <p className="text-2xl font-bold">${stats.totalOwing?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-green-200 mt-2">
                    {stats.activeDebts || 0} active balances
                  </p>
                </div>
                <CreditCard className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-200">You're Owed</p>
                  <p className="text-2xl font-bold">${stats.totalOwed?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-blue-200 mt-2">
                    {stats.activeCredits || 0} pending settlements
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-500 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-200">Avg per Day</p>
                  <p className="text-2xl font-bold">${stats.avgPerDay?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-orange-200 mt-2">
                    Based on {selectedPeriod} day period
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <Tabs defaultValue="trends" className="space-y-6">
          <TabsList className="bg-cred-light border-gray-700">
            <TabsTrigger value="trends" className="data-[state=active]:bg-cred-purple">
              <BarChart3 className="w-4 h-4 mr-2" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="categories" className="data-[state=active]:bg-cred-purple">
              <PieChartIcon className="w-4 h-4 mr-2" />
              Categories
            </TabsTrigger>
            <TabsTrigger value="friends" className="data-[state=active]:bg-cred-purple">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </TabsTrigger>
          </TabsList>

          <TabsContent value="trends" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Spending Trend */}
              <Card className="bg-cred-gray border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-cred-purple" />
                    Spending Over Time
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={spendingTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#8B5CF6"
                        fill="url(#gradient)"
                        strokeWidth={2}
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Comparison */}
              <Card className="bg-cred-gray border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-green-400" />
                    Monthly Comparison
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyComparison}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="month" 
                        stroke="#9CA3AF"
                        fontSize={12}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                      <Bar dataKey="amount" fill="#10B981" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Pie Chart */}
              <Card className="bg-cred-gray border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5 text-blue-400" />
                    Spending by Category
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={categoryBreakdown}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({name, percentage}) => `${name}: ${percentage}%`}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {categoryBreakdown.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#FFFFFF'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Category List */}
              <Card className="bg-cred-gray border-gray-800">
                <CardHeader>
                  <CardTitle className="text-white">Category Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryBreakdown.map((category: any, index: number) => (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          ></div>
                          <span className="text-white font-medium">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">${category.value.toFixed(2)}</div>
                          <Badge variant="outline" className="border-gray-600 text-gray-400">
                            {category.percentage}%
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="friends" className="space-y-6">
            <Card className="bg-cred-gray border-gray-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Friend Balances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {friendBalances.map((friend: any) => (
                    <div key={friend.id} className="flex items-center justify-between p-4 bg-cred-light rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-cred-gradient rounded-full flex items-center justify-center">
                          <span className="font-medium text-white">
                            {friend.firstName[0]}{friend.lastName[0]}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {friend.firstName} {friend.lastName}
                          </div>
                          <div className="text-sm text-gray-400">
                            {friend.expenseCount} shared expenses
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        {friend.balance > 0 ? (
                          <div className="text-green-400 font-semibold">
                            +${Math.abs(friend.balance).toFixed(2)}
                            <div className="text-xs text-gray-400">owes you</div>
                          </div>
                        ) : friend.balance < 0 ? (
                          <div className="text-red-400 font-semibold">
                            -${Math.abs(friend.balance).toFixed(2)}
                            <div className="text-xs text-gray-400">you owe</div>
                          </div>
                        ) : (
                          <div className="text-gray-400 font-semibold">
                            $0.00
                            <div className="text-xs text-gray-400">settled up</div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Insights */}
        <Card className="bg-cred-gray border-gray-800 mt-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-yellow-400" />
              Smart Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.insights?.map((insight: string, index: number) => (
                <div key={index} className="p-4 bg-cred-light rounded-lg border-l-4 border-cred-purple">
                  <p className="text-white text-sm">{insight}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <MobileNav />
    </div>
  );
}