"use client";
import { createContext, useContext, useState } from "react";

const MapContext = createContext({
  isMapExpanded: false,
  setMapExpanded: (val: boolean) => {},
});

export const MapProvider = ({ children }: { children: React.ReactNode }) => {
  const [isMapExpanded, setMapExpanded] = useState(false);
  return (
    <MapContext.Provider value={{ isMapExpanded, setMapExpanded }}>
      {children}
    </MapContext.Provider>
  );
};

export const useMap = () => useContext(MapContext);
