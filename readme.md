# Blockchain Transaction Processor

<p align="center">
  <img src="https://ethereum.org/static/4f10d2777b2d14759feb01c65b2765f7/69ce7/eth-logo.webp" alt="Ethereum" width="100" />
  <img src="https://cryptologos.cc/logos/binance-coin-bnb-logo.png" alt="Binance Smart Chain" width="100" />
  <img src="https://cryptologos.cc/logos/solana-sol-logo.png" alt="Solana" width="100" />
</p>

This project is a scalable blockchain transaction processor that supports Ethereum, Binance Smart Chain, and Solana.

## Scalable Features

1. **Multi-chain support**: The application can process transactions from Ethereum, Binance Smart Chain, and Solana, with the ability to easily add more chains in the future.

2. **Environment-based configuration**: API keys and network settings are loaded from environment variables, allowing for easy deployment across different environments without code changes.

3. **Testnet/Mainnet flexibility**: Each chain can be configured to use either testnet or mainnet, controlled via environment variables.

4. **Multiple RPC endpoints**: The Ethereum chain uses multiple RPC endpoints with a round-robin selection mechanism to distribute load and provide failover capabilities.

5. **Database integration**: Uses Drizzle ORM with SQLite for efficient data storage and retrieval, which can be easily scaled to other databases.

6. **API versioning**: The API routes are versioned, allowing for future updates without breaking existing integrations.

7. **Type safety**: Utilizes TypeScript for improved type safety and developer experience.

8. **Containerization-ready**: The application can be easily containerized using Docker for consistent deployment across different environments.

9. **Block progress tracking**: Tracks the progress of block processing for each chain, including status and error handling.

10. **Wallet counting**: Keeps track of the number of unique wallets processed for each chain.

11. **Transaction counting**: Counts the number of transactions processed per day for each chain.

## Setup

### Local Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in your API keys and configuration
4. Run the migrations: `npm run migrate`
5. Start the application: `npm start`

### Docker Setup

1. Build the Docker image:
   ```
   docker build -t blockchain-processor .
   ```
2. Run the Docker container:
   ```
   docker run -p 3100:3100 --env-file .env blockchain-processor
   ```

## Environment Variables

- `PORT`: The port on which the server will run (default: 3100)
- `ETH_TESTNET`: Set to 'true' to use Ethereum testnet, 'false' for mainnet
- `BSC_TESTNET`: Set to 'true' to use BSC testnet, 'false' for mainnet
- `SOLANA_TESTNET`: Set to 'true' to use Solana testnet, 'false' for mainnet
- `INFURA_API_KEY`: Your Infura API key for Ethereum
- `ALCHEMY_API_KEY`: Your Alchemy API key for Ethereum
- `GETBLOCK_API_KEY`: Your GetBlock API key for Ethereum
- `BSC_TESTNET_RPC_URL`: (Optional) Custom BSC testnet RPC URL
- `BSC_MAINNET_RPC_URL`: (Optional) Custom BSC mainnet RPC URL
- `SOLANA_TESTNET_RPC_URL`: (Optional) Custom Solana testnet RPC URL
- `SOLANA_MAINNET_RPC_URL`: (Optional) Custom Solana mainnet RPC URL

## API Endpoints

- POST `/v1/hello`: A sample endpoint that returns a greeting
- GET `/v1/status`: Returns the current block processing status for all chains
- GET `/v1/blocks`: Returns the current block progress and wallet counts for all chains
- GET `/v1/transactions`: Returns the transaction counts for the last 24 hours for all chains

## Database Schema

The project uses SQLite with the following tables:
- `users`: Stores user information (if applicable)
- `transactions`: Stores processed transaction details
- `block_progress`: Tracks the progress of block processing for each chain
- `wallet_count`: Keeps track of the number of unique wallets processed for each chain
- `transaction_count`: Counts the number of transactions processed per day for each chain

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct, and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE.md file for details