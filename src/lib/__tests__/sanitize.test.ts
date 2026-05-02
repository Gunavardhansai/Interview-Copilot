// src/lib/__tests__/sanitize.test.ts

import { sanitizeInput } from "@/lib/sanitize";

describe("sanitizeInput", () => {
  it("should escape HTML characters", () => {
    const input = "<script>alert('x')</script>";

    const result = sanitizeInput(input);

    expect(result).toBe(
      "&lt;script&gt;alert(&#039;x&#039;)&lt;/script&gt;"
    );
  });

  it("should return safe text unchanged", () => {
    const input = "hello world";

    const result = sanitizeInput(input);

    expect(result).toBe("hello world");
  });
});