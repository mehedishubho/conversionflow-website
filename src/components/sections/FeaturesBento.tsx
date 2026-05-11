import { featureModules } from "@/data/features";

export function FeaturesBento() {
  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">Everything You Need</div>
          <div className="sec-title">6 Powerful Modules. One Plugin.</div>
          <p className="sec-sub">
            WooBooster replaces 6 separate tools with one seamlessly integrated
            plugin built specifically for Bangladeshi WooCommerce stores.
          </p>
        </div>
        <div className="bento">
          {featureModules.map((module, index) => (
            <div key={module.title} className={`bc${index === 0 ? " w2" : ""}`}>
              <div className="bc-icon">{module.icon}</div>
              <div className="bc-title">{module.title}</div>
              <div className="bc-desc">{module.description}</div>
              <div className="tags">
                {module.tags.map((tag) => (
                  <span key={tag.label} className="tag">{tag.label}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
