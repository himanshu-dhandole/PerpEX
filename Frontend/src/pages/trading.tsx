import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";

import DefaultLayout from "@/layouts/default";
import { config } from "@/config/wagmiConfig";
import { getPublicClient, getWalletClient } from "wagmi/actions";
import { readContract, writeContract } from "viem/actions";
import { formatUnits } from "viem";
import { useAccount } from "wagmi";

import {
  Activity,
  Badge,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  Target,
} from "lucide-react";

import VUSDT_ABI from "@/abis/vusdt.json";
import VAULT_ABI from "@/abis/vault.json";
import PRICE_ORACLE_ABI from "@/abis/priceOracle.json";
import POSITION_MANAGER_ABI from "@/abis/positionManager.json";
import POSITION_NFT_ABI from "@/abis/positionNFT.json";
import VAMM_ABI from "@/abis/vamm.json";
import { log } from "console";

export default function TradingPage() {
  const VUSDT_ADDRESS = import.meta.env.VITE_VUSDT_ADDRESS;
  const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
  const PRICE_ORACLE_ADDRESS = import.meta.env.VITE_PRICE_ORACLE_ADDRESS;
  const POSITION_MANAGER_ADDRESS = import.meta.env
    .VITE_POSITION_MANAGER_ADDRESS;
  const VAMM_ADDRESS = import.meta.env.VITE_VAMM_ADDRESS;
  const POSITION_NFT_ADDRESS = import.meta.env.VITE_POSITION_NFT_ADDRESS;

  const { address } = useAccount();

  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);
  const [priceChangePercent, setPriceChangePercent] = useState(0);
  const [tokenID, setTokenID] = useState(null);
  const [fundingRate, setFundingRate] = useState(0);

  const [vaultData, setVaultData] = useState({
    deposited: "0.00",
    locked: "0.00",
    available: "0.00",
  });

  // Trading states
  const [baseAmount, setBaseAmount] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [position, setPosition] = useState(null);
  const [entryPrice, setEntryPrice] = useState(0);
  const [pnl, setPnl] = useState(0);

  const positionSize = baseAmount * leverage;
  const leverageColor =
    leverage <= 10 ? "success" : leverage <= 50 ? "warning" : "danger";

  const loadCurrentPrice = async () => {
    try {
      const publicClient = getPublicClient(config);
      const res = await readContract(publicClient, {
        address: VAMM_ADDRESS,
        abi: VAMM_ABI,
        functionName: "getCurrentPrice",
      });
      const current = Number(res[0]);
      const isValid = res[1];

      if (isValid) {
        setCurrentPrice(current);
      }
    } catch (error) {
      console.error("Failed to load current price:", error);
    }
  };

  const loadVaultBalances = async () => {
    try {
      const result = await readContract(getPublicClient(config), {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getUserCollateral",
        args: [],
        account: address,
      });

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
      console.error("Failed to load vault balances:", error);
    }
  };

  
  const openPosition = async () => {
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

  useEffect(() => {
    loadVaultBalances();
  }, [address]);

  useEffect(() => {
    loadCurrentPrice();
    const interval = setInterval(loadCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <DefaultLayout>
      <div className="min-h-screen p-6 to-default-100">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Vault balances */}
          <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-none">
            <CardBody className="py-4">
              <div className="flex justify-center items-center space-x-8">
                <div className="flex items-center space-x-2">
                  <Avatar
                    className="w-8 h-8"
                    src="https://cryptologos.cc/logos/bitcoin-btc-logo.png"
                  />
                  <div>
                    <p className="text-sm text-foreground-500">
                      Available vUSDT :
                    </p>
                    <p className="font-bold">
                      ${Number(vaultData.available).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Divider orientation="vertical" className="h-8" />
                <div>
                  <p className="text-sm text-foreground-500">Locked vUSDT :</p>
                  <p className="font-bold">
                    ${Number(vaultData.locked).toFixed(2)}
                  </p>
                </div>
                <Divider orientation="vertical" className="h-8" />
                <div>
                  <p className="text-sm text-foreground-500">Funding Rate :</p>
                  <p className="font-bold">+{fundingRate}%</p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Price section */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-content1 to-content2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-success" />
                  <h3 className="text-xl font-bold">vETH / vUSDT</h3>
                </div>
                <Badge color="success" variant="dot">
                  Live
                </Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold tracking-tight">
                  $ {(currentPrice / 1e18).toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div
                  className={`flex items-center space-x-2 ${
                    priceChange >= 0 ? "text-success" : "text-danger"
                  }`}
                >
                  {priceChange >= 0 ? (
                    <TrendingUp size={20} />
                  ) : (
                    <TrendingDown size={20} />
                  )}
                  <span className="font-semibold text-lg">
                    {priceChange >= 0 ? "+" : ""}$
                    {Math.abs(priceChange).toFixed(2)}
                  </span>
                </div>
                <Chip
                  color={priceChange >= 0 ? "success" : "danger"}
                  variant="flat"
                  size="lg"
                >
                  {priceChange >= 0 ? "+" : ""}
                  {priceChangePercent.toFixed(2)}%
                </Chip>
              </div>
              <Progress
                value={Math.abs(priceChangePercent) * 10}
                color={priceChange >= 0 ? "success" : "danger"}
                className="max-w-full"
                size="sm"
              />
            </CardBody>
          </Card>

          {/* Trading Panel */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-warning" />
                <h3 className="text-xl font-bold">Trading Panel</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-6">
              {/* Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <DollarSign size={14} />
                    <span>Base Amount (USDT)</span>
                  </label>
                  <Input
                    type="number"
                    value={baseAmount.toString()}
                    onChange={(e) =>
                      setBaseAmount(parseFloat(e.target.value) || 0)
                    }
                    placeholder="Enter amount"
                    size="lg"
                    startContent={
                      <DollarSign size={16} className="text-foreground-400" />
                    }
                  />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-medium">Leverage</label>
                    <Chip color={leverageColor} variant="flat" size="lg">
                      {leverage}×
                    </Chip>
                  </div>
                  <Slider
                    size="lg"
                    step={1}
                    minValue={1}
                    maxValue={100}
                    value={leverage}
                    onChange={(value) =>
                      setLeverage(Array.isArray(value) ? value[0] : value)
                    }
                    color={leverageColor}
                  />
                </div>
              </div>

              {/* Position Size Display */}
              <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <CardBody className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-600">Position Size</span>
                    <span className="text-2xl font-bold text-violet-600">
                      ${positionSize.toLocaleString()}
                    </span>
                  </div>
                </CardBody>
              </Card>

              {/* Trading Actions */}
              {!position ? (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    color="success"
                    size="lg"
                    onPress={() => openPosition("long")}
                  >
                    Long
                  </Button>
                  <Button
                    color="danger"
                    size="lg"
                    onPress={() => openPosition("short")}
                  >
                    Short
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* PnL */}
                  <Card>
                    <CardBody className="py-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-foreground-500">
                          Unrealized PnL
                        </p>
                        <p
                          className={`text-4xl font-bold ${
                            pnl >= 0 ? "text-success" : "text-danger"
                          }`}
                        >
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                  <Button color="primary" size="lg" onPress={closePosition}>
                    Close Position
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </DefaultLayout>
  );
}
