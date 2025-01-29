"use client"

import { toast } from "@/hooks/use-toast"
import { firebaseApp } from "@/utils/firebase"
import { findUserByUid, ifUserAnsweredQuestions, marksQuestionsAnswered, saveAnswer } from "@/utils/userFunctions"
import { getAuth } from "firebase/auth"
import { AnimatePresence, motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

export default function Questionnaire() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const auth = getAuth(firebaseApp)
  const uid = auth.currentUser!.uid!

  useEffect(() => {
    const checkRedirection = async () => {
      setIsLoading(true)
      try {
        const user = await findUserByUid(uid)
        if(!user || !user.id) router.push("/results")
        const redirect = await ifUserAnsweredQuestions(user!.id!)
        if (redirect) {
          router.push("/results")
        }
      } catch (error) {
        console.error("Error in redirection check:", error)
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load your questionnaire status. Please try again.",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (auth) checkRedirection()
  }, [auth, router, uid])

  const handleAnswer = async (answer: string) => {
    try {
      const newAnswers = [...answers, answer]
      setAnswers(newAnswers)

      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1)
      } else {
        setIsSubmitting(true)
        const contextUser = await findUserByUid(uid)

        for (const [index, answer] of newAnswers.entries()) {
          await saveAnswer(contextUser!.id!, index + 1, answer)
        }
        await marksQuestionsAnswered(contextUser!.id!)
        toast({
          variant: "default",
          title: "Your answers reached us",
          description: "Be patient! and wait for your match",
        })
        router.push("/results")
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: (error as Error).message || "Backend is down",
        description: "Please try again later",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-white text-2xl font-bold flex items-center"
        >
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          Loading Questionnaire...
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-400 to-purple-600 p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
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
            <h1 className="text-3xl font-bold text-center relative z-10">Prom Matchmaking Questionnaire</h1>
            <p className="text-center mt-2 text-purple-200 relative z-10">Help us find your perfect match!</p>
          </div>
          <div className="p-8">
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="bg-purple-600 h-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-sm text-gray-600 mt-2 text-center">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-semibold mb-4">{questions[currentQuestion].question}</h2>
                <div className="space-y-4">
                  {questions[currentQuestion].options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full text-left p-4 rounded-lg bg-purple-100 hover:bg-purple-200 transition duration-200 shadow-md"
                      onClick={() => handleAnswer(option)}
                      disabled={isSubmitting}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </AnimatePresence>
            {isSubmitting && (
              <div className="mt-6 flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const questions = [
  {
    question: "What's your idea of a perfect day off?",
    options: [
      "A relaxing day at home",
      "Outdoor adventures",
      "Exploring a new city",
      "Hanging out with friends or family",
    ],
  },
  {
    question: "What's a dealbreaker for you in a relationship?",
    options: [
      "Dishonesty",
      "Lack of communication",
      "Jealousy or possessiveness",
      "Disrespect for personal boundaries",
    ],
  },
  {
    question: "If you could live anywhere in the world for a year, where would it be?",
    options: [
      "A beach paradise",
      "A bustling city like New York or Tokyo",
      "A quiet countryside",
      "A cozy cabin in the mountains",
    ],
  },
  {
    question: "How do you feel about long-distance relationships?",
    options: [
      "It’s a dealbreaker for me",
      "I’m open to it, but it needs strong trust",
      "I believe they can work if both are committed",
      "I prefer not to",
    ],
  },
  {
    question: "What’s your most treasured memory from childhood?",
    options: [
      "Family vacations",
      "Hanging out with friends",
      "Celebrating holidays",
      "Personal achievements (like winning a competition)",
    ],
  },
  {
    question: "Do you believe in love at first sight?",
    options: [
      "Yes, I believe in it completely",
      "I think it’s possible, but rare",
      "I’m skeptical about it",
      "I think it’s more about a strong connection growing over time",
    ],
  },
  {
    question: "What’s your love language?",
    options: [
      "Words of affirmation",
      "Acts of service",
      "Gifts",
      "Quality time",
      "Physical touch",
    ],
  },
  {
    question: "What’s your go-to comfort food?",
    options: [
      "Pizza",
      "Ice cream",
      "Chocolate",
      "A home-cooked meal",
    ],
  },
  {
    question: "Do you prefer spontaneous adventures or planning everything in advance?",
    options: [
      "Spontaneous adventures all the way",
      "I prefer to plan things carefully",
      "A mix of both, depending on the situation",
      "I like to plan just a little, but leave room for surprises",
    ],
  },
  {
    question: "What movie genre do you think best describes your life?",
    options: [
      "Comedy",
      "Action/Adventure",
      "Drama",
      "Sci-Fi/Fantasy",
    ],
  },
  {
    question: "If we were to watch a movie together, what would it be?",
    options: [
      "Action-packed thriller",
      "Romantic comedy",
      "Horror",
      "Documentary",
    ],
  },
  {
    question: "Do you like horror movies? If so, what’s your scariest one?",
    options: [
      "Yes, I love horror movies",
      "Not really into horror, but I’ll watch occasionally",
      "No, horror movies aren't my thing at all",
    ],
  },
  {
    question: "How do you feel about public displays of affection?",
    options: [
      "Love them, the more the better",
      "I’m comfortable with it in private, but not in public",
      "I’m not really a fan, but I don’t mind sometimes",
      "I prefer to keep it private",
    ],
  },
  {
    question: "What’s the most romantic thing you’ve ever done for someone?",
    options: [
      "A surprise date or getaway",
      "Writing a heartfelt letter or poem",
      "Giving a meaningful gift",
      "Cooking them a special meal",
    ],
  },
  {
    question: "Are you a morning person or a night owl?",
    options: [
      "Morning person, I wake up early and feel energized",
      "Night owl, I’m more productive at night",
      "It depends on the day, but I’m somewhere in between",
      "Neither, I struggle to get going at any time!",
    ],
  },
  {
    question: "What’s your favorite type of music?",
    options: [
      "Pop",
      "Rock",
      "Hip-hop/Rap",
      "Classical",
      "EDM",
      "Country",
      "Jazz",
      "Indie/Alternative",
    ],
  },
  {
    question: "What’s your favorite movie genre?",
    options: [
      "Action/Adventure",
      "Romance",
      "Thriller",
      "Comedy",
      "Drama",
      "Animation",
      "Horror",
    ],
  },
  {
    question: "How do you like to spend your weekends?",
    options: [
      "Exploring new places",
      "Catching up on Netflix shows",
      "Outdoor activities like hiking or biking",
      "Relaxing at home with a good book",
    ],
  },
  {
    question: "Do you like animals?",
    options: [
      "Yes, I love them!",
      "I like them, but I don’t have any pets",
      "I’m indifferent",
      "Not really an animal person",
    ],
  },
  {
    question: "What’s your idea of a good first date?",
    options: [
      "A casual coffee or drink",
      "A fun activity like bowling or mini-golf",
      "A nice dinner at a restaurant",
      "A nature walk or hike",
    ],
  },
  {
    question: "How important is fitness to you?",
    options: [
      "Very important, I work out regularly",
      "I try to stay active, but not super focused on it",
      "I’m not too into fitness, but I try to stay healthy",
      "Fitness is not a priority for me",
    ],
  },
  {
    question: "What’s your opinion on traveling?",
    options: [
      "I love it and try to travel as much as I can",
      "I like traveling occasionally, but not too often",
      "I enjoy trips, but I prefer staying home",
      "I don’t travel much, it’s not a big interest of mine",
    ],
  },
  {
    question: "What’s your biggest pet peeve?",
    options: [
      "People interrupting me while I’m speaking",
      "Loud chewing or eating noises",
      "Disorganization or clutter",
      "People who are always late",
    ],
  },
  {
    question: "How do you feel about sharing passwords and accounts in a relationship?",
    options: [
      "I’m okay with it as long as there’s trust",
      "I think it should be discussed and agreed upon",
      "I believe personal space should be respected, so I prefer not",
      "I’m completely against it",
    ],
  },
  {
    question: "What’s your favorite type of vacation?",
    options: [
      "Beach resort",
      "Mountain retreat",
      "City exploration",
      "Adventure and hiking",
    ],
  },
];

