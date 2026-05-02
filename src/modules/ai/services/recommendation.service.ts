// src/modules/ai/services/recommendation.service.ts

import OpenAI from "openai";

let openaiClient: OpenAI | null = null;

function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  openaiClient ??= new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return openaiClient;
}

type InsightAttempt = {
  answer: string;
  score: number | null;
  question: {
    content: string;
  };
};

function fallbackInsights(attempts: InsightAttempt[]) {
  const averageScore =
    attempts.reduce((sum, attempt) => sum + (attempt.score ?? 0), 0) /
    attempts.length;

  return [
    `Average score: ${averageScore.toFixed(1)} / 10.`,
    "Review the latest feedback, strengthen answers with concrete tradeoffs, and practice explaining your reasoning step by step.",
    "Set OPENAI_API_KEY to enable deeper AI-generated strengths, weaknesses, and topic recommendations.",
  ].join("\n");
}

export async function generateInsights(attempts: InsightAttempt[]) {
  if (attempts.length === 0) {
    return "Submit at least one interview answer to unlock AI insights.";
  }

  const openai = getOpenAIClient();

  if (!openai) {
    return fallbackInsights(attempts);
  }

  const formatted = attempts
    .map(
      (a) =>
        `Q: ${a.question.content}\nA: ${a.answer}\nScore: ${a.score}`
    )
    .join("\n\n");

  try {
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

    return response.choices[0].message.content ?? fallbackInsights(attempts);
  } catch {
    return fallbackInsights(attempts);
  }
}
