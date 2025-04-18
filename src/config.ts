import { createPublicClient, http } from 'viem';
import { hardhat } from 'viem/chains';
import dotenv from 'dotenv';

dotenv.config();

// You can customize this based on the network you're using
const RPC_URL = process.env.RPC_URL || 'http://127.0.0.1:8545';
const CHAIN = hardhat;

// Import contract ABI and address
import MyTokenABI from '../artifacts/contracts/MyToken.sol/MyToken.json';
import contractAddressFile from './config/contract-address.json';

type ContractAdr = `0x${string}`


const contractAddress = contractAddressFile.address as ContractAdr;
const deployerAddress = contractAddressFile.deployer as ContractAdr;

// Create public client
const publicClient = createPublicClient({
    chain: CHAIN,
    transport: http(RPC_URL),
});

export {
    RPC_URL,
    CHAIN,
    publicClient,
    contractAddress,
    deployerAddress,
    MyTokenABI,
    ContractAdr
};
