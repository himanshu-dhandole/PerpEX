import React, { useState } from "react";
import {
  Book,
  Code2,
  Layers,
  Wallet,
  ShieldCheck,
  BarChart2,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  FileText,
  Settings,
  Activity,
  Database,
  Lock,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import DefaultLayout from "@/layouts/default";

type SectionKey =
  | "getting-started"
  | "smart-contracts"
  | "advanced"
  | "overview"
  | "introduction"
  | "architecture"
  | "position-manager"
  | "virtual-amm"
  | "vault"
  | "price-oracle"
  | "vusdt"
  | "position-nft"
  | "security"
  | "deployment";

const vETHDocumentation = () => {
  const [activeSection, setActiveSection] =
    useState<SectionKey>("overview");
  const [expandedSections, setExpandedSections] = useState<Record<SectionKey, boolean>>({
  "getting-started": true,
  "smart-contracts": true,
  advanced: true,
  overview: false,
  introduction: false,
  architecture: false,
  "position-manager": false,
  "virtual-amm": false,
  vault: false,
  "price-oracle": false,
  vusdt: false,
  "position-nft": false,
  security: false,
  deployment: false,
});

  const [copiedCode, setCopiedCode] = useState("");

 const toggleSection = (section: SectionKey) => {
  setExpandedSections(prev => ({
    ...prev,
    [section]: !prev[section],
  }));
};


  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const navigationItems = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book size={16} />,
      expandable: true,
      children: [
        { id: "overview", title: "Overview", icon: <FileText size={14} /> },
        {
          id: "introduction",
          title: "Introduction",
          icon: <Target size={14} />,
        },
        {
          id: "architecture",
          title: "Architecture",
          icon: <Layers size={14} />,
        },
      ],
    },
    {
      id: "smart-contracts",
      title: "Smart Contracts",
      icon: <Code2 size={16} />,
      expandable: true,
      children: [
        {
          id: "position-manager",
          title: "PositionManager",
          icon: <Settings size={14} />,
        },
        {
          id: "virtual-amm",
          title: "VirtualAMM",
          icon: <BarChart2 size={14} />,
        },
        { id: "vault", title: "Vault", icon: <Wallet size={14} /> },
        { id: "price-oracle", title: "PriceOracle", icon: <Zap size={14} /> },
        { id: "vusdt", title: "vUSDT Token", icon: <Database size={14} /> },
        {
          id: "position-nft",
          title: "PositionNFT",
          icon: <Activity size={14} />,
        },
      ],
    },
    {
      id: "advanced",
      title: "Advanced Topics",
      icon: <ShieldCheck size={16} />,
      expandable: true,
      children: [
        { id: "security", title: "Security & Risks", icon: <Lock size={14} /> },
        {
          id: "deployment",
          title: "Deployment Guide",
          icon: <ExternalLink size={14} />,
        },
      ],
    },
  ];
  interface SidebarItem {
    id: string;
    title: string;
    expandable?: boolean; // <-- make it optional
  children?: SidebarItem[];
  }
interface SidebarItem {
  id: string;
  title: string;
  icon?: React.ReactNode;
  expandable?: boolean;
  children?: SidebarItem[];
}

