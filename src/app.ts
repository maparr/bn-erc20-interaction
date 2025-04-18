import express from 'express';
import cors from 'cors';
import {
    getTokenInfoController,
    getBalanceController,
    transferFromController,
    approveTokensController,
} from './controllers/tokenController';

// Initialize express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/health', (_, res) => {
    res.status(200).json({ status: 'ok', message: 'ERC20 API is running' });
});

// Token information
app.get('/api/token', getTokenInfoController);

// Get balance
app.get('/api/balance/:address', getBalanceController);

// TransferFrom operation
app.post('/api/transfer-from', transferFromController);

// Approve tokens
app.post('/api/approve', approveTokensController);

// Not found handler
app.use((_, res) => {
    res.status(404).json({ success: false, error: 'Route not found' });
});

// Error handler
app.use((err: Error, _: express.Request, res: express.Response, __: express.NextFunction) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: err.message,
    });
});

export default app;
