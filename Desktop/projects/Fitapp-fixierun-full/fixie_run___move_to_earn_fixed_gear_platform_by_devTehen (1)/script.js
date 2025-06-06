// Theme Management
class ThemeManager {
    constructor() {
        this.currentTheme = localStorage.getItem('fixie-theme') || 'cyberpunk';
        this.init();
    }

    init() {
        this.applyTheme(this.currentTheme);
        this.setupThemeButtons();
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('fixie-theme', theme);
        this.currentTheme = theme;
        this.updateThemeButtons();
    }

    setupThemeButtons() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.dataset.theme;
                this.applyTheme(theme);
            });
        });
    }

    updateThemeButtons() {
        const themeButtons = document.querySelectorAll('.theme-btn');
        themeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === this.currentTheme);
        });
    }
}

// Bike Showcase Manager
class BikeShowcase {
    constructor() {
        this.currentIndex = 0;
        this.bikes = document.querySelectorAll('.showcase-bike');
        this.selectors = document.querySelectorAll('.selector-btn');
        this.init();
    }

    init() {
        this.setupSelectors();
        this.startAutoRotation();
    }

    setupSelectors() {
        this.selectors.forEach((btn, index) => {
            btn.addEventListener('click', () => {
                this.showBike(index);
            });
        });
    }

    showBike(index) {
        // Remove active class from all bikes and selectors
        this.bikes.forEach(bike => bike.classList.remove('active'));
        this.selectors.forEach(btn => btn.classList.remove('active'));

        // Add active class to selected bike and selector
        this.bikes[index].classList.add('active');
        this.selectors[index].classList.add('active');

        this.currentIndex = index;
    }

    startAutoRotation() {
        setInterval(() => {
            this.currentIndex = (this.currentIndex + 1) % this.bikes.length;
            this.showBike(this.currentIndex);
        }, 5000);
    }
}

// Wallet Connection Manager
class WalletManager {
    constructor() {
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        this.init();
    }

    init() {
        this.setupConnectButton();
        this.checkConnection();
    }

    setupConnectButton() {
        const connectBtn = document.querySelector('.connect-btn');
        connectBtn.addEventListener('click', () => {
            if (this.isConnected) {
                this.disconnect();
            } else {
                this.connect();
            }
        });
    }

    async connect() {
        try {
            // Simulate wallet connection
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            this.isConnected = true;
            this.walletAddress = '0x1234...5678';
            this.balance = 1247;
            
            this.updateUI();
            this.showNotification('Wallet connected successfully!', 'success');
        } catch (error) {
            this.showNotification('Failed to connect wallet', 'error');
        }
    }

    disconnect() {
        this.isConnected = false;
        this.walletAddress = null;
        this.balance = 0;
        this.updateUI();
        this.showNotification('Wallet disconnected', 'info');
    }

    checkConnection() {
        // Check if wallet was previously connected
        const savedConnection = localStorage.getItem('wallet-connected');
        if (savedConnection === 'true') {
            this.connect();
        }
    }

    updateUI() {
        const connectBtn = document.querySelector('.connect-btn');
        const walletInfo = document.querySelector('.wallet-info');

        if (this.isConnected) {
            connectBtn.textContent = 'Disconnect';
            walletInfo.classList.remove('hidden');
            walletInfo.querySelector('.balance').textContent = `${this.balance.toLocaleString()} $FIX`;
            walletInfo.querySelector('.wallet-address').textContent = this.walletAddress;
            localStorage.setItem('wallet-connected', 'true');
        } else {
            connectBtn.textContent = 'Connect Wallet';
            walletInfo.classList.add('hidden');
            localStorage.removeItem('wallet-connected');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            color: var(--text);
            font-weight: 500;
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        switch (type) {
            case 'success':
                notification.style.background = 'var(--primary)';
                notification.style.color = 'var(--background)';
                break;
            case 'error':
                notification.style.background = 'var(--secondary)';
                break;
            default:
                notification.style.background = 'var(--surface)';
                notification.style.border = '1px solid var(--border)';
        }

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after delay
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// FAQ Manager
class FAQManager {
    constructor() {
        this.init();
    }

    init() {
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            question.addEventListener('click', () => {
                this.toggleFAQ(item);
            });
        });
    }

    toggleFAQ(item) {
        const isActive = item.classList.contains('active');
        
        // Close all other FAQ items
        document.querySelectorAll('.faq-item').forEach(faq => {
            faq.classList.remove('active');
        });

        // Toggle current item
        if (!isActive) {
            item.classList.add('active');
        }
    }
}

// Filter Manager for NFT Collection
class FilterManager {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    init() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setFilter(btn.dataset.filter);
                this.updateFilterButtons();
            });
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        const bikeCards = document.querySelectorAll('.bike-card');
        
        bikeCards.forEach(card => {
            const category = card.dataset.category;
            if (filter === 'all' || category === filter) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.3s ease-in-out';
            } else {
                card.style.display = 'none';
            }
        });
    }

    updateFilterButtons() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === this.currentFilter);
        });
    }
}

