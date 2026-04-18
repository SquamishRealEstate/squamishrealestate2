"use client";

import React, { useEffect, useRef } from "react";
// Keep the CSS import if required by the package
import "@honestdoor/widget-react/dist/widget.umd.css";

const HDWidgetComponent: React.FC = () => {
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (hasInitialized.current) return;

    const script = document.createElement("script");
    script.src =
      "https://unpkg.com/@honestdoor/widget-react@latest/dist/widget.umd.js";
    script.async = true;

    script.onload = () => {
      const initWidget = () => {
        if ((window as any).HDWidget) {
          try {
            // Target the ID directly
            new (window as any).HDWidget(
              "AY98q81Kyk6kcILnM7ObC6AHXiPk7msp6eCo32kM",
              "hd-widget",
            );
            hasInitialized.current = true;
          } catch (error) {
            console.error("HDWidget failed to initialize:", error);
          }
        }
      };

      // Sometimes the DOM hasn't quite painted the div even with useEffect
      // We wrap in a small timeout to ensure the ID "hd-widget" exists
      setTimeout(initWidget, 100);
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div
        id="hd-widget"
        // Removing !z-0 as it might be suppressing the modal window
        className="w-full h-full justify-center items-center flex [&_*]:!z-0"
      ></div>
    </div>
  );
};

export default HDWidgetComponent;
