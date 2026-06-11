import React, { useEffect, useState } from "react";
import { NeighborhoodType } from "@/components/Neighborhoods";

export const Price = ({
  selectedNeighborhood,
}: {
  selectedNeighborhood: NeighborhoodType;
}) => {
  const statsSourceURL = selectedNeighborhood?.stats_source_url || "";

  const [iframeDimensions, setIframeDimensions] = useState({
    width: 780,
    height: 520,
  });

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setIframeDimensions({ width: 320, height: 320 });
      } else if (window.innerWidth <= 768) {
        setIframeDimensions({ width: 600, height: 420 });
      } else {
        setIframeDimensions({ width: 900, height: 520 });
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { width, height } = iframeDimensions;

  return (
    <div className="w-full rounded-2xl border bg-card shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="p-6 text-center border-b bg-muted/20">
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">
          Housing Price Index
        </h2>

        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-2">
          REBGV MLS Graph • Local Properties
        </p>

        <div className="h-1 w-14 bg-primary mx-auto mt-4 rounded-full" />
      </div>

      {/* IFRAME CONTAINER */}
      <div className="flex justify-center items-center p-4 md:p-6 bg-background">
        <div className="w-full flex justify-center overflow-hidden rounded-xl border bg-black shadow-md">
          {statsSourceURL ? (
            <iframe
              width={width}
              height={height}
              src={`${statsSourceURL}?w=${width}&h=${height}`}
              allowFullScreen
              className="max-w-full"
            />
          ) : (
            <div className="text-sm text-muted-foreground p-10">
              No market data available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
