import { prisma }     from "@/lib/prisma";
import Link            from "next/link";
import MessagesClient  from "./MessagesClient";

export default async function MessagesPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams.status as "NEW" | "READ" | "REPLIED" | "ARCHIVED" | undefined;

  const [messages, counts] = await Promise.all([
    prisma.contactMessage.findMany({
      where:   statusFilter ? { status: statusFilter } : {},
      orderBy: { createdAt: "desc" },
      take:    50,
    }),
    prisma.contactMessage.groupBy({
      by:     ["status"],
      _count: { id: true },
    }),
  ]);

  const countMap = counts.reduce<Record<string, number>>((acc, c) => {
    acc[c.status] = c._count.id;
    return acc;
  }, {});

  const TABS = [
    { label: "All",      value: undefined  },
    { label: "New",      value: "NEW"      },
    { label: "Read",     value: "READ"     },
    { label: "Replied",  value: "REPLIED"  },
    { label: "Archived", value: "ARCHIVED" },
  ];

  return (
    <div style={{ maxWidth: "1100px", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <h1 style={{ fontFamily: "var(--font-syne)", fontSize: "1.4rem", fontWeight: 800 }}>Messages</h1>

      {/* Status tabs */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
        {TABS.map(({ label, value }) => {
          const active = statusFilter === value;
          const count  = value ? (countMap[value] ?? 0) : Object.values(countMap).reduce((a, b) => a + b, 0);
          return (
            <Link
              key={label}
              href={value ? `/admin/messages?status=${value}` : "/admin/messages"}
              style={{
                textDecoration: "none",
                padding: "0.4rem 1.1rem",
                borderRadius: "9999px",
                fontSize: "0.82rem",
                fontWeight: 600,
                border: "1px solid",
                borderColor: active ? "#4f46e5" : "var(--border)",
                background:  active ? "#4f46e5" : "var(--bg-card)",
                color:       active ? "#fff"    : "var(--text-secondary)",
                transition:  "all 0.2s",
              }}
            >
              {label} {count > 0 && <span style={{ opacity: 0.75 }}>({count})</span>}
            </Link>
          );
        })}
      </div>

      <MessagesClient messages={messages} />
    </div>
  );
}
