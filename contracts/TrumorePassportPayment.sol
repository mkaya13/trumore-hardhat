// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Address} from "@openzeppelin/contracts/utils/Address.sol";

contract TrumorePassportPayment is Ownable, AccessControl, Pausable, ReentrancyGuard {
    using Address for address payable;

    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    uint256 public passportPrice;
    address public treasury;

    event PassportPurchased(address indexed buyer, bytes32 indexed vehicleId, uint256 amount, address indexed token, uint256 timestamp);
    event PassportPriceUpdated(uint256 previousPrice, uint256 newPrice);
    event TreasuryUpdated(address indexed previousTreasury, address indexed newTreasury);

    constructor(uint256 initialPrice, address initialTreasury) Ownable(msg.sender) {
        require(initialPrice > 0, "Payment: zero price");
        require(initialTreasury != address(0), "Payment: zero treasury");
        passportPrice = initialPrice;
        treasury = initialTreasury;
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
    }

    function purchasePassport(bytes32 vehicleId) external payable whenNotPaused nonReentrant {
        require(vehicleId != bytes32(0), "Payment: zero vehicle id");
        require(msg.value == passportPrice, "Payment: incorrect value");
        payable(treasury).sendValue(msg.value);
        emit PassportPurchased(msg.sender, vehicleId, passportPrice, address(0), block.timestamp);
    }

    function setPassportPrice(uint256 newPrice) external onlyOwner {
        require(newPrice > 0, "Payment: zero price");
        uint256 previous = passportPrice;
        passportPrice = newPrice;
        emit PassportPriceUpdated(previous, newPrice);
    }

    function setTreasury(address newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Payment: zero treasury");
        address previous = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(previous, newTreasury);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }
}
