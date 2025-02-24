"use server";

import { Gender } from "@prisma/client";
import { db } from "./prisma";


export async function findUserByUid(uid:string) {
    const user = await db.user.findUnique({
        where: {
          googleUid : uid,
        },
        include:{
          matchedWith : true
        }
      });

      return user;
}

export type IUser = Awaited<ReturnType<typeof findUserByUid>>;


export async function login(name: string, gender: Gender, email: string, crush : string, googleUid : string) {

 
   await db.user.create({
      data: {
        name,
        email,
        gender,
        crush,
        googleUid
      },
    });

    
}




export async function saveAnswer(userId: number, qno: number, answer: string) {
  await db.userAnswer.create({
    data: {
      userId,
      questionNumber: qno,
      answer,
    },
  });
}

export async function findBestMatch(userId: number) {
  try {
    // Fetch the user with answers
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { answers: true },
    });

    if (!user) throw new Error(`User with ID ${userId} not found.`);
    if (user.matchedWithId) {
      console.log("User is already matched.");
      return db.user.findUnique({ where: { id: user.matchedWithId } });
    }

    // Fetch potential matches (opposite gender, not yet matched)
    const potentialMatches = await db.user.findMany({
      where: { gender: user.gender === "male" ? "female" : "male", matchedWithId: null },
      include: { answers: true },
    });

    if (potentialMatches.length === 0) return null; // No available matches

    let bestMatch = null;
    let highestScore = 0;

    // Convert user's answers to a Map for fast lookup
    const userAnswersMap = new Map(user.answers.map(a => [a.questionNumber, a.answer]));

    // Compare with potential matches
    for (const match of potentialMatches) {
      const matchScore = match.answers.reduce(
        (count, ans) => count + (userAnswersMap.get(ans.questionNumber) === ans.answer ? 1 : 0),
        0
      );

      if (matchScore > highestScore) {
        highestScore = matchScore;
        bestMatch = match;
      }
      
    }

    if (!bestMatch) return null; // No good match found

    // Update both users in a single transaction
    await db.$transaction([
      db.user.update({ where: { id: userId }, data: { matchedWithId: bestMatch.id, matched : true } }),
      db.user.update({ where: { id: bestMatch.id }, data: { matchedWithId: userId, matched : true } }),
    ]);

    return bestMatch;
  } catch (error) {
    console.error("Error in findBestMatch:", error);
    throw error;
  }
}



export async function marksQuestionsAnswered(userId : number){
  await db.user.update({
    where : {
      id : userId
    },
    data:{
      questionsAnswered : true
    }
  })
}

export async function ifUserAnsweredQuestions(id  :number){
  const user = await db.user.findUnique({
    where:{
      id
    }
  })

  if(!user){return false}
  return user.questionsAnswered
}