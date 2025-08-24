// import { Link } from "@heroui/link";
// import { Code } from "@heroui/code";
// import { button as buttonStyles } from "@heroui/theme";
// import { Card, CardBody, CardHeader } from "@heroui/card";
// import { Chip } from "@heroui/chip";
// import { Accordion, AccordionItem } from "@heroui/accordion";
// import { Tabs, Tab } from "@heroui/tabs";
// import {
//   Table,
//   TableHeader,
//   TableBody,
//   TableColumn,
//   TableRow,
//   TableCell,
// } from "@heroui/table";
// import {
//   Book,
//   Code2,
//   Layers,
//   Wallet,
//   ShieldCheck,
//   BarChart2,
//   Zap,
//   Target,
//   TrendingUp,
//   AlertTriangle,
// } from "lucide-react";
// import DefaultLayout from "@/layouts/default";
// import { title, subtitle } from "@/components/primitives";

// export default function DocsPage() {
//   return (
//     <DefaultLayout>
//       <section className="flex flex-col items-center justify-center gap-8 py-12 md:py-16 bg-black min-h-screen">
//         {/* Abstract Section */}
//         <div className="w-full max-w-7xl px-6 mt-12">
//           <Card className="border-0 bg-gradient-to-br from-content1 to-content2 backdrop-blur-sm text-gray-100 shadow-lg shadow-purple-900/20">
//             <CardHeader>
//               <div className="flex items-center space-x-3">
//                 <Book className="text-purple-400" size={28} />
//                 <h2 className="text-2xl font-semibold">Abstract</h2>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <p className="text-gray-300 mb-4">
//                 This whitepaper outlines a decentralized perpetual futures
//                 trading protocol for the vETH/vUSDT pair, utilizing a virtual
//                 Automated Market Maker (vAMM) for price discovery, Chainlink
//                 oracles for real-time pricing, and ERC721 NFTs for position
//                 tracking. Supporting up to 50x leverage with 8-hour funding
//                 intervals, the system ensures market neutrality through dynamic
//                 funding rates and robust liquidation mechanisms. Deployed on
//                 Ethereum-compatible blockchains, it prioritizes security,
//                 scalability, and transparency, addressing DeFi challenges like
//                 slippage and oracle risks.
//               </p>
//               <p className="text-gray-300">
//                 By leveraging virtual reserves, the protocol achieves infinite
//                 liquidity with minimal capital, aligning perpetual prices with
//                 spot markets via funding adjustments. This design adapts
//                 traditional perpetual futures to blockchain constraints,
//                 offering a scalable framework for decentralized derivatives
//                 trading.
//               </p>
//             </CardBody>
//           </Card>
//         </div>

//         {/* Introduction Section */}
//         <div className="w-full max-w-7xl px-6 mt-8">
//           <Card className="border-0 bg-gradient-to-br from-content1 to-content2 backdrop-blur-sm text-gray-100 shadow-lg shadow-blue-900/20">
//             <CardHeader>
//               <div className="flex items-center space-x-3">
//                 <Target className="text-blue-400" size={28} />
//                 <h2 className="text-2xl font-semibold">Introduction</h2>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <p className="text-gray-300 mb-4">
//                 Perpetual futures enable traders to speculate on asset prices
//                 without expiration, a powerful tool in both traditional and
//                 decentralized finance. While centralized exchanges dominate
//                 perpetual trading, they pose risks like custody issues and lack
//                 of transparency. This protocol introduces a fully on-chain
//                 solution, leveraging smart contracts for trustless position
//                 management, settlements, and risk controls.
//               </p>
//               <p className="text-gray-300 mb-4">Key innovations include:</p>
//               <ul className="list-disc list-inside text-gray-300 mb-4">
//                 <li>
//                   Virtual AMM for slippage-free, infinite liquidity trading.
//                 </li>
//                 <li>Funding rates to align perpetual and spot prices.</li>
//                 <li>
//                   Non-transferable NFTs for position ownership and
//                   composability.
//                 </li>
//                 <li>
//                   Vault-based collateral management with 80% utilization caps.
//                 </li>
//                 <li>
//                   Chainlink integration for reliable external price feeds.
//                 </li>
//               </ul>
//               <p className="text-gray-300">
//                 The protocol supports long/short positions on vETH/vUSDT, with
//                 vUSDT as a stable collateral token, enabling traders to
//                 capitalize on ETH price movements while minimizing collateral
//                 volatility.
//               </p>
//             </CardBody>
//           </Card>
//         </div>

