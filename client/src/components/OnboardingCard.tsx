import React from 'react';

/**
 * The card every onboarding beat is drawn on — the brand, the question, and whatever answers it.
 *
 * ONE CHROME. The scrim, card, brand and question markup lives here rather than inside the screen
 * that uses it, so a second onboarding beat cannot grow its own copy (PLAN-016's end-gate review
 * found exactly that). It is modelled on <Login>'s card, because this is the screen that stands
 * where the login screen stands on a fresh install.
 *
 * BOB GAP (PLAN-002 rule): Bob has no alpha step for these, so they keep their values:
 * gray-3 (#0f1014) at 34/78/96% in the scrim, gray-7 (#13141a) at 62% in the card, white at
 * 10% in the border, black at 75% in the shadow. The brand's text shadow is --black-a55.
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
      className="fixed inset-0 z-400 flex items-center justify-center bg-app bg-[image:radial-gradient(130%_100%_at_50%_38%,rgba(15,16,20,0.34),rgba(15,16,20,0.78)_62%,rgba(15,16,20,0.96)_100%),url(/turtle-bg.jpg)] bg-cover bg-center bg-no-repeat font-sans"
      data-tt={tag}
    >
      <div className="w-[min(520px,92vw)] rounded-xl border border-[rgba(255,255,255,0.1)] bg-[rgba(19,20,26,0.62)] px-6.5 pt-7.5 pb-6 shadow-[0_28px_64px_-22px_rgba(0,0,0,0.75)] backdrop-blur-lg backdrop-saturate-115">
        <div className="mb-4.5 flex items-center justify-center">
          <span className="text-doc font-bold tracking-heading text-primary [text-shadow:0_1px_10px_var(--black-a55)]">
            Makron
          </span>
        </div>
        <p className="mb-5 text-center text-prose font-semibold text-primary">{question}</p>
        {children}
      </div>
    </div>
  );
}
