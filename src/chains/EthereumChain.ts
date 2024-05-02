import Web3 from "web3";
import { Web3Eth } from "web3";

class EthereumChain {
  private isTestnet: boolean = false;
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

  private tokenContracts = this.isTestnet ? this.testTokenContracts : this.mainnetTokenContracts;

  constructor() {
    this.web3Clients = this.isTestnet ? [
      new Web3("https://sepolia.infura.io/v3/3f10d4c80a19485daef555a0056d8b9e"),
      new Web3(
        "https://eth-sepolia.g.alchemy.com/v2/9jzOBc4A-fjjOex_XdDfp-PmBk4rtx-b"
      ),
      new Web3("https://go.getblock.io/707ce04f08f7466fad1827d9f5b4a61d")
    ] : [
      new Web3("https://mainnet.infura.io/v3/3f10d4c80a19485daef555a0056d8b9e"),
      new Web3(
        "https://eth-mainnet.g.alchemy.com/v2/9jzOBc4A-fjjOex_XdDfp-PmBk4rtx-b"
      ),
      new Web3("https://go.getblock.io/707ce04f08f7466fad1827d9f5b4a61d")
    ];
    this.currentClientIndex = 0;
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
    for (const tx of transactions) {
      if (typeof tx === "object" && tx.to && tx.from) {
        // Get transaction contract address
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
      }
    }
  }
}

export default EthereumChain;