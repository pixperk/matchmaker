"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { signInWithPopup, onAuthStateChanged, getAuth, GoogleAuthProvider } from "firebase/auth"
import { firebaseApp } from "@/utils/firebase"

export default function Results() {
  const [authStatus, setAuthStatus] = useState<"loading" | "unauthenticated" | "authenticated">("loading")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const router = useRouter()

  const auth = getAuth(firebaseApp)
  const provider = new GoogleAuthProvider()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setAuthStatus("authenticated")
        router.push("/profile-setup")
      } else {
        setAuthStatus("unauthenticated")
      }
    })

    return () => unsubscribe()
  }, [router, auth]) // Added 'auth' to the dependency array

  const handleGoogleSignIn = async () => {
    try {
      setAuthStatus("loading")
      await signInWithPopup(auth, provider)
      // The redirect will be handled by the onAuthStateChanged listener
    } catch (error) {
      setAuthStatus("unauthenticated")
      setErrorMessage((error as Error).message||"Google sign-in failed. Please try again.")
    }
  }

  if (authStatus === "authenticated") {
    return null // Don't render anything if authenticated
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-lg shadow-xl overflow-hidden">
          <div className="bg-purple-600 p-8 text-white">
            <h1 className="text-3xl font-bold text-center">Welcome!</h1>
            <p className="text-center mt-2 text-purple-200">
              {authStatus === "loading" ? "Checking authentication..." : "Sign in to continue"}
            </p>
          </div>
          <div className="p-8 text-center">
            {authStatus === "loading" && (
              <div className="flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}
            {authStatus === "unauthenticated" && (
              <>
                {errorMessage && <p className="mb-4 text-red-600">{errorMessage}</p>}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleGoogleSignIn}
                  className="w-full py-3 px-6 rounded-md shadow-sm text-sm font-medium text-white bg-red-500 hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400 transition duration-200"
                >
                  Sign in with Google
                </motion.button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

