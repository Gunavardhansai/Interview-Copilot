// src/app/api/session/submit/route.ts

import { NextResponse } from "next/server";
import { submitAnswerSchema } from "@/modules/interview/schemas";
import {
  getQuestion,
  getSession,
  saveAnswer,
} from "@/modules/interview/services/interview.service";
import { evaluateAnswer } from "@/modules/ai/services/ai.service";
import { auth } from "@/lib/auth";
import { rateLimit } from "@/lib/rateLimit";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = submitAnswerSchema.safeParse(body);
    const key = `${session.user.id}-submit`;

    if (!rateLimit(key, 5, 60_000)) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }

    const interviewSession = await getSession(parsed.data.sessionId);

    if (!interviewSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (interviewSession.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const question = await getQuestion(parsed.data.questionId);

    if (
      !question ||
      question.type !== interviewSession.type ||
      question.technology !== interviewSession.technology
    ) {
      return NextResponse.json(
        { error: "Question does not belong to this interview" },
        { status: 400 }
      );
    }

    const ai = await evaluateAnswer(
      question.content,
      parsed.data.answer,
      question.technology
    );

    const attempt = await saveAnswer({
      userId: session.user.id,
      sessionId: parsed.data.sessionId,
      questionId: parsed.data.questionId,
      answer: parsed.data.answer,
      feedback: ai.feedback,
      score: ai.score,
    });

    return NextResponse.json(attempt);
  } catch {
    return NextResponse.json({ error: "Submission failed" }, { status: 500 });
  }
}
