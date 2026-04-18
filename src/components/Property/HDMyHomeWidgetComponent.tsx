"use client";

import React, { useEffect, useRef } from "react";

const HDMyHomeWidgetComponent: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    // 1. Prevent multiple initializations
    if (initialized.current) return;

    const loadWidget = () => {
      if ((window as any).HDWidget && containerRef.current) {
        try {
          // Clear any previous junk in the div just in case
          containerRef.current.innerHTML = '<div id="hd-widget-active"></div>';

          new (window as any).HDWidget(
            "AY98q81Kyk6kcILnM7ObC6AHXiPk7msp6eCo32kM", // Your API Key
            "hd-widget-active", // This MUST match the ID inside the div above
          );

          initialized.current = true;
        } catch (err) {
          console.error("HonestDoor Error:", err);
        }
      }
    };

    // 2. Load dependencies if not present
    if (!document.getElementById("hd-script")) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href =
        "https://unpkg.com/@honestdoor/lead-gen-widget@latest/dist/widget.umd.css";
      document.head.appendChild(link);

      const script = document.createElement("script");
      script.id = "hd-script";
      script.src =
        "https://unpkg.com/@honestdoor/lead-gen-widget@latest/dist/widget.umd.js";
      script.async = true;
      script.onload = loadWidget;
      document.head.appendChild(script);
    } else {
      // Script is already there, just give the DOM a millisecond to breathe
      const timer = setTimeout(loadWidget, 200);
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div className="w-full bg-white p-4 justify-center items-center flex">
      {/* We use a containerRef and a nested ID. 
          This ensures the script always finds a 'fresh' element. 
      */}
      <div ref={containerRef} className="honestdoor-wrapper">
        <div id="hd-widget-active" style={{ minHeight: "300px" }}>
          <p className="text-center text-gray-400">Loading valuation tool...</p>
        </div>
      </div>
    </div>
  );
};

export default HDMyHomeWidgetComponent;
