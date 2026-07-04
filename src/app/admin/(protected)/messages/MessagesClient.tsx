"use client";

import { useState }      from "react";
import { useRouter }     from "next/navigation";
import type { ContactMessage } from "@/types";

const STATUS_STYLE: Record<string, string> = {
  NEW:      "bg-yellow-500/15  text-yellow-400  border-yellow-500/25",
  READ:     "bg-blue-500/15    text-blue-400    border-blue-500/25",
  REPLIED:  "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  ARCHIVED: "bg-slate-500/15   text-slate-400   border-slate-500/25",
};

export default function MessagesClient({ messages }: { messages: ContactMessage[] }) {
  const router              = useRouter();
  const [selected, setSelected] = useState<ContactMessage | null>(null);
  const [updating, setUpdating] = useState(false);

  async function updateStatus(id: string, status: string) {
    setUpdating(true);
    await fetch(`/api/v1/admin/messages/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status }),
    });
    setUpdating(false);
    router.refresh();
    if (selected?.id === id) setSelected(prev => prev ? { ...prev, status: status as ContactMessage["status"] } : null);
  }

  async function deleteMessage(id: string) {
    if (!confirm("Delete this message?")) return;
    await fetch(`/api/v1/admin/messages/${id}`, { method: "DELETE" });
    setSelected(null);
    router.refresh();
  }

  if (messages.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-12 text-center">
        <p className="text-4xl mb-3">📭</p>
        <p className="font-medium">No messages found.</p>
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-[340px_1fr] gap-4 h-[600px]">
      {/* Message list */}
      <div className="glass-card rounded-2xl overflow-y-auto">
        {messages.map((msg) => (
          <button
            key={msg.id}
            onClick={() => setSelected(msg)}
            className={`w-full text-left p-4 border-b hover:bg-white/5 transition-colors ${selected?.id === msg.id ? "bg-primary-500/10" : ""}`}
            style={{ borderColor: "var(--border)" }}
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-sm truncate">{msg.name}</p>
              <span className={`shrink-0 text-[10px] px-2 py-0.5 rounded-full border font-medium ${STATUS_STYLE[msg.status]}`}>
                {msg.status}
              </span>
            </div>
            <p className="text-xs font-medium truncate mb-1">{msg.subject}</p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {new Date(msg.createdAt).toLocaleDateString()}
            </p>
          </button>
        ))}
      </div>

      {/* Message detail */}
      {selected ? (
        <div className="glass-card rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display font-bold text-lg">{selected.subject}</h2>
                <p className="text-sm mt-1" style={{ color: "var(--text-secondary)" }}>
                  From: <strong>{selected.name}</strong> · {selected.email}
                  {selected.phone && ` · ${selected.phone}`}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {new Date(selected.createdAt).toLocaleString()}
                </p>
              </div>
              <span className={`shrink-0 text-xs px-3 py-1 rounded-full border font-medium ${STATUS_STYLE[selected.status]}`}>
                {selected.status}
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 p-5 overflow-y-auto">
            <p className="text-sm leading-loose whitespace-pre-wrap" style={{ color: "var(--text-secondary)" }}>
              {selected.message}
            </p>
          </div>

          {/* Actions */}
          <div className="p-4 border-t flex flex-wrap gap-2" style={{ borderColor: "var(--border)" }}>
            {["READ", "REPLIED", "ARCHIVED"].map((s) => (
              <button
                key={s}
                onClick={() => updateStatus(selected.id, s)}
                disabled={updating || selected.status === s}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all disabled:opacity-40 ${
                  selected.status === s
                    ? "border-primary-500 text-primary-400 bg-primary-500/10"
                    : "border-white/10 text-slate-400 hover:border-primary-500 hover:text-white"
                }`}
              >
                Mark {s}
              </button>
            ))}
            <a
              href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-primary-600 text-white hover:bg-primary-500 transition-colors ms-auto"
            >
              Reply via Email
            </a>
            <button
              onClick={() => deleteMessage(selected.id)}
              className="text-xs px-3 py-1.5 rounded-lg border border-red-500/25 text-red-400 hover:bg-red-500/10 transition-all"
            >
              Delete
            </button>
          </div>
        </div>
      ) : (
        <div className="glass-card rounded-2xl flex items-center justify-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>Select a message to read</p>
        </div>
      )}
    </div>
  );
}
