// src/app/api/admin/users/route.ts

import { NextResponse } from "next/server";
import { requireAuth } from "@/lib/requireAuth";
import { requireRole } from "@/lib/rbac";
import { db } from "@/db/prisma";

export async function GET() {
  try {
    const session = await requireAuth();

    requireRole(session.user.role, ["ADMIN"]);

    const users = await db.user.findMany();

    return NextResponse.json(users);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unauthorized";

    return NextResponse.json(
      { error: message },
      { status: message === "Forbidden" ? 403 : 401 }
    );
  }
}
