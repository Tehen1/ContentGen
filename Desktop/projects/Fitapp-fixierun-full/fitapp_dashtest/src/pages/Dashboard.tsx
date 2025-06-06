import React from 'react';

const Dashboard = () => {
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord FixieRun</h1>
      <div className="stats-container">
        <div className="stat-box">
          <h2>Distance totale</h2>
          <p>0 km</p>
        </div>
        <div className="stat-box">
          <h2>Temps d'activité</h2>
          <p>0 heures</p>
        </div>
        <div className="stat-box">
          <h2>Tokens gagnés</h2>
          <p>0 $FIXIE</p>
        </div>
      </div>
      <div className="map-container">
        <h2>Vos trajets récents</h2>
        {/* Carte d'affichage des trajets */}
      </div>
    </div>
  );
};

export default Dashboard;