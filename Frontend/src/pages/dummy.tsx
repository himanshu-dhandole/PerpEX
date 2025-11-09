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
import VAMM_ABI from "@/abis/vAMM.json";
import { Button } from "@heroui/button";

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
      const { locked, available } = result as {
        locked: bigint;
        available: bigint;
      };

      setVaultData({
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

  const priceAmm = async () => {
    if (!address) return;

    try {
      const publicClient = getPublicClient(config);

      const [price, isValid] = (await readContract(publicClient, {
        address: VAMM_ADDRESS,
        abi: VAMM_ABI,
        functionName: "getCurrentPrice",
      })) as [bigint, boolean];

      console.log("Current price:", price);
    } catch (error) {
      console.error("Failed to fetch current price:", error);
      alert("Could not load current price.");
    }
  };

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
        args: [100000000000000000000, 1, true],
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

  const getFundingRate = async () => {
    try {
      const funding = await readContract(getPublicClient(config), {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "getCurrentFundingRate",
        args: [],
      });
      console.log("Current funding rate:", funding);
    } catch (error) {
      console.error("Failed to fetch funding rate:", error);
    }
  };

  const updateFundingRate = async () => {
    try {
      const walletClient = await getWalletClient(config);

      await writeContract(walletClient, {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "updateFundingRate",
        args: [],
      });
    } catch (error) {
      console.error("Failed to update funding rate:", error);
    }
  };

  const getStats = async () => {
    try {
      const stats = await readContract(getPublicClient(config), {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "getPositionStats",
        args: [],
      });
      console.log("Position stats:", stats);
    } catch (error) {
      console.error("Failed to fetch position stats:", error);
    }
  };

  const isPositionLiquidatable = async () => {
    try {
      const liquidatable = await readContract(getPublicClient(config), {
        address: POSITION_MANAGER_ADDRESS,
        abi: POSITION_MANAGER_ABI,
        functionName: "isPositionLiquidatable",
        args: [20],
        account: address,
      });
      console.log("Position liquidatable:", liquidatable);
    } catch (error) {
      console.error("Failed to check if position is liquidatable:", error);
    }
  };

  return (
    <DefaultLayout>
      <section className=" flex flex-col items-center justify-center gap-4 py-8 md:py-10">
        <div className="inline-block  text-center justify-center">
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

      <br />
      <br />
      <button onClick={closePosition}>Close Position</button>
      <br />
      <button
        onClick={setInitialPrice}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Set Initial Price
      </button>
      <br />
      <Button onPress={priceAmm}>priceAMM</Button>
      <br />
      <br />
      <Button onPress={getFundingRate}>getCurrentFunding rate</Button>
      <br />
      <Button onPress={updateFundingRate}>update afunding rate</Button>
      <br />
      <Button onPress={getStats}>getPositionStats</Button>
      <Button onPress={isPositionLiquidatable}>isPositionLiquidatable</Button>
    </DefaultLayout>
  );
}

// import { cn } from "@/lib/utils";
// import DefaultLayout from "@/layouts/default";
// import { GlowingEffect } from "@/components/ui/glowing-effect";
// import { AuroraBackground } from "@/components/ui/aurora-background";
// import { motion } from "framer-motion";

// // UI
// import { Button } from "@heroui/button";
// import { Card, CardHeader, CardBody } from "@heroui/card";
// import { Chip } from "@heroui/chip";

// // Icons
// import {
//   Zap,
//   Shield,
//   LockKeyhole,
//   LineChart,
//   Coins,
//   ArrowRight,
//   Wallet,
//   Target,
//   BarChart3,
//   TrendingUp,
// } from "lucide-react";

// // Routing
// import { Link } from "react-router-dom";
// import { Hero } from "@/components/ui/animated-hero";

// // Utils (replace with your actual helpers)
// const title = ({ color }: { color?: string } = {}) =>
//   cn(
//     "text-3xl md:text-5xl font-bold",
//     color === "violet" ? "text-violet-500" : "text-white"
//   );

// const subtitle = ({ class: extraClass }: { class?: string } = {}) =>
//   cn("text-lg text-gray-400", extraClass);

// const buttonStyles = ({
//   color,
//   variant,
//   radius,
// }: {
//   color?: string;
//   variant?: string;
//   radius?: string;
// }) =>
//   cn(
//     "flex items-center gap-2 px-6 py-2 font-medium transition",
//     radius === "full" && "rounded-full",
//     variant === "shadow" && "shadow-md",
//     variant === "bordered" && "border",
//     color === "primary" && "bg-violet-600 text-white hover:bg-violet-700",
//     color === "secondary" && "text-gray-800 border-gray-400 hover:bg-gray-100"
//   );

// // === Reusable Feature Card
// const Feature = ({
//   icon: Icon,
//   title,
//   description,
// }: {
//   icon: React.ElementType;
//   title: string;
//   description: string;
// }) => (
//   <div
//     className={cn(
//       "flex flex-col p-6 bg-background/70 backdrop-blur-sm rounded-xl border border-gray-800",
//       "hover:border-primary/50 transition-all duration-300 group",
//       "dark:bg-slate-900/60 dark:border-slate-700"
//     )}
//   >
//     <div className="w-12 h-12 mb-5 text-primary">
//       <Icon className="w-full h-full" />
//     </div>
//     <h3 className="text-xl font-semibold mb-2 text-white dark:text-slate-100">
//       {title}
//     </h3>
//     <p className="text-gray-400 dark:text-slate-300 leading-relaxed">
//       {description}
//     </p>
//   </div>
// );

// // === Stats Counter
// const Stat = ({ value, label }: { value: string; label: string }) => (
//   <div className="text-center">
//     <div
//       className={cn(
//         "text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-300 dark:from-slate-100 dark:to-slate-400",
//         "bg-clip-text text-transparent"
//       )}
//     >
//       {value}
//     </div>
//     <div className="text-gray-500 dark:text-slate-400 text-sm md:text-base">
//       {label}
//     </div>
//   </div>
// );

// interface GridItemProps {
//   area: string;
//   icon: React.ReactNode;
//   title: string;
//   description: React.ReactNode;
// }

// const GridItem = ({ area, icon, title, description }: GridItemProps) => {
//   return (
//     <li className={cn("min-h-[14rem] list-none", area)}>
//       <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
//         <GlowingEffect
//           spread={40}
//           glow={true}
//           disabled={false}
//           proximity={64}
//           inactiveZone={0.01}
//           borderWidth={3}
//         />
//         <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
//           <div className="relative flex flex-1 flex-col justify-between gap-3">
//             <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2 dark:bg-slate-800 dark:border-slate-700">
//               {icon}
//             </div>
//             <div className="space-y-3">
//               <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
//                 {title}
//               </h3>
//               <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground dark:text-slate-300">
//                 {description}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>
//     </li>
//   );
// };

// export default function Dummy() {
//   return (
//     <DefaultLayout>
//       {/* === HERO SECTION === */}
//       <AuroraBackground className="-mt-16 h-screen dark:bg-black relative overflow-hidden">
//         <div className="container mx-auto px-4 py-28 sm:px-6 lg:px-8 h-full flex items-center">
//           <Hero></Hero>
//         </div>
//       </AuroraBackground>
//       <div></div>

//       {/* === STATS SECTION === */}
//       <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
//           <Stat value="50x" label="Max Leverage" />
//           <Stat value="$2.4B+" label="Total Volume" />
//           <Stat value="0.05%" label="Taker Fee" />
//           <Stat value="24/7" label="Global Markets" />
//         </div>
//       </div>

//       {/* === FEATURES GRID === */}
//      <ul className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-3 lg:gap-8 xl:max-h-[36rem] xl:grid-rows-2">
//   <GridItem
//     area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
//     icon={<Zap className="h-5 w-5 text-yellow-400" />}
//     title="Lightning-Fast Execution"
//     description="Sub-200ms order matching powered by Layer 3 rollups and JIT liquidity."
//   />
//   <GridItem
//     area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
//     icon={<Shield className="h-5 w-5 text-sky-400" />}
//     title="Decentralized Insurance Pool"
//     description="Backstop fund protects traders during black swan events and undercollateralization."
//   />
//   <GridItem
//     area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
//     icon={<LockKeyhole className="h-5 w-5 text-emerald-400" />}
//     title="Non-Custodial & Audited"
//     description="Open-source contracts, audited by Spearbit and PeckShield. Your keys, your coins."
//   />
//   <GridItem
//     area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
//     icon={<LineChart className="h-5 w-5 text-pink-400" />}
//     title="Real-Time PnL Tracking"
//     description="In-wallet analytics show live profit/loss, funding costs, and liquidation price."
//   />
//   <GridItem
//     area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
//     icon={<Coins className="h-5 w-5 text-indigo-400" />}
//     title="Cross-Margin Efficiency"
//     description="One wallet, multiple positions. Maximize capital efficiency with shared margin."
//   />
// </ul>

//       {/* === CTA SECTION === */}
//       <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.6 }}
//           className="max-w-2xl mx-auto"
//         >
//           <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
//             Ready to Trade the Future?
//           </h2>
//           <p className="text-lg text-slate-300 mb-8">
//             Join 85,000+ traders on the fastest-growing perpetual DEX.
//           </p>
//           <div className="flex flex-wrap justify-center gap-4">
//             <Button
//   size="lg"
//   className="bg-gradient-to-r from-violet-500 to-purple-600 text-white gap-2 px-8 hover:from-violet-600 hover:to-purple-700"
// >
//   Start Trading <ArrowRight className="w-4 h-4" />
// </Button>
// <Button
//   size="lg"
//   className="border border-slate-500 text-slate-200 hover:bg-slate-800"
// >
//   View Docs
// </Button>

//           </div>
//         </motion.div>
//         </div>
//     </DefaultLayout>
//   );
// }
