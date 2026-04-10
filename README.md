# NFT Event Ticketing System

## Setup Instructions

### 1. Install dependencies
npm install

### 2. Start local blockchain
npx hardhat node

### 3. Deploy contract
npx hardhat run scripts/deploy.js --network localhost

### 4. Update frontend with contract address
Environment Setup:
Create a `.env` file inside the `frontend` folder
You can refer to `.env.example` for format

### 5. Setup MetaMask
Add new network:
    Network Name: Hardhat Localhost
    RPC URL: http://127.0.0.1:8545
    Chain ID: 31337
    Currency: ETH
    Import account using private key from Hardhat terminal

### 6. Start frontend
cd frontend
npm install
npm start

### Run the App
Open in browser:
http://localhost:3000

---

## Features
- Mint NFT tickets
- Buy tickets
- Transfer tickets
- QR verification
