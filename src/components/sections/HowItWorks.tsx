export function HowItWorks() {
  return (
    <section className="sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh center">
          <div className="eyebrow">Getting Started</div>
          <div className="sec-title">Up and Running in 10 Minutes</div>
          <p className="sec-sub">
            No developer needed. Install, activate, and WooBooster handles
            everything automatically.
          </p>
        </div>
        <div className="steps-grid">
          <div className="step-card">
            <div className="step-n">01</div>
            <div className="step-t">Install &amp; Activate License</div>
            <div className="step-d">
              Upload the plugin, activate, enter your license key from the
              purchase email. Done in under 2 minutes.
            </div>
          </div>
          <div className="step-card">
            <div className="step-n">02</div>
            <div className="step-t">Connect Couriers &amp; Pixels</div>
            <div className="step-d">
              Paste your Steadfast / Pathao / RedX API keys and Meta Pixel ID +
              CAPI token. Simple copy-paste.
            </div>
          </div>
          <div className="step-card">
            <div className="step-n">03</div>
            <div className="step-t">Watch It Run on Autopilot</div>
            <div className="step-d">
              WooBooster polls couriers, updates statuses, fires tracking
              events, and blocks fraud — 24/7, automatically.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
