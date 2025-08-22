// import React, { useState, useEffect } from "react";
// import { Card, CardBody, CardHeader } from "@heroui/card";
// import { Divider } from "@heroui/divider";
// import { Avatar } from "@heroui/avatar";
// import { Chip } from "@heroui/chip";
// import { Progress } from "@heroui/progress";
// import { Button } from "@heroui/button";
// import { Input } from "@heroui/input";
// import { Slider } from "@heroui/slider";

// import DefaultLayout from "@/layouts/default";
// import { config } from "@/config/wagmiConfig";
// import { getPublicClient, getWalletClient } from "wagmi/actions";
// import { readContract, writeContract } from "viem/actions";
// import { formatUnits, parseUnits } from "viem";
// import { useAccount } from "wagmi";
// import { toast, ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import {
//   Activity,
//   Badge,
//   TrendingUp,
//   TrendingDown,
//   Zap,
//   DollarSign,
// } from "lucide-react";

// import VAULT_ABI from "@/abis/vault.json";
// import POSITION_MANAGER_ABI from "@/abis/positionManager.json";
// import POSITION_NFT_ABI from "@/abis/positionNFT.json";
// import VAMM_ABI from "@/abis/vamm.json";

// export default function TradingPage() {
//   const VAULT_ADDRESS = import.meta.env.VITE_VAULT_ADDRESS;
//   const POSITION_MANAGER_ADDRESS = import.meta.env
//     .VITE_POSITION_MANAGER_ADDRESS;
//   const VAMM_ADDRESS = import.meta.env.VITE_VAMM_ADDRESS;
//   const POSITION_NFT_ADDRESS = import.meta.env.VITE_POSITION_NFT_ADDRESS;

//   const { address } = useAccount();

//   const [currentPrice, setCurrentPrice] = useState(0);
//   const [priceChange, setPriceChange] = useState(0);
//   const [priceChangePercent, setPriceChangePercent] = useState(0);
//   const [tokenID, setTokenID] = useState<number | null>(null);
//   const [fundingRate, setFundingRate] = useState(0);
//   const [isOpen , setIsOpen] = useState(false);

//   const [vaultData, setVaultData] = useState({
//     deposited: "0.00",
//     locked: "0.00",
//     available: "0.00",
//   });

//   // Trading states
//   const [baseAmount, setBaseAmount] = useState(0);
//   const [leverage, setLeverage] = useState(1);
//   const [position, setPosition] = useState(null);
//   const [entryPrice, setEntryPrice] = useState(0);
//   const [pnl, setPnl] = useState(0);

//   const positionSize = baseAmount * leverage;
//   const leverageColor =
//     leverage <= 10 ? "success" : leverage <= 50 ? "warning" : "danger";

//   const loadCurrentPrice = async () => {
//     try {
//       const publicClient = getPublicClient(config);
//       const res = await readContract(publicClient, {
//         address: VAMM_ADDRESS,
//         abi: VAMM_ABI,
//         functionName: "getCurrentPrice",
//       });
//       console.log("Current price response:", res);
//       const current = Number(res[0]);
//       const isValid = res[1];

//       if (isValid) {
//         setCurrentPrice(current);
//       }
//     } catch (error) {
//       console.error("Failed to load current price:", error);
//     }
//   };

//   const loadVaultBalances = async () => {
//     try {
//       const result = await readContract(getPublicClient(config), {
//         address: VAULT_ADDRESS,
//         abi: VAULT_ABI,
//         functionName: "getUserCollateral",
//         args: [],
//         account: address,
//       });

//       const { deposited, locked, available } = result as {
//         deposited: bigint;
//         locked: bigint;
//         available: bigint;
//       };

//       setVaultData({
//         deposited: formatUnits(deposited, 18),
//         locked: formatUnits(locked, 18),
//         available: formatUnits(available, 18),
//       });
//     } catch (error) {
//       console.error("Failed to load vault balances:", error);
//     }
//   };

//   const openPosition = async (isLong) => {
//     if (!address) return;
//     const collateralInWei = parseUnits(baseAmount.toString(), 18);
//     try {
//       const walletClient = await getWalletClient(config);
//       await writeContract(walletClient, {
//         address: POSITION_MANAGER_ADDRESS,
//         abi: POSITION_MANAGER_ABI,
//         functionName: "openPosition",
//         args: [collateralInWei, leverage, isLong],
//       });
      
