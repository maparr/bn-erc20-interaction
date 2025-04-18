import { Request, Response } from 'express';
import {
    getTokenInfo,
    getBalance,
    executeTransferFrom,
    approveTokens,
} from '../utils/contractInteraction';
import {ContractAdr} from "../config";

// Get token information
export async function getTokenInfoController(req: Request, res: Response) {
    try {
        const tokenInfo = await getTokenInfo();
        res.status(200).json({
            success: true,
            data: tokenInfo,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
}

// Get balance for a specific address
export async function getBalanceController(req: Request<{address: ContractAdr}>, res: Response) {
    try {
        const { address } = req.params;

        if (!address || address.length !== 42 || !address.startsWith('0x')) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address',
            });
        }

        const balanceInfo = await getBalance(address);
        res.status(200).json({
            success: true,
            data: balanceInfo,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
}

// Transfer tokens from one address to another (requires approval)
export async function transferFromController(req: Request, res: Response) {
    try {
        const { privateKey, from, to, amount } = req.body;

        // Input validation
        if (!privateKey || !from || !to || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: privateKey, from, to, amount',
            });
        }

        if (!from.startsWith('0x') || !to.startsWith('0x') || from.length !== 42 || to.length !== 42) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address format',
            });
        }

        const amountNumber = Number(amount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number',
            });
        }

        const result = await executeTransferFrom(privateKey, from, to, amount);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
}

// Approve tokens for a spender
export async function approveTokensController(req: Request, res: Response) {
    try {
        const { privateKey, spender, amount } = req.body;

        // Input validation
        if (!privateKey || !spender || !amount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: privateKey, spender, amount',
            });
        }

        if (!spender.startsWith('0x') || spender.length !== 42) {
            return res.status(400).json({
                success: false,
                error: 'Invalid Ethereum address format',
            });
        }

        const amountNumber = Number(amount);
        if (isNaN(amountNumber) || amountNumber <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Amount must be a positive number',
            });
        }

        const result = await approveTokens(privateKey, spender, amount);
        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({
            success: false,
            error: errorMessage,
        });
    }
}
