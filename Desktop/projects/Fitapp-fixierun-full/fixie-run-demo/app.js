// Application data from JSON
const appData = {
  "user": {
    "name": "Alex Cycliste",
    "level": 12,
    "fixTokens": 1247.5,
    "pedalTokens": 23,
    "totalDistance": 2847.3,
    "totalCalories": 89420,
    "activeDays": 87,
    "currentStreak": 15
  },
  "nftBikes": [
    {
      "id": 1,
      "name": "Lightning Racer",
      "rarity": "Epic",
      "level": 15,
      "speed": 85,
      "endurance": 78,
      "efficiency": 82,
      "image": "bike1.jpg",
      "dailyEarning": 45.2,
      "totalKm": 1205
    },
    {
      "id": 2,
      "name": "Urban Cruiser",
      "rarity": "Rare",
      "level": 8,
      "speed": 65,
      "endurance": 85,
      "efficiency": 70,
      "image": "bike2.jpg",
      "dailyEarning": 28.7,
      "totalKm": 645
    }
  ],
  "marketData": {
    "totalUsers": 125000,
    "totalEarnings": 2847500,
    "avgDailyReward": 22.5,
    "topCountries": ["France", "Allemagne", "Pays-Bas", "Belgique"]
  },
  "stakingPools": [
    {
      "name": "FIX Staking Pool",
      "apy": 12.5,
      "totalStaked": 15600000,
      "userStaked": 500,
      "lockPeriod": "30 jours"
    },
    {
      "name": "PEDAL Governance Pool", 
      "apy": 18.2,
      "totalStaked": 2400000,
      "userStaked": 15,
      "lockPeriod": "90 jours"
    }
  ],
  "challenges": [
    {
      "name": "Défi Hebdomadaire",
      "description": "Parcourir 100km cette semaine",
      "progress": 67,
      "reward": "50 FIX",
      "deadline": "3 jours"
    },
    {
      "name": "Marathon Mensuel",
      "description": "500km ce mois-ci",
      "progress": 23,
      "reward": "200 FIX + NFT Badge",
      "deadline": "18 jours"
    }
  ]
};

// Additional marketplace data
const marketplaceBikes = [
  {
    id: 3,
    name: "Speed Demon",
    rarity: "Legendary",
    level: 1,
    speed: 95,
    endurance: 70,
    efficiency: 88,
    price: 850,
    dailyEarning: 65.3
  },
  {
    id: 4,
    name: "City Glider",
    rarity: "Common",
    level: 1,
    speed: 45,
    endurance: 60,
    efficiency: 55,
    price: 120,
    dailyEarning: 15.2
  },
  {
    id: 5,
    name: "Mountain Beast",
    rarity: "Epic",
    level: 1,
    speed: 75,
    endurance: 95,
    efficiency: 78,
    price: 450,
    dailyEarning: 38.7
  },
  {
    id: 6,
    name: "Road Runner",
    rarity: "Rare",
    level: 1,
    speed: 80,
    endurance: 75,
    efficiency: 85,
    price: 280,
    dailyEarning: 32.1
  }
];

// Session tracking
let currentSession = {
  active: false,
  paused: false,
  startTime: null,
  pausedTime: 0,
  distance: 0,
  speed: 0,
  tokensEarned: 0
};

let sessionInterval = null;
let selectedBikeId = 1;
let progressChart = null;

// Navigation functionality
function showSection(sectionId) {
  // Hide all sections
  const sections = document.querySelectorAll('.section');
  sections.forEach(section => {
    section.classList.remove('active');
  });
  
  // Remove active class from all nav buttons
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.classList.remove('active');
  });
  
  // Show selected section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Activate nav button
  const targetButton = document.querySelector(`[data-section="${sectionId}"]`);
  if (targetButton) {
    targetButton.classList.add('active');
  }
  
  // Initialize section-specific content
  setTimeout(() => {
    if (sectionId === 'dashboard') {
      populateDashboard();
    } else if (sectionId === 'simulator') {
      populateSimulator();
    } else if (sectionId === 'marketplace') {
      populateMarketplace();
    } else if (sectionId === 'defi') {
      populateDefi();
    } else if (sectionId === 'analytics') {
      populateAnalytics();
    }
  }, 100);
}

