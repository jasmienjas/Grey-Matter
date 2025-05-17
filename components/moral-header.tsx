"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Brain, X } from "lucide-react"
import { motion } from "framer-motion"

export function MoralHeader() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm dark:bg-gray-900/90 dark:border-gray-800"
          : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 md:h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <div className="relative flex items-center">
            <div className="absolute -inset-1 rounded-full bg-gray-500/20 blur-sm"></div>
            <div className="relative bg-gradient-to-br from-gray-600 to-gray-700 rounded-full p-1.5">
              <Brain className="h-6 w-6 text-white" />
            </div>
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-500">
            GreyMatter
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {mounted && (
            <>
              <NavLink href="/" label="Home" />
              <NavLink href="/quiz" label="Quiz" />
              <NavLink href="/about" label="About" />
            </>
          )}
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/quiz" className="hidden md:block">
            <Button className="bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-full px-6">
              Take the Quiz
            </Button>
          </Link>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="md:hidden border border-gray-200 bg-white/50 backdrop-blur-sm hover:bg-white/80 transition-all"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="border-l border-gray-100 bg-white/95 backdrop-blur-md w-full max-w-xs"
            >
              <div className="flex items-center justify-between mb-8">
                <Link href="/" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
                  <div className="bg-gradient-to-br from-gray-500 to-gray-600 rounded-full p-1.5">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-600 to-gray-500">
                    GreyMatter
                  </span>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full hover:bg-gray-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="flex flex-col gap-6 mt-8">
                <MobileNavLink href="/" label="Home" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/quiz" label="Quiz" onClick={() => setIsOpen(false)} />
                <MobileNavLink href="/about" label="About" onClick={() => setIsOpen(false)} />

                <div className="pt-4 mt-4 border-t border-gray-100">
                  <Link href="/quiz" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-gray-600 to-gray-500 hover:from-gray-700 hover:to-gray-600 text-white rounded-full">
                      Take the Quiz
                    </Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

function NavLink({ href, label }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link
      href={href}
      className="relative text-base font-medium transition-colors"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={`transition-colors duration-300 ${isHovered ? "text-gray-600" : "text-gray-700 dark:text-gray-200"}`}
      >
        {label}
      </span>
      {isHovered && (
        <motion.div
          layoutId="navUnderline"
          className="absolute left-0 right-0 h-0.5 bg-gray-500 bottom-[-6px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />
      )}
    </Link>
  )
}

function MobileNavLink({ href, label, onClick }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="text-xl font-medium text-gray-800 transition-colors hover:text-gray-600 flex items-center"
    >
      {label}
    </Link>
  )
}
