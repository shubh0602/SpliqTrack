import { sql, relations } from 'drizzle-orm';
import {
  index,
  integer,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  authProvider: varchar("auth_provider").default("replit"), // replit, google, guest
  guestToken: varchar("guest_token"), // for guest users
  isGuest: boolean("is_guest").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Friendships table
export const friendships = pgTable("friendships", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  friendId: varchar("friend_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  status: varchar("status", { enum: ["pending", "accepted", "declined"] }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Groups table
export const groups = pgTable("groups", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  imageUrl: varchar("image_url"),
  createdBy: varchar("created_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Group members table
export const groupMembers = pgTable("group_members", {
  id: uuid("id").defaultRandom().primaryKey(),
  groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  role: varchar("role", { enum: ["admin", "member"] }).default("member"),
  joinedAt: timestamp("joined_at").defaultNow(),
});

// Expense categories table
export const expenseCategories = pgTable("expense_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  icon: varchar("icon", { length: 50 }).notNull(),
  color: varchar("color", { length: 20 }).notNull(),
});

// Expenses table
export const expenses = pgTable("expenses", {
  id: uuid("id").defaultRandom().primaryKey(),
  description: varchar("description", { length: 255 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 6 }).default("1.0"),
  categoryId: uuid("category_id").references(() => expenseCategories.id),
  groupId: uuid("group_id").references(() => groups.id),
  paidBy: varchar("paid_by").notNull().references(() => users.id, { onDelete: "cascade" }),
  splitType: varchar("split_type", { enum: ["equal", "custom", "percentage", "shares"] }).default("equal"),
  receiptUrl: varchar("receipt_url"),
  ocrData: jsonb("ocr_data"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Expense splits table
export const expenseSplits = pgTable("expense_splits", {
  id: uuid("id").defaultRandom().primaryKey(),
  expenseId: uuid("expense_id").notNull().references(() => expenses.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  percentage: decimal("percentage", { precision: 5, scale: 2 }),
  shares: integer("shares").default(1),
  settled: boolean("settled").default(false),
  settledAt: timestamp("settled_at"),
});

// Settlements table
export const settlements = pgTable("settlements", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromUserId: varchar("from_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  toUserId: varchar("to_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("USD"),
  groupId: uuid("group_id").references(() => groups.id),
  method: varchar("method", { length: 50 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Exchange rates table for multi-currency support
export const exchangeRates = pgTable("exchange_rates", {
  id: uuid("id").defaultRandom().primaryKey(),
  fromCurrency: varchar("from_currency", { length: 3 }).notNull(),
  toCurrency: varchar("to_currency", { length: 3 }).notNull(),
  rate: decimal("rate", { precision: 10, scale: 6 }).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Analytics table for spending insights
export const analytics = pgTable("analytics", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: varchar("type", { enum: ["monthly_spending", "category_breakdown", "friend_balance", "group_activity"] }).notNull(),
  data: jsonb("data").notNull(),
  periodStart: timestamp("period_start").notNull(),
  periodEnd: timestamp("period_end").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Offline sync queue for offline mode
export const syncQueue = pgTable("sync_queue", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  operation: varchar("operation", { enum: ["create", "update", "delete"] }).notNull(),
  entity: varchar("entity", { enum: ["expense", "group", "friendship", "settlement"] }).notNull(),
  entityId: varchar("entity_id").notNull(),
  data: jsonb("data").notNull(),
  synced: boolean("synced").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  friendships: many(friendships),
  groupMemberships: many(groupMembers),
  createdGroups: many(groups),
  paidExpenses: many(expenses),
  expenseSplits: many(expenseSplits),
  sentSettlements: many(settlements, { relationName: "sentSettlements" }),
  receivedSettlements: many(settlements, { relationName: "receivedSettlements" }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  user: one(users, {
    fields: [friendships.userId],
    references: [users.id],
  }),
  friend: one(users, {
    fields: [friendships.friendId],
    references: [users.id],
  }),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
  creator: one(users, {
    fields: [groups.createdBy],
    references: [users.id],
  }),
  members: many(groupMembers),
  expenses: many(expenses),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
  group: one(groups, {
    fields: [groupMembers.groupId],
    references: [groups.id],
  }),
  user: one(users, {
    fields: [groupMembers.userId],
    references: [users.id],
  }),
}));

export const expenseCategoriesRelations = relations(expenseCategories, ({ many }) => ({
  expenses: many(expenses),
}));

export const expensesRelations = relations(expenses, ({ one, many }) => ({
  category: one(expenseCategories, {
    fields: [expenses.categoryId],
    references: [expenseCategories.id],
  }),
  group: one(groups, {
    fields: [expenses.groupId],
    references: [groups.id],
  }),
  payer: one(users, {
    fields: [expenses.paidBy],
    references: [users.id],
  }),
  splits: many(expenseSplits),
}));

export const expenseSplitsRelations = relations(expenseSplits, ({ one }) => ({
  expense: one(expenses, {
    fields: [expenseSplits.expenseId],
    references: [expenses.id],
  }),
  user: one(users, {
    fields: [expenseSplits.userId],
    references: [users.id],
  }),
}));

export const settlementsRelations = relations(settlements, ({ one }) => ({
  fromUser: one(users, {
    fields: [settlements.fromUserId],
    references: [users.id],
    relationName: "sentSettlements",
  }),
  toUser: one(users, {
    fields: [settlements.toUserId],
    references: [users.id],
    relationName: "receivedSettlements",
  }),
  group: one(groups, {
    fields: [settlements.groupId],
    references: [groups.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const insertFriendshipSchema = createInsertSchema(friendships).pick({
  friendId: true,
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  imageUrl: true,
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  groupId: true,
  userId: true,
  role: true,
});

export const insertExpenseSchema = createInsertSchema(expenses).pick({
  description: true,
  amount: true,
  currency: true,
  exchangeRate: true,
  categoryId: true,
  groupId: true,
  splitType: true,
  receiptUrl: true,
  ocrData: true,
});

export const insertExchangeRateSchema = createInsertSchema(exchangeRates);
export const insertAnalyticsSchema = createInsertSchema(analytics);
export const insertSyncQueueSchema = createInsertSchema(syncQueue);

export const insertExpenseSplitSchema = createInsertSchema(expenseSplits).pick({
  expenseId: true,
  userId: true,
  amount: true,
  percentage: true,
  shares: true,
});

export const insertSettlementSchema = createInsertSchema(settlements).pick({
  toUserId: true,
  amount: true,
  currency: true,
  groupId: true,
  method: true,
  notes: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertFriendship = z.infer<typeof insertFriendshipSchema>;
export type Friendship = typeof friendships.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;
export type Group = typeof groups.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;
export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type ExpenseCategory = typeof expenseCategories.$inferSelect;
export type InsertExpenseSplit = z.infer<typeof insertExpenseSplitSchema>;
export type ExpenseSplit = typeof expenseSplits.$inferSelect;
export type InsertSettlement = z.infer<typeof insertSettlementSchema>;
export type Settlement = typeof settlements.$inferSelect;
export type ExchangeRate = typeof exchangeRates.$inferSelect;
export type Analytics = typeof analytics.$inferSelect;
export type SyncQueue = typeof syncQueue.$inferSelect;

// Invitations table for shareable links
export const invitations = pgTable("invitations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  inviteCode: varchar("invite_code").unique().notNull(),
  invitedBy: varchar("invited_by").references(() => users.id).notNull(),
  inviteType: varchar("invite_type").notNull(), // friend, group, expense
  targetId: varchar("target_id"), // group id or expense id if applicable
  expiresAt: timestamp("expires_at").notNull(),
  maxUses: integer("max_uses").default(1),
  usedCount: integer("used_count").default(0),
  isActive: boolean("is_active").default(true),
  metadata: jsonb("metadata"), // additional invite data
  createdAt: timestamp("created_at").defaultNow(),
});

// Invitation acceptances tracking
export const invitationAcceptances = pgTable("invitation_acceptances", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invitationId: varchar("invitation_id").references(() => invitations.id).notNull(),
  acceptedBy: varchar("accepted_by").references(() => users.id).notNull(),
  acceptedAt: timestamp("accepted_at").defaultNow(),
});

export type Invitation = typeof invitations.$inferSelect;
export type InsertInvitation = typeof invitations.$inferInsert;
