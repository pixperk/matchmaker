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
    // Fetch the user and their answers
    const user = await db.user.findUnique({
      where: { id: userId },
      include: { answers: true },
    });

    if (!user) {
      throw new Error(`User with ID ${userId} not found.`);
    }

    if (user.matched) {
      console.log("User is already matched.");
      // Fetch the existing match details
      return await db.user.findUnique({
        where: { id: user.matchedWithId || undefined },
      });
    }

    // Find users of the opposite gender who are not yet matched
    const potentialMatches = await db.user.findMany({
      where: {
        gender: user.gender === "male" ? "female" : "male",
        matched: false,
      },
      include: { answers: true },
    });

    let bestMatch = null;
    let highestMatchCount = 0;

    // Compare answers and calculate match score
    for (const potentialMatch of potentialMatches) {
      const matchCount = potentialMatch.answers.reduce((count, answer) => {
        const userAnswer = user.answers.find(
          (ua) => ua.questionNumber === answer.questionNumber
        );
        return userAnswer && userAnswer.answer === answer.answer ? count + 1 : count;
      }, 0);

      if (matchCount > highestMatchCount) {
        highestMatchCount = matchCount;
        bestMatch = potentialMatch;
      }
    }

    if (bestMatch) {
      // Update both users as matched
      await db.user.update({
        where: { id: userId },
        data: { matched: true, matchedWithId: bestMatch.id },
      });

      await db.user.update({
        where: { id: bestMatch.id },
        data: { matched: true, matchedWithId: userId },
      });

      return bestMatch; // Return the best match
    }

    return null; // No match found
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