// src/app/dashboard/page.tsx

import { auth } from "@/lib/auth";
import { db } from "@/db/prisma";
import Insights from "./Insights";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    return <div>Unauthorized</div>;
  }

  const attempts = await db.attempt.findMany({
    where: { userId: session.user.id },
    include: { question: true },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Dashboard (SSR)
      </h1>

      {attempts.length === 0 ? (
        <div className="border p-4 mt-2">
          <p className="font-medium">No interview attempts yet.</p>
          <p className="mt-1 text-sm">
            Start an interview and submit an answer to populate your
            dashboard.
          </p>
          <Link
            href="/"
            className="inline-block mt-4 bg-blue-500 text-white px-4 py-2"
          >
            Start Interview
          </Link>
        </div>
      ) : (
        attempts.map((a) => (
          <div key={a.id} className="border p-3 mt-2">
            <p className="font-medium">{a.question.content}</p>
            <p className="text-sm">{a.answer}</p>
          </div>
        ))
      )}

      <Insights />
    </div>
  );
}
