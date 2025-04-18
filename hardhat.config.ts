import dotenv from 'dotenv';
import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-chai-matchers';
import '@nomicfoundation/hardhat-ethers';
import '@nomicfoundation/hardhat-verify';

dotenv.config();

const config: HardhatUserConfig = {
    solidity: {
        version: '0.8.26',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    networks: {
        localhost: {
            url: 'http://127.0.0.1:8545',
        },
        // Add other networks like Sepolia or Goerli if needed
        // sepolia: {
        //   url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
        //   accounts: [process.env.PRIVATE_KEY || '']
        // }
    },
    paths: {
        sources: './contracts',
        tests: './test',
        cache: './cache',
        artifacts: './artifacts',
    },
};

export default config;