// Leaderboard Manager
class LeaderboardManager {
    constructor() {
        this.currentTab = 'weekly';
        this.init();
    }

    init() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.setTab(btn.dataset.tab);
                this.updateTabButtons();
                this.loadLeaderboardData();
            });
        });
    }

    setTab(tab) {
        this.currentTab = tab;
    }

    updateTabButtons() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.currentTab);
        });
    }

    async loadLeaderboardData() {
        // Simulate loading different leaderboard data
        const tableRows = document.querySelectorAll('.table-row:not(.you)');
        tableRows.forEach(row => {
            row.classList.add('loading');
        });

        await new Promise(resolve => setTimeout(resolve, 500));

        tableRows.forEach(row => {
            row.classList.remove('loading');
        });
    }
}

// Performance Tracker
class PerformanceTracker {
    constructor() {
        this.stats = {
            miles: 0,
            earnings: 0,
            trackStands: 0,
            skids: 0
        };
        this.init();
    }

    init() {
        this.loadStats();
        this.startSimulation();
    }

    loadStats() {
        const saved = localStorage.getItem('fixie-stats');
        if (saved) {
            this.stats = JSON.parse(saved);
        }
    }

    saveStats() {
        localStorage.setItem('fixie-stats', JSON.stringify(this.stats));
    }

    startSimulation() {
        // Simulate real-time stats updates
        setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance per second
                this.stats.miles += Math.random() * 0.1;
                this.stats.earnings += Math.random() * 5;
                this.updateUI();
                this.saveStats();
            }
        }, 1000);
    }

    updateUI() {
        // Update stats displays if they exist
        const milesDisplay = document.querySelector('.user-miles');
        const earningsDisplay = document.querySelector('.user-earnings');
        
        if (milesDisplay) {
            milesDisplay.textContent = this.stats.miles.toFixed(1);
        }
        
        if (earningsDisplay) {
            earningsDisplay.textContent = this.stats.earnings.toFixed(0);
        }
    }
}

// Intersection Observer for Animations
class AnimationManager {
    constructor() {
        this.init();
    }

    init() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in');
                }
            });
        }, observerOptions);

        // Observe all sections and cards
        const elementsToAnimate = document.querySelectorAll(`
            .feature-card,
            .bike-card,
            .community-card,
            .timeline-item,
            .leaderboard-table
        `);

        elementsToAnimate.forEach(el => {
            observer.observe(el);
        });
    }
}

// Main App Initialization
class FixieRunApp {
    constructor() {
        this.init();
    }

    init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeManagers();
            });
        } else {
            this.initializeManagers();
        }
    }

    initializeManagers() {
        this.themeManager = new ThemeManager();
        this.bikeShowcase = new BikeShowcase();
        this.walletManager = new WalletManager();
        this.faqManager = new FAQManager();
        this.filterManager = new FilterManager();
        this.leaderboardManager = new LeaderboardManager();
        this.performanceTracker = new PerformanceTracker();
        this.animationManager = new AnimationManager();

        this.setupSmoothScrolling();
        this.setupKeyboardNavigation();
        this.setupParallaxEffects();
        this.setupLoadingStates();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Escape key closes modals/dropdowns
            if (e.key === 'Escape') {
                document.querySelectorAll('.faq-item.active').forEach(item => {
                    item.classList.remove('active');
                });
            }

            // Arrow keys for bike showcase
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                const showcase = document.querySelector('.nft-showcase');
                if (showcase && document.activeElement.closest('.hero-bike')) {
                    e.preventDefault();
                    const direction = e.key === 'ArrowLeft' ? -1 : 1;
                    const newIndex = (this.bikeShowcase.currentIndex + direction + this.bikeShowcase.bikes.length) % this.bikeShowcase.bikes.length;
                    this.bikeShowcase.showBike(newIndex);
                }
            }
        });
    }

    setupParallaxEffects() {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallax = document.querySelector('.floating-particles');
            if (parallax) {
                parallax.style.transform = `translateY(${scrolled * 0.5}px)`;
            }
        });
    }

    setupLoadingStates() {
        // Add loading states for interactive elements
        document.querySelectorAll('button').forEach(btn => {
            btn.addEventListener('click', function() {
                if (!this.classList.contains('loading')) {
                    this.classList.add('loading');
                    setTimeout(() => {
                        this.classList.remove('loading');
                    }, 1000);
                }
            });
        });
    }
}

// Initialize the app
const app = new FixieRunApp();

// Export for potential external use
window.FixieRun = {
    app,
    version: '1.0.0',
    theme: app.themeManager,
    wallet: app.walletManager
};