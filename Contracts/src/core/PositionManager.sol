// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

import "../interfaces/IPriceOracle.sol";
import "../interfaces/IPositionNFT.sol";
import "../interfaces/IVirtualAMM.sol";
import "../interfaces/IVault.sol";

contract PositionManager is Ownable, ReentrancyGuard {
    // Constants
    uint256 public constant MAX_LEVERAGE = 50;
    uint256 public constant TRADING_FEES_BPS = 500; // 5%
    uint256 public constant LIQUIDATION_THRESHOLD_BPS = 500; // 5%
    uint256 public constant FUNDING_INTERVAL = 8 hours;

    // State
    uint256 public totalLong;
    uint256 public totalShort;
    uint256 public totalLongCollateral;
    uint256 public totalShortCollateral;
    uint256 public lastFundingTime;
    int256 public fundingRateAccumulated;
    bool public emergencyPause;

    // Interfaces
    IPriceOracle public priceOracle;
    IPositionNFT public positionNFT;
    IVirtualAMM public virtualAMM;
    IVault public vault;

    // Structs
    struct PositionData {
        uint256 collateral;
        uint8 leverage;
        uint256 entryPrice;
        int256 entryFundingRate;
        bool isLong;
    }

    // Events
    event PositionOpened(uint256 indexed tokenId, address indexed user, uint256 collateral, uint8 leverage, uint256 entryPrice, bool isLong);
    event PositionClosed(uint256 indexed tokenId, address indexed user, int256 pnl, int256 fundingPayment, uint256 fees);
    event PositionLiquidated(uint256 indexed tokenId, address indexed user, address indexed liquidator, uint256 liquidationReward);
    event FundingRateUpdated(int256 newRate, int256 accumulated);
    event EmergencyPauseToggled(bool paused);

    // Errors
    error ContractPaused();
    error InsufficientCollateral();
    error InvalidLeverage();
    error InsufficientFunds();
    error PositionNotFound();
    error NotPositionOwner();
    error PositionNotLiquidatable();
    error FundingTooEarly();

    modifier whenNotPaused() {
        if (emergencyPause) revert ContractPaused();
        _;
    }

    constructor(
        address _priceOracle,
        address _positionNFT,
        address _virtualAMM,
        address _vault
    ) Ownable(msg.sender) {
        priceOracle = IPriceOracle(_priceOracle);
        positionNFT = IPositionNFT(_positionNFT);
        virtualAMM = IVirtualAMM(_virtualAMM);
        vault = IVault(_vault);
        lastFundingTime = block.timestamp;
    }

    function openPosition(
        uint256 collateral,
        uint8 leverage,
        bool isLong
    ) external nonReentrant whenNotPaused {
        if (collateral == 0) revert InsufficientCollateral();
        if (leverage == 0 || leverage > MAX_LEVERAGE) revert InvalidLeverage();

        uint256 notionalSize = collateral * leverage;
        uint256 fees = (collateral * TRADING_FEES_BPS) / 10000;
        if (collateral <= fees) revert InsufficientFunds();
        uint256 netCollateral = collateral - fees;

        vault.lockCollateral(msg.sender, netCollateral);
        virtualAMM.updateReserve(notionalSize, isLong);

        uint256 entryPrice = uint256(priceOracle.getLatestPrice());
        int256 entryFundingRate = virtualAMM.calculateFundingRate();

        if (isLong) {
            totalLong += notionalSize;
            totalLongCollateral += netCollateral;
        } else {
            totalShort += notionalSize;
            totalShortCollateral += netCollateral;
        }

        uint256 tokenId = positionNFT.mintPosition(
            msg.sender,
            netCollateral,
            leverage,
            entryPrice,
            entryFundingRate,
            isLong
        );

        emit PositionOpened(tokenId, msg.sender, netCollateral, leverage, entryPrice, isLong);
    }

    function closePosition(uint256 tokenId) external nonReentrant whenNotPaused {
        (PositionData memory pos, address owner, bool isOpen) = _getPositionData(tokenId);
        if (owner != msg.sender) revert NotPositionOwner();
        if (!isOpen) revert PositionNotFound();

        (uint256 currentPrice, bool isValid) = virtualAMM.getCurrentPrice();
        require(isValid, "Invalid price");

        uint256 notionalSize = pos.collateral * pos.leverage;
        uint256 fees = (pos.collateral * TRADING_FEES_BPS) / 10000;

        int256 pnl = _calculatePnl(pos.isLong, pos.leverage, pos.collateral, pos.entryPrice, currentPrice);
        int256 fundingPayment = _calculateFundingPayment(pos.isLong, pos.collateral, pos.entryFundingRate);
        int256 settlementAmount = int256(pos.collateral) + pnl - fundingPayment - int256(fees);

        if (pos.isLong) {
            totalLong -= notionalSize;
            totalLongCollateral -= pos.collateral;
        } else {
            totalShort -= notionalSize;
            totalShortCollateral -= pos.collateral;
        }

        positionNFT.burnPosition(tokenId);

        if (settlementAmount > 0) {
            vault.unlockCollateral(msg.sender, uint256(settlementAmount));
        } else {
            vault.absorbLiquidatedCollateral(msg.sender, pos.collateral);
        }

        emit PositionClosed(tokenId, msg.sender, pnl, fundingPayment, fees);
    }

    function liquidatePosition(uint256 tokenId) external nonReentrant whenNotPaused {
        (PositionData memory pos, address owner, bool isOpen) = _getPositionData(tokenId);
        if (owner == address(0) || !isOpen) revert PositionNotFound();

        if (!_isLiquidatable(pos.collateral, pos.leverage, pos.entryPrice, pos.entryFundingRate, pos.isLong)) {
            revert PositionNotLiquidatable();
        }

        (uint256 currentPrice, bool isValid) = virtualAMM.getCurrentPrice();
        require(isValid, "Invalid price");

        int256 pnl = _calculatePnl(pos.isLong, pos.leverage, pos.collateral, pos.entryPrice, currentPrice);
        int256 fundingPayment = _calculateFundingPayment(pos.isLong, pos.collateral, pos.entryFundingRate);
        uint256 liquidationReward = (pos.collateral * 200) / 10000;
        int256 remainingValue = int256(pos.collateral) + pnl - fundingPayment - int256(liquidationReward);

        uint256 notionalSize = pos.collateral * pos.leverage;
        if (pos.isLong) {
            totalLong -= notionalSize;
            totalLongCollateral -= pos.collateral;
        } else {
            totalShort -= notionalSize;
            totalShortCollateral -= pos.collateral;
        }

        positionNFT.burnPosition(tokenId);

        if (liquidationReward > 0) {
            vault.transferCollateral(msg.sender, liquidationReward);
        }

        if (remainingValue > 0) {
            vault.unlockCollateral(owner, uint256(remainingValue));
        }

        vault.absorbLiquidatedCollateral(owner, pos.collateral);

        emit PositionLiquidated(tokenId, owner, msg.sender, liquidationReward);
    }

    function updateFundingRate() external onlyOwner {
        if (block.timestamp < lastFundingTime + FUNDING_INTERVAL) revert FundingTooEarly();

        int256 fundingRateBps = virtualAMM.calculateFundingRate();
        fundingRateAccumulated += fundingRateBps;
        lastFundingTime = block.timestamp;

        emit FundingRateUpdated(fundingRateBps, fundingRateAccumulated);
    }

    function isPositionLiquidatable(uint256 tokenId) external view returns (bool) {
        (PositionData memory pos, , bool isOpen) = _getPositionData(tokenId);
        if (!isOpen) return false;
        return _isLiquidatable(pos.collateral, pos.leverage, pos.entryPrice, pos.entryFundingRate, pos.isLong);
    }

    function _getPositionData(uint256 tokenId) internal view returns (PositionData memory position, address owner, bool isOpen) {
        owner = positionNFT.ownerOf(tokenId);
        (
            ,
            uint256 collateral,
            uint8 leverage,
            uint256 entryPrice,
            ,
            int256 entryFundingRate,
            bool isLong,
            bool open,

        ) = positionNFT.getPosition(tokenId);

        position = PositionData(collateral, leverage, entryPrice, entryFundingRate, isLong);
        isOpen = open;
    }

    function _calculatePnl(
        bool isLong,
        uint8 leverage,
        uint256 collateral,
        uint256 entryPrice,
        uint256 currentPrice
    ) internal pure returns (int256) {
        int256 priceChangePercentage;

        if (isLong) {
            priceChangePercentage = (int256(currentPrice) * 1e18) / int256(entryPrice) - 1e18;
        } else {
            priceChangePercentage = 1e18 - (int256(currentPrice) * 1e18) / int256(entryPrice);
        }

        int256 pnlPercent = (priceChangePercentage * int256(uint256(leverage))) / 1e18;
        return (int256(collateral) * pnlPercent) / 1e18;
    }

    function _calculateFundingPayment(
        bool isLong,
        uint256 collateral,
        int256 entryFundingRate
    ) internal view returns (int256) {
        int256 fundingDelta = fundingRateAccumulated - entryFundingRate;
        int256 fundingPayment = (int256(collateral) * fundingDelta) / 10000;

        return isLong ? fundingPayment : -fundingPayment;
    }

    function _isLiquidatable(
        uint256 collateral,
        uint8 leverage,
        uint256 entryPrice,
        int256 entryFundingRate,
        bool isLong
    ) internal view returns (bool) {
        (uint256 currentPrice, bool isValid) = virtualAMM.getCurrentPrice();
        if (!isValid) return false;

        int256 pnl = _calculatePnl(isLong, leverage, collateral, entryPrice, currentPrice);
        int256 fundingPayment = _calculateFundingPayment(isLong, collateral, entryFundingRate);

        int256 remainingValue = int256(collateral) + pnl - fundingPayment;
        int256 maintenanceMargin = int256(collateral * LIQUIDATION_THRESHOLD_BPS) / 10000;

        return remainingValue <= maintenanceMargin;
    }

    function getPositionStats() external view returns (
        uint256 _totalLong,
        uint256 _totalShort,
        uint256 _totalLongCollateral,
        uint256 _totalShortCollateral,
        int256 _fundingRateAccumulated
    ) {
        return (
            totalLong,
            totalShort,
            totalLongCollateral,
            totalShortCollateral,
            fundingRateAccumulated
        );
    }
}
