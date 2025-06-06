import React, { useState, useEffect, useContext, lazy, Suspense } from 'react';
import { Web3Context } from '../context/Web3Context';
import axios from 'axios';
import PropTypes from 'prop-types';

// Chargement paresseux pour Kepler.gl
const DynamicKepler = lazy(() => 
  import('@kepler.gl/components').then((mod) => ({
    default: mod.KeplerGl
  }))
);

const HeatmapViewer = ({ userId = null }) => {
  const { account } = useContext(Web3Context);
  const [mapData, setMapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      try {
        const endpoint = userId 
          ? `/api/heatmap/${userId}`
          : '/api/heatmap/global';
          
        const response = await axios.get(endpoint);
        setMapData(response.data.heatmap);
      } catch (error) {
        console.error("Error fetching heatmap:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [userId, account]);

  if (loading) return <div>Loading heatmap...</div>;

  return (
    <div className="heatmap-container" style={{ height: '600px' }}>
      {mapData && (
        <Suspense fallback={<div>Loading map visualization...</div>}>
          <DynamicKepler
            id="kepler-gl"
            width="100%"
            height="100%"
            mapboxApiAccessToken={import.meta.env.VITE_MAPBOX_API_KEY || ''}
            initialState={JSON.parse(mapData)}
          />
        </Suspense>
      )}
    </div>
  );
};

// Define PropTypes for the component
HeatmapViewer.propTypes = {
  userId: PropTypes.string
};

// Default props
HeatmapViewer.defaultProps = {
  userId: null
};

export default HeatmapViewer;
