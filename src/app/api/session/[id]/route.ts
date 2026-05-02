// src/app/api/session/[id]/route.ts

import { NextResponse } from "next/server";
import {
  getQuestions,
  getSession,
} from "@/modules/interview/services/interview.service";
import { auth } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authSession = await auth();

    if (!authSession?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const interviewSession = await getSession(id);

    if (!interviewSession) {
      return NextResponse.json(
        { error: "Session not found" },
        { status: 404 }
      );
    }

    if (interviewSession.userId !== authSession.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const questions = await getQuestions(
      interviewSession.type,
      interviewSession.technology
    );

    return NextResponse.json({
      session: interviewSession,
      questions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch session" },
      { status: 500 }
    );
  }
}
