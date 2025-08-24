import { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Divider } from "@heroui/divider";
import {
  Wallet,
  ArrowUpCircle,
  ArrowDownCircle,
  Gift,
  TrendingUp,
  Lock,
  Coins,
  Shield,
  DollarSign,
} from "lucide-react";
import { useAccount } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { parseUnits, formatUnits } from "viem";
import { config } from "@/config/wagmiConfig";

import VUSDT_ABI from "@/abis/vusdt.json";
import VAULT_ABI from "@/abis/vault.json";
import DefaultLayout from "@/layouts/default";
import { toast, ToastContainer } from "react-toastify";

const VUSDT_ADDRESS = import.meta.env.VITE_VUSDT_ADDRESS;
const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;

export default function VaultPage() {
  const { address } = useAccount();
  const [vusdtBalance, setVusdtBalance] = useState("0");
  const [isLoading2, setIsLoading2] = useState(false);

  const [vaultData, setVaultData] = useState({
    locked: "0.00",
    available: "0.00",
  });

  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [loading, setIsLoading] = useState(false);

  const loadVaultBalances = async () => {
    if (!address) return;

    try {
      setIsLoading(true);

      const result = await readContract(config, {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getUserCollateral",
        args: [],
        account: address,
      });

      const {  locked, available } = result as {
        locked: bigint;
        available: bigint;
      };

      setVaultData({
        locked: formatUnits(locked, 18),
        available: formatUnits(available, 18),
      });

      // Load vUSDT balance
      const balance = (await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "balanceOf",
        args: [address],
      })) as bigint;

      setVusdtBalance(formatUnits(balance, 18));
    } catch (error) {
      console.error("Failed to fetch vault balances:", error);
      toast.error("Could not load vault balances.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAirdrop = async () => {
    if (!address) return;

    try {
      try {
        const hasClaimed = await readContract(config, {
          address: VUSDT_ADDRESS,
          abi: VUSDT_ABI,
          functionName: "hasClaimed",
          args: [address],
        });

        console.log("Airdrop claimed status:", hasClaimed);

        if (hasClaimed) {
          toast.error("You already claimed your airdrop.");
          return;
        }
      } catch (err) {
        console.error("Failed to check airdrop eligibility:", err);
      }

      await writeContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "limitedMint",
        args: [],
      });

      toast.success("Airdrop successful!");
      await loadVaultBalances();
    } catch (err) {
      console.error("Airdrop failed:", err);
      toast.error("Airdrop failed. See console for details.");
    } finally {
      await loadVaultBalances();
    }
  };

  const handleDeposit = async () => {
    try {
      setIsLoading(true);
      const amt = parseUnits(depositAmount, 18);

      // 1. Check allowance
      const allowance = (await readContract(config, {
        address: VUSDT_ADDRESS,
        abi: VUSDT_ABI,
        functionName: "allowance",
        args: [address, VAULT_ADDRESS],
      })) as any;

      console.log("Current allowance:", allowance.toString());

      // 2. Approve if needed
      if ((allowance as any) < amt) {
        await writeContract(config, {
          address: VUSDT_ADDRESS,
          abi: VUSDT_ABI,
          functionName: "approve",
          args: [VAULT_ADDRESS, amt],
        });
        console.log("Approved", amt.toString());
      }

      // 3. Deposit
      await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "deposit",
        args: [amt],
      });

      toast.success("Deposit successful!");
      setDepositAmount("");
      await loadVaultBalances();
    } catch (err) {
      console.error("Deposit error:", err);
      toast.error("Deposit failed");
    } finally {
      setIsLoading(false);
      await loadVaultBalances();
    }
  };

  const handleWithdraw = async () => {
    try {
      setIsLoading2(true);
      const amt = parseUnits(withdrawAmount, 18);

      await writeContract(config, {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "withdrawal",
        args: [amt],
      });

      toast.success("Withdrawal successful!");
      setWithdrawAmount("");
      await loadVaultBalances();
    } catch (err) {
      console.error("Withdraw error:", err);
      toast.error("Withdrawal failed");
    } finally {
      setIsLoading2(false);
      await loadVaultBalances();
    }
  };

  useEffect(() => {
    if (address) {
      loadVaultBalances();
    }
  }, [address]);

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto p-6">
          {/* Clean Header */}
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Vault Dashboard
            </h1>
            <p className="text-foreground-600">
              Manage your vUSDT deposits and withdrawals
            </p>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Vault Overview */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                    <TrendingUp size={20} className="text-violet-600" />
                    Portfolio Overview
                  </h2>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Balance Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    

                    <div className="text-center p-4 bg-default-50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        $ {parseFloat(vaultData.locked).toFixed(2)}
                      </div>
                      <div className="text-sm text-foreground-600 flex items-center justify-center gap-1">
                        <Lock size={14} />
                        Locked
                      </div>
                    </div>

                    <div className="text-center p-4 bg-default-50 rounded-lg">
                      <div className="text-2xl font-bold text-foreground mb-1">
                        $ {parseFloat(vaultData.available).toFixed(2)}
                      </div>
                      <div className="text-sm text-foreground-600 flex items-center justify-center gap-1">
                        <Coins size={14} />
                        Available
                      </div>
                    </div>
                  </div>

                  <Divider />

                  {/* Wallet Balance */}
                  <div className="flex items-center justify-between p-4 bg-violet-50 dark:bg-violet-950/20 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Wallet size={18} className="text-violet-600" />
                      <span className="font-medium text-foreground">
                        Wallet Balance
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-violet-600">
                        {parseFloat(vusdtBalance).toLocaleString()} vUSDT
                      </div>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Gift size={18} className="text-violet-600" />
                  Quick Actions
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Button
                  color="success"
                  onPress={handleAirdrop}
                  className="w-full justify-start"
                  variant="flat"
                >
                  <Gift size={16} />
                  Claim Airdrop (10k vUSDT)
                </Button>

             

                <Divider />

                <div className="p-3 bg-warning-50 dark:bg-warning-950/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Shield size={16} className="text-warning-600 mt-0.5" />
                    <div className="text-sm text-warning-700 dark:text-warning-300">
                      Always verify transaction details before confirming
                    </div>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Transaction Operations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Deposit */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ArrowUpCircle size={18} className="text-success" />
                  Deposit
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  type="number"
                  label="Amount"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  endContent={
                    <span className="text-sm text-foreground-500">vUSDT</span>
                  }
                />
                <Button
                  color="success"
                  onPress={handleDeposit}
                  className="w-full"
                  isLoading={loading}
                  isDisabled={!depositAmount || parseFloat(depositAmount) <= 0}
                >
                  <ArrowUpCircle size={16} />
                  Deposit to Vault
                </Button>
              </CardBody>
            </Card>

            {/* Withdraw */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <ArrowDownCircle size={18} className="text-danger" />
                  Withdraw
                </h3>
              </CardHeader>
              <CardBody className="space-y-4">
                <Input
                  type="number"
                  label="Amount"
                  placeholder="0.00"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  endContent={
                    <span className="text-sm text-foreground-500">vUSDT</span>
                  }
                />
                <Button
                  color="danger"
                  variant="bordered"
                  onPress={handleWithdraw}
                  className="w-full"
                  isDisabled={
                    !withdrawAmount || parseFloat(withdrawAmount) <= 0
                  }
                >
                  <ArrowDownCircle size={16} />
                  Withdraw from Vault
                </Button>
              </CardBody>
            </Card>
          </div>
        </div>
        <ToastContainer
          position="bottom-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          draggable
          theme="dark"
        />
      </div>
    </DefaultLayout>
  );
}
