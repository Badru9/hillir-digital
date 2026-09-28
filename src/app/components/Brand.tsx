export default function Brand({ className }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className ?? ""}`}>
      <span className="brand-gradient flex h-10 w-10 items-center justify-center rounded-2xl text-white shadow-lg shadow-brand/30">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M3 17l6-6 4 4 7-7" />
          <path d="M14 8h7v7" />
        </svg>
      </span>
      <span className="text-lg font-bold text-slate-900">
        AdForecast <span className="brand-text-gradient">Pro</span>
      </span>
    </div>
  );
}
