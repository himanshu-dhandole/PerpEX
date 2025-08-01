import React, { useState, useEffect } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Slider } from "@heroui/slider";
import { Chip } from "@heroui/chip";
import { Badge } from "@heroui/badge";
import { Progress } from "@heroui/progress";
import { Divider } from "@heroui/divider";
import { Avatar } from "@heroui/avatar";
import { TrendingUp, TrendingDown, Target, Zap, Activity, DollarSign } from "lucide-react";
import DefaultLayout from "@/layouts/default";

export default function TradingPage() {
  const [baseAmount, setBaseAmount] = useState(1000);
  const [leverage, setLeverage] = useState(10);
  const [currentPrice, setCurrentPrice] = useState(67542.31);
  const [entryPrice, setEntryPrice] = useState(0);
  const [position, setPosition] = useState(null);
  const [pnl, setPnl] = useState(0);
  const [priceChange, setPriceChange] = useState(1247.82);
  const [volume, setVolume] = useState(2456789);

  // Simulate price updates
  useEffect(() => {
    const interval = setInterval(() => {
      const change = (Math.random() - 0.5) * 200;
      setCurrentPrice(prev => {
        const newPrice = Math.max(prev + change, 30000);
        setPriceChange(change);
        return newPrice;
      });
      setVolume(prev => prev + Math.floor(Math.random() * 10000));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (position && entryPrice > 0) {
      const diff = position === "long" 
        ? currentPrice - entryPrice 
        : entryPrice - currentPrice;
      const size = baseAmount * leverage;
      setPnl((diff / entryPrice) * size);
    }
  }, [currentPrice, entryPrice, position, baseAmount, leverage]);

  const openPosition = (type) => {
    setPosition(type);
    setEntryPrice(currentPrice);
    setPnl(0);
  };

  const closePosition = () => {
    setPosition(null);
    setEntryPrice(0);
    setPnl(0);
  };

  const positionSize = baseAmount * leverage;
  const priceChangePercent = (priceChange / currentPrice) * 100;
  const leverageColor = leverage <= 10 ? "success" : leverage <= 50 ? "warning" : "danger";

  return (
    <DefaultLayout>
    <div className="min-h-screen p-6 bg-gradient-to-br from-background to-default-100">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            Trade <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-purple-600">BTC/USDT</span>
          </h1>
          <p className="text-foreground-500 text-lg">Perpetual contracts with professional tools</p>
        </div>

        {/* Market Overview Bar */}
        <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-none">
          <CardBody className="py-4">
            <div className="flex justify-center items-center space-x-8">
              <div className="flex items-center space-x-2">
                <Avatar className="w-8 h-8" src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" />
                <div>
                  <p className="text-sm text-foreground-500">Market Cap</p>
                  <p className="font-bold">$1.34T</p>
                </div>
              </div>
              <Divider orientation="vertical" className="h-8" />
              <div>
                <p className="text-sm text-foreground-500">24h Volume</p>
                <p className="font-bold">${(volume / 1000).toFixed(0)}K</p>
              </div>
              <Divider orientation="vertical" className="h-8" />
              <div>
                <p className="text-sm text-foreground-500">Dominance</p>
                <p className="font-bold">52.3%</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          
          {/* Price Display */}
          <Card className="lg:col-span-2 bg-gradient-to-br from-content1 to-content2">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center w-full">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-success" />
                  <h3 className="text-xl font-bold">BTC/USDT</h3>
                </div>
                <Badge color="success" variant="dot">Live</Badge>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="flex items-baseline space-x-2">
                <span className="text-4xl font-bold tracking-tight">
                  ${currentPrice.toLocaleString()}
                </span>
                <span className="text-lg text-foreground-500">.31</span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className={`flex items-center space-x-2 ${
                  priceChange >= 0 ? 'text-success' : 'text-danger'
                }`}>
                  {priceChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                  <span className="font-semibold text-lg">
                    {priceChange >= 0 ? '+' : ''}${Math.abs(priceChange).toFixed(2)}
                  </span>
                </div>
                <Chip 
                  color={priceChange >= 0 ? "success" : "danger"} 
                  variant="flat"
                  size="lg"
                >
                  {priceChange >= 0 ? '+' : ''}{priceChangePercent.toFixed(2)}%
                </Chip>
              </div>

              <Progress 
                value={Math.abs(priceChangePercent) * 10} 
                color={priceChange >= 0 ? "success" : "danger"}
                className="max-w-full"
                size="sm"
              />
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-default-100 rounded-lg">
                  <p className="text-xs text-foreground-500">24H HIGH</p>
                  <p className="font-bold text-success">${(currentPrice * 1.05).toFixed(0)}</p>
                </div>
                <div className="text-center p-3 bg-default-100 rounded-lg">
                  <p className="text-xs text-foreground-500">24H LOW</p>
                  <p className="font-bold text-danger">${(currentPrice * 0.95).toFixed(0)}</p>
                </div>
              </div>
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
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center space-x-1">
                    <DollarSign size={14} />
                    <span>Base Amount (USDT)</span>
                  </label>
                  <Input
                    type="number"
                    value={baseAmount.toString()}
                    onChange={(e) => setBaseAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter amount"
                    size="lg"
                    startContent={<DollarSign size={16} className="text-foreground-400" />}
                    classNames={{
                      input: "text-lg font-mono",
                    }}
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
                    onChange={(value) => setLeverage(Array.isArray(value) ? value[0] : value)}
                    color={leverageColor}
                    className="max-w-full"
                    marks={[
                      { value: 1, label: "1×" },
                      { value: 25, label: "25×" },
                      { value: 50, label: "50×" },
                      { value: 100, label: "100×" },
                    ]}
                  />
                </div>
              </div>

              {/* Position Size Display */}
              <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200 dark:border-violet-800">
                <CardBody className="py-4">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-600">Position Size</span>
                    <span className="text-2xl font-bold text-violet-600">
                      ${positionSize.toLocaleString()}
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-foreground-500">
                    Margin: ${baseAmount.toLocaleString()} • Risk Level: {leverage <= 10 ? 'Low' : leverage <= 50 ? 'Medium' : 'High'}
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
                    startContent={<TrendingUp size={20} />}
                    className="h-14 font-bold text-lg"
                  >
                    Long
                  </Button>
                  <Button
                    color="danger"
                    size="lg"
                    onPress={() => openPosition("short")}
                    startContent={<TrendingDown size={20} />}
                    className="h-14 font-bold text-lg"
                  >
                    Short
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Active Position Card */}
                  <Card className={`border-2 ${
                    position === "long" 
                      ? "border-success bg-success-50 dark:bg-success-950/20" 
                      : "border-danger bg-danger-50 dark:bg-danger-950/20"
                  }`}>
                    <CardBody className="py-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                          <Chip 
                            color={position === "long" ? "success" : "danger"} 
                            variant="solid" 
                            size="lg"
                            className="font-bold"
                          >
                            {position.toUpperCase()}
                          </Chip>
                          <div>
                            <p className="font-bold">BTC/USDT</p>
                            <p className="text-xs text-foreground-500">Perpetual</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-foreground-500">Entry</p>
                          <p className="font-bold">${entryPrice.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardBody>
                  </Card>

                  {/* PnL Display */}
                  <Card className="bg-gradient-to-r from-content1 to-content2">
                    <CardBody className="py-6">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-foreground-500">Unrealized PnL</p>
                        <p className={`text-4xl font-bold ${
                          pnl >= 0 ? "text-success" : "text-danger"
                        }`}>
                          {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
                        </p>
                        <Chip 
                          color={pnl >= 0 ? "success" : "danger"} 
                          variant="flat"
                          size="lg"
                        >
                          ROI: {pnl >= 0 ? "+" : ""}{((pnl / baseAmount) * 100).toFixed(2)}%
                        </Chip>
                      </div>
                    </CardBody>
                  </Card>

                  <Button
                    color="primary"
                    size="lg"
                    onPress={closePosition}
                    startContent={<Target size={20} />}
                    className="w-full h-14 font-bold text-lg"
                  >
                    Close Position
                  </Button>
                </div>
              )}
            </CardBody>
          </Card>
        </div>

        {/* Risk Notice */}
        <Card className="bg-warning-50 dark:bg-warning-950/20 border-warning-200 dark:border-warning-800">
          <CardBody className="py-3">
            <div className="flex items-center justify-center space-x-2 text-warning-700 dark:text-warning-300">
              <Zap size={16} />
              <span className="text-sm font-medium">
                High leverage trading involves substantial risk of loss. Trade responsibly.
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
    </DefaultLayout>
  );
}