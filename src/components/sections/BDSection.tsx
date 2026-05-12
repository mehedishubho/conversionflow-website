export function BDSection() {
  return (
    <section className="sec sec-bg">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="sh">
          <div className="eyebrow">🇧🇩 Built for Bangladesh</div>
          <div className="sec-title">
            The Only WooCommerce Plugin
            <br />
            Built for BD Sellers
          </div>
          <p className="sec-sub">
            Deep native integration with Bangladesh&apos;s top 3 courier
            services. Auto-synced, auto-updated — no manual dashboard checking
            ever again.
          </p>
        </div>
        <div className="bd-layout">
          <div>
            <h3
              className="font-syne text-[22px] font-black text-foreground tracking-[-0.5px] mb-2.5"
            >
              Automated Order Flow
            </h3>
            <p className="text-sm text-text2 leading-[1.8] mb-5">
              Stop checking courier dashboards manually 10 times a day.
              WooBooster polls all three in the background and updates
              WooCommerce automatically.
            </p>
            <div className="flow">
              <span className="sn sn-p">Pending</span>
              <span className="arrow-ch">→</span>
              <span className="sn sn-s">Shipped</span>
              <span className="arrow-ch">→</span>
              <span className="sn sn-d">Delivered</span>
              <span className="arrow-ch">/</span>
              <span className="sn sn-r">Returned</span>
            </div>
            <ul className="checks">
              <li>
                <div className="ck">✓</div>
                Background polling every hour — zero server load
              </li>
              <li>
                <div className="ck">✓</div>
                Automatic WooCommerce status transitions
              </li>
              <li>
                <div className="ck">✓</div>
                Meta CAPI fires OrderDelivered &amp; OrderReturned
              </li>
              <li>
                <div className="ck">✓</div>
                One-click manual sync from order list
              </li>
              <li>
                <div className="ck">✓</div>
                Per-courier API key management from WP admin
              </li>
            </ul>
          </div>
          <div className="courier-cards">
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">📦</div>
                <div>
                  <div className="cc-name">Steadfast Courier</div>
                  <div className="cc-sub">834 orders synced today</div>
                </div>
              </div>
              <div className="live-chip">
                <div className="live-d" />
                Live
              </div>
            </div>
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">🛵</div>
                <div>
                  <div className="cc-name">Pathao Courier</div>
                  <div className="cc-sub">421 orders synced today</div>
                </div>
              </div>
              <div className="live-chip">
                <div className="live-d" />
                Live
              </div>
            </div>
            <div className="cc">
              <div className="cc-l">
                <div className="cc-icon">🔴</div>
                <div>
                  <div className="cc-name">RedX Courier</div>
                  <div className="cc-sub">198 orders synced today</div>
                </div>
              </div>
              <div className="live-chip">
                <div className="live-d" />
                Live
              </div>
            </div>
            <div className="bd-pay-note">
              <strong>🏦 bKash · Nagad · Bank Transfer</strong>
              <p>
                Pay in BDT. Invoices in Taka. Dedicated BD support line.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
