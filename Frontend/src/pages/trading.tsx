import React, { useState, useEffect, useMemo } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Progress } from "@heroui/progress";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";

import DefaultLayout from "@/layouts/default";
import { config } from "@/config/wagmiConfig";
import {
  getPublicClient,
  getWalletClient,
  waitForTransactionReceipt,
} from "wagmi/actions";
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
import VAMM_ABI from "@/abis/vAMM.json";

interface VaultData {
  locked: string;
  available: string;
}

interface PositionData {
  tokenID: number;
  collateral: number;
  leverage: number;
  entryPrice: number;
  entryTimestamp: number;
  entryFundingRate: number;
  isLong: boolean;
  isOpen: boolean;
  symbol: string;
}

interface PositionStats {
  totalLong: number;
  totalShort: number;
  totalLongCollateral: number;
  totalShortCollateral: number;
  fundingRateAccumulated: number;
}

export default function TradingPage(): JSX.Element {
  const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS as `0x${string}`;
  const POSITION_MANAGER_ADDRESS = import.meta.env
    .VITE_POSITION_MANAGER_ADDRESS as `0x${string}`;
  const VAMM_ADDRESS = import.meta.env.VITE_VAMM_ADDRESS as `0x${string}`;
  const POSITION_NFT_ADDRESS = import.meta.env
    .VITE_POSITION_NFT_ADDRESS as `0x${string}`;

  const { address } = useAccount();

  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [fundingRate, setFundingRate] = useState<number>(0);
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceChangePercent, setPriceChangePercent] = useState<number>(0);
  const [tokenID, setTokenID] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [stats, setStats] = useState<PositionStats>({
    totalLong: 0,
    totalShort: 0,
    totalLongCollateral: 0,
    totalShortCollateral: 0,
    fundingRateAccumulated: 0,
  });

  const [vaultData, setVaultData] = useState<VaultData>({
    locked: "0.00",
    available: "0.00",
  });

  const [positionData, setPositionData] = useState<PositionData>({
    tokenID: 0,
    collateral: 0,
    leverage: 0,
    entryPrice: 0,
    entryTimestamp: 0,
    entryFundingRate: 0,
    isLong: false,
    isOpen: false,
    symbol: "",
  });

  const [baseAmount, setBaseAmount] = useState<number>(0);
  const [leverage, setLeverage] = useState<number>(1);

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
      })) as [bigint, boolean];

      const current = Number(res[0]);
      const isValid = res[1];

      if (isValid) {
        setCurrentPrice(current);
      }
    } catch (error) {
      console.error("Failed to load current price:", error);
      toast.error("Failed to load current price.");
    }
  };

  const loadVaultBalances = async () => {
    if (!address) return;

    try {
      const result = (await readContract(getPublicClient(config), {
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        functionName: "getUserCollateral",
        args: [],
        account: address,
      })) as { locked: bigint; available: bigint };

      setVaultData({
        locked: formatUnits(result.locked, 18),
        available: formatUnits(result.available, 18),
      });
    } catch (error) {
      console.error("Failed to load vault balances:", error);
      toast.error("Failed to load vault balances.");
    }
  };

  const openPosition = async (isLong: boolean) => {
    if (!address) return;

    try {
      const walletClient = await getWalletClient(config);
      const collateralInWei = parseUnits(baseAmount.toString(), 18);

      // transaction in tx
      const tx = await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "openPosition",
        args: [collateralInWei, leverage, isLong],
      });

      toast.info("please wait for confirmation");
      const receipt = await waitForTransactionReceipt(config, { hash: tx });

      if (receipt.status == "success") {
        toast.success("Position opened!");
        await Promise.all([
          loadVaultBalances(),
          loadPositionData(),
          getPositionStats(),
          getCurrentFundingRate(),
        ]);
      } else {
        toast.error("Transaction failed.");
      }
    } catch (error) {
      console.error("Failed to open position:", error);
      toast.error("Failed to open position.");
    }
  };

  const closePosition = async () => {
    if (!address || tokenID === null) return;

    try {
      const walletClient = await getWalletClient(config);

      const tx = await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "closePosition",
        args: [tokenID],
      });
      toast.info("please wait for confirmation");
      const receipt = await waitForTransactionReceipt(config, { hash: tx });

      if (receipt.status == "success") {
        setIsOpen(false);
        setTokenID(null);
        setPositionData((prev) => ({ ...prev, isOpen: false }));
        setTimeout(async () => {
          await Promise.all([
            loadVaultBalances(),
            loadPositionData(),
            getPositionStats(),
            getCurrentFundingRate(),
          ]);
        }, 1500);
        toast.success("Position closed!");
      } else {
        toast.error("Transaction failed.");
      }
    } catch (error) {
      console.error("Failed to close position:", error);
      toast.error("Failed to close position.");
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
      })) as bigint[];

      if (!tokenIDs || tokenIDs.length === 0) {
        setIsOpen(false);
        setTokenID(null);
        return;
      }

      const tokenID = Number(tokenIDs[0]);
      setTokenID(tokenID);
      setIsOpen(true);

      const res = (await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getPosition",
        args: [tokenID],
      })) as [
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        bigint,
        boolean,
        boolean,
        string,
      ];

      const mapped: PositionData = {
        tokenID: Number(res[0]),
        collateral: Number(formatUnits(res[1], 18)),
        leverage: Number(res[2]),
        entryPrice: Number(formatUnits(res[3], 18)),
        entryTimestamp: Number(res[4]),
        entryFundingRate: Number(res[5]),
        isLong: res[6],
        isOpen: res[7],
        symbol: res[8],
      };

      setPositionData(mapped);
    } catch (error) {
      console.error("Failed to load position data:", error);
    }
  };

  const getPositionStats = async () => {
    if (!address) return;

    try {
      const statsRes = (await readContract(getPublicClient(config), {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "getPositionStats",
        args: [],
        account: address,
      })) as [bigint, bigint, bigint, bigint, bigint];

      setStats({
        totalLong: Number(statsRes[0]),
        totalShort: Number(formatUnits(statsRes[1], 18)),
        totalLongCollateral: Number(formatUnits(statsRes[2], 18)),
        totalShortCollateral: Number(formatUnits(statsRes[3], 18)),
        fundingRateAccumulated: Number(formatUnits(statsRes[4], 4)),
      });
    } catch (error) {
      console.error("Failed to get position stats:", error);
    }
  };

  const getCurrentFundingRate = async () => {
    try {
      const fundingRate = await readContract(getPublicClient(config), {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "getCurrentFundingRate",
        args: [],
      });
      setFundingRate(Number(fundingRate as bigint) / 10000);
    } catch (error) {
      console.error("Failed to fetch current funding rate:", error);
    }
  };

