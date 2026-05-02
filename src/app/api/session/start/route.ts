// src/app/api/session/start/route.ts

import { NextResponse } from "next/server";
import { startSessionSchema } from "@/modules/interview/schemas";
import {
  createSession,
  getQuestions,
} from "@/modules/interview/services/interview.service";
import { auth } from "@/lib/auth";

function getDeploymentConfigError() {
  if (!process.env.NEXTAUTH_SECRET) {
    return "Missing NEXTAUTH_SECRET in Vercel environment variables.";
  }

  if (!process.env.DATABASE_URL) {
    return "Missing DATABASE_URL in Vercel environment variables.";
  }

  return null;
}

function getSessionStartError(error: unknown) {
  if (!(error instanceof Error)) {
    return "Failed to create session";
  }

  if (
    error.message.includes("does not exist") ||
    error.message.includes("Unknown argument") ||
    error.message.includes("database") ||
    error.message.includes("schema")
  ) {
    return "Database is not ready. Set DATABASE_URL, run Prisma schema sync, and seed questions.";
  }

  if (
    error.message.includes("Can't reach database") ||
    error.message.includes("Connection") ||
    error.message.includes("connect")
  ) {
    return "Cannot connect to the database. Check the Vercel DATABASE_URL value.";
  }

  return error.message || "Failed to create session";
}

export async function POST(req: Request) {
  const configError = getDeploymentConfigError();

  if (configError) {
    return NextResponse.json({ error: configError }, { status: 503 });
  }

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
  } catch (error) {
    console.error("Failed to create interview session", error);

    return NextResponse.json(
      { error: getSessionStartError(error) },
      { status: 500 }
    );
  }
}
