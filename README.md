# Interview Copilot

Interview Copilot is an AI-powered mock interview platform for developers preparing for technical interviews. It gives candidates a realistic practice room, captures typed or spoken answers, evaluates responses with AI, and turns attempts into feedback and performance insights.

## Motive

Technical interview preparation is hard to do alone. Candidates often need realistic questions, a structured interview flow, quick feedback, and a way to see where they are improving. Interview Copilot is built to close that gap by simulating a focused interviewer that asks questions, reviews answers, and highlights next steps.

## Problem

Candidates struggle with:

- Finding realistic interview questions for their target technology.
- Practicing in a timed, conversational flow instead of only reading notes.
- Getting useful feedback on correctness, missing concepts, and answer quality.
- Tracking performance across sessions.

## Users

The primary users are developers preparing for software engineering interviews, especially candidates practicing DSA, frontend, backend, SQL, system design, and behavioral questions.

## Core Features

- User registration and login with NextAuth credentials.
- Technology-specific mock interview sessions.
- Seeded question bank for JavaScript, TypeScript, React, Next.js, Node.js, Python, Java, SQL, System Design, and Behavioral interviews.
- Live interview room with one question at a time.
- Typed answer submission.
- Browser speech recognition for voice answers when supported.
- Browser speech synthesis for reading prompts aloud when supported.
- AI answer feedback with a local fallback when `OPENAI_API_KEY` is not configured.
- Scores and saved attempts per session.
- Dashboard with recent answers and AI-generated insights.
- Basic rate limiting, input sanitization, RBAC helper, and security headers.

## Tech Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- Prisma 7
- PostgreSQL
- NextAuth
- OpenAI SDK
- Jest

## Project Structure

```text
src/app                         App Router pages and route handlers
src/app/interview/page.tsx       Live interview room
src/app/dashboard/page.tsx       User dashboard
src/app/api/session              Session start, load, and answer submit APIs
src/app/api/auth                 Register and NextAuth routes
src/modules/interview            Interview schemas, technologies, services, UI
src/modules/ai                   AI evaluation and insight services
src/lib                          Auth, RBAC, rate limit, sanitize, CSRF helpers
src/db/prisma.ts                 Prisma client setup
prisma/schema.prisma             Database schema
prisma/seed.ts                   Initial interview question data
```

## Environment Variables

Create a `.env` file in the project root.

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
NEXTAUTH_SECRET="replace-with-a-long-random-secret"
NEXTAUTH_URL="http://localhost:3000"
OPENAI_API_KEY="optional-openai-api-key"
```

Notes:

- `DATABASE_URL` is required.
- `NEXTAUTH_SECRET` is required for authentication.
- `NEXTAUTH_URL` should match your local or deployed app URL.
- `OPENAI_API_KEY` is optional. Without it, answer evaluation uses the built-in fallback feedback.

## Setup From Start To End

1. Install dependencies.

```bash
npm install
```

2. Generate Prisma Client.

```bash
npm run prisma:generate
```

3. Push the Prisma schema to the database.

```bash
npm run db:push
```

4. Seed interview questions.

```bash
npm run db:seed
```

5. Start the development server.

```bash
npm run dev
```

6. Open the app.

```text
http://localhost:3000
```

You can also run the full local setup in one command after `.env` is ready:

```bash
npm run setup
```

## How To Use

1. Register a user at `/register`.
2. Login at `/login`.
3. Open `/interview`.
4. Choose a technology.
5. Start an interview session.
6. Answer each question by typing or using voice input.
7. Submit the answer to receive feedback.
8. Review saved attempts and insights on `/dashboard`.

## Available Scripts

```bash
npm run dev              Generate Prisma Client and start Next.js dev server
npm run build            Generate Prisma Client and create production build
npm run start            Start the production server after build
npm run test             Run Jest tests
npm run lint             Run ESLint
npm run format           Format the project with Prettier
npm run prisma:generate  Generate Prisma Client
npm run db:push          Sync Prisma schema with the database
npm run db:seed          Seed interview questions
npm run setup            Generate client, push schema, and seed data
```

## Build For Production

```bash
npm run build
npm run start
```

The production build runs `prisma generate` first so the generated client matches `prisma/schema.prisma`.

## Testing

```bash
npm run test
```

Current tests cover sanitization, rate limiting, registration, and the questions API.

## Troubleshooting

### Failed to create session

If starting an interview shows `Failed to create session`, the most common cause is a stale Prisma Client or a database schema that has not been synced after adding fields such as `technology`.

Run:

```bash
npm run prisma:generate
npm run db:push
```

Then restart the dev server:

```bash
npm run dev
```

### No questions appear

Seed the database:

```bash
npm run db:seed
```

### AI insights fail

Check `OPENAI_API_KEY`. The interview answer evaluator has a fallback, but dashboard insights call the OpenAI API when attempts exist.

## Implementation Notes

- Next.js 16 route handlers use Web `Request` and `Response` APIs.
- Dynamic route params are promises in current App Router conventions.
- Pages are Server Components by default. Interactive pages such as the interview room use Client Components.
- The question bank is stored in Postgres and seeded from `prisma/seed.ts`.
- Session ownership is checked before loading sessions or saving attempts.
