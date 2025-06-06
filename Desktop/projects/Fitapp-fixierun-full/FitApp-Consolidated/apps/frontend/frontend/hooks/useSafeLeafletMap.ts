import { useEffect, useRef } from "react";
import L, { Map as LeafletMap } from "leaflet";

/**
 * Safely creates and destroys a Leaflet map instance.
 * @param {string} containerId - The DOM id where you want to initialize the map.
 * @param {L.MapOptions} options - Options for the Leaflet map.
 * @returns {React.MutableRefObject<LeafletMap | null>} - Ref to the Leaflet map instance.
 */
export function useSafeLeafletMap(containerId: string, options?: L.MapOptions) {
  const mapRef = useRef<LeafletMap | null>(null);

  useEffect(() => {
    // Prevent duplicate map initialization
    if (mapRef.current) return;

    const container = document.getElementById(containerId);

    if (!container) {
      console.warn(`Container with id "${containerId}" not found for Leaflet map.`);
      return;
    }

    // If map is already attached, remove previous instance
    if ((container as any)._leaflet_id) {
      // Remove existing map instance
      (container as any)._leaflet_id = null;
      container.innerHTML = "";
    }
    // Initialize map
    mapRef.current = L.map(containerId, options);

    return () => {
      // Properly dispose of map on unmount
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // NOTE: options should be stable or memoized to avoid re-running effect
    // eslint-disable-next-line
  }, [containerId]);

  return mapRef;
}