import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Hero } from "@/components/ui/animated-hero";

import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import {
  TrendingUp,
  Zap,
  Target,
  Shield,
  BarChart3,
  Wallet,
} from "lucide-react";
import DefaultLayout from "@/layouts/default";
import { WavyBackground } from "@/components/ui/wavy-background";

// Reusable feature card
const Feature = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col p-6 bg-background/70 backdrop-blur-sm rounded-xl border border-gray-800 hover:border-primary/50 transition-all duration-300 group">
    <div className="w-12 h-12 mb-5 text-primary">
      <Icon className="w-full h-full" />
    </div>
    <h3 className="text-xl font-semibold mb-2 text-white">{title}</h3>
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

// Stats counter component (simple version)
const Stat = ({ value, label }: { value: string; label: string }) => (
  <div className="text-center">
    <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
      {value}
    </div>
    <div className="text-gray-500 text-sm md:text-base">{label}</div>
  </div>
);

export default function IndexPage() {
  return (
    <DefaultLayout>
      {/* Hero Section with Wavy Background */}
      <WavyBackground className="max-w-4xl mx-auto pb-20 ">
        <Hero />
      </WavyBackground>

      {/* Main Content */}
      <div className="flex flex-col gap-32 pb-32 px-4">
        {/* Value Proposition */}
        <section className="container mx-auto text-center max-w-4xl">
          <h2 className={title()}>Why Traders Choose Us</h2>
          <p
            className={subtitle({
              class: "mt-6 text-gray-400 max-w-2xl mx-auto",
            })}
          >
            Built for speed, security, and scalability — our next-gen perpetual
            DEX runs on Layer 2 with MEV-resistant order flow and zero custodial
            risk.
          </p>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Feature
              icon={Zap}
              title="Lightning Fast"
              description="Sub-second trade settlement powered by optimistic rollups and off-chain matching engines."
            />
            <Feature
              icon={Shield}
              title="Non-Custodial"
              description="Your private keys, your funds. We never hold your assets — trade with full self-custody."
            />
            <Feature
              icon={TrendingUp}
              title="Up to 50x Leverage"
              description="Maximize your position size across BTC, ETH, and top alts with dynamic risk-adjusted margin."
            />
            <Feature
              icon={BarChart3}
              title="Deep Liquidity"
              description="Aggregated liquidity from AMMs, market makers, and on-chain order books ensures tight spreads."
            />
            <Feature
              icon={Wallet}
              title="Wallet-First UX"
              description="Connect MetaMask, WalletConnect, or Ledger in one click. No signup required."
            />
            <Feature
              icon={Target}
              title="Fair Execution"
              description="Anti-MEV design protects you from front-running and sandwich attacks."
            />
          </div>
        </section>

        {/* Stats Bar */}
        <section className="container mx-auto pt-12 border-t border-gray-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <Stat value="$412M" label="24H Trading Volume" />
            <Stat value="68K+" label="Active Traders" />
            <Stat value="36" label="Perpetual Markets" />
            <Stat value="3" label="Supported Chains" />
          </div>
        </section>

        
       
        {/* CTA Banner */}
        <section className="container mx-auto text-center max-w-3xl">
          <Card className="bg-gradient-to-r from-primary/10 to-purple-900/20 border border-primary/30 backdrop-blur-sm">
            <CardBody className="p-10 flex flex-col items-center text-center">
              <h3 className={title({ size: "sm" })}>Ready to Trade?</h3>
              <p className={subtitle({ class: "mt-4 text-gray-300" })}>
                Join thousands of traders on the fastest-growing decentralized
                perpetual exchange.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8">
                <Link
                  href="/trading"
                  className={buttonStyles({
                    color: "primary",
                    radius: "lg",
                    size: "lg",
                    fullWidth: true,
                    class: "font-semibold",
                  })}
                >
                  Launch App <Zap className="w-5 h-5 ml-2" />
                </Link>
                <Link
                  href="/docs"
                  className={buttonStyles({
                    variant: "bordered",
                    radius: "lg",
                    size: "lg",
                    fullWidth: true,
                    class: "text-white border-gray-600 hover:border-primary",
                  })}
                >
                  Read Docs
                </Link>
              </div>
            </CardBody>
          </Card>
        </section>
      </div>
    </DefaultLayout>
  );
}
