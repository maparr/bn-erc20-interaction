// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "./ERC20.sol";

contract MyToken is ERC20 {
    address public owner;

    constructor(string memory _name, string memory _symbol, uint8 _decimals)
    ERC20(_name, _symbol, _decimals)
    {
        owner = msg.sender;
        // Mint 1,000,000 tokens to msg.sender
        // 1 token = 10 ** decimals
        _mint(msg.sender, 1_000_000 * 10 ** uint256(_decimals));
    }

    // Only owner can mint new tokens
    function mint(address to, uint256 amount) external {
        require(msg.sender == owner, "Only owner can mint");
        _mint(to, amount);
    }

    // Allow token burning
    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }
}
