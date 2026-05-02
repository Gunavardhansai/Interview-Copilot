// src/modules/interview/components/AnswerList.tsx

type AnswerListAttempt = {
  id: string;
  answer: string;
  feedback?: string | null;
};

export default function AnswerList({
  attempts,
}: {
  attempts: AnswerListAttempt[];
}) {
  return (
    <div className="mt-6">
      {attempts.map((a) => (
        <div key={a.id} className="border p-3 mt-2">
          <p>{a.answer}</p>
          <p className="text-sm">{a.feedback}</p>
        </div>
      ))}
    </div>
  );
}
