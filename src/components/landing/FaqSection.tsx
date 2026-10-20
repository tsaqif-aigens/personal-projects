import { useTranslations } from 'next-intl';

const QUESTIONS = [
  { question: 'faq_q1', answer: 'faq_a1' },
  { question: 'faq_q2', answer: 'faq_a2' },
  { question: 'faq_q3', answer: 'faq_a3' },
  { question: 'faq_q4', answer: 'faq_a4' },
  { question: 'faq_q5', answer: 'faq_a5' },
] as const;

export const FaqSection = () => {
  const t = useTranslations('Index');

  return (
    <div className="space-y-4">
      {QUESTIONS.map(({ question, answer }) => (
        <details
          key={question}
          className="group rounded-xl border border-border bg-surface p-5 shadow-card"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground [&::-webkit-details-marker]:hidden">
            {t(question)}
            <span
              aria-hidden
              className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45"
            >
              +
            </span>
          </summary>
          <p className="mt-3 text-muted-foreground">{t(answer)}</p>
        </details>
      ))}
    </div>
  );
};
