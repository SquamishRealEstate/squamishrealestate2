/* Design Philosophy: Pacific Northwest Naturalism
   - Diagonal slide-in animation
   - Frosted glass controls
   - Smooth transitions with ease-out curves
*/

import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Map, X, Maximize2, Minimize2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { MapView } from "@/components/Map/Map";
import { useMap } from "@/components/context/MapContext";

export default function CollapsibleMap() {
  const { isMapExpanded, setMapExpanded } = useMap();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const handleMapReady = useCallback((map: mapboxgl.Map) => {
    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (!mapInstance || !containerRef.current) return;

    const handleTransitionEnd = () => {
      mapInstance.resize();
    };

    const el = containerRef.current;
    el.addEventListener("transitionend", handleTransitionEnd);

    return () => {
      el.removeEventListener("transitionend", handleTransitionEnd);
    };
  }, [mapInstance]);

  if (!isMapExpanded) {
    // Collapsed state - show button to expand
    return (
      <div className="fixed bottom-24 right-6 z-40">
        <Button
          size="lg"
          onClick={() => setMapExpanded(true)}
          className="h-14 px-6 shadow-lg"
        >
          <Map className="w-5 h-5 mr-2" />
          View Map
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isMapExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={() => setMapExpanded(false)}
      />

      {/* Map Container */}
      <div
        ref={containerRef}
        className={cn(
          "fixed z-50 bg-background shadow-2xl transition-all duration-500 ease-out",
          isFullscreen
            ? "inset-0 rounded-none"
            : "top-20 right-6 bottom-6 w-[600px] rounded-2xl",
          isMapExpanded
            ? "translate-x-0 opacity-100"
            : "translate-x-full opacity-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Map Header */}
          <div className="p-4 frosted-glass border-b border-border/20 flex items-center justify-between">
            <h3 className="font-semibold text-lg">Property Map</h3>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                {isFullscreen ? (
                  <Minimize2 className="w-5 h-5" />
                ) : (
                  <Maximize2 className="w-5 h-5" />
                )}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setMapExpanded(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Map */}
          <div className="flex-1 overflow-hidden">
            <MapView className="w-full h-full" onMapReady={handleMapReady} />
          </div>
        </div>
      </div>
    </>
  );
}
