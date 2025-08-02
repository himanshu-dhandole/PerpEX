// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";

import "../core/Vault.sol";
import "../core/PositionManager.sol";
import "../core/PriceOracle.sol";
import "../core/VirtualAMM.sol";
import "../Tokens/PositionNFT.sol";
import "../Tokens/vUSDT.sol";

contract DeployPerpex is Script {
    function run() external {
        // Load private key from .env or environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");

        // Broadcast transactions using deployer's key
        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy mock vUSDT token
        VirtualUSDT vUSDT = new VirtualUSDT();
        console.log("vUSDT deployed:", address(vUSDT));

        // 2. Deploy NFT
        PositionNFT nft = new PositionNFT("baseurl");
        console.log("PositionNFT deployed:", address(nft));

        // 3. Deploy PriceFeed
        PriceOracle feed = new PriceOracle(0x694AA1769357215DE4FAC081bf1f309aDC325306);
        console.log("PriceFeed deployed:", address(feed));

        // 4. Deploy Vault
        Vault vault = new Vault(address(address(vUSDT)));
        console.log("Vault deployed:", address(vault));

        // 5. Deploy vAMM
        VirtualAMM amm = new VirtualAMM(10000000000,10000000000, address(feed));
        console.log("vAMM deployed:", address(amm));

        // 6. Deploy PositionManager
        PositionManager manager = new PositionManager(
            address(feed),
            address(nft),
            address(amm),
            address(vault)
        );
        console.log("PositionManager deployed:", address(manager));

        // Set PositionManager in NFT contract if needed
        nft.setPositionManager(address(manager));
        vault.setPositionManager(address(manager));
        amm.setPositionManager(address(manager));

        vm.stopBroadcast();
    }
}