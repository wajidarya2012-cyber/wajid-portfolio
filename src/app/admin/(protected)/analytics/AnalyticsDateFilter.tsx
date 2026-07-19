"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function AnalyticsDateFilter({ from, to }: { from: string; to: string }) {
  const router   = useRouter();
  const pathname = usePathname();
  const [fromDate, setFromDate] = useState(from);
  const [toDate, setToDate]     = useState(to);

  function apply() {
    const params = new URLSearchParams();
    if (fromDate) params.set("from", fromDate);
    if (toDate)   params.set("to", toDate);
    const qs = params.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  function clear() {
    setFromDate(""); setToDate("");
    router.push(pathname);
  }

  const inp: React.CSSProperties = {
    background:"var(--bg-secondary)", border:"1px solid var(--border)", borderRadius:"6px",
    color:"var(--text-primary)", fontFamily:"inherit", fontSize:"0.8rem", padding:"0.45rem 0.6rem", outline:"none",
  };

  return (
    <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", flexWrap:"wrap" }}>
      <label style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
        From
        <input type="date" value={fromDate} onChange={e=>setFromDate(e.target.value)} style={{ ...inp, marginLeft:"0.4rem" }} max={toDate || undefined} />
      </label>
      <label style={{ fontSize:"0.75rem", color:"var(--text-muted)" }}>
        To
        <input type="date" value={toDate} onChange={e=>setToDate(e.target.value)} style={{ ...inp, marginLeft:"0.4rem" }} min={fromDate || undefined} />
      </label>
      <button type="button" className="btn-primary" style={{ fontSize:"0.8rem", padding:"0.45rem 0.9rem" }} onClick={apply}>Apply</button>
      {(from || to) && (
        <button type="button" className="btn-ghost" style={{ fontSize:"0.8rem", padding:"0.45rem 0.9rem" }} onClick={clear}>Clear</button>
      )}
    </div>
  );
}