//         {/* Architecture Overview */}
//         <div className="w-full max-w-7xl px-6 mt-8">
//           <Card className="border-0 bg-gradient-to-br from-content1 to-content2 backdrop-blur-sm text-gray-100 shadow-lg shadow-green-900/20">
//             <CardHeader>
//               <div className="flex items-center space-x-3">
//                 <Layers className="text-green-400" size={28} />
//                 <h2 className="text-2xl font-semibold">System Architecture</h2>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <p className="text-gray-300 mb-4">
//                 The protocol comprises modular smart contracts designed for
//                 security, efficiency, and interoperability:
//               </p>
//               <Tabs
//                 aria-label="Architecture Components"
//                 variant="bordered"
//                 classNames={{
//                   tabList: "bg-gray-700/50",
//                   tab: "text-gray-300 hover:text-white",
//                   cursor: "bg-purple-600",
//                 }}
//               >
//                 <Tab key="core" title="Core Components">
//                   <ul className="list-disc list-inside text-gray-300 mt-4">
//                     <li>
//                       <strong>PositionManager:</strong> Manages trading,
//                       liquidations, and funding.
//                     </li>
//                     <li>
//                       <strong>VirtualAMM:</strong> Handles price discovery and
//                       reserve updates.
//                     </li>
//                     <li>
//                       <strong>Vault:</strong> Secures collateral and processes
//                       settlements.
//                     </li>
//                   </ul>
//                 </Tab>
//                 <Tab key="supporting" title="Supporting Components">
//                   <ul className="list-disc list-inside text-gray-300 mt-4">
//                     <li>
//                       <strong>PriceOracle:</strong> Fetches ETH/USDT spot prices
//                       via Chainlink.
//                     </li>
//                     <li>
//                       <strong>PositionNFT:</strong> Tokenizes positions as
//                       ERC721 NFTs.
//                     </li>
//                     <li>
//                       <strong>vUSDT:</strong> Stablecoin for collateral.
//                     </li>
//                   </ul>
//                 </Tab>
//               </Tabs>
//               <p className="text-gray-300 mt-4">
//                 Access controls ensure only authorized contracts (e.g.,
//                 PositionManager) interact with sensitive functions, enhancing
//                 security and modularity.
//               </p>
//             </CardBody>
//           </Card>
//         </div>

//         {/* Contract Details */}
//         <div className="w-full max-w-7xl px-6 mt-8">
//           <h2 className="text-3xl font-semibold text-white mb-6">
//             Smart Contract Breakdown
//           </h2>
//           <Accordion
//             variant="bordered"
//             classNames={{
//               base: "bg-gray-800/80 backdrop-blur-sm",
//               title: "text-gray-100",
//               content: "text-gray-300",
//             }}
//           >
//             <AccordionItem
//               key="position-manager"
//               aria-label="PositionManager Contract"
//               title="PositionManager.sol: Core Trading Logic"
//               subtitle="Manages positions, funding, and liquidations"
//               startContent={<Code2 className="text-purple-400" size={24} />}
//             >
//               <p className="mb-4">
//                 The <Code>PositionManager</Code> contract is the heart of the
//                 protocol, coordinating trading operations with robust security
//                 measures (Ownable, ReentrancyGuard).
//               </p>
//               <h3 className="font-semibold text-white mt-4">Key Parameters</h3>
//               <Table
//                 classNames={{
//                   base: "bg-gray-700/50",
//                   th: "bg-gray-600 text-gray-200",
//                   td: "text-gray-300",
//                 }}
//               >
//                 <TableHeader>
//                   <TableColumn>Parameter</TableColumn>
//                   <TableColumn>Type</TableColumn>
//                   <TableColumn>Description</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   <TableRow>
//                     <TableCell>MAX_LEVERAGE</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>50 (max leverage allowed)</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>TRADING_FEES_BPS</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>500 bps (5% trading fee)</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>LIQUIDATION_THRESHOLD_BPS</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>500 bps (5% maintenance margin)</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>FUNDING_INTERVAL</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>8 hours (funding update frequency)</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//               <h3 className="font-semibold text-white mt-4">Core Functions</h3>
//               <ul className="list-disc list-inside mb-4">
//                 <li>
//                   <strong>openPosition(collateral, leverage, isLong):</strong>{" "}
//                   Validates inputs, deducts 5% fee, locks collateral in Vault,
//                   updates vAMM reserves, mints PositionNFT.
//                 </li>
//                 <li>
//                   <strong>closePosition(tokenId):</strong> Verifies ownership,
//                   calculates PnL and funding, settles via Vault, burns NFT.
//                 </li>
//                 <li>
//                   <strong>liquidatePosition(tokenId):</strong> Liquidates if
//                   remaining value ≤ 5% margin, absorbs losses, burns NFT.
//                 </li>
//                 <li>
//                   <strong>updateFundingRate():</strong> Updates funding rate
//                   every 8 hours (owner-only).
//                 </li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Calculations</h3>
//               <p className="mb-4">
//                 <strong>PnL:</strong> (price change % * leverage) * collateral
//                 <br />
//                 <strong>Funding:</strong> (accumulated rate - entry rate) *
//                 collateral / 10000 * (isLong ? 1 : -1)
//                 <br />
//                 <strong>Liquidation:</strong> remaining value = collateral + PnL
//                 - funding ≤ 5% * collateral
//               </p>
//               <h3 className="font-semibold text-white mt-4">Use Cases</h3>
//               <ul className="list-disc list-inside">
//                 <li>Speculation: Leverage ETH price movements.</li>
//                 <li>Hedging: Offset spot ETH exposure.</li>
//                 <li>Arbitrage: Exploit funding rate imbalances.</li>
//               </ul>
//               <Chip
//                 color="primary"
//                 variant="flat"
//                 className="mt-4 bg-purple-600/30 text-purple-300"
//               >
//                 Security: Emergency pause, non-reentrant
//               </Chip>
//             </AccordionItem>

