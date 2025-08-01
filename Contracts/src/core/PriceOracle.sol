// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

// PriceOracle fetches ETH/USDT price using Chainlink's Aggregator
contract PriceOracle {
    // Chainlink price feed contract (ETH/USDT)
    AggregatorV3Interface public priceFeed;

    // Constructor sets the Chainlink price feed address
    // Example ETH/USDT feed on Sepolia: 0x694AA1769357215DE4FAC081bf1f309aDC325306
    constructor(address _aggregator) {
        priceFeed = AggregatorV3Interface(_aggregator);
    }

    // Returns the latest ETH/USDT price from Chainlink
    function getLatestPrice() external view returns (int256) {
        (, int256 price, , ,) = priceFeed.latestRoundData();
        return price;
    }

    // Returns the number of decimals used in the price feed
    function getDecimals() external view returns (uint8) {
        return priceFeed.decimals();
    }
}
