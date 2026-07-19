"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const ACTION_COLOR: Record<string, string> = {
  CREATE: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  UPDATE: "text-blue-400    bg-blue-500/10    border-blue-500/25",
  DELETE: "text-red-400     bg-red-500/10     border-red-500/25",
  UPLOAD: "text-purple-400  bg-purple-500/10  border-purple-500/25",
  LOGIN:  "text-yellow-400  bg-yellow-500/10  border-yellow-500/25",
  LOGOUT: "text-slate-400   bg-slate-500/10   border-slate-500/25",
};

type LogRow = {
  id: string;
  action: string;
  description: string;
  entity: string;
  ipAddress: string | null;
  createdAt: Date | string;
  user: { name: string | null; email: string };
};

export default function ActivityLogTable({ logs, total }: { logs: LogRow[]; total: number }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [clearOpen, setClearOpen]   = useState(false);
  const [clearText, setClearText]   = useState("");
  const [clearing, setClearing]     = useState(false);
  const [msg, setMsg]               = useState<string | null>(null);

  async function deleteOne(id: string) {
    if (!confirm("Delete this activity log entry? This cannot be undone.")) return;
    setDeletingId(id);
    const res  = await fetch(`/api/v1/admin/activity-log/${id}`, { method: "DELETE" });
    const data = await res.json();
    setDeletingId(null);
    if (data.success) router.refresh();
    else setMsg(data.error ?? "Failed to delete entry.");
  }

  async function clearAll() {
    if (clearText !== "DELETE") return;
    setClearing(true);
    const res  = await fetch("/api/v1/admin/activity-log", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ confirm: "DELETE" }),
    });
    const data = await res.json();
    setClearing(false);
    setClearOpen(false);
    setClearText("");
    if (data.success) router.refresh();
    else setMsg(data.error ?? "Failed to clear activity logs.");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>{total} entries</p>
        {total > 0 && (
          <button
            type="button"
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors"
            style={{ borderColor: "rgba(248,113,113,0.4)", color: "#f87171", background: "rgba(248,113,113,0.08)" }}
            onClick={() => setClearOpen(true)}
          >
            🗑 Clear All Activity Logs
          </button>
        )}
      </div>

      {msg && <div className="alert-error">⚠️ {msg}</div>}

      <div className="glass-card rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b" style={{ borderColor: "var(--border)" }}>
              {["Action", "Description", "Entity", "User", "IP", "Time", ""].map(h => (
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
                <td className="px-4 py-3 text-xs whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => deleteOne(log.id)}
                    disabled={deletingId === log.id}
                    className="text-xs font-medium"
                    style={{ color: "#f87171", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  >
                    {deletingId === log.id ? "Deleting…" : "Delete"}
                  </button>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm" style={{ color: "var(--text-muted)" }}>No activity yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Clear-all confirmation modal */}
      {clearOpen && (
        <div
          onClick={() => { setClearOpen(false); setClearText(""); }}
          style={{ position:"fixed", inset:0, zIndex:2000, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"1rem" }}
        >
          <div
            onClick={e => e.stopPropagation()}
            className="admin-card"
            style={{ maxWidth:"420px", width:"100%", borderLeft:"3px solid #f87171" }}
          >
            <h3 style={{ fontWeight:700, fontSize:"1rem", marginBottom:"0.75rem" }}>⚠️ Clear All Activity Logs</h3>
            <p style={{ fontSize:"0.85rem", color:"var(--text-secondary)", marginBottom:"0.875rem" }}>
              This will permanently delete all {total} activity log entries. This cannot be undone.
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              value={clearText}
              onChange={e => setClearText(e.target.value)}
              placeholder="Type DELETE to confirm"
              style={{ width:"100%", background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px", color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.875rem", padding:"0.6rem 0.75rem", outline:"none", marginBottom:"1.25rem" }}
            />
            <div style={{ display:"flex", gap:"0.75rem" }}>
              <button
                className="btn-primary"
                style={{ background: clearText === "DELETE" ? "#dc2626" : "var(--border)", cursor: clearText === "DELETE" ? "pointer" : "not-allowed" }}
                onClick={clearAll}
                disabled={clearText !== "DELETE" || clearing}
              >
                {clearing ? "Clearing…" : "Yes, Clear All Logs"}
              </button>
              <button className="btn-ghost" onClick={() => { setClearOpen(false); setClearText(""); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
