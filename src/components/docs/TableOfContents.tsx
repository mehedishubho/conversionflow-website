"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function TableOfContents() {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const elements = Array.from(
        document.querySelectorAll<HTMLHeadingElement>("article.prose h2[id], article.prose h3[id]")
      );

      setHeadings(
        elements.map((element) => ({
          id: element.id,
          text: element.textContent || "",
          level: Number.parseInt(element.tagName[1], 10),
        }))
      );
    });

    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible?.target.id) {
          setActiveId(visible.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px" }
    );

    headings.forEach((heading) => {
      const element = document.getElementById(heading.id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav className="hidden xl:block float-right w-52 ml-10 mb-8 border-l border-[--border] pl-4">
      <div className="font-syne text-[11px] font-extrabold uppercase tracking-[1.3px] text-muted mb-3">
        On This Page
      </div>
      {headings.map((heading) => (
        <a
          key={heading.id}
          href={`#${heading.id}`}
          className={cn(
            "text-[13px] font-semibold text-muted transition-colors duration-150 hover:text-text2 block py-0.5",
            heading.level === 3 && "pl-4",
            activeId === heading.id && "text-accent font-bold"
          )}
        >
          {heading.text}
        </a>
      ))}
    </nav>
  );
}
