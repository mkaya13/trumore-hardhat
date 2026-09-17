// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @notice Legacy test-only ERC20 fixture; native payments do not use this contract.
contract MockUSDC is ERC20, Ownable {
    constructor() ERC20("Testnet USDC", "USDC") Ownable(msg.sender) {}

    function decimals() public pure override returns (uint8) {
        return 6;
    }

    function mint(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "MockUSDC: zero recipient");
        _mint(to, amount);
    }
}
