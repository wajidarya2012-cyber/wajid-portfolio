import { prisma }  from "@/lib/prisma";

const ACTION_COLOR: Record<string, string> = {
  CREATE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  UPDATE: "text-blue-400    bg-blue-500/10    border-blue-500/25",
  DELETE: "text-red-400     bg-red-500/10     border-red-500/25",
  UPLOAD: "text-purple-400  bg-purple-500/10  border-purple-500/25",
  LOGIN:  "text-yellow-400  bg-yellow-500/10  border-yellow-500/25",
  LOGOUT: "text-slate-400   bg-slate-500/10   border-slate-500/25",
};

export default async function ActivityLogPage({ searchParams }: { searchParams: { page?: string } }) {
  const page  = Math.max(1, parseInt(searchParams.page ?? "1"));
  const limit = 30;

  const [logs, total] = await prisma.$transaction([
    prisma.activityLog.findMany({
      include: { user: { select: { name: true, email: true } } },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * limit,
      take:    limit,
    }),
    prisma.activityLog.count(),
  ]);

  const pages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="font-display text-2xl font-bold">Activity Log</h1>
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Read-only immutable audit trail · {total} entries</p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              {["Action", "Description", "Entity", "User", "IP", "Time"].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-muted)" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} className="border-b hover:bg-white/[0.02] transition-colors" style={{ borderColor: "var(--border)" }}>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold font-code px-2 py-1 rounded border ${ACTION_COLOR[log.action] ?? "text-slate-400"}`}>
                    {log.action}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs max-w-[240px]">
                  <p className="truncate">{log.description}</p>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs font-code" style={{ color: "var(--text-muted)" }}>{log.entity}</span>
                </td>
                <td className="px-4 py-3 text-xs" style={{ color: "var(--text-secondary)" }}>
                  {log.user.name ?? log.user.email}
                </td>
                <td className="px-4 py-3 text-xs font-code" style={{ color: "var(--text-muted)" }}>
                  {log.ipAddress ?? "—"}
                </td>
                <td className="px-4 py-3 text-xs whitespace-nowrap" style={{ color: "var(--text-muted)" }}>
                  {new Date(log.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No activity yet.</td></tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t" style={{ borderColor: "var(--border)" }}>
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <a
                key={p}
                href={`/admin/activity-log?page=${p}`}
                className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-medium transition-all ${
                  p === page ? "bg-primary-600 text-white" : "border hover:border-primary-500 hover:text-white"
                }`}
                style={{ borderColor: p !== page ? "var(--border)" : undefined, color: p !== page ? "var(--text-secondary)" : undefined }}
              >
                {p}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
