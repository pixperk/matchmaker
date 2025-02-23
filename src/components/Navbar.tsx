"use client"

import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { getAuth, onAuthStateChanged, signOut, type User } from "firebase/auth"
import { firebaseApp } from "@/utils/firebase"
import { Menu, LogOut, UserIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"


export function Navbar() {
  const auth = getAuth(firebaseApp)
  const [user, setUser] = useState<User | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
     
    })

    return () => unsubscribe()
  }, [auth])



  const handleLogout = async () => {
    try {
      await signOut(auth)
      setUser(null)
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-2 shadow-md">
      <div className="container mx-auto flex justify-between items-center space-x-4">
        <Link href="/" className="flex items-center space-x-4">
          <Image
            src="/taku.png"
            alt="OtakuSpot Prom Logo"
            width={64}
            height={64}
            className="rounded-full border-2 border-white"
          />
          <span className="text-xl font-bold">OtakuSpot Prom</span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {user && (
            <Link href="/dashboard" className="hover:text-purple-200 transition duration-200">
              Dashboard
            </Link>
          )}
          {user ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-white hover:bg-white hover:text-purple-600 transition duration-200 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" /> Logout
            </Button>
          ) : (
            <Link href="/" className="hover:text-purple-200 transition duration-200 flex items-center">
              <UserIcon className="w-4 h-4 mr-2" /> Login
            </Link>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-white hover:text-purple-200 transition duration-200"
          >
            <Menu />
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mt-2 p-2 bg-purple-700 rounded-lg shadow-lg"
          >
            {user && (
              <Link href="/dashboard" className="block py-2 px-4 hover:bg-purple-600 rounded transition duration-200">
                Dashboard
              </Link>
            )}
            {user ? (
              <button
                onClick={handleLogout}
                className="flex items-center w-full py-2 px-4 text-white hover:bg-white hover:text-purple-600 rounded transition duration-200"
              >
                <LogOut className="w-4 h-4 mr-2" /> Logout
              </button>
            ) : (
              <Link href="/login" className="block py-2 px-4 hover:bg-purple-600 rounded transition duration-200">
                Login
              </Link>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