const getPnl = () => {
  if (!positionData.isOpen) return 0;
  const currentPriceNow = currentPrice / 1e18;
  const entryPrice = positionData.entryPrice;
  const collateral = positionData.collateral;
  const leverage = positionData.leverage;

  if (!entryPrice || entryPrice === 0) return 0;

  const notional = collateral * leverage;
  const direction = positionData.isLong ? 1 : -1;

  const priceChange = (currentPriceNow - entryPrice) / entryPrice; 
  const grossPnl = direction * notional * priceChange;

  // fee only on collateral (0.05%)
  const fee = collateral * 0.0005;

  const pnl = grossPnl - fee;
  return Number(pnl);
};



  useEffect(() => {
    loadVaultBalances();
    loadPositionData();
    getPositionStats();
    getCurrentFundingRate();
  }, [address]);

  useEffect(() => {
    loadCurrentPrice();
    getPnl();
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
                      {fundingRate >= 0 ? "+" : ""}
                      {fundingRate.toFixed(4)}%
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
                    <p className="text-amber-100 text-sm">
                      Accumilated Funding Rate
                    </p>
                    <p className="text-2xl font-bold">
                      {stats.fundingRateAccumulated >= 0 ? "+" : ""}
                      {stats.fundingRateAccumulated.toFixed(4)}%
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
                        <p className="text-sm text-foreground-500">Holding</p>
                        <p className="font-bold">
                          ${Number(positionData.collateral)} at{" "}
                          {positionData.leverage}×
                        </p>
                      </div>
                      {/* <div
                        className={`text-center p-3 rounded-lg ${
                          (currentPrice / 1e18 - positionData.entryPrice) *
                            (positionData.isLong ? 1 : -1) >=
                          0
                            ? "bg-success/10"
                            : "bg-danger/10"
                        }`}
                      >
                        <p
                          className={`text-sm ${
                            (currentPrice / 1e18 - positionData.entryPrice) *
                              (positionData.isLong ? 1 : -1) >=
                            0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          PnL
                        </p>

                        <p
                          className={`font-bold ${
                            (currentPrice / 1e18 - positionData.entryPrice) *
                              (positionData.isLong ? 1 : -1) >=
                            0
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {(currentPrice / 1e18 - positionData.entryPrice) *
                            (positionData.isLong ? 1 : -1) >=
                          0
                            ? "+"
                            : ""}
                          {(
                            (currentPrice / 1e18 - positionData.entryPrice) *
                            (positionData.isLong ? 1 : -1)
                          ).toFixed(2)}
                          $
                        </p>
                      </div> */}
                      <div
                        className={`text-center p-3 rounded-lg ${
                          getPnl() >= 0 ? "bg-success/10" : "bg-danger/10"
                        }`}
                      >
                        <p
                          className={`text-sm ${getPnl() >= 0 ? "text-success" : "text-danger"}`}
                        >
                          PnL
                        </p>

                        <p
                          className={`font-bold ${getPnl() >= 0 ? "text-success" : "text-danger"}`}
                        >
                          {getPnl() >= 0 ? "+" : ""}
                          {getPnl().toFixed(2)}$
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

                  <Button
                    color="primary"
                    size="lg"
                    onPress={closePosition}
                    disabled={!isOpen}
                    className="w-full h-12"
                  >
                    Close Position
                  </Button>
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
