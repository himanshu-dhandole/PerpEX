// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IVirtualAMM {
    function updateReserve(uint256 _amount, bool _isLong) external;

    function calculateFundingRate() external view returns (int256);

    function getCurrentPrice() external view returns (uint256, bool);

    function getCurrentFundingRate() external view returns (int256);
}
