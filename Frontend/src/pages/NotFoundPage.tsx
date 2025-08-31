import DefaultLayout from "@/layouts/default";
import React from "react";
import { Button } from "@heroui/button";
import { motion } from "framer-motion";
import { ArrowLeftRight } from "lucide-react";

const NotFoundPage: React.FC = () => (
  <DefaultLayout>
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="text-center space-y-6 max-w-md">
        {/* GIF */}
        <motion.img
          src="https://media.giphy.com/media/QBd2kLB5qDmysEXre9/giphy.gif"
          alt="Not Found"
          className="w-64 mx-auto rounded-lg shadow-lg border border-gray-800"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        />

        {/* Error Code */}
        <motion.h1
          className="text-5xl font-bold text-white tracking-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          404
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-gray-400 text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          Page not found — maybe it got liquidated 🥲
        </motion.p>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            as="a"
            href="/"
            size="lg"
            color="primary"
            className="px-5 py-2 text-base font-medium flex items-center space-x-2"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>Back to Trading</span>
          </Button>
        </motion.div>
      </div>
    </div>
  </DefaultLayout>
);

export default NotFoundPage;
