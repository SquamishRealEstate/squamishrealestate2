"use client";

import { useEffect, useRef, useState } from "react";

export default function LazySection({
  children,
}: {
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    console.log("Observer created");

    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log("Intersection triggered:", entry.isIntersecting);

        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ minHeight: "400px" }}>
      {visible ? children : null}
    </div>
  );
}
