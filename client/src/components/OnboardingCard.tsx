import React from 'react';

/**
 * The card every onboarding beat is drawn on — the brand, the question, and whatever answers it.
 *
 * ONE CHROME. The scrim, card, brand and question markup lives here rather than inside the screen
 * that uses it, so a second onboarding beat cannot grow its own copy (PLAN-016's end-gate review
 * found exactly that). It is modelled on <Login>'s card, because this is the screen that stands
 * where the login screen stands on a fresh install.
 *
 * See-through colours are Bob colours with Tailwind's opacity modifier (DD-038): gray-3 at
 * 34/78/96% in the scrim, gray-7 at 62% in the card, white at 10% in the border. The scrim is a
 * ::before layer under the card (isolate, -z-10), over the turtle picture.
 * The card's shadow is Bob's shadow-panel. BOB GAP (PLAN-002 rule): the brand's text shadow has
 * no Bob class, so it keeps its value.
 * The card's width, min(520px, 92vw), and the turtle picture are this screen's own layout and art.
 */
export function OnboardingCard({
  question,
  tag,
  children,
}: {
  question: string;
  /** the `data-tt` anchor for this beat — the tests locate a step by which card is on screen */
  tag: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 isolate z-400 flex items-center justify-center bg-app bg-[url(/turtle-bg.jpg)] bg-cover bg-center bg-no-repeat font-sans before:absolute before:inset-0 before:-z-10 before:bg-radial-[130%_100%_at_50%_38%] before:from-gray-3/34 before:via-gray-3/78 before:via-62% before:to-gray-3/96 before:to-100%"
      data-tt={tag}
    >
      <div className="w-[min(520px,92vw)] rounded-xl border border-white/10 bg-gray-7/62 px-6.5 pt-7.5 pb-6 shadow-panel backdrop-blur-lg backdrop-saturate-115">
        <div className="mb-4.5 flex items-center justify-center">
          <span className="text-display text-primary [text-shadow:0_1px_10px_var(--black-a55)]">Makron</span>
        </div>
        <p className="mb-5 text-center text-heading text-primary">{question}</p>
        {children}
      </div>
    </div>
  );
}
