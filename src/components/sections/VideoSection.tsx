export function VideoSection() {
  return (
    <div className="video-sec">
      <div className="max-w-[1160px] mx-auto px-7">
        <div className="text-center mb-4">
          <div className="vs-label">Watch it in action</div>
          <div className="vs-title">See WooBooster Transform Your Store</div>
          <div className="vs-sub">
            A 3-minute overview of every module — no fluff, just results.
          </div>
        </div>
        <div className="video-player">
          <div className="video-thumb">
            <div className="vt-grid" />
            <div className="vt-ui">
              <div className="vt-ui-bar">
                <div
                  className="vt-ui-dot"
                  style={{ background: "#FF5F57" }}
                />
                <div
                  className="vt-ui-dot"
                  style={{ background: "#FFBD2E" }}
                />
                <div
                  className="vt-ui-dot"
                  style={{ background: "#28C840" }}
                />
              </div>
              <div className="vt-ui-body">
                <div className="vt-card">
                  <div className="vt-card-num">834</div>
                  <div className="vt-card-lbl">Orders Synced</div>
                </div>
                <div className="vt-card">
                  <div className="vt-card-num">৳4.2L</div>
                  <div className="vt-card-lbl">Revenue</div>
                </div>
                <div className="vt-card">
                  <div className="vt-card-num">12</div>
                  <div className="vt-card-lbl">Fraud Blocked</div>
                </div>
              </div>
            </div>
            <div className="play-btn">
              <div className="play-ring" />
              <div className="play-ring" />
              <div className="play-ring" />
              <div className="play-inner" />
            </div>
          </div>
        </div>
        <div className="video-caption">
          ▶ WooBooster Full Overview — 3 min · See how 500+ BD stores use it
        </div>
      </div>
    </div>
  );
}
