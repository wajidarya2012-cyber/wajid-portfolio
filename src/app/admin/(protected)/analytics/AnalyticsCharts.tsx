"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface Props {
  data: {
    summary: { totalPageViews: number; totalVisitors: number; cvDownloads: number; contactSubmits: number };
    visitorTrend: { date: string; views: number; unique: number }[];
    topPages:     { page: string; views: number }[];
    countries:    { country: string; count: number }[];
    topProjects:  { id: string; title_en: string; slug: string; viewCount: number }[];
  };
  from?: string;
  to?: string;
}

const CHART_STYLE = {
  stroke:     "#4f46e5",
  stroke2:    "#06b6d4",
  grid:       "rgba(255,255,255,0.06)",
  text:       "#64748b",
  tooltip:    { background: "#0f1629", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 },
};

function rangeLabel(from?: string, to?: string) {
  if (!from && !to) return "All Time";
  if (from && to)   return `${from} → ${to}`;
  if (from)         return `From ${from}`;
  return `Until ${to}`;
}

export default function AnalyticsCharts({ data, from, to }: Props) {
  const label = rangeLabel(from, to);
  const SUMMARY = [
    { label:"Page Views",     value:data.summary.totalPageViews, icon:"👁" },
    { label:"Unique Visitors",value:data.summary.totalVisitors,  icon:"👤" },
    { label:"CV Downloads",   value:data.summary.cvDownloads,    icon:"📄" },
    { label:"Contact Submits",value:data.summary.contactSubmits, icon:"📬" },
  ];

  const hasAnyData =
    data.summary.totalPageViews > 0 || data.summary.totalVisitors > 0 ||
    data.summary.cvDownloads > 0 || data.summary.contactSubmits > 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARY.map(({ label:l, value, icon }) => (
          <div key={l} className="glass-card rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color:"var(--text-muted)" }}>{l}</span>
              <span style={{ fontSize:"1.1rem" }}>{icon}</span>
            </div>
            <p className="font-display text-2xl font-bold">{value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {!hasAnyData && (
        <div className="glass-card rounded-2xl p-10 text-center">
          <p className="text-sm" style={{ color:"var(--text-muted)" }}>
            No analytics data {from || to ? "for the selected date range" : "yet"}. Data will appear here once visitors browse the site.
          </p>
        </div>
      )}

      {/* Visitor trend */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display font-bold mb-5">Visitor Trend — {label}</h2>
        {data.visitorTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data.visitorTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: CHART_STYLE.text }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: CHART_STYLE.text }} />
              <Tooltip contentStyle={CHART_STYLE.tooltip} />
              <Legend />
              <Line type="monotone" dataKey="views"  stroke={CHART_STYLE.stroke}  strokeWidth={2} dot={false} name="Page Views" />
              <Line type="monotone" dataKey="unique" stroke={CHART_STYLE.stroke2} strokeWidth={2} dot={false} name="Unique Visitors" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-center py-10" style={{ color: "var(--text-muted)" }}>No data yet.</p>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top pages */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-5">Top Pages</h2>
          {data.topPages.length > 0 ? (
            <div className="space-y-2">
              {data.topPages.map(({ page, views }) => {
                const max = data.topPages[0].views;
                return (
                  <div key={page}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-code truncate max-w-[70%]" style={{ color: "var(--text-secondary)" }}>{page}</span>
                      <span className="text-accent-500 font-medium">{views}</span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--border)" }}>
                      <div className="h-full rounded-full bg-gradient-hero" style={{ width: `${(views / max) * 100}%`, transition: "width 0.8s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No data yet.</p>
          )}
        </div>

        {/* Top projects */}
        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display font-bold mb-5">Most Viewed Projects</h2>
          {data.topProjects.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.topProjects} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_STYLE.grid} horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: CHART_STYLE.text }} />
                <YAxis type="category" dataKey="title_en" width={130} tick={{ fontSize: 10, fill: CHART_STYLE.text }} />
                <Tooltip contentStyle={CHART_STYLE.tooltip} />
                <Bar dataKey="viewCount" fill={CHART_STYLE.stroke} radius={[0, 4, 4, 0]} name="Views" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No data yet.</p>
          )}
        </div>
      </div>

      {/* Countries */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display font-bold mb-5">Visitors by Country</h2>
        {data.countries.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data.countries.map(({ country, count }) => (
              <div key={country} className="flex items-center justify-between px-4 py-2.5 rounded-xl" style={{ background: "var(--bg-secondary)" }}>
                <span className="text-sm font-medium">{country}</span>
                <span className="font-code text-xs text-accent-500 font-bold">{count}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center py-8" style={{ color: "var(--text-muted)" }}>No data yet.</p>
        )}
      </div>
    </div>
  );
}
