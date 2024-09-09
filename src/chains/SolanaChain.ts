import * as web3 from '@solana/web3.js';
import dotenv from 'dotenv';

dotenv.config();

class SolanaChain {
  private isTestnet: boolean;
  private connection: web3.Connection;

  private mainnetTokenContracts: { [key: string]: string } = {
    // Add your mainnet Solana token addresses here
  };

  private testnetTokenContracts: { [key: string]: string } = {
    // Add your testnet Solana token addresses here
  };

  private tokenContracts: { [key: string]: string };

  constructor(isTestnet: boolean = true) {
    this.isTestnet = isTestnet;
    this.tokenContracts = this.isTestnet ? this.testnetTokenContracts : this.mainnetTokenContracts;
    this.connection = this.initializeConnection();
  }

  private initializeConnection(): web3.Connection {
    const rpcUrl = this.isTestnet
      ? process.env.SOLANA_TESTNET_RPC_URL || 'https://api.testnet.solana.com'
      : process.env.SOLANA_MAINNET_RPC_URL || 'https://api.mainnet-beta.solana.com';

    return new web3.Connection(rpcUrl, 'confirmed');
  }

  isTokenContractAddress(address: string): boolean {
    return Object.values(this.tokenContracts).includes(address);
  }

  async getContractAddress(token: string): Promise<string> {
    return this.tokenContracts[token];
  }

  async getLatestBlockNumber(): Promise<number> {
    return await this.connection.getSlot();
  }

  async getBlock(blockNumber: number): Promise<web3.BlockResponse | null> {
    return await this.connection.getBlock(blockNumber);
  }

  async processTransactionsByBlock(blockNumber: number): Promise<void> {
    const block = await this.getBlock(blockNumber);
    if (!block) {
      console.error(`Block ${blockNumber} not found`);
      return;
    }

    for (const txSignature of block.transactions) {
      const tx = await this.connection.getParsedTransaction(txSignature.transaction.signatures[0]);
      if (tx && tx.transaction.message.accountKeys.some(key => this.isTokenContractAddress(key.pubkey.toBase58()))) {
        // Process the transaction
        const formattedTx = {
          block: blockNumber,
          txHash: txSignature.transaction.signatures[0],
          // Add more transaction details as needed
          timestamp: block.blockTime,
          networkName: this.isTestnet ? "Solana-Testnet" : "Solana-Mainnet",
        };
        console.log(formattedTx);
      }
    }
  }
}

export default SolanaChain;