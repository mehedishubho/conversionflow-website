import { testimonials } from "@/data/testimonials";

export function Testimonials() {
  return (
    <section className="sec sec-bg">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">Real Store Owners</div>
          <div className="sec-title">Loved by BD WooCommerce Sellers</div>
        </div>
        <div className="tgrid">
          {testimonials.map((t) => (
            <div key={t.name} className="tcard">
              <div className="stars">{t.stars}</div>
              <div className="tquote">
                &quot;{t.quote}&quot;
              </div>
              <div className="tauthor">
                <div className={`tav ${t.avatarColor}`}>{t.initials}</div>
                <div>
                  <div className="tname">{t.name}</div>
                  <div className="tstore">{t.store}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
