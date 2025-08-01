// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title Interface for PriceOracle
/// @dev Used to fetch price and decimals from Chainlink-based oracle
interface IPriceOracle {
    function getLatestPrice() external view returns (int256);
    function getDecimals() external view returns (uint8);
}