//     } catch (error) {
//       console.error("Failed to open position:", error);
//       alert("Could not open position.");
//     }
//   };

// const closePosition = async () => {
//     if (!address) return;
//     toast.info("Closing position...");
//     try {
//       const walletClient = await getWalletClient(config);
//       await writeContract(walletClient, {
//         address: POSITION_MANAGER_ADDRESS,
//         abi: POSITION_MANAGER_ABI,
//         functionName: "closePosition",
//         args: [tokenID],
//       });
//       setIsOpen(false);
//     } catch (error) {
//       console.error("Failed to close position:", error);
//       alert("Could not close position.");
//     }
//   };
  
//   const loadPositionData = async () => {
//     if (!address) return;
//     try {
//       const publicClient = getPublicClient(config);

//       const tokenID = await readContract(publicClient, {
//         address: POSITION_NFT_ADDRESS,
//         abi: POSITION_NFT_ABI,
//         functionName: "getUserOpenPositions",
//         args: [address],
//       });

//       if(tokenID) {
//         setIsOpen(true);
//       }

//       setTokenID(String(tokenID));

//       const positionData = await readContract(publicClient, {
//         address: POSITION_NFT_ADDRESS,
//         abi: POSITION_NFT_ABI,
//         functionName: "getPosition",
//         args: [tokenID],
//       });

//     } catch (error) {
//       console.error("Failed to load position data:", error);
    
//     }
//   };

//   useEffect(() => {
//     loadVaultBalances();
//     loadPositionData();
//   }, [address]);

//   useEffect(() => {
//     loadCurrentPrice();
//     const interval = setInterval(loadCurrentPrice, 10000);
//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <DefaultLayout>
//       <div className="min-h-screen p-6 to-default-100">
//         <div className="max-w-6xl mx-auto space-y-6">
//           {/* Vault balances */}
//           <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border-none">
//             <CardBody className="py-4">
//               <div className="flex justify-center items-center space-x-8">
//                 <div className="flex items-center space-x-2">
//                   <Avatar
//                     className="w-8 h-8"
//                     src="https://cryptologos.cc/logos/bitcoin-btc-logo.png"
//                   />
//                   <div>
//                     <p className="text-sm text-foreground-500">
//                       Available vUSDT :
//                     </p>
//                     <p className="font-bold">
//                       ${Number(vaultData.available).toFixed(2)}
//                     </p>
//                   </div>
//                 </div>
//                 <Divider orientation="vertical" className="h-8" />
//                 <div>
//                   <p className="text-sm text-foreground-500">Locked vUSDT :</p>
//                   <p className="font-bold">
//                     ${Number(vaultData.locked).toFixed(2)}
//                   </p>
//                 </div>
//                 <Divider orientation="vertical" className="h-8" />
//                 <div>
//                   <p className="text-sm text-foreground-500">Funding Rate :</p>
//                   <p className="font-bold">+{fundingRate}%</p>
//                 </div>
//               </div>
//             </CardBody>
//           </Card>

//           {/* Price section */}
//           <Card className="lg:col-span-2 bg-gradient-to-br from-content1 to-content2">
//             <CardHeader className="pb-2">
//               <div className="flex justify-between items-center w-full">
//                 <div className="flex items-center space-x-2">
//                   <Activity className="w-5 h-5 text-success" />
//                   <h3 className="text-xl font-bold">vETH / vUSDT</h3>
//                 </div>
//                 <Badge color="success" variant="dot">
//                   Live
//                 </Badge>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-4">
//               <div className="flex items-baseline space-x-2">
//                 <span className="text-4xl font-bold tracking-tight">
//                   $ {(currentPrice / 1e18).toFixed(2)}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between">
//                 <div
//                   className={`flex items-center space-x-2 ${
//                     priceChange >= 0 ? "text-success" : "text-danger"
//                   }`}
//                 >
//                   {priceChange >= 0 ? (
//                     <TrendingUp size={20} />
//                   ) : (
//                     <TrendingDown size={20} />
//                   )}
//                   <span className="font-semibold text-lg">
//                     {priceChange >= 0 ? "+" : ""}$
//                     {Math.abs(priceChange).toFixed(2)}
//                   </span>
//                 </div>
//                 <Chip
//                   color={priceChange >= 0 ? "success" : "danger"}
//                   variant="flat"
//                   size="lg"
//                 >
//                   {priceChange >= 0 ? "+" : ""}
//                   {priceChangePercent.toFixed(2)}%
//                 </Chip>
//               </div>
//               <Progress
//                 value={Math.abs(priceChangePercent) * 10}
//                 color={priceChange >= 0 ? "success" : "danger"}
//                 className="max-w-full"
//                 size="sm"
//               />
//             </CardBody>
//           </Card>

