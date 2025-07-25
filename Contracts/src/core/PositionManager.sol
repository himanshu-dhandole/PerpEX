// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IPriceOracle.sol";
import "../interfaces/IPositionNFT.sol";
import "../interfaces/IVirtualAMM.sol";
import "../interfaces/IVault.sol";

contract PositionManager is Ownable, ReentrancyGuard {
    struct Position {
        address user;
        uint256 collateral;
        uint256 entryPrice;
        uint256 exitPrice;
        uint8 leverage;
        bool isLong;
        bool isOpen;
    }

    mapping(address => Position) positions;

    uint constant MAX_LEVERAGE = 50;
    uint constant TRADING_FEES = 500;
    uint public totalLong;
    uint public totalShort;
    uint public totalLongColletral;
    uint public totalShortColleteral;
    uint public lastFundingTime;

    IPriceOracle public priceOracle;
    IPositionNFT public positionNFT;
    IVirtualAMM public virtualAMM;
    IVault public vault;

    constructor(
        address _IPriceOracle,
        address _IPositionNFT,
        address _IVirtualAMM,
        address _IVault
    ) Ownable(msg.sender) {
        priceOracle = IPriceOracle(_IPriceOracle);
        positionNFT = IPositionNFT(_IPositionNFT);
        virtualAMM = IVirtualAMM(_IVirtualAMM);
        vault = IVault(_IVault);
    }

    function openPosition(
        uint _colleteral,
        uint _leverage,
        bool _isLong
    ) public nonReentrant {
        require(_colleteral > 0, "cannot be ZERO");
        require(_leverage <= MAX_LEVERAGE, "Leaverage too high");
        uint fees = ((_colleteral * _leverage) / TRADING_FEES) / 10000;
        require(_colleteral > fees, "Insuffecient funds");
        uint netColleteral = _colleteral - fees;

        vault.lockCollateral(msg.sender, _colleteral);
        virtualAMM.updateReserve(netColleteral * _leverage, _isLong);

        uint _entryPrice = uint(priceOracle.getLatestPrice());

        positions[msg.sender] = Position({
            user: msg.sender,
            collateral: netColleteral,
            entryPrice: _entryPrice,
            exitPrice: 0,
            leverage: uint8(_leverage),
            isLong: _isLong,
            isOpen: true
        });

        if (_isLong) {
            totalLong += netColleteral * _leverage;
            totalLongColletral += netColleteral;
        } else {
            totalShort += netColleteral * _leverage;
            totalShortColleteral += netColleteral;
        }

        positionNFT.mintPosition(msg.sender, netColleteral, uint8(_leverage), _entryPrice, _isLong);
    }

    function closePosition() public nonReentrant {}

    function settleFundingRate() public {}
}
