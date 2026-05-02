// src/app/api/session/start/route.ts

import { NextResponse } from "next/server";
import { startSessionSchema } from "@/modules/interview/schemas";
import {
  createSession,
  getQuestions,
} from "@/modules/interview/services/interview.service";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = startSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error },
        { status: 400 }
      );
    }

    const newSession = await createSession(
      session.user.id,
      parsed.data.type,
      parsed.data.technology
    );
    const questions = await getQuestions(
      parsed.data.type,
      parsed.data.technology
    );

    return NextResponse.json({
      ...newSession,
      questions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to create session" },
      { status: 500 }
    );
  }
}
