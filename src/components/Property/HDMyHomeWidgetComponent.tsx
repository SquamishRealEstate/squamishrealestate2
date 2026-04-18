"use client";

import React, { useEffect, useRef } from "react";

const HDMyHomeWidgetComponent: React.FC = () => {
  const initialized = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React Strict Mode
    if (initialized.current) return;

    // 1. Load CSS
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href =
      "https://unpkg.com/@honestdoor/lead-gen-widget@latest/dist/widget.umd.css";
    document.head.appendChild(link);

    // 2. Load Script
    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@honestdoor/lead-gen-widget@latest/dist/widget.umd.js";
    script.async = true;

    script.onload = () => {
      if ((window as any).HDWidget) {
        try {
          // Initialize inside the target div
          new (window as any).HDWidget(
            "AY98q81Kyk6kcILnM7ObC6AHXiPk7msp6eCo32kM",
            "hd-widget",
          );
          initialized.current = true;
        } catch (err) {
          console.error("HonestDoor Widget failed to init:", err);
        }
      }
    };

    // 3. Append script to document head (NOT the widget div)
    document.head.appendChild(script);

    return () => {
      // Optional: Cleanup logic if needed
      if (document.head.contains(link)) document.head.removeChild(link);
      if (document.head.contains(script)) document.head.removeChild(script);
    };
  }, []);

  return (
    <div className="w-full relative py-4">
      {/* The widget mounts here. Keep this div clean of other elements. */}
      <div id="hd-widget" style={{ zIndex: 5, minHeight: "100px" }}></div>
    </div>
  );
};

export default HDMyHomeWidgetComponent;
