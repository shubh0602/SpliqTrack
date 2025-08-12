import { db } from "../db";
import { analytics, expenses, expenseSplits, expenseCategories, users, friendships } from "@shared/schema";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { currencyService } from "./currencyService";

export class AnalyticsService {
  // Generate analytics for a user over a specific period
  async generateUserAnalytics(
    userId: string,
    periodDays: number = 30,
    targetCurrency: string = "USD"
  ) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - periodDays);

    // Get user's expenses in the period
    const userExpenses = await db
      .select({
        expense: expenses,
        split: expenseSplits,
        category: expenseCategories,
        payer: users,
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .where(
        and(
          eq(expenseSplits.userId, userId),
          gte(expenses.createdAt, startDate),
          lte(expenses.createdAt, endDate)
        )
      )
      .orderBy(desc(expenses.createdAt));

    // Convert amounts to target currency and calculate totals
    let totalSpent = 0;
    let totalOwing = 0;
    let totalOwed = 0;
    const categoryTotals = new Map<string, { amount: number; count: number; name: string; color: string }>();
    const dailySpending = new Map<string, number>();
    const friendBalances = new Map<string, { balance: number; count: number; friend: any }>();

    for (const expense of userExpenses) {
      const convertedAmount = await currencyService.convertCurrency(
        parseFloat(expense.split.amount),
        expense.expense.currency || "USD",
        targetCurrency
      );

      totalSpent += convertedAmount;

      // Track if user owes or is owed
      if (expense.expense.paidBy !== userId) {
        totalOwing += convertedAmount;
      } else {
        // Find how much others owe this user for this expense
        const otherSplits = await db
          .select()
          .from(expenseSplits)
          .where(and(
            eq(expenseSplits.expenseId, expense.expense.id),
            sql`${expenseSplits.userId} != ${userId}`
          ));

        for (const split of otherSplits) {
          const splitAmount = await currencyService.convertCurrency(
            parseFloat(split.amount),
            expense.expense.currency || "USD",
            targetCurrency
          );
          totalOwed += splitAmount;
        }
      }

      // Category breakdown
      const categoryName = expense.category?.name || "Uncategorized";
      const categoryData = categoryTotals.get(categoryName) || {
        amount: 0,
        count: 0,
        name: categoryName,
        color: expense.category?.color || "#8B5CF6"
      };
      categoryData.amount += convertedAmount;
      categoryData.count++;
      categoryTotals.set(categoryName, categoryData);

      // Daily spending
      const dateKey = expense.expense.createdAt?.toISOString().split('T')[0] || "";
      dailySpending.set(dateKey, (dailySpending.get(dateKey) || 0) + convertedAmount);

      // Friend balances (only for expenses not paid by user)
      if (expense.expense.paidBy !== userId) {
        const friendId = expense.expense.paidBy;
        const friendData = friendBalances.get(friendId) || {
          balance: 0,
          count: 0,
          friend: expense.payer
        };
        friendData.balance += convertedAmount;
        friendData.count++;
        friendBalances.set(friendId, friendData);
      }
    }

    // Generate spending trend (last 7 days)
    const spendingTrend = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      spendingTrend.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: dailySpending.get(dateKey) || 0
      });
    }

    // Category breakdown for charts
    const categoryBreakdown = Array.from(categoryTotals.values())
      .sort((a, b) => b.amount - a.amount)
      .map(cat => ({
        name: cat.name,
        value: cat.amount,
        percentage: totalSpent > 0 ? ((cat.amount / totalSpent) * 100).toFixed(1) : "0",
        count: cat.count,
        color: cat.color
      }));

    // Monthly comparison (last 6 months)
    const monthlyComparison = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

      const monthlyExpenses = await db
        .select({
          amount: sql<number>`COALESCE(SUM(${expenseSplits.amount}::numeric), 0)`,
        })
        .from(expenseSplits)
        .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
        .where(
          and(
            eq(expenseSplits.userId, userId),
            gte(expenses.createdAt, monthStart),
            lte(expenses.createdAt, monthEnd)
          )
        );

      const monthAmount = monthlyExpenses[0]?.amount || 0;
      monthlyComparison.push({
        month: date.toLocaleDateString('en-US', { month: 'short' }),
        amount: monthAmount
      });
    }

    // Friend balances for display
    const friendBalancesList = Array.from(friendBalances.values())
      .sort((a, b) => Math.abs(b.balance) - Math.abs(a.balance))
      .map(fb => ({
        id: fb.friend.id,
        firstName: fb.friend.firstName,
        lastName: fb.friend.lastName,
        balance: fb.balance,
        expenseCount: fb.count
      }));

    // Generate insights
    const insights = this.generateInsights({
      totalSpent,
      totalOwing,
      totalOwed,
      periodDays,
      categoryBreakdown,
      avgPerDay: totalSpent / periodDays
    });

    // Get previous period for comparison
    const previousPeriodStart = new Date(startDate);
    previousPeriodStart.setDate(previousPeriodStart.getDate() - periodDays);
    
    const previousPeriodExpenses = await db
      .select({
        amount: sql<number>`COALESCE(SUM(${expenseSplits.amount}::numeric), 0)`,
      })
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .where(
        and(
          eq(expenseSplits.userId, userId),
          gte(expenses.createdAt, previousPeriodStart),
          lte(expenses.createdAt, startDate)
        )
      );

    const previousSpent = previousPeriodExpenses[0]?.amount || 0;
    const spentChange = previousSpent > 0 ? ((totalSpent - previousSpent) / previousSpent) * 100 : 0;

    return {
      overview: {
        totalSpent: totalSpent,
        totalOwing: totalOwing,
        totalOwed: totalOwed,
        avgPerDay: totalSpent / periodDays,
        spentChange: spentChange,
        activeDebts: friendBalances.size,
        activeCredits: friendBalancesList.filter(f => f.balance > 0).length,
        insights: insights
      },
      spendingTrend,
      categoryBreakdown,
      monthlyComparison,
      friendBalances: friendBalancesList,
      currency: targetCurrency,
      period: periodDays
    };
  }

  // Store analytics data for future reference
  async storeAnalytics(userId: string, type: string, data: any, periodStart: Date, periodEnd: Date) {
    await db
      .insert(analytics)
      .values({
        userId,
        type: type as any,
        data: data,
        periodStart,
        periodEnd,
      })
      .onConflictDoUpdate({
        target: [analytics.userId, analytics.type, analytics.periodStart],
        set: {
          data: data,
          updatedAt: new Date(),
        },
      });
  }

  // Generate smart insights based on spending patterns
  private generateInsights(data: any): string[] {
    const insights: string[] = [];
    const { totalSpent, avgPerDay, categoryBreakdown, periodDays } = data;

    // Spending level insights
    if (avgPerDay > 50) {
      insights.push("You're spending more than $50 per day on average. Consider setting a daily budget.");
    } else if (avgPerDay < 10) {
      insights.push("Great job keeping your daily spending under control!");
    }

    // Category insights
    if (categoryBreakdown.length > 0) {
      const topCategory = categoryBreakdown[0];
      if (parseFloat(topCategory.percentage) > 40) {
        insights.push(`${topCategory.name} accounts for ${topCategory.percentage}% of your spending. Consider if this aligns with your priorities.`);
      }

      // Food spending insight
      const foodCategories = categoryBreakdown.filter((cat: any) => 
        cat.name.toLowerCase().includes('food') || 
        cat.name.toLowerCase().includes('dining') ||
        cat.name.toLowerCase().includes('restaurant')
      );
      
      if (foodCategories.length > 0) {
        const totalFoodSpending = foodCategories.reduce((sum: number, cat: any) => sum + cat.value, 0);
        const foodPercentage = (totalFoodSpending / totalSpent) * 100;
        
        if (foodPercentage > 30) {
          insights.push(`Food and dining represents ${foodPercentage.toFixed(1)}% of your spending. Meal planning could help reduce costs.`);
        }
      }
    }

    // Trend insights
    if (data.spentChange > 20) {
      insights.push(`Your spending increased by ${data.spentChange.toFixed(1)}% compared to the previous period. Review recent expenses for optimization opportunities.`);
    } else if (data.spentChange < -20) {
      insights.push(`Excellent! You reduced your spending by ${Math.abs(data.spentChange).toFixed(1)}% compared to the previous period.`);
    }

    // Balance insights
    if (data.totalOwing > data.totalOwed) {
      insights.push(`You owe $${(data.totalOwing - data.totalOwed).toFixed(2)} more than you're owed. Consider settling some balances.`);
    } else if (data.totalOwed > data.totalOwing) {
      insights.push(`Others owe you $${(data.totalOwed - data.totalOwing).toFixed(2)} more than you owe. Time to collect!`);
    }

    // Default insights if none generated
    if (insights.length === 0) {
      insights.push("Keep tracking your expenses to identify spending patterns and opportunities for savings.");
      insights.push("Regular expense reviews help maintain financial awareness and control.");
    }

    return insights.slice(0, 6); // Limit to 6 insights
  }
}

export const analyticsService = new AnalyticsService();