"use client";

import { useLayoutEffect, useRef } from "react";

export type PresentationStepItem = {
  key: string;
  title?: string;
  body: string;
};

type PresentationStepCardsProps = {
  items: PresentationStepItem[];
};

export default function PresentationStepCards({ items }: PresentationStepCardsProps) {
  const topRowRef = useRef<HTMLDivElement>(null);
  const thirdCardRef = useRef<HTMLElement>(null);
  const third = items[2];

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

  function renderCard(item: PresentationStepItem) {
    if (item.title) {
      return (
        <>
          <h2 className="text-base font-semibold">{item.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{item.body}</p>
        </>
      );
    }

    return (
      <p className="text-sm leading-relaxed text-[var(--foreground)]">{item.body}</p>
    );
  }

  if (!third) return null;

  return (
    <div className="content-block flex flex-col gap-4">
      <div ref={topRowRef} className="content-grid">
        {items.slice(0, 2).map((item) => (
          <article key={item.key} className="content-card">
            {renderCard(item)}
          </article>
        ))}
      </div>
      <article
        ref={thirdCardRef}
        className="content-card content-card--step-centered box-border overflow-hidden"
      >
        {renderCard(third)}
      </article>
    </div>
  );
}
