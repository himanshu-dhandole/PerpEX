// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/core/Vault.sol";
import "../src/tokens/vUSDT.sol";

contract VaultLockLogicTest is Test {
    Vault vault;
    VirtualUSDT virtualUSDT;

    address user = address(0xABCD);
    address positionManager = address(0xDEAD);

    function setUp() public {
        virtualUSDT = new VirtualUSDT();
        vault = new Vault(address(virtualUSDT));
        vault.setPositionManager(positionManager);

        vm.prank(address(this));
        virtualUSDT.mint(user, 1_000e6);

        vm.prank(user);
        virtualUSDT.approve(address(vault), type(uint256).max);

        vm.prank(user);
        vault.deposit(500e6);
    }

    function testLockCollateral() public {

        vm.prank(positionManager);
        vault.lockCollateral(user, 200e6);

        vm.prank(user);
        Vault.Userdata memory data = vault.getUserColletral();
        assertEq(data.available, 300e6);
        assertEq(data.locked, 200e6);
    }

    function testUnlockCollateral() public {
        vm.prank(positionManager);
        vault.lockCollateral(user, 200e6);

        vm.prank(positionManager);
        vault.unlockCollateral(user, 50e6);

        vm.prank(user);
        Vault.Userdata memory data = vault.getUserColletral();
        assertEq(data.locked, 150e6);
        assertEq(data.available, 350e6);
    }

    function testUtilizationRateUpdatesCorrectly() public {
        vm.prank(positionManager);
        vault.lockCollateral(user, 400e6); // 400/500 = 80%

        uint256 rate = vault.getUtilizationRate();
        assertEq(rate, 8000);
    }

    function test_RevertWhenLockExceedsAvailable() public {
        vm.prank(positionManager);
        vm.expectRevert("Insufficient available balance");
        vault.lockCollateral(user, 600e6);
    }

    function test_RevertWhenLockExceedsUtilization() public {
        vm.prank(positionManager);
        vm.expectRevert("Exceeds max utilization");
        vault.lockCollateral(user, 450e6);
    }

    function test_RevertUnlockTooMuch() public {
        vm.prank(positionManager);
        vault.lockCollateral(user, 200e6);

        vm.prank(positionManager);
        vm.expectRevert("Insufficient locked balance to unlock");
        vault.unlockCollateral(user, 300e6);
    }

    function test_RevertLockFromNonManager() public {
        vm.expectRevert("Only Position manager can access");
        vault.lockCollateral(user, 100e6);
    }

    function test_RevertUnlockFromNonManager() public {
        vm.expectRevert("Only Position manager can access");
        vault.unlockCollateral(user, 100e6);
    }
}
