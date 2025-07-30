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
        int entryFundingRate ;
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
    int public fundingRateAccumulated;


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
        int entryFundingRate = virtualAMM.calculateFundingRate() ;

        positions[msg.sender] = Position({
            user: msg.sender,
            collateral: netColleteral,
            entryPrice: _entryPrice,
            entryFundingRate : entryFundingRate ,
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

        positionNFT.mintPosition(msg.sender, netColleteral, uint8(_leverage), _entryPrice, entryFundingRate, _isLong);
    }

    function closePosition(uint256 tokenId, uint256 priceDelta) external {
        require(positionNFT.ownerOf(tokenId) == msg.sender, "Not position owner");
        require(priceDelta >= 0, "Size should be greater than 0");

        // Load position data
        (
            ,
            uint256 collateral,
            uint8 leverage,
            uint256 entryPrice,,
            int entryFundingRate,
            bool isLong,) = positionNFT.getPosition(tokenId);

        require(priceDelta >= collateral, "collateral delta too large");

        (uint currentPrice, bool isValid) = virtualAMM.getCurrentPrice();
        require(isValid, "Invalid Price");

        int finalPnl = _calculatePnl(isLong, leverage, collateral, entryPrice, currentPrice);
        int fundingReward = _calculateFundingReward(isLong, finalPnl, collateral, entryFundingRate);

        uint256 fees = ((collateral * leverage) * TRADING_FEES) / 1e6;
        int settledAmount = int(collateral) + finalPnl + fundingReward - int(fees);

        positionNFT.burnPosition(tokenId);
        delete positions[msg.sender];
        
        if ( (finalPnl + fundingReward) > 0) {
            vault.transferCollateral(msg.sender, uint((finalPnl + fundingReward)));
        }
        vault.unlockCollateral(msg.sender, uint(settledAmount));

    }

    function _calculatePnl(bool isLong, uint8 leverage, uint256 collateral, uint256 entryPrice, uint256 currentPrice) internal pure returns (int) {
        int priceChangePercentage;

        if (isLong) {
            priceChangePercentage = (int(currentPrice) * 1e18) / int(entryPrice) - 1e18;
        } else {
            priceChangePercentage = 1e18 - (int(currentPrice) * 1e18) / int(entryPrice);
        }

        int pnlPercent = (priceChangePercentage * int8(leverage)) / 1e18;
        return int(collateral) * pnlPercent / 1e18;
    }

    function _calculateFundingReward(bool isLong, int finalPnl, uint256 collateral, int entryFundingRate) internal view returns (int) {
        int settledAmount = int(collateral) + finalPnl;
        int fundingDelta = fundingRateAccumulated - entryFundingRate;
        int fundingReward = (settledAmount * fundingDelta) / 10000;

        if ((isLong && fundingDelta < 0) || (!isLong && fundingDelta > 0)) {
            return -fundingReward; // pay
        } else {
            return fundingReward; // receive
        }
    }


    function updateFundingRate() external onlyOwner(){
        require(block.timestamp >= lastFundingTime + 8 hours, "Funding rate can only be updated every 8 hours");
        int fundingRateBps = virtualAMM.calculateFundingRate();
        fundingRateAccumulated += fundingRateBps;
        lastFundingTime = block.timestamp;
    }
}