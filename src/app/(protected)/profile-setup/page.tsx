"use client"

import { toast } from "@/hooks/use-toast";
import { firebaseApp } from "@/utils/firebase";
import { findUserByUid, login } from "@/utils/userFunctions";
import type { Gender } from "@prisma/client";
import { getAuth } from "firebase/auth";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProfileSetup() {
  // Check the current date against the cutoff date.
  const now = new Date();
  // Note: Months are zero-indexed in JavaScript (0 = January, 1 = February, etc.).
  // Here, February 25, 2025 marks the first day when registrations have ended.
  const cutoffDate = new Date(2025, 1, 24);

  if (now >= cutoffDate) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Registrations Ended</h1>
          <p className="text-gray-700">
            Registrations for matchmaking have ended.
          </p>
        </div>
      </div>
    );
  }

  const [email, setEmail] = useState("");
  const [gender, setGender] = useState<Gender | null>(null);
  const [hasCrush, setHasCrush] = useState<boolean | null>(null);
  const [crushName, setCrushName] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const auth = getAuth(firebaseApp);
  const name = auth.currentUser!.displayName!;
  const uid = auth.currentUser!.uid!;

  useEffect(() => {
    console.log(name);
    async function checkIfUserExists() {
      if (await findUserByUid(uid)) router.push("/questionnaire");
    }
    checkIfUserExists();
  }, [auth, router, uid, name]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!gender) {
      setError("Please select your gender");
      return;
    }
    if (!email.endsWith("learner.manipal.edu")) {
      toast({
        title: "Invalid Email",
        description: "Please use your Manipal University learner email.",
        variant: "destructive",
      });
      return;
    }
    if (hasCrush && !crushName.trim()) {
      setError("Please enter your crush's name");
      return;
    }

    try {
      await login(name, gender, email, crushName, uid);
      router.push("/questionnaire");
    } catch (error) {
      console.log(error);
      toast({
        title: "Profile Creation Failed",
        description: "User already exists",
        variant: "destructive",
      });
    }
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
            <h1 className="text-3xl font-bold text-center">Complete Your Profile</h1>
            <p className="text-center mt-2 text-purple-200">Find your perfect prom date!</p>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Your Learner Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                placeholder="yourname@learner.manipal.edu"
              />
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="male"
                    checked={gender === "male"}
                    onChange={() => setGender("male")}
                    className="form-radio h-5 w-5 text-purple-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">Male</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="female"
                    checked={gender === "female"}
                    onChange={() => setGender("female")}
                    className="form-radio h-5 w-5 text-purple-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">Female</span>
                </label>
              </div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Do you have a crush?</label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="yes"
                    checked={hasCrush === true}
                    onChange={() => setHasCrush(true)}
                    className="form-radio h-5 w-5 text-purple-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">Yes</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="no"
                    checked={hasCrush === false}
                    onChange={() => {
                      setHasCrush(false);
                      setCrushName("");
                    }}
                    className="form-radio h-5 w-5 text-purple-600 transition duration-150 ease-in-out"
                  />
                  <span className="ml-2 text-gray-700">No</span>
                </label>
              </div>
            </motion.div>
            {hasCrush && (
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                <label htmlFor="crushName" className="block text-sm font-medium text-gray-700 mb-1">
                  Crush&apos;s Name
                </label>
                <input
                  type="text"
                  id="crushName"
                  value={crushName}
                  onChange={(e) => setCrushName(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                  placeholder="Enter your crush's name"
                />
              </motion.div>
            )}
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-sm">
                {error}
              </motion.p>
            )}
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transition duration-200"
            >
              Continue
            </motion.button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
