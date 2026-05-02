// src/lib/rbac.ts

export function requireRole(userRole: string, allowed: string[]) {
  if (!allowed.includes(userRole)) {
    throw new Error("Forbidden");
  }
}