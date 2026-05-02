// src/modules/ai/services/recommendation.service.ts

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type InsightAttempt = {
  answer: string;
  score: number | null;
  question: {
    content: string;
  };
};

export async function generateInsights(attempts: InsightAttempt[]) {
  if (attempts.length === 0) {
    return "Submit at least one interview answer to unlock AI insights.";
  }

  const formatted = attempts
    .map(
      (a) =>
        `Q: ${a.question.content}\nA: ${a.answer}\nScore: ${a.score}`
    )
    .join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content:
          "You are an expert technical interviewer. Analyze answers and provide strengths, weaknesses, and recommended topics.",
      },
      {
        role: "user",
        content: formatted,
      },
    ],
  });

  return response.choices[0].message.content;
}
