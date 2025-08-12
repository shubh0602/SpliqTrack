import {
  users,
  friendships,
  groups,
  groupMembers,
  expenseCategories,
  expenses,
  expenseSplits,
  settlements,
  type User,
  type UpsertUser,
  type InsertFriendship,
  type Friendship,
  type InsertGroup,
  type Group,
  type InsertGroupMember,
  type GroupMember,
  type InsertExpense,
  type Expense,
  type ExpenseCategory,
  type InsertExpenseSplit,
  type ExpenseSplit,
  type InsertSettlement,
  type Settlement,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, or, desc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Friends operations
  getFriends(userId: string): Promise<(Friendship & { friend: User })[]>;
  addFriend(userId: string, friendship: InsertFriendship): Promise<Friendship>;
  acceptFriend(friendshipId: string): Promise<void>;
  removeFriend(userId: string, friendId: string): Promise<void>;
  
  // Groups operations
  getGroups(userId: string): Promise<(Group & { members: (GroupMember & { user: User })[] })[]>;
  createGroup(userId: string, group: InsertGroup): Promise<Group>;
  addGroupMember(groupMember: InsertGroupMember): Promise<GroupMember>;
  removeGroupMember(groupId: string, userId: string): Promise<void>;
  
  // Expense operations
  getExpenses(userId: string, groupId?: string): Promise<(Expense & { 
    category: ExpenseCategory | null;
    payer: User;
    group: Group | null;
    splits: (ExpenseSplit & { user: User })[];
  })[]>;
  createExpense(userId: string, expense: InsertExpense, splits: InsertExpenseSplit[]): Promise<Expense>;
  
  // Balance operations
  getUserBalances(userId: string): Promise<{ 
    totalOwed: number; 
    totalOwing: number; 
    friendBalances: { friend: User; balance: number }[] 
  }>;
  
  // Settlement operations
  createSettlement(userId: string, settlement: InsertSettlement): Promise<Settlement>;
  getSettlements(userId: string): Promise<(Settlement & { fromUser: User; toUser: User })[]>;
  
  // Categories
  getExpenseCategories(): Promise<ExpenseCategory[]>;
  seedCategories(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Friends operations
  async getFriends(userId: string): Promise<(Friendship & { friend: User })[]> {
    const result = await db
      .select()
      .from(friendships)
      .innerJoin(users, eq(friendships.friendId, users.id))
      .where(and(
        eq(friendships.userId, userId),
        eq(friendships.status, "accepted")
      ))
      .orderBy(desc(friendships.createdAt));

    return result.map(row => ({
      ...row.friendships,
      friend: row.users
    }));
  }

  async addFriend(userId: string, friendship: InsertFriendship): Promise<Friendship> {
    const [newFriendship] = await db
      .insert(friendships)
      .values({
        userId,
        ...friendship,
        status: "accepted" // Auto-accept for simplicity
      })
      .returning();

    // Add reverse friendship
    await db
      .insert(friendships)
      .values({
        userId: friendship.friendId,
        friendId: userId,
        status: "accepted"
      });

    return newFriendship;
  }

  async acceptFriend(friendshipId: string): Promise<void> {
    await db
      .update(friendships)
      .set({ status: "accepted" })
      .where(eq(friendships.id, friendshipId));
  }

  async removeFriend(userId: string, friendId: string): Promise<void> {
    await db
      .delete(friendships)
      .where(or(
        and(eq(friendships.userId, userId), eq(friendships.friendId, friendId)),
        and(eq(friendships.userId, friendId), eq(friendships.friendId, userId))
      ));
  }

  // Groups operations
  async getGroups(userId: string): Promise<(Group & { members: (GroupMember & { user: User })[] })[]> {
    const userGroups = await db
      .select()
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groups.createdAt));

    const groupsWithMembers = await Promise.all(
      userGroups.map(async (group) => {
        const members = await db
          .select()
          .from(groupMembers)
          .innerJoin(users, eq(groupMembers.userId, users.id))
          .where(eq(groupMembers.groupId, group.groups.id));

        return {
          ...group.groups,
          members: members.map(m => ({
            ...m.group_members,
            user: m.users
          }))
        };
      })
    );

    return groupsWithMembers;
  }

  async createGroup(userId: string, group: InsertGroup): Promise<Group> {
    const [newGroup] = await db
      .insert(groups)
      .values({
        ...group,
        createdBy: userId
      })
      .returning();

    // Add creator as admin
    await db
      .insert(groupMembers)
      .values({
        groupId: newGroup.id,
        userId,
        role: "admin"
      });

    return newGroup;
  }

  async addGroupMember(groupMember: InsertGroupMember): Promise<GroupMember> {
    const [member] = await db
      .insert(groupMembers)
      .values(groupMember)
      .returning();
    return member;
  }

  async removeGroupMember(groupId: string, userId: string): Promise<void> {
    await db
      .delete(groupMembers)
      .where(and(
        eq(groupMembers.groupId, groupId),
        eq(groupMembers.userId, userId)
      ));
  }

  // Expense operations
  async getExpenses(userId: string, groupId?: string): Promise<(Expense & { 
    category: ExpenseCategory | null;
    payer: User;
    group: Group | null;
    splits: (ExpenseSplit & { user: User })[];
  })[]> {
    const baseQuery = db
      .select()
      .from(expenses)
      .leftJoin(expenseCategories, eq(expenses.categoryId, expenseCategories.id))
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .leftJoin(groups, eq(expenses.groupId, groups.id))
      .innerJoin(expenseSplits, eq(expenses.id, expenseSplits.expenseId));

    const query = groupId 
      ? baseQuery.where(and(eq(expenseSplits.userId, userId), eq(expenses.groupId, groupId)))
      : baseQuery.where(eq(expenseSplits.userId, userId));

    const result = await query.orderBy(desc(expenses.createdAt));

    // Group by expense and get splits
    const expenseMap = new Map();
    
    for (const row of result) {
      const expenseId = row.expenses.id;
      if (!expenseMap.has(expenseId)) {
        const splits = await db
          .select()
          .from(expenseSplits)
          .innerJoin(users, eq(expenseSplits.userId, users.id))
          .where(eq(expenseSplits.expenseId, expenseId));

        expenseMap.set(expenseId, {
          ...row.expenses,
          category: row.expense_categories,
          payer: row.users,
          group: row.groups,
          splits: splits.map(s => ({
            ...s.expense_splits,
            user: s.users
          }))
        });
      }
    }

    return Array.from(expenseMap.values());
  }

  async createExpense(userId: string, expense: InsertExpense, splits: Omit<InsertExpenseSplit, 'expenseId'>[]): Promise<Expense> {
    const [newExpense] = await db
      .insert(expenses)
      .values({
        ...expense,
        paidBy: userId
      })
      .returning();

    // Create splits
    await db
      .insert(expenseSplits)
      .values(splits.map(split => ({
        ...split,
        expenseId: newExpense.id
      })));

    return newExpense;
  }

  // Balance operations
  async getUserBalances(userId: string): Promise<{ 
    totalOwed: number; 
    totalOwing: number; 
    friendBalances: { friend: User; balance: number }[] 
  }> {
    // Get all expense splits for user
    const userSplits = await db
      .select()
      .from(expenseSplits)
      .innerJoin(expenses, eq(expenseSplits.expenseId, expenses.id))
      .innerJoin(users, eq(expenses.paidBy, users.id))
      .where(eq(expenseSplits.userId, userId));

    // Get all expenses paid by user
    const userExpenses = await db
      .select()
      .from(expenses)
      .innerJoin(expenseSplits, eq(expenses.id, expenseSplits.expenseId))
      .innerJoin(users, eq(expenseSplits.userId, users.id))
      .where(eq(expenses.paidBy, userId));

    // Calculate balances
    const balanceMap = new Map<string, number>();

    // Amount user owes others
    for (const split of userSplits) {
      if (split.expenses.paidBy !== userId) {
        const payerId = split.expenses.paidBy;
        const amount = parseFloat(split.expense_splits.amount);
        balanceMap.set(payerId, (balanceMap.get(payerId) || 0) - amount);
      }
    }

    // Amount others owe user
    for (const expense of userExpenses) {
      if (expense.expense_splits.userId !== userId) {
        const owerId = expense.expense_splits.userId;
        const amount = parseFloat(expense.expense_splits.amount);
        balanceMap.set(owerId, (balanceMap.get(owerId) || 0) + amount);
      }
    }

    // Get friend details
    const friendBalances = await Promise.all(
      Array.from(balanceMap.entries()).map(async ([friendId, balance]) => {
        const friend = await this.getUser(friendId);
        return { friend: friend!, balance };
      })
    );

    const totalOwed = friendBalances
      .filter(fb => fb.balance < 0)
      .reduce((sum, fb) => sum + Math.abs(fb.balance), 0);

    const totalOwing = friendBalances
      .filter(fb => fb.balance > 0)
      .reduce((sum, fb) => sum + fb.balance, 0);

    return { totalOwed, totalOwing, friendBalances };
  }

  // Settlement operations
  async createSettlement(userId: string, settlement: InsertSettlement): Promise<Settlement> {
    const [newSettlement] = await db
      .insert(settlements)
      .values({
        ...settlement,
        fromUserId: userId
      })
      .returning();

    // Mark related expense splits as settled
    await db
      .update(expenseSplits)
      .set({ settled: true, settledAt: new Date() })
      .where(and(
        eq(expenseSplits.userId, userId),
        // Add more conditions to match specific splits
      ));

    return newSettlement;
  }

  async getSettlements(userId: string): Promise<(Settlement & { fromUser: User; toUser: User })[]> {
    const result = await db
      .select()
      .from(settlements)
      .innerJoin(users, eq(settlements.fromUserId, users.id))
      .innerJoin(users, eq(settlements.toUserId, users.id))
      .where(or(
        eq(settlements.fromUserId, userId),
        eq(settlements.toUserId, userId)
      ))
      .orderBy(desc(settlements.createdAt));

    return result.map(row => ({
      ...row.settlements,
      fromUser: row.users,
      toUser: row.users
    }));
  }

  // Categories
  async getExpenseCategories(): Promise<ExpenseCategory[]> {
    return await db.select().from(expenseCategories);
  }

  async seedCategories(): Promise<void> {
    const categories = [
      { name: "Food & Dining", icon: "fas fa-utensils", color: "orange" },
      { name: "Transportation", icon: "fas fa-car", color: "blue" },
      { name: "Entertainment", icon: "fas fa-film", color: "purple" },
      { name: "Shopping", icon: "fas fa-shopping-bag", color: "pink" },
      { name: "Utilities", icon: "fas fa-home", color: "green" },
      { name: "Travel", icon: "fas fa-plane", color: "cyan" },
      { name: "Other", icon: "fas fa-question", color: "gray" },
    ];

    await db.insert(expenseCategories).values(categories).onConflictDoNothing();
  }
}

export const storage = new DatabaseStorage();
