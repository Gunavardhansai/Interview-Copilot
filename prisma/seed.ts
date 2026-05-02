// prisma/seed.ts

import "dotenv/config";
import { PrismaClient, type Prisma } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

const questions: Prisma.QuestionCreateInput[] = [
  {
    content:
      "Explain closures in JavaScript and give one interview-style example.",
    type: "DSA",
    technology: "javascript",
    difficulty: "EASY",
    tags: ["closures", "scope"],
  },
  {
    content:
      "How would you remove duplicates from an array of objects by id in JavaScript?",
    type: "DSA",
    technology: "javascript",
    difficulty: "MEDIUM",
    tags: ["array", "map"],
  },
  {
    content:
      "Explain the event loop, microtasks, and macrotasks with a small example.",
    type: "DSA",
    technology: "javascript",
    difficulty: "HARD",
    tags: ["event-loop", "async"],
  },
  {
    content:
      "What is the difference between interface and type in TypeScript?",
    type: "DSA",
    technology: "typescript",
    difficulty: "EASY",
    tags: ["types", "interfaces"],
  },
  {
    content:
      "How would you model a discriminated union for API response states?",
    type: "DSA",
    technology: "typescript",
    difficulty: "MEDIUM",
    tags: ["union", "api"],
  },
  {
    content:
      "Explain generics with constraints and when you would use them.",
    type: "DSA",
    technology: "typescript",
    difficulty: "HARD",
    tags: ["generics", "constraints"],
  },
  {
    content:
      "Explain how React state updates trigger rendering.",
    type: "DSA",
    technology: "react",
    difficulty: "EASY",
    tags: ["state", "rendering"],
  },
  {
    content:
      "When would you use useMemo, useCallback, and React.memo together?",
    type: "DSA",
    technology: "react",
    difficulty: "MEDIUM",
    tags: ["performance", "hooks"],
  },
  {
    content:
      "How would you debug a React component that renders too often?",
    type: "DSA",
    technology: "react",
    difficulty: "HARD",
    tags: ["debugging", "performance"],
  },
  {
    content:
      "What is the difference between Server Components and Client Components in Next.js?",
    type: "DSA",
    technology: "nextjs",
    difficulty: "EASY",
    tags: ["rsc", "client-components"],
  },
  {
    content:
      "How would you choose between static rendering, dynamic rendering, and streaming in Next.js?",
    type: "DSA",
    technology: "nextjs",
    difficulty: "MEDIUM",
    tags: ["rendering", "streaming"],
  },
  {
    content:
      "Explain how caching and revalidation affect data freshness in a Next.js app.",
    type: "DSA",
    technology: "nextjs",
    difficulty: "HARD",
    tags: ["cache", "revalidation"],
  },
  {
    content:
      "Explain the difference between blocking and non-blocking I/O in Node.js.",
    type: "DSA",
    technology: "nodejs",
    difficulty: "EASY",
    tags: ["runtime", "io"],
  },
  {
    content:
      "How would you structure error handling in an Express-style API?",
    type: "DSA",
    technology: "nodejs",
    difficulty: "MEDIUM",
    tags: ["api", "errors"],
  },
  {
    content:
      "How would you diagnose memory leaks in a long-running Node.js service?",
    type: "DSA",
    technology: "nodejs",
    difficulty: "HARD",
    tags: ["memory", "debugging"],
  },
  {
    content:
      "Explain list comprehension in Python and when it becomes less readable.",
    type: "DSA",
    technology: "python",
    difficulty: "EASY",
    tags: ["lists", "syntax"],
  },
  {
    content:
      "How would you count word frequency in Python efficiently?",
    type: "DSA",
    technology: "python",
    difficulty: "MEDIUM",
    tags: ["dict", "counter"],
  },
  {
    content:
      "Explain decorators in Python and give a real backend use case.",
    type: "DSA",
    technology: "python",
    difficulty: "HARD",
    tags: ["decorators", "backend"],
  },
  {
    content:
      "Explain the difference between ArrayList and LinkedList in Java.",
    type: "DSA",
    technology: "java",
    difficulty: "EASY",
    tags: ["collections", "list"],
  },
  {
    content:
      "How do equals and hashCode affect HashMap behavior in Java?",
    type: "DSA",
    technology: "java",
    difficulty: "MEDIUM",
    tags: ["hashmap", "objects"],
  },
  {
    content:
      "Explain thread safety and how you would protect shared state in Java.",
    type: "DSA",
    technology: "java",
    difficulty: "HARD",
    tags: ["threads", "concurrency"],
  },
  {
    content:
      "What is the difference between WHERE and HAVING in SQL?",
    type: "DSA",
    technology: "sql",
    difficulty: "EASY",
    tags: ["query", "filtering"],
  },
  {
    content:
      "Write the reasoning for finding the second highest salary using SQL.",
    type: "DSA",
    technology: "sql",
    difficulty: "MEDIUM",
    tags: ["ranking", "query"],
  },
  {
    content:
      "Explain how indexes can help or hurt query performance.",
    type: "DSA",
    technology: "sql",
    difficulty: "HARD",
    tags: ["indexes", "performance"],
  },
  {
    content:
      "Design a URL shortener and explain the core data model.",
    type: "SYSTEM_DESIGN",
    technology: "system-design",
    difficulty: "EASY",
    tags: ["url-shortener", "data-model"],
  },
  {
    content:
      "Design a notification system that supports email, push, and retries.",
    type: "SYSTEM_DESIGN",
    technology: "system-design",
    difficulty: "MEDIUM",
    tags: ["queues", "retries"],
  },
  {
    content:
      "Design a real-time collaborative document editor at high scale.",
    type: "SYSTEM_DESIGN",
    technology: "system-design",
    difficulty: "HARD",
    tags: ["realtime", "collaboration"],
  },
  {
    content:
      "Tell me about a time you had to learn a new technology quickly.",
    type: "BEHAVIORAL",
    technology: "behavioral",
    difficulty: "EASY",
    tags: ["learning", "adaptability"],
  },
  {
    content:
      "Tell me about a conflict with a teammate and how you handled it.",
    type: "BEHAVIORAL",
    technology: "behavioral",
    difficulty: "MEDIUM",
    tags: ["conflict", "communication"],
  },
  {
    content:
      "Tell me about a technical decision you owned that had tradeoffs.",
    type: "BEHAVIORAL",
    technology: "behavioral",
    difficulty: "HARD",
    tags: ["ownership", "tradeoffs"],
  },
];

async function main() {
  for (const question of questions) {
    const exists = await prisma.question.findFirst({
      where: {
        technology: question.technology,
        content: question.content,
      },
    });

    if (!exists) {
      await prisma.question.create({ data: question });
    }
  }
}

main().finally(() => prisma.$disconnect());
