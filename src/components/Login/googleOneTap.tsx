import { useEffect } from "react";
// Import your initialized Supabase client
import { supabase } from "@/config/supabaseClient";

const GoogleOneTap = () => {
  useEffect(() => {
    // 1. Check if we already have a session to prevent showing the prompt to logged-in users
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) return; // User is already logged in

      // 2. Dynamically load the Google Identity Services script
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        // 3. Initialize Google One Tap
        if (window.google) {
          (window as any).google.accounts.id.initialize({
            // Replace with your actual Google Client ID
            client_id:
              "447813315320-j867vrk3go1agfb4r34lkc0s4edq43kt.apps.googleusercontent.com",
            // The callback function triggered after the user selects their Google account
            callback: async (response: any) => {
              try {
                // response.credential contains the raw ID Token
                const { credential } = response;

                // 4. Send the ID token to Supabase to establish a session
                const { data, error } = await supabase.auth.signInWithIdToken({
                  provider: "google",
                  token: credential,
                });

                if (error) {
                  console.error("Supabase auth error:", error.message);
                  return;
                }

                // Optionally redirect the user or update state here
              } catch (error) {
                console.error("Unexpected error during sign-in:", error);
              }
            },
            // optional: 'select_account' forces the account chooser, 'use_device' tries to auto-sign in
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_button: false,
          });

          (window as any).google.accounts.id.prompt((notification: any) => {
            console.log("on prompt notification", notification);
            if (notification.isNotDisplayed()) {
              console.log(
                "is not displayed",
                notification.getNotDisplayedReason(),
              );
            } else if (notification.isSkippedMoment()) {
              console.log("is skipped", notification.getSkippedReason());
            } else if (notification.isDismissedMoment()) {
              console.log("is dismissed", notification.getDismissedReason());
            } else if (notification.isNotDisplayed()) {
              console.log("Auto-prompt blocked - displaying manual button.");
            }
          });

          // 5. Trigger the One Tap UI
          //   (window as any).google.accounts.id.prompt();
        }
      };
    };

    checkSession();
  }, []);

  // This component doesn't render any traditional UI, just the floating Google prompt
  return null;
};

export default GoogleOneTap;
