const gradients = [
  "linear-gradient(135deg, var(--accent-light) 0%, var(--accent-glow) 100%)",
  "linear-gradient(135deg, var(--green-lt) 0%, var(--accent-light) 100%)",
  "linear-gradient(135deg, var(--orange-lt) 0%, var(--green-lt) 100%)",
];

export function GradientThumbnail({ variant }: { variant: number }) {
  return (
    <div
      className="aspect-video overflow-hidden rounded-[10px] border border-[--border] relative"
      style={{ background: gradients[variant % gradients.length] }}
    >
      <div className="absolute inset-0 opacity-[0.08] bg-[linear-gradient(var(--accent)_1px,transparent_1px),linear-gradient(90deg,var(--accent)_1px,transparent_1px)] bg-[length:22px_22px]" />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-syne text-[28px] font-black text-foreground opacity-20">
          WB
        </span>
      </div>
    </div>
  );
}
