type HomeSidebarProps = {
  subjectCount: number;
  sessionCount: number;
  clashCount: number;
};

export function HomeSidebar({
  subjectCount,
  sessionCount,
  clashCount,
}: HomeSidebarProps) {
  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-[0_20px_45px_rgba(15,23,42,0.07)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">
          Snapshot
        </p>
        <p className="mt-3 text-3xl font-black tracking-tight text-slate-900">
          {subjectCount}
        </p>
        <p className="text-sm text-slate-500">
          subject{subjectCount !== 1 ? "s" : ""} in your current build
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-100 p-3">
            <p className="text-xl font-bold text-slate-900">{sessionCount}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Sessions
            </p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-3">
            <p className="text-xl font-bold text-slate-900">{clashCount}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">
              Clashes
            </p>
          </div>
        </div>
    </div>
  );
}
