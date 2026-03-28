"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
// IMPORTANT: You must import the CSS for the geocoder to look right
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

export default function AddressAutocomplete({ onSelect, value }: any) {
  const ref = useRef<HTMLDivElement | null>(null);
  const geocoderRef = useRef<MapboxGeocoder | null>(null);

  useEffect(() => {
    if (!ref.current || geocoderRef.current) return;

    const geocoder = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken!,
      placeholder: "Search for a property address...",
      marker: false,
      // This makes it full width to match your other inputs
      collapsed: false,
    });

    geocoder.on("result", (e: any) => {
      const place = e.result;
      const context = place.context || [];
      const get = (type: string) =>
        context.find((c: any) => c.id.includes(type))?.text || "";

      onSelect({
        address: place.place_name,
        lat: place.center[1],
        lng: place.center[0],
        city: get("place"),
        province: get("region"),
        postal_code: get("postcode"),
      });
    });

    geocoder.addTo(ref.current);
    geocoderRef.current = geocoder;

    return () => {
      if (geocoderRef.current) {
        geocoderRef.current.clear();
      }
    };
  }, [onSelect]);

  // Logic to clear the input when the form is submitted/reset
  useEffect(() => {
    if (value === "" && geocoderRef.current) {
      geocoderRef.current.clear();
    }
  }, [value]);

  useEffect(() => {
    if (value && geocoderRef.current) {
      geocoderRef.current.setInput(value);
    }
  });

  return (
    <div className="mapbox-search-wrapper w-full">
      <div ref={ref} className="w-full" />

      {/* Custom CSS to force Mapbox to look like Shadcn/Tailwind */}
      <style jsx global>{`
        .mapboxgl-ctrl-geocoder {
          width: 100% !important;
          max-width: none !important;
          box-shadow: none !important;
          border: 1px solid #e2e8f0 !important; /* border-slate-200 */
          border-radius: 0.5rem !important; /* rounded-md */
          font-family: inherit !important;
          background-color: white !important;
        }
        .mapboxgl-ctrl-geocoder--input {
          height: 40px !important;
          padding: 10px 35px !important;
          font-size: 14px !important;
          outline: none !important;
        }
        .mapboxgl-ctrl-geocoder--icon-search {
          top: 10px !important;
          left: 10px !important;
          fill: #94a3b8 !important; /* text-slate-400 */
        }
        .mapboxgl-ctrl-geocoder--button {
          background: transparent !important;
          top: 4px !important;
        }
        .mapboxgl-ctrl-geocoder .suggestions {
          border-radius: 0.5rem !important;
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1) !important;
          border: 1px solid #e2e8f0 !important;
          margin-top: 4px !important;
        }
      `}</style>
    </div>
  );
}
