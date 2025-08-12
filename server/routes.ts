import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertFriendshipSchema, insertGroupSchema, insertExpenseSchema, insertExpenseSplitSchema, insertSettlementSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Seed categories on startup
  await storage.seedCategories();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard routes
  app.get('/api/dashboard', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const [balances, recentExpenses, groups] = await Promise.all([
        storage.getUserBalances(userId),
        storage.getExpenses(userId),
        storage.getGroups(userId)
      ]);

      res.json({
        balances,
        recentExpenses: recentExpenses.slice(0, 10),
        groups: groups.slice(0, 5)
      });
    } catch (error) {
      console.error("Error fetching dashboard:", error);
      res.status(500).json({ message: "Failed to fetch dashboard data" });
    }
  });

  // Friends routes
  app.get('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friends = await storage.getFriends(userId);
      res.json(friends);
    } catch (error) {
      console.error("Error fetching friends:", error);
      res.status(500).json({ message: "Failed to fetch friends" });
    }
  });

  app.post('/api/friends', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const friendData = insertFriendshipSchema.parse(req.body);
      const friendship = await storage.addFriend(userId, friendData);
      res.json(friendship);
    } catch (error) {
      console.error("Error adding friend:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid friend data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to add friend" });
      }
    }
  });

  app.delete('/api/friends/:friendId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { friendId } = req.params;
      await storage.removeFriend(userId, friendId);
      res.json({ message: "Friend removed successfully" });
    } catch (error) {
      console.error("Error removing friend:", error);
      res.status(500).json({ message: "Failed to remove friend" });
    }
  });

  // Groups routes
  app.get('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groups = await storage.getGroups(userId);
      res.json(groups);
    } catch (error) {
      console.error("Error fetching groups:", error);
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.post('/api/groups', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const groupData = insertGroupSchema.parse(req.body);
      const group = await storage.createGroup(userId, groupData);
      res.json(group);
    } catch (error) {
      console.error("Error creating group:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid group data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create group" });
      }
    }
  });

  app.post('/api/groups/:groupId/members', isAuthenticated, async (req: any, res) => {
    try {
      const { groupId } = req.params;
      const { userId } = req.body;
      
      const member = await storage.addGroupMember({
        groupId,
        userId,
        role: "member"
      });
      
      res.json(member);
    } catch (error) {
      console.error("Error adding group member:", error);
      res.status(500).json({ message: "Failed to add group member" });
    }
  });

  // Expenses routes
  app.get('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { groupId } = req.query;
      const expenses = await storage.getExpenses(userId, groupId as string);
      res.json(expenses);
    } catch (error) {
      console.error("Error fetching expenses:", error);
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  const createExpenseSchema = insertExpenseSchema.extend({
    splits: z.array(insertExpenseSplitSchema.omit({ expenseId: true }))
  });

  app.post('/api/expenses', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { splits, ...expenseData } = createExpenseSchema.parse(req.body);
      
      const expense = await storage.createExpense(userId, expenseData, splits);
      res.json(expense);
    } catch (error) {
      console.error("Error creating expense:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create expense" });
      }
    }
  });

  // Balances routes
  app.get('/api/balances', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const balances = await storage.getUserBalances(userId);
      res.json(balances);
    } catch (error) {
      console.error("Error fetching balances:", error);
      res.status(500).json({ message: "Failed to fetch balances" });
    }
  });

  // Settlements routes
  app.post('/api/settlements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settlementData = insertSettlementSchema.parse(req.body);
      const settlement = await storage.createSettlement(userId, settlementData);
      res.json(settlement);
    } catch (error) {
      console.error("Error creating settlement:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid settlement data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create settlement" });
      }
    }
  });

  app.get('/api/settlements', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settlements = await storage.getSettlements(userId);
      res.json(settlements);
    } catch (error) {
      console.error("Error fetching settlements:", error);
      res.status(500).json({ message: "Failed to fetch settlements" });
    }
  });

  // Categories routes
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getExpenseCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