//             <AccordionItem
//               key="virtual-amm"
//               aria-label="VirtualAMM Contract"
//               title="VirtualAMM.sol: Price Engine"
//               subtitle="Virtual liquidity pool for pricing and funding"
//               startContent={<BarChart2 className="text-purple-400" size={24} />}
//             >
//               <p className="mb-4">
//                 <Code>VirtualAMM</Code> simulates an AMM with virtual vETH/vUSDT
//                 reserves using x*y=k for slippage-free pricing.
//               </p>
//               <h3 className="font-semibold text-white mt-4">Key Parameters</h3>
//               <Table
//                 classNames={{
//                   base: "bg-gray-700/50",
//                   th: "bg-gray-600 text-gray-200",
//                   td: "text-gray-300",
//                 }}
//               >
//                 <TableHeader>
//                   <TableColumn>Parameter</TableColumn>
//                   <TableColumn>Type</TableColumn>
//                   <TableColumn>Description</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   <TableRow>
//                     <TableCell>vETHreserve</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>Virtual ETH reserve</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>vUSDTreserve</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>Virtual USDT reserve</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>PRECISION</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>1e8 for scaling</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//               <h3 className="font-semibold text-white mt-4">Core Functions</h3>
//               <ul className="list-disc list-inside mb-4">
//                 <li>
//                   <strong>getCurrentPrice():</strong> Returns vUSDT/vETH *
//                   PRECISION.
//                 </li>
//                 <li>
//                   <strong>updateReserve(amount, isLong):</strong> Adjusts
//                   reserves, maintaining k (long: add vUSDT, reduce vETH; short:
//                   vice versa).
//                 </li>
//                 <li>
//                   <strong>calculateFundingRate():</strong> Returns (vAMM price /
//                   spot price - 1) * 10000, capped at ±500 bps.
//                 </li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Use Cases</h3>
//               <ul className="list-disc list-inside">
//                 <li>Pricing: Slippage-free trade execution.</li>
//                 <li>Funding: Balances long/short positions.</li>
//                 <li>Scalability: No real liquidity needed.</li>
//               </ul>
//               <Chip
//                 color="primary"
//                 variant="flat"
//                 className="mt-4 bg-purple-600/30 text-purple-300"
//               >
//                 Advantage: No impermanent loss
//               </Chip>
//             </AccordionItem>

