<!DOCTYPE html><html lang="en"><head><meta http-equiv="Content-Security-Policy" content="default-src 'self' 'unsafe-inline' 'unsafe-eval' data: blob: https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://code.jquery.com https://unpkg.com https://d3js.org https://threejs.org https://cdn.plot.ly https://stackpath.bootstrapcdn.com https://maps.googleapis.com https://cdn.tailwindcss.com https://ajax.googleapis.com https://kit.fontawesome.com https://cdn.datatables.net https://maxcdn.bootstrapcdn.com https://code.highcharts.com https://tako-static-assets-production.s3.amazonaws.com https://www.youtube.com https://fonts.googleapis.com https://fonts.gstatic.com https://pfst.cf2.poecdn.net https://puc.poecdn.net https://i.imgur.com https://wikimedia.org https://*.icons8.com https://*.giphy.com https://picsum.photos https://images.unsplash.com; frame-src 'self' https://www.youtube.com https://trytako.com; child-src 'self'; manifest-src 'self'; worker-src 'self'; upgrade-insecure-requests; block-all-mixed-content;">
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FixieRun - Earn $FIXIE Tokens While Running</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin="">
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#5D5CDE',
                        secondary: '#9898E6',
                        dark: {
                            bg: '#181818',
                            card: '#242424',
                            text: '#E0E0E0'
                        }
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>
    <style>
        @keyframes slideIn {
            0% { transform: translateY(-20px); opacity: 0; }
            100% { transform: translateY(0); opacity: 1; }
        }
        .slide-in {
            animation: slideIn 0.3s ease-out forwards;
        }
        .modal-backdrop {
            backdrop-filter: blur(4px);
            background-color: rgba(0, 0, 0, 0.5);
        }
    </style>
