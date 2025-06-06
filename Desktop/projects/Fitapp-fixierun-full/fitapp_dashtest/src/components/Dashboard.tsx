import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from 'next-themes';

const Dashboard = () => {
  const { theme } = useTheme();
  const activities = [
    { date: '01/01', distance: 5, calories: 450 },
    { date: '01/02', distance: 6, calories: 480 },
    { date: '01/03', distance: 5.5, calories: 420 },
    { date: '01/04', distance: 7, calories: 520 },
    { date: '01/05', distance: 6.2, calories: 500 },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Tableau de bord</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Statistiques</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-300">Distance totale</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">42 km</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-300">Calories brûlées</span>
                <span className="font-bold text-green-600 dark:text-green-400">2,400 kcal</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="dark:text-gray-300">Temps d'activité</span>
                <span className="font-bold text-purple-600 dark:text-purple-400">18h</span>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Activités récentes</h2>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 pl-4 dark:border-blue-400">
                <p className="font-medium dark:text-gray-200">Course du 01/05</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">7 km - 520 calories</p>
              </div>
              <div className="border-l-4 border-green-500 pl-4 dark:border-green-400">
                <p className="font-medium dark:text-gray-200">Vélo du 01/04</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">6 km - 480 calories</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Progression hebdomadaire</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activities}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="distance" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="calories" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-8 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4 dark:text-gray-200">Carte d'activités</h2>
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-lg">
            {/* Map implementation will go here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;