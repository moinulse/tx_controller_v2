import Web3 from "web3";
import { Web3Eth } from "web3";
import dotenv from 'dotenv';
import { updateBlockProgress, updateWalletCount, incrementTransactionCount } from "../drizzle/db";

dotenv.config();

class EthereumChain {
  private isTestnet: boolean;
  protected web3Clients: Web3[];
  protected currentClientIndex: number;

  private mainnetTokenContracts: { [key: string]: string } = {
    USDT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    USDC: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
    TRX: "0x50327c6c5a14DCaDE707ABad2E27eB517df87AB5"
  };

  private testTokenContracts: { [key: string]: string } = {
    USDT: "0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0",
    USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
    TRX: "0x50327c6c5a14DCaDE707ABad2E27eB517df87AB5"
  };

  private tokenContracts: { [key: string]: string };

  constructor(isTestnet: boolean = false) {
    this.isTestnet = isTestnet;
    this.tokenContracts = this.isTestnet ? this.testTokenContracts : this.mainnetTokenContracts;
    this.web3Clients = this.initializeWeb3Clients();
    this.currentClientIndex = 0;
  }

  private initializeWeb3Clients(): Web3[] {
    const infuraKey = process.env.INFURA_API_KEY;
    const alchemyKey = process.env.ALCHEMY_API_KEY;
    const getblockKey = process.env.GETBLOCK_API_KEY;

    if (!infuraKey || !alchemyKey || !getblockKey) {
      throw new Error('Missing API keys in environment variables');
    }

    return this.isTestnet ? [
      new Web3(`https://sepolia.infura.io/v3/${infuraKey}`),
      new Web3(`https://eth-sepolia.g.alchemy.com/v2/${alchemyKey}`),
      new Web3(`https://go.getblock.io/${getblockKey}`)
    ] : [
      new Web3(`https://mainnet.infura.io/v3/${infuraKey}`),
      new Web3(`https://eth-mainnet.g.alchemy.com/v2/${alchemyKey}`),
      new Web3(`https://go.getblock.io/${getblockKey}`)
    ];
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
    try {
      await updateBlockProgress("Ethereum", blockNumber, "processing");

      const client = await this.getWeb3Client();
      const abi = [
        {
          constant: true,
          inputs: [],
          name: "name",
          outputs: [
            {
              name: "",
              type: "string"
            }
          ],
          payable: false,
          type: "function"
        },
        {
          constant: true,
          inputs: [],
          name: "decimals",
          outputs: [
            {
              name: "",
              type: "uint8"
            }
          ],
          payable: false,
          type: "function"
        },
        {
          constant: true,
          inputs: [
            {
              name: "_owner",
              type: "address"
            }
          ],
          name: "balanceOf",
          outputs: [
            {
              name: "balance",
              type: "uint256"
            }
          ],
          payable: false,
          type: "function"
        },
        {
          constant: true,
          inputs: [],
          name: "symbol",
          outputs: [
            {
              name: "",
              type: "string"
            }
          ],
          payable: false,
          type: "function"
        }
      ];
      const block = await client.eth.getBlock(blockNumber, true);
      if (!block || !block.transactions) {
        console.error(`Block ${blockNumber} not found or has no transactions`);
        return;
      }

      const transactions = block.transactions;
      const processedWallets = new Set<string>();

      for (const tx of transactions) {
        if (typeof tx === "object" && tx.to && tx.from) {
          processedWallets.add(tx.from);
          processedWallets.add(tx.to);

          const contractAddress = this.isTokenContractAddress(tx.to);
          if(!contractAddress) {
            continue;
          }
          const contract = new client.eth.Contract(abi, tx.to);
          const balance = await contract.methods.balanceOf(tx.from).call();
          const formattedTx = {
            block: block.number,
            txHash: tx.hash,
            contract: tx.to,
            from: tx.from,
            to: tx.to,
            value: balance,
            timestamp: block.timestamp,
            networkName: "Ethereum-Test",
            transferDirection: "IN"
          };
          console.log(formattedTx);

          // Increment transaction count
          const date = new Date(Number(block.timestamp) * 1000).toISOString().split('T')[0];
          await incrementTransactionCount("Ethereum", date);
        }
      }

      await updateWalletCount("Ethereum", processedWallets.size);
      await updateBlockProgress("Ethereum", blockNumber, "processed");
    } catch (error) {
      console.error("Error processing Ethereum transactions:", error);
      await updateBlockProgress("Ethereum", blockNumber, "error", error.message);
    }
  }
}

export default EthereumChain;