const renderSidebarItem = (item: SidebarItem, level = 0) => {
  const isExpanded =
    expandedSections[item.id as keyof typeof expandedSections];
  const isActive = activeSection === item.id;
  const hasChildren = item.children && item.children.length > 0;
  const isExpandable = hasChildren && !!item.expandable;

  return (
    <div key={item.id} className={`${level > 0 ? "ml-5" : ""}`}>
      <div
        className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
            : "text-gray-300 hover:bg-gray-700/60 hover:text-white"
        }`}
        onClick={() => {
          if (isExpandable) {
            toggleSection(item.id as keyof typeof expandedSections);
          } else {
            setActiveSection(item.id as SectionKey);
          }
        }}
      >
        <div className="flex items-center gap-2">
          {item.icon}
          <span className="text-sm font-medium">{item.title}</span>
        </div>
        {isExpandable && (
          <div>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </div>
        )}
      </div>

      {isExpandable && isExpanded && (
        <div className="mt-1 space-y-1">
          {item.children?.map((child) => renderSidebarItem(child, level + 1))}
        </div>
      )}
    </div>
  );
};


interface CodeBlockProps {
  children: string;
  language?: string;
  title?: string;
  copyable?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
  children,
  language = "solidity",
  title,
  copyable = true,
}) => (
  <div className="bg-gray-900/70 rounded-lg border border-gray-700/50 overflow-hidden my-6 backdrop-blur-sm">
    {title && (
      <div className="bg-gray-800/60 px-4 py-2.5 border-b border-gray-700 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-300 uppercase tracking-wide">
          {title}
        </span>
        {copyable && (
          <button
            onClick={() => copyToClipboard(children, title)}
            className="p-1 hover:bg-gray-700 rounded transition-colors"
            aria-label="Copy code"
          >
            {copiedCode === title ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} className="text-gray-400 hover:text-white" />
            )}
          </button>
        )}
      </div>
    )}
    <div className="p-4 text-sm text-gray-300 font-mono whitespace-pre-wrap overflow-x-auto leading-relaxed">
      {children}
    </div>
  </div>
);
interface TableProps {
  headers: string[];
  rows: (string | number | JSX.Element)[][];
}

const Table: React.FC<TableProps> = ({ headers, rows }) => (
  <div className="overflow-x-auto my-6">
    <table className="w-full bg-gray-900/60 border border-gray-700/50 rounded-lg overflow-hidden backdrop-blur-sm">
      <thead className="bg-gray-800/60">
        <tr>
          {headers.map((header, i) => (
            <th
              key={i}
              className="px-4 py-3 text-left text-sm font-semibold text-gray-200 border-b border-gray-600"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr
            key={i}
            className="border-b border-gray-700/50 hover:bg-gray-800/40 transition-colors"
          >
            {row.map((cell, j) => (
              <td key={j} className="px-4 py-3 text-sm text-gray-300">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
interface BadgeProps {
  children: React.ReactNode;
  color?: "blue" | "green" | "yellow" | "red" | "purple" | "indigo";
}

const Badge: React.FC<BadgeProps> = ({ children, color = "blue" }) => {
  const colors: Record<NonNullable<BadgeProps["color"]>, string> = {
    blue: "bg-blue-900/30 text-blue-300 border-blue-700/40",
    green: "bg-green-900/30 text-green-300 border-green-700/40",
    yellow: "bg-yellow-900/30 text-yellow-300 border-yellow-700/40",
    red: "bg-red-900/30 text-red-300 border-red-700/40",
    purple: "bg-purple-900/30 text-purple-300 border-purple-700/40",
    indigo: "bg-indigo-900/30 text-indigo-300 border-indigo-700/40",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded border ${colors[color]} whitespace-nowrap`}
    >
      {children}
    </span>
  );
};


  const renderContent = () => {
    return (
      <div className="space-y-8">
        {(() => {
          switch (activeSection) {
            case "overview":
              return (
                <>
                  <div>
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                      vETH Perpetuals Protocol
                    </h1>
                    <p className="text-xl text-gray-300 leading-relaxed mb-6 max-w-3xl">
                      A decentralized perpetual futures protocol powered by
                      virtual AMM, Chainlink oracles, and NFT-based positions.
                    </p>
                    <div className="flex flex-wrap gap-2 mb-8">
                      <Badge color="blue">Decentralized</Badge>
                      <Badge color="green">50x Leverage</Badge>
                      <Badge color="purple">NFT Positions</Badge>
                      <Badge color="yellow">Virtual AMM</Badge>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-500/30 rounded-xl p-8 shadow-2xl">
                    <h2 className="text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                      <Book size={20} className="text-blue-400" />
                      Abstract
                    </h2>
                    <p className="text-gray-300 leading-relaxed mb-4">
                      This whitepaper outlines a decentralized perpetual futures
                      trading protocol for the vETH/vUSDT pair, utilizing a
                      virtual Automated Market Maker (vAMM) for price discovery,
                      Chainlink oracles for real-time pricing, and ERC721 NFTs
                      for position tracking.
                    </p>
                    <p className="text-gray-300 leading-relaxed">
                      Supporting up to 50x leverage with 8-hour funding
                      intervals, the system ensures market neutrality through
                      dynamic funding rates and robust liquidation mechanisms.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Zap className="text-yellow-400" size={20} />
                        Key Features
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Virtual AMM for slippage-free trading</li>
                        <li>• Up to 50x leverage</li>
                        <li>• NFT-based position tracking</li>
                        <li>• 8-hour funding intervals</li>
                        <li>• Chainlink price oracles</li>
                      </ul>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <Target className="text-blue-400" size={20} />
                        Use Cases
                      </h3>
                      <ul className="space-y-2 text-gray-300">
                        <li>• Speculation on ETH price movements</li>
                        <li>• Hedging spot positions</li>
                        <li>• Arbitrage opportunities</li>
                        <li>• Composable DeFi integrations</li>
                      </ul>
                    </div>
                  </div>
                </>
              );

            case "introduction":
              return (
                <div>
                  <h1 className="text-4xl font-bold text-white mb-6">
                    Introduction
                  </h1>
                  <div className="text-gray-300 space-y-4 mb-8">
                    <p>
                      Perpetual futures enable traders to speculate on asset
                      prices without expiration, a powerful tool in both
                      traditional and decentralized finance.
                    </p>
                    <p>
                      This protocol introduces a fully on-chain solution,
                      leveraging smart contracts for trustless position
                      management, settlements, and risk controls.
                    </p>
                  </div>
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-700/40 rounded-xl p-8">
                    <h2 className="text-2xl font-semibold text-white mb-6">
                      Key Innovations
                    </h2>
                    <div className="space-y-5">
                      {[
                        {
                          icon: (
                            <BarChart2 size={18} className="text-green-400" />
                          ),
                          title: "Virtual AMM",
                          desc: "Slippage-free, infinite liquidity trading without real liquidity providers.",
                        },
                        {
                          icon: <Zap size={18} className="text-blue-400" />,
                          title: "Dynamic Funding",
                          desc: "Funding rates align perpetual and spot prices automatically.",
                        },
                        {
                          icon: (
                            <Layers size={18} className="text-purple-400" />
                          ),
                          title: "NFT Positions",
                          desc: "Non-transferable NFTs for position ownership and composability.",
                        },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="mt-1">{item.icon}</div>
                          <div>
                            <h3 className="font-medium text-white">
                              {item.title}
                            </h3>
                            <p className="text-gray-300 text-sm">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );

            case "architecture":
              return (
                <div>
                  <h1 className="text-4xl font-bold text-white mb-6">
                    System Architecture
                  </h1>
                  <p className="text-gray-300 mb-8">
                    The protocol comprises modular smart contracts designed for
                    security, efficiency, and interoperability.
                  </p>
                  <div className="grid lg:grid-cols-2 gap-6">
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Code2 className="text-blue-400" size={20} />
                        Core Components
                      </h2>
                      <div className="space-y-3">
                        <div className="border-l-2 border-blue-500 pl-4">
                          <h3 className="font-medium text-white">
                            PositionManager
                          </h3>
                          <p className="text-sm text-gray-300">
                            Manages trading, liquidations, and funding
                            calculations.
                          </p>
                        </div>
                        <div className="border-l-2 border-green-500 pl-4">
                          <h3 className="font-medium text-white">VirtualAMM</h3>
                          <p className="text-sm text-gray-300">
                            Handles price discovery and virtual reserve updates.
                          </p>
                        </div>
                        <div className="border-l-2 border-purple-500 pl-4">
                          <h3 className="font-medium text-white">Vault</h3>
                          <p className="text-sm text-gray-300">
                            Secures collateral and processes settlements.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                        <Layers className="text-green-400" size={20} />
                        Supporting Components
                      </h2>
                      <div className="space-y-3">
                        <div className="border-l-2 border-yellow-500 pl-4">
                          <h3 className="font-medium text-white">
                            PriceOracle
                          </h3>
                          <p className="text-sm text-gray-300">
                            Fetches ETH/USDT spot prices via Chainlink.
                          </p>
                        </div>
                        <div className="border-l-2 border-red-500 pl-4">
                          <h3 className="font-medium text-white">
                            PositionNFT
                          </h3>
                          <p className="text-sm text-gray-300">
                            Tokenizes positions as ERC721 NFTs.
                          </p>
                        </div>
                        <div className="border-l-2 border-indigo-500 pl-4">
                          <h3 className="font-medium text-white">vUSDT</h3>
                          <p className="text-sm text-gray-300">
                            Stablecoin for collateral management.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4 mt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="text-yellow-400" size={16} />
                      <span className="text-yellow-300 font-medium">
                        Access Control
                      </span>
                    </div>
                    <p className="text-yellow-200 text-sm">
                      Access controls ensure only authorized contracts interact
                      with sensitive functions, maintaining system security.
                    </p>
                  </div>
                </div>
              );

            case "position-manager":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-900/30 rounded-lg">
                      <Settings className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        PositionManager
                      </h1>
                      <p className="text-gray-400">
                        Core trading logic and position management
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 mb-4">
                      The PositionManager contract is the heart of the protocol,
                      coordinating trading operations with robust security
                      measures including Ownable and ReentrancyGuard patterns.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge color="purple">Core Contract</Badge>
                      <Badge color="blue">Ownable</Badge>
                      <Badge color="green">ReentrancyGuard</Badge>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Key Parameters
                    </h2>
                    <Table
                      headers={["Parameter", "Type", "Value", "Description"]}
                      rows={[
                        [
                          "MAX_LEVERAGE",
                          "uint256",
                          "50",
                          "Maximum leverage allowed",
                        ],
                        [
                          "TRADING_FEES_BPS",
                          "uint256",
                          "500",
                          "5% trading fee in basis points",
                        ],
                        [
                          "LIQUIDATION_THRESHOLD_BPS",
                          "uint256",
                          "500",
                          "5% maintenance margin",
                        ],
                        [
                          "FUNDING_INTERVAL",
                          "uint256",
                          "8 hours",
                          "Funding rate update frequency",
                        ],
                      ]}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Core Functions
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          openPosition()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Opens a new leveraged position with the specified
                          parameters.
                        </p>
                        <CodeBlock
                          title="Function Signature"
                          language="solidity"
                        >
                          {`function openPosition(
    uint256 collateral,
    uint8 leverage,
    bool isLong
) external nonReentrant returns (uint256 tokenId)`}
                        </CodeBlock>
                        <div className="mt-4">
                          <h4 className="font-medium text-white mb-2">
                            Process Flow:
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-gray-300">
                            <li>Validates input parameters (leverage 1-50)</li>
                            <li>Deducts 5% trading fee from collateral</li>
                            <li>Locks remaining collateral in Vault</li>
                            <li>Updates vAMM virtual reserves</li>
                            <li>Mints PositionNFT with metadata</li>
                          </ol>
                        </div>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          closePosition()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Closes an existing position and settles PnL.
                        </p>
                        <CodeBlock
                          title="Function Signature"
                          language="solidity"
                        >
                          {`function closePosition(uint256 tokenId) 
    external 
    nonReentrant`}
                        </CodeBlock>
                        <div className="mt-4">
                          <h4 className="font-medium text-white mb-2">
                            Process Flow:
                          </h4>
                          <ol className="list-decimal list-inside space-y-1 text-gray-300">
                            <li>Verifies NFT ownership</li>
                            <li>Calculates PnL and funding costs</li>
                            <li>Settles through Vault (profit/loss)</li>
                            <li>Burns PositionNFT</li>
                            <li>Emits PositionClosed event</li>
                          </ol>
                        </div>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          liquidatePosition()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Liquidates underwater positions to protect the
                          protocol.
                        </p>
                        <CodeBlock
                          title="Liquidation Condition"
                          language="solidity"
                        >
                          {`// Position is liquidatable when:
remainingValue = collateral + PnL - funding <= 5% * collateral`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Calculation Formulas
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                        <h3 className="font-medium text-blue-300 mb-2">
                          PnL Calculation
                        </h3>
                        <CodeBlock language="javascript">
                          {`PnL = (currentPrice - entryPrice) / entryPrice * leverage * collateral * direction
where direction = isLong ? 1 : -1`}
                        </CodeBlock>
                      </div>
                      <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                        <h3 className="font-medium text-green-300 mb-2">
                          Funding Cost
                        </h3>
                        <CodeBlock language="javascript">
                          {`fundingCost = (accumulatedFundingRate - entryFundingRate) 
              * collateral / 10000 * direction`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case "virtual-amm":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <BarChart2 className="text-green-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        VirtualAMM
                      </h1>
                      <p className="text-gray-400">
                        Virtual liquidity pool for price discovery
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 mb-4">
                      The VirtualAMM simulates an Automated Market Maker with
                      virtual vETH/vUSDT reserves using the constant product
                      formula (x * y = k) for slippage-free pricing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge color="green">Virtual Reserves</Badge>
                      <Badge color="blue">Constant Product</Badge>
                      <Badge color="purple">Slippage-Free</Badge>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Key Parameters
                    </h2>
                    <Table
                      headers={["Parameter", "Type", "Description"]}
                      rows={[
                        [
                          "vETHreserve",
                          "uint256",
                          "Virtual ETH reserve amount",
                        ],
                        [
                          "vUSDTreserve",
                          "uint256",
                          "Virtual USDT reserve amount",
                        ],
                        ["PRECISION", "uint256", "1e8 for decimal scaling"],
                        ["k", "uint256", "Constant product (vETH * vUSDT)"],
                      ]}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Core Functions
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          getCurrentPrice()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Returns the current vETH price in vUSDT terms.
                        </p>
                        <CodeBlock
                          title="Price Calculation"
                          language="solidity"
                        >
                          {`function getCurrentPrice() public view returns (uint256) {
    return (vUSDTreserve * PRECISION) / vETHreserve;
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          updateReserve()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Updates virtual reserves while maintaining the
                          constant product.
                        </p>
                        <CodeBlock
                          title="Reserve Update Logic"
                          language="solidity"
                        >
                          {`function updateReserve(uint256 amount, bool isLong) external {
    if (isLong) {
        // Long: Add vUSDT, reduce vETH
        vUSDTreserve += amount;
        vETHreserve = k / vUSDTreserve;
    } else {
        // Short: Add vETH, reduce vUSDT
        vETHreserve += amount;
        vUSDTreserve = k / vETHreserve;
    }
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          calculateFundingRate()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Calculates funding rate based on price divergence from
                          spot.
                        </p>
                        <CodeBlock
                          title="Funding Rate Formula"
                          language="solidity"
                        >
                          {`function calculateFundingRate() external view returns (int256) {
    uint256 vAMMPrice = getCurrentPrice();
    uint256 spotPrice = priceOracle.getLatestPrice();
    int256 fundingRate = int256((vAMMPrice * 10000) / spotPrice) - 10000;
    // Cap at ±500 bps
    if (fundingRate > 500) fundingRate = 500;
    if (fundingRate < -500) fundingRate = -500;
    return fundingRate;
}`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-green-300 mb-4">
                      Advantages
                    </h2>
                    <ul className="space-y-2 text-green-200">
                      <li>
                        • <strong>Infinite Liquidity:</strong> No slippage
                        regardless of trade size
                      </li>
                      <li>
                        • <strong>No Impermanent Loss:</strong> Virtual reserves
                        eliminate LP risks
                      </li>
                      <li>
                        • <strong>Capital Efficiency:</strong> No real liquidity
                        required
                      </li>
                      <li>
                        • <strong>Price Stability:</strong> Funding mechanism
                        keeps prices aligned
                      </li>
                    </ul>
                  </div>
                </div>
              );

            case "vault":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <Wallet className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">Vault</h1>
                      <p className="text-gray-400">
                        Collateral management and settlement engine
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 mb-4">
                      The Vault contract securely handles vUSDT deposits,
                      collateral locking, and profit/loss settlements with
                      built-in utilization limits to prevent over-leverage.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge color="blue">Secure Storage</Badge>
                      <Badge color="green">Utilization Cap</Badge>
                      <Badge color="purple">Atomic Settlement</Badge>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Key Parameters
                    </h2>
                    <Table
                      headers={["Parameter", "Type", "Value", "Description"]}
                      rows={[
                        [
                          "MAX_UTILIZATION",
                          "uint256",
                          "8000",
                          "80% maximum utilization rate",
                        ],
                        [
                          "userData",
                          "mapping",
                          "-",
                          "User balance tracking (deposited/locked/available)",
                        ],
                        [
                          "totalDeposited",
                          "uint256",
                          "-",
                          "Total vUSDT deposited in vault",
                        ],
                        [
                          "totalLocked",
                          "uint256",
                          "-",
                          "Total vUSDT locked as collateral",
                        ],
                      ]}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Core Functions
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          deposit()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Deposits vUSDT tokens into the vault for trading
                          collateral.
                        </p>
                        <CodeBlock title="Deposit Function" language="solidity">
                          {`function deposit(uint256 amount) external {
    require(amount > 0, "Amount must be greater than 0");
    vUSDT.transferFrom(msg.sender, address(this), amount);
    userData[msg.sender].deposited += amount;
    userData[msg.sender].available += amount;
    totalDeposited += amount;
    emit Deposited(msg.sender, amount);
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          withdraw()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Withdraws available vUSDT tokens from the vault.
                        </p>
                        <CodeBlock
                          title="Withdrawal Function"
                          language="solidity"
                        >
                          {`function withdraw(uint256 amount) external {
    require(amount > 0, "Amount must be greater than 0");
    require(userData[msg.sender].available >= amount, "Insufficient available balance");
    userData[msg.sender].available -= amount;
    userData[msg.sender].deposited -= amount;
    totalDeposited -= amount;
    vUSDT.transfer(msg.sender, amount);
    emit Withdrawn(msg.sender, amount);
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          lockCollateral()
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Locks user funds as collateral for trading positions.
                        </p>
                        <CodeBlock
                          title="Collateral Locking"
                          language="solidity"
                        >
                          {`function lockCollateral(address user, uint256 amount) external onlyPositionManager {
    require(userData[user].available >= amount, "Insufficient available balance");
    // Check utilization limit (80% max)
    require(
        (totalLocked + amount) * 10000 <= totalDeposited * MAX_UTILIZATION,
        "Utilization limit exceeded"
    );
    userData[user].available -= amount;
    userData[user].locked += amount;
    totalLocked += amount;
    emit CollateralLocked(user, amount);
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          Settlement Functions
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Handle profit distributions and loss absorption.
                        </p>
                        <CodeBlock
                          title="Profit & Loss Settlement"
                          language="solidity"
                        >
                          {`function payOutProfit(address user, uint256 amount) external onlyPositionManager {
    // Mint new vUSDT for profits (protocol backing)
    vUSDT.mint(address(this), amount);
    userData[user].available += amount;
    userData[user].deposited += amount;
    totalDeposited += amount;
}
function absorbLoss(address user, uint256 amount) external onlyPositionManager {
    // Burn vUSDT representing losses
    if (amount > 0) {
        vUSDT.burn(amount);
    }
}`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-yellow-300 mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Risk Management
                    </h2>
                    <div className="space-y-2 text-yellow-200">
                      <p>
                        • <strong>Utilization Cap:</strong> Maximum 80% of
                        deposits can be locked as collateral
                      </p>
                      <p>
                        • <strong>Access Control:</strong> Only PositionManager
                        can lock/unlock funds
                      </p>
                      <p>
                        • <strong>Atomic Operations:</strong> All settlements
                        are atomic to prevent inconsistencies
                      </p>
                    </div>
                  </div>
                </div>
              );

            case "price-oracle":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-900/30 rounded-lg">
                      <Zap className="text-yellow-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        PriceOracle
                      </h1>
                      <p className="text-gray-400">
                        Chainlink-powered external price feeds
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 mb-4">
                      The PriceOracle contract integrates with Chainlink's
                      decentralized oracle network to provide reliable ETH/USDT
                      spot prices for funding rate calculations and price
                      validation.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge color="yellow">Chainlink</Badge>
                      <Badge color="blue">Decentralized</Badge>
                      <Badge color="green">Real-time</Badge>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Implementation
                    </h2>
                    <CodeBlock title="PriceOracle Contract" language="solidity">
                      {`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
contract PriceOracle {
    AggregatorV3Interface internal priceFeed;
    constructor(address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
    }
    function getLatestPrice() public view returns (uint256) {
        (, int256 price, , uint256 timeStamp, ) = priceFeed.latestRoundData();
        require(timeStamp > 0, "Round not complete");
        require(price > 0, "Invalid price");
        return uint256(price);
    }
    function getDecimals() public view returns (uint8) {
        return priceFeed.decimals();
    }
    function getDescription() public view returns (string memory) {
        return priceFeed.description();
    }
}`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Chainlink Price Feeds
                    </h2>
                    <Table
                      headers={[
                        "Network",
                        "Pair",
                        "Contract Address",
                        "Decimals",
                      ]}
                      rows={[
                        [
                          "Ethereum",
                          "ETH/USD",
                          "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                          "8",
                        ],
                        [
                          "Polygon",
                          "ETH/USD",
                          "0xF9680D99D6C9589e2a93a78A04A279e509205945",
                          "8",
                        ],
                        [
                          "Arbitrum",
                          "ETH/USD",
                          "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
                          "8",
                        ],
                        [
                          "Optimism",
                          "ETH/USD",
                          "0x13e3Ee699D1909E989722E753853AE30b17e08c5",
                          "8",
                        ],
                      ]}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Usage in Protocol
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                        <h3 className="font-medium text-blue-300 mb-2">
                          Funding Rate Calculation
                        </h3>
                        <p className="text-blue-200 text-sm mb-2">
                          The oracle price is used to calculate funding rates by
                          comparing with vAMM prices:
                        </p>
                        <CodeBlock language="javascript">
                          {`fundingRate = (vAMMPrice / oraclePrice - 1) * 10000`}
                        </CodeBlock>
                      </div>
                      <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-4">
                        <h3 className="font-medium text-green-300 mb-2">
                          Price Validation
                        </h3>
                        <p className="text-green-200 text-sm">
                          Oracle prices serve as a reality check to ensure vAMM
                          prices don't deviate excessively from market rates.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-red-300 mb-4 flex items-center gap-2">
                      <AlertTriangle size={20} />
                      Oracle Risks & Mitigations
                    </h2>
                    <div className="space-y-3 text-red-200">
                      <div>
                        <h3 className="font-medium">Price Feed Delays</h3>
                        <p className="text-sm text-red-300">
                          Risk: Stale prices during high volatility
                        </p>
                        <p className="text-sm">
                          Mitigation: Timestamp validation and heartbeat
                          monitoring
                        </p>
                      </div>
                      <div>
                        <h3 className="font-medium">Oracle Manipulation</h3>
                        <p className="text-sm text-red-300">
                          Risk: Coordinated attacks on price feeds
                        </p>
                        <p className="text-sm">
                          Mitigation: Multiple oracle sources and circuit
                          breakers
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case "vusdt":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-indigo-900/30 rounded-lg">
                      <Database className="text-indigo-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        vUSDT Token
                      </h1>
                      <p className="text-gray-400">
                        Virtual USDT for stable collateral
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 mb-4">
                      vUSDT is an ERC20 token designed as stable collateral for
                      the perpetual trading protocol. It provides predictable
                      value for margin calculations and risk management.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge color="indigo">ERC20</Badge>
                      <Badge color="green">Stable Value</Badge>
                      <Badge color="blue">Mintable</Badge>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Contract Implementation
                    </h2>
                    <CodeBlock title="vUSDT Contract" language="solidity">
                      {`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract VirtualUSDT is ERC20, Ownable {
    mapping(address => bool) public hasClaimedInitial;
    uint256 public constant INITIAL_MINT_AMOUNT = 10000 * 10**18; // 10,000 vUSDT
    constructor() ERC20("Virtual USDT", "vUSDT") {}
    function limitedMint() external {
        require(!hasClaimedInitial[msg.sender], "Already claimed initial mint");
        hasClaimedInitial[msg.sender] = true;
        _mint(msg.sender, INITIAL_MINT_AMOUNT);
    }
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }
    function burn(uint256 amount) external onlyOwner {
        _burn(address(this), amount);
    }
    function decimals() public pure override returns (uint8) {
        return 18;
    }
}`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Token Economics
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Supply Mechanism
                        </h3>
                        <ul className="space-y-2 text-gray-300">
                          <li>
                            • <strong>Initial Mint:</strong> 10,000 vUSDT per
                            address
                          </li>
                          <li>
                            • <strong>Owner Minting:</strong> Controlled by
                            protocol
                          </li>
                          <li>
                            • <strong>Profit Minting:</strong> New tokens for
                            trader profits
                          </li>
                          <li>
                            • <strong>Loss Burning:</strong> Tokens burned for
                            losses
                          </li>
                        </ul>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">
                          Use Cases
                        </h3>
                        <ul className="space-y-2 text-gray-300">
                          <li>
                            • <strong>Trading Collateral:</strong> Margin for
                            positions
                          </li>
                          <li>
                            • <strong>Profit Settlement:</strong> Payout
                            currency
                          </li>
                          <li>
                            • <strong>Fee Payments:</strong> Trading fees
                          </li>
                          <li>
                            • <strong>Testing:</strong> Easy access for
                            development
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Integration Examples
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          Getting Test Tokens
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Users can mint initial vUSDT for testing and trading.
                        </p>
                        <CodeBlock
                          title="Claiming Initial vUSDT"
                          language="javascript"
                        >
                          {`// Frontend integration
const vUSDT = new ethers.Contract(vUSDTAddress, vUSDTABI, signer);
// Check if user has already claimed
const hasClaimed = await vUSDT.hasClaimedInitial(userAddress);
if (!hasClaimed) {
    // Mint 10,000 vUSDT
    const tx = await vUSDT.limitedMint();
    await tx.wait();
    console.log("Claimed 10,000 vUSDT successfully");
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          Approving for Trading
                        </h3>
                        <p className="text-gray-300 mb-4">
                          Users must approve the Vault contract to spend their
                          vUSDT.
                        </p>
                        <CodeBlock title="Token Approval" language="javascript">
                          {`// Approve Vault to spend vUSDT
const approvalAmount = ethers.utils.parseEther("1000"); // 1000 vUSDT
const tx = await vUSDT.approve(vaultAddress, approvalAmount);
await tx.wait();
// Check allowance
const allowance = await vUSDT.allowance(userAddress, vaultAddress);
console.log("Approved amount:", ethers.utils.formatEther(allowance));`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-blue-300 mb-4">
                      Advantages
                    </h2>
                    <ul className="space-y-2 text-blue-200">
                      <li>
                        • <strong>Price Stability:</strong> Eliminates
                        collateral volatility risks
                      </li>
                      <li>
                        • <strong>Predictable Margins:</strong> Consistent
                        liquidation thresholds
                      </li>
                      <li>
                        • <strong>Easy Testing:</strong> Simple mint function
                        for development
                      </li>
                      <li>
                        • <strong>Protocol Control:</strong> Managed supply for
                        system stability
                      </li>
                    </ul>
                  </div>
                </div>
              );

            case "position-nft":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-900/30 rounded-lg">
                      <Activity className="text-red-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        PositionNFT
                      </h1>
                      <p className="text-gray-400">
                        NFT-based position tracking and ownership
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Overview
                    </h2>
                    <p className="text-gray-300 mb-4">
                      PositionNFT issues non-transferable ERC721 tokens to
                      represent trading positions. Each NFT contains complete
                      position metadata and serves as proof of ownership for
                      position management operations.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      <Badge color="red">ERC721</Badge>
                      <Badge color="yellow">Non-transferable</Badge>
                      <Badge color="purple">Metadata</Badge>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Position Metadata
                    </h2>
                    <Table
                      headers={["Field", "Type", "Description", "Example"]}
                      rows={[
                        ["leverage", "uint8", "Position leverage (1-50)", "10"],
                        [
                          "collateral",
                          "uint256",
                          "Collateral amount in vUSDT",
                          "1000e18",
                        ],
                        [
                          "entryPrice",
                          "uint256",
                          "Price when position opened",
                          "2000e8",
                        ],
                        [
                          "entryFundingRate",
                          "int256",
                          "Funding rate at entry",
                          "150",
                        ],
                        ["isLong", "bool", "Position direction", "true"],
                        [
                          "timestamp",
                          "uint256",
                          "Opening timestamp",
                          "1703001600",
                        ],
                      ]}
                    />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Contract Implementation
                    </h2>
                    <CodeBlock title="PositionNFT Contract" language="solidity">
                      {`// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
contract PositionNFT is ERC721, Ownable {
    struct Position {
        uint8 leverage;
        uint256 collateral;
        uint256 entryPrice;
        int256 entryFundingRate;
        bool isLong;
        uint256 timestamp;
    }
    mapping(uint256 => Position) public positions;
    mapping(address => uint256[]) public userPositions;
    uint256 public nextTokenId = 1;
    constructor() ERC721("vETH Position", "vETH-POS") {}
    function mintPosition(
        address to,
        uint8 leverage,
        uint256 collateral,
        uint256 entryPrice,
        int256 entryFundingRate,
        bool isLong
    ) external onlyOwner returns (uint256) {
        uint256 tokenId = nextTokenId++;
        positions[tokenId] = Position({
            leverage: leverage,
            collateral: collateral,
            entryPrice: entryPrice,
            entryFundingRate: entryFundingRate,
            isLong: isLong,
            timestamp: block.timestamp
        });
        userPositions[to].push(tokenId);
        _mint(to, tokenId);
        return tokenId;
    }
    function burnPosition(uint256 tokenId) external onlyOwner {
        address owner = ownerOf(tokenId);
        // Remove from user positions array
        uint256[] storage userTokens = userPositions[owner];
        for (uint256 i = 0; i < userTokens.length; i++) {
            if (userTokens[i] == tokenId) {
                userTokens[i] = userTokens[userTokens.length - 1];
                userTokens.pop();
                break;
            }
        }
        delete positions[tokenId];
        _burn(tokenId);
    }
    function getUserOpenPositions(address user) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return userPositions[user];
    }
    // Override transfer functions to make NFTs non-transferable
    function transferFrom(address, address, uint256) public pure override {
        revert("PositionNFTs are non-transferable");
    }
    function safeTransferFrom(address, address, uint256) public pure override {
        revert("PositionNFTs are non-transferable");
    }
    function safeTransferFrom(address, address, uint256, bytes memory) 
        public 
        pure 
        override 
    {
        revert("PositionNFTs are non-transferable");
    }
}`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Usage Examples
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          Querying User Positions
                        </h3>
                        <CodeBlock
                          title="Getting User Positions"
                          language="javascript"
                        >
                          {`// Get all open positions for a user
const positionNFT = new ethers.Contract(nftAddress, nftABI, provider);
const userPositions = await positionNFT.getUserOpenPositions(userAddress);
console.log(\`User has \${userPositions.length} open positions\`);
// Get position details
for (const tokenId of userPositions) {
    const position = await positionNFT.positions(tokenId);
    console.log({
        tokenId: tokenId.toString(),
        leverage: position.leverage,
        collateral: ethers.utils.formatEther(position.collateral),
        entryPrice: position.entryPrice.toString(),
        isLong: position.isLong,
        timestamp: new Date(position.timestamp * 1000)
    });
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          Position Analytics
                        </h3>
                        <CodeBlock
                          title="Calculating Position PnL"
                          language="javascript"
                        >
                          {`async function calculatePositionPnL(tokenId) {
    const position = await positionNFT.positions(tokenId);
    const currentPrice = await virtualAMM.getCurrentPrice();
    const priceDiff = currentPrice.sub(position.entryPrice);
    const priceChangePercent = priceDiff.mul(10000).div(position.entryPrice);
    const direction = position.isLong ? 1 : -1;
    const pnlPercent = priceChangePercent.mul(position.leverage).mul(direction);
    const pnlAmount = position.collateral.mul(pnlPercent).div(10000);
    return {
        pnlAmount: ethers.utils.formatEther(pnlAmount),
        pnlPercent: pnlPercent.toNumber() / 100,
        currentPrice: currentPrice.toString(),
        entryPrice: position.entryPrice.toString()
    };
}`}
                        </CodeBlock>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Benefits & Design Decisions
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-green-300 mb-4">
                          Benefits
                        </h3>
                        <ul className="space-y-2 text-green-200">
                          <li>
                            • <strong>Transparent Ownership:</strong> Clear
                            position ownership
                          </li>
                          <li>
                            • <strong>Composability:</strong> Positions can be
                            used in other DeFi protocols
                          </li>
                          <li>
                            • <strong>Portfolio Tracking:</strong> Easy position
                            management
                          </li>
                          <li>
                            • <strong>Metadata Storage:</strong> All position
                            data on-chain
                          </li>
                        </ul>
                      </div>
                      <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-red-300 mb-4">
                          Non-transferable Design
                        </h3>
                        <ul className="space-y-2 text-red-200">
                          <li>
                            • <strong>Security:</strong> Prevents position
                            trading/manipulation
                          </li>
                          <li>
                            • <strong>Risk Control:</strong> Maintains
                            position-owner relationship
                          </li>
                          <li>
                            • <strong>Compliance:</strong> Avoids securities
                            classification
                          </li>
                          <li>
                            • <strong>Simplicity:</strong> Clearer liquidation
                            rights
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );

            case "security":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-red-900/30 rounded-lg">
                      <Lock className="text-red-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Security & Risks
                      </h1>
                      <p className="text-gray-400">
                        Comprehensive security analysis and risk assessment
                      </p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-900/20 to-blue-900/20 border border-green-800/30 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <ShieldCheck className="text-green-400" size={24} />
                      Security Measures
                    </h2>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-semibold text-green-300 mb-3">
                          Smart Contract Security
                        </h3>
                        <ul className="space-y-2 text-green-200">
                          <li>
                            • <strong>ReentrancyGuard:</strong> Prevents
                            reentrancy attacks
                          </li>
                          <li>
                            • <strong>Ownable Pattern:</strong> Controlled admin
                            functions
                          </li>
                          <li>
                            • <strong>Emergency Pause:</strong> Circuit breaker
                            for critical issues
                          </li>
                          <li>
                            • <strong>Input Validation:</strong> Comprehensive
                            parameter checking
                          </li>
                          <li>
                            • <strong>Access Control:</strong> Restricted
                            function permissions
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-green-300 mb-3">
                          Oracle & Price Security
                        </h3>
                        <ul className="space-y-2 text-green-200">
                          <li>
                            • <strong>Chainlink Integration:</strong>{" "}
                            Decentralized price feeds
                          </li>
                          <li>
                            • <strong>Price Validation:</strong> Timestamp and
                            sanity checks
                          </li>
                          <li>
                            • <strong>Funding Rate Caps:</strong> Limited to
                            ±500 bps
                          </li>
                          <li>
                            • <strong>Virtual AMM:</strong> Reduces external
                            liquidity dependency
                          </li>
                          <li>
                            • <strong>Non-transferable NFTs:</strong> Prevents
                            position manipulation
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-red-900/20 to-yellow-900/20 border border-red-800/30 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                      <AlertTriangle className="text-red-400" size={24} />
                      Risk Analysis
                    </h2>
                    <div className="space-y-6">
                      <div className="bg-red-900/20 border border-red-700/40 rounded-xl p-4">
                        <h3 className="font-semibold text-red-300 mb-3">
                          1. Oracle Risks
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-red-200 font-medium mb-2">
                              Risks:
                            </h4>
                            <ul className="text-red-300 text-sm space-y-1">
                              <li>
                                • Price feed delays during high volatility
                              </li>
                              <li>• Oracle network downtime</li>
                              <li>• Coordinated oracle manipulation</li>
                              <li>
                                • Stale price data affecting funding rates
                              </li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-green-200 font-medium mb-2">
                              Mitigations:
                            </h4>
                            <ul className="text-green-300 text-sm space-y-1">
                              <li>• Multiple oracle source aggregation</li>
                              <li>• Price freshness validation</li>
                              <li>• Circuit breakers for extreme deviations</li>
                              <li>• Time-weighted average pricing (TWAP)</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-900/20 border border-yellow-700/40 rounded-xl p-4">
                        <h3 className="font-semibold text-yellow-300 mb-3">
                          2. Flash Loan Attacks
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-yellow-200 font-medium mb-2">
                              Risks:
                            </h4>
                            <ul className="text-yellow-300 text-sm space-y-1">
                              <li>• vAMM price manipulation</li>
                              <li>• Artificial funding rate skewing</li>
                              <li>• Large position liquidation triggers</li>
                              <li>• MEV extraction opportunities</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-green-200 font-medium mb-2">
                              Mitigations:
                            </h4>
                            <ul className="text-green-300 text-sm space-y-1">
                              <li>• Time-weighted pricing mechanisms</li>
                              <li>• Position size limits</li>
                              <li>• Commit-reveal schemes</li>
                              <li>• Flash loan detection patterns</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="bg-purple-900/20 border border-purple-700/40 rounded-xl p-4">
                        <h3 className="font-semibold text-purple-300 mb-3">
                          3. Smart Contract Risks
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-purple-200 font-medium mb-2">
                              Risks:
                            </h4>
                            <ul className="text-purple-300 text-sm space-y-1">
                              <li>• Contract upgrade vulnerabilities</li>
                              <li>• Logic errors in calculations</li>
                              <li>• Reentrancy attack vectors</li>
                              <li>• Gas optimization exploits</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-green-200 font-medium mb-2">
                              Mitigations:
                            </h4>
                            <ul className="text-green-300 text-sm space-y-1">
                              <li>• Comprehensive security audits</li>
                              <li>
                                • Formal verification of critical functions
                              </li>
                              <li>• Gradual rollout with limits</li>
                              <li>• Bug bounty programs</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-700/40 rounded-xl p-4">
                        <h3 className="font-semibold text-blue-300 mb-3">
                          4. Economic Risks
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="text-blue-200 font-medium mb-2">
                              Risks:
                            </h4>
                            <ul className="text-blue-300 text-sm space-y-1">
                              <li>• Extreme market volatility</li>
                              <li>• Mass liquidation cascades</li>
                              <li>• Funding rate manipulation</li>
                              <li>• Liquidity crunch scenarios</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-green-200 font-medium mb-2">
                              Mitigations:
                            </h4>
                            <ul className="text-green-300 text-sm space-y-1">
                              <li>• Dynamic risk parameters</li>
                              <li>• Insurance fund mechanisms</li>
                              <li>• Progressive liquidation systems</li>
                              <li>• Stress testing protocols</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">
                      Security Best Practices
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          1. Pre-Deployment Security
                        </h3>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>• Multiple independent security audits</li>
                          <li>
                            • Formal verification of critical mathematical
                            operations
                          </li>
                          <li>• Comprehensive unit and integration testing</li>
                          <li>
                            • Testnet deployment with extensive stress testing
                          </li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          2. Post-Deployment Monitoring
                        </h3>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>• Real-time contract monitoring and alerting</li>
                          <li>• Oracle price feed health monitoring</li>
                          <li>• Unusual trading pattern detection</li>
                          <li>• Gas usage optimization monitoring</li>
                        </ul>
                      </div>
                      <div>
                        <h3 className="font-semibold text-white mb-2">
                          3. Incident Response
                        </h3>
                        <ul className="text-gray-300 space-y-1 ml-4">
                          <li>
                            • Emergency pause mechanisms for critical functions
                          </li>
                          <li>
                            • Multi-signature wallet governance for upgrades
                          </li>
                          <li>• Clear incident response procedures</li>
                          <li>• Community communication protocols</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="bg-red-900/30 border-2 border-red-700 rounded-xl p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <AlertTriangle className="text-red-400" size={24} />
                      <h2 className="text-xl font-bold text-red-300">
                        High-Risk Warning
                      </h2>
                    </div>
                    <div className="space-y-3 text-red-200">
                      <p className="font-medium">
                        ⚠️ Leveraged trading involves significant financial
                        risk. Users can lose more than their initial investment.
                      </p>
                      <ul className="space-y-1 text-sm">
                        <li>
                          • Maximum 50x leverage amplifies both gains and losses
                        </li>
                        <li>
                          • Liquidation can occur rapidly in volatile markets
                        </li>
                        <li>
                          • Smart contract risks may result in total loss of
                          funds
                        </li>
                        <li>
                          • Oracle failures could affect position settlements
                        </li>
                      </ul>
                      <p className="text-xs text-red-300 mt-4">
                        <strong>Disclaimer:</strong> This protocol is
                        experimental. Only trade with funds you can afford to
                        lose.
                      </p>
                    </div>
                  </div>
                </div>
              );

            case "deployment":
              return (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-blue-900/30 rounded-lg">
                      <ExternalLink className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-white">
                        Deployment Guide
                      </h1>
                      <p className="text-gray-400">
                        Step-by-step protocol deployment instructions
                      </p>
                    </div>
                  </div>
                  <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="text-yellow-400" size={16} />
                      <span className="text-yellow-300 font-medium">
                        Prerequisites
                      </span>
                    </div>
                    <ul className="text-yellow-200 text-sm space-y-1">
                      <li>• Node.js v16+ and npm/yarn installed</li>
                      <li>• Hardhat development environment</li>
                      <li>• Access to Ethereum testnet/mainnet RPC</li>
                      <li>• Wallet with sufficient ETH for gas fees</li>
                    </ul>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      1. Environment Setup
                    </h2>
                    <CodeBlock title="Install Dependencies" language="bash">
                      {`# Clone repository
git clone https://github.com/veth-protocol/perpetuals
cd perpetuals
# Install dependencies
npm install
# Install additional packages
npm install @chainlink/contracts
npm install @openzeppelin/contracts`}
                    </CodeBlock>
                    <CodeBlock
                      title="Environment Configuration"
                      language="bash"
                    >
                      {`# Create .env file
cp .env.example .env
# Configure environment variables
PRIVATE_KEY=your_private_key_here
INFURA_PROJECT_ID=your_infura_id
ETHERSCAN_API_KEY=your_etherscan_key
COINMARKETCAP_API_KEY=your_cmc_key`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      2. Contract Compilation
                    </h2>
                    <CodeBlock
                      title="Hardhat Configuration"
                      language="javascript"
                    >
                      {`// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    goerli: {
      url: \`https://goerli.infura.io/v3/\${process.env.INFURA_PROJECT_ID}\`,
      accounts: [process.env.PRIVATE_KEY]
    },
    mainnet: {
      url: \`https://mainnet.infura.io/v3/\${process.env.INFURA_PROJECT_ID}\`,
      accounts: [process.env.PRIVATE_KEY]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  }
};`}
                    </CodeBlock>
                    <CodeBlock title="Compile Contracts" language="bash">
                      {`# Compile all contracts
npx hardhat compile
# Clean and recompile if needed
npx hardhat clean
npx hardhat compile`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      3. Deployment Script
                    </h2>
                    <CodeBlock title="Deploy Script" language="javascript">
                      {`// scripts/deploy.js
const { ethers } = require("hardhat");
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  // 1. Deploy vUSDT token
  const VirtualUSDT = await ethers.getContractFactory("VirtualUSDT");
  const vUSDT = await VirtualUSDT.deploy();
  await vUSDT.deployed();
  console.log("vUSDT deployed to:", vUSDT.address);
  // 2. Deploy PriceOracle (Goerli ETH/USD feed)
  const PriceOracle = await ethers.getContractFactory("PriceOracle");
  const priceOracle = await PriceOracle.deploy(
    "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e" // Goerli ETH/USD
  );
  await priceOracle.deployed();
  console.log("PriceOracle deployed to:", priceOracle.address);
  // 3. Deploy VirtualAMM
  const VirtualAMM = await ethers.getContractFactory("VirtualAMM");
  const virtualAMM = await VirtualAMM.deploy(
    ethers.utils.parseEther("1000"),    // 1000 vETH
    ethers.utils.parseEther("2000000")  // 2M vUSDT (price = $2000)
  );
  await virtualAMM.deployed();
  console.log("VirtualAMM deployed to:", virtualAMM.address);
  // 4. Deploy Vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(vUSDT.address);
  await vault.deployed();
  console.log("Vault deployed to:", vault.address);
  // 5. Deploy PositionNFT
  const PositionNFT = await ethers.getContractFactory("PositionNFT");
  const positionNFT = await PositionNFT.deploy();
  await positionNFT.deployed();
  console.log("PositionNFT deployed to:", positionNFT.address);
  // 6. Deploy PositionManager
  const PositionManager = await ethers.getContractFactory("PositionManager");
  const positionManager = await PositionManager.deploy(
    virtualAMM.address,
    vault.address,
    priceOracle.address,
    positionNFT.address
  );
  await positionManager.deployed();
  console.log("PositionManager deployed to:", positionManager.address);
  // 7. Setup permissions
  await virtualAMM.transferOwnership(positionManager.address);
  await vault.transferOwnership(positionManager.address);
  await positionNFT.transferOwnership(positionManager.address);
  console.log("\\n=== Deployment Complete ===");
  console.log("Network:", await ethers.provider.getNetwork());
  console.log("Deployer:", deployer.address);
  console.log("\\nContract Addresses:");
  console.log("vUSDT:", vUSDT.address);
  console.log("PriceOracle:", priceOracle.address);
  console.log("VirtualAMM:", virtualAMM.address);
  console.log("Vault:", vault.address);
  console.log("PositionNFT:", positionNFT.address);
  console.log("PositionManager:", positionManager.address);
  // Save deployment info
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    contracts: {
      vUSDT: vUSDT.address,
      priceOracle: priceOracle.address,
      virtualAMM: virtualAMM.address,
      vault: vault.address,
      positionNFT: positionNFT.address,
      positionManager: positionManager.address
    }
  };
  require('fs').writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      4. Deploy to Network
                    </h2>
                    <CodeBlock title="Deploy Commands" language="bash">
                      {`# Deploy to Goerli testnet
npx hardhat run scripts/deploy.js --network goerli
# Deploy to mainnet (caution!)
npx hardhat run scripts/deploy.js --network mainnet
# Verify contracts on Etherscan
npx hardhat verify --network goerli <CONTRACT_ADDRESS> <CONSTRUCTOR_ARGS>`}
                    </CodeBlock>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      5. Post-Deployment Configuration
                    </h2>
                    <div className="space-y-4">
                      <div className="bg-gray-800/40 border border-gray-700 rounded-xl p-6">
                        <h3 className="text-lg font-medium text-white mb-3">
                          Initial Setup Script
                        </h3>
                        <CodeBlock
                          title="Post-Deploy Setup"
                          language="javascript"
                        >
                          {`// scripts/setup.js
async function setupProtocol() {
  const deployment = JSON.parse(require('fs').readFileSync('deployment.json'));
  const positionManager = await ethers.getContractAt(
    "PositionManager", 
    deployment.contracts.positionManager
  );
  // Initial configuration
  console.log("Setting up protocol parameters...");
  // Set initial funding rate
  await positionManager.updateFundingRate();
  console.log("✓ Initial funding rate set");
  // Additional setup as needed
  console.log("✓ Protocol setup complete");
}`}
                        </CodeBlock>
                      </div>
                      <div className="bg-blue-900/20 border border-blue-700/30 rounded-xl p-4">
                        <h3 className="font-medium text-blue-300 mb-2">
                          Network-Specific Configurations
                        </h3>
                        <Table
                          headers={[
                            "Network",
                            "Chainlink ETH/USD",
                            "Gas Price",
                            "Block Time",
                          ]}
                          rows={[
                            [
                              "Ethereum Mainnet",
                              "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419",
                              "20-50 gwei",
                              "12-15s",
                            ],
                            [
                              "Goerli Testnet",
                              "0xD4a33860578De61DBAbDc8BFdb98FD742fA7028e",
                              "1-5 gwei",
                              "12-15s",
                            ],
                            [
                              "Polygon",
                              "0xF9680D99D6C9589e2a93a78A04A279e509205945",
                              "30-100 gwei",
                              "2-3s",
                            ],
                            [
                              "Arbitrum",
                              "0x639Fe6ab55C921f74e7fac1ee960C0B6293ba612",
                              "0.1-1 gwei",
                              "1s",
                            ],
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white mb-4">
                      6. Testing Deployment
                    </h2>
                    <CodeBlock title="Deployment Tests" language="javascript">
                      {`// test/deployment.test.js
describe("Deployment Tests", function () {
  let contracts;
  before(async function () {
    // Load deployment
    const deployment = JSON.parse(require('fs').readFileSync('deployment.json'));
    contracts = {
      positionManager: await ethers.getContractAt("PositionManager", deployment.contracts.positionManager),
      virtualAMM: await ethers.getContractAt("VirtualAMM", deployment.contracts.virtualAMM),
      vault: await ethers.getContractAt("Vault", deployment.contracts.vault),
    };
  });
  it("Should have correct contract ownerships", async function () {
    expect(await contracts.virtualAMM.owner()).to.equal(contracts.positionManager.address);
    expect(await contracts.vault.owner()).to.equal(contracts.positionManager.address);
  });
  it("Should have correct initial parameters", async function () {
    expect(await contracts.positionManager.MAX_LEVERAGE()).to.equal(50);
    expect(await contracts.positionManager.TRADING_FEES_BPS()).to.equal(500);
  });
  it("Should allow vUSDT minting", async function () {
    const [user] = await ethers.getSigners();
    await contracts.vUSDT.connect(user).limitedMint();
    const balance = await contracts.vUSDT.balanceOf(user.address);
    expect(balance).to.equal(ethers.utils.parseEther("10000"));
  });
});`}
                    </CodeBlock>
                  </div>
                  <div className="bg-green-900/20 border border-green-700/30 rounded-xl p-6">
                    <h2 className="text-lg font-semibold text-green-300 mb-4">
                      Deployment Checklist
                    </h2>
                    <div className="space-y-2 text-green-200">
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>All contracts compiled without errors</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>Network configuration verified</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>Chainlink price feed addresses confirmed</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>Initial parameters set correctly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>Contract ownership transferred properly</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>Contracts verified on block explorer</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check size={16} className="text-green-400" />
                        <span>Basic functionality tested</span>
                      </div>
                    </div>
                  </div>
                </div>
              );

            default:
              return (
                <div className="flex items-center justify-center h-64">
                  <p className="text-gray-400">
                    Select a section from the sidebar to view documentation.
                  </p>
                </div>
              );
          }
        })()}
      </div>
    );
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-black text-gray-100 flex">
        {/* Sidebar (Always Expanded) */}
        <div className="w-80 bg-black border-r flex-shrink-0">
          <div className="h-full flex flex-col">
            {/* Header */}
            {/* <div className="p-6 border-b border-gray-800">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Code2 className="text-white" size={20} />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  vETH Docs
                </h1>
                <p className="text-xs text-gray-500">v1.0 • Jan 2024</p>
              </div>
            </div>
          </div> */}

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navigationItems.map((item) => renderSidebarItem(item))}
            </nav>

            {/* Footer */}
            {/* <div className="p-4 border-t border-gray-800">
            <a
              href="https://github.com/veth-protocol"
              className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink size={14} /> GitHub
            </a>
          </div> */}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-8">{renderContent()}</div>
        </div>
      </div>
    </DefaultLayout>
  );
};

export default vETHDocumentation;
