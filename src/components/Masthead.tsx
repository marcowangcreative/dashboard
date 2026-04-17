export default function Masthead() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "short",
    month:   "short",
    day:     "numeric",
    year:    "numeric",
  });

  return (
    <header className="flex items-baseline justify-between gap-6 pb-6 border-b border-paper-edge mb-12 max-sm:flex-col max-sm:items-start max-sm:gap-1">
      <h1
        className="font-display text-[clamp(40px,6.5vw,80px)] leading-[0.95] tracking-[-0.028em] font-[440] text-ink m-0"
        style={{ fontVariationSettings: '"opsz" 144, "SOFT" 20' }}
      >
        Wang{" "}
        <em
          className="italic font-[380] text-accent"
          style={{ fontVariationSettings: '"opsz" 144, "SOFT" 80' }}
        >
          Work
        </em>{" "}
        Brain
      </h1>
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-ink-faint whitespace-nowrap">
        {today}
      </div>
    </header>
  );
}
