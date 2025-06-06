// Fixie.Run Interactive Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Global variables
let currentTab = 'overview';
let installationStarted = false;
let buildInProgress = false;
let selectedDeployment = null;

// App initialization
function initializeApp() {
    setupNavigation();
    setupArchitectureLayers();
    setupChecklistTracking();
    showTab('overview');
}

// Navigation between tabs
function setupNavigation() {
    const navTabs = document.querySelectorAll('.nav-tab');
    navTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.getAttribute('data-tab');
            showTab(tabId);
        });
    });
}

function showTab(tabId) {
    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Remove active class from all nav tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab content
    const targetContent = document.getElementById(tabId);
    if (targetContent) {
        targetContent.classList.add('active');
    }
    
    // Add active class to corresponding nav tab
    const targetTab = document.querySelector(`[data-tab="${tabId}"]`);
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    currentTab = tabId;
}

// Installation Terminal Simulation
function startInstallation() {
    if (installationStarted) {
        return;
    }
    
    installationStarted = true;
    const terminalContent = document.getElementById('terminal-content');
    const commands = [
        'git clone https://github.com/votre-utilisateur/fixierun-app.git',
        'cd fixierun-app',
        'chmod +x install.sh',
        './install.sh',
        'cp .env.example .env.local',
        'npm run verify'
    ];
    
    const responses = [
        'Clonage vers \'fixierun-app\'...\nrécupération de l\'historique...\nTerminé.',
        'Changement de répertoire vers fixierun-app',
        'Permissions d\'exécution accordées à install.sh',
        'Installation des dépendances...\nNext.js 15 installé\nReact 18 installé\nTypeScript configuré\nTailwind CSS configuré\nWeb3.js installé\nInstallation terminée avec succès!',
        'Fichier de configuration copié vers .env.local',
        'Vérification du projet...\n✓ Next.js configuré\n✓ TypeScript valide\n✓ Tailwind CSS opérationnel\n✓ Web3.js prêt\n✓ Base de données connectée\nTous les tests passés!'
    ];
    
    terminalContent.innerHTML = '';
    let commandIndex = 0;
    
    function executeNextCommand() {
        if (commandIndex < commands.length) {
            const command = commands[commandIndex];
            const response = responses[commandIndex];
            
            // Show command being typed
            typeCommand(command, () => {
                // Show response
                setTimeout(() => {
                    showResponse(response, () => {
                        commandIndex++;
                        setTimeout(executeNextCommand, 1000);
                    });
                }, 500);
            });
        } else {
            // Installation complete
            const completeLine = document.createElement('div');
            completeLine.className = 'terminal-line success-msg';
            completeLine.innerHTML = '<span class="prompt">✓</span>Installation de Fixie.Run terminée avec succès!';
            terminalContent.appendChild(completeLine);
            
            // Update project status
            updateProjectStatus();
            
            // Reset for potential future runs
            setTimeout(() => {
                installationStarted = false;
            }, 3000);
        }
    }
    
    executeNextCommand();
}

function typeCommand(command, callback) {
    const terminalContent = document.getElementById('terminal-content');
    const commandLine = document.createElement('div');
    commandLine.className = 'terminal-line';
    commandLine.innerHTML = '<span class="prompt">$</span><span class="command"></span>';
    terminalContent.appendChild(commandLine);
    
    const commandSpan = commandLine.querySelector('.command');
    let i = 0;
    
    function typeChar() {
        if (i < command.length) {
            commandSpan.textContent += command.charAt(i);
            i++;
            setTimeout(typeChar, 50 + Math.random() * 100);
        } else {
            callback();
        }
    }
    
    typeChar();
}

function showResponse(response, callback) {
    const terminalContent = document.getElementById('terminal-content');
    const responseLine = document.createElement('div');
    responseLine.className = 'terminal-line output';
    responseLine.innerHTML = response.replace(/\n/g, '<br>');
    terminalContent.appendChild(responseLine);
    
    terminalContent.scrollTop = terminalContent.scrollHeight;
    
    setTimeout(callback, 1000);
}

function updateProjectStatus() {
    // Update status indicators in overview
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length >= 2) {
        const buildStatus = statusItems[1].querySelector('.status');
        buildStatus.className = 'status status--success';
        buildStatus.textContent = 'Installation';
        statusItems[1].querySelector('span:last-child').textContent = 'Terminée';
    }
}