//             <AccordionItem
//               key="vault"
//               aria-label="Vault Contract"
//               title="Vault.sol: Collateral Vault"
//               subtitle="Manages user funds and settlements"
//               startContent={<Wallet className="text-purple-400" size={24} />}
//             >
//               <p className="mb-4">
//                 <Code>Vault</Code> securely handles vUSDT deposits, locks, and
//                 profit/loss settlements with utilization limits.
//               </p>
//               <h3 className="font-semibold text-white mt-4">Key Parameters</h3>
//               <Table
//                 classNames={{
//                   base: "bg-gray-700/50",
//                   th: "bg-gray-600 text-gray-200",
//                   td: "text-gray-300",
//                 }}
//               >
//                 <TableHeader>
//                   <TableColumn>Parameter</TableColumn>
//                   <TableColumn>Type</TableColumn>
//                   <TableColumn>Description</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   <TableRow>
//                     <TableCell>userData</TableCell>
//                     <TableCell>mapping</TableCell>
//                     <TableCell>
//                       Tracks deposited/locked/available funds
//                     </TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>MAX_UTILIZATION</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>8000 (80% max)</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//               <h3 className="font-semibold text-white mt-4">Core Functions</h3>
//               <ul className="list-disc list-inside mb-4">
//                 <li>
//                   <strong>deposit(amount):</strong> Adds vUSDT to available and
//                   deposited.
//                 </li>
//                 <li>
//                   <strong>withdrawal(amount):</strong> Transfers available vUSDT
//                   out.
//                 </li>
//                 <li>
//                   <strong>lockCollateral(user, amount):</strong> Locks funds if
//                   under 80% utilization.
//                 </li>
//                 <li>
//                   <strong>unlockCollateral(user, amount):</strong> Unlocks funds
//                   to available.
//                 </li>
//                 <li>
//                   <strong>payOutProfit/absorbLoss:</strong> Settles trade
//                   outcomes.
//                 </li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Use Cases</h3>
//               <ul className="list-disc list-inside">
//                 <li>Collateral Security: Safe custody of funds.</li>
//                 <li>Settlement: Atomic profit/loss handling.</li>
//                 <li>Risk Control: Utilization cap prevents over-leverage.</li>
//               </ul>
//               <Chip
//                 color="primary"
//                 variant="flat"
//                 className="mt-4 bg-purple-600/30 text-purple-300"
//               >
//                 Security: Only PositionManager access
//               </Chip>
//             </AccordionItem>

//             <AccordionItem
//               key="price-oracle"
//               aria-label="PriceOracle Contract"
//               title="PriceOracle.sol: Price Feed"
//               subtitle="Chainlink-powered spot pricing"
//               startContent={<Zap className="text-purple-400" size={24} />}
//             >
//               <p className="mb-4">
//                 <Code>PriceOracle</Code> fetches ETH/USDT prices from Chainlink
//                 for funding calculations.
//               </p>
//               <h3 className="font-semibold text-white mt-4">Core Functions</h3>
//               <ul className="list-disc list-inside mb-4">
//                 <li>
//                   <strong>getLatestPrice():</strong> Returns Chainlink's latest
//                   ETH/USDT price.
//                 </li>
//                 <li>
//                   <strong>getDecimals():</strong> Returns price feed decimals
//                   (typically 8).
//                 </li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Use Cases</h3>
//               <ul className="list-disc list-inside">
//                 <li>Funding Rates: Aligns perpetual prices with spot.</li>
//                 <li>Price Validation: Ensures fair settlements.</li>
//               </ul>
//               <Chip
//                 color="primary"
//                 variant="flat"
//                 className="mt-4 bg-purple-600/30 text-purple-300"
//               >
//                 Advantage: Decentralized pricing
//               </Chip>
//             </AccordionItem>

//             <AccordionItem
//               key="vusdt"
//               aria-label="VirtualUSDT Contract"
//               title="vUSDT.sol: Stablecoin Collateral"
//               subtitle="Synthetic USDT for trading"
//               startContent={<Wallet className="text-purple-400" size={24} />}
//             >
//               <p className="mb-4">
//                 <Code>VirtualUSDT</Code> is an ERC20 token for stable
//                 collateral, with controlled minting.
//               </p>
//               <h3 className="font-semibold text-white mt-4">Core Functions</h3>
//               <ul className="list-disc list-inside mb-4">
//                 <li>
//                   <strong>limitedMint():</strong> Mints 10,000 vUSDT per address
//                   once.
//                 </li>
//                 <li>
//                   <strong>mint/burn:</strong> Owner-controlled supply
//                   management.
//                 </li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Use Cases</h3>
//               <ul className="list-disc list-inside">
//                 <li>Stable Collateral: Predictable margin calculations.</li>
//                 <li>Testnet Support: Easy minting for testing.</li>
//               </ul>
//               <Chip
//                 color="primary"
//                 variant="flat"
//                 className="mt-4 bg-purple-600/30 text-purple-300"
//               >
//                 Security: Owner-only minting
//               </Chip>
//             </AccordionItem>

