"use client";

import React, { useEffect, useRef, useState } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import * as mapboxgl from "mapbox-gl";
import type { LngLatLike } from "mapbox-gl";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import {
  MapboxStyleDefinition,
  MapboxStyleSwitcherControl,
} from "mapbox-gl-style-switcher";
import "mapbox-gl-style-switcher/styles.css";
import {
  cn,
  formatPid,
  formatString,
  formatPrice,
  getBathrooms,
  formatNumber,
  preloadImage,
  getS3Image,
} from "@/lib/utils";
import { supabase } from "@/config/supabaseClient";
import { popupStyles } from "./popupStyles";
import { AuthGuard } from "../Auth/authGuard";
import { Lock } from "lucide-react";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import { useMap } from "@/components/context/MapContext";

const defaultSquamishCenter: LngLatLike = [-123.152797, 49.699331];

// Define property types globally so both components can use it safely
export type PropertyType = "detached" | "strata" | "multifamily" | "land";
export type MarketStatusType =
  | "Active"
  | "Pending"
  | "Expired"
  | "Terminated"
  | "Closed";

interface MapViewProps {
  onMapReady?: (map: mapboxgl.Map) => void;
  center?: LngLatLike;
}

export function MapView({
  onMapReady,
  center = defaultSquamishCenter,
}: MapViewProps) {
  return (
    <AuthGuard renderPrivate={false}>
      {(user) => {
        const isLoggedIn = !!user;

        return (
          <MapInnerLayout
            isLoggedIn={isLoggedIn}
            onMapReady={onMapReady}
            center={center}
          />
        );
      }}
    </AuthGuard>
  );
}

interface MapInnerLayoutProps {
  isLoggedIn: boolean;
  onMapReady?: (map: mapboxgl.Map) => void;
  center?: LngLatLike;
}

