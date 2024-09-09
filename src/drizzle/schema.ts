import { sql } from "drizzle-orm";
import { integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  age: integer("age"),
  createdAt: integer("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  nameIdx: uniqueIndex('nameIdx').on(table.firstName, table.lastName),
}));

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey(),
  block: integer("block").notNull(),
  txHash: text("tx_hash").notNull().unique(),
  contract: text("contract"),
  from: text("from").notNull(),
  to: text("to").notNull(),
  value: text("value").notNull(),
  timestamp: integer("timestamp").notNull(),
  networkName: text("network_name").notNull(),
  transferDirection: text("transfer_direction").notNull(),
  createdAt: integer("created_at").notNull().default(sql`CURRENT_TIMESTAMP`)
}, (table) => ({
  blockIdx: uniqueIndex('blockIdx').on(table.block, table.networkName),
  fromIdx: uniqueIndex('fromIdx').on(table.from, table.networkName),
  toIdx: uniqueIndex('toIdx').on(table.to, table.networkName),
}));

export const blockProgress = sqliteTable("block_progress", {
  id: integer("id").primaryKey(),
  chainName: text("chain_name").notNull(),
  blockNumber: integer("block_number").notNull(),
  lastUpdated: integer("last_updated").notNull(),
  status: text("status").notNull().default('processed'), // 'processing', 'processed', 'error'
  errorMessage: text("error_message"),
}, (table) => ({
  chainBlockIdx: uniqueIndex('chainBlockIdx').on(table.chainName, table.blockNumber),
}));

export const walletCount = sqliteTable("wallet_count", {
  id: integer("id").primaryKey(),
  chainName: text("chain_name").notNull(),
  count: integer("count").notNull(),
  lastUpdated: integer("last_updated").notNull(),
}, (table) => ({
  chainIdx: uniqueIndex('chainIdx').on(table.chainName),
}));

export const transactionCount = sqliteTable("transaction_count", {
  id: integer("id").primaryKey(),
  chainName: text("chain_name").notNull(),
  count: integer("count").notNull(),
  date: text("date").notNull(),
}, (table) => ({
  chainDateIdx: uniqueIndex('chainDateIdx').on(table.chainName, table.date),
}));
