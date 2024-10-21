import TronWeb from 'tronweb';
import dotenv from 'dotenv';
import { updateBlockProgress, updateWalletCount, incrementTransactionCount } from "../drizzle/db";

dotenv.config();

class TronChain {
  private isTestnet: boolean;
  private tronWeb: TronWeb;

  private mainnetTokenContracts: { [key: string]: string } = {
    // Add your mainnet Tron token addresses here
  };

  private testnetTokenContracts: { [key: string]: string } = {
    // Add your testnet Tron token addresses here
  };

  private tokenContracts: { [key: string]: string };

  constructor(isTestnet: boolean = true) {
    this.isTestnet = isTestnet;
    this.tokenContracts = this.isTestnet ? this.testnetTokenContracts : this.mainnetTokenContracts;
    this.tronWeb = this.initializeTronWeb();
  }

  private initializeTronWeb(): TronWeb {
    const rpcUrl = this.isTestnet
      ? process.env.TRON_TESTNET_RPC_URL || 'https://api.shasta.trongrid.io'
      : process.env.TRON_MAINNET_RPC_URL || 'https://api.trongrid.io';

    return new TronWeb({
      fullHost: rpcUrl,
      headers: { "TRON-PRO-API-KEY": process.env.TRON_API_KEY || '' }
    });
  }

  isTokenContractAddress(address: string): boolean {
    return Object.values(this.tokenContracts).includes(address);
  }

  async getContractAddress(token: string): Promise<string> {
    return this.tokenContracts[token];
  }

  async getLatestBlockNumber(): Promise<number> {
    const latestBlock = await this.tronWeb.trx.getCurrentBlock();
    return latestBlock.block_header.raw_data.number;
  }

  async getBlock(blockNumber: number): Promise<any> {
    return await this.tronWeb.trx.getBlock(blockNumber);
  }

  async processTransactionsByBlock(blockNumber: number): Promise<void> {
    try {
      await updateBlockProgress("Tron", blockNumber, "processing");

      const block = await this.getBlock(blockNumber);
      if (!block || !block.transactions) {
        console.error(`Block ${blockNumber} not found or has no transactions`);
        return;
      }

      const transactions = block.transactions;
      const processedWallets = new Set<string>();

      for (const tx of transactions) {
        if (tx.raw_data.contract[0].parameter.value.to_address && tx.raw_data.contract[0].parameter.value.owner_address) {
          const toAddress = this.tronWeb.address.fromHex(tx.raw_data.contract[0].parameter.value.to_address);
          const fromAddress = this.tronWeb.address.fromHex(tx.raw_data.contract[0].parameter.value.owner_address);

          processedWallets.add(fromAddress);
          processedWallets.add(toAddress);

          if (this.isTokenContractAddress(toAddress)) {
            const formattedTx = {
              block: blockNumber,
              txHash: tx.txID,
              contract: toAddress,
              from: fromAddress,
              to: toAddress,
              value: tx.raw_data.contract[0].parameter.value.amount,
              timestamp: block.block_header.raw_data.timestamp,
              networkName: this.isTestnet ? "Tron-Testnet" : "Tron-Mainnet",
              transferDirection: "IN"
            };
            console.log(formattedTx);

            // Increment transaction count
            const date = new Date(Number(block.block_header.raw_data.timestamp)).toISOString().split('T')[0];
            await incrementTransactionCount("Tron", date);
          }
        }
      }

      await updateWalletCount("Tron", processedWallets.size);
      await updateBlockProgress("Tron", blockNumber, "processed");
    } catch (error) {
      console.error("Error processing Tron transactions:", error);
      await updateBlockProgress("Tron", blockNumber, "error", error.message);
    }
  }
}

export default TronChain;
