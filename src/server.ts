import app from './app';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📚 API Documentation:`);
    console.log(`  - GET /api/health: Check API status`);
    console.log(`  - GET /api/token: Get token information`);
    console.log(`  - GET /api/balance/:address: Get balance for a specific address`);
    console.log(`  - POST /api/transfer-from: Execute transferFrom operation`);
    console.log(`  - POST /api/approve: Approve tokens for a spender`);
});
