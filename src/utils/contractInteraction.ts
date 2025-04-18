import { createPublicClient, createWalletClient, http, parseAbi, parseEther, formatEther } from 'viem';
import { hardhat } from 'viem/chains';
import { privateKeyToAccount } from 'viem/accounts';
import {publicClient, contractAddress, MyTokenABI, ContractAdr} from '../config';

// ERC20 interface ABI - using parsed ABI for type safety
const erc20Abi = parseAbi([
    'function name() view returns (string)',
    'function symbol() view returns (string)',
    'function decimals() view returns (uint8)',
    'function totalSupply() view returns (uint256)',
    'function balanceOf(address) view returns (uint256)',
    'function transfer(address, uint256) returns (bool)',
    'function allowance(address, address) view returns (uint256)',
    'function approve(address, uint256) returns (bool)',
    'function transferFrom(address, address, uint256) returns (bool)',
]);


// Get basic token information
export async function getTokenInfo() {
    try {
        const [name, symbol, decimals, totalSupply] = await Promise.all([
            publicClient.readContract({
                address: contractAddress,
                abi: erc20Abi,
                functionName: 'name',
            }),
            publicClient.readContract({
                address: contractAddress,
                abi: erc20Abi,
                functionName: 'symbol',
            }),
            publicClient.readContract({
                address: contractAddress,
                abi: erc20Abi,
                functionName: 'decimals',
            }),
            publicClient.readContract({
                address: contractAddress,
                abi: erc20Abi,
                functionName: 'totalSupply',
            }),
        ]);

        return {
            name,
            symbol,
            decimals,
            totalSupply: formatEther(totalSupply as bigint),
        };
    } catch (error) {
        console.error('Error fetching token info:', error);
        throw new Error('Failed to fetch token information');
    }
}

// Get balance of a specific address
export async function getBalance(address: ContractAdr) {
    try {
        const balance = await publicClient.readContract({
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'balanceOf',
            args: [address],
        });

        return {
            address,
            balance: formatEther(balance as bigint),
        };
    } catch (error) {
        console.error(`Error fetching balance for ${address}:`, error);
        throw new Error('Failed to fetch balance');
    }
}

// Create a wallet client for transactions (using private key)
export function createWallet(privateKey: string) {
    try {
        const account = privateKeyToAccount(privateKey as `0x${string}`);

        const walletClient = createWalletClient({
            account,
            chain: hardhat,
            transport: http('http://127.0.0.1:8545'),
        });

        return walletClient;
    } catch (error) {
        console.error('Error creating wallet client:', error);
        throw new Error('Invalid private key or wallet configuration');
    }
}

// Execute transferFrom operation
export async function executeTransferFrom(
    privateKey: string,
    from: ContractAdr,
    to: ContractAdr,
    amount: string
) {
    try {
        const walletClient = createWallet(privateKey);

        // First check allowance
        const allowance = await publicClient.readContract({
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'allowance',
            args: [from, walletClient.account.address],
        });

        const amountInWei = parseEther(amount);

        if ((allowance as bigint) < amountInWei) {
            throw new Error('Insufficient allowance. Please approve tokens first.');
        }

        // Execute transferFrom
        const hash = await walletClient.writeContract({
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'transferFrom',
            args: [from, to, amountInWei],
        });

        // Wait for transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
            transactionHash: hash,
            from,
            to,
            amount,
            status: receipt.status,
        };
    } catch (error) {
        console.error('Error executing transferFrom:', error);
        throw error;
    }
}

// Approve tokens for spender
export async function approveTokens(
    privateKey: string,
    spender: ContractAdr,
    amount: string
) {
    try {
        const walletClient = createWallet(privateKey);
        const amountInWei = parseEther(amount);

        const hash = await walletClient.writeContract({
            address: contractAddress,
            abi: erc20Abi,
            functionName: 'approve',
            args: [spender, amountInWei],
        });

        // Wait for transaction to be mined
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        return {
            transactionHash: hash,
            owner: walletClient.account.address,
            spender,
            amount,
            status: receipt.status,
        };
    } catch (error) {
        console.error('Error approving tokens:', error);
        throw error;
    }
}
