// src/app/api/__tests__/register.test.ts

import { POST } from "../auth/register/route";
import { db } from "@/db/prisma";
import bcrypt from "bcrypt";

jest.mock("@/db/prisma", () => ({
  db: {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  },
}));

jest.mock("bcrypt", () => ({
  __esModule: true,
  default: {
    hash: jest.fn(),
  },
}));

describe("POST /api/auth/register", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should validate input", async () => {
    const user = {
      id: "user-1",
      email: "test@test.com",
      password: "hashed-password",
    };

    jest.mocked(db.user.findUnique).mockResolvedValue(null);
    jest.mocked(bcrypt.hash).mockResolvedValue("hashed-password" as never);
    jest.mocked(db.user.create).mockResolvedValue(user as never);

    const req = new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({
        email: "test@test.com",
        password: "123456",
      }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.email).toBe("test@test.com");
  });
});
