// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/core/PositionManager.sol";

// Mock interfaces
contract MockPriceFeed is IPriceOracle {
    int256 public price = 1000 * 1e18;
    uint8 public decimalsValue = 18;

    function setPrice(int256 _price) external {
        price = _price;
    }

    function getLatestPrice() external view override returns (int256) {
        return price;
    }

    function getDecimals() external view override returns (uint8) {
        return decimalsValue;
    }
}

contract MockVault is IVault {
    mapping(address => Userdata) public userdata;

    function lockCollateral(address user, uint256 amount) external override {
        userdata[user].locked += amount;
    }

    function unlockCollateral(address user, uint256 amount) external override {
        userdata[user].locked -= amount;
    }

    function transferCollateral(address to, uint256 amount) external override {
        userdata[to].available += amount;
    }

    function absorbLiquidatedCollateral(address user, uint256 amount) external override {
        userdata[user].locked = 0;
    }

    function setPositionManager(address) external override {}

    function deposit(uint256) external override {}

    function withdrawl(uint256) external override {}

    function getUserColletral() external view override returns (Userdata memory) {
        return userdata[msg.sender];
    }

    function getTotalLiqudity() external pure override returns (uint256) {
        return 0;
    }

    function getUtilizationRate() external pure override returns (uint256) {
        return 0;
    }
}


contract MockNFT is IPositionNFT {
    uint256 public nextId = 1;
    address public positionManager;
    mapping(uint256 => address) public owners;

    struct Position {
        uint256 tokenId;
        uint256 collateral;
        uint8 leverage;
        uint256 entryPrice;
        uint256 timestamp;
        int entryFundingRate;
        bool isLong;
        string symbol;
    }

    mapping(uint256 => Position) public positions;

    function mintPosition(
        address to,
        uint256 collateral,
        uint8 leverage,
        uint256 entryPrice,
        int entryFundingRate,
        bool isLong
    ) external override returns (uint256) {
        uint256 id = nextId++;
        owners[id] = to;
        positions[id] = Position(id, collateral, leverage, entryPrice, block.timestamp, entryFundingRate, isLong, "ETH");
        return id;
    }

    function burnPosition(uint256 tokenId) external override {
        delete owners[tokenId];
        delete positions[tokenId];
    }

    function updatePosition(uint256, uint256, uint256) external override {}

    function getPosition(uint256 tokenId) external view override returns (
        uint256, uint256, uint8, uint256, uint256, int, bool, string memory
    ) {
        Position memory pos = positions[tokenId];
        return (
            pos.tokenId,
            pos.collateral,
            pos.leverage,
            pos.entryPrice,
            pos.timestamp,
            pos.entryFundingRate,
            pos.isLong,
            pos.symbol
        );
    }

    function setPositionManager(address _positionManager) external{
        positionManager = _positionManager;
    }


    function getUserPositions(address) external pure override returns (uint256[] memory) {
        uint256[] memory mock = new uint256[](1);
        return mock;
    }

    function ownerOf(uint256 tokenId) external view override returns (address) {
        return owners[tokenId];
    }
}

contract MockAMM is IVirtualAMM {
    uint256 public price = 1000 * 1e18;
    int256 public fundingRate = 25;

    function updateReserve(uint256, bool) external override {}

    function setPositionManager(address) external override {}

    function setInitialPrice() external override {}

    function getCurrentPrice() external view override returns (uint256, bool) {
        return (price, true);
    }

    function calculateFundingRate() external view override returns (int256) {
        return fundingRate;
    }

    function setPrice(uint256 _price) external {
        price = _price;
    }

    function setFundingRate(int256 _rate) external {
        fundingRate = _rate;
    }
}

contract PositionManagerTest is Test {
    PositionManager public manager;
    MockPriceFeed public priceFeed;
    MockVault public vault;
    MockAMM public amm;
    MockNFT public nft;

    address user = address(0xBEEF);

    function setUp() public {
        priceFeed = new MockPriceFeed();
        vault = new MockVault();
        amm = new MockAMM();
        nft = new MockNFT();

        manager = new PositionManager(
            address(priceFeed),
            address(amm),
            address(vault),
            address(nft)
        );

        // Set PositionManager in NFT
        nft.setPositionManager(address(manager));
    }

    function testOpenPosition() public {
        vm.startPrank(user); // Start simulating actions from the user address

        manager.openPosition(1000e8, 5, true);

        vm.stopPrank(); // End the simulation

    }

    function testFailInvalidLeverage() public {
        vm.prank(user);
        manager.openPosition(1000e8, 25, true); // > MAX_LEVERAGE
    }

    function testClosePosition() public {
        vm.prank(user);
        manager.openPosition(1000e8, 5, true);

        uint256[] memory positions = nft.getUserPositions(user);
        vm.prank(user);
        manager.closePosition(positions[0]);
        // if no revert, considered pass
    }

    function testFailCloseNotOwner() public {
        vm.prank(user);
        manager.openPosition(1000e8, 5, true);

        address other = address(0x1234);
        uint256[] memory positions = nft.getUserPositions(user);

        vm.prank(other);
        manager.closePosition(positions[0]); // should revert
    }

    function testUpdateFundingRateAfterTime() public {
        skip(1 days + 1);
        manager.updateFundingRate(); // success expected
    }

    function testFailUpdateFundingRateTooSoon() public {
        manager.updateFundingRate(); // should revert
    }
}