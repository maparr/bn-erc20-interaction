# ERC20 Token Viem Integration

This project implements an ERC20 token smart contract and a Node.js backend application that interacts with the contract using Viem.

## Project Overview

The project consists of two main parts:

1. **Smart Contract**: An ERC20 token implementation based on the Cyfrin example, with additional features like minting and burning.
2. **Backend Application**: A Node.js Express API that interacts with the deployed token contract using Viem.

## Technologies Used

- **Solidity**: For smart contract development
- **Hardhat**: For Ethereum development environment
- **TypeScript**: For type-safe JavaScript
- **Express**: For API development
- **Viem**: For blockchain interaction
- **Ethers**: For contract deployment and testing

## Prerequisites

- Node.js (v16+)
- npm or yarn
- An Ethereum wallet with private key (for testing)

## Project Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/erc20-viem-api.git
cd erc20-viem-api
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory:

```
PORT=3000
RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=your_private_key_here
```

## Smart Contract

### Contract Details

- **Name**: MyToken
- **Symbol**: CFN
- **Decimals**: 18
- **Initial Supply**: 1,000,000 tokens
- **Features**: Transfer, TransferFrom, Approve, Mint (owner only), Burn

### Deployment

1. Start a local hardhat node:

```bash
npm run node
```

2. Deploy the contract:

```bash
npm run deploy:local
```

This will deploy the contract to your local Hardhat node and save the contract address to `src/config/contract-address.json`.

## Backend Application

### API Endpoints

- `GET /api/health`: Check API status
- `GET /api/token`: Get token information (name, symbol, decimals, total supply)
- `GET /api/balance/:address`: Get token balance for a specific address
- `POST /api/transfer-from`: Execute transferFrom operation
  ```json
  {
    "privateKey": "0x...",
    "from": "0x...",
    "to": "0x...",
    "amount": "10.5"
  }
  ```
- `POST /api/approve`: Approve tokens for a spender
  ```json
  {
    "privateKey": "0x...",
    "spender": "0x...",
    "amount": "100"
  }
  ```

### Start the Server

```bash
npm run dev
```

The server will start on http://localhost:3000 (or the PORT you specified in the .env file).

## Testing

### Smart Contract Tests

Run the tests using:

```bash
npm run test
```

This will run the test suite for the MyToken contract, covering:
- Basic token functionality (transfer, balanceOf)
- Approval mechanism (approve, allowance, transferFrom)
- Custom minting and burning functions
- Edge cases and potential security issues

### API Testing

You can test the API using curl, Postman, or any API testing tool.

Example requests:

1. Get token information:
```bash
curl http://localhost:3000/api/token
```

2. Get balance:
```bash
curl http://localhost:3000/api/balance/0x...
```

3. Approve tokens:
```bash
curl -X POST http://localhost:3000/api/approve \
  -H "Content-Type: application/json" \
  -d '{"privateKey": "0x...", "spender": "0x...", "amount": "100"}'
```

4. Transfer tokens:
```bash
curl -X POST http://localhost:3000/api/transfer-from \
  -H "Content-Type: application/json" \
  -d '{"privateKey": "0x...", "from": "0x...", "to": "0x...", "amount": "10"}'
```

## Design Decisions

### Smart Contract

1. **ERC20 Implementation**: Used the Cyfrin reference implementation as a foundation
2. **Added Security Checks**: Added checks for insufficient balances and allowances
3. **Owner Pattern**: Implemented a simple ownership pattern for the mint function
4. **Events**: Included standard ERC20 events for transfers and approvals

### Backend Application

1. **TypeScript**: Used TypeScript for better type safety and developer experience
2. **Viem**: Chose Viem over Web3.js or Ethers.js for its modern API, TypeScript support, and performance
3. **Promise.all()**: Used Promise.all() for concurrent async operations when fetching token information
4. **Error Handling**: Implemented proper error handling and validation for all API endpoints
5. **Controller Pattern**: Separated route handlers from business logic for better code organization
6. **Environment Variables**: Used environment variables for configuration to enhance security and flexibility

### Security Considerations

1. **Private Key Handling**: The application accepts private keys through API requests for demonstration purposes. In a production environment, you would use a secure key vault or wallet integration.
2. **Input Validation**: Added validation for all API inputs to prevent malicious requests
3. **Error Handling**: Implemented proper error handling to avoid exposing sensitive information
4. **Smart Contract Security**: Added checks for overflow, underflow, and other common vulnerabilities

## Future Improvements

1. **Gas Fee Estimation**: Add functionality to estimate gas fees before transactions
2. **Transaction Monitoring**: Implement a system to monitor transaction status and handle errors
3. **Enhanced Authentication**: Add JWT or OAuth authentication for secure access to the API
4. **Rate Limiting**: Implement rate limiting to prevent API abuse
5. **Caching**: Add caching for frequently requested data like token information
6. **Front-end Interface**: Create a web interface to interact with the API
7. **Wallet Integration**: Integrate with wallet providers instead of handling private keys directly

## License

MIT

## Author

Your Name
