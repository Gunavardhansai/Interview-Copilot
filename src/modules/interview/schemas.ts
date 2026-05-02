// src/modules/interview/schemas.ts

import { z } from "zod";
import { sanitizeInput, normalizeText } from "@/lib/sanitize";
import {
  defaultTechnology,
  getTechnologyMeta,
  interviewTechnologyValues,
} from "@/modules/interview/technologies";

export const questionTypeSchema = z.enum([
  "DSA",
  "SYSTEM_DESIGN",
  "BEHAVIORAL",
]);

export const technologySchema = z.enum(interviewTechnologyValues);

export const startSessionSchema = z
  .object({
    type: questionTypeSchema.optional(),
    technology: technologySchema.default(defaultTechnology),
  })
  .transform((data) => {
    const technology = getTechnologyMeta(data.technology);

    return {
      type: data.type ?? technology.type,
      technology: technology.value,
    };
  });

export const submitAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string().uuid(),
  answer: z
    .string()
    .min(10)
    .transform((val) => sanitizeInput(normalizeText(val))),
});
