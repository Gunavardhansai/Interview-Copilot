// src/modules/ai/services/ai.service.ts

import OpenAI from "openai";
import { getTechnologyMeta } from "@/modules/interview/technologies";

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

function fallbackEvaluation(
  question: string,
  answer: string,
  technology = "javascript"
) {
  const technologyLabel = getTechnologyMeta(technology).label;
  const wordCount = answer.trim().split(/\s+/).filter(Boolean).length;
  const hasStructure = /because|first|second|then|finally|therefore/i.test(
    answer
  );
  const score = Math.min(
    8,
    Math.max(3, Math.round(wordCount / 18) + (hasStructure ? 2 : 0))
  );

  return {
    feedback:
      `Good start for ${technologyLabel}. For "${question}", make the answer stronger by explaining your reasoning step by step, naming tradeoffs, and ending with a concrete final decision.`,
    score,
  };
}

export async function evaluateAnswer(
  question: string,
  answer: string,
  technology = "javascript"
) {
  const technologyLabel = getTechnologyMeta(technology).label;
  const openai = getOpenAIClient();

  if (!openai) {
    return fallbackEvaluation(question, answer, technology);
  }

  try {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        {
          role: "system",
          content:
            `You are a strict but helpful ${technologyLabel} interviewer. Evaluate whether the candidate actually answered the question, including spoken transcripts that may contain recognition mistakes. In 3 concise bullets, validate correctness, call out missing concepts, and give one improvement tip.`,
        },
        {
          role: "user",
          content: `Technology:\n${technologyLabel}\n\nQuestion:\n${question}\n\nCandidate answer or voice transcript:\n${answer}`,
        },
      ],
    });

    return {
      feedback:
        res.choices[0]?.message.content ??
        fallbackEvaluation(question, answer, technology).feedback,
      score: fallbackEvaluation(question, answer, technology).score,
    };
  } catch {
    return fallbackEvaluation(question, answer, technology);
  }
}
