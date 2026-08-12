"use client";

import { useEffect } from "react";

export default function ConsoleLoggerSilencer() {
  useEffect(() => {
    const originalError = console.error;

    console.error = (...args: any[]) => {
      // 1. Check if the error message contains the specific noise strings
      const isGsiError =
        typeof args[0] === "string" &&
        (args[0].includes("[GSI_LOGGER]") ||
          args[0].includes("FedCM") ||
          args[0].includes("NetworkError"));

      // 2. If it's a GSI error, return (do nothing/silence it)
      if (isGsiError) return;

      // 3. Otherwise, call the original console.error so you don't miss actual bugs
      originalError.apply(console, args as any);
    };
  }, []);

  return null; // This component renders nothing
}
