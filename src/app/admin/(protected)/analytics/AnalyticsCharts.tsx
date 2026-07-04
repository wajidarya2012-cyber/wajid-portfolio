"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from "recharts";

interface Props {
  data: {
    visitorTrend: { date: string; views: number; unique: number }[];
    topPages:     { page: string; views: number }[];
    countries:    { country: string; count: number }[];
    topProjects:  { id: string; title_en: string; slug: string; viewCount: number }[];
  };
}

const CHART_STYLE = {
  stroke:     "#4f46e5",
  stroke2:    "#06b6d4",
  grid:       "rgba(255,255,255,0.06)",
  text:       "#64748b",
  tooltip:    { background: "#0f1629", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 },
};

export default function AnalyticsCharts({ data }: Props) {
  return (
    <div className="space-y-6">
      {/* Visitor trend */}
      <div className="glass-card rounded-2xl p-6">
        <h2 className="font-display font-bold mb-5">Visitor Trend — Last 30 Days</h2>
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
