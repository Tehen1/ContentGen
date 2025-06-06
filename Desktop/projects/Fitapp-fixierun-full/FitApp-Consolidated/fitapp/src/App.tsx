import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './App.css'

// Configure Mapbox
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN as string

function App() {
  const [fitnessData, setFitnessData] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState('')
  const [loading, setLoading] = useState(true)

  // Connect to Web3 and get account
  async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.send("eth_requestAccounts", [])
        
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        }
      } catch (error) {
        console.error("Error connecting to wallet:", error)
      }
    } else {
      alert("Please install MetaMask to use this feature!")
    }
  }

  // Load fitness data from local API
  useEffect(() => {
    const loadFitnessData = async () => {
      try {
        setLoading(true)
        // In a real app, this would fetch from the API
        // const response = await fetch(`${import.meta.env.VITE_API_URL}/fitness-data`)
        // const data = await response.json()
        
        // For demo purposes, we'll use mock data
        const mockData = [
          { date: '2023-01-01', steps: 8000, calories: 2100, distance: 5.2 },
          { date: '2023-01-02', steps: 10000, calories: 2300, distance: 6.5 },
          { date: '2023-01-03', steps: 7500, calories: 2000, distance: 4.8 },
          { date: '2023-01-04', steps: 12000, calories: 2500, distance: 7.8 },
          { date: '2023-01-05', steps: 9000, calories: 2200, distance: 5.9 },
        ]
        
        setFitnessData(mockData)
        setLoading(false)
      } catch (error) {
        console.error("Error loading fitness data:", error)
        setLoading(false)
      }
    }

    loadFitnessData()
  }, [])

  // Initialize map when component mounts
  useEffect(() => {
    if (!loading && fitnessData.length > 0) {
      const mapContainer = document.getElementById('map')
      
      if (mapContainer) {
        const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/streets-v11',
          center: [-74.5, 40], // Default center (New York)
          zoom: 9
        })

        // Cleanup on unmount
        return () => map.remove()
      }
    }
  }, [loading, fitnessData])

  return (
    <div className="app-container">
      <header>
        <h1>FitApp</h1>
        <div className="wallet-section">
          {!isConnected ? (
            <button onClick={connectWallet} className="connect-button">
              Connect Wallet
            </button>
          ) : (
            <div className="account-info">
              Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}
            </div>
          )}
        </div>
      </header>

      <main>
        <section className="dashboard">
          <h2>Fitness Dashboard</h2>
          
          {loading ? (
            <div className="loading">Loading your fitness data...</div>
          ) : (
            <>
              <div className="stats-container">
                {fitnessData.length > 0 && (
                  <>
                    <div className="stat-card">
                      <h3>Steps</h3>
                      <p className="stat-value">{fitnessData[fitnessData.length - 1].steps}</p>
                      <p className="stat-label">Latest Day</p>
                    </div>
                    
                    <div className="stat-card">
                      <h3>Calories</h3>
                      <p className="stat-value">{fitnessData[fitnessData.length - 1].calories}</p>
                      <p className="stat-label">Latest Day</p>
                    </div>
                    
                    <div className="stat-card">
                      <h3>Distance</h3>
                      <p className="stat-value">{fitnessData[fitnessData.length - 1].distance} km</p>
                      <p className="stat-label">Latest Day</p>
                    </div>
                  </>
                )}
              </div>

              <div className="data-section">
                <div className="chart-container">
                  <h3>Activity Overview</h3>
                  <p>Chart visualization would go here</p>
                </div>
                
                <div className="map-container">
                  <h3>Activity Map</h3>
                  <div id="map" style={{ width: '100%', height: '300px' }}></div>
                </div>
              </div>

              <div className="data-table">
                <h3>Recent Activity</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Steps</th>
                      <th>Calories</th>
                      <th>Distance (km)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fitnessData.map((day, index) => (
                      <tr key={index}>
                        <td>{day.date}</td>
                        <td>{day.steps}</td>
                        <td>{day.calories}</td>
                        <td>{day.distance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </main>

      <footer>
        <p>&copy; {new Date().getFullYear()} FitApp - Your Fitness on the Blockchain</p>
      </footer>
    </div>
  )
}

export default App
