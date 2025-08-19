import { title } from "@/components/primitives";
import DefaultLayout from "@/layouts/default";
import { useState } from "react";
import { useAccount } from "wagmi";
import { config } from "@/config/wagmiConfig";
import { getPublicClient, getWalletClient } from "wagmi/actions";
import { readContract, writeContract } from "viem/actions";
import { formatUnits } from "viem";

import VUSDT_ABI from "@/abis/vusdt.json";
import VAULT_ABI from "@/abis/vault.json";
import PRICE_ORACLE_ABI from "@/abis/priceOracle.json";
import POSITION_MANAGER_ABI from "@/abis/positionManager.json";
import POSITION_NFT_ABI from "@/abis/positionNFT.json";
import VAMM_ABI from "@/abis/vamm.json";

export default function DocsPage() {
  const VUSDT_ADDRESS = import.meta.env.VITE_VUSDT_ADDRESS;
  const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
  const PRICE_ORACLE_ADDRESS = import.meta.env.VITE_PRICE_ORACLE_ADDRESS;
  const POSITION_MANAGER_ADDRESS = import.meta.env
    .VITE_POSITION_MANAGER_ADDRESS;
  const VAMM_ADDRESS = import.meta.env.VITE_VAMM_ADDRESS;
  const POSITION_NFT_ADDRESS = import.meta.env.VITE_POSITION_NFT_ADDRESS;

  const { address } = useAccount();

  const [balance, setBalance] = useState(0);
  const [minting, setMinting] = useState(false);
  const [vaultData, setVaultData] = useState({
    deposited: "0.00",
    locked: "0.00",
    available: "0.00",
  });
  const [price, setPrice] = useState();
  const [tokennID, setTokenID] = useState("");

  const loadBalance = async () => {
    if (!address) return;

    try {
      const publicClient = getPublicClient(config);

      const balanceUSDT = await readContract(publicClient, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "balanceOf",
        args: [address],
      });

      setBalance(Number(balanceUSDT) / 1e18);
    } catch (error) {
      console.error("Failed to fetch balance:", error);
      alert("Could not load balance.");
    }
  };
  const loadVaultBalances = async () => {
    if (!address) return;

    try {
      const publicClient = getPublicClient(config);

      const result = await readContract(publicClient, {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getUserCollateral",
        args: [],
        account: address,
      });

      console.log("Vault getUserCollateral result:", result);

      // Destructure if it's an object
      const { deposited, locked, available } = result as {
        deposited: bigint;
        locked: bigint;
        available: bigint;
      };

      setVaultData({
        deposited: formatUnits(deposited, 18),
        locked: formatUnits(locked, 18),
        available: formatUnits(available, 18),
      });
    } catch (error) {
      console.error("Failed to fetch vault balances:", error);
      alert("Could not load vault balances.");
    }
  };

  const mintTokens = async () => {
    if (!address) return;

    try {
      setMinting(true);

      const walletClient = await getWalletClient(config);

      await writeContract(walletClient, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "mint",
        args: [address, BigInt(1000e18)], // 1000 VUSDT
      });

      alert("Mint successful!");
      await loadBalance();
    } catch (error) {
      console.error("Mint failed:", error);
      alert("Mint failed. Are you the owner?");
    } finally {
      setMinting(false);
    }
  };

  // const loadCurrentPrice = async () => {
  //   if (!address) return;

  //   try {
  //     const publicClient = getPublicClient(config);

  //     const [price , isValid] = await readContract(publicClient, {
  //       address: VAMM_ADDRESS,
  //       abi: VAMM_ABI,
  //       functionName: "getCurrentPrice",
  //     });

  //     console.log("Current price:", price);
  //   } catch (error) {
  //     console.error("Failed to fetch current price:", error);
  //     alert("Could not load current price.");
  //   }
  // };

  const loadCurrentPrice = async () => {
    try {
      const publicClient = getPublicClient(config);
      console.log("Fetching current price...");
      const rawPrice = await readContract(publicClient, {
        address: PRICE_ORACLE_ADDRESS,
        abi: PRICE_ORACLE_ABI,
        functionName: "getLatestPrice",
        args: [],
      });
        console.log("Raw price:", rawPrice);
  
      const decimals = await readContract(publicClient, {
        address: PRICE_ORACLE_ADDRESS,
        abi: PRICE_ORACLE_ABI,
        functionName: "getDecimals",
        args: [],
      });
      console.log("Decimals:", decimals);
    } catch (error) {
      console.error("Failed to fetch current price:", error);
    }
  };

  const loadPositionData = async () => {
    if (!address) return;
    try {
      const publicClient = getPublicClient(config);

      const tokenId = await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getUserOpenPositions",
        args: [address],
      });

      console.log("User's open positions:", tokenId);
      setTokenID(String(tokenId));

      const positionData = await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getPosition",
        args: [tokenId],
      });

      console.log("Position data:", positionData);
    } catch (error) {
      console.error("Failed to load position data:", error);
      alert("Could not load position data.");
    }
  };

  const openPos = async () => {
    if (!address) return;
    try {
      const walletClient = await getWalletClient(config);
      await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "openPosition",
        args: [100 * 1e18, 1, true],
      });
    } catch (error) {
      console.error("Failed to open position:", error);
      alert("Could not open position.");
    }
  };

  const closePosition = async () => {
    if (!address) return;

    try {
      const walletClient = await getWalletClient(config);
      await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "closePosition",
        args: [tokennID],
      });
    } catch (error) {
      console.error("Failed to close position:", error);
      alert("Could not close position.");
    }
  };

  const setInitialPrice = async () => {
    if (!address) return;
    try {
      const walletClient = await getWalletClient(config);
      console.log("Setting initial price...");
      await writeContract(walletClient, {
        address: VAMM_ADDRESS,
        abi: VAMM_ABI,
        functionName: "setInitialPrice",
        account: address,
      });

      console.log("Initial price set successfully");
    } catch (error) {
      console.error("Failed to set initial price:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className="flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block max-w-lg text-center justify-center">
          <h1 className={title()}>Docs</h1>
          <br />
          <button
            onClick={loadBalance}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Get vUSDT Balance
          </button>

          <button
            onClick={mintTokens}
            disabled={minting}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {minting ? "Minting..." : "Mint 1000 vUSDT"}
          </button>

          <button
            onClick={loadVaultBalances}
            className="mt-2 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Load Vault Balances
          </button>

          <h2 className="mt-4 text-xl font-semibold">
            Wallet: ${balance.toFixed(2)} vUSDT
          </h2>

          <div className="mt-4 text-left text-sm">
            <p>
              <strong>Deposited:</strong> {vaultData.deposited} vUSDT
            </p>
            <p>
              <strong>Locked:</strong> {vaultData.locked} vUSDT
            </p>
            <p>
              <strong>Available:</strong> {vaultData.available} vUSDT
            </p>
          </div>
        </div>

        <div>Latest price from Price Feed</div>
        <button
          onClick={loadCurrentPrice}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Price
        </button>
        <p>${price}</p>
      </section>

      <section>
        <h1>open Position</h1>
        <button
          onClick={openPos}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          open Long Pos
        </button>
      </section>

      <section>
        <button onClick={loadPositionData}> Load Position Data</button>
      </section>

      <hr />
      <hr />
      <button onClick={closePosition}>Close Position</button>

      <button
        onClick={setInitialPrice}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Set Initial Price
      </button>
    </DefaultLayout>
  );
}
