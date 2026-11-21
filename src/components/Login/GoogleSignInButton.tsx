"use client";

import { useEffect, useRef } from "react";
import {
  loadGoogleScript,
  initializeGoogleId,
  renderGoogleButton,
} from "./googleAuthShared";

/**
 * Manual "Continue with Google" button. Use on pages where One Tap's
 * floating prompt is not shown (login/register), or as a fallback when
 * One Tap is suppressed by the browser (Firefox ETP, private mode).
 */
export default function GoogleSignInButton() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleScript()
      .then(() => {
        if (cancelled || !containerRef.current) return;
        initializeGoogleId();
        renderGoogleButton(containerRef.current);
      })
      .catch((err) => {
        // Script blocked by tracking protection — button simply stays hidden
        console.warn("Google sign-in button unavailable:", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="flex justify-center [&>div]:!w-full">
      <div ref={containerRef} />
    </div>
  );
}
