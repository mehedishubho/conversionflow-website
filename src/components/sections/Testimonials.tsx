"use client";

import { useT } from "@/lib/useT";
import { testimonials } from "@/data/testimonials";
import { StaggerReveal, StaggerItem } from "@/components/layout/StaggerReveal";

export function Testimonials() {
  const t = useT();

  return (
    <section className="sec sec-bg">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">{t.testimonials.eyebrow}</div>
          <div className="sec-title">{t.testimonials.title}</div>
        </div>
        <StaggerReveal className="tgrid">
          {testimonials.map((item) => (
            <StaggerItem key={item.name} className="tcard">
              <div className="stars">{item.stars}</div>
              <div className="tquote">&quot;{item.quote}&quot;</div>
              <div className="tauthor">
                <div className={`tav ${item.avatarColor}`}>{item.initials}</div>
                <div>
                  <div className="tname">{item.name}</div>
                  <div className="tstore">{item.store}</div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
