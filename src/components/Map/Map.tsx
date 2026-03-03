
/// <reference types="@types/google.maps" />

import { useEffect, useRef } from "react";
import { usePersistFn } from "@/hooks/usePersistFn";
import * as mapboxgl from 'mapbox-gl';
import type { LngLatLike } from 'mapbox-gl';
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder';
import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css';
import {MapboxStyleDefinition, MapboxStyleSwitcherControl} from 'mapbox-gl-style-switcher';
import 'mapbox-gl-style-switcher/styles.css';
import { cn, formatPid } from "@/lib/utils";
import { supabase } from "@/config/supabaseClient";
import {popupStyles} from './popupStyles';

const flyToCenter: LngLatLike = [-123.152797, 49.699331];


interface MapViewProps {
  className?: string;
  onMapReady?: (map: mapboxgl.Map) => void;
}

export function MapView({
  className,
  onMapReady

}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement | null>(null); // Ref for map container
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const getPropertyData = async (
  pid: string,
  propertyType: 'strata' | 'detached'
  ) => {
    const formattedPid = formatPid(pid);
    const table = propertyType === 'strata' ? 'strata' : 'parcels';

    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq('pid', formattedPid)
        .single();

      // If data is not found, just exit silently
      if (error) {
        if (error.code === 'PGRST116') return; // "No rows found" error, ignore
        console.error('Unexpected Supabase error:', error);
        return null ;
      }

      if (!data) return null;

      if (propertyType === 'strata' && data.gis_id) {
        const { data: relatedStrata, error: strataError } = await supabase
          .from('strata')
          .select('*')
          .eq('gis_id', data.gis_id);

        if (strataError) {
          console.error('Error fetching related strata:', strataError);
        }

        return {
          property: data,
          relatedStrata: relatedStrata || []
        };
      }

      return { property: data };

    } catch (err) {
      console.error('Unexpected fetch error:', err);  
    }
  };

  const createPopupContent = (
  result: any,
  type: 'detached' | 'strata'
): HTMLDivElement => {
  const container = document.createElement('div');

  // Inner content HTML depending on type
  let innerHTML = '';
  if (type === 'detached') {
    const property = result.property;
    innerHTML = `
        <img 
        src="/images/Default-Card.jpg" 
        alt="Property Image" 
        width="1000" 
        height="600"
        />
        <div class="bottom-left">
        <p>
          ${property.civic_address}<br/>
          ${property.neighbourhood} | ${property.postal_code}<br/>
          Beds ${property.bedrooms} | Baths ${property.bathrooms} | Floor Area ${property.floor_area}<br/>
          Lot Size ${property.lot_size}
        </p>
        </div>
    `;
  } else if (type === 'strata') {
    const { property, relatedStrata } = result;

    const dropdownOptions = relatedStrata
      .map((unit: any) => {
        return `<option value="${unit.civic_address}">
                  ${unit.civic_address}
                </option>`;
      })
      .join('');

      innerHTML = `
    <div class="popup-card">

      <!-- Image -->
      <img 
        src="/images/Default-Card.jpg" 
        alt="Strata Property" 
        class="popup-image"
      />

      <!-- Property Info -->
      <div class="popup-content">
        <p class="popup-address">
          ${property.neighbourhood} | ${property.postal_code}
        </p>

        <label class="popup-label">Select Unit:</label>
        <select id="strata-unit-select" class="popup-select">
          ${dropdownOptions}
        </select>

        <div id="unit-details" class="popup-details">
          <!-- Selected unit details will render here -->
        </div>
      </div>
    </div>
  `;
  }

  container.innerHTML = `
    <style>${popupStyles}</style>
    ${innerHTML}
  `;

  return container;
  };

  const init = usePersistFn(async () => {

    if (mapRef.current) return; // initialize map only once

    (mapboxgl as any).accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;
    if (!mapContainer.current) {
      console.error("Map container not found");
      return;
    }

    mapRef.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/nmandiveyi/ckwmqtgv305f514mnn23k7yax",
      center: flyToCenter,
      zoom: 16,
      bearing: 0,
      pitch: 0,
      cooperativeGestures: false
    });

  
    const map = mapRef.current;
    if (!map) return;

    const geocoder = new MapboxGeocoder({
        accessToken: (mapboxgl as any).accessToken,
        mapboxgl: mapboxgl as any
    });
  
    map.addControl(geocoder);


    const styles: MapboxStyleDefinition[] = [
        {
            title: "Satellite",
            uri:"mapbox://styles/nmandiveyi/cmm2v93tw000z01rd5hkv4lo0"
        },
        {
            title: "Street",
            uri:"mapbox://styles/nmandiveyi/cmm0agb82001401r6hbvx53hc"
        }, 
        {
            title: "Light",
            uri:"mapbox://styles/nmandiveyi/cmm2vbl3c001001rd97n5fs01"
        },
        {
            title: "Dark",
            uri:"mapbox://styles/nmandiveyi/cmm2vcmoi008601pthfxf4knk"
        }, 
        {
            title: "Outdoors",
            uri:"mapbox://styles/nmandiveyi/cmm2veh9q008701ptefzwc2u0"
        }
      ];

    const styleSwitcher = new MapboxStyleSwitcherControl(styles, 'Satellite');
    map.addControl(new mapboxgl.FullscreenControl());
    map.addControl(styleSwitcher as unknown as mapboxgl.IControl);

    map.addControl(new mapboxgl.NavigationControl());
    map.scrollZoom.disable();
    map.dragPan.enable();
    map.on("style.load", () => {
      addDataLayer();
    });

    map.on('click', 'parcels-fill', async (e) => {
      if (!e.features?.length) return;

      const feature = e.features[0];
      const props = feature.properties;
      if (!props) return;

      const raw_pid = props.PID;
      const propertyType = props.CLASS === 'Building Strata' ? 'strata' : 'detached';

      // Fetch property data
      const getProperty = await getPropertyData(raw_pid, propertyType);

      if (!getProperty) return; // silently skip if not found

      const popupContent = createPopupContent(getProperty, propertyType);

      new mapboxgl.Popup({ offset: 15 })
      .setLngLat([Number(getProperty.property.longitude), Number(getProperty.property.latitude)])
      .setDOMContent(popupContent) // TypeScript now knows it's a Node
      .addTo(map);

      // Highlight the clicked parcel
      map.setFilter('houses-highlighted', [
        'in',
        'OBJECTID',
        props.OBJECTID
      ]);
    });

    // Change the cursor to a pointer when the mouse is over the states layer.
    map.on('mouseenter', 'parcels-fill', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

      // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'parcels-fill', function () {
        map.getCanvas().style.cursor = '';
    });

    if (onMapReady) {
      onMapReady(map);
    }
  });

  

  const addDataLayer = () => {
      const map = mapRef.current;
      if (!map) return;

      map.addSource('property-parcels', {
        type: 'vector',
        url: 'mapbox://nmandiveyi.bpay4n4t',
        hover: true,
      })

      map.addSource('points', {
        'type': 'geojson',
        'data': {
        'type': 'FeatureCollection',
        'features': [
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.142436,
                    49.761050
                        ]
                    }
                },
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.132769,
                    49.739052
                        ]
                    }
                },
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.152797,
                    49.699331
                        ]
                    }
                },
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.140778,
                    49.723844
                        ]
                    }
                },
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.133609,
                    49.700974
                        ]
                    }
                },
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.098531,
                    49.737180

                        ]
                    }
                },
            {
                'type': 'Feature',
                'properties': {},
                'geometry': {
                'type': 'Point',
                'coordinates': [
                    -123.112242,
                    49.740384
                        ]
                    }
                }
            ]
        }
        });

      map.addLayer({
        'id': 'parcel-outline',
        'type': 'line',
        'source': 'property-parcels',
        'source-layer': 'BCGW_Squamish-81aj2l',
        'layout': {
        'line-join': 'round',
        'line-cap': 'round'
        },
        'paint': {
        'line-color': 'black',
        'line-width': 2,
        'line-blur': 2,
        }, 
        });

      map.addLayer({
      'id': 'parcels-fill',
      'type': 'fill',
      'source': 'property-parcels',
      'source-layer': 'BCGW_Squamish-81aj2l',
      'layout': {
      },
      'paint': {
      'fill-color': 'transparent',
      'fill-opacity': 0.3,
      'fill-outline-color': 'black'
      }
      });

      map.addLayer(
        {
        'id': 'houses-highlighted',
        'type': 'line',
        'source': 'property-parcels',
        'source-layer': 'BCGW_Squamish-81aj2l',
        'layout': {
        'line-join': 'round',
        'line-cap': 'round'
        },
        'paint': {
        'line-color': 'blue',
        'line-width': 3,
        'line-blur': 2,
        },
        'filter': ['in', 'OBJECTID', '']
        }

        );
          
    }

  useEffect(() => {
    init();
  }, [init]);

  return (
    <div ref={mapContainer} className={cn("w-full h-[500px]", className)} />
  );
}
