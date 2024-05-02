import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  age: integer("age"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const transactions = sqliteTable("transactions", {
  id: integer("id").primaryKey(),
  block: integer("block").notNull(),
  txHash: text("tx_hash").notNull(),
  contract: text("contract"),
  from: text("from"),
  to: text("to"),
  value: text("value"),
  timestamp: text("timestamp"),
  networkName: text("network_name"),
  transferDirection: text("transfer_direction"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});

export const blocks = sqliteTable("blocks", {
  id: integer("id").primaryKey(),
  block: integer("block"),
  networkName: text("network_name"),
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`)
});
