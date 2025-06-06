import React, { useEffect } from "react";
import dynamic from "next/dynamic";
import { logInfo, logWarn, logError } from "../utils/logging";
import GoogleFitAPI from "../utils/googleFit";
import { useGeolocation } from "../hooks/useGeolocation";
import { useSafeLeafletMap } from "../hooks/useSafeLeafletMap";
import DynamicSEO from "../components/seo/DynamicSEO";

// Because Leaflet uses the DOM, we SSR-safeguard with dynamic import for CSS (optional)
// import "leaflet/dist/leaflet.css"; // Uncomment if needed and ensure style loader support

const mapContainerId = "demo-leaflet-map";

/**
 * Demo component showing logging, Google Fit API guard, geolocation UI, safe Leaflet usage.
 */
const DemoPage: React.FC = () => {
  // Geolocation usage
  const { coords, error: geoError, loading: geoLoading } = useGeolocation();

  // Safe Leaflet map hook - only when window exists
  useSafeLeafletMap(mapContainerId, {
    center: [48.8584, 2.2945], // Default: Paris
    zoom: 13,
  });

  // Google Fit API setup and demonstrative data sync
  useEffect(() => {
    try {
      // Singleton initialization
      const fitApi = GoogleFitAPI.getInstance();
      fitApi.syncData();
      logInfo("Google Fit data sync called from demo page");
    } catch (e) {
      logError("Error during Google Fit initialization:", e);
    }
  }, []);

  // Demonstrate improved logging and catch all errors
  useEffect(() => {
    logInfo("DemoPage mounted: logging utilities are now in use", {
      time: new Date().toISOString(),
    });

    if (coords) {
      logInfo("Geolocation acquired:", coords);
    }
    if (geoError) {
      logWarn("Geolocation error:", geoError);
    }
  }, [coords, geoError]);

  return (
    <>
      <DynamicSEO 
        title="FixieRun Demo: Tech & Features"
        description="Explore our demo page showcasing key technologies: Geolocation tracking, Leaflet maps integration, Google Fit API, and structured logging for the FixieRun fitness application."
        keywords={[
          "fitness app demo", 
          "geolocation tracking", 
          "fitness map integration", 
          "activity tracking demo",
          "web3 fitness features",
          "fitness app technology"
        ]}
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "FixieRun Technology Demo",
          "description": "Technical demonstration of FixieRun's fitness tracking capabilities",
          "isPartOf": {
            "@type": "WebSite",
            "name": "FixieRun - Web3 Fitness App",
            "url": "https://fixierun.com"
          }
        }}
      />
      <div className="min-h-screen flex flex-col gap-6 p-8 items-center justify-center bg-gray-50 dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-blue-700 dark:text-blue-300 mb-4">
        Demo: Logging, Google Fit, Geolocation, Leaflet
      </h1>

      <section className="w-full max-w-xl p-4 border rounded-lg bg-white dark:bg-gray-800 shadow">
        <h2 className="font-semibold mb-2">1. Logging</h2>
        <p>
          Check your browser console: <br />
          <span className="text-xs text-gray-400">(Info, warnings, errors, objects logged in readable format.)</span>
        </p>
      </section>

      <section className="w-full max-w-xl p-4 border rounded-lg bg-white dark:bg-gray-800 shadow">
        <h2 className="font-semibold mb-2">2. Google Fit API (Singleton)</h2>
        <button
          className="btn btn-blue mb-2"
          onClick={() => {
            try {
              const fitApi = GoogleFitAPI.getInstance();
              fitApi.syncData();
              logInfo("Google Fit syncData called via button");
            } catch (e) {
              logError("Google Fit sync call error:", e);
            }
          }}
        >
          Sync Google Fit Data
        </button>
        <p className="text-xs text-gray-500">API is singleton: try clicking multiple times, see only one initialization in console.</p>
      </section>

      <section className="w-full max-w-xl p-4 border rounded-lg bg-white dark:bg-gray-800 shadow">
        <h2 className="font-semibold mb-2">3. Geolocation</h2>
        {geoLoading && <div>Loading geolocation...</div>}
        {!geoLoading && coords && (
          <div>
            <b>Your position:</b> Lat {coords.latitude}, Lon {coords.longitude}
          </div>
        )}
        {!geoLoading && geoError && (
          <div className="text-red-500 mt-2">
            <b>
              {geoError === "policy-blocked"
                ? "Geolocation is disabled by browser policy."
                : geoError === "permission-denied"
                ? "Please enable location permissions in your browser."
                : geoError === "not-supported"
                ? "Geolocation is not supported on this device."
                : "Unable to retrieve geolocation (" + geoError + ")"}
            </b>
          </div>
        )}
      </section>

      <section className="w-full max-w-xl p-4 border rounded-lg bg-white dark:bg-gray-800 shadow">
        <h2 className="font-semibold mb-2">4. Leaflet Map (Safe Init/Destroy)</h2>
        <div
          id={mapContainerId}
          style={{
            width: "100%",
            height: "280px",
            border: "1px solid #555",
            borderRadius: "12px",
            margin: "0 auto",
            background: "#ddd",
          }}
        >
          {/* Leaflet map will render here */}
        </div>
        <span className="text-xs text-gray-600">
          Map initializes only once per mount/unmount. No duplicate errors.
        </span>
      </section>
    </div>
  );
};

export default DemoPage;