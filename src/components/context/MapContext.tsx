"use client";
import { createContext, useContext, useState } from "react";
// Import PropertyType from wherever it is defined, or redefine it here if necessary

export type ActivePopupState = {
  source: "listing" | "parcel";
  pid: string;
  propertyType: any;
  lngLat: [number, number];
  data?: any; // Stores listing data to avoid refetching
  objectId?: string | number; // Stores the parcel ID to restore the blue highlight
} | null;

const MapContext = createContext({
  isMapExpanded: false,
  setMapExpanded: (val: boolean) => {},
  activePopup: null as ActivePopupState,
  setActivePopup: (val: ActivePopupState) => {},
});

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMapExpanded, setMapExpanded] = useState(false);
  const [activePopup, setActivePopup] = useState<ActivePopupState>(null);

  return (
    <MapContext.Provider
      value={{
        isMapExpanded,
        setMapExpanded,
        activePopup,
        setActivePopup,
      }}
    >
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => useContext(MapContext);
