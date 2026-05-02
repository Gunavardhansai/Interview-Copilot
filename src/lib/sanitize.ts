// src/lib/sanitize.ts

// Basic HTML escaping to prevent XSS injection in stored/displayed content
export function sanitizeInput(input: string): string {
  if (!input) return input;

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Optional: normalize whitespace and trim
export function normalizeText(input: string): string {
  return input.replace(/\s+/g, " ").trim();
}