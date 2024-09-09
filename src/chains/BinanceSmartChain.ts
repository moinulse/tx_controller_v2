import Web3 from "web3";
import dotenv from 'dotenv';

dotenv.config();

class BinanceSmartChain {
  private isTestnet: boolean;
  protected web3Clients: Web3[];
  protected currentClientIndex: number;

  private mainnetTokenContracts: { [key: string]: string } = {
    // Add your mainnet BSC token addresses here
  };

  private testnetTokenContracts: { [key: string]: string } = {
    BUSD: "0xeD24FC36d5Ee211Ea25A80239Fb8C4Cfd80f12Ee",
    USDT: "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"
  };

  private tokenContracts: { [key: string]: string };

  constructor(isTestnet: boolean = true) {
    this.isTestnet = isTestnet;
    this.tokenContracts = this.isTestnet ? this.testnetTokenContracts : this.mainnetTokenContracts;
    this.web3Clients = this.initializeWeb3Clients();
    this.currentClientIndex = 0;
  }

  private initializeWeb3Clients(): Web3[] {
    const bscRpcUrl = this.isTestnet
      ? process.env.BSC_TESTNET_RPC_URL || "https://data-seed-prebsc-1-s1.binance.org:8545/"
      : process.env.BSC_MAINNET_RPC_URL || "https://bsc-dataseed.binance.org/";

    return [new Web3(bscRpcUrl)];
  }

  async getWeb3Client(): Promise<Web3> {
    if (this.currentClientIndex === this.web3Clients.length - 1) {
      this.currentClientIndex = 0;
    } else {
      this.currentClientIndex++;
    }
    return this.web3Clients[this.currentClientIndex];
  }

  isTokenContractAddress(address: string): boolean {
    const lowerCaseAddress = address.toLowerCase();

    return Object.values(this.tokenContracts).some(
      contractAddress => contractAddress.toLowerCase() === lowerCaseAddress
    );
  }

  async getContractAddress(token: string): Promise<string> {
    return this.tokenContracts[token];
  }

  async getLatestBlockNumber(): Promise<bigint> {
    const client = await this.getWeb3Client();
    return client.eth.getBlockNumber();
  }

  async getBlock(blockNumber: bigint): Promise<any> {
    const client = await this.getWeb3Client();
    return client.eth.getBlock(blockNumber.toString());
  }

  async processTransactionsByBlock(blockNumber: number): Promise<any> {
    const client = await this.getWeb3Client();
    const block = await client.eth.getBlock(blockNumber);

    if (!block) {
      return;
    }

    const transactions = block.transactions;
    for (const txHash of transactions) {
      if (typeof txHash === "string") {
        const tx = await client.eth.getTransaction(txHash);
        if (tx && this.isTokenContractAddress(tx.to)) {
          // Process the transaction
          console.log(tx);
        }
      } else {
        continue;
      }
    }
  }
}

export default BinanceSmartChain;
