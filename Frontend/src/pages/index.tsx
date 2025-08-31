import { Link } from "@heroui/link";
import { Snippet } from "@heroui/snippet";
import { Code } from "@heroui/code";
import { button as buttonStyles } from "@heroui/theme";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";


import { siteConfig } from "@/config/site";
import { title, subtitle } from "@/components/primitives";
import {
  TrendingUp,
  Zap,
  Target,
  Shield,
  BarChart3,
  Wallet,
  LockKeyhole,
  LineChart,
  Coins,
  ArrowRight,
} from "lucide-react";
import DefaultLayout from "@/layouts/default";
import { WavyBackground } from "@/components/ui/wavy-background";
import { Hero } from "@/components/ui/animated-hero";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { cn } from "@/lib/utils";
import { AuroraBackground } from "@/components/ui/aurora-background";

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


interface GridItemProps {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: React.ReactNode;
}

const GridItem = ({ area, icon, title, description }: GridItemProps) => {
  return (
    <li className={cn("min-h-[14rem] list-none", area)}>
      <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-border p-2 md:rounded-[1.5rem] md:p-3">
        <GlowingEffect
          spread={40}
          glow={true}
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl border-[0.75px] bg-background p-6 shadow-sm dark:shadow-[0px_0px_27px_0px_rgba(45,45,45,0.3)] md:p-6">
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div className="w-fit rounded-lg border-[0.75px] border-border bg-muted p-2 dark:bg-slate-800 dark:border-slate-700">
              {icon}
            </div>
            <div className="space-y-3">
              <h3 className="pt-0.5 text-xl leading-[1.375rem] font-semibold font-sans tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-foreground">
                {title}
              </h3>
              <p className="font-sans text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem] text-muted-foreground dark:text-slate-300">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
};


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

      
      {/* === STATS SECTION === */}
      <div className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <Stat value="50x" label="Max Leverage" />
          <Stat value="$2.4B+" label="Total Volume" />
          <Stat value="0.05%" label="Taker Fee" />
          <Stat value="24/7" label="Global Markets" />
        </div>
      </div>

      {/* === FEATURES GRID === */}
      <ul className="container mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-6 md:grid-cols-12 md:grid-rows-3 lg:gap-8 xl:max-h-[36rem] xl:grid-rows-2">
        <GridItem
          area="md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]"
          icon={<Zap className="h-4 w-4 text-primary" />}
          title="Lightning-Fast Execution"
          description="Sub-200ms order matching powered by Layer 3 rollups and JIT liquidity."
        />
        <GridItem
          area="md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]"
          icon={<Shield className="h-4 w-4 text-primary" />}
          title="Decentralized Insurance Pool"
          description="Backstop fund protects traders during black swan events and undercollateralization."
        />
        <GridItem
          area="md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]"
          icon={<LockKeyhole className="h-4 w-4 text-primary" />}
          title="Non-Custodial & Audited"
          description="Open-source contracts, audited by Spearbit and PeckShield. Your keys, your coins."
        />
        <GridItem
          area="md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]"
          icon={<LineChart className="h-4 w-4 text-primary" />}
          title="Real-Time PnL Tracking"
          description="In-wallet analytics show live profit/loss, funding costs, and liquidation price."
        />
        <GridItem
          area="md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]"
          icon={<Coins className="h-4 w-4 text-primary" />}
          title="Cross-Margin Efficiency"
          description="One wallet, multiple positions. Maximize capital efficiency with shared margin."
        />
      </ul>

      {/* === CTA SECTION === */}
      <div className="container mx-auto px-4 py-24 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-6">
            Ready to Trade the Future?
          </h2>
          <p className="text-lg text-slate-300 mb-8">
            Join 85,000+ traders on the fastest-growing perpetual DEX.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-primary/80 text-white gap-2 px-8"
            >
              Start Trading <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              size="lg"
              className="text-white border-white/30 hover:bg-white/10"
            >
              View Docs
            </Button>
          </div>
        </motion.div>
      </div>
      </div>
    </DefaultLayout>
  );
}