// src/app/questions/page.tsx

import { db } from "@/db/prisma";
import { connection } from "next/server";

export default async function QuestionsPage() {
  await connection();

  const questions = await db.question.findMany({
    take: 20,
  });

  return (
    <div className="p-10">
      <h1 className="text-xl font-bold mb-4">
        Questions (SSG)
      </h1>

      {questions.map((q) => (
        <div key={q.id} className="mt-2">
          {q.content}
        </div>
      ))}
    </div>
  );
}
