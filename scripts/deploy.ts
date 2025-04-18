import { ethers } from 'hardhat';

async function main() {
    console.log('Deploying MyToken contract...');

    const [deployer] = await ethers.getSigners();
    console.log(`Deploying contracts with the account: ${deployer.address}`);

    const myToken = await ethers.deployContract('MyToken', ['Cyfrin Token', 'CFN', 18]);
    await myToken.waitForDeployment();

    const contractAddress = await myToken.getAddress();
    console.log(`MyToken deployed to: ${contractAddress}`);

    // Log additional token information
    const name = await myToken.name();
    const symbol = await myToken.symbol();
    const decimals = await myToken.decimals();
    const totalSupply = await myToken.totalSupply();

    console.log(`Token Details:`);
    console.log(`- Name: ${name}`);
    console.log(`- Symbol: ${symbol}`);
    console.log(`- Decimals: ${decimals}`);
    console.log(`- Total Supply: ${ethers.formatEther(totalSupply)} ${symbol}`);

    // Save the contract address to a file to use it in the backend application
    const fs = require('fs');
    const contractData = {
        address: contractAddress,
        deployer: deployer.address
    };

    if (!fs.existsSync('./src/config')) {
        fs.mkdirSync('./src/config', { recursive: true });
    }

    fs.writeFileSync(
        './src/config/contract-address.json',
        JSON.stringify(contractData, null, 2)
    );

    console.log('Contract address saved to src/config/contract-address.json');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
