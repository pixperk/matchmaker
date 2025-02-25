"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { firebaseApp } from "@/utils/firebase"
import { findUserByUid, type IUser } from "@/utils/userFunctions"
import { getAuth } from "firebase/auth"
import { motion, AnimatePresence } from "framer-motion"
import { FileQuestion, Heart, Sparkles, User, Mail, Calendar } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"

export default function Dashboard() {
  const [userData, setUserData] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const auth = getAuth(firebaseApp)

  useEffect(() => {
    const uid = auth.currentUser!.uid!
    if (!uid) {
      router.push("/profile-setup")
    } else {
      const fetchUserData = async () => {
        try {
          const user = await findUserByUid(uid)
          setUserData(user)
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setLoading(false)
        }
      }
      fetchUserData()
    }
  }, [auth, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-2xl font-bold flex items-center"
        >
          <svg
            className="animate-spin -ml-1 mr-3 h-8 w-8 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Loading...
        </motion.div>
      </div>
    )
  }

  const checkMissingInfo = (userData: IUser | null): string[] => {
    if (!userData) return []
    const requiredFields = ["name", "email", "gender"]
    return requiredFields.filter((field) => !userData[field as keyof IUser])
  }

  const missingInfo = checkMissingInfo(userData)

  const profileCompletionPercentage = calculateProfileCompletion(userData)

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-400 to-purple-600 p-4 sm:p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto"
      >
        <Card className="bg-white rounded-lg shadow-xl overflow-hidden">
          <CardHeader className="bg-purple-600 p-8 text-white relative overflow-hidden">
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
            <CardTitle className="text-4xl font-bold text-center relative z-10">
              Otakuspot PopCon Prom Dashboard
            </CardTitle>
            <p className="text-center mt-2 text-purple-200 relative z-10">Welcome, {userData?.name}!</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <AnimatePresence>
                <motion.div
                  key="user-info"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
                        <User className="mr-2" /> User Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <p className="flex items-center">
                          <User className="mr-2 h-4 w-4 text-purple-500" />
                          <strong>Name:</strong> {userData?.name || "Not provided"}
                        </p>
                        <p className="flex items-center">
                          <Mail className="mr-2 h-4 w-4 text-purple-500" />
                          <strong>Email:</strong> {userData?.email || "Not provided"}
                        </p>
                        <p className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-purple-500" />
                          <strong>Gender:</strong>{" "}
                          {userData?.gender
                            ? (userData.gender as string).charAt(0).toUpperCase() + (userData.gender as string).slice(1)
                            : "Not provided"}
                        </p>
                      </div>
                      {missingInfo.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          className="mt-4 p-3 bg-yellow-100 text-yellow-700 rounded-md"
                        >
                          <p className="font-semibold">Please complete your profile:</p>
                          <ul className="list-disc list-inside">
                            {missingInfo.map((field) => (
                              <li key={field}>{field.charAt(0).toUpperCase() + field.slice(1)}</li>
                            ))}
                          </ul>
                          <Button asChild className="mt-2">
                            <Link href="/profile-setup">Complete Profile</Link>
                          </Button>
                        </motion.div>
                      )}
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Profile Completion</p>
                        <Progress value={profileCompletionPercentage} className="w-full" />
                        <p className="text-sm text-gray-600 mt-2">{profileCompletionPercentage}% Complete</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div
                  key="questionnaire-status"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <Card className="h-full">
                    <CardHeader>
                      <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
                        <FileQuestion className="mr-2" /> Questionnaire Status
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {userData?.questionsAnswered ? (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <p className="text-green-600 mb-4 flex items-center">
                            <Sparkles className="mr-2" /> You have completed the questionnaire!
                          </p>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                        >
                          <p className="text-yellow-600 mb-4 flex items-center">
                            <FileQuestion className="mr-2" /> You haven&apos;t answered the questionnaire yet.
                          </p>
                          <Button asChild>
                            <Link href="/questionnaire">Go to Questionnaire</Link>
                          </Button>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-purple-600 flex items-center">
                    <Heart className="mr-2" /> Match Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userData?.matched ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-green-600 mb-4 flex items-center">
                        <Sparkles className="mr-2" /> Congratulations! Your match details will be announced soon.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5 }}
                    >
                      <p className="text-yellow-600 mb-4 flex items-center">
                        <Heart className="mr-2" /> You don&apos;t have a match yet.
                      </p>
                      <Button asChild>
                        <Link href="/results">Find Your Match</Link>
                      </Button>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 text-center"
            >
              <p className="text-purple-800 flex items-center justify-center text-lg font-semibold">
                <Sparkles className="mr-2" /> Get ready for an unforgettable Otakuspot PopCon Prom experience!
              </p>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

function calculateProfileCompletion(userData: IUser | null): number {
  if (!userData) return 0

  const fields = ["name", "email", "gender", "questionsAnswered"]
  const completedFields = fields.filter((field) => userData[field as keyof IUser])
  return Math.round((completedFields.length / fields.length) * 100)
}

