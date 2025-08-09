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

export default function DocsPage() {
  const VUSDT_ADDRESS = "0x03c9B33a9917FfB6d1a55E9d2a651FaE26771C29";
  const VAULT_ADDRESS = "0x029FBD1d07d90656543421B5E317e6320fe8A18c";

  const { address } = useAccount();

  const [balance, setBalance] = useState(0);
  const [minting, setMinting] = useState(false);
  const [vaultData, setVaultData] = useState({
    deposited: "0.00",
    locked: "0.00",
    available: "0.00",
  });

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
    const { deposited, locked, available } = result;

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

          <h2 className="mt-4 text-xl font-semibold">Wallet: ${balance.toFixed(2)} vUSDT</h2>

          <div className="mt-4 text-left text-sm">
            <p><strong>Deposited:</strong> {vaultData.deposited} vUSDT</p>
            <p><strong>Locked:</strong> {vaultData.locked} vUSDT</p>
            <p><strong>Available:</strong> {vaultData.available} vUSDT</p>
          </div>
        </div>
      </section>
    </DefaultLayout>
  );
}
