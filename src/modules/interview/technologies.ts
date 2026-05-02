import type { QuestionType } from "@prisma/client";

export const interviewTechnologyValues = [
  "javascript",
  "typescript",
  "react",
  "nextjs",
  "nodejs",
  "python",
  "java",
  "sql",
  "system-design",
  "behavioral",
] as const;

export type InterviewTechnology =
  (typeof interviewTechnologyValues)[number];

export type InterviewTechnologyOption = {
  value: InterviewTechnology;
  label: string;
  type: QuestionType;
};

export const interviewTechnologies: InterviewTechnologyOption[] = [
  { value: "javascript", label: "JavaScript", type: "DSA" },
  { value: "typescript", label: "TypeScript", type: "DSA" },
  { value: "react", label: "React", type: "DSA" },
  { value: "nextjs", label: "Next.js", type: "DSA" },
  { value: "nodejs", label: "Node.js", type: "DSA" },
  { value: "python", label: "Python", type: "DSA" },
  { value: "java", label: "Java", type: "DSA" },
  { value: "sql", label: "SQL", type: "DSA" },
  {
    value: "system-design",
    label: "System Design",
    type: "SYSTEM_DESIGN",
  },
  { value: "behavioral", label: "Behavioral", type: "BEHAVIORAL" },
];

export const defaultTechnology: InterviewTechnology = "javascript";

export function getTechnologyMeta(
  technology: string
): InterviewTechnologyOption {
  return (
    interviewTechnologies.find((item) => item.value === technology) ??
    interviewTechnologies[0]
  );
}