// Populate dashboard
function populateDashboard() {
  // Populate bikes collection
  const bikesContainer = document.getElementById('bikesCollection');
  if (bikesContainer) {
    bikesContainer.innerHTML = '';
    
    appData.nftBikes.forEach(bike => {
      const bikeElement = createBikeElement(bike);
      bikesContainer.appendChild(bikeElement);
    });
  }
  
  // Populate challenges
  const challengesContainer = document.getElementById('challengesList');
  if (challengesContainer) {
    challengesContainer.innerHTML = '';
    
    appData.challenges.forEach(challenge => {
      const challengeElement = createChallengeElement(challenge);
      challengesContainer.appendChild(challengeElement);
    });
  }
}

function createBikeElement(bike) {
  const div = document.createElement('div');
  div.className = 'bike-item';
  div.innerHTML = `
    <div class="bike-header">
      <div class="bike-name">${bike.name}</div>
      <div class="bike-rarity ${bike.rarity.toLowerCase()}">${bike.rarity}</div>
    </div>
    <div class="bike-stats">
      <div class="bike-stat">
        <span class="bike-stat-value">${bike.speed}</span>
        <span class="bike-stat-label">Vitesse</span>
      </div>
      <div class="bike-stat">
        <span class="bike-stat-value">${bike.endurance}</span>
        <span class="bike-stat-label">Endurance</span>
      </div>
      <div class="bike-stat">
        <span class="bike-stat-value">${bike.efficiency}</span>
        <span class="bike-stat-label">Efficacité</span>
      </div>
    </div>
    <div class="bike-earning">+${bike.dailyEarning} FIX/jour</div>
  `;
  return div;
}

function createChallengeElement(challenge) {
  const div = document.createElement('div');
  div.className = 'challenge-item';
  div.innerHTML = `
    <div class="challenge-header">
      <div class="challenge-name">${challenge.name}</div>
      <div class="challenge-deadline">${challenge.deadline} restants</div>
    </div>
    <div class="challenge-description">${challenge.description}</div>
    <div class="challenge-progress">
      <div class="progress-bar">
        <div class="progress-fill" style="width: ${challenge.progress}%"></div>
      </div>
    </div>
    <div class="challenge-reward">Récompense: ${challenge.reward}</div>
  `;
  return div;
}

// Populate simulator
function populateSimulator() {
  const selectedBike = appData.nftBikes.find(bike => bike.id === selectedBikeId);
  const selectedBikeContainer = document.getElementById('selectedBike');
  
  if (selectedBikeContainer) {
    selectedBikeContainer.innerHTML = `
      <div class="selected-bike-name">${selectedBike.name}</div>
      <div class="selected-bike-level">Niveau ${selectedBike.level}</div>
    `;
  }
  
  // Reset session controls state
  resetSessionControls();
}

function resetSessionControls() {
  const startBtn = document.getElementById('startSessionBtn');
  const pauseBtn = document.getElementById('pauseSessionBtn');
  const stopBtn = document.getElementById('stopSessionBtn');
  
  if (startBtn) startBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = true;
  
  const statusElement = document.getElementById('sessionStatus');
  if (statusElement) {
    statusElement.innerHTML = '<span class="status status--info">Prêt à commencer</span>';
  }
}

