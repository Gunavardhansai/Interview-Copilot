// src/hooks/useSessionPolling.ts

"use client";

import { useEffect, useState } from "react";

export function useSessionPolling(sessionId: string) {
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    if (!sessionId) return;

    const interval = setInterval(async () => {
      const res = await fetch(`/api/session/${sessionId}`);
      const json = await res.json();
      setData(json);
    }, 3000);

    return () => clearInterval(interval);
  }, [sessionId]);

  return data;
}
