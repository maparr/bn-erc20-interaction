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

            await myToken.mint(user1.address, mint
