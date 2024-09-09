import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, and, gte, sql } from "drizzle-orm";
import { blockProgress, walletCount, transactionCount } from "./schema";

const sqlite = new Database("sqlite.db");
const db = drizzle(sqlite);

export default db;

export async function updateBlockProgress(chainName: string, blockNumber: number, status: 'processing' | 'processed' | 'error', errorMessage?: string) {
  const now = Date.now();
  await db.insert(blockProgress).values({
    chainName,
    blockNumber,
    lastUpdated: now,
    status,
    errorMessage,
  }).onConflictDoUpdate({
    target: [blockProgress.chainName, blockProgress.blockNumber],
    set: { lastUpdated: now, status, errorMessage },
  });
}

export async function updateWalletCount(chainName: string, count: number) {
  const now = Date.now();
  await db.insert(walletCount).values({
    chainName,
    count,
    lastUpdated: now,
  }).onConflictDoUpdate({
    target: walletCount.chainName,
    set: { count, lastUpdated: now },
  });
}

export async function incrementTransactionCount(chainName: string, date: string) {
  await db.insert(transactionCount).values({
    chainName,
    count: 1,
    date,
  }).onConflictDoUpdate({
    target: [transactionCount.chainName, transactionCount.date],
    set: { count: sql`count + 1` },
  });
}

export async function getBlockProgress() {
  return await db.select().from(blockProgress);
}

export async function getWalletCount() {
  return await db.select().from(walletCount);
}

export async function getTransactionCount24h() {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return await db.select().from(transactionCount).where(gte(transactionCount.date, yesterday));
}