function startSession() {
  if (!currentSession.active) {
    currentSession.active = true;
    currentSession.paused = false;
    currentSession.startTime = Date.now() - currentSession.pausedTime;
    
    const startBtn = document.getElementById('startSessionBtn');
    const pauseBtn = document.getElementById('pauseSessionBtn');
    const stopBtn = document.getElementById('stopSessionBtn');
    const statusElement = document.getElementById('sessionStatus');
    const simulatorCard = document.querySelector('.simulator-card');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    if (stopBtn) stopBtn.disabled = false;
    if (statusElement) statusElement.innerHTML = '<span class="status status--success">Session Active</span>';
    if (simulatorCard) simulatorCard.classList.add('session-active');
    
    startSessionInterval();
  } else if (currentSession.paused) {
    currentSession.paused = false;
    currentSession.startTime = Date.now() - currentSession.pausedTime;
    
    const startBtn = document.getElementById('startSessionBtn');
    const pauseBtn = document.getElementById('pauseSessionBtn');
    
    if (startBtn) startBtn.disabled = true;
    if (pauseBtn) pauseBtn.disabled = false;
    
    startSessionInterval();
  }
}

function pauseSession() {
  if (currentSession.active && !currentSession.paused) {
    currentSession.paused = true;
    currentSession.pausedTime = Date.now() - currentSession.startTime;
    
    const startBtn = document.getElementById('startSessionBtn');
    const pauseBtn = document.getElementById('pauseSessionBtn');
    const statusElement = document.getElementById('sessionStatus');
    
    if (startBtn) startBtn.disabled = false;
    if (pauseBtn) pauseBtn.disabled = true;
    if (statusElement) statusElement.innerHTML = '<span class="status status--warning">En Pause</span>';
    
    clearInterval(sessionInterval);
  }
}

function stopSession() {
  currentSession.active = false;
  currentSession.paused = false;
  currentSession.startTime = null;
  currentSession.pausedTime = 0;
  
  // Update user stats
  appData.user.fixTokens += currentSession.tokensEarned;
  appData.user.totalDistance += currentSession.distance;
  
  // Reset session
  currentSession.distance = 0;
  currentSession.speed = 0;
  currentSession.tokensEarned = 0;
  
  const startBtn = document.getElementById('startSessionBtn');
  const pauseBtn = document.getElementById('pauseSessionBtn');
  const stopBtn = document.getElementById('stopSessionBtn');
  const statusElement = document.getElementById('sessionStatus');
  const simulatorCard = document.querySelector('.simulator-card');
  
  if (startBtn) startBtn.disabled = false;
  if (pauseBtn) pauseBtn.disabled = true;
  if (stopBtn) stopBtn.disabled = true;
  if (statusElement) statusElement.innerHTML = '<span class="status status--info">Session Terminée</span>';
  if (simulatorCard) simulatorCard.classList.remove('session-active');
  
  clearInterval(sessionInterval);
  
  // Reset display
  updateSessionDisplay();
  updateWalletDisplay();
}

function startSessionInterval() {
  sessionInterval = setInterval(() => {
    if (currentSession.active && !currentSession.paused) {
      // Simulate cycling metrics
      const selectedBike = appData.nftBikes.find(bike => bike.id === selectedBikeId);
      const baseSpeed = selectedBike.speed * 0.4; // Convert to realistic km/h
      
      // Add some randomness to simulate real cycling
      currentSession.speed = baseSpeed + (Math.random() - 0.5) * 10;
      currentSession.speed = Math.max(5, Math.min(50, currentSession.speed)); // Clamp between 5-50 km/h
      
      // Update distance (speed in km/h, interval is 1 second)
      currentSession.distance += (currentSession.speed / 3600);
      
      // Calculate tokens earned (based on distance and bike efficiency)
      const tokenRate = selectedBike.efficiency * 0.01; // tokens per km
      currentSession.tokensEarned = currentSession.distance * tokenRate;
      
      updateSessionDisplay();
    }
  }, 1000);
}

function updateSessionDisplay() {
  const speedElement = document.getElementById('currentSpeed');
  const distanceElement = document.getElementById('sessionDistance');
  const tokensElement = document.getElementById('tokensEarned');
  const timeElement = document.getElementById('sessionTime');
  
  if (speedElement) speedElement.textContent = currentSession.speed.toFixed(1);
  if (distanceElement) distanceElement.textContent = currentSession.distance.toFixed(2);
  if (tokensElement) tokensElement.textContent = currentSession.tokensEarned.toFixed(1);
  
  // Update session time
  if (currentSession.active && timeElement) {
    const elapsedTime = currentSession.paused ? 
      currentSession.pausedTime : 
      Date.now() - currentSession.startTime;
    
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    timeElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  } else if (timeElement) {
    timeElement.textContent = '00:00';
  }
}