// Architecture Layer Details
function setupArchitectureLayers() {
    const layers = document.querySelectorAll('.layer');
    const layerDetails = document.getElementById('layer-details');
    
    const layerInfo = {
        frontend: {
            title: 'Frontend - Couche de Présentation',
            description: 'La couche frontend utilise les technologies React les plus modernes pour créer une interface utilisateur réactive et performante.',
            details: [
                'Next.js 15 : Framework React avec rendu côté serveur et génération statique',
                'React 18 : Bibliothèque UI avec les dernières fonctionnalités (Concurrent Features)',
                'TypeScript : Typage statique pour une meilleure robustesse du code'
            ]
        },
        ui: {
            title: 'UI Framework - Design System',
            description: 'Système de design moderne utilisant Tailwind CSS et des composants pré-construits pour une interface cohérente.',
            details: [
                'Tailwind CSS : Framework CSS utilitaire pour un développement rapide',
                'Radix UI : Composants primitifs accessibles et non-stylés',
                'shadcn/ui : Collection de composants réutilisables basés sur Radix'
            ]
        },
        blockchain: {
            title: 'Blockchain - Intégration Web3',
            description: 'Intégration complète avec l\'écosystème Ethereum pour les fonctionnalités Move-to-Earn.',
            details: [
                'Web3.js : Bibliothèque pour interagir avec la blockchain Ethereum',
                'Ethereum : Blockchain principale pour les smart contracts',
                'zkEVM : Solution de mise à l\'échelle pour des transactions rapides et peu coûteuses'
            ]
        },
        database: {
            title: 'Database - Stockage des Données',
            description: 'Base de données PostgreSQL moderne hébergée sur Neon pour des performances optimales.',
            details: [
                'Neon PostgreSQL : Base de données PostgreSQL serverless avec mise à l\'échelle automatique',
                'Stockage des profils utilisateurs et des données de course',
                'Intégration avec l\'ORM Prisma pour la gestion des données'
            ]
        }
    };
    
    layers.forEach(layer => {
        layer.addEventListener('click', () => {
            const layerType = layer.getAttribute('data-layer');
            const info = layerInfo[layerType];
            
            if (info) {
                layerDetails.innerHTML = `
                    <h4>${info.title}</h4>
                    <p>${info.description}</p>
                    <ul style="margin-top: 16px; padding-left: 20px;">
                        ${info.details.map(detail => `<li style="margin-bottom: 8px;">${detail}</li>`).join('')}
                    </ul>
                `;
            }
        });
    });
}

// Build Process Simulation - Fixed function
function startBuild(mode) {
    if (buildInProgress) {
        return;
    }
    
    buildInProgress = true;
    const steps = document.querySelectorAll('.step');
    const progressContainer = document.getElementById('build-progress');
    
    // Remove any existing success messages
    const existingMessages = progressContainer.querySelectorAll('div[style*="margin-top: 24px"]');
    existingMessages.forEach(msg => msg.remove());
    
    // Reset all steps
    steps.forEach(step => {
        step.classList.remove('active', 'completed');
    });
    
    const stepNames = ['Nettoyage', 'Installation', 'Compilation', 'Optimisation', 'Démarrage'];
    let currentStep = 0;
    
    function executeStep() {
        if (currentStep < steps.length) {
            // Mark current step as active
            steps[currentStep].classList.add('active');
            
            // Simulate step duration based on mode
            const stepDuration = mode === 'dev' ? 1500 : 2500;
            setTimeout(() => {
                // Mark step as completed
                steps[currentStep].classList.remove('active');
                steps[currentStep].classList.add('completed');
                
                currentStep++;
                executeStep();
            }, stepDuration + Math.random() * 1000);
        } else {
            // Build complete
            setTimeout(() => {
                const successMessage = document.createElement('div');
                successMessage.style.cssText = `
                    margin-top: 24px;
                    padding: 16px;
                    background-color: rgba(var(--color-success-rgb), 0.15);
                    border: 1px solid rgba(var(--color-success-rgb), 0.25);
                    border-radius: 8px;
                    color: var(--color-success);
                    text-align: center;
                    font-weight: 500;
                `;
                
                const modeText = mode === 'prod' ? 'Production' : 'Développement';
                successMessage.textContent = `Build ${modeText} terminé avec succès!`;
                progressContainer.appendChild(successMessage);
                
                // Update build status in overview
                updateBuildStatus();
                
                // Reset build state after completion
                setTimeout(() => {
                    buildInProgress = false;
                }, 2000);
            }, 500);
        }
    }
    
    executeStep();
}

function updateBuildStatus() {
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length >= 2) {
        const buildStatus = statusItems[1].querySelector('.status');
        buildStatus.className = 'status status--success';
        buildStatus.textContent = 'Build';
        statusItems[1].querySelector('span:last-child').textContent = 'Terminé';
    }
}