//           {/* Trading Panel */}
//           <Card className="lg:col-span-3">
//             <CardHeader>
//               <div className="flex items-center space-x-2">
//                 <Zap className="w-5 h-5 text-warning" />
//                 <h3 className="text-xl font-bold">Trading Panel</h3>
//               </div>
//             </CardHeader>
//             <CardBody className="space-y-6">
//               {/* Inputs */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div className="space-y-2">
//                   <label className="text-sm font-medium flex items-center space-x-1">
//                     <DollarSign size={14} />
//                     <span>Base Amount (USDT)</span>
//                   </label>
//                   <Input
//                     type="number"
//                     value={baseAmount.toString()}
//                     onChange={(e) =>
//                       setBaseAmount(parseFloat(e.target.value) || 0)
//                     }
//                     placeholder="Enter amount"
//                     size="lg"
//                     startContent={
//                       <DollarSign size={16} className="text-foreground-400" />
//                     }
//                   />
//                 </div>
//                 <div className="space-y-3">
//                   <div className="flex justify-between items-center">
//                     <label className="text-sm font-medium">Leverage</label>
//                     <Chip color={leverageColor} variant="flat" size="lg">
//                       {leverage}×
//                     </Chip>
//                   </div>
//                   <Slider
//                     size="lg"
//                     step={1}
//                     minValue={1}
//                     maxValue={50}
//                     value={leverage}
//                     onChange={(value) =>
//                       setLeverage(Array.isArray(value) ? value[0] : value)
//                     }
//                     color={leverageColor}
//                   />
//                 </div>
//               </div>

//               {/* Position Size Display */}
//               <Card className="bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30">
//                 <CardBody className="py-4">
//                   <div className="flex justify-between items-center">
//                     <span className="text-foreground-600">Position Size</span>
//                     <span className="text-2xl font-bold text-violet-600">
//                       ${positionSize.toLocaleString()}
//                     </span>
//                   </div>
//                 </CardBody>
//               </Card>

//               {/* Trading Actions */}
              
//                 <div className="grid grid-cols-2 gap-4">
//                   <Button
//                     color="success"
//                     size="lg"
//                     onPress={() => openPosition(true)}
//                   >
//                     Long
//                   </Button>
//                   <Button
//                     color="danger"
//                     size="lg"
//                     onPress={() => openPosition(false)}
//                   >
//                     Short
//                   </Button>
//                 </div>
             
//                 <div className="space-y-4">
//                   {/* PnL */}
//                   <Card>
//                     <CardBody className="py-6">
//                       <div className="text-center space-y-2">
//                         <p className="text-sm text-foreground-500">
//                           Unrealized PnL
//                         </p>
//                         <p
//                           className={`text-4xl font-bold ${
//                             pnl >= 0 ? "text-success" : "text-danger"
//                           }`}
//                         >
//                           {pnl >= 0 ? "+" : ""}${pnl.toFixed(2)}
//                         </p>
//                       </div>
//                     </CardBody>
//                   </Card>
//                   <Button color="primary" size="lg" onPress={closePosition}>
//                     Close Position
//                   </Button>
//                 </div>
              
//             </CardBody>
//           </Card>
//         </div>
//         {/* Toast Container */}
//         <ToastContainer
//           position="bottom-right"
//           autoClose={4000}
//           hideProgressBar={false}
//           newestOnTop={false}
//           closeOnClick
//           rtl={false}
//           draggable
//           theme="dark"
//           // toastClassName="bg-content1 border border-violet-200/30"
//         />
//       </div>
//       <div>
//         <Button onPress={loadPositionData}>
//               load pos data
//         </Button>
//         <Button onPress={closePosition}>
//               close
//         </Button>
//       </div>
//     </DefaultLayout>
//   );
// }
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
import { formatUnits, parseUnits } from "viem";
import { useAccount } from "wagmi";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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
  Lock
} from "lucide-react";

