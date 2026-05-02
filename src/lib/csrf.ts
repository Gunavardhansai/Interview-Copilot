// src/lib/csrf.ts

export function verifyCSRF(req: Request) {
  const token = req.headers.get("x-csrf-token");

  if (!token || token !== process.env.CSRF_SECRET) {
    throw new Error("Invalid CSRF token");
  }
}