// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPriceOracle.sol";

contract VirtualAMM is Ownable {
    uint256 public vETHreserve; // Virtual ETH reserve
    uint256 public vUSDTreserve; // Virtual USDT reserve
    address public positionManager; // Authorized manager contract
    uint256 public constant PRECISION = 1e8; // Decimal scaling
    IPriceOracle public iPriceOracle;

    event ReservesUpdated(uint256 vETHreserve, uint256 vUSDTreserve);

    modifier _onlyPositionManager() {
        require(msg.sender == positionManager, "not accessible");
        _;
    }

    constructor(
        uint256 _vETHreserve,
        uint256 _vUSDTreserve,
        address _IPriceOracle
    ) Ownable(msg.sender) {
        vETHreserve = _vETHreserve;
        vUSDTreserve = _vUSDTreserve;
        iPriceOracle = IPriceOracle(_IPriceOracle);
    }

    function setPositionManager(address _positionManager) external onlyOwner {
        require(_positionManager != address(0), "invalid");
        positionManager = _positionManager;
    }

    // Sets initial reserves based on Chainlink price and product k
    function setInitialPrice() external onlyOwner {
        uint256 price = uint256(iPriceOracle.getLatestPrice()) * 1e10;
        uint256 k = vETHreserve * vUSDTreserve;

        uint256 vETH = sqrt((k * PRECISION) / price);
        uint256 vUSDT = (price * vETH) / PRECISION;

        vETHreserve = vETH;
        vUSDTreserve = vUSDT;
    }

    // Returns current virtual price from reserves (vUSDT / vETH)
    function getCurrentPrice() public view returns (uint256, bool) {
        if (vETHreserve == 0 || vUSDTreserve == 0) return (0, false);
        uint256 price = (vUSDTreserve * PRECISION) / vETHreserve;
        return (price, true);
    }

    // Updates reserves after a long/short trade
    function updateReserve(uint256 _amount, bool _isLong) external _onlyPositionManager {
        require(_amount > 0, "invalid amount");
        require(vETHreserve > 0 && vUSDTreserve > 0, "invalid reserves");
        _amount /= 1e10 ;

        uint256 k = vETHreserve * vUSDTreserve;

        if (_isLong) {
            // Trader adds USDT, remove ETH to keep x*y=k
            vUSDTreserve += _amount;
            vETHreserve = k / vUSDTreserve;
        } else {
            // Trader removes USDT, add ETH to keep x*y=k
            require(vUSDTreserve > _amount, "underflow");
            vUSDTreserve -= _amount;
            vETHreserve = k / vUSDTreserve;
        }

        emit ReservesUpdated(vETHreserve, vUSDTreserve);
    }

    // Funding rate in basis points based on vAMM price vs spot price
    function calculateFundingRate() external view _onlyPositionManager returns (int256 fundingRateBps) {
        uint256 spotPrice = uint256(iPriceOracle.getLatestPrice());

        (uint256 vAMMPrice, bool isValid) = getCurrentPrice();
        if (!isValid || spotPrice == 0) return 0;

        int256 rawFundingRate = int256((vAMMPrice * 10000) / spotPrice) - 10000;

        if (rawFundingRate > 500) {
            fundingRateBps = 500;
        } else if (rawFundingRate < -500) {
            fundingRateBps = -500;
        } else {
            fundingRateBps = rawFundingRate;
        }
    }

    // Integer square root using Babylonian method
    function sqrt(uint256 x) internal pure returns (uint256 y) {
        if (x == 0) return 0;
        uint256 z = x / 2 + 1;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
