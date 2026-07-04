import { prisma } from "@/lib/prisma";
import Link from "next/link";
import DashboardStatsGrid from "./DashboardStatsGrid";

const G = "linear-gradient(135deg,#4f46e5,#06b6d4)";

async function getStats() {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // groupBy cannot run inside $transaction — run it separately
  const sessionsResult = await prisma.visitorAnalytics.groupBy({
    by: ["sessionId"],
    where: { createdAt: { gte: since30 } },
  });
  const sessions = sessionsResult.length;

  const [
    pageViews,
    cvDownloads,
    newMessages,
    totalProjects,
    publishedPosts,
    galleryCount,
    recentMessages,
    recentLogs,
  ] = await prisma.$transaction([
    prisma.visitorAnalytics.count({
      where: { event: "PAGE_VIEW", createdAt: { gte: since30 } },
    }),
    prisma.visitorAnalytics.count({
      where: { event: "CV_DOWNLOAD", createdAt: { gte: since30 } },
    }),
    prisma.contactMessage.count({ where: { status: "NEW" } }),
    prisma.project.count({ where: { status: "ACTIVE" } }),
    prisma.blogPost.count({ where: { status: "PUBLISHED" } }),
    prisma.galleryItem.count(),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.activityLog.findMany({
      include: { user: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    pageViews,
    sessions,
    cvDownloads,
    newMessages,
    totalProjects,
    publishedPosts,
    galleryCount,
    recentMessages,
    recentLogs,
  };
}

const ACTION_COLOR: Record<string, string> = {
  CREATE: "#34d399",
  UPDATE: "#60a5fa",
  DELETE: "#f87171",
  UPLOAD: "#c084fc",
  LOGIN:  "#fbbf24",
};

export default async function DashboardPage() {
  const s = await getStats();

  const STATS = [
    { label:"Page Views (30d)", value:s.pageViews,     icon:"👁",  href:"/admin/analytics", color:"#818cf8" },
    { label:"Visitors (30d)",   value:s.sessions,       icon:"👤",  href:"/admin/analytics", color:"#818cf8" },
    { label:"CV Downloads",     value:s.cvDownloads,    icon:"📄",  href:"/admin/analytics", color:"#818cf8" },
    { label:"New Messages",     value:s.newMessages,    icon:"📬",  href:"/admin/messages",  color:s.newMessages>0?"#fbbf24":"#818cf8", highlight:s.newMessages>0 },
    { label:"Active Projects",  value:s.totalProjects,  icon:"🗂",  href:"/admin/projects",  color:"#818cf8" },
    { label:"Published Posts",  value:s.publishedPosts, icon:"📝",  href:"/admin/blog",      color:"#818cf8" },
  ];

  const QUICK = [
    { label:"Add Project",    href:"/admin/projects/new", icon:"➕"  },
    { label:"New Blog Post",  href:"/admin/blog/new",     icon:"✍️" },
    { label:"Upload Gallery", href:"/admin/gallery",      icon:"🖼"  },
    { label:"Edit Profile",   href:"/admin/profile",      icon:"✏️" },
    { label:"View Messages",  href:"/admin/messages",     icon:"📬" },
    { label:"View Analytics", href:"/admin/analytics",    icon:"📈" },
  ];

  return (
    <div style={{ maxWidth:"1100px", display:"flex", flexDirection:"column", gap:"1.75rem" }}>

      {/* Welcome */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"1rem" }}>
        <div>
          <h1 style={{ fontFamily:"var(--font-syne)", fontSize:"1.4rem", fontWeight:800, marginBottom:"0.2rem" }}>
            Welcome back 👋
          </h1>
          <p style={{ fontSize:"0.85rem", color:"var(--text-muted)" }}>
            Here&apos;s what&apos;s happening with your portfolio.
          </p>
        </div>
        <Link href="/en" target="_blank" className="btn-ghost" style={{ fontSize:"0.82rem" }}>
          ↗ View Portfolio
        </Link>
      </div>

      {/* Stats grid */}
      <DashboardStatsGrid stats={STATS} />

      {/* Quick actions */}
      <div>
        <p style={{ fontSize:"0.72rem", fontWeight:700, color:"var(--text-muted)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"0.75rem" }}>
          Quick Actions
        </p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:"0.625rem" }}>
          {QUICK.map(({ label, href, icon }) => (
            <Link key={href} href={href} className="btn-ghost" style={{ fontSize:"0.82rem" }}>
              {icon} {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Two column bottom */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"1.25rem" }}>

        {/* Recent messages */}
        <div className="admin-card" style={{ display:"flex", flexDirection:"column", gap:0 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <h3 style={{ fontWeight:700, fontSize:"0.9rem" }}>Recent Messages</h3>
            <Link href="/admin/messages" style={{ fontSize:"0.75rem", color:"#818cf8", textDecoration:"none" }}>View all →</Link>
          </div>
          {s.recentMessages.length === 0
            ? <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", textAlign:"center", padding:"1.5rem 0" }}>No messages yet.</p>
            : s.recentMessages.map(msg => (
              <Link key={msg.id} href="/admin/messages" style={{ textDecoration:"none", display:"flex", alignItems:"flex-start", gap:"0.75rem", padding:"0.625rem 0", borderBottom:"1px solid var(--border)" }}>
                <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:G, display:"flex", alignItems:"center", justifyContent:"center", color:"white", fontSize:"0.75rem", fontWeight:700, flexShrink:0 }}>
                  {msg.name[0].toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:"0.5rem" }}>
                    <p style={{ fontSize:"0.82rem", fontWeight:600, overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", color:"var(--text-primary)" }}>
                      {msg.name}
                    </p>
                    {msg.status==="NEW" && <span className="warning-badge" style={{ flexShrink:0 }}>NEW</span>}
                  </div>
                  <p style={{ fontSize:"0.72rem", color:"var(--text-muted)", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>
                    {msg.subject}
                  </p>
                </div>
              </Link>
            ))
          }
        </div>

        {/* Activity log */}
        <div className="admin-card">
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:"1rem" }}>
            <h3 style={{ fontWeight:700, fontSize:"0.9rem" }}>Recent Activity</h3>
            <Link href="/admin/activity-log" style={{ fontSize:"0.75rem", color:"#818cf8", textDecoration:"none" }}>View all →</Link>
          </div>
          {s.recentLogs.length === 0
            ? <p style={{ fontSize:"0.82rem", color:"var(--text-muted)", textAlign:"center", padding:"1.5rem 0" }}>No activity yet.</p>
            : s.recentLogs.map(log => (
              <div key={log.id} style={{ display:"flex", gap:"0.625rem", alignItems:"flex-start", padding:"0.5rem 0", borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:"0.68rem", fontWeight:700, fontFamily:"var(--font-fira)", color:ACTION_COLOR[log.action]??"#94a3b8", flexShrink:0, width:"48px", marginTop:"2px" }}>
                  {log.action}
                </span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:"0.78rem", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis", color:"var(--text-secondary)" }}>
                    {log.description}
                  </p>
                  <p style={{ fontSize:"0.68rem", color:"var(--text-muted)" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}