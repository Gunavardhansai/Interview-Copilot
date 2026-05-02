// src/app/dashboard/Insights.tsx

"use client";

import { useEffect, useState } from "react";

export default function Insights() {
  const [data, setData] = useState(
    "Loading your latest interview insights..."
  );

  useEffect(() => {
    fetch("/api/ai/insights")
      .then(async (res) => {
        const body = await res.json();

        if (!res.ok) {
          throw new Error(body.error ?? "Failed to load insights");
        }

        return body;
      })
      .then((d) => {
        setData(d.insights ?? "No insights available yet.");
      })
      .catch((error) => {
        setData(error.message);
      });
  }, []);

  return (
    <div className="mt-6 border p-4">
      <h2 className="font-bold">AI Insights</h2>
      <p>{data}</p>
    </div>
  );
}
