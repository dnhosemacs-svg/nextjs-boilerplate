"use client";

import { useLayoutEffect, useRef } from "react";

type Step = {
  title: string;
  detail: string;
};

type InfoStepsCardsProps = {
  steps: Step[];
};

export default function InfoStepsCards({ steps }: InfoStepsCardsProps) {
  const topRowRef = useRef<HTMLDivElement>(null);
  const thirdCardRef = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const topRow = topRowRef.current;
    const thirdCard = thirdCardRef.current;
    if (!topRow || !thirdCard) return;

    const syncHeight = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        thirdCard.style.height = `${topRow.getBoundingClientRect().height}px`;
      } else {
        thirdCard.style.height = "";
      }
    };

    syncHeight();

    const observer = new ResizeObserver(syncHeight);
    observer.observe(topRow);

    const media = window.matchMedia("(min-width: 768px)");
    media.addEventListener("change", syncHeight);

    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncHeight);
    };
  }, []);

  return (
    <div className="content-block flex flex-col gap-4">
      <div ref={topRowRef} className="content-grid">
        {steps.slice(0, 2).map((step) => (
          <article key={step.title} className="content-card">
            <h2 className="text-base font-semibold">{step.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{step.detail}</p>
          </article>
        ))}
      </div>
      <article
        ref={thirdCardRef}
        className="content-card content-card--step-centered box-border overflow-hidden"
      >
        <h2 className="text-base font-semibold">{steps[2].title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{steps[2].detail}</p>
      </article>
    </div>
  );
}
