// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "../interfaces/IPriceOracle.sol";

contract VirtualAMM is Ownable(msg.sender) {
    uint vETHreserve;
    uint vUSDTreserve;
    address positionManager;
    uint constant PRECISION = 1e18;
    IPriceOracle iPriceOracle;

    modifier _onlyPositionManager() {
        require(msg.sender == positionManager, "not accessible");
        _;
    }

    function setPositionManager(address _positionManager) public onlyOwner {
        require(_positionManager != address(0), "invalid");
        positionManager = _positionManager;
    }

    constructor(uint _vETHreserve, uint _vUSDTreserve, address _IPriceOracle) {
        vUSDTreserve = _vUSDTreserve;
        vETHreserve = _vETHreserve;
        iPriceOracle = IPriceOracle(_IPriceOracle);
    }

    function getCurrentPrice() public view returns (uint, bool) {
        if (vETHreserve == 0 || vUSDTreserve == 0) return (0, false);
        uint price = (vUSDTreserve * PRECISION) / vUSDTreserve;
        return (price, true);
    }

    function updateReserve(uint _amount, bool _isLong) public {
        require(_amount > 0);
        uint size = (_amount * vETHreserve) / (vUSDTreserve + _amount);
        if (_isLong) {
            vUSDTreserve += _amount;
            vETHreserve -= size;
        } else {
            vUSDTreserve -= _amount;
            vETHreserve += size;
        }
    }

    function setInitialPrice() external onlyOwner {
        uint price = uint(iPriceOracle.getLatestPrice());
        uint k = vETHreserve * vUSDTreserve;

        uint256 vETH = sqrt((k * PRECISION) / price);

        uint256 vUSDT = (price * vETH) / PRECISION;

        vETHreserve = vETH;
        vUSDTreserve = vUSDT;
    }

    function sqrt(uint x) internal pure returns (uint y) {
        if (x == 0) return 0;
        uint z = x / 2 + 1;
        y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
    }
}
