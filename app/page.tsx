"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <>
      {/* Your page content here */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="space-x-4 pt-2"
      >
        <Link href="/quiz">
          <Button
            size="md"
            className="bg-gray-600 hover:bg-gray-700 text-base px-6 py-2 rounded-xl shadow-lg shadow-gray-900/20 transition-transform hover:scale-105"
          >
            Start Quiz
          </Button>
        </Link>
        <Link href="/about">
          <Button
            variant="outline"
            size="md"
            className="border-white/70 text-gray-300 hover:bg-white/10 text-base px-6 py-2 rounded-xl"
          >
            Learn More
          </Button>
        </Link>
      </motion.div>
    </>
  )
}
