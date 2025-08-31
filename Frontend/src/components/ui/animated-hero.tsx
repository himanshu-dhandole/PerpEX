import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Book, BookA, BookCheck, BookCopy, MoveRight, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["perpetuals", "decentralized", "trustless", "secure", "permissionless", "transparent"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Link to="/about">
              <Button variant="secondary" size="sm" className="gap-4">
                Read our launch article <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-8xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">Trade vETH with</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={index}
                    className="absolute font-semibold"
                    initial={{ opacity: 0, y: "-100" }}
                    transition={{ type: "spring", stiffness: 50 }}
                    animate={
                      titleNumber === index
                        ? {
                            y: 0,
                            opacity: 1,
                          }
                        : {
                            y: titleNumber > index ? -150 : 150,
                            opacity: 0,
                          }
                    }
                  >
                    {title}
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight max-w-2xl text-center">
              PerpEX is a decentralized perpetual exchange for ETH trading.
              Open long and short positions with leverage, powered by a vault
              and vAMM. Fully transparent, trustless, and accessible directly
              from your wallet.
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Link to="/docs">
              <Button size="lg" className="gap-4" variant="outline">
                Explore the Docs <BookCopy className="w-4 h-4" />
              </Button>
            </Link>
            <Link to="/trading">
              <Button size="lg" className="gap-4">
                Start Trading <MoveRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };