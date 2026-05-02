// src/modules/interview/services/interview.service.ts

import { db } from "@/db/prisma";
import type { QuestionType } from "@prisma/client";
import {
  getTechnologyMeta,
  type InterviewTechnology,
} from "@/modules/interview/technologies";

export async function getQuestions(
  type: QuestionType,
  technology: string
) {
  const technologyMeta = getTechnologyMeta(technology);

  return db.question.findMany({
    where: { type, technology: technologyMeta.value },
    orderBy: [{ difficulty: "asc" }, { createdAt: "asc" }],
    take: 5,
  });
}

export async function createSession(
  userId: string,
  type: QuestionType,
  technology: InterviewTechnology
) {
  return db.session.create({
    data: {
      userId,
      type,
      technology,
    },
  });
}

export async function saveAnswer(data: {
  userId: string;
  sessionId: string;
  questionId: string;
  answer: string;
  feedback?: string | null;
  score?: number | null;
}) {
  return db.attempt.upsert({
    where: {
      sessionId_questionId: {
        sessionId: data.sessionId,
        questionId: data.questionId,
      },
    },
    update: {
      answer: data.answer,
      feedback: data.feedback,
      score: data.score,
    },
    create: data,
  });
}

export async function getSession(sessionId: string) {
  return db.session.findUnique({
    where: { id: sessionId },
    include: {
      attempts: {
        include: { question: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });
}

export async function getQuestion(questionId: string) {
  return db.question.findUnique({
    where: { id: questionId },
  });
}
