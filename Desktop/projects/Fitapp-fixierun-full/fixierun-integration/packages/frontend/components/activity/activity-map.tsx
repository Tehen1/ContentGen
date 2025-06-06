"use client"

import { useState, useEffect, useRef } from "react"
import Map, { Marker, Source, Layer, type LineLayer } from "react-map-gl"
import { useGeolocation } from "@/hooks/use-geolocation"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import "mapbox-gl/dist/mapbox-gl.css"
import type { FeatureCollection, LineString } from "geojson"

const lineLayer: LineLayer = {
  id: "route",
  type: "line",
  layout: {
    "line-join": "round",
    "line-cap": "round",
  },
  paint: {
    "line-color": "#3b82f6",
    "line-width": 4,
  },
}

export default function ActivityMap() {
  const mapRef = useRef<any>(null)
  const { location, error: locationError } = useGeolocation({ enableHighAccuracy: true })
  const [viewState, setViewState] = useState({
    longitude: -122.4,
    latitude: 37.8,
    zoom: 14,
  })
  const [routeData, setRouteData] = useState<FeatureCollection>({
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "LineString",
          coordinates: [],
        },
      },
    ],
  })

  // Update map view when location changes
  useEffect(() => {
    if (location) {
      setViewState({
        longitude: location.coords.longitude,
        latitude: location.coords.latitude,
        zoom: 15,
      })

      // Add point to route
      const newCoordinates = [
        ...(routeData.features[0].geometry as LineString).coordinates,
        [location.coords.longitude, location.coords.latitude],
      ]

      // Only add point if it's different from the last one
      if (
        newCoordinates.length <= 1 ||
        newCoordinates[newCoordinates.length - 1][0] !== newCoordinates[newCoordinates.length - 2][0] ||
        newCoordinates[newCoordinates.length - 1][1] !== newCoordinates[newCoordinates.length - 2][1]
      ) {
        setRouteData({
          ...routeData,
          features: [
            {
              ...routeData.features[0],
              geometry: {
                ...routeData.features[0].geometry,
                coordinates: newCoordinates,
              },
            },
          ],
        })
      }
    }
  }, [location])

  if (locationError) {
    return (
      <Card>
        <CardContent className="pt-6">
          <Alert>
            <AlertDescription>
              Location access is required to display the map. Please enable location services in your browser.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-[500px]">
      <CardContent className="p-0 h-full">
        <Map
          ref={mapRef}
          mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          {...viewState}
          onMove={(evt) => setViewState(evt.viewState)}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          style={{ width: "100%", height: "100%" }}
        >
          {location && (
            <>
              <Marker longitude={location.coords.longitude} latitude={location.coords.latitude} color="#3b82f6" />
              <Source id="route-data" type="geojson" data={routeData}>
                <Layer {...lineLayer} />
              </Source>
            </>
          )}
        </Map>
      </CardContent>
    </Card>
  )
}
