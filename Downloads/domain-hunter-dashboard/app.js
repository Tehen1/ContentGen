// Application Data and State Management
class DomainHunterApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.data = this.initializeData();
        this.charts = {};
        this.init();
    }

    initializeData() {
        // Initialize with sample data if localStorage is empty
        const savedData = localStorage.getItem('domainHunterData');
        if (savedData) {
            return JSON.parse(savedData);
        }

        return {
            sample_domains: [
                {
                    domain: "tech-review-blog.com",
                    score_seo: 8,
                    score_commercial: 9,
                    score_concurrence: 7,
                    score_risque: 2,
                    score_global: 85,
                    prix_recommande: 450,
                    potentiel_revente: 1800,
                    roi_projete: 300,
                    recommandation: "ACHETER",
                    timestamp: "2025-06-07T08:15:00Z",
                    status: "available"
                },
                {
                    domain: "seo-marketing-tools.net",
                    score_seo: 7,
                    score_commercial: 8,
                    score_concurrence: 6,
                    score_risque: 3,
                    score_global: 78,
                    prix_recommande: 320,
                    potentiel_revente: 1200,
                    roi_projete: 275,
                    recommandation: "ACHETER",
                    timestamp: "2025-06-07T08:30:00Z",
                    status: "available"
                },
                {
                    domain: "digital-affiliate-income.org",
                    score_seo: 6,
                    score_commercial: 8,
                    score_concurrence: 8,
                    score_risque: 4,
                    score_global: 72,
                    prix_recommande: 250,
                    potentiel_revente: 800,
                    roi_projete: 220,
                    recommandation: "SURVEILLER",
                    timestamp: "2025-06-07T09:00:00Z",
                    status: "watching"
                },
                {
                    domain: "web-development-agency.com",
                    score_seo: 5,
                    score_commercial: 6,
                    score_concurrence: 7,
                    score_risque: 6,
                    score_global: 58,
                    prix_recommande: 150,
                    potentiel_revente: 400,
                    roi_projete: 167,
                    recommandation: "ÉVITER",
                    timestamp: "2025-06-07T09:15:00Z",
                    status: "rejected"
                }
            ],
            performance_metrics: [
                { date: "2025-06-01", domains_analyzed: 45, opportunities_found: 8, api_requests: 47, api_cost: 0.12, success_rate: 95.7, cache_hit_rate: 18.5 },
                { date: "2025-06-02", domains_analyzed: 52, opportunities_found: 11, api_requests: 54, api_cost: 0.14, success_rate: 96.3, cache_hit_rate: 22.1 },
                { date: "2025-06-03", domains_analyzed: 38, opportunities_found: 6, api_requests: 39, api_cost: 0.09, success_rate: 97.4, cache_hit_rate: 15.8 },
                { date: "2025-06-04", domains_analyzed: 61, opportunities_found: 14, api_requests: 63, api_cost: 0.16, success_rate: 96.8, cache_hit_rate: 25.4 },
                { date: "2025-06-05", domains_analyzed: 44, opportunities_found: 9, api_requests: 46, api_cost: 0.11, success_rate: 95.6, cache_hit_rate: 19.6 },
                { date: "2025-06-06", domains_analyzed: 57, opportunities_found: 12, api_requests: 59, api_cost: 0.15, success_rate: 96.6, cache_hit_rate: 23.7 },
                { date: "2025-06-07", domains_analyzed: 48, opportunities_found: 10, api_requests: 50, api_cost: 0.13, success_rate: 96.0, cache_hit_rate: 20.0 }
            ],
            alerts: [
                {
                    id: 1,
                    type: "opportunity",
                    title: "Opportunité Exceptionnelle Détectée",
                    message: "tech-review-blog.com - Score: 85/100, ROI: 300%",
                    timestamp: "2025-06-07T08:15:30Z",
                    severity: "high",
                    read: false
                },
                {
                    id: 2,
                    type: "system",
                    title: "Cache Performance Optimale",
                    message: "Taux de cache de 23.7% atteint aujourd'hui",
                    timestamp: "2025-06-07T07:00:00Z",
                    severity: "info",
                    read: true
                },
                {
                    id: 3,
                    type: "budget",
                    title: "Coût API Sous Contrôle",
                    message: "Coût quotidien: 0.13€ (budget: 0.50€)",
                    timestamp: "2025-06-07T06:30:00Z",
                    severity: "success",
                    read: true
                }
            ],
            config: {
                api: {
                    key: "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",
                    model: "llama-3.1-sonar-large-128k-online",
                    max_requests_per_minute: 60,
                    timeout: 30
                },
                scoring: {
                    min_seo_score: 6,
                    min_commercial_score: 7,
                    min_global_score: 70,
                    max_acquisition_price: 1000,
                    min_roi: 150
                },
                alerts: {
                    email_enabled: true,
                    email: "user@example.com",
                    high_opportunity_threshold: 80,
                    daily_summary: true
                }
            },
            recent_analyses: [],
            logs: []
        };
    }

    saveData() {
        localStorage.setItem('domainHunterData', JSON.stringify(this.data));
    }

    init() {
        this.setupNavigation();
        this.setupEventListeners();
        this.initializeDashboard();
        this.loadConfiguration();
        this.addSampleLogs();
        
        // Show dashboard by default
        this.showPage('dashboard');
    }

    setupNavigation() {
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                const page = item.dataset.page;
                this.showPage(page);
                
                // Update active menu item
                menuItems.forEach(mi => mi.classList.remove('active'));
                item.classList.add('active');
            });
        });
    }

    showPage(pageId) {
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show target page
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
            this.currentPage = pageId;
            
            // Initialize page-specific content
            switch(pageId) {
                case 'dashboard':
                    this.initializeDashboard();
                    break;
                case 'analyze':
                    this.initializeAnalyzePage();
                    break;
                case 'opportunities':
                    this.initializeOpportunitiesPage();
                    break;
                case 'config':
                    this.initializeConfigPage();
                    break;
                case 'monitoring':
                    this.initializeMonitoringPage();
                    break;
                case 'help':
                    this.initializeHelpPage();
                    break;
            }
        }
    }

    setupEventListeners() {
        // Analyze button
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeDomain());
        }

        // Export buttons
        const exportResults = document.getElementById('export-results');
        if (exportResults) {
            exportResults.addEventListener('click', () => this.exportResults());
        }

        const exportOpportunities = document.getElementById('export-opportunities');
        if (exportOpportunities) {
            exportOpportunities.addEventListener('click', () => this.exportOpportunities());
        }

        // Refresh opportunities
        const refreshOpportunities = document.getElementById('refresh-opportunities');
        if (refreshOpportunities) {
            refreshOpportunities.addEventListener('click', () => this.refreshOpportunities());
        }

        // Configuration
        const saveConfig = document.getElementById('save-config');
        if (saveConfig) {
            saveConfig.addEventListener('click', () => this.saveConfiguration());
        }

        const resetConfig = document.getElementById('reset-config');
        if (resetConfig) {
            resetConfig.addEventListener('click', () => this.resetConfiguration());
        }

        // Filters
        const minScore = document.getElementById('min-score');
        if (minScore) {
            minScore.addEventListener('input', (e) => {
                document.getElementById('min-score-value').textContent = e.target.value;
                this.filterOpportunities();
            });
        }

        const filters = ['min-roi', 'max-price', 'status-filter'];
        filters.forEach(filterId => {
            const element = document.getElementById(filterId);
            if (element) {
                element.addEventListener('change', () => this.filterOpportunities());
            }
        });
    }

    initializeDashboard() {
        this.updateMetrics();
        this.displayAlerts();
        this.createPerformanceChart();
        this.createScoresChart();
    }

    updateMetrics() {
        const latestMetrics = this.data.performance_metrics[this.data.performance_metrics.length - 1];
        
        document.getElementById('domains-analyzed').textContent = latestMetrics.domains_analyzed;
        document.getElementById('opportunities-found').textContent = latestMetrics.opportunities_found;
        document.getElementById('api-cost').textContent = `${latestMetrics.api_cost}€`;
        
        // Calculate average ROI
        const avgROI = this.data.sample_domains.reduce((sum, domain) => sum + domain.roi_projete, 0) / this.data.sample_domains.length;
        document.getElementById('avg-roi').textContent = `${Math.round(avgROI)}%`;
    }

    displayAlerts() {
        const alertsContainer = document.getElementById('alerts-container');
        if (!alertsContainer) return;

        alertsContainer.innerHTML = '';
        
        this.data.alerts.forEach(alert => {
            const alertElement = document.createElement('div');
            alertElement.className = `alert alert--${alert.severity}`;
            
            const timeAgo = this.getTimeAgo(alert.timestamp);
            
            alertElement.innerHTML = `
                <div class="alert-icon">
                    <i class="fas ${this.getAlertIcon(alert.type)}"></i>
                </div>
                <div class="alert-content">
                    <div class="alert-title">${alert.title}</div>
                    <div class="alert-message">${alert.message}</div>
                </div>
                <div class="alert-time">${timeAgo}</div>
            `;
            
            alertsContainer.appendChild(alertElement);
        });
    }

    getAlertIcon(type) {
        const icons = {
            opportunity: 'fa-gem',
            system: 'fa-cog',
            budget: 'fa-euro-sign',
            error: 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffInMinutes = Math.floor((now - time) / (1000 * 60));
        
        if (diffInMinutes < 60) return `Il y a ${diffInMinutes}min`;
        if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
        return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
    }

    createPerformanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const labels = this.data.performance_metrics.map(m => {
            const date = new Date(m.date);
            return date.toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' });
        });

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Domaines Analysés',
                        data: this.data.performance_metrics.map(m => m.domains_analyzed),
                        borderColor: '#1FB8CD',
                        backgroundColor: 'rgba(31, 184, 205, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Opportunités Trouvées',
                        data: this.data.performance_metrics.map(m => m.opportunities_found),
                        borderColor: '#B4413C',
                        backgroundColor: 'rgba(180, 65, 60, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createScoresChart() {
        const ctx = document.getElementById('scores-chart');
        if (!ctx) return;

        if (this.charts.scores) {
            this.charts.scores.destroy();
        }

        const scoreRanges = { '90-100': 0, '80-89': 0, '70-79': 0, '60-69': 0, '50-59': 0, '<50': 0 };
        
        this.data.sample_domains.forEach(domain => {
            const score = domain.score_global;
            if (score >= 90) scoreRanges['90-100']++;
            else if (score >= 80) scoreRanges['80-89']++;
            else if (score >= 70) scoreRanges['70-79']++;
            else if (score >= 60) scoreRanges['60-69']++;
            else if (score >= 50) scoreRanges['50-59']++;
            else scoreRanges['<50']++;
        });

        this.charts.scores = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(scoreRanges),
                datasets: [{
                    data: Object.values(scoreRanges),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                    }
                }
            }
        });
    }

    initializeAnalyzePage() {
        this.displayRecentAnalyses();
    }

    analyzeDomain() {
        const domainInput = document.getElementById('domain-input');
        const analysisType = document.getElementById('analysis-type');
        const resultsDiv = document.getElementById('analysis-results');
        const loadingOverlay = document.getElementById('loading-overlay');
        
        if (!domainInput.value.trim()) {
            this.showToast('Veuillez saisir un nom de domaine', 'error');
            return;
        }

        const domain = domainInput.value.trim();
        
        // Show loading
        loadingOverlay.classList.remove('hidden');
        
        // Simulate API call
        setTimeout(() => {
            const analysis = this.simulateAnalysis(domain, analysisType.value);
            this.displayAnalysisResults(analysis);
            
            // Add to recent analyses
            this.data.recent_analyses.unshift({
                ...analysis,
                timestamp: new Date().toISOString()
            });
            
            // Keep only last 10 analyses
            if (this.data.recent_analyses.length > 10) {
                this.data.recent_analyses = this.data.recent_analyses.slice(0, 10);
            }
            
            this.saveData();
            this.displayRecentAnalyses();
            
            resultsDiv.classList.remove('hidden');
            loadingOverlay.classList.add('hidden');
            
            this.showToast('Analyse terminée avec succès', 'success');
        }, 2000);
    }

    simulateAnalysis(domain, type) {
        // Generate realistic scores based on domain characteristics
        const baseScore = Math.random() * 40 + 40; // 40-80 base
        const bonus = domain.includes('seo') || domain.includes('marketing') || domain.includes('tech') ? 10 : 0;
        
        const scores = {
            seo: Math.min(10, Math.max(1, Math.round(baseScore / 10 + Math.random() * 2 + (bonus / 10)))),
            commercial: Math.min(10, Math.max(1, Math.round(baseScore / 10 + Math.random() * 2 + (bonus / 15)))),
            concurrence: Math.min(10, Math.max(1, Math.round(baseScore / 10 + Math.random() * 2))),
            risque: Math.min(10, Math.max(1, Math.round(Math.random() * 5 + 1)))
        };
        
        const globalScore = Math.round((scores.seo * 3 + scores.commercial * 3 + scores.concurrence * 2 + (10 - scores.risque) * 2) / 10);
        
        let recommendation = 'ÉVITER';
        if (globalScore >= 80) recommendation = 'ACHETER';
        else if (globalScore >= 65) recommendation = 'SURVEILLER';
        
        const price = Math.round(50 + (globalScore * 8) + Math.random() * 200);
        const potential = Math.round(price * (1.5 + Math.random() * 2));
        const roi = Math.round(((potential - price) / price) * 100);
        
        return {
            domain,
            score_seo: scores.seo,
            score_commercial: scores.commercial,
            score_concurrence: scores.concurrence,
            score_risque: scores.risque,
            score_global: globalScore,
            prix_recommande: price,
            potentiel_revente: potential,
            roi_projete: roi,
            recommandation: recommendation,
            type: type
        };
    }

    displayAnalysisResults(analysis) {
        const resultsContent = document.getElementById('results-content');
        if (!resultsContent) return;

        const scoreClass = analysis.score_global >= 80 ? 'excellent' : 
                          analysis.score_global >= 65 ? 'good' :
                          analysis.score_global >= 50 ? 'average' : 'poor';

        const recommendationClass = analysis.recommandation === 'ACHETER' ? 'buy' :
                                   analysis.recommandation === 'SURVEILLER' ? 'watch' : 'avoid';

        resultsContent.innerHTML = `
            <div class="domain-score-card">
                <div class="domain-header">
                    <div class="domain-name">${analysis.domain}</div>
                    <div class="score-badge ${scoreClass}">${analysis.score_global}/100</div>
                </div>
                
                <div class="scores-grid">
                    <div class="score-item">
                        <div class="score-value">${analysis.score_seo}/10</div>
                        <div class="score-label">SEO</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${analysis.score_commercial}/10</div>
                        <div class="score-label">Commercial</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${analysis.score_concurrence}/10</div>
                        <div class="score-label">Concurrence</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${analysis.score_risque}/10</div>
                        <div class="score-label">Risque</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: var(--space-16); margin: var(--space-20) 0;">
                    <div class="score-item">
                        <div class="score-value">${analysis.prix_recommande}€</div>
                        <div class="score-label">Prix Recommandé</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${analysis.potentiel_revente}€</div>
                        <div class="score-label">Potentiel Revente</div>
                    </div>
                    <div class="score-item">
                        <div class="score-value">${analysis.roi_projete}%</div>
                        <div class="score-label">ROI Projeté</div>
                    </div>
                </div>
                
                <div class="recommendation ${recommendationClass}">
                    <i class="fas ${recommendationClass === 'buy' ? 'fa-thumbs-up' : recommendationClass === 'watch' ? 'fa-eye' : 'fa-thumbs-down'}"></i>
                    ${analysis.recommandation}
                </div>
            </div>
        `;
    }

    displayRecentAnalyses() {
        const recentAnalysesList = document.getElementById('recent-analyses-list');
        if (!recentAnalysesList) return;

        if (this.data.recent_analyses.length === 0) {
            recentAnalysesList.innerHTML = '<p class="text-center" style="color: var(--color-text-secondary);">Aucune analyse récente</p>';
            return;
        }

        recentAnalysesList.innerHTML = this.data.recent_analyses.map(analysis => `
            <div class="recent-analysis-item">
                <div>
                    <strong>${analysis.domain}</strong>
                    <span class="score-badge ${analysis.score_global >= 80 ? 'excellent' : analysis.score_global >= 65 ? 'good' : analysis.score_global >= 50 ? 'average' : 'poor'}" style="margin-left: 12px; padding: 4px 8px; font-size: 12px;">
                        ${analysis.score_global}/100
                    </span>
                </div>
                <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">
                    ${this.getTimeAgo(analysis.timestamp)}
                </div>
            </div>
        `).join('');
    }

    initializeOpportunitiesPage() {
        this.displayOpportunities();
    }

    displayOpportunities() {
        const opportunitiesList = document.getElementById('opportunities-list');
        if (!opportunitiesList) return;

        const filteredOpportunities = this.getFilteredOpportunities();

        opportunitiesList.innerHTML = filteredOpportunities.map(opportunity => `
            <div class="opportunity-card">
                <div class="opportunity-header">
                    <div class="opportunity-domain">${opportunity.domain}</div>
                    <div class="opportunity-actions">
                        <button class="btn btn--sm btn--secondary" onclick="app.markAsPurchased('${opportunity.domain}')">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="btn btn--sm btn--outline" onclick="app.addToFavorites('${opportunity.domain}')">
                            <i class="fas fa-heart"></i>
                        </button>
                        <button class="btn btn--sm btn--outline" onclick="app.analyzeAgain('${opportunity.domain}')">
                            <i class="fas fa-sync"></i>
                        </button>
                    </div>
                </div>
                
                <div class="opportunity-details">
                    <div class="opportunity-stat">
                        <div class="opportunity-stat-value">${opportunity.score_global}/100</div>
                        <div class="opportunity-stat-label">Score Global</div>
                    </div>
                    <div class="opportunity-stat">
                        <div class="opportunity-stat-value">${opportunity.prix_recommande}€</div>
                        <div class="opportunity-stat-label">Prix</div>
                    </div>
                    <div class="opportunity-stat">
                        <div class="opportunity-stat-value">${opportunity.potentiel_revente}€</div>
                        <div class="opportunity-stat-label">Potentiel</div>
                    </div>
                    <div class="opportunity-stat">
                        <div class="opportunity-stat-value">${opportunity.roi_projete}%</div>
                        <div class="opportunity-stat-label">ROI</div>
                    </div>
                    <div class="opportunity-stat">
                        <div class="opportunity-stat-value">
                            <span class="status ${opportunity.status === 'available' ? 'status--success' : opportunity.status === 'watching' ? 'status--warning' : 'status--error'}">
                                ${opportunity.status === 'available' ? 'Disponible' : opportunity.status === 'watching' ? 'Surveillé' : 'Rejeté'}
                            </span>
                        </div>
                        <div class="opportunity-stat-label">Statut</div>
                    </div>
                </div>
                
                <div class="recommendation ${opportunity.recommandation === 'ACHETER' ? 'buy' : opportunity.recommandation === 'SURVEILLER' ? 'watch' : 'avoid'}">
                    ${opportunity.recommandation}
                </div>
            </div>
        `).join('');
    }

    getFilteredOpportunities() {
        const minScore = parseInt(document.getElementById('min-score')?.value || 0);
        const minROI = parseInt(document.getElementById('min-roi')?.value || 0);
        const maxPrice = parseInt(document.getElementById('max-price')?.value || 10000);
        const statusFilter = document.getElementById('status-filter')?.value || 'all';

        return this.data.sample_domains.filter(domain => {
            return domain.score_global >= minScore &&
                   domain.roi_projete >= minROI &&
                   domain.prix_recommande <= maxPrice &&
                   (statusFilter === 'all' || domain.status === statusFilter);
        });
    }

    filterOpportunities() {
        this.displayOpportunities();
    }

    markAsPurchased(domain) {
        const domainIndex = this.data.sample_domains.findIndex(d => d.domain === domain);
        if (domainIndex !== -1) {
            this.data.sample_domains[domainIndex].status = 'purchased';
            this.saveData();
            this.displayOpportunities();
            this.showToast(`${domain} marqué comme acheté`, 'success');
        }
    }

    addToFavorites(domain) {
        this.showToast(`${domain} ajouté aux favoris`, 'success');
    }

    analyzeAgain(domain) {
        document.getElementById('domain-input').value = domain;
        this.showPage('analyze');
        this.showToast(`Redirection vers l'analyse de ${domain}`, 'info');
    }

    refreshOpportunities() {
        this.showToast('Actualisation des opportunités...', 'info');
        // Simulate refresh
        setTimeout(() => {
            this.displayOpportunities();
            this.showToast('Opportunités actualisées', 'success');
        }, 1000);
    }

    exportOpportunities() {
        const opportunities = this.getFilteredOpportunities();
        const csv = this.convertToCSV(opportunities);
        this.downloadCSV(csv, 'opportunites-domaines.csv');
        this.showToast('Export terminé', 'success');
    }

    exportResults() {
        if (this.data.recent_analyses.length === 0) {
            this.showToast('Aucune analyse à exporter', 'error');
            return;
        }
        
        const csv = this.convertToCSV(this.data.recent_analyses);
        this.downloadCSV(csv, 'analyses-domaines.csv');
        this.showToast('Export terminé', 'success');
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]).join(',');
        const rows = data.map(row => Object.values(row).join(','));
        return headers + '\n' + rows.join('\n');
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        window.URL.revokeObjectURL(url);
    }

    initializeConfigPage() {
        this.loadConfiguration();
    }

    loadConfiguration() {
        const config = this.data.config;
        
        const apiKey = document.getElementById('api-key');
        const apiModel = document.getElementById('api-model');
        const rateLimit = document.getElementById('rate-limit');
        const minSeoScore = document.getElementById('min-seo-score');
        const minCommercialScore = document.getElementById('min-commercial-score');
        const minGlobalScore = document.getElementById('min-global-score');
        const alertEmail = document.getElementById('alert-email');
        const highOpportunityThreshold = document.getElementById('high-opportunity-threshold');

        if (apiKey) apiKey.value = config.api.key;
        if (apiModel) apiModel.value = config.api.model;
        if (rateLimit) rateLimit.value = config.api.max_requests_per_minute;
        if (minSeoScore) minSeoScore.value = config.scoring.min_seo_score;
        if (minCommercialScore) minCommercialScore.value = config.scoring.min_commercial_score;
        if (minGlobalScore) minGlobalScore.value = config.scoring.min_global_score;
        if (alertEmail) alertEmail.value = config.alerts.email;
        if (highOpportunityThreshold) highOpportunityThreshold.value = config.alerts.high_opportunity_threshold;
    }

    saveConfiguration() {
        const config = {
            api: {
                key: document.getElementById('api-key').value,
                model: document.getElementById('api-model').value,
                max_requests_per_minute: parseInt(document.getElementById('rate-limit').value),
                timeout: 30
            },
            scoring: {
                min_seo_score: parseInt(document.getElementById('min-seo-score').value),
                min_commercial_score: parseInt(document.getElementById('min-commercial-score').value),
                min_global_score: parseInt(document.getElementById('min-global-score').value),
                max_acquisition_price: 1000,
                min_roi: 150
            },
            alerts: {
                email_enabled: true,
                email: document.getElementById('alert-email').value,
                high_opportunity_threshold: parseInt(document.getElementById('high-opportunity-threshold').value),
                daily_summary: true
            }
        };

        this.data.config = config;
        this.saveData();
        this.showToast('Configuration sauvegardée', 'success');
    }

    resetConfiguration() {
        if (confirm('Êtes-vous sûr de vouloir réinitialiser la configuration ?')) {
            this.data.config = {
                api: {
                    key: "",
                    model: "llama-3.1-sonar-large-128k-online",
                    max_requests_per_minute: 60,
                    timeout: 30
                },
                scoring: {
                    min_seo_score: 6,
                    min_commercial_score: 7,
                    min_global_score: 70,
                    max_acquisition_price: 1000,
                    min_roi: 150
                },
                alerts: {
                    email_enabled: true,
                    email: "",
                    high_opportunity_threshold: 80,
                    daily_summary: true
                }
            };
            this.saveData();
            this.loadConfiguration();
            this.showToast('Configuration réinitialisée', 'success');
        }
    }

    initializeMonitoringPage() {
        this.updateMonitoringStats();
        this.displayLogs();
    }

    updateMonitoringStats() {
        const latestMetrics = this.data.performance_metrics[this.data.performance_metrics.length - 1];
        
        document.getElementById('today-requests').textContent = latestMetrics.api_requests;
        document.getElementById('success-rate').textContent = `${latestMetrics.success_rate}%`;
        document.getElementById('cache-hit-rate').textContent = `${latestMetrics.cache_hit_rate}%`;
        document.getElementById('today-cost').textContent = `${latestMetrics.api_cost}€`;
        
        const monthlyUsed = this.data.performance_metrics.reduce((sum, m) => sum + m.api_cost, 0);
        const remaining = Math.max(0, 15 - monthlyUsed);
        document.getElementById('remaining-budget').textContent = `${remaining.toFixed(2)}€`;
    }

    addSampleLogs() {
        if (this.data.logs.length === 0) {
            const sampleLogs = [
                { type: 'info', message: '[08:15:30] Analyse démarrée pour tech-review-blog.com', timestamp: new Date().toISOString() },
                { type: 'success', message: '[08:15:32] API Perplexity - Réponse reçue (200ms)', timestamp: new Date().toISOString() },
                { type: 'success', message: '[08:15:33] Score calculé: 85/100 - Recommandation: ACHETER', timestamp: new Date().toISOString() },
                { type: 'info', message: '[08:15:34] Cache mis à jour pour tech-review-blog.com', timestamp: new Date().toISOString() },
                { type: 'info', message: '[08:20:15] Planificateur: Démarrage analyse automatique', timestamp: new Date().toISOString() },
                { type: 'success', message: '[08:20:45] 12 nouveaux domaines analysés', timestamp: new Date().toISOString() },
                { type: 'info', message: '[08:21:00] Nettoyage du cache (48 entrées supprimées)', timestamp: new Date().toISOString() }
            ];
            this.data.logs = sampleLogs;
            this.saveData();
        }
    }

    displayLogs() {
        const logsContainer = document.getElementById('logs-container');
        if (!logsContainer) return;

        logsContainer.innerHTML = this.data.logs.map(log => `
            <div class="log-entry ${log.type}">
                ${log.message}
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        logsContainer.scrollTop = logsContainer.scrollHeight;
    }

    initializeHelpPage() {
        // Help page is static, no special initialization needed
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 
                    type === 'error' ? 'fa-exclamation-circle' : 
                    'fa-info-circle';

        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: var(--space-12);">
                <i class="fas ${icon}"></i>
                <span>${message}</span>
            </div>
        `;

        toastContainer.appendChild(toast);

        // Auto-remove after 3 seconds
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new DomainHunterApp();
});