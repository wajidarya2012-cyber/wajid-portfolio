"use client";

import { useEffect } from "react";

interface Props {
  page:       string;
  event:      "PAGE_VIEW" | "PROJECT_VIEW" | "CV_DOWNLOAD" | "CONTACT_SUBMIT" | "BLOG_VIEW";
  projectId?: string;
}

function randomUUID(): string {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function getSessionId(): string {
  try {
    const key = "wajid_session_id";
    let sid   = sessionStorage.getItem(key);
    if (!sid) { sid = randomUUID(); sessionStorage.setItem(key, sid); }
    return sid;
  } catch {
    return randomUUID();
  }
}

export default function AnalyticsTracker({ page, event, projectId }: Props) {
  useEffect(() => {
    try {
      const sessionId = getSessionId();
      fetch("/api/v1/analytics", {
        method:  "POST",
        headers: { "Content-Type": "application/json", "x-session-id": sessionId },
        body:    JSON.stringify({ sessionId, page, event, projectId, referrer: document.referrer }),
      }).catch(() => {});
    } catch {
      // Analytics should never break the page
    }
  }, [page, event, projectId]);

  return null;
}
