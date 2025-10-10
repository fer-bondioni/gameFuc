"use client";

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <motion.header 
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center py-8 mb-8"
    >
      <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-4 leading-tight">
        <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 bg-clip-text text-transparent drop-shadow-2xl">
          ¿Quién sos en la FUC?
        </span>
      </h1>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="h-2 w-64 mx-auto bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full"
      />
    </motion.header>
  );
}