// Populate marketplace
function populateMarketplace() {
  const marketplaceGrid = document.getElementById('marketplaceGrid');
  if (marketplaceGrid) {
    marketplaceGrid.innerHTML = '';
    
    marketplaceBikes.forEach(bike => {
      const marketplaceItem = createMarketplaceItem(bike);
      marketplaceGrid.appendChild(marketplaceItem);
    });
  }
  
  // Setup filter functionality
  setupMarketplaceFilters();
}

function setupMarketplaceFilters() {
  const filterButtons = document.querySelectorAll('.filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const rarity = btn.getAttribute('data-rarity');
      filterMarketplace(rarity);
    });
  });
}

function createMarketplaceItem(bike) {
  const div = document.createElement('div');
  div.className = 'marketplace-item';
  div.setAttribute('data-rarity', bike.rarity);
  
  div.innerHTML = `
    <div class="marketplace-item-header">
      <div class="bike-header">
        <div class="bike-name">${bike.name}</div>
        <div class="bike-rarity ${bike.rarity.toLowerCase()}">${bike.rarity}</div>
      </div>
    </div>
    <div class="marketplace-item-body">
      <div class="bike-stats">
        <div class="bike-stat">
          <span class="bike-stat-value">${bike.speed}</span>
          <span class="bike-stat-label">Vitesse</span>
        </div>
        <div class="bike-stat">
          <span class="bike-stat-value">${bike.endurance}</span>
          <span class="bike-stat-label">Endurance</span>
        </div>
        <div class="bike-stat">
          <span class="bike-stat-value">${bike.efficiency}</span>
          <span class="bike-stat-label">Efficacité</span>
        </div>
      </div>
      <div class="bike-earning">+${bike.dailyEarning} FIX/jour</div>
      <div class="marketplace-item-price">
        <span class="price-amount">${bike.price} FIX</span>
        <button class="btn btn--primary btn--sm" onclick="buyBike(${bike.id})">Acheter</button>
      </div>
    </div>
  `;
  
  return div;
}

function filterMarketplace(rarity) {
  const items = document.querySelectorAll('.marketplace-item');
  
  items.forEach(item => {
    if (rarity === 'all' || item.getAttribute('data-rarity') === rarity) {
      item.style.display = 'block';
    } else {
      item.style.display = 'none';
    }
  });
}

function buyBike(bikeId) {
  const bike = marketplaceBikes.find(b => b.id === bikeId);
  if (bike && appData.user.fixTokens >= bike.price) {
    appData.user.fixTokens -= bike.price;
    updateWalletDisplay();
    alert(`Félicitations ! Vous avez acheté ${bike.name} pour ${bike.price} FIX !`);
  } else {
    alert('Fonds insuffisants pour cet achat.');
  }
}

// Populate DeFi section
function populateDefi() {
  const stakingPoolsContainer = document.getElementById('stakingPools');
  if (stakingPoolsContainer) {
    stakingPoolsContainer.innerHTML = '';
    
    appData.stakingPools.forEach(pool => {
      const poolElement = createStakingPoolElement(pool);
      stakingPoolsContainer.appendChild(poolElement);
    });
  }
}

function createStakingPoolElement(pool) {
  const div = document.createElement('div');
  div.className = 'staking-pool';
  
  div.innerHTML = `
    <div class="pool-header">
      <div class="pool-name">${pool.name}</div>
      <div class="pool-apy">${pool.apy}% APY</div>
    </div>
    <div class="pool-stats">
      <div class="pool-stat">
        <span class="pool-stat-value">${(pool.totalStaked / 1000000).toFixed(1)}M</span>
        <span class="pool-stat-label">Total Staké</span>
      </div>
      <div class="pool-stat">
        <span class="pool-stat-value">${pool.userStaked}</span>
        <span class="pool-stat-label">Vos Tokens</span>
      </div>
    </div>
    <div class="pool-actions">
      <button class="btn btn--primary btn--sm">Staker</button>
      <button class="btn btn--outline btn--sm">Retirer</button>
    </div>
  `;
  
  return div;
}

