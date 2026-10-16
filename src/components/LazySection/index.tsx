"use client";

import { useEffect, useRef, useState } from "react";

export default function LazySection({
  children,
  // `defer` keeps the old mount-on-scroll behaviour — use it for sections
  // with heavy third-party media (e.g. YouTube iframes) where eager
  // mounting would hurt Core Web Vitals.
  defer = false,
  minHeight = 400,
}: {
  children: React.ReactNode;
  defer?: boolean;
  minHeight?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!defer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, [defer]);

  return (
    <div
      ref={ref}
      style={{
        minHeight: `${minHeight}px`,
        // Skip rendering work for offscreen sections while keeping their
        // HTML in the DOM so crawlers can see the content.
        contentVisibility: defer ? undefined : "auto",
        containIntrinsicSize: defer ? undefined : `auto ${minHeight}px`,
      }}
    >
      {defer && !visible ? null : children}
    </div>
  );
}
