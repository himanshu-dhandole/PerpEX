import { Route, Routes } from "react-router-dom";
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "./config/wagmiConfig.ts";


// Pages
import IndexPage from "@/pages/index";
import DocsPage from "@/pages/docs";
import PricingPage from "@/pages/pricing";
import Deposit from "@/pages/deposit";
import AboutPage from "@/pages/about";
import TradingPlatform from "@/pages/trading";

// Query client instance
const queryClient = new QueryClient();

function App() {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <Routes>
                    <Route element={<IndexPage/>} path="/"/>
                    <Route element={<DocsPage/>} path="/docs"/>
                    <Route element={<PricingPage/>} path="/pricing"/>
                    <Route element={<Deposit/>} path="/deposit"/>
                    <Route element={<AboutPage/>} path="/about"/>
                    <Route element={<TradingPlatform/>} path="/trading"/>
                </Routes>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default App;