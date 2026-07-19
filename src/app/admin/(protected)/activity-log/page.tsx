import { prisma } from "@/lib/prisma";
import ActivityLogTable from "./ActivityLogTable";

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
        <p className="text-sm mt-0.5" style={{ color: "var(--text-muted)" }}>Audit trail of admin actions.</p>
      </div>

      <ActivityLogTable logs={logs} total={total} />

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
  );
}
