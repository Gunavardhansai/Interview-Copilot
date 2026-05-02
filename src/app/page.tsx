// src/app/page.tsx

"use client";

import { useState } from "react";
import {
  defaultTechnology,
  getTechnologyMeta,
  interviewTechnologies,
  type InterviewTechnology,
} from "@/modules/interview/technologies";

export default function Home() {
  const [technology, setTechnology] =
    useState<InterviewTechnology>(defaultTechnology);
  const [message, setMessage] = useState("");
  const [isStarting, setIsStarting] = useState(false);

  const startInterview = async () => {
    setIsStarting(true);
    setMessage("");
    const selectedTechnology = getTechnologyMeta(technology);

    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: selectedTechnology.type,
          technology: selectedTechnology.value,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          setMessage("Please log in to start an interview. Redirecting...");
          window.location.href = `/login?callbackUrl=${encodeURIComponent(
            window.location.pathname
          )}`;
          return;
        }

        setMessage(data.error ?? "Failed to start interview");
        return;
      }

      setMessage("Interview session started. Opening copilot...");
      window.location.href = `/interview?sessionId=${encodeURIComponent(
        data.id
      )}`;
    } catch {
      setMessage("Failed to start interview");
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        Interview Copilot
      </h1>

      <select
        value={technology}
        onChange={(e) =>
          setTechnology(e.target.value as InterviewTechnology)
        }
        className="border p-2"
      >
        {interviewTechnologies.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>

      <button
        onClick={startInterview}
        disabled={isStarting}
        className="ml-4 bg-blue-500 text-white px-4 py-2"
      >
        {isStarting ? "Starting..." : "Start"}
      </button>

      {message && <p className="mt-4 text-sm">{message}</p>}
    </div>
  );
}