function MapInnerLayout({
  isLoggedIn,
  onMapReady,
  center,
}: MapInnerLayoutProps) {
  const router = useRouter();
  const { activePopup, setActivePopup } = useMap();
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  const [mapLoaded, setMapLoaded] = useState(false); // Track map readiness
  const currentPopupRef = useRef<mapboxgl.Popup | null>(null); // Track the active popup instance

  const [lockedListing, setLockedListing] = useState<any | null>(null);

  // --- MARKET STATUS FILTER STATE ---
  const [selectedStatuses, setSelectedStatuses] = useState<MarketStatusType[]>([
    "Active",
  ]);

  const tableMapping: Record<PropertyType, string> = {
    detached: "detached_listings",
    strata: "strata_listings",
    multifamily: "multifamily_listings",
    land: "land_listings",
  };

  const [allUniqueListings, setAllUniqueListings] = useState<
    Record<PropertyType, any[]>
  >({
    detached: [],
    strata: [],
    multifamily: [],
    land: [],
  });

  const cachedBoundsRef = useRef<
    Record<PropertyType, { sw: mapboxgl.LngLat; ne: mapboxgl.LngLat }[]>
  >({
    detached: [],
    strata: [],
    multifamily: [],
    land: [],
  });

  const getPropertyData = async (
    pid: string,
    propertyType: "strata" | "detached",
  ) => {
    let formattedPid;
    if (pid.includes("-")) {
      formattedPid = pid;
    } else {
      formattedPid = formatPid(pid);
    }

    console.log("formattedPid:", formattedPid);
    const table = propertyType === "strata" ? "strata" : "parcels";

    try {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .eq("pid", formattedPid)
        .single();

      if (error) {
        if (error.code === "PGRST116") return;
        console.error("Unexpected Supabase error:", error);
        return null;
      }

      if (!data) return null;

      if (propertyType === "strata" && data.gis_id) {
        const { data: relatedStrata, error: strataError } = await supabase
          .from("strata")
          .select("*")
          .eq("gis_id", data.gis_id);

        if (strataError) {
          console.error("Error fetching related strata:", strataError);
        }

        return {
          property: data,
          relatedStrata: relatedStrata || [],
        };
      }

      return { property: data };
    } catch (err) {
      console.error("Unexpected fetch error:", err);
    }
  };

  const getStatusImage = (status: string, type: PropertyType) => {
    if (type === "strata") {
      if (status === "Active" || status === "Active Under Contract") {
        return "url('/images/Strata-Active.png')";
      } else if (status === "Pending" || status === "Closed") {
        return "url('/images/Strata-Sold.png')";
      }
      return "url('/images/Strata-Others.png')";
    } else {
      if (status === "Active" || status === "Active Under Contract") {
        return "url('/images/Detached-Active.png')";
      } else if (status === "Pending" || status === "Closed") {
        return "url('/images/Detached-Sold.png')";
      }
      return "url('/images/Detached-Others.png')";
    }
  };

  const createMarkerElement = (status: string, type: PropertyType) => {
    const el = document.createElement("div");
    el.style.width = "60px";
    el.style.height = "60px";
    el.style.backgroundSize = "100%";
    el.style.cursor = "pointer";
    el.style.zIndex = "0";
    el.style.backgroundImage = getStatusImage(status, type);
    return el;
  };

  const addClickListener = (
    el: HTMLElement,
    listing: any,
    listingType: PropertyType,
    isLoggedIn: boolean,
    onAccessDenied: (clickedItem: any) => void,
  ) => {
    el.addEventListener("click", async (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();

      console.log(listing);
      const status = listing.market_status;
      const isAccessDenied =
        !isLoggedIn && !["Active", "Active Under Contract"].includes(status);

      if (isAccessDenied) {
        onAccessDenied(listing);
        return;
      }

      setActivePopup({
        source: "listing",
        pid: listing.pid,
        propertyType: listingType,
        data: listing,
        lngLat: [Number(listing.longitude), Number(listing.latitude)],
      });

      // console.log(`Access Granted for PID: ${listing.pid}`);

      // const popupContent = await createListingPopupContent(
      //   listing,
      //   listingType,
      // );

      // const map = mapRef.current;
      // if (!map) return;

      // new mapboxgl.Popup({ offset: 15 })
      //   .setLngLat([Number(listing.longitude), Number(listing.latitude)])
      //   .setDOMContent(popupContent)
      //   .addTo(map);

      // Open standard popup logic here if applicable
    });
  };

  const renderMarkers = (
    listings: any[],
    isLoggedIn: boolean,
    onAccessDenied: (item: any) => void,
  ) => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    listings.forEach((listing) => {
      const lat = parseFloat(listing.latitude);
      const lng = parseFloat(listing.longitude);

      if (isNaN(lat) || isNaN(lng)) return;

      const listingType: PropertyType = listing.property_type || "detached";
      const markerEl = createMarkerElement(listing.market_status, listingType);

      addClickListener(
        markerEl,
        listing,
        listingType,
        isLoggedIn,
        onAccessDenied,
      );

      const marker = new mapboxgl.Marker(markerEl)
        .setLngLat([lng, lat])
        .addTo(map);

      markersRef.current.push(marker);
    });
  };

  const getAllListings = async (type: PropertyType) => {
    const map = mapRef.current;
    if (!map) return;

    const bounds = map.getBounds();
    if (!bounds) {
      console.error("Unable to get map bounds");
      return;
    }
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const activeCache = cachedBoundsRef.current[type];
    const isAlreadyCached = activeCache.some((cached) => {
      return (
        sw.lat >= cached.sw.lat &&
        ne.lat <= cached.ne.lat &&
        sw.lng >= cached.sw.lng &&
        ne.lng <= cached.ne.lng
      );
    });

    if (isAlreadyCached) {
      console.log(
        `ℹ️ View area already queried for [${type}]. Using existing markers.`,
      );
      return;
    }

    try {
      const { data, error } = await supabase.rpc("get_listings_in_bounds", {
        min_lat: sw.lat.toString().trim(),
        max_lat: ne.lat.toString().trim(),
        min_lng: sw.lng.toString().trim(),
        max_lng: ne.lng.toString().trim(),
        table_name: tableMapping[type],
      });

      if (error) throw error;

      const fetchedData = (data as any[]) || [];
      cachedBoundsRef.current[type].push({ sw, ne });

      setAllUniqueListings((prevMap) => {
        const targetCategoryData = prevMap[type];
        const existingIds = new Set(
          targetCategoryData.map((item: any) => item.pid || item.id),
        );

        const freshListings = fetchedData
          .filter((item: any) => !existingIds.has(item.pid || item.id))
          .map((item: any) => ({
            ...item,
            property_type: type,
          }));

        return {
          ...prevMap,
          [type]: [...targetCategoryData, ...freshListings],
        };
      });
    } catch (err) {
      console.error(`Fetch error on category [${type}]:`, err);
    }
  };

  const createListingPopupContent = async (
    listing: any,
    type: PropertyType,
  ): Promise<HTMLDivElement> => {
    const container = document.createElement("div");
    container.className = "popup-clickable-container";
    container.style.cursor = "pointer";
    let specsLine = "";
    if (type !== "land") {
      // Show Beds and Baths for residential structures
      const beds = listing.bedrooms || 0;
      const baths = getBathrooms(listing.full_baths, listing.half_baths);
      specsLine = `Beds ${beds} | Baths ${baths} | `;
    }
    const localDefaultPlaceholder = "/images/Default-Card.jpg";

    let innerHTML = "";
    if (type === "detached" || type === "multifamily" || type === "land") {
      const targetUrl = `/listing/landing/${type}/${listing.pid}/${formatString(listing.civic_address)}`;
      // Assumes getCardImage is imported or declared in your file
      const imgSrc = getS3Image(listing, type, "card");
      await preloadImage(imgSrc);
      innerHTML = `
          <img
      src="${imgSrc}"
      alt="${listing.civic_address || "Property preview"}"
      class="h-48 w-full object-cover transition-opacity duration-300"
      loading="lazy"
      onerror="this.onerror=null; this.src='${localDefaultPlaceholder}';"
    />
        <div class="bottom-left">
        <p>
         ${formatPrice(listing.asking_price)}<br/>
          ${listing.civic_address}<br/>
          ${listing.neighbourhood} | ${listing.postal_code}<br/>
          ${specsLine} Floor Area ${listing.total_floor_area ? `${formatNumber(listing.total_floor_area)} sf` : "—"}<br/>
          Lot Size ${listing.lot_size ? `${formatNumber(listing.lot_size)} sf` : "—"}<br/>
          MLS® ${listing.mls_number}<br/>
          Listing By ${listing.listing_office}<br/>
        </p>
        </div>
      `;
      container.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        // router.push(targetUrl);
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      });
    } else if (type === "strata") {
      if (listing.gis_id) {
        const { data: relatedStrata, error: strataError } = await supabase
          .from("strata_listings")
          .select("*")
          .eq("gis_id", listing.gis_id);

        if (strataError) {
          console.error("Error fetching related strata:", strataError);
        }

        const units = relatedStrata ?? [];

        const dropdownOptions = units
          .sort((a: any, b: any) => {
            const getNumbers = (address: string) =>
              address.match(/\d+/g)?.map(Number) || [];

            const aNums = getNumbers(a.civic_address);
            const bNums = getNumbers(b.civic_address);

            // Sort by street number (1365)
            const streetCompare = aNums[1] - bNums[1];

            if (streetCompare !== 0) {
              return streetCompare;
            }

            // Sort by unit number (301, 403, 407)
            return aNums[0] - bNums[0];
          })
          .map((unit: any) => {
            return `<option value="${unit.pid}|${unit.civic_address}">
            ${unit.civic_address}
        </option>`;
          })
          .join("");

        const imgSrc = getS3Image(listing, type, "card");
        await preloadImage(imgSrc);

        innerHTML = `
      <div class="popup-card default-cursor">
       <img
      src="${imgSrc}"
      alt="${listing.civic_address || "Property preview"}"
      class="h-48 w-full object-cover transition-opacity duration-300"
      loading="lazy"
      onerror="this.onerror=null; this.src='${localDefaultPlaceholder}';"
    />
        <div class="popup-content">
          <p class="popup-address">${listing.neighbourhood || "Squamish"} | ${listing.postal_code}</p>
          <div class="field-group">
            <label class="popup-label">Select Unit:</label>
            <select id="strata-unit-select" class="popup-select">${dropdownOptions}</select>
          </div>
          <button id="view-unit-btn" class="popup-btn-primary">
            View Property Details
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      `;

        setTimeout(() => {
          const viewBtn = container.querySelector(
            "#view-unit-btn",
          ) as HTMLButtonElement;
          viewBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            const select = container.querySelector(
              "#strata-unit-select",
            ) as HTMLSelectElement;
            const [selectedPid, selectedAddress] = select.value.split("|");
            const formattedAddress = formatString(selectedAddress);
            const targetUrl = `/listing/landing/strata/${selectedPid}/${formattedAddress}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
          });
        }, 0);
      }
    }

    container.innerHTML = `<style>${popupStyles}</style>${innerHTML}`;

    return container;
  };

  const createPropertyPopupContent = async (
    result: any,
    type: "detached" | "strata",
  ): Promise<HTMLDivElement> => {
    const container = document.createElement("div");
    container.className = "popup-clickable-container";
    container.style.cursor = "pointer";
    const localDefaultPlaceholder = "/images/Default-Card.jpg";

    let innerHTML = "";
    if (type === "detached") {
      const property = result.property;
      const targetUrl = `/property/landing/detached/${property.pid}/${formatString(property.civic_address)}`;
      // Assumes getCardImage is imported or declared in your file
      const imgSrc = getS3Image(property, type, "card");
      await preloadImage(imgSrc);
      innerHTML = `
          <img
      src="${imgSrc}"
      alt="${property.civic_address || "Property preview"}"
      class="h-48 w-full object-cover transition-opacity duration-300"
      loading="lazy"
      onerror="this.onerror=null; this.src='${localDefaultPlaceholder}';"
    />
        <div class="bottom-left">
        <p>
          ${property.civic_address}<br/>
          ${property.neighbourhood} | ${property.postal_code}<br/>
          Beds ${property.bedrooms} | Baths ${property.bathrooms} | Floor Area ${property.floor_area ? `${formatNumber(property.floor_area)} sf` : "—"}<br/>
          Lot Size ${property.lot_size ? `${formatNumber(property.lot_size)} sf` : "—"}
        </p>
        </div>
      `;
      container.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        window.open(targetUrl, "_blank", "noopener,noreferrer");
      });
    } else if (type === "strata") {
      const { property, relatedStrata } = result;
      const dropdownOptions = relatedStrata
        .sort((a: any, b: any) => {
          const getNumbers = (address: string) =>
            address.match(/\d+/g)?.map(Number) || [];

          const aNums = getNumbers(a.civic_address);
          const bNums = getNumbers(b.civic_address);

          // Sort by street number (1365)
          const streetCompare = aNums[1] - bNums[1];

          if (streetCompare !== 0) {
            return streetCompare;
          }

          // Sort by unit number (301, 403, 407)
          return aNums[0] - bNums[0];
        })
        .map((unit: any) => {
          return `<option value="${unit.pid}|${unit.civic_address}">
            ${unit.civic_address}
        </option>`;
        })
        .join("");

      const imgSrc = getS3Image(property, type, "card");
      await preloadImage(imgSrc);

      innerHTML = `
      <div class="popup-card default-cursor">
        <img
      src="${imgSrc}"
      alt="${property.civic_address || "Property preview"}"
      class="h-48 w-full object-cover transition-opacity duration-300"
      loading="lazy"
      onerror="this.onerror=null; this.src='${localDefaultPlaceholder}';"
    />
        <div class="popup-content">
          <p class="popup-address">${property.neighbourhood} | ${property.postal_code}</p>
          <div class="field-group">
            <label class="popup-label">Select Unit:</label>
            <select id="strata-unit-select" class="popup-select">${dropdownOptions}</select>
          </div>
          <button id="view-unit-btn" class="popup-btn-primary">
            View Property Details
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </button>
        </div>
      </div>
      `;

      setTimeout(() => {
        const viewBtn = container.querySelector(
          "#view-unit-btn",
        ) as HTMLButtonElement;
        viewBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          e.preventDefault();
          const select = container.querySelector(
            "#strata-unit-select",
          ) as HTMLSelectElement;
          const [selectedPid, selectedAddress] = select.value.split("|");
          const formattedAddress = formatString(selectedAddress);
          const targetUrl = `/property/landing/strata/${selectedPid}/${formattedAddress}`;
          window.open(targetUrl, "_blank", "noopener,noreferrer");
        });
      }, 0);
    }

    container.innerHTML = `<style>${popupStyles}</style>${innerHTML}`;
    return container;
  };

  const addDataLayer = () => {
    const map = mapRef.current;
    if (!map) return;

    map.addSource("property-parcels", {
      type: "vector",
      url: "mapbox://nmandiveyi.bpay4n4t",
      hover: true,
    });

    map.addLayer({
      id: "parcel-outline",
      type: "line",
      source: "property-parcels",
      "source-layer": "BCGW_Squamish-81aj2l",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "black", "line-width": 2, "line-blur": 2 },
    });

    map.addLayer({
      id: "parcels-fill",
      type: "fill",
      source: "property-parcels",
      "source-layer": "BCGW_Squamish-81aj2l",
      layout: {},
      paint: {
        "fill-color": "transparent",
        "fill-opacity": 0.3,
        "fill-outline-color": "black",
      },
    });

    map.addLayer({
      id: "houses-highlighted",
      type: "line",
      source: "property-parcels",
      "source-layer": "BCGW_Squamish-81aj2l",
      layout: { "line-join": "round", "line-cap": "round" },
      paint: { "line-color": "blue", "line-width": 3, "line-blur": 2 },
      filter: ["in", "OBJECTID", ""],
    });
  };

  const init = usePersistFn(async () => {
    if (mapRef.current) return;

    (mapboxgl as any).accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapContainer.current) return;

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/nmandiveyi/ckwmqtgv305f514mnn23k7yax",
      center: center,
      zoom: 16,
      bearing: 0,
      pitch: 0,
      cooperativeGestures: false,
    });

    const map = mapRef.current;
    if (!map) return;

    const geocoder = new MapboxGeocoder({
      accessToken: (mapboxgl as any).accessToken,
      mapboxgl: mapboxgl as any,
    });

    map.addControl(geocoder);

    const styles: MapboxStyleDefinition[] = [
      {
        title: "Satellite",
        uri: "mapbox://styles/nmandiveyi/cmm2v93tw000z01rd5hkv4lo0",
      },
      {
        title: "Street",
        uri: "mapbox://styles/nmandiveyi/cmm0agb82001401r6hbvx53hc",
      },
      {
        title: "Light",
        uri: "mapbox://styles/nmandiveyi/cmm2vbl3c001001rd97n5fs01",
      },
      {
        title: "Dark",
        uri: "mapbox://styles/nmandiveyi/cmm2vcmoi008601pthfxf4knk",
      },
      {
        title: "Outdoors",
        uri: "mapbox://styles/nmandiveyi/cmm2veh9q008701ptefzwc2u0",
      },
    ];

    const styleSwitcher = new MapboxStyleSwitcherControl(styles, "Satellite");
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(styleSwitcher as unknown as mapboxgl.IControl);
    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();
    map.dragPan.enable();

    map.on("style.load", () => {
      addDataLayer();
      getAllListings("detached");
      getAllListings("strata");
      getAllListings("multifamily");
      getAllListings("land");

      setMapLoaded(true);
    });

    map.on("moveend", () => {
      getAllListings("detached");
      getAllListings("strata");
      getAllListings("multifamily");
      getAllListings("land");
    });

    map.on("click", "parcels-fill", async (e) => {
      if (!e.features?.length) return;

      const feature = e.features[0];
      const props = feature.properties;
      if (!props) return;

      const raw_pid = props.PID;
      const propertyType =
        props.CLASS === "Building Strata" ? "strata" : "detached";
      const getProperty = await getPropertyData(raw_pid, propertyType);

      if (!getProperty) return;

      setActivePopup({
        source: "parcel",
        pid: raw_pid,
        propertyType: propertyType,
        lngLat: [e.lngLat.lng, e.lngLat.lat],
        objectId: props.OBJECTID,
      });

      // const popupContent = await createPropertyPopupContent(
      //   getProperty,
      //   propertyType,
      // );

      // new mapboxgl.Popup({ offset: 15 })
      //   .setLngLat([
      //     Number(getProperty.property.longitude),
      //     Number(getProperty.property.latitude),
      //   ])
      //   .setDOMContent(popupContent)
      //   .addTo(map);

      // map.setFilter("houses-highlighted", ["in", "OBJECTID", props.OBJECTID]);
    });

    map.on("mouseenter", "parcels-fill", function () {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", "parcels-fill", function () {
      map.getCanvas().style.cursor = "";
    });

    if (onMapReady) {
      onMapReady(map);
    }
  });

  // Base map init trigger
  useEffect(() => {
    init();
  }, [init]);

  // useEffect(() => {
  //   const combinedPool = [
  //     ...allUniqueListings.detached,
  //     ...allUniqueListings.strata,
  //     ...allUniqueListings.multifamily,
  //     ...allUniqueListings.land,
  //   ];

  //   if (combinedPool.length > 0) {
  //     renderMarkers(combinedPool, isLoggedIn, setLockedListing);
  //   }
  // }, [allUniqueListings, isLoggedIn, renderMarkers, setLockedListing]);

  // --- RE-BUILT REACTIVE PIPELINE FILTERING MARKERS BY STATUS ---
  useEffect(() => {
    // Gather all listings from the raw sub-tables
    const absolutePool = [
      ...allUniqueListings.detached,
      ...allUniqueListings.strata,
      ...allUniqueListings.multifamily,
      ...allUniqueListings.land,
    ];

    // Filter current viewport pool based on active status toggles
    const activeMarkersPool = absolutePool.filter((listing) => {
      const status = listing.market_status;

      // Unauthenticated users only see "Active" listings on map
      if (!isLoggedIn) {
        return ["Active", "Active Under Contract"].includes(status);
      }

      // Authenticated users follow the checked filter keys array
      if (
        selectedStatuses.includes("Active") &&
        ["Active", "Active Under Contract"].includes(status)
      )
        return true;
      if (selectedStatuses.includes("Pending") && status === "Pending")
        return true;
      if (selectedStatuses.includes("Expired") && status === "Expired")
        return true;
      if (selectedStatuses.includes("Terminated") && status === "Terminated")
        return true;
      if (selectedStatuses.includes("Closed") && status === "Closed")
        return true;

      return false;
    });

    renderMarkers(activeMarkersPool, isLoggedIn, setLockedListing);
  }, [allUniqueListings, selectedStatuses, isLoggedIn]);

  useEffect(() => {
    const map = mapRef.current;

    console.log("useEffect:", activePopup);

    if (!map || !mapLoaded) return;

    const renderPopup = async () => {
      console.log("In renderPopup");
      // 1. Clean up existing popups / filters to prevent duplicates
      if (currentPopupRef.current) {
        console.log("Removing currentPopupRef");
        currentPopupRef.current.remove();
        currentPopupRef.current = null;
      }
      if (map.getLayer("houses-highlighted")) {
        console.log("Removing houses-highlighted");
        map.setFilter("houses-highlighted", ["in", "OBJECTID", ""]);
      }

      // 2. If activePopup was set to null (e.g. user closed it), abort here.
      if (!activePopup) return;

      let popupContent: HTMLDivElement | null = null;

      console.log("still in renderPopup");
      console.log("activePopup:", activePopup.source);

      // 3. Generate content based on source
      if (activePopup.source === "listing") {
        popupContent = await createListingPopupContent(
          activePopup.data,
          activePopup.propertyType,
        );
      } else if (activePopup.source === "parcel") {
        console.log("activePopup:", activePopup);
        const getProperty = await getPropertyData(
          activePopup.pid,
          activePopup.propertyType,
        );
        if (getProperty) {
          console.log("getProperty:", getProperty);
          popupContent = await createPropertyPopupContent(
            getProperty,
            activePopup.propertyType,
          );

          // Restore blue parcel highlight
          if (activePopup.objectId && map.getLayer("houses-highlighted")) {
            map.setFilter("houses-highlighted", [
              "in",
              "OBJECTID",
              activePopup.objectId,
            ]);
          }
        }
      }

      // 4. Mount the Mapbox Popup
      if (popupContent) {
        console.log("popupContent:");
        const popup = new mapboxgl.Popup({ offset: 15 })
          .setLngLat(activePopup.lngLat)
          .setDOMContent(popupContent)
          .addTo(map);

        currentPopupRef.current = popup;

        // Optional: Ensure the popup is centered when coming back to the map
        map.easeTo({
          center: activePopup.lngLat,
          offset: [0, 100],
          duration: 800,
        });
      }
    };

    renderPopup();
  }, [activePopup, mapLoaded]);

  const toggleStatusFilter = (status: MarketStatusType) => {
    if (!isLoggedIn) return; // Prevent selection mutations if logged out

    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  };
  return (
    <div className={cn("relative w-full h-screen")}>
      {/* Your Map Canvas Element */}
      <div ref={mapContainer} className="w-full h-full" />

      {/* FLOATING STATUS PILLS FILTER PANEL - ULTRA COMPACT */}
      <div className="absolute top-4 left-4 z-50 bg-white/95 backdrop-blur-md p-1.5 rounded-lg border border-gray-200/60 shadow-md w-[115px]">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 block px-1">
            Status
          </span>
          {[
            { id: "Active" as MarketStatusType, label: "Active" },
            { id: "Closed" as MarketStatusType, label: "Sold" },
            { id: "Pending" as MarketStatusType, label: "Pending" },
            { id: "Expired" as MarketStatusType, label: "Expired" },
            { id: "Terminated" as MarketStatusType, label: "Terminated" },
          ].map((pill) => {
            const isSelected = isLoggedIn
              ? selectedStatuses.includes(pill.id)
              : pill.id === "Active";

            return (
              <TooltipProvider key={pill.id} delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex w-full">
                      <button
                        key={pill.id}
                        type="button"
                        aria-disabled={!isLoggedIn}
                        onClick={() => {
                          if (!isLoggedIn) return;
                          toggleStatusFilter(pill.id);
                        }}
                        className={cn(
                          "w-full px-2 py-1 text-[11px] font-medium rounded-md border transition-all flex items-center justify-between gap-1 select-none",
                          isSelected
                            ? "bg-primary border-primary text-white font-semibold"
                            : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100/80 hover:text-gray-800",
                          !isLoggedIn &&
                            (pill.id === "Active"
                              ? "opacity-100 cursor-not-allowed"
                              : "opacity-40 bg-transparent text-gray-400 cursor-not-allowed hover:bg-transparent"),
                        )}
                      >
                        <span className="truncate">{pill.label}</span>

                        {!isLoggedIn && pill.id !== "Active" && (
                          <Lock
                            className="size-2.5 shrink-0 opacity-60"
                            strokeWidth={2.5}
                          />
                        )}
                      </button>
                    </span>
                  </TooltipTrigger>

                  {!isLoggedIn && pill.id !== "Active" && (
                    <TooltipContent
                      side="right"
                      align="end"
                      sideOffset={8}
                      className="bg-zinc-900 text-white text-[11px] px-3 py-1.5 rounded-md shadow-lg border border-zinc-800"
                    >
                      Login or register to view
                      <TooltipArrow className="fill-zinc-900" />
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
              // <button
              //   key={pill.id}
              //   type="button"
              //   disabled={!isLoggedIn}
              //   onClick={() => toggleStatusFilter(pill.id)}
              //   className={cn(
              //     "w-full px-2 py-1 text-[11px] font-medium rounded-md border transition-all flex items-center justify-between gap-1 cursor-pointer select-none",
              //     isSelected
              //       ? "bg-primary border-primary text-white font-semibold"
              //       : "bg-transparent border-transparent text-gray-500 hover:bg-gray-100/80 hover:text-gray-800",
              //     !isLoggedIn &&
              //       (pill.id === "Active"
              //         ? "opacity-100 cursor-not-allowed"
              //         : "opacity-40 bg-transparent text-gray-400 cursor-not-allowed hover:bg-transparent"),
              //   )}
              // >
              //   <span className="truncate">{pill.label}</span>
              //   {!isLoggedIn && pill.id !== "Active" && (
              //     <Lock
              //       className="size-2.5 shrink-0 opacity-60"
              //       strokeWidth={2.5}
              //     />
              //   )}
              // </button>
            );
          })}
        </div>
      </div>

      {/* USER LOCKED MODAL OVERLAY */}
      {lockedListing && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop Overlay */}
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300 cursor-pointer"
            onClick={() => setLockedListing(null)}
          />

          {/* Modal Core Container */}
          <div className="relative w-full max-w-sm bg-white rounded-none border border-border shadow-2xl p-8 animate-in zoom-in-95 duration-300 text-center">
            <button
              onClick={() => setLockedListing(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 text-sm font-semibold tracking-wide"
              aria-label="Close modal"
            >
              ✕
            </button>

            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-muted border border-border flex items-center justify-center">
                <Lock size={28} className="text-primary" strokeWidth={1.5} />
              </div>
            </div>

            <h3 className="text-lg font-bold text-foreground mb-2 uppercase tracking-tighter">
              Member Access Required
            </h3>

            <p className="text-muted-foreground text-[11px] mb-8 leading-relaxed uppercase tracking-wider">
              To view historical data for{" "}
              <span className="text-foreground font-bold">
                {lockedListing.civic_address || "this property"}
              </span>
              , please sign in. Real Estate Board rules require user
              registration.
            </p>

            <div className="space-y-3">
              <Button
                className="w-full bg-primary"
                onClick={() =>
                  router.push(
                    `/login?callback=${encodeURIComponent(window.location.pathname)}`,
                  )
                }
              >
                Sign In
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  router.push(
                    `/register?callback=${encodeURIComponent(window.location.pathname)}`,
                  )
                }
              >
                Create Account
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
