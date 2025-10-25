// frontend/src/components/header/Logo.jsx
import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ICON_MAP } from "@/lib/data";

export const Logo = () => (
  <Link href="/?sort=latest-added">
    <motion.div
      className="relative group cursor-pointer"
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      <div className="absolute -inset-1 bg-gradient-to-r rounded-xl blur-lg opacity-0 group-hover:opacity-75 transition duration-500" />
      <div className="relative rounded-xl p-2 flex items-center gap-2 border border-slate-700/50 transition-all duration-300 overflow-hidden">
        <motion.div
          className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-purple-500 rounded-tl-xl opacity-60 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.2, x: -4, y: -4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-pink-500 rounded-br-xl opacity-60 group-hover:opacity-100 transition-opacity"
          whileHover={{ scale: 1.2, x: 4, y: 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        />
        <motion.div className="relative z-10">
          <ICON_MAP.MonitorPause className="w-5 h-5 text-white" />
        </motion.div>
        <motion.span className="relative z-10 text-xl font-bold text-white">
          Bermone
        </motion.span>
      </div>
    </motion.div>
  </Link>
);
