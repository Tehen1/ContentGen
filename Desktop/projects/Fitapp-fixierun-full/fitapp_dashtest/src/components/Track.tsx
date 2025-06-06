import React, { useState, useEffect } from 'react';
import Map from 'react-map-gl';

const Track = () => {
  const [isTracking, setIsTracking] = useState(false);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [time, setTime] = useState(0);
  const [calories, setCalories] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTracking) {
      interval = setInterval(() => {
        // Mettre à jour les métriques ici
        setTime((prev) => prev + 1);
        setDistance((prev) => prev + 0.1); // Exemple de distance
        setSpeed((prev) => prev + 0.1); // Exemple de vitesse
        setCalories((prev) => prev + 0.5); // Exemple de calories
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTracking]);

  const startTracking = () => {
    setIsTracking(true);
    // Initialiser la position
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        setRoute([[longitude, latitude]]);
      });
    }
  };

  const stopTracking = () => {
    setIsTracking(false);
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-center mb-4">
        <button
          onClick={isTracking ? stopTracking : startTracking}
          className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          {isTracking ? 'Arrêter' : 'Démarrer'}
        </button>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Distance</h3>
          <p className="text-2xl">{distance.toFixed(2)} km</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Vitesse</h3>
          <p className="text-2xl">{speed.toFixed(1)} km/h</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Temps</h3>
          <p className="text-2xl">{time} secondes</p>
        </div>
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Calories</h3>
          <p className="text-2xl">{calories.toFixed(1)} kcal</p>
        </div>
      </div>

      <div className="h-64 rounded-lg overflow-hidden">
        <Map
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/streets-v11"
          initialViewState={{
            latitude: 48.8566,
            longitude: 2.3522,
            zoom: 12
          }}
        >
          {/* Marqueurs de localisation */}
        </Map>
      </div>
    </div>
  );
};

export default Track;