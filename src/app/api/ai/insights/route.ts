// src/app/api/ai/insights/route.ts

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/prisma";
import { generateInsights } from "@/modules/ai/services/recommendation.service";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const attempts = await db.attempt.findMany({
      where: { userId: session.user.id },
      include: {
        question: true,
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    if (attempts.length === 0) {
      return NextResponse.json({
        insights:
          "Submit at least one interview answer to unlock AI insights.",
      });
    }

    const insights = await generateInsights(attempts);

    return NextResponse.json({ insights });
  } catch {
    return NextResponse.json(
      { error: "AI failed" },
      { status: 500 }
    );
  }
}
