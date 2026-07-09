"use client";

import { useEffect, useState } from "react";
import { usePathname }         from "next/navigation";

export default function AdminLoadingBar() {
  const pathname          = usePathname();
  const [loading, setLoading] = useState(false);
  const [width, setWidth]     = useState(0);

  useEffect(() => {
    setLoading(true);
    setWidth(30);
    const t1 = setTimeout(() => setWidth(70),  150);
    const t2 = setTimeout(() => setWidth(90),  400);
    const t3 = setTimeout(() => {
      setWidth(100);
      const t4 = setTimeout(() => { setLoading(false); setWidth(0); }, 300);
      return () => clearTimeout(t4);
    }, 600);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [pathname]);

  if (!loading && width === 0) return null;

  return (
    <div style={{
      position:   "fixed",
      top:        0,
      left:       0,
      height:     "3px",
      width:      `${width}%`,
      background: "linear-gradient(135deg,#4f46e5,#06b6d4)",
      zIndex:     9999,
      transition: width === 100 ? "width 0.2s ease, opacity 0.3s ease" : "width 0.4s ease",
      opacity:    width === 100 ? 0 : 1,
      boxShadow:  "0 0 10px rgba(79,70,229,0.6)",
    }} />
  );
}