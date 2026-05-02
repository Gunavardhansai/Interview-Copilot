// src/app/api/auth/register/route.ts

import { db } from "@/db/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return Response.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 }
      );
    }

    const exists = await db.user.findUnique({
      where: { email: parsed.data.email },
    });

    if (exists) {
      return Response.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    const hashed = await bcrypt.hash(parsed.data.password, 10);

    const user = await db.user.create({
      data: {
        email: parsed.data.email,
        password: hashed,
      },
      select: {
        id: true,
        email: true,
        role: true,
      },
    });

    return Response.json(user);
  } catch {
    return Response.json(
      {
        error:
          "Database is not ready. Create the database and run Prisma migrations.",
      },
      { status: 500 }
    );
  }
}