// Populate analytics
function populateAnalytics() {
  createProgressChart();
  populateLeaderboard();
}

function createProgressChart() {
  const ctx = document.getElementById('progressChart');
  if (!ctx) return;
  
  // Destroy existing chart if it exists
  if (progressChart) {
    progressChart.destroy();
  }
  
  const chartCtx = ctx.getContext('2d');
  
  // Generate sample data for the last 30 days
  const labels = [];
  const distanceData = [];
  const tokensData = [];
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    labels.push(date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }));
    
    // Simulate daily progress
    distanceData.push(Math.random() * 50 + 10);
    tokensData.push(Math.random() * 30 + 5);
  }
  
  progressChart = new Chart(chartCtx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'Distance (km)',
          data: distanceData,
          borderColor: '#21808D',
          backgroundColor: 'rgba(33, 128, 141, 0.1)',
          fill: true,
          tension: 0.4
        },
        {
          label: 'Tokens FIX',
          data: tokensData,
          borderColor: '#32B8C6',
          backgroundColor: 'rgba(50, 184, 198, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          grid: {
            color: 'rgba(94, 82, 64, 0.1)'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Distance (km)'
          },
          grid: {
            color: 'rgba(94, 82, 64, 0.1)'
          }
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Tokens FIX'
          },
          grid: {
            drawOnChartArea: false,
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        }
      }
    }
  });
}

function populateLeaderboard() {
  const leaderboard = document.getElementById('leaderboard');
  if (!leaderboard) return;
  
  const leaderboardData = [
    { rank: 1, name: 'ProCyclist99', score: '1,245 km' },
    { rank: 2, name: 'SpeedDemon', score: '1,189 km' },
    { rank: 3, name: 'Alex Cycliste', score: '987 km' },
    { rank: 4, name: 'RoadWarrior', score: '856 km' },
    { rank: 5, name: 'UrbanRider', score: '743 km' }
  ];
  
  leaderboard.innerHTML = '';
  
  leaderboardData.forEach(item => {
    const div = document.createElement('div');
    div.className = 'leaderboard-item';
    if (item.name === 'Alex Cycliste') {
      div.style.background = 'rgba(33, 128, 141, 0.1)';
    }
    
    div.innerHTML = `
      <div class="leaderboard-rank">#${item.rank}</div>
      <div class="leaderboard-name">${item.name}</div>
      <div class="leaderboard-score">${item.score}</div>
    `;
    
    leaderboard.appendChild(div);
  });
}

// Update wallet display when tokens change
function updateWalletDisplay() {
  const fixTokenElements = document.querySelectorAll('.token-amount');
  if (fixTokenElements.length > 0) {
    fixTokenElements[0].textContent = appData.user.fixTokens.toFixed(1);
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  // Setup navigation event listeners
  const navButtons = document.querySelectorAll('.nav-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.getAttribute('data-section');
      showSection(sectionId);
    });
  });
  
  // Setup session control event listeners
  const startBtn = document.getElementById('startSessionBtn');
  const pauseBtn = document.getElementById('pauseSessionBtn');
  const stopBtn = document.getElementById('stopSessionBtn');
  const homeStartBtn = document.getElementById('startBtn');
  
  if (startBtn) startBtn.addEventListener('click', startSession);
  if (pauseBtn) pauseBtn.addEventListener('click', pauseSession);
  if (stopBtn) stopBtn.addEventListener('click', stopSession);
  if (homeStartBtn) homeStartBtn.addEventListener('click', () => showSection('simulator'));
  
  // Show home section by default
  showSection('home');
  
  // Initialize session display
  updateSessionDisplay();
  
  // Add fade-in animation to cards
  setTimeout(() => {
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('fade-in');
      }, index * 100);
    });
  }, 500);
});