// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IVault {
    struct Userdata {
        uint deposited;
        uint locked;
        uint available;
    }

    function setPositionManager(address _positionManager) external;

    function deposit(uint _amount) external;

    function withdrawl(uint _amount) external;

    function lockCollateral(address _user, uint _amount) external;

    function unlockCollateral(address _user, uint _amount) external;

    function transferCollateral(address _to, uint _amount) external;

    function getUserColletral() external view returns (Userdata memory);

    function getUtilizationRate() external view returns (uint);

    function getTotalLiqudity() external view returns (uint);

    function absorbLiquidatedCollateral(address _user, uint _amount) external;
}
