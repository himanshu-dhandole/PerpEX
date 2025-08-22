import React, { useState, useEffect, useMemo } from "react";
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
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AdvancedChart } from "react-tradingview-embed";

import {
  Activity,
  Badge,
  TrendingUp,
  TrendingDown,
  Zap,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  BarChart3,
  Target,
  Lock,
} from "lucide-react";

import VAULT_ABI from "@/abis/vault.json";
import POSITION_MANAGER_ABI from "@/abis/positionManager.json";
import POSITION_NFT_ABI from "@/abis/positionNFT.json";
import VAMM_ABI from "@/abis/vamm.json";

export default function TradingPage() {
  const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
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
  const [isOpen, setIsOpen] = useState(false);
  const [stats, setStats] = useState({
    totalLong: 0,
    totalShort: 0,
    totalLongCollateral: 0,
    totalShortCollateral: 0,
    fundingRateAccumulated: 0,
  });

  const [vaultData, setVaultData] = useState({
    deposited: "0.00",
    locked: "0.00",
    available: "0.00",
  });

  const [positionData, setPositionData] = useState({
    tokenID: 0,
    colleteral: 0,
    leverage: 0,
    entryPrice: 0,
    entryTimestamp: 0,
    entryFundingRate: 0,
    isLong: false,
    isOpen: false,
    symbol: "",
  });

  // Trading states
  const [baseAmount, setBaseAmount] = useState(0);
  const [leverage, setLeverage] = useState(1);
  const [position, setPosition] = useState("");
  const [entryPrice, setEntryPrice] = useState(0);
  const [pnl, setPnl] = useState(0);

  const positionSize = baseAmount * leverage;
  const leverageColor =
    leverage <= 10 ? "success" : leverage <= 50 ? "warning" : "danger";

  const loadCurrentPrice = async () => {
    try {
      const publicClient = getPublicClient(config);
      const res = (await readContract(publicClient, {
        address: VAMM_ADDRESS,
        abi: VAMM_ABI,
        functionName: "getCurrentPrice",
      })) as any;
      console.log("Current price response:", res);
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

  const openPosition = async (isLong: boolean) => {
    if (!address) return;

    const collateralInWei = parseUnits(baseAmount.toString(), 18);
    try {
      const walletClient = await getWalletClient(config);
      await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "openPosition",
        args: [collateralInWei, leverage, isLong],
      });
      loadPositionData();
    } catch (error) {
      console.error("Failed to open position:", error);
      alert("Could not open position.");
    }
  };

  const closePosition = async () => {
    if (!address) return;
    toast.info("Closing position...");
    try {
      const walletClient = await getWalletClient(config);
      await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "closePosition",
        args: [tokenID],
      });
      setIsOpen(false);
      setTokenID(null);
    } catch (error) {
      console.error("Failed to close position:", error);
      alert("Could not close position.");
    }
  };
  const loadPositionData = async () => {
    if (!address) return;
    try {
      const publicClient = getPublicClient(config);

      const tokenIDs = (await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getUserOpenPositions",
        args: [address],
      })) as any;

      if (!tokenIDs || tokenIDs.length === 0) {
        setIsOpen(false);
        setTokenID(null);
        return;
      }

      const tokenID = tokenIDs[0]; // assuming only one open position
      setTokenID(tokenID);
      setIsOpen(true);

      const res = (await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getPosition",
        args: [tokenID],
      })) as any;

      // map array into object
      const mapped = {
        tokenID: Number(res[0]),
        collateral: Number(formatUnits(res[1], 18)),
        leverage: Number(res[2]),
        entryPrice: Number(formatUnits(res[3], 18)),
        entryTimestamp: Number(res[4]),
        entryFundingRate: Number(res[5]),
        isLong: res[6],
        isOpen: res[7],
        symbol: res[8],
      } as any;

      setPositionData(mapped);
      console.log("Mapped position data:", mapped);
    } catch (error) {
      console.error("Failed to load position data:", error);
    }
  };

  const getPositionStats = async () => {
    if (!address) return;
    try {
      const stats = (await readContract(getPublicClient(config), {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "getPositionStats",
        args: [],
        account: address,
      })) as any;
      console.log("Position stats:", stats);
      setStats({
        totalLong: Number(stats[0]),
        totalShort: Number(formatUnits(stats[1], 18)),
        totalLongCollateral: Number(formatUnits(stats[2], 18)),
        totalShortCollateral: Number(formatUnits(stats[3], 18)),
        fundingRateAccumulated: Number(formatUnits(stats[4], 18)),
      });

      console.log("Position stats set:", {
        totalLong: stats[0].toString(),
        totalShort: stats[1].toString(),
        totalLongCollateral: stats[2].toString(),
        totalShortCollateral: stats[3].toString(),
        fundingRateAccumulated: stats[4].toString(),
      });
    } catch (error) {
      console.error("Failed to get position stats:", error);
    }
  };

  useEffect(() => {
    loadVaultBalances();
    loadPositionData();
    getPositionStats();
  }, [address]);

  useEffect(() => {
    loadCurrentPrice();
    const interval = setInterval(loadCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, []);

  const Chart = useMemo(
    () => (
      <div className="flex-1 rounded-2xl p-[2px] bg-gradient-to-br from-purple-500/50 via-blue-500/40 to-cyan-400/40 shadow-lg">
        <div className="rounded-2xl bg-black/70 backdrop-blur-md overflow-hidden h-full">
          <AdvancedChart
            widgetProps={{
              symbol: "BINANCE:ETHUSDT",
              theme: "dark",
              interval: "60",
              timezone: "Asia/Kolkata", // Indian Standard Time
              autosize: true,
              style: "1",
              locale: "en",
              height: "100%",
            }}
          />
        </div>
      </div>
    ),
    []
  );

  return (
    <DefaultLayout>
      <div className="min-h-screen p-6 to-default-100">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-r from-violet-500 to-purple-600 text-white">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-violet-100 text-sm">Available Balance</p>
                    <p className="text-2xl font-bold">
                      ${Number(vaultData.available).toFixed(2)}
                    </p>
                  </div>
                  <Wallet className="w-8 h-8 text-violet-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Locked Funds</p>
                    <p className="text-2xl font-bold">
                      ${Number(vaultData.locked).toFixed(2)}
                    </p>
                  </div>
                  <Lock className="w-8 h-8 text-blue-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm">Funding Rate</p>
                    <p className="text-2xl font-bold">
                      +{stats.fundingRateAccumulated}%
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-emerald-200" />
                </div>
              </CardBody>
            </Card>

            <Card className="bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <CardBody className="py-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-100 text-sm">Total Deposited</p>
                    <p className="text-2xl font-bold">
                      ${Number(vaultData.deposited).toFixed(2)}
                    </p>
                  </div>
                  <Target className="w-8 h-8 text-amber-200" />
                </div>
              </CardBody>
            </Card>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Price Chart Section */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="bg-gradient-to-br from-content1 to-content2">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-violet-500 to-purple-600 rounded-full flex items-center justify-center">
                        <Activity className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold">vETH / vUSDT</h3>
                        <p className="text-sm text-foreground-500">
                          Perpetual Futures
                        </p>
                      </div>
                    </div>
                    <Badge color="success">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                        <span>Live</span>
                      </div>
                    </Badge>
                  </div>
                </CardHeader>
                <CardBody className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-baseline space-x-3">
                        <span className="text-4xl font-bold tracking-tight">
                          $ {(currentPrice / 1e18).toFixed(2)}
                        </span>
                        <span className="text-lg text-foreground-500">
                          per vETH
                        </span>
                      </div>
                      <div className="flex items-center space-x-4">
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
                    </div>
                    <div className="bg-default-100 rounded-lg p-3">
                      <div className="text-xs text-foreground-500 mb-1">
                        Total Volume
                      </div>
                      <div className="text-lg font-semibold">
                        $
                        {stats.totalLongCollateral + stats.totalShortCollateral}
                      </div>
                    </div>
                  </div>

                  <CardBody className="flex flex-col h-[400px]">
                    {Chart}
                  </CardBody>

                  <Progress
                    value={Math.abs(priceChangePercent) * 10}
                    color={priceChange >= 0 ? "success" : "danger"}
                    className="max-w-full"
                    size="sm"
                  />
                </CardBody>
              </Card>

              {/* Position Info */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Target className="w-5 h-5 text-warning" />
                    <h3 className="text-lg font-bold">Active Position</h3>
                  </div>
                </CardHeader>
                <CardBody>
                  {positionData.isOpen ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <p className="text-sm text-success">Position Type</p>
                        <p className="font-bold">{positionData.symbol}</p>
                      </div>
                      <div className="text-center p-3 bg-default-100 rounded-lg">
                        <p className="text-sm text-foreground-500">
                          Entry Price
                        </p>
                        <p className="font-bold">
                          ${positionData.entryPrice.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-center p-3 bg-default-100 rounded-lg">
                        <p className="text-sm text-foreground-500">Leverage</p>
                        <p className="font-bold">{leverage}×</p>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <p className="text-sm text-success">PnL</p>
                        <p className="font-bold">
                          {" "}
                          +$
                          {(
                            currentPrice / 1e18 -
                            positionData.entryPrice
                          ).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground-400">
                      <Target className="w-12 h-12 mx-auto mb-3" />
                      <p>No active position</p>
                      <p className="text-sm">
                        Open a position to start trading
                      </p>
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>

            {/* Trading Panel */}
            <div className="space-y-6">
              <Card className="bg-gradient-to-b from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-violet-600" />
                    <h3 className="text-xl font-bold">Trade vETH</h3>
                  </div>
                </CardHeader>
                <CardBody className="space-y-6">
                  {/* Trade Type Selection */}
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      color="success"
                      size="lg"
                      className="h-14"
                      onPress={() => openPosition(true)}
                    >
                      <div className="flex flex-col items-center">
                        <ArrowUpRight className="w-5 h-5" />
                        <span>Long</span>
                      </div>
                    </Button>
                    <Button
                      color="danger"
                      size="lg"
                      className="h-14"
                      onPress={() => openPosition(false)}
                    >
                      <div className="flex flex-col items-center">
                        <ArrowDownRight className="w-5 h-5" />
                        <span>Short</span>
                      </div>
                    </Button>
                  </div>

                  {/* Amount Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center space-x-1">
                      <DollarSign size={14} />
                      <span>Amount (vUSDT)</span>
                    </label>
                    <Input
                      type="number"
                      value={baseAmount.toString()}
                      onChange={(e) =>
                        setBaseAmount(parseFloat(e.target.value) || 0)
                      }
                      placeholder="0.00"
                      size="lg"
                      startContent={
                        <DollarSign size={16} className="text-foreground-400" />
                      }
                      className="h-12"
                    />
                  </div>

                  {/* Leverage Slider */}
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
                      maxValue={50}
                      value={leverage}
                      onChange={(value) =>
                        setLeverage(Array.isArray(value) ? value[0] : value)
                      }
                      color={leverageColor}
                      className="py-2"
                    />
                    <div className="flex justify-between text-xs text-foreground-500">
                      <span>1×</span>
                      <span>25×</span>
                      <span>50×</span>
                    </div>
                  </div>

                  {/* Position Preview */}
                  <Card className="bg-white/50 dark:bg-default-100/50">
                    <CardBody className="py-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-foreground-600">
                          Position Size
                        </span>
                        <span className="font-semibold">
                          ${positionSize.toLocaleString()}
                        </span>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Action Buttons */}
                  {/* {isOpen && (
                    <Button
                      color="primary"
                      size="lg"
                      onPress={closePosition}
                      className="w-full h-12"
                    >
                      Close Position
                    </Button>
                  )} */}
                  {isOpen ? (
                    <Button
                      color="primary"
                      size="lg"
                      onPress={closePosition}
                      className="w-full h-12"
                    >
                      Close Position
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      isDisabled
                      className="w-full h-12 cursor-not-allowed"
                    >
                      Close Position
                    </Button>
                  )}
                </CardBody>
              </Card>
            </div>
          </div>
        </div>

        {/* Toast Container */}
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
