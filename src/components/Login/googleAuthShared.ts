// Shared helpers for Google Identity Services (One Tap + Sign In button).
// Used by googleOneTap.tsx (home page prompt + fallback) and
// GoogleSignInButton.tsx (manual button on login/register pages).

import { supabase } from "@/config/supabaseClient";

export const GOOGLE_CLIENT_ID =
  "447813315320-j867vrk3go1agfb4r34lkc0s4edq43kt.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: any;
  }
}

export async function handleGoogleCredential(credential: string) {
  const { error } = await supabase.auth.signInWithIdToken({
    provider: "google",
    token: credential,
  });
  if (error) {
    console.error("Supabase auth error:", error.message);
  }
}

export function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("load failed")));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Google script blocked"));
    document.head.appendChild(script);
  });
}

export function initializeGoogleId() {
  window.google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: async (response: any) => {
      try {
        await handleGoogleCredential(response.credential);
      } catch (error) {
        console.error("Unexpected error during sign-in:", error);
      }
    },
    auto_select: false,
    cancel_on_tap_outside: true,
    // FedCM keeps sign-in working in Chrome as third-party cookies are phased out
    use_fedcm_for_button: true,
  });
}

export function renderGoogleButton(el: HTMLElement) {
  window.google.accounts.id.renderButton(el, {
    type: "standard",
    theme: "outline",
    size: "large",
    text: "continue_with",
    shape: "rectangular",
  });
}