import VAULT_ABI from "@/abis/vault.json";
import POSITION_MANAGER_ABI from "@/abis/positionManager.json";
import POSITION_NFT_ABI from "@/abis/positionNFT.json";
import VAMM_ABI from "@/abis/vamm.json";
import { base } from "viem/chains";

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
  const [tokenID, setTokenID] = useState<number | null>(null);
  const [fundingRate, setFundingRate] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

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

  const openPosition = async (isLong) => {
    if (!address) return;
    
    const collateralInWei = parseUnits(baseAmount.toString(), 6);
    try {
      const walletClient = await getWalletClient(config);
      await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "openPosition",
        args: [collateralInWei, leverage, isLong],
      });
      
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

      const tokenID = await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getUserOpenPositions",
        args: [address],
      });

      if(tokenID) {
        setIsOpen(true);
      }

      setTokenID(String(tokenID));

      const positionData = await readContract(publicClient, {
        address: POSITION_NFT_ADDRESS,
        abi: POSITION_NFT_ABI,
        functionName: "getPosition",
        args: [tokenID],
      });

    } catch (error) {
      console.error("Failed to load position data:", error);
    
    }
  };

  useEffect(() => {
    loadVaultBalances();
    loadPositionData();
  }, [address]);

  useEffect(() => {
    loadCurrentPrice();
    const interval = setInterval(loadCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, []);

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
                    <p className="text-2xl font-bold">${Number(vaultData.available).toFixed(2)}</p>
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
                    <p className="text-2xl font-bold">${Number(vaultData.locked).toFixed(2)}</p>
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
                    <p className="text-2xl font-bold">+{fundingRate}%</p>
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
                    <p className="text-2xl font-bold">${Number(vaultData.deposited).toFixed(2)}</p>
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
                        <p className="text-sm text-foreground-500">Perpetual Futures</p>
                      </div>
                    </div>
                    <Badge color="success" variant="flat">
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
                        <span className="text-lg text-foreground-500">per vETH</span>
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
                      <div className="text-xs text-foreground-500 mb-1">24h Volume</div>
                      <div className="text-lg font-semibold">$124.5M</div>
                    </div>
                  </div>
                  
                  <div className="h-64 bg-default-50 rounded-xl flex items-center justify-center">
                    <div className="text-center text-foreground-400">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                      <p>Price Chart Visualization</p>
                      <p className="text-sm">Interactive chart would appear here</p>
                    </div>
                  </div>
                  
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
                  {isOpen ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <p className="text-sm text-success">Position Type</p>
                        <p className="font-bold">LONG</p>
                      </div>
                      <div className="text-center p-3 bg-default-100 rounded-lg">
                        <p className="text-sm text-foreground-500">Entry Price</p>
                        <p className="font-bold">$3,245.67</p>
                      </div>
                      <div className="text-center p-3 bg-default-100 rounded-lg">
                        <p className="text-sm text-foreground-500">Leverage</p>
                        <p className="font-bold">{leverage}×</p>
                      </div>
                      <div className="text-center p-3 bg-success/10 rounded-lg">
                        <p className="text-sm text-success">PnL</p>
                        <p className="font-bold">+$124.50</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground-400">
                      <Target className="w-12 h-12 mx-auto mb-3" />
                      <p>No active position</p>
                      <p className="text-sm">Open a position to start trading</p>
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
                        <span className="text-foreground-600">Position Size</span>
                        <span className="font-semibold">${positionSize.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-600">Margin Required</span>
                        <span className="font-semibold">${baseAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-foreground-600">Estimated Liq. Price</span>
                        <span className="font-semibold">$2,890.00</span>
                      </div>
                    </CardBody>
                  </Card>

                  {/* Action Buttons */}
                  {isOpen && (
                    <Button 
                      color="primary" 
                      size="lg" 
                      onPress={closePosition}
                      className="w-full h-12"
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