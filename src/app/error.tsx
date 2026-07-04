"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: "#0a0f1e", color: "#f8fafc" }}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-slate-400 mb-6 text-sm">{error.message}</p>
        <button
          onClick={reset}
          className="px-6 py-2 rounded-full bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-500 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
