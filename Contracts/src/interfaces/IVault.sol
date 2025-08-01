// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IVault {
    // User functions
    function deposit(uint256 _amount) external;
    function withdrawal(uint256 _amount) external;
    function getUserCollateral() external view returns (
        uint256 deposited,
        uint256 locked,
        uint256 available
    );
    function getUtilizationRate() external view returns (uint256);
    function getTotalLiquidity() external view returns (uint256);

    // Manager-only functions
    function lockCollateral(address _user, uint256 _amount) external;
    function unlockCollateral(address _user, uint256 _amount) external;
    function transferCollateral(address _to, uint256 _amount) external;
    function absorbLiquidatedCollateral(address _user, uint256 _amount) external;

    // Admin
    function setPositionManager(address _positionManager) external;
}
