import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Gift, PieChart, TrendingUp, Lock, Coins } from "lucide-react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { getWalletClient } from "wagmi/actions";
import { parseUnits, formatUnits } from "viem";
import { config } from "@/config/wagmiConfig";
import { toast } from "react-hot-toast";

import VUSDT_ABI from "@/abis/vusdt.json";
import VAULT_ABI from "@/abis/vault.json";
import DefaultLayout from "@/layouts/default";

const VUSDT_ADDRESS = "0x03c9B33a9917FfB6d1a55E9d2a651FaE26771C29";
const VAULT_ADDRESS = "0x029FBD1d07d90656543421B5E317e6320fe8A18c";

export default function VaultPage() {
  const { address } = useAccount();
  const [vusdtBalance, setVusdtBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [totalSupply, setTotalSupply] = useState("0");

  const [vaultData, setVaultData] = useState({
    deposited: "0.00",
    locked: "0.00",
    available: "0.00",
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const [minting, setMinting] = useState(false);

  const loadBalances = async () => {
    if (!address) return;

    try {
      const [vusdtBal, ethBalHex, totalSupplyResult] = await Promise.all([
        readContract(config, {
          address: VUSDT_ADDRESS,
          abi: VUSDT_ABI,
          functionName: "balanceOf",
          args: [address],
        }),

        window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        }),

        readContract(config, {
          address: VUSDT_ADDRESS,
          abi: VUSDT_ABI,
          functionName: "totalSupply",
        }),
      ]);

      setVusdtBalance(formatUnits(vusdtBal as bigint, 18));
      setEthBalance(formatUnits(BigInt(ethBalHex as string), 18));
      setTotalSupply(formatUnits(totalSupplyResult as bigint, 18));
    } catch (error) {
      console.error("Error loading balances:", error);
    }
  };

  const loadVaultBalances = async () => {
    if (!address) return;

    try {
      const result = await readContract(config, {
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
      toast.error("Could not load vault balances.");
    }
  };

  const handleAirdrop = async () => {
    if (!address) return;

    try {
      console.log("Checking airdrop status...");
      const hasClaimed = await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "hasClaimed",
        args: [address],
      });

      if (hasClaimed) {
        toast.error("You already claimed your airdrop.");
        return;
      }

      console.log("Calling limitedMint...");
          
      await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "limitedMint",
        args: [],
      });

      console.log("Airdrop success!");
      toast.success("Airdrop successful!");
      await loadBalances();
      await loadVaultBalances();
    } catch (err) {
      console.error("Airdrop failed:", err);
      toast.error("Airdrop failed. See console for details.");
    }
  };

  const mintTokens = async () => {
    if (!address) return;

    try {
      setMinting(true);

      await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "mint",
        args: [address, BigInt(1000e18)], // 1000 VUSDT
      });

      toast.success("Mint successful!");
      await loadBalances();
      await loadVaultBalances();
    } catch (error) {
      console.error("Mint failed:", error);
      toast.error("Mint failed. Are you the owner?");
    } finally {
      setMinting(false);
    }
  };

  const handleDeposit = async () => {
    try {
      const amt = parseUnits(depositAmount, 18);

      await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "approve",
        args: [VAULT_ADDRESS, amt],
      });

      await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [amt],
      });

      toast.success("Deposit successful!");
      setDepositAmount("");
      await loadBalances();
      await loadVaultBalances();
    } catch (err) {
      console.error("Deposit error:", err);
      toast.error("Deposit failed");
    }
  };

  const handleWithdraw = async () => {
    try {
      const amt = parseUnits(withdrawAmount, 18);

      await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "withdrawal", // updated function name
        args: [amt],
      });

      toast.success("Withdrawal successful!");
      setWithdrawAmount("");
      await loadBalances();
      await loadVaultBalances();
    } catch (err) {
      console.error("Withdraw error:", err);
      toast.error("Withdrawal failed");
    }
  };

  useEffect(() => {
    if (address) {
      loadBalances();
      loadVaultBalances();
    }
  }, [address]);

  return (
    <DefaultLayout>
      <div className="min-h-screen p-6 bg-background">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold">
              Manage <span className="text-violet-600">Vault</span> Funds
            </h1>
            <p className="text-foreground-500">
              Securely deposit, withdraw, and track your vUSDT
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Action Buttons Card */}
            <Card className="xl:col-span-1">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Gift className="text-success" size={18} />
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <Button
                  color="success"
                  size="lg"
                  onPress={handleAirdrop}
                  startContent={<Gift size={18} />}
                  className="w-full"
                >
                  Airdrop 10,000 vUSDT
                </Button>

                <Button
                  color="primary"
                  size="lg"
                  onPress={mintTokens}
                  isLoading={minting}
                  className="w-full"
                >
                  Mint 1000 vUSDT (Owner)
                </Button>
              </CardBody>
            </Card>

            {/* Vault Assets Card */}
            <Card className="xl:col-span-1 bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/20 dark:to-indigo-950/20 border-violet-200 dark:border-violet-800">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <PieChart className="text-violet-600" size={18} />
                  <h3 className="text-lg font-semibold">Vault Assets</h3>
                </div>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="text-success" size={14} />
                      <span className="text-sm text-foreground-500">
                        Deposited
                      </span>
                    </div>
                    <Chip color="success" variant="flat" size="sm">
                      {parseFloat(vaultData.deposited).toFixed(2)}
                    </Chip>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Lock className="text-warning" size={14} />
                      <span className="text-sm text-foreground-500">
                        Locked
                      </span>
                    </div>
                    <Chip color="warning" variant="flat" size="sm">
                      {parseFloat(vaultData.locked).toFixed(2)}
                    </Chip>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Coins className="text-primary" size={14} />
                      <span className="text-sm text-foreground-500">
                        Available
                      </span>
                    </div>
                    <Chip color="primary" variant="flat" size="sm">
                      {parseFloat(vaultData.available).toFixed(2)}
                    </Chip>
                  </div>
                </div>
                
                <Divider />
                
                <div className="bg-default-100 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-500">
                      Wallet vUSDT :
                    </span>
                    <span className="font-semibold text-violet-600">
                      {parseFloat(vusdtBalance).toLocaleString()} vUSDT
                    </span>
                  </div>
                </div>

                <div className="bg-violet-100 dark:bg-violet-900/20 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground-500">
                      Your Total Vault
                    </span>
                    <span className="font-semibold text-lg text-violet-700 dark:text-violet-300">
                      {parseFloat(vaultData.deposited).toFixed(2)} vUSDT
                    </span>
                  </div>
                </div>
              </CardBody>
            </Card>

            {/* Vault Operations Card */}
            <Card className="xl:col-span-2">
              <CardHeader>
                <h3 className="text-xl font-semibold">Vault Operations</h3>
              </CardHeader>
              <CardBody className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <ArrowUpCircle className="text-success" size={18} />
                      <h4 className="font-medium">Deposit to Vault</h4>
                    </div>
                    <Input
                      type="number"
                      label="Amount (vUSDT)"
                      placeholder="Enter deposit amount"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(e.target.value)}
                      size="lg"
                    />
                    <Button
                      color="success"
                      size="lg"
                      onPress={handleDeposit}
                      startContent={<ArrowUpCircle size={18} />}
                      className="w-full"
                      isDisabled={
                        !depositAmount || parseFloat(depositAmount) <= 0
                      }
                    >
                      Deposit
                    </Button>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <ArrowDownCircle className="text-danger" size={18} />
                      <h4 className="font-medium">Withdraw from Vault</h4>
                    </div>
                    <Input
                      type="number"
                      label="Amount (vUSDT)"
                      placeholder="Enter withdraw amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      size="lg"
                    />
                    <Button
                      color="danger"
                      variant="bordered"
                      size="lg"
                      onPress={handleWithdraw}
                      startContent={<ArrowDownCircle size={18} />}
                      className="w-full"
                      isDisabled={
                        !withdrawAmount || parseFloat(withdrawAmount) <= 0
                      }
                    >
                      Withdraw
                    </Button>
                  </div>
                </div>

                <div className="bg-default-100 p-4 rounded-lg">
                  <h5 className="font-medium mb-3">Quick Actions</h5>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setDepositAmount(
                          (parseFloat(vusdtBalance) * 0.25).toString()
                        )
                      }
                    >
                      25%
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setDepositAmount(
                          (parseFloat(vusdtBalance) * 0.5).toString()
                        )
                      }
                    >
                      50%
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() =>
                        setDepositAmount(
                          (parseFloat(vusdtBalance) * 0.75).toString()
                        )
                      }
                    >
                      75%
                    </Button>
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={() => setDepositAmount(vusdtBalance)}
                    >
                      Max
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          <Card className="bg-warning-50 dark:bg-warning-950/20 border-warning-200 dark:border-warning-800">
            <CardBody className="py-3">
              <div className="flex items-center justify-center space-x-2 text-warning-700 dark:text-warning-300">
                <Wallet size={16} />
                <span className="text-sm">
                  Always verify contract addresses and transaction details
                  before confirming.
                </span>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}