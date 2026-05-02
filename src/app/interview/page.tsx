"use client";

import {
  ArrowRight,
  Bot,
  CheckCircle2,
  ClipboardList,
  Lightbulb,
  Loader2,
  Mic,
  MicOff,
  RotateCcw,
  Send,
  UserRound,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  FormEvent,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  defaultTechnology,
  getTechnologyMeta,
  interviewTechnologies,
  type InterviewTechnology,
} from "@/modules/interview/technologies";

type InterviewType = "DSA" | "SYSTEM_DESIGN" | "BEHAVIORAL";
type Difficulty = "EASY" | "MEDIUM" | "HARD";

type Question = {
  id: string;
  content: string;
  type: InterviewType;
  technology: InterviewTechnology;
  difficulty: Difficulty;
  tags: string[];
};

type Attempt = {
  id: string;
  questionId: string;
  answer: string;
  feedback: string | null;
  score: number | null;
};

type InterviewSession = {
  id: string;
  type: InterviewType;
  technology: InterviewTechnology;
  attempts: Attempt[];
};

type ChatMessage = {
  id: string;
  role: "copilot" | "candidate" | "system";
  content: string;
};

type SpeechRecognitionEventLike = {
  resultIndex?: number;
  results: {
    length: number;
    [index: number]: {
      isFinal: boolean;
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorLike = {
  error?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: SpeechRecognitionErrorLike) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

const difficultyClass: Record<Difficulty, string> = {
  EASY: "bg-emerald-50 text-emerald-700 border-emerald-200",
  MEDIUM: "bg-amber-50 text-amber-700 border-amber-200",
  HARD: "bg-rose-50 text-rose-700 border-rose-200",
};

function makeId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function questionPrompt(question: Question, index: number, total: number) {
  return `Question ${index + 1} of ${total} for ${
    getTechnologyMeta(question.technology).label
  }: ${question.content}`;
}

function hintForQuestion(question: Question) {
  const technologyLabel = getTechnologyMeta(question.technology).label;

  if (question.technology === "react") {
    return "Name the React primitive involved, explain when it runs, then connect it to rendering, state, or effects.";
  }

  if (question.technology === "nextjs") {
    return "Separate server and client responsibilities first, then mention routing, rendering, caching, or data boundaries.";
  }

  if (question.technology === "sql") {
    return "Start with the table relationship, then explain filtering, grouping, indexes, or transaction behavior.";
  }

  if (question.type === "DSA") {
    return `For ${technologyLabel}, start with the straightforward approach, then improve it. Mention the data structure, language feature, or runtime behavior that removes repeated work.`;
  }

  if (question.type === "SYSTEM_DESIGN") {
    return "Clarify requirements, estimate scale, define APIs, choose storage, then discuss bottlenecks and tradeoffs.";
  }

  return "Use a short story: situation, action, result, and what you learned. Keep the answer specific.";
}

function formatScore(score: number | null) {
  if (typeof score !== "number") return "Score pending";
  return `${score.toFixed(1)} / 10`;
}

function feedbackMessage(attempt: Attempt, isLastQuestion: boolean) {
  const feedback = attempt.feedback ?? "Answer saved.";
  const nextLine = isLastQuestion
    ? "That completes this interview."
    : "Ready for the next question.";

  return `${feedback}\n\n${formatScore(attempt.score)}. ${nextLine}`;
}

function getSpeechRecognition() {
  if (typeof window === "undefined") return null;

  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };

  return (
    browserWindow.SpeechRecognition ??
    browserWindow.webkitSpeechRecognition ??
    null
  );
}

function buildMessages(session: InterviewSession, questions: Question[]) {
  const technologyLabel = getTechnologyMeta(session.technology).label;
  const messages: ChatMessage[] = [
    {
      id: makeId("opening"),
      role: "copilot",
      content: `Starting ${technologyLabel} interview. I will ask one question at a time, review your spoken or typed answer, validate it, then move you forward.`,
    },
  ];

  if (questions.length === 0) {
    messages.push({
      id: makeId("empty"),
      role: "copilot",
      content:
        `No ${technologyLabel} questions are available yet. Seed the database, then start again.`,
    });

    return { messages, currentIndex: 0 };
  }

  const attemptsByQuestion = new Map(
    session.attempts.map((attempt) => [attempt.questionId, attempt])
  );
  let currentIndex = 0;

  questions.forEach((question, index) => {
    const attempt = attemptsByQuestion.get(question.id);

    if (!attempt) return;

    messages.push({
      id: makeId(`question-${question.id}`),
      role: "copilot",
      content: questionPrompt(question, index, questions.length),
    });
    messages.push({
      id: makeId(`answer-${attempt.id}`),
      role: "candidate",
      content: attempt.answer,
    });
    messages.push({
      id: makeId(`feedback-${attempt.id}`),
      role: "copilot",
      content: feedbackMessage(attempt, index === questions.length - 1),
    });

    currentIndex = index + 1;
  });

  if (currentIndex < questions.length) {
    messages.push({
      id: makeId(`question-${questions[currentIndex].id}`),
      role: "copilot",
      content: questionPrompt(
        questions[currentIndex],
        currentIndex,
        questions.length
      ),
    });
  } else {
    messages.push({
      id: makeId("complete"),
      role: "system",
      content: "Interview complete. You can review the session or start over.",
    });
  }

  return { messages, currentIndex };
}

function LoadingInterview() {
  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl items-center gap-3 rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
        <Loader2 className="size-5 animate-spin text-blue-600" />
        <span className="text-sm font-medium">Loading interview...</span>
      </div>
    </main>
  );
}

export default function InterviewPage() {
  return (
    <Suspense fallback={<LoadingInterview />}>
      <InterviewWorkspace />
    </Suspense>
  );
}

function InterviewWorkspace() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedSessionId = searchParams.get("sessionId");

  const [selectedTechnology, setSelectedTechnology] =
    useState<InterviewTechnology>(defaultTechnology);
  const [sessionId, setSessionId] = useState<string | null>(
    requestedSessionId
  );
  const [sessionTechnology, setSessionTechnology] =
    useState<InterviewTechnology>(defaultTechnology);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(Boolean(requestedSessionId));
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const spokenMessageIdsRef = useRef<Set<string>>(new Set());

  const activeQuestion = questions[currentIndex];
  const selectedTechnologyLabel =
    getTechnologyMeta(selectedTechnology).label;
  const sessionTechnologyLabel =
    getTechnologyMeta(sessionTechnology).label;
  const isComplete = questions.length > 0 && currentIndex >= questions.length;
  const completedCount = useMemo(() => {
    const answered = new Set(attempts.map((attempt) => attempt.questionId));
    return questions.filter((question) => answered.has(question.id)).length;
  }, [attempts, questions]);
  const progressValue = questions.length
    ? Math.round((currentIndex / questions.length) * 100)
    : 0;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSubmitting]);

  useEffect(() => {
    setSpeechSupported(Boolean(getSpeechRecognition()));
    setVoiceSupported(
      "speechSynthesis" in window && "SpeechSynthesisUtterance" in window
    );

    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakText = useCallback(
    (text: string) => {
      if (!voiceSupported) {
        setError("Voice output is not supported in this browser.");
        return;
      }

      const cleanText = text.replace(/\s+/g, " ").trim();

      if (!cleanText) return;

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    },
    [voiceSupported]
  );

  useEffect(() => {
    if (!voiceEnabled || !voiceSupported) return;

    const lastCopilotMessage = [...messages]
      .reverse()
      .find((message) => message.role === "copilot");

    if (
      !lastCopilotMessage ||
      spokenMessageIdsRef.current.has(lastCopilotMessage.id)
    ) {
      return;
    }

    spokenMessageIdsRef.current.add(lastCopilotMessage.id);
    speakText(lastCopilotMessage.content);
  }, [messages, speakText, voiceEnabled, voiceSupported]);

  useEffect(() => {
    if (!requestedSessionId) {
      setSessionId(null);
      setQuestions([]);
      setAttempts([]);
      setMessages([]);
      setCurrentIndex(0);
      setIsLoading(false);
      setError("");
      setVoiceTranscript("");
      return;
    }

    let ignore = false;

    async function loadSession() {
      setIsLoading(true);
      setError("");

      try {
        const res = await fetch(`/api/session/${requestedSessionId}`);
        const data = await res.json();

        if (!res.ok) {
          if (res.status === 401) {
            window.location.href = `/login?callbackUrl=${encodeURIComponent(
              `/interview?sessionId=${requestedSessionId}`
            )}`;
            return;
          }

          throw new Error(data.error ?? "Failed to load interview");
        }

        if (ignore) return;

        const loadedSession = data.session as InterviewSession;
        const loadedQuestions = (data.questions ?? []) as Question[];
        const rebuilt = buildMessages(loadedSession, loadedQuestions);

        setSessionId(loadedSession.id);
        setSessionTechnology(loadedSession.technology);
        setSelectedTechnology(loadedSession.technology);
        setQuestions(loadedQuestions);
        setAttempts(loadedSession.attempts ?? []);
        setCurrentIndex(rebuilt.currentIndex);
        setMessages(rebuilt.messages);
      } catch (err) {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Failed to load interview"
          );
        }
      } finally {
        if (!ignore) setIsLoading(false);
      }
    }

    loadSession();

    return () => {
      ignore = true;
    };
  }, [requestedSessionId]);

  function stopListening() {
    recognitionRef.current?.stop();
    setIsListening(false);
  }

  function toggleListening() {
    if (!speechSupported) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    const SpeechRecognition = getSpeechRecognition();

    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let index = event.resultIndex ?? 0;
        index < event.results.length;
        index++
      ) {
        const result = event.results[index];

        if (result?.isFinal) {
          transcript = `${transcript} ${result[0]?.transcript ?? ""}`;
        }
      }

      const cleanTranscript = transcript.trim();

      if (!cleanTranscript) return;

      setVoiceTranscript(cleanTranscript);
      setAnswer((prev) =>
        prev.trim() ? `${prev.trim()} ${cleanTranscript}` : cleanTranscript
      );
    };
    recognition.onerror = (event) => {
      setIsListening(false);

      if (event.error && !["aborted", "no-speech"].includes(event.error)) {
        setError("Could not hear you. Check microphone permission and retry.");
      }
    };
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    setError("");

    try {
      recognition.start();
      setIsListening(true);
    } catch {
      setError("Could not start the microphone.");
    }
  }

  function toggleVoice() {
    if (!voiceSupported) {
      setError("Voice output is not supported in this browser.");
      return;
    }

    if (voiceEnabled) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setVoiceEnabled(false);
      return;
    }

    const lastCopilotMessage = [...messages]
      .reverse()
      .find((message) => message.role === "copilot");

    setVoiceEnabled(true);

    if (lastCopilotMessage) {
      spokenMessageIdsRef.current.add(lastCopilotMessage.id);
      speakText(lastCopilotMessage.content);
    }
  }

  function readCurrentPrompt() {
    if (activeQuestion) {
      speakText(questionPrompt(activeQuestion, currentIndex, questions.length));
      return;
    }

    const lastCopilotMessage = [...messages]
      .reverse()
      .find((message) => message.role === "copilot");

    if (lastCopilotMessage) {
      speakText(lastCopilotMessage.content);
    }
  }

  async function startInterview(
    technology: InterviewTechnology = selectedTechnology
  ) {
    stopListening();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    setIsStarting(true);
    setError("");
    setVoiceTranscript("");

    const technologyMeta = getTechnologyMeta(technology);

    try {
      const res = await fetch("/api/session/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: technologyMeta.type,
          technology: technologyMeta.value,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = `/login?callbackUrl=${encodeURIComponent(
            "/interview"
          )}`;
          return;
        }

        throw new Error(data.error ?? "Failed to start interview");
      }

      const newSession: InterviewSession = {
        id: data.id,
        type: data.type,
        technology: data.technology,
        attempts: [],
      };
      const loadedQuestions = (data.questions ?? []) as Question[];
      const rebuilt = buildMessages(newSession, loadedQuestions);

      setSessionId(newSession.id);
      setSessionTechnology(newSession.technology);
      setQuestions(loadedQuestions);
      setAttempts([]);
      setCurrentIndex(rebuilt.currentIndex);
      setMessages(rebuilt.messages);
      router.replace(`/interview?sessionId=${encodeURIComponent(data.id)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start interview");
    } finally {
      setIsStarting(false);
    }
  }

  async function submitAnswer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!sessionId || !activeQuestion || isSubmitting) return;

    stopListening();

    const trimmed = answer.trim();

    if (trimmed.length < 10) {
      setError("Answer must be at least 10 characters.");
      return;
    }

    setError("");
    setAnswer("");
    setVoiceTranscript("");
    setIsSubmitting(true);
    setMessages((prev) => [
      ...prev,
      {
        id: makeId("candidate"),
        role: "candidate",
        content: trimmed,
      },
    ]);

    try {
      const res = await fetch("/api/session/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionId,
          questionId: activeQuestion.id,
          answer: trimmed,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Submission failed");
      }

      const savedAttempt = data as Attempt;
      const nextIndex = currentIndex + 1;
      const nextQuestion = questions[nextIndex];
      const finished = nextIndex >= questions.length;

      setAttempts((prev) => [
        ...prev.filter(
          (attempt) => attempt.questionId !== savedAttempt.questionId
        ),
        savedAttempt,
      ]);
      setCurrentIndex(nextIndex);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId("feedback"),
          role: "copilot",
          content: feedbackMessage(savedAttempt, finished),
        },
        ...(nextQuestion
          ? [
              {
                id: makeId("question"),
                role: "copilot" as const,
                content: questionPrompt(nextQuestion, nextIndex, questions.length),
              },
            ]
          : [
              {
                id: makeId("complete"),
                role: "system" as const,
                content:
                  "Interview complete. Your dashboard will show the saved answers.",
              },
            ]),
      ]);
    } catch (err) {
      setAnswer(trimmed);
      setMessages((prev) => [
        ...prev,
        {
          id: makeId("submit-error"),
          role: "copilot",
          content:
            err instanceof Error ? err.message : "Could not save that answer.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  function askForHint() {
    if (!activeQuestion || isSubmitting) return;

    setMessages((prev) => [
      ...prev,
      {
        id: makeId("hint-request"),
        role: "candidate",
        content: "Can I get a hint?",
      },
      {
        id: makeId("hint"),
        role: "copilot",
        content: hintForQuestion(activeQuestion),
      },
    ]);
  }

  function skipQuestion() {
    if (!activeQuestion || isSubmitting) return;

    const nextIndex = currentIndex + 1;
    const nextQuestion = questions[nextIndex];

    setCurrentIndex(nextIndex);
    setMessages((prev) => [
      ...prev,
      {
        id: makeId("skip"),
        role: "system",
        content: `Skipped question ${currentIndex + 1}.`,
      },
      ...(nextQuestion
        ? [
            {
              id: makeId("question"),
              role: "copilot" as const,
              content: questionPrompt(nextQuestion, nextIndex, questions.length),
            },
          ]
        : [
            {
              id: makeId("complete"),
              role: "system" as const,
              content: "Interview complete. You can start a new one anytime.",
            },
          ]),
    ]);
  }

  function resetInterview() {
    stopListening();
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
    router.replace("/interview");
  }

  if (isLoading) {
    return <LoadingInterview />;
  }

  return (
    <main className="min-h-screen bg-zinc-50 px-4 py-6 text-zinc-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-5">
        <header className="flex flex-col gap-4 border-b border-zinc-200 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-blue-700">
              <Bot className="size-4" />
              Interview Copilot
            </div>
            <h1 className="text-3xl font-bold tracking-normal">
              Live Interview Room
            </h1>
          </div>

          <div className="flex flex-wrap gap-2">
            <select
              value={selectedTechnology}
              onChange={(event) =>
                setSelectedTechnology(
                  event.target.value as InterviewTechnology
                )
              }
              className="h-10 rounded-md border border-zinc-300 bg-white px-3 text-sm font-medium shadow-sm outline-none focus:border-blue-500"
            >
              {interviewTechnologies.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={toggleVoice}
              disabled={!voiceSupported}
              className={`inline-flex h-10 items-center gap-2 rounded-md border px-4 text-sm font-semibold shadow-sm disabled:cursor-not-allowed disabled:opacity-50 ${
                voiceEnabled
                  ? "border-blue-200 bg-blue-50 text-blue-700"
                  : "border-zinc-300 bg-white text-zinc-800"
              }`}
            >
              {voiceEnabled ? (
                <Volume2 className="size-4" />
              ) : (
                <VolumeX className="size-4" />
              )}
              {voiceEnabled ? "Voice on" : "Voice off"}
            </button>

            <button
              type="button"
              onClick={() => startInterview()}
              disabled={isStarting}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isStarting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <ArrowRight className="size-4" />
              )}
              Start
            </button>

            {sessionId && (
              <button
                type="button"
                onClick={resetInterview}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 text-sm font-semibold text-zinc-800 shadow-sm"
              >
                <RotateCcw className="size-4" />
                New
              </button>
            )}
          </div>
        </header>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
            {error}
          </div>
        )}

        {!sessionId ? (
          <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="flex max-w-2xl flex-col gap-4">
              <div className="flex size-11 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <ClipboardList className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">
                  Choose an interview and begin
                </h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">
                  The copilot will ask questions, review answers, and guide the
                  session to completion.
                </p>
              </div>
              <button
                type="button"
                onClick={() => startInterview()}
                disabled={isStarting}
                className="inline-flex h-10 w-fit items-center gap-2 rounded-md bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isStarting ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ArrowRight className="size-4" />
                )}
                Start {selectedTechnologyLabel}
              </button>
            </div>
          </section>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-md border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase text-zinc-500">
                  {sessionTechnologyLabel}
                </p>
                <div className="mt-2 flex items-baseline justify-between gap-3">
                  <h2 className="text-lg font-semibold">Progress</h2>
                  <span className="text-sm font-medium text-zinc-600">
                    {completedCount}/{questions.length}
                  </span>
                </div>
                <div className="mt-3 h-2 rounded-md bg-zinc-100">
                  <div
                    className="h-2 rounded-md bg-blue-600"
                    style={{ width: `${Math.min(progressValue, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-2">
                {questions.map((question, index) => {
                  const answered = attempts.some(
                    (attempt) => attempt.questionId === question.id
                  );
                  const active = index === currentIndex && !isComplete;
                  const skipped = index < currentIndex && !answered;

                  return (
                    <div
                      key={question.id}
                      className={`rounded-md border p-3 ${
                        active
                          ? "border-blue-300 bg-blue-50"
                          : "border-zinc-200 bg-white"
                      }`}
                    >
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-zinc-500">
                          Q{index + 1}
                        </span>
                        {answered ? (
                          <CheckCircle2 className="size-4 text-emerald-600" />
                        ) : (
                          <span className="text-xs font-medium text-zinc-500">
                            {skipped ? "Skipped" : active ? "Active" : "Queued"}
                          </span>
                        )}
                      </div>
                      <p className="line-clamp-3 text-sm leading-5 text-zinc-700">
                        {question.content}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="rounded-md border border-blue-200 bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {getTechnologyMeta(question.technology).label}
                        </span>
                        <span
                          className={`rounded-md border px-2 py-1 text-xs font-semibold ${difficultyClass[question.difficulty]}`}
                        >
                          {question.difficulty}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </aside>

            <section className="flex min-h-[620px] flex-col rounded-md border border-zinc-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-3 border-b border-zinc-200 px-4 py-3">
                <div>
                  <h2 className="font-semibold">Copilot Chat</h2>
                  <p className="text-sm text-zinc-500">
                    {isComplete
                      ? "Interview complete"
                      : activeQuestion
                        ? `Question ${currentIndex + 1} of ${questions.length}`
                        : "Waiting for questions"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  {activeQuestion && (
                    <button
                      type="button"
                      onClick={readCurrentPrompt}
                      disabled={!voiceSupported}
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Volume2 className="size-4" />
                      {isSpeaking ? "Reading" : "Read"}
                    </button>
                  )}

                  {activeQuestion && (
                    <span
                      className={`rounded-md border px-2 py-1 text-xs font-semibold ${difficultyClass[activeQuestion.difficulty]}`}
                    >
                      {activeQuestion.difficulty}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto px-4 py-5">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === "candidate"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    {message.role !== "candidate" && (
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                        <Bot className="size-4" />
                      </div>
                    )}

                    <div
                      className={`max-w-[82%] whitespace-pre-line rounded-md px-4 py-3 text-sm leading-6 ${
                        message.role === "candidate"
                          ? "bg-zinc-900 text-white"
                          : message.role === "system"
                            ? "border border-zinc-200 bg-zinc-50 text-zinc-700"
                            : "bg-blue-50 text-zinc-900"
                      }`}
                    >
                      {message.content}
                    </div>

                    {message.role === "candidate" && (
                      <div className="mt-1 flex size-8 shrink-0 items-center justify-center rounded-md bg-zinc-100 text-zinc-700">
                        <UserRound className="size-4" />
                      </div>
                    )}
                  </div>
                ))}

                {isSubmitting && (
                  <div className="flex items-center gap-3 text-sm font-medium text-zinc-500">
                    <Loader2 className="size-4 animate-spin text-blue-600" />
                    Reviewing answer...
                  </div>
                )}

                <div ref={bottomRef} />
              </div>

              <form
                onSubmit={submitAnswer}
                className="border-t border-zinc-200 p-4"
              >
                <textarea
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  disabled={!activeQuestion || isSubmitting || isComplete}
                  placeholder={
                    isComplete
                      ? "Interview complete"
                      : "Speak or write your answer..."
                  }
                  className="min-h-28 w-full resize-none rounded-md border border-zinc-300 bg-white p-3 text-sm leading-6 outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:bg-zinc-50"
                />

                {voiceTranscript && (
                  <p className="mt-2 rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-medium text-blue-800">
                    Recognized voice: {voiceTranscript}. The bot will validate
                    this transcript when you submit.
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={toggleListening}
                      disabled={
                        !speechSupported ||
                        !activeQuestion ||
                        isSubmitting ||
                        isComplete
                      }
                      className={`inline-flex h-10 items-center gap-2 rounded-md border px-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                        isListening
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-blue-200 bg-blue-50 text-blue-700"
                      }`}
                    >
                      {isListening ? (
                        <MicOff className="size-4" />
                      ) : (
                        <Mic className="size-4" />
                      )}
                      {isListening ? "Stop" : "Speak"}
                    </button>

                    <button
                      type="button"
                      onClick={askForHint}
                      disabled={!activeQuestion || isSubmitting || isComplete}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 text-sm font-semibold text-amber-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Lightbulb className="size-4" />
                      Hint
                    </button>

                    <button
                      type="button"
                      onClick={skipQuestion}
                      disabled={!activeQuestion || isSubmitting || isComplete}
                      className="inline-flex h-10 items-center gap-2 rounded-md border border-zinc-300 bg-white px-3 text-sm font-semibold text-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ArrowRight className="size-4" />
                      Skip
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={!activeQuestion || isSubmitting || isComplete}
                    className="inline-flex h-10 items-center gap-2 rounded-md bg-zinc-900 px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Send className="size-4" />
                    )}
                    Submit
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
