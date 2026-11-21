"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/config/supabaseClient";
import {
  loadGoogleScript,
  initializeGoogleId,
  renderGoogleButton,
} from "./googleAuthShared";

/**
 * Google One Tap prompt on the home page.
 * Falls back to a manual "Continue with Google" button when the prompt
 * cannot be displayed (Firefox ETP, private mode, FedCM-only browsers).
 * An active dismissal by the user is respected (no fallback nag).
 */
const GoogleOneTap = () => {
  const [showFallback, setShowFallback] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return; // Already logged in

      try {
        await loadGoogleScript();
      } catch {
        // Google script blocked by browser tracking protection
        setShowFallback(true);
        return;
      }
      if (!window.google) {
        setShowFallback(true);
        return;
      }

      initializeGoogleId();
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          console.log("One Tap not displayed:", notification.getNotDisplayedReason());
          setShowFallback(true);
        } else if (notification.isSkippedMoment()) {
          console.log("One Tap skipped:", notification.getSkippedReason());
          setShowFallback(true);
        }
        // Dismissed moments are respected — no fallback nag
      });
    };

    checkSession();
  }, []);

  useEffect(() => {
    if (showFallback && buttonRef.current && window.google) {
      renderGoogleButton(buttonRef.current);
    }
  }, [showFallback]);

  if (!showFallback) return null;

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] w-[320px] max-w-[calc(100vw-2rem)] rounded-xl border border-border bg-background/95 backdrop-blur shadow-lg p-4">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-sm font-medium text-foreground">
          Sign in quickly with Google
        </p>
        <button
          onClick={() => setShowFallback(false)}
          aria-label="Dismiss"
          className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
        >
          ×
        </button>
      </div>
      <div ref={buttonRef} className="[&>div]:!w-full" />
    </div>
  );
};

export default GoogleOneTap;
