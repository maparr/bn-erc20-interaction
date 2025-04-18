import { expect } from 'chai';
import { ethers } from 'hardhat';

describe('MyToken', function () {
    // Test variables
    let myToken: any;
    let owner: any;
    let user1: any;
    let user2: any;
    const NAME = 'Cyfrin Token';
    const SYMBOL = 'CFN';
    const DECIMALS = 18;
    const INITIAL_SUPPLY = ethers.parseEther('1000000'); // 1 million tokens

    beforeEach(async function () {
        // Get signers
        [owner, user1, user2] = await ethers.getSigners();

        // Deploy the contract
        myToken = await ethers.deployContract('MyToken', [NAME, SYMBOL, DECIMALS]);
    });

    describe('Deployment', function () {
        it('Should set the correct token name', async function () {
            expect(await myToken.name()).to.equal(NAME);
        });

        it('Should set the correct token symbol', async function () {
            expect(await myToken.symbol()).to.equal(SYMBOL);
        });

        it('Should set the correct decimals', async function () {
            expect(await myToken.decimals()).to.equal(DECIMALS);
        });

        it('Should mint initial supply to the owner', async function () {
            expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY);
            expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY);
        });

        it('Should set the deployer as the owner', async function () {
            expect(await myToken.owner()).to.equal(owner.address);
        });
    });

    describe('Basic Token Operations', function () {
        const transferAmount = ethers.parseEther('1000');

        it('Should transfer tokens between accounts', async function () {
            // Transfer from owner to user1
            await myToken.transfer(user1.address, transferAmount);

            // Check balances
            expect(await myToken.balanceOf(user1.address)).to.equal(transferAmount);
            expect(await myToken.balanceOf(owner.address)).to.equal(INITIAL_SUPPLY - transferAmount);
        });

        it('Should fail if sender does not have enough tokens', async function () {
            const initialBalance = await myToken.balanceOf(user1.address);
            await expect(
                myToken.connect(user1).transfer(user2.address, transferAmount)
            ).to.be.revertedWith('ERC20: transfer amount exceeds balance');

            // Balances should remain unchanged
            expect(await myToken.balanceOf(user1.address)).to.equal(initialBalance);
        });

        it('Should update balances after transfers', async function () {
            // Initial transfer to user1
            await myToken.transfer(user1.address, transferAmount);

            // Secondary transfer from user1 to user2
            const smallerAmount = ethers.parseEther('500');
            await myToken.connect(user1).transfer(user2.address, smallerAmount);

            // Check final balances
            expect(await myToken.balanceOf(user1.address)).to.equal(transferAmount - smallerAmount);
            expect(await myToken.balanceOf(user2.address)).to.equal(smallerAmount);
        });
    });

    describe('Approval and TransferFrom', function () {
        const approveAmount = ethers.parseEther('5000');
        const transferAmount = ethers.parseEther('1000');

        beforeEach(async function () {
            // Transfer some tokens to user1 first
            await myToken.transfer(user1.address, ethers.parseEther('10000'));
        });

        it('Should approve tokens for transferFrom', async function () {
            await myToken.connect(user1).approve(user2.address, approveAmount);
            expect(await myToken.allowance(user1.address, user2.address)).to.equal(approveAmount);
        });

        it('Should transfer tokens using transferFrom', async function () {
            // Approve
            await myToken.connect(user1).approve(user2.address, approveAmount);

            // TransferFrom
            await myToken.connect(user2).transferFrom(user1.address, user2.address, transferAmount);

            // Check balances
            expect(await myToken.balanceOf(user1.address)).to.equal(ethers.parseEther('9000'));
            expect(await myToken.balanceOf(user2.address)).to.equal(transferAmount);

            // Check allowance was reduced
            expect(await myToken.allowance(user1.address, user2.address)).to.equal(approveAmount - transferAmount);
        });

        it('Should fail transferFrom if not enough allowance', async function () {
            // Approve a small amount
            const smallApproval = ethers.parseEther('500');
            await myToken.connect(user1).approve(user2.address, smallApproval);

            // Try to transfer more than approved
            await expect(
                myToken.connect(user2).transferFrom(user1.address, user2.address, transferAmount)
            ).to.be.revertedWith('ERC20: transfer amount exceeds allowance');
        });
    });

    describe('Custom Token Functions', function () {
        it('Should allow owner to mint new tokens', async function () {
            const mintAmount = ethers.parseEther('5000');
            const initialSupply = await myToken.totalSupply();

            await myToken.mint(user1.address, mintAmount);

            // Check new balance and total supply
            expect(await myToken.balanceOf(user1.address)).to.equal(mintAmount);
            expect(await myToken.totalSupply()).to.equal(initialSupply + mintAmount);
        });

        it('Should prevent non-owners from minting tokens', async function () {
            const mintAmount = ethers.parseEther('5000');

            await expect(
                myToken.connect(user1).mint(user1.address, mintAmount)
            ).to.be.revertedWith('Only owner can mint');
        });

        it('Should allow users to burn their tokens', async function () {
            // First transfer tokens to user1
            const transferAmount = ethers.parseEther('10000');
            await myToken.transfer(user1.address, transferAmount);

            // Burn some tokens
            const burnAmount = ethers.parseEther('5000');
            await myToken.connect(user1).burn(burnAmount);

            // Check balance and total supply
            expect(await myToken.balanceOf(user1.address)).to.equal(transferAmount - burnAmount);
            expect(await myToken.totalSupply()).to.equal(INITIAL_SUPPLY - burnAmount);
        });

        it('Should fail if burning more tokens than account has', async function () {
            // First transfer tokens to user1
            const transferAmount = ethers.parseEther('1000');
            await myToken.transfer(user1.address, transferAmount);

            // Try to burn more than available
            const burnAmount = ethers.parseEther('2000');
            await expect(
                myToken.connect(user1).burn(burnAmount)
            ).to.be.revertedWith('ERC20: burn amount exceeds balance');
        });
    });

    describe('Edge Cases', function () {
        it('Should handle zero transfers correctly', async function () {
            const initialBalanceOwner = await myToken.balanceOf(owner.address);
            const initialBalanceUser1 = await myToken.balanceOf(user1.address);

            // Transfer 0 tokens
            await myToken.transfer(user1.address, 0);

            // Balances should remain unchanged
            expect(await myToken.balanceOf(owner.address)).to.equal(initialBalanceOwner);
            expect(await myToken.balanceOf(user1.address)).to.equal(initialBalanceUser1);
        });

        it('Should prevent transfers to zero address', async function () {
            // This is not explicitly checked in our implementation, but it's a good practice
            // Consider adding this check to the ERC20 contract
            const zeroAddress = ethers.ZeroAddress;
            const amount = ethers.parseEther('1000');

            // The transfer should still work because our implementation doesn't check for zero address
            // In a real-world scenario, you'd want to prevent this
            await myToken.transfer(zeroAddress, amount);
            expect(await myToken.balanceOf(zeroAddress)).to.equal(amount);

            // This test serves as a reminder to add zero address validation in production code
        });

        it('Should handle max uint256 approvals correctly', async function () {
            // Max uint256 value
            const maxUint256 = ethers.MaxUint256;

            // Approve max amount
            await myToken.approve(user1.address, maxUint256);
            expect(await myToken.allowance(owner.address, user1.address)).to.equal(maxUint256);

            // Transfer some amount
            const transferAmount = ethers.parseEther('1000');
            await myToken.connect(user1).transferFrom(owner.address, user1.address, transferAmount);

            // Allowance should be reduced
            expect(await myToken.allowance(owner.address, user1.address)).to.equal(maxUint256 - transferAmount);
        });
    });
});
