import fastify, { FastifyReply, FastifyRequest } from "fastify";
import EthereumChain from "./chains/EthereumChain";
import BinanceSmartChain from "./chains/BinanceSmartChain";

const API_VERSION = "v1";

export const main = async () => {
  // const eth = new EthereumChain();
  const bsc = new BinanceSmartChain();

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

  // Routes
  server.post(`/${API_VERSION}/hello`, async (request:FastifyRequest, reply:FastifyReply) => {
    return { hello: "world" };
  });
  server.listen({ port: 3100 });

  return server;
};

main();

["SIGINT", "SIGTERM"].forEach(signal => {
  process.on(signal, async () => {
    process.exit(0);
  });
});