</head>
<body class="bg-white dark:bg-dark-bg text-gray-800 dark:text-dark-text transition-colors min-h-screen">
    <div class="container mx-auto px-4 py-8 max-w-md">
        <header class="text-center mb-8">
            <h1 class="text-3xl font-bold mb-1 text-primary">FixieRun</h1>
            <p class="text-gray-600 dark:text-gray-400">Earn $FIXIE Tokens While Running</p>
        </header>

        <div class="bg-gray-100 dark:bg-dark-card rounded-lg shadow-md p-6 mb-6">
            <div class="text-center mb-6">
                <h2 id="timer" class="text-4xl font-mono font-bold">00:00:00</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">Run or bike to earn $FIXIE token rewards!</p>
            </div>

            <div class="flex justify-center gap-4 mb-6">
                <div class="flex-1">
                    <p class="text-center text-gray-700 dark:text-gray-300 mb-1">Mode:</p>
                    <div class="flex rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                        <button id="runMode" class="flex-1 py-2 px-4 bg-primary text-white font-medium text-center">Run</button>
                        <button id="bikeMode" class="flex-1 py-2 px-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium text-center">Bike</button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-3 gap-4 mb-6">
                <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Distance</p>
                    <p id="distance" class="text-xl font-bold">0.0 km</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">Speed</p>
                    <p id="speed" class="text-xl font-bold">0.0 km/h</p>
                </div>
                <div class="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm text-center">
                    <p class="text-sm text-gray-600 dark:text-gray-400">$FIXIE Tokens</p>
                    <div class="flex items-center justify-center">
                        <p id="nftPoints" class="text-xl font-bold">0</p>
                        <span id="pointsAdded" class="text-green-500 ml-1 opacity-0 transition-opacity">+1</span>
                    </div>
                </div>
            </div>

            <div class="mb-6">
                <button id="startButton" class="w-full py-3 px-4 bg-primary hover:bg-opacity-90 active:bg-opacity-80 text-white font-semibold rounded-md shadow-sm transition-all">START RUN</button>
                <button id="finishButton" class="w-full py-3 px-4 bg-red-500 hover:bg-opacity-90 active:bg-opacity-80 text-white font-semibold rounded-md shadow-sm transition-all mt-2 hidden">FINISH</button>
            </div>

            <div id="nextRewardContainer" class="bg-secondary bg-opacity-20 dark:bg-opacity-10 rounded-md p-3 text-center mb-6">
                <p class="text-sm text-gray-600 dark:text-gray-400">Next $FIXIE reward at:</p>
                <p id="nextReward" class="text-lg font-semibold text-primary">5.0 km</p>
            </div>
            
            <div id="mapContainer" class="h-64 rounded-lg overflow-hidden shadow-md">
                <div id="map" class="h-full w-full"></div>
            </div>
        </div>
    </div>

    <!-- Modal for showing rewards -->
    <div id="rewardModal" class="fixed inset-0 flex items-center justify-center z-50 hidden">
        <div class="modal-backdrop absolute inset-0"></div>
        <div class="bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 w-11/12 max-w-sm z-10 slide-in text-center">
            <h3 class="text-2xl font-bold mb-2">Congratulations!</h3>
            <p class="mb-4">You've earned new $FIXIE tokens!</p>
            <div class="bg-primary bg-opacity-10 dark:bg-opacity-20 rounded-lg p-4 mb-4">
                <p id="modalPoints" class="text-xl font-bold text-primary">+5 $FIXIE Tokens</p>
                <p id="modalDistance" class="text-md">5.0 km completed</p>
            </div>
            <button id="continueButton" class="py-2 px-6 bg-primary hover:bg-opacity-90 text-white font-semibold rounded-md shadow-sm">Continue Running</button>
        </div>
    </div>

    <script>
        // Initialize dark mode
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        });
        
        // Enhanced Map System
        let map = null;
        let routePolyline = null;
        let userMarker = null;
        let routePoints = [];
        let heatLayer = null;
        let elevationControl = null;
        let distanceMarkers = [];
        let mapLayers = {
            openstreetmap: null,
            cyclosm: null,
            stamen: null
        };
        
        // Initialize map with enhanced features
        function initMap(lat, lng) {
            // Create map centered on user's location
            map = L.map('map', {
                zoomControl: false, // We'll add it in a better position
                attributionControl: true
            }).setView([lat, lng], 16);
            
            // Add multiple map layer sources (all free)
            mapLayers.openstreetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                maxZoom: 19,
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map); // Default layer
            
            mapLayers.cyclosm = L.tileLayer('https://{s}.tile-cyclosm.openstreetmap.fr/cyclosm/{z}/{x}/{y}.png', {
                maxZoom: 20,
                attribution: '<a href="https://github.com/cyclosm/cyclosm-cartocss-style/releases" title="CyclOSM - Open Bicycle render">CyclOSM</a> | Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            });
            
            mapLayers.stamen = L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png', {
                attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> | Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
                subdomains: 'abcd',
                minZoom: 0,
                maxZoom: 18
            });
            
            // Add layer control
            L.control.layers({
                "Standard": mapLayers.openstreetmap,
                "Cycling": mapLayers.cyclosm,
                "Terrain": mapLayers.stamen
            }, {}).addTo(map);
            
            // Add zoom control in the top right
            L.control.zoom({
                position: 'topright'
            }).addTo(map);
            
            // Add scale control
            L.control.scale({
                imperial: false,
                metric: true,
                position: 'bottomright'
            }).addTo(map);
            
            // Add custom user marker with pulse effect
            const pulseIcon = L.divIcon({
                className: 'pulse-icon',
                html: '<div class="pulse-marker"><div class="pulse-core"></div><div class="pulse-ring"></div></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            });
            
            userMarker = L.marker([lat, lng], {
                icon: pulseIcon,
                zIndexOffset: 1000 // Ensure it's always on top
            }).addTo(map);
            
            // Add custom CSS for the pulsing marker
            const style = document.createElement('style');
            style.textContent = `
                .pulse-marker {
                    position: relative;
                }
                .pulse-core {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 12px;
                    height: 12px;
                    background: #5D5CDE;
                    border-radius: 50%;
                    z-index: 2;
                }
                .pulse-ring {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: rgba(93, 92, 222, 0.3);
                    z-index: 1;
                    animation: pulse 1.5s ease-out infinite;
                }
                @keyframes pulse {
                    0% {
                        transform: translate(-50%, -50%) scale(0.5);
                        opacity: 1;
                    }
                    100% {
                        transform: translate(-50%, -50%) scale(1.2);
                        opacity: 0;
                    }
                }
                .distance-marker {
                    background-color: #5D5CDE;
                    color: white;
                    border-radius: 50%;
                    width: 24px;
                    height: 24px;
                    line-height: 24px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 12px;
                }
            `;
            document.head.appendChild(style);
            
            // Initialize route with styling options
            routePolyline = L.polyline([], {
                color: '#5D5CDE',
                weight: 5,
                opacity: 0.8,
                lineCap: 'round',
                lineJoin: 'round',
                dashArray: null
            }).addTo(map);
            
            routePoints = [[lat, lng]];
            
            // Add location routing (simulated for this demo)
            addControlPlaceholder('bottomleft');
            const locationRouting = L.control({position: 'bottomleft'});
            locationRouting.onAdd = function(map) {
                const div = L.DomUtil.create('div', 'leaflet-routing');
                div.innerHTML = `
                    <button id="elevationBtn" class="px-2 py-1 bg-white dark:bg-gray-700 rounded-md shadow-sm text-xs mr-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M11.354 3.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L12.793 6l-1.439-1.439a.5.5 0 0 1 0-.708z"/>
                            <path d="M4.354 3.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L5.793 6 4.354 4.854a.5.5 0 0 1 0-.708z"/>
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0-13a6 6 0 1 0 0 12 6 6 0 0 0 0-12z"/>
                        </svg>
                    </button>
                    <button id="clearRouteBtn" class="px-2 py-1 bg-white dark:bg-gray-700 rounded-md shadow-sm text-xs">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                            <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h12zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2z"/>
                            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                        </svg>
                    </button>
                `;
                return div;
            };
            locationRouting.addTo(map);
            
            // Event listeners for map controls
            setTimeout(() => {
                document.getElementById('elevationBtn')?.addEventListener('click', showElevationProfile);
                document.getElementById('clearRouteBtn')?.addEventListener('click', clearRoute);
            }, 100);
        }
        
        // Helper function to create control placeholders
        function addControlPlaceholder(position) {
            const className = 'leaflet-' + position;
            const placeholder = L.DomUtil.create('div', className);
            placeholder.style.position = 'absolute';
            placeholder.style.zIndex = 10;
            
            if (position.indexOf('bottom') !== -1) {
                placeholder.style.bottom = '10px';
            }
            if (position.indexOf('top') !== -1) {
                placeholder.style.top = '10px';
            }
            if (position.indexOf('left') !== -1) {
                placeholder.style.left = '10px';
            }
            if (position.indexOf('right') !== -1) {
                placeholder.style.right = '10px';
            }
            
            return placeholder;
        }
        
        // Clear route data
        function clearRoute() {
            if (!map) return;
            
            // Clear route display
            routePoints = [routePoints[routePoints.length - 1]]; // Keep current position
            routePolyline.setLatLngs(routePoints);
            
            // Clear distance markers
            distanceMarkers.forEach(marker => map.removeLayer(marker));
            distanceMarkers = [];
            
            // Remove elevation profile if displayed
            if (elevationControl) {
                map.removeControl(elevationControl);
                elevationControl = null;
            }
        }
        
        // Show elevation profile using Open-Elevation API (free)
        function showElevationProfile() {
            if (!map || routePoints.length < 2) return;
            
            if (elevationControl) {
                // If already showing, remove it
                map.removeControl(elevationControl);
                elevationControl = null;
                return;
            }
            
            // Create a sampling of points (not all points to avoid API overload)
            let sampledPoints = [];
            if (routePoints.length > 100) {
                // Take every Nth point
                const sampleRate = Math.floor(routePoints.length / 100);
                for (let i = 0; i < routePoints.length; i += sampleRate) {
                    sampledPoints.push(routePoints[i]);
                }
                // Ensure last point is included
                if (sampledPoints[sampledPoints.length - 1] !== routePoints[routePoints.length - 1]) {
                    sampledPoints.push(routePoints[routePoints.length - 1]);
                }
            } else {
                sampledPoints = [...routePoints];
            }
            
            // Create mock elevation data (since we can't make actual API calls in this demo)
            // In a real implementation, you would call the Open-Elevation API:
            // https://api.open-elevation.com/api/v1/lookup
            
            // Mock elevation data
            const elevationData = {
                results: sampledPoints.map((point, index) => {
                    // Create realistic-looking elevation pattern
                    let baseElevation = 100; // Base elevation in meters
                    let variation = Math.sin(index * 0.2) * 20; // Sine wave pattern with 20m amplitude
                    let randomness = Math.random() * 5; // Small random variation
                    
                    return {
                        latitude: point[0],
                        longitude: point[1],
                        elevation: baseElevation + variation + randomness
                    };
                })
            };
            
            // Create and show the elevation control
            elevationControl = L.control.elevation({
                position: 'bottomright',
                theme: 'magenta-theme',
                width: 300,
                height: 125,
                margins: {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 40
                },
                useHeightIndicator: true,
                interpolation: 'linear',
                hoverNumber: {
                    decimalsX: 2,
                    decimalsY: 0,
                    formatter: undefined
                },
                xTicks: 3,
                yTicks: 3,
                collapsed: false,
                imperial: false
            }).addTo(map);
            
            // Process the elevation data
            const data = elevationData.results.map((point, i) => ({
                x: i,
                y: point.elevation,
                latlng: L.latLng(point.latitude, point.longitude)
            }));
            
            // Add data to the elevation control
            elevationControl.addData(data);
        }
        
        // Enhanced map update function
        function updateMap(lat, lng) {
            if (!map) return;
            
            // Update user marker position
            userMarker.setLatLng([lat, lng]);
            
            // Add point to route
            routePoints.push([lat, lng]);
            routePolyline.setLatLngs(routePoints);
            
            // Add kilometer markers
            const routeLength = calculateRouteLength(routePoints);
            const lastKm = Math.floor(routeLength);
            const currentKm = Math.floor(calculateRouteLength([...routePoints].slice(0, -1)));
            
            if (lastKm > currentKm && lastKm > 0) {
                // We've passed a new kilometer mark, add a marker
                addDistanceMarker(lat, lng, lastKm);
            }
            
            // Recenter map if user moves near edge
            const bounds = map.getBounds();
            const latLngPoint = L.latLng(lat, lng);
            
            if (!bounds.contains(latLngPoint)) {
                map.panTo([lat, lng]);
            }
        }
        
        // Calculate total route length
        function calculateRouteLength(points) {
            let length = 0;
            for (let i = 1; i < points.length; i++) {
                length += calculateDistance(
                    points[i-1][0], points[i-1][1],
                    points[i][0], points[i][1]
                );
            }
            return length;
        }
        
        // Add a kilometer marker
        function addDistanceMarker(lat, lng, km) {
            const kmIcon = L.divIcon({
                className: 'distance-marker',
                html: km,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });
            
            const marker = L.marker([lat, lng], {
                icon: kmIcon,
                zIndexOffset: 900
            }).addTo(map);
            
            distanceMarkers.push(marker);
        }

        // Elements
        const timer = document.getElementById('timer');
        const distanceEl = document.getElementById('distance');
        const speedEl = document.getElementById('speed');
        const nftPointsEl = document.getElementById('nftPoints');
        const pointsAddedEl = document.getElementById('pointsAdded');
        const nextRewardEl = document.getElementById('nextReward');
        const startButton = document.getElementById('startButton');
        const finishButton = document.getElementById('finishButton');
        const runModeBtn = document.getElementById('runMode');
        const bikeModeBtn = document.getElementById('bikeMode');
        const rewardModal = document.getElementById('rewardModal');
        const modalPoints = document.getElementById('modalPoints');
        const modalDistance = document.getElementById('modalDistance');
        const continueButton = document.getElementById('continueButton');

        // State variables
        let isRunning = false;
        let startTime = null;
        let elapsedTime = 0;
        let timerInterval = null;
        let distance = 0;
        let speed = 0;
        let nftPoints = 0;
        let currentMode = 'Run'; // Default mode
        let watchId = null;
        let lastPosition = null;
        let nextRewardDistance = 5.0;
        let rewardsEarned = [];

        // Milestone rewards configuration
        const milestones = [
            { distance: 5.0, points: 5 },
            { distance: 10.0, points: 10 },
            { distance: 15.0, points: 15 },
            { distance: 20.0, points: 20 }
        ];

        // Format time as HH:MM:SS
        function formatTime(timeInSeconds) {
            const hours = Math.floor(timeInSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((timeInSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = Math.floor(timeInSeconds % 60).toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        }

        // Calculate distance between two coordinates using Haversine formula
        function calculateDistance(lat1, lon1, lat2, lon2) {
            const R = 6371; // Radius of the earth in km
            const dLat = deg2rad(lat2 - lat1);
            const dLon = deg2rad(lon2 - lon1);
            const a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2); 
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
            const distance = R * c; // Distance in km
            return distance;
        }

        function deg2rad(deg) {
            return deg * (Math.PI/180);
        }
        
        // *** Anti-Cheat System (Simplified) ***
        
        // Check for physical plausibility of movement
        function verifyMovement(prevLat, prevLng, prevTime, currLat, currLng, currTime) {
            // Calculate distance and time difference
            const distanceKm = calculateDistance(prevLat, prevLng, currLat, currLng);
            const timeDiffSec = (currTime - prevTime) / 1000;
            
            if (timeDiffSec <= 0) return { valid: false, reason: 'INVALID_TIME' };
            
            // Calculate speed in km/h
            const speedKmh = (distanceKm / timeDiffSec) * 3600;
            
            // Define thresholds based on activity type
            const thresholds = {
                'Run': {
                    maxSpeed: 35,  // km/h (faster than world record)
                    teleportThreshold: 0.2, // km (sudden movement of 200m+)
                    minSpeed: 1.5,  // km/h (very slow walking)
                },
                'Bike': {
                    maxSpeed: 100, // km/h (professional downhill)
                    teleportThreshold: 0.5, // km (sudden movement of 500m+)
                    minSpeed: 4,    // km/h (very slow cycling)
                }
            };
            
            const limits = thresholds[currentMode];
            
            // Check for teleportation (unrealistic instant movement)
            if (distanceKm > limits.teleportThreshold && timeDiffSec < 10) {
                return {
                    valid: false,
                    reason: 'TELEPORTATION',
                    details: `Moved ${(distanceKm * 1000).toFixed(0)}m in ${timeDiffSec.toFixed(1)}s`
                };
            }
            
            // Check if speed exceeds physical capabilities
            if (speedKmh > limits.maxSpeed) {
                return {
                    valid: false,
                    reason: 'EXCESSIVE_SPEED',
                    details: `Speed ${speedKmh.toFixed(1)}km/h exceeds maximum ${limits.maxSpeed}km/h`
                };
            }
            
            // Warn if movement is suspiciously perfect (exactly same speed)
            // In a real implementation, we'd track historical patterns here
            
            return { valid: true, speed: speedKmh };
        }
        
        // Apply detection for suspicious patterns
        let lastValidLocations = [];
        let suspiciousMovements = 0;
        const MAX_SUSPICIOUS = 3;
        
        function trackSuspiciousActivity(isValid, reason) {
            if (!isValid) {
                suspiciousMovements++;
                console.warn(`Suspicious movement detected: ${reason}`);
                
                if (suspiciousMovements >= MAX_SUSPICIOUS) {
                    return true; // Cheating detected
                }
            } else {
                // Gradually reduce suspicion count for valid movements
                if (suspiciousMovements > 0 && Math.random() < 0.3) {
                    suspiciousMovements--;
                }
            }
            return false; // Not yet confirmed as cheating
        }

        // Check if a new reward milestone has been reached
        function checkRewards(currentDistance) {
            for (const milestone of milestones) {
                if (currentDistance >= milestone.distance && !rewardsEarned.includes(milestone.distance)) {
                    rewardsEarned.push(milestone.distance);
                    showReward(milestone.points, milestone.distance);
                    return true;
                }
            }
            return false;
        }

        // Find the next reward milestone
        function updateNextReward(currentDistance) {
            for (const milestone of milestones) {
                if (currentDistance < milestone.distance) {
                    nextRewardDistance = milestone.distance;
                    nextRewardEl.textContent = `${milestone.distance.toFixed(1)} km`;
                    return;
                }
            }
            // If all rewards earned
            nextRewardEl.textContent = "All rewards earned!";
        }

        // Show reward modal
        function showReward(points, distance) {
            modalPoints.textContent = `+${points} $FIXIE Tokens`;
            modalDistance.textContent = `${distance.toFixed(1)} km completed`;
            rewardModal.classList.remove('hidden');
            
            // Add points to total
            addPoints(points);
        }

        // Add NFT points with animation
        function addPoints(points) {
            nftPoints += points;
            nftPointsEl.textContent = nftPoints;
            
            // Show +points animation
            pointsAddedEl.textContent = `+${points}`;
            pointsAddedEl.classList.remove('opacity-0');
            setTimeout(() => {
                pointsAddedEl.classList.add('opacity-0');
            }, 2000);
        }

        // GPS access status
        let useSimulatedLocation = false;
        let simulationInterval = null;
        
        // Show geolocation error message
        function showLocationError(error) {
            let errorMessage = "Location error: ";
            
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage += "Permission denied. Please enable location access in your browser settings.";
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage += "Location information is unavailable. This might be due to poor GPS signal.";
                    break;
                case error.TIMEOUT:
                    errorMessage += "Location request timed out. Please try again.";
                    break;
                default:
                    errorMessage += "Unknown error occurred. " + (error.message || "");
                    break;
            }
            
            console.error(errorMessage, error);
            
            // Create a modal to show the error and offer simulation mode
            const errorModal = document.createElement('div');
            errorModal.className = 'fixed inset-0 flex items-center justify-center z-50';
            errorModal.innerHTML = `
                <div class="absolute inset-0 bg-black bg-opacity-50"></div>
                <div class="relative bg-white dark:bg-dark-card rounded-lg shadow-xl p-6 w-11/12 max-w-md z-10">
                    <h3 class="text-xl font-bold mb-3 text-red-500">Location Access Error</h3>
                    <p class="mb-4">${errorMessage}</p>
                    <div class="flex flex-col space-y-3">
                        <button id="retryLocation" class="py-2 px-4 bg-primary hover:bg-opacity-90 text-white rounded-md">
                            Retry Location Access
                        </button>
                        <button id="useSimulation" class="py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-md">
                            Use Simulation Mode
                        </button>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Simulation mode allows you to test the app without real GPS. Use arrow keys to move.
                        </p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(errorModal);
            
            // Add event listeners to buttons
            document.getElementById('retryLocation').addEventListener('click', () => {
                document.body.removeChild(errorModal);
                startTracking();
            });
            
            document.getElementById('useSimulation').addEventListener('click', () => {
                document.body.removeChild(errorModal);
                startSimulationMode();
            });
        }
        
        // Start simulation mode
        function startSimulationMode() {
            useSimulatedLocation = true;
            
            // Default starting location (Central Park, New York)
            const startLat = 40.7812;
            const startLng = -73.9665;
            
            // Initialize the map with the starting location
            if (!map) {
                initMap(startLat, startLng);
            }
            
            // Create initial "position"
            const simulatedPosition = {
                coords: {
                    latitude: startLat,
                    longitude: startLng,
                    accuracy: 10,
                    altitude: 100,
                    altitudeAccuracy: 10,
                    heading: 90,
                    speed: 0
                },
                timestamp: Date.now()
            };
            
            // Set as last position
            lastPosition = simulatedPosition;
            
            // Add to valid locations for anti-cheat
            lastValidLocations.push({
                lat: simulatedPosition.coords.latitude,
                lng: simulatedPosition.coords.longitude,
                time: simulatedPosition.timestamp,
                speed: 0
            });
            
            // Show simulation mode indicator
            const simIndicator = document.createElement('div');
            simIndicator.className = 'fixed top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1 m-2 rounded-md z-50';
            simIndicator.id = 'simulationIndicator';
            simIndicator.innerHTML = 'SIMULATION MODE';
            document.body.appendChild(simIndicator);
            
            // Show simulation controls
            const simControls = document.createElement('div');
            simControls.className = 'fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-card bg-opacity-90 dark:bg-opacity-90 p-3 text-center z-40';
            simControls.innerHTML = `
                <div class="text-xs text-gray-700 dark:text-gray-300 mb-2">Simulation Controls</div>
                <div class="grid grid-cols-3 gap-2 max-w-xs mx-auto">
                    <div></div>
                    <button id="simUp" class="bg-primary text-white p-2 rounded text-center">↑</button>
                    <div></div>
                    <button id="simLeft" class="bg-primary text-white p-2 rounded text-center">←</button>
                    <button id="simPause" class="bg-red-500 text-white p-2 rounded text-center">■</button>
                    <button id="simRight" class="bg-primary text-white p-2 rounded text-center">→</button>
                    <div></div>
                    <button id="simDown" class="bg-primary text-white p-2 rounded text-center">↓</button>
                    <div></div>
                </div>
                <div class="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    You can also use keyboard arrow keys to move
                </div>
            `;
            document.body.appendChild(simControls);
            
            // Simulation variables
            let isSimulating = false;
            let simulationDirection = { lat: 0, lng: 0 };
            const SIMULATION_SPEED = 0.00002; // degrees per simulation tick
            
            // Simulation functions
            function updateSimulatedPosition() {
                if (!isSimulating) return;
                
                const now = Date.now();
                
                // Create new simulated position with movement in the current direction
                const newPosition = {
                    coords: {
                        latitude: lastPosition.coords.latitude + simulationDirection.lat,
                        longitude: lastPosition.coords.longitude + simulationDirection.lng,
                        accuracy: 10,
                        altitude: 100,
                        altitudeAccuracy: 10,
                        heading: calculateHeading(simulationDirection),
                        speed: calculateSpeed(simulationDirection)
                    },
                    timestamp: now
                };
                
                // Process the new position
                processPosition(newPosition);
            }
            
            function calculateHeading(direction) {
                // Calculate compass heading in degrees (0 = North, 90 = East, etc.)
                if (direction.lat === 0 && direction.lng === 0) return 0;
                return Math.atan2(direction.lng, direction.lat) * 180 / Math.PI;
            }
            
            function calculateSpeed(direction) {
                // Rough approximation of speed in m/s
                const latLngDist = Math.sqrt(direction.lat * direction.lat + direction.lng * direction.lng);
                return latLngDist * 111000 / 0.2; // 111km per degree, updated every 200ms
            }
            
            // Add event listeners for simulation controls
            function addSimulationEvents() {
                // Keyboard controls
                document.addEventListener('keydown', handleSimKeyDown);
                document.addEventListener('keyup', handleSimKeyUp);
                
                // Button controls
                document.getElementById('simUp').addEventListener('mousedown', () => setDirection('up', true));
                document.getElementById('simUp').addEventListener('mouseup', () => setDirection('up', false));
                document.getElementById('simDown').addEventListener('mousedown', () => setDirection('down', true));
                document.getElementById('simDown').addEventListener('mouseup', () => setDirection('down', false));
                document.getElementById('simLeft').addEventListener('mousedown', () => setDirection('left', true));
                document.getElementById('simLeft').addEventListener('mouseup', () => setDirection('left', false));
                document.getElementById('simRight').addEventListener('mousedown', () => setDirection('right', true));
                document.getElementById('simRight').addEventListener('mouseup', () => setDirection('right', false));
                document.getElementById('simPause').addEventListener('click', toggleSimulation);
                
                // Touch events for mobile
                document.getElementById('simUp').addEventListener('touchstart', () => setDirection('up', true));
                document.getElementById('simUp').addEventListener('touchend', () => setDirection('up', false));
                document.getElementById('simDown').addEventListener('touchstart', () => setDirection('down', true));
                document.getElementById('simDown').addEventListener('touchend', () => setDirection('down', false));
                document.getElementById('simLeft').addEventListener('touchstart', () => setDirection('left', true));
                document.getElementById('simLeft').addEventListener('touchend', () => setDirection('left', false));
                document.getElementById('simRight').addEventListener('touchstart', () => setDirection('right', true));
                document.getElementById('simRight').addEventListener('touchend', () => setDirection('right', false));
            }
            
            function handleSimKeyDown(e) {
                switch (e.key) {
                    case 'ArrowUp': setDirection('up', true); break;
                    case 'ArrowDown': setDirection('down', true); break;
                    case 'ArrowLeft': setDirection('left', true); break;
                    case 'ArrowRight': setDirection('right', true); break;
                    case ' ': toggleSimulation(); break;
                }
            }
            
            function handleSimKeyUp(e) {
                switch (e.key) {
                    case 'ArrowUp': setDirection('up', false); break;
                    case 'ArrowDown': setDirection('down', false); break;
                    case 'ArrowLeft': setDirection('left', false); break;
                    case 'ArrowRight': setDirection('right', false); break;
                }
            }
            
            function setDirection(dir, isActive) {
                switch (dir) {
                    case 'up':
                        simulationDirection.lat = isActive ? SIMULATION_SPEED : 0;
                        break;
                    case 'down':
                        simulationDirection.lat = isActive ? -SIMULATION_SPEED : 0;
                        break;
                    case 'left':
                        simulationDirection.lng = isActive ? -SIMULATION_SPEED : 0;
                        break;
                    case 'right':
                        simulationDirection.lng = isActive ? SIMULATION_SPEED : 0;
                        break;
                }
                
                // Start simulation if not already running and direction is set
                if (!isSimulating && (simulationDirection.lat !== 0 || simulationDirection.lng !== 0)) {
                    startSimulation();
                }
                
                // Stop simulation if no direction is set
                if (isSimulating && simulationDirection.lat === 0 && simulationDirection.lng === 0) {
                    stopSimulation();
                }
            }
            
            function toggleSimulation() {
                if (isSimulating) {
                    simulationDirection = { lat: 0, lng: 0 };
                    stopSimulation();
                } else {
                    simulationDirection = { lat: SIMULATION_SPEED, lng: 0 }; // Default: move north
                    startSimulation();
                }
            }
            
            function startSimulation() {
                if (!isSimulating) {
                    isSimulating = true;
                    simulationInterval = setInterval(updateSimulatedPosition, 200);
                    document.getElementById('simPause').textContent = '■';
                    document.getElementById('simPause').classList.remove('bg-green-500');
                    document.getElementById('simPause').classList.add('bg-red-500');
                }
            }
            
            function stopSimulation() {
                if (isSimulating) {
                    isSimulating = false;
                    clearInterval(simulationInterval);
                    document.getElementById('simPause').textContent = '▶';
                    document.getElementById('simPause').classList.remove('bg-red-500');
                    document.getElementById('simPause').classList.add('bg-green-500');
                }
            }
            
            // Add the simulation event listeners
            addSimulationEvents();
        }
        
        // Process position data - shared by both real GPS and simulation
        function processPosition(position) {
            const currentLat = position.coords.latitude;
            const currentLng = position.coords.longitude;
            
            // Initialize map on first position
            if (!map && currentLat && currentLng) {
                initMap(currentLat, currentLng);
            }
            
            // Update map with new position
            if (map && currentLat && currentLng) {
                updateMap(currentLat, currentLng);
            }
            
            if (lastPosition === null) {
                lastPosition = position;
                return;
            }

            // Verify the movement is legitimate
            const verification = verifyMovement(
                lastPosition.coords.latitude,
                lastPosition.coords.longitude,
                lastPosition.timestamp,
                position.coords.latitude,
                position.coords.longitude,
                position.timestamp
            );

            // Calculate new distance
            const newDistance = calculateDistance(
                lastPosition.coords.latitude,
                lastPosition.coords.longitude,
                position.coords.latitude,
                position.coords.longitude
            );
            
            // Check if this movement is suspicious
            const isCheating = trackSuspiciousActivity(verification.valid, verification.reason);
            
            // Apply anti-cheat mechanism
            if (verification.valid && !isCheating && newDistance < 0.1) { // Less than 100 meters
                // Valid movement detected
                
                // Update distance and display
                distance += newDistance;
                distanceEl.textContent = `${distance.toFixed(1)} km`;
                
                // Update speed from verification or calculate
                if (verification.speed) {
                    speed = verification.speed;
                } else {
                    const timeDiff = (position.timestamp - lastPosition.timestamp) / 1000;
                    if (timeDiff > 0) {
                        speed = (newDistance / timeDiff) * 3600; // Convert to km/h
                    }
                }
                speedEl.textContent = `${speed.toFixed(1)} km/h`;
                
                // Apply token rewards
                // Check if reward milestone reached
                if (checkRewards(distance)) {
                    // Reward was shown
                } else {
                    // Just add 1 point per 0.1 km (simplified)
                    if (Math.floor(distance * 10) > Math.floor((distance - newDistance) * 10)) {
                        addPoints(1);
                    }
                }
                
                // Track this as a valid location for comparison
                lastValidLocations.push({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    time: position.timestamp,
                    speed: speed
                });
                
                // Keep only the last 10 valid locations
                if (lastValidLocations.length > 10) {
                    lastValidLocations.shift();
                }

                // Update next reward
                updateNextReward(distance);
            } else if (isCheating) {
                // Cheating detected! In a real app, we would:
                // 1. Freeze rewards
                // 2. Store cheating evidence
                // 3. Notify server
                console.error("Cheating detected! Activity tracking suspended.");
                
                // Optional: Show warning to user
                // alert("Suspicious activity detected. Activity tracking paused.");
            }

            lastPosition = position;
        }
        
        // Start tracking with geolocation
        function startTracking() {
            if (navigator.geolocation) {
                lastPosition = null;
                
                // First try to get a one-time position to test if geolocation works
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        // If we can get the position once, set up continuous watching
                        watchId = navigator.geolocation.watchPosition(
                            processPosition,
                            (error) => {
                                console.error("Error during position watching:", error);
                                stopTracking();
                                showLocationError(error);
                            },
                            { 
                                enableHighAccuracy: true, 
                                maximumAge: 0,
                                timeout: 5000
                            }
                        );
                    },
                    (error) => {
                        console.error("Error getting initial position:", error);
                        showLocationError(error);
                    },
                    { 
                        enableHighAccuracy: true,
                        timeout: 10000,
                        maximumAge: 0
                    }
                );
            } else {
                // Geolocation not supported by this browser
                const error = {
                    code: 0,
                    message: "Geolocation is not supported by this browser."
                };
                showLocationError(error);
            }
        }

        // Stop tracking
        function stopTracking() {
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
        }

        // Start button click handler
        startButton.addEventListener('click', () => {
            if (!isRunning) {
                // Start the activity
                isRunning = true;
                startTime = new Date();
                startButton.classList.add('hidden');
                finishButton.classList.remove('hidden');
                
                // Start timer
                timerInterval = setInterval(() => {
                    const now = new Date();
                    elapsedTime = Math.floor((now - startTime) / 1000);
                    timer.textContent = formatTime(elapsedTime);
                }, 1000);

                // Start location tracking
                startTracking();

                // Update button text based on mode
                finishButton.textContent = `FINISH ${currentMode.toUpperCase()}`;
            }
        });

        // Finish button click handler
        finishButton.addEventListener('click', () => {
            if (isRunning) {
                // Stop the activity
                isRunning = false;
                clearInterval(timerInterval);
                stopTracking();
                
                finishButton.classList.add('hidden');
                startButton.classList.remove('hidden');
                startButton.textContent = `START ${currentMode.toUpperCase()}`;
            }
        });

        // Mode selection handlers
        runModeBtn.addEventListener('click', () => {
            if (!isRunning) {
                currentMode = 'Run';
                runModeBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                runModeBtn.classList.add('bg-primary', 'text-white');
                bikeModeBtn.classList.remove('bg-primary', 'text-white');
                bikeModeBtn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                startButton.textContent = `START ${currentMode.toUpperCase()}`;
            }
        });

        bikeModeBtn.addEventListener('click', () => {
            if (!isRunning) {
                currentMode = 'Bike';
                bikeModeBtn.classList.remove('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                bikeModeBtn.classList.add('bg-primary', 'text-white');
                runModeBtn.classList.remove('bg-primary', 'text-white');
                runModeBtn.classList.add('bg-gray-200', 'dark:bg-gray-700', 'text-gray-700', 'dark:text-gray-300');
                startButton.textContent = `START ${currentMode.toUpperCase()}`;
            }
        });

        // Continue button in reward modal
        continueButton.addEventListener('click', () => {
            rewardModal.classList.add('hidden');
        });

        // Close modal when clicking outside
        rewardModal.addEventListener('click', (e) => {
            if (e.target === rewardModal) {
                rewardModal.classList.add('hidden');
            }
        });

        // Add blockchain wallet integration simulation
        let walletAddress = null;
        let tokenBalance = 0;
        
        function simulateConnectWallet() {
            // In a real app, this would connect to MetaMask, WalletConnect, etc.
            return new Promise((resolve) => {
                setTimeout(() => {
                    // Generate random wallet address for demo
                    walletAddress = '0x' + Array.from({length: 40}, () => 
                        '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
                    resolve(walletAddress);
                }, 500);
            });
        }
        
        function updateTokenBalanceOnChain(amount) {
            // In a real app, this would call a smart contract function
            // For this demo, we'll just simulate the update
            tokenBalance += amount;
            console.log(`[BLOCKCHAIN] Added ${amount} $FIXIE tokens to ${walletAddress}`);
            console.log(`[BLOCKCHAIN] New balance: ${tokenBalance} $FIXIE`);
            
            // In a real app, we would emit an event with the transaction hash
            const mockTxHash = '0x' + Array.from({length: 64}, () => 
                '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
            
            return mockTxHash;
        }
        
        // Override the addPoints function to include blockchain integration
        const originalAddPoints = addPoints;
        addPoints = function(points) {
            // Call original function to update UI
            originalAddPoints(points);
            
            // If wallet is connected, update on-chain balance
            if (walletAddress) {
                updateTokenBalanceOnChain(points);
            }
        };
        
        // For testing purposes - simulate movement with keyboard
        document.addEventListener('keydown', (e) => {
            if (isRunning && e.key === 'ArrowRight') {
                // Simulate moving 0.1km with anti-cheat verification
                const fakeTimeDiff = 36; // seconds (10 km/h speed)
                const fakeDistance = 0.1; // km
                
                // Verify this movement is legitimate (apply anti-cheat)
                if (lastValidLocations.length > 0) {
                    const lastLocation = lastValidLocations[lastValidLocations.length - 1];
                    const now = Date.now();
                    
                    // Create fake coordinates that are plausible
                    const fakeLat = lastLocation.lat + (Math.random() * 0.001 - 0.0005);
                    const fakeLng = lastLocation.lng + (Math.random() * 0.001 - 0.0005);
                    
                    // Verify the movement
                    const verification = verifyMovement(
                        lastLocation.lat, 
                        lastLocation.lng, 
                        lastLocation.time, 
                        fakeLat, 
                        fakeLng, 
                        now
                    );
                    
                    // If verification passes, award points
                    if (verification.valid) {
                        distance += fakeDistance;
                        distanceEl.textContent = `${distance.toFixed(1)} km`;
                        speed = 10.0; // Simulate 10 km/h
                        speedEl.textContent = `${speed.toFixed(1)} km/h`;
                        
                        // Check rewards
                        if (checkRewards(distance)) {
                            // Reward was shown
                        } else {
                            // Add 1 point per 0.1km
                            addPoints(1);
                        }
                        
                        // Track this as a valid location
                        lastValidLocations.push({
                            lat: fakeLat,
                            lng: fakeLng,
                            time: now,
                            speed: speed
                        });
                        
                        // Keep array size limited
                        if (lastValidLocations.length > 10) {
                            lastValidLocations.shift();
                        }
                        
                        // Update next reward
                        updateNextReward(distance);
                        
                        // Update map with fake movement
                        if (map) {
                            updateMap(fakeLat, fakeLng);
                        }
                    } else {
                        console.warn('Simulated movement failed anti-cheat: ', verification.reason);
                    }
                } else {
                    // First movement with no history to check against
                    distance += fakeDistance;
                    distanceEl.textContent = `${distance.toFixed(1)} km`;
                    speed = 10.0;
                    speedEl.textContent = `${speed.toFixed(1)} km/h`;
                    addPoints(1);
                    updateNextReward(distance);
                    
                    // Create a starting location
                    lastValidLocations.push({
                        lat: 40.7128, // New York coordinates for demo
                        lng: -74.0060,
                        time: Date.now(),
                        speed: speed
                    });
                    
                    // Initialize map if needed
                    if (!map) {
                        initMap(40.7128, -74.0060);
                    }
                }
            }
            
            // Connect wallet with W key
            if (e.key === 'w' && !walletAddress) {
                simulateConnectWallet().then(address => {
                    console.log(`Connected wallet: ${address}`);
                    alert(`Connected wallet: ${address.substring(0, 6)}...${address.substring(38)}`);
                });
            }
        });
    </script>


</body></html>