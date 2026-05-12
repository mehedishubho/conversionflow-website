interface LegalLayoutProps {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export function LegalLayout({ title, lastUpdated, children }: LegalLayoutProps) {
  return (
    <main className="max-w-[800px] mx-auto px-7 py-16">
      <h1 className="sec-title" style={{ fontSize: "clamp(28px, 3.5vw, 44px)" }}>
        {title}
      </h1>
      <p className="text-muted text-sm mt-2">Last updated: {lastUpdated}</p>
      <div className="prose dark:prose-invert max-w-none mt-10">{children}</div>
    </main>
  );
}
