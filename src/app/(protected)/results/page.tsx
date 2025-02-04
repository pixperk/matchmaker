"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { findBestMatch, findUserByUid } from "@/utils/userFunctions"
import { getAuth } from "firebase/auth"
import { firebaseApp } from "@/utils/firebase"
import confetti from "canvas-confetti"

export default function Results() {
  const [matchStatus, setMatchStatus] = useState<"loading" | "matched" | "waiting" | "error">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const auth = getAuth(firebaseApp)
  const uid = auth.currentUser!.uid!

  useEffect(() => {
    const today = new Date()
    const matchDay = new Date(2025, 1, 26)

    if (today < matchDay) {
      setMatchStatus("waiting")
      return
    }

    const findMatch = async () => {
      try {
        const user = await findUserByUid(uid)
        if (!user || !user.id) {
          throw new Error("User ID not found")
        }

        const match = await findBestMatch(user.id)
        if (match) {
          setMatchStatus("matched")
          // Trigger confetti animation
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
          })
        } else {
          setMatchStatus("error")
          setErrorMessage("No suitable match found. Please try again later.")
        }
      } catch (error) {
        setMatchStatus("error")
        setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred")
      }
    }

    findMatch()
  }, [uid])

  const getContent = () => {
    switch (matchStatus) {
      case "loading":
        return {
          title: "Processing",
          description: "We're working on finding your perfect prom match!",
          buttonText: "Please Wait",
        }
      case "matched":
        return {
          title: "It's a Match!",
          description: "Great news! We've found a perfect match for you. Check your dashboard for more details!",
          buttonText: "View Your Match",
        }
      case "waiting":
        return {
          title: "Coming Soon",
          description: "Your match will be revealed on February 27, 2025. Get ready for an exciting prom season!",
          buttonText: "Go to Dashboard",
        }
      case "error":
        return {
          title: "Oops!",
          description: errorMessage || "Something went wrong. Please try again later.",
          buttonText: "Go to Dashboard",
        }
    }
  }

  const content = getContent()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-purple-600 p-8 text-white relative overflow-hidden">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 260, damping: 20 }}
              className="absolute -top-10 -right-10 w-40 h-40 bg-pink-400 rounded-full opacity-50"
            />
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 260, damping: 20 }}
              className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-400 rounded-full opacity-50"
            />
            <h1 className="text-4xl font-bold text-center relative z-10">{content.title}</h1>
            <p className="text-center mt-2 text-purple-200 relative z-10">{content.description}</p>
          </div>
          <div className="p-8 text-center">
            {matchStatus === "loading" && (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"
              />
            )}
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="mt-6">
              <Link
                href="/dashboard"
                className="inline-block py-3 px-8 rounded-full shadow-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-200"
              >
                {content.buttonText}
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

