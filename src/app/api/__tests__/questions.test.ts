// src/app/api/__tests__/questions.test.ts

import { GET } from "../questions/route";
import { db } from "@/db/prisma";
import { NextRequest } from "next/server";

jest.mock("@/db/prisma", () => ({
  db: {
    question: {
      findMany: jest.fn(),
    },
  },
}));

describe("GET /api/questions", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return questions", async () => {
    const questions = [
      {
        id: "question-1",
        content: "Two Sum problem",
      },
    ];

    jest.mocked(db.question.findMany).mockResolvedValue(questions as never);

    const req = new NextRequest(
      "http://localhost/api/questions"
    );

    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toEqual(questions);
  });
});
