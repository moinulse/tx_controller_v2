import fastify, { FastifyReply, FastifyRequest } from "fastify";
import EthereumChain from "./chains/EthereumChain";
import BinanceSmartChain from "./chains/BinanceSmartChain";
import SolanaChain from "./chains/SolanaChain";
import TronChain from "./chains/TronChain";
import dotenv from 'dotenv';
import { getBlockProgress, getWalletCount, getTransactionCount24h } from "./drizzle/db";

dotenv.config();

const API_VERSION = "v1";

export const main = async () => {
  const eth = new EthereumChain(process.env.ETH_TESTNET === 'true');
  const bsc = new BinanceSmartChain(process.env.BSC_TESTNET === 'true');
  const solana = new SolanaChain(process.env.SOLANA_TESTNET === 'true');
  const tron = new TronChain(process.env.TRON_TESTNET === 'true');

  const server = fastify({
    logger: {
      transport: {
        target: "pino-pretty"
      }
    },
    bodyLimit: 1_000_000,
    trustProxy: true
  });

  await bsc.processTransactionsByBlock(39873078);
  // Example of processing a Solana block
  const latestSolanaBlock = await solana.getLatestBlockNumber();
  await solana.processTransactionsByBlock(latestSolanaBlock);

  // Example of processing a Tron block
  const latestTronBlock = await tron.getLatestBlockNumber();
  await tron.processTransactionsByBlock(latestTronBlock);

  // Routes
  server.post<{
    Body: { message: string },
    Reply: { hello: string }
  }>(`/${API_VERSION}/hello`, async (request, reply) => {
    return { hello: request.body.message || "world" };
  });

  // New API endpoints
  server.get(`/${API_VERSION}/status`, async (request, reply) => {
    const status = await getBlockProgress();
    return { status };
  });

  server.get(`/${API_VERSION}/blocks`, async (request, reply) => {
    const blocks = await getBlockProgress();
    const wallets = await getWalletCount();
    return { blocks, wallets };
  });

  server.get(`/${API_VERSION}/transactions`, async (request, reply) => {
    const transactions = await getTransactionCount24h();
    return { transactions };
  });

  const port = parseInt(process.env.PORT || '3100', 10);
  server.listen({ port, host: '0.0.0.0' });

  return server;
};

main();

["SIGINT", "SIGTERM"].forEach(signal => {
  process.on(signal, async () => {
    process.exit(0);
  });
});
