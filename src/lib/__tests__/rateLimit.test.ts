// src/lib/__tests__/rateLimit.test.ts

import { rateLimit } from "@/lib/rateLimit";

describe("rateLimit", () => {
  it("should allow requests under limit", () => {
    const key = "test-user";

    const result1 = rateLimit(key, 2);
    const result2 = rateLimit(key, 2);

    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  it("should block when limit exceeded", () => {
    const key = "limit-user";

    rateLimit(key, 1);

    const blocked = rateLimit(key, 1);

    expect(blocked).toBe(false);
  });
});