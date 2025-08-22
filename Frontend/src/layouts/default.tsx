// import { Link } from "@heroui/link";

// import { Navbar } from "@/components/navbar";

// export default function DefaultLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="relative flex flex-col h-screen">
//       <Navbar />
//       <main className="container mx-auto max-w-7xl px-6 flex-grow">
//         {children}
//       </main>
//       <footer className="w-full flex items-center justify-center py-3">
//         <Link
//           isExternal
//           className="flex items-center gap-1 text-current"
//           href="https://heroui.com"
//           title="heroui.com homepage"
//         >
//           <span className="text-default-600">Powered by</span>
//           <p className="text-primary">HeroUI</p>
//         </Link>
//       </footer>
//     </div>
//   );
// }
import { Link } from "@heroui/link";

import { Navbar } from "@/components/navbar";
import { Card, CardBody } from "@heroui/card";
import { Code, ExternalLink, Github, Twitter } from "lucide-react";
import { DiscordIcon } from "@/components/icons";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex flex-col h-screen">
      <Navbar />
      <main className="w-full flex-grow">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-t border-gray-200 dark:border-gray-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-500 dark:to-purple-600 rounded-lg flex items-center justify-center mr-3">
                <Code size={20} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                PerpEX
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm leading-relaxed max-w-md">
              A decentralized perpetual trading platform built with modern blockchain technology. 
              Secure, transparent, and community-driven.
            </p>
            <div className="flex items-center space-x-4">
              <Link 
                isExternal 
                href="https://github.com" 
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Github size={20} />
              </Link>
              <Link 
                isExternal 
                href="https://twitter.com" 
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <Twitter size={20} />
              </Link>
              <Link 
                isExternal 
                href="https://discord.com" 
                className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <DiscordIcon size={20} />
              </Link>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Product</h4>
            <div className="space-y-2">
              <Link isExternal href="/trading" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                Trading Dashboard
              </Link>
              <Link isExternal href="/docs" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                Documentation
              </Link>
              <Link isExternal href="/contracts" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                Smart Contracts
              </Link>
              <Link isExternal href="/audit" className="block text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                Security Audit
              </Link>
            </div>
          </div>

          {/* Developer */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-sm uppercase tracking-wider">Developer</h4>
            <div className="space-y-2">
              <Link isExternal href="https://github.com" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                <Github size={16} className="mr-2" />
                GitHub Repository
              </Link>
              <Link isExternal href="/api" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                <Code size={16} className="mr-2" />
                API Documentation
              </Link>
              <Link isExternal href="/foundry" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                <Code size={16} className="mr-2" />
                Foundry Tests
              </Link>
              <Link isExternal href="/verify" className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
                <ExternalLink size={16} className="mr-2" />
                Contract Verification
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-500 dark:text-gray-400 text-sm">
            © 2025 PerpEX. All rights reserved.
          </div>
          
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <Link isExternal href="/terms" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
              Terms of Service
            </Link>
            <Link isExternal href="/privacy" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
              Privacy Policy
            </Link>
            <Link isExternal href="/disclaimer" className="text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-sm transition-colors">
              Risk Disclaimer
            </Link>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-8">
          <Card className="border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
            <CardBody className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    PerpEX is a decentralized protocol. Always do your own research before trading.
                  </span>
                </div>
                <Link 
                  isExternal 
                  href="/learn" 
                  // className={buttonStyles({ 
                  //   color: "primary", 
                  //   variant: "light", 
                  //   size: "sm",
                  //   radius: "full"
                  // })}
                >
                  Learn More
                </Link>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    </footer>
    </div>
  );
}
