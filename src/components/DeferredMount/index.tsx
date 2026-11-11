"use client";

import React, { useEffect, useState } from "react";

/**
 * Delays mounting (and therefore lazy-chunk loading) of its children until
 * the full page `load` event has fired AND the browser is idle — so heavy
 * optional widgets never compete with the homepage's initial render.
 */
export function DeferredMount({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = () => {
      const ric =
        (window as any).requestIdleCallback ??
        ((cb: () => void) => window.setTimeout(cb, 1));
      const cancel =
        (window as any).cancelIdleCallback ?? window.clearTimeout;
      const id = ric(() => setReady(true));
      return () => cancel(id);
    };

    if (document.readyState === "complete") {
      const cleanup = mount();
      return cleanup;
    }

    let cleanup: (() => void) | undefined;
    const onLoad = () => {
      cleanup = mount();
    };
    window.addEventListener("load", onLoad);
    return () => {
      window.removeEventListener("load", onLoad);
      cleanup?.();
    };
  }, []);

  return ready ? <>{children}</> : null;
}