// Deployment Options
function selectDeployment(option) {
    selectedDeployment = option;
    
    // Update visual selection
    document.querySelectorAll('.deployment-option').forEach(opt => {
        opt.classList.remove('selected');
    });
    document.querySelector(`[data-option="${option}"]`).classList.add('selected');
    
    // Update deployment commands
    const commandsContainer = document.getElementById('deployment-commands');
    const deploymentOptions = {
        vercel: [
            'npm install -g vercel',
            'vercel deploy --prod'
        ],
        docker: [
            'docker build -t fixierun-app .',
            'docker run -p 3000:3000 fixierun-app'
        ],
        nodejs: [
            'npm run build',
            'npm run start'
        ]
    };
    
    const commands = deploymentOptions[option];
    const optionNames = {
        vercel: 'Vercel',
        docker: 'Docker',
        nodejs: 'Serveur Node.js'
    };
    
    commandsContainer.innerHTML = `
        <h4>Commandes pour ${optionNames[option]}</h4>
        ${commands.map(cmd => `<code>${cmd}</code>`).join('')}
    `;
    
    // Update deployment status
    updateDeploymentStatus();
}

function updateDeploymentStatus() {
    const statusItems = document.querySelectorAll('.status-item');
    if (statusItems.length >= 3) {
        const deployStatus = statusItems[2].querySelector('.status');
        deployStatus.className = 'status status--info';
        deployStatus.textContent = 'Déploiement';
        statusItems[2].querySelector('span:last-child').textContent = 'Configuré';
    }
}

// Deployment Checklist
function setupChecklistTracking() {
    const checkboxes = document.querySelectorAll('#deployment-checklist input[type="checkbox"]');
    const progressFill = document.getElementById('checklist-progress');
    const progressPercentage = document.getElementById('checklist-percentage');
    
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateChecklistProgress);
    });
    
    function updateChecklistProgress() {
        const totalItems = checkboxes.length;
        const checkedItems = document.querySelectorAll('#deployment-checklist input[type="checkbox"]:checked').length;
        const percentage = Math.round((checkedItems / totalItems) * 100);
        
        progressFill.style.width = `${percentage}%`;
        progressPercentage.textContent = `${percentage}%`;
        
        // Update deployment status when checklist is complete
        if (percentage === 100) {
            const statusItems = document.querySelectorAll('.status-item');
            if (statusItems.length >= 3) {
                const deployStatus = statusItems[2].querySelector('.status');
                deployStatus.className = 'status status--success';
                deployStatus.textContent = 'Déploiement';
                statusItems[2].querySelector('span:last-child').textContent = 'Prêt';
            }
        }
    }
}

// Utility functions for animations and interactions
function addTypewriterEffect(element, text, speed = 50) {
    element.textContent = '';
    let i = 0;
    
    function typeChar() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(typeChar, speed);
        }
    }
    
    typeChar();
}

// Add smooth scrolling for better UX
function smoothScrollTo(element) {
    element.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Keyboard navigation support
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '1':
                e.preventDefault();
                showTab('overview');
                break;
            case '2':
                e.preventDefault();
                showTab('installation');
                break;
            case '3':
                e.preventDefault();
                showTab('architecture');
                break;
            case '4':
                e.preventDefault();
                showTab('build');
                break;
            case '5':
                e.preventDefault();
                showTab('deployment');
                break;
        }
    }
});

// Add loading states and error handling
function showLoading(element) {
    element.style.opacity = '0.6';
    element.style.pointerEvents = 'none';
}

function hideLoading(element) {
    element.style.opacity = '1';
    element.style.pointerEvents = 'auto';
}

// Initialize tooltips for better user guidance
function initializeTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function showTooltip(e) {
    const tooltip = document.createElement('div');
    tooltip.className = 'tooltip';
    tooltip.textContent = e.target.getAttribute('data-tooltip');
    tooltip.style.cssText = `
        position: absolute;
        background: var(--color-surface);
        border: 1px solid var(--color-border);
        border-radius: var(--radius-sm);
        padding: 8px 12px;
        font-size: 12px;
        color: var(--color-text);
        z-index: 1000;
        box-shadow: var(--shadow-md);
        pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    const rect = e.target.getBoundingClientRect();
    tooltip.style.left = rect.left + 'px';
    tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.tooltip');
    if (tooltip) {
        tooltip.remove();
    }
}

// Performance monitoring
let performanceMetrics = {
    tabSwitches: 0,
    installationTime: 0,
    buildTime: 0
};

function trackTabSwitch(tabId) {
    performanceMetrics.tabSwitches++;
    console.log(`Switched to tab: ${tabId}, Total switches: ${performanceMetrics.tabSwitches}`);
}

// Export functions for global access
window.startInstallation = startInstallation;
window.startBuild = startBuild;
window.selectDeployment = selectDeployment;
window.showTab = showTab;