//             <AccordionItem
//               key="position-nft"
//               aria-label="PositionNFT Contract"
//               title="PositionNFT.sol: Position Tracking"
//               subtitle="NFT-based position representation"
//               startContent={<Layers className="text-purple-400" size={24} />}
//             >
//               <p className="mb-4">
//                 <Code>PositionNFT</Code> issues non-transferable NFTs to track
//                 trading positions.
//               </p>
//               <h3 className="font-semibold text-white mt-4">Metadata</h3>
//               <Table
//                 classNames={{
//                   base: "bg-gray-700/50",
//                   th: "bg-gray-600 text-gray-200",
//                   td: "text-gray-300",
//                 }}
//               >
//                 <TableHeader>
//                   <TableColumn>Field</TableColumn>
//                   <TableColumn>Type</TableColumn>
//                   <TableColumn>Description</TableColumn>
//                 </TableHeader>
//                 <TableBody>
//                   <TableRow>
//                     <TableCell>leverage</TableCell>
//                     <TableCell>uint8</TableCell>
//                     <TableCell>1-50</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>collateral</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>Collateral amount</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>entryPrice</TableCell>
//                     <TableCell>uint256</TableCell>
//                     <TableCell>Price at entry</TableCell>
//                   </TableRow>
//                   <TableRow>
//                     <TableCell>entryFundingRate</TableCell>
//                     <TableCell>int256</TableCell>
//                     <TableCell>Funding rate at entry</TableCell>
//                   </TableRow>
//                 </TableBody>
//               </Table>
//               <h3 className="font-semibold text-white mt-4">Core Functions</h3>
//               <ul className="list-disc list-inside mb-4">
//                 <li>
//                   <strong>mintPosition(...):</strong> Creates NFT with position
//                   metadata.
//                 </li>
//                 <li>
//                   <strong>burnPosition(tokenId):</strong> Burns NFT on closure.
//                 </li>
//                 <li>
//                   <strong>getUserOpenPositions(user):</strong> Lists open
//                   positions.
//                 </li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Use Cases</h3>
//               <ul className="list-disc list-inside">
//                 <li>Position Tracking: Transparent portfolio management.</li>
//                 <li>Composability: NFTs for DeFi integrations.</li>
//               </ul>
//               <Chip
//                 color="primary"
//                 variant="flat"
//                 className="mt-4 bg-purple-600/30 text-purple-300"
//               >
//                 Security: Non-transferable NFTs
//               </Chip>
//             </AccordionItem>
//           </Accordion>
//         </div>

        

//         {/* Security and Risks */}
//         <div className="w-full max-w-7xl px-6 mt-8">
//           <Card className="border-0 bg-gradient-to-br from-content1 to-content2 backdrop-blur-sm shadow-lg shadow-red-900/20">
//             <CardHeader>
//               <div className="flex items-center space-x-3">
//                 <AlertTriangle className="text-red-400" size={28} />
//                 <h2 className="text-2xl font-semibold text-white">
//                   Security and Risks
//                 </h2>
//               </div>
//             </CardHeader>
//             <CardBody>
//               <h3 className="font-semibold text-white mt-4">
//                 Security Measures
//               </h3>
//               <ul className="list-disc list-inside text-gray-300 mb-4">
//                 <li>ReentrancyGuard for critical functions.</li>
//                 <li>Ownable for admin controls.</li>
//                 <li>Emergency pause in PositionManager.</li>
//                 <li>Chainlink for reliable pricing.</li>
//                 <li>Non-transferable NFTs.</li>
//               </ul>
//               <h3 className="font-semibold text-white mt-4">Risks</h3>
//               <ul className="list-disc list-inside text-gray-300 mb-4">
//                 <li>
//                   <strong>Oracle Risk:</strong> Chainlink delays could skew
//                   funding. Mitigation: Multi-oracle support.
//                 </li>
//                 <li>
//                   <strong>Flash Loans:</strong> vAMM price manipulation risk.
//                   Mitigation: Time-weighted pricing.
//                 </li>
//                 <li>
//                   <strong>MEV:</strong> Liquidation front-running. Mitigation:
//                   Commit-reveal mechanisms.
//                 </li>
//                 <li>
//                   <strong>Contract Bugs:</strong> Requires thorough audits.
//                 </li>
//               </ul>
//               <Chip
//                 color="warning"
//                 variant="flat"
//                 className="mt-4 bg-red-600/30 text-red-300"
//               >
//                 High leverage involves significant risk.
//               </Chip>
//             </CardBody>
//           </Card>
//         </div>
//       </section>
//     </DefaultLayout>
//   );
// }
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

      const [price , isValid] = await readContract(publicClient, {
        address: VAMM_ADDRESS,
        abi: VAMM_ABI,
        functionName: "getCurrentPrice",
      });

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
        args: [10000, 1, true],
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
      <Button onPress={priceAmm}>
        priceAMM
      </Button>
      <br /><br />
      <Button >
        
      </Button>

    </DefaultLayout>
  );
}
