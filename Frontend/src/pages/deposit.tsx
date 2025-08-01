import React, { useEffect, useState } from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Badge } from "@heroui/badge";
import { Chip } from "@heroui/chip";
import { Divider } from "@heroui/divider";
import { Wallet, ArrowUpCircle, ArrowDownCircle, Gift } from "lucide-react";
import { ethers } from "ethers";
import DefaultLayout from "@/layouts/default";

const VUSDT_ADDRESS = "0xYourvUSDTTokenAddress";
const VAULT_ADDRESS = "0xYourVaultContractAddress";

const VUSDT_ABI = [
  "function mint(address to, uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
  "function approve(address spender, uint256 amount) public returns (bool)",
];
const VAULT_ABI = [
  "function deposit(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function balanceOf(address) view returns (uint256)",
];

export default function Deposit() {
  const [walletAddress, setWalletAddress] = useState("");
  const [vUSDTBalance, setVUSDTBalance] = useState("0");
  const [vaultBalance, setVaultBalance] = useState("0");
  const [ethBalance, setEthBalance] = useState("0");
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const getProvider = () => new ethers.BrowserProvider(window.ethereum);

  const loadBalances = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const address = await signer.getAddress();
    setWalletAddress(address);

    const vusdt = new ethers.Contract(VUSDT_ADDRESS, VUSDT_ABI, provider);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, provider);

    const vusdtBal = await vusdt.balanceOf(address);
    const vaultBal = await vault.balanceOf(address);
    const ethBal = await provider.getBalance(address);

    setVUSDTBalance(ethers.formatUnits(vusdtBal, 18));
    setVaultBalance(ethers.formatUnits(vaultBal, 18));
    setEthBalance(ethers.formatEther(ethBal));
  };

  useEffect(() => {
    if (window.ethereum) {
      loadBalances();
    }
  }, []);

  const handleAirdrop = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const vusdt = new ethers.Contract(VUSDT_ADDRESS, VUSDT_ABI, signer);
    await vusdt.mint(walletAddress, ethers.parseUnits("1000", 18));
    loadBalances();
  };

  const handleDeposit = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const vusdt = new ethers.Contract(VUSDT_ADDRESS, VUSDT_ABI, signer);
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

    const amt = ethers.parseUnits(depositAmount, 18);
    await vusdt.approve(VAULT_ADDRESS, amt);
    await vault.deposit(amt);
    loadBalances();
  };

  const handleWithdraw = async () => {
    const provider = getProvider();
    const signer = await provider.getSigner();
    const vault = new ethers.Contract(VAULT_ADDRESS, VAULT_ABI, signer);

    const amt = ethers.parseUnits(withdrawAmount, 18);
    await vault.withdraw(amt);
    loadBalances();
  };

  return (
    <DefaultLayout>
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">
            Manage <span className="text-violet-600">Vault</span> Funds
          </h1>
          <p className="text-foreground-500">Securely deposit, withdraw, and track your vUSDT</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Wallet Overview */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Wallet className="text-primary" size={18} />
                <h3 className="text-lg font-semibold">Wallet Overview</h3>
              </div>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-500">ETH Balance</span>
                  <Chip color="primary" variant="flat" size="sm">
                    {parseFloat(ethBalance).toFixed(4)} ETH
                  </Chip>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-500">vUSDT Balance</span>
                  <Chip color="secondary" variant="flat" size="sm">
                    {parseFloat(vUSDTBalance).toFixed(2)} vUSDT
                  </Chip>
                </div>
              </div>
              <Divider />
              <div className="bg-default-100 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-foreground-500">Vault Balance</span>
                  <span className="font-semibold text-lg text-success">
                    {parseFloat(vaultBalance).toFixed(2)} vUSDT
                  </span>
                </div>
              </div>
              <Button
                color="success"
                size="lg"
                onPress={handleAirdrop}
                startContent={<Gift size={18} />}
                className="w-full"
              >
                Airdrop 1000 vUSDT
              </Button>
            </CardBody>
          </Card>

          {/* Vault Operations */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <h3 className="text-xl font-semibold">Vault Operations</h3>
            </CardHeader>
            <CardBody className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Deposit Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ArrowUpCircle className="text-success" size={18} />
                    <h4 className="font-medium">Deposit to Vault</h4>
                  </div>
                  <Input
                    type="number"
                    label="Amount (vUSDT)"
                    placeholder="Enter deposit amount"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    size="lg"
                  />
                  <Button
                    color="success"
                    size="lg"
                    onPress={handleDeposit}
                    startContent={<ArrowUpCircle size={18} />}
                    className="w-full"
                    isDisabled={!depositAmount || parseFloat(depositAmount) <= 0}
                  >
                    Deposit
                  </Button>
                </div>

                {/* Withdraw Section */}
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <ArrowDownCircle className="text-danger" size={18} />
                    <h4 className="font-medium">Withdraw from Vault</h4>
                  </div>
                  <Input
                    type="number"
                    label="Amount (vUSDT)"
                    placeholder="Enter withdraw amount"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    size="lg"
                  />
                  <Button
                    color="danger"
                    variant="bordered"
                    size="lg"
                    onPress={handleWithdraw}
                    startContent={<ArrowDownCircle size={18} />}
                    className="w-full"
                    isDisabled={!withdrawAmount || parseFloat(withdrawAmount) <= 0}
                  >
                    Withdraw
                  </Button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-default-100 p-4 rounded-lg">
                <h5 className="font-medium mb-3">Quick Actions</h5>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setDepositAmount((parseFloat(vUSDTBalance) * 0.25).toString())}
                  >
                    25%
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setDepositAmount((parseFloat(vUSDTBalance) * 0.5).toString())}
                  >
                    50%
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setDepositAmount((parseFloat(vUSDTBalance) * 0.75).toString())}
                  >
                    75%
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    onPress={() => setDepositAmount(vUSDTBalance)}
                  >
                    Max
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Security Notice */}
        <Card className="bg-warning-50 dark:bg-warning-950/20 border-warning-200 dark:border-warning-800">
          <CardBody className="py-3">
            <div className="flex items-center justify-center space-x-2 text-warning-700 dark:text-warning-300">
              <Wallet size={16} />
              <span className="text-sm">
                Always verify contract addresses and transaction details before confirming.
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
    </DefaultLayout>
  );
}