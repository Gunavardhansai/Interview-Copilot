// src/app/api/questions/route.ts

import { NextResponse } from "next/server";
import { db } from "@/db/prisma";

export async function GET() {
  try {
    const questions = await db.question.findMany({
      take: 10,
    });

    return new NextResponse(JSON.stringify(questions), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Failed" },
      { status: 500 }
    );
  }
}
