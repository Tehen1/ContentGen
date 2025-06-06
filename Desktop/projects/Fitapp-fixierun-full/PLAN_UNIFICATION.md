# Plan d'Unification FixieRun - Stratégie de Consolidation

## 1. Structure du Monorepo

### 1.1 Organisation des Workspaces
```bash
fixierun-ecosystem/
├── apps/
│   ├── web/                 # Application web principale Next.js
│   ├── admin/              # Dashboard administrateur
│   └── mobile/             # Application mobile Flutter
├── packages/
│   ├── ui/                 # Design system partagé
│   ├── core/              # Logique métier partagée
│   ├── blockchain/        # Intégrations Web3
│   └── config/            # Configurations partagées
└── services/
    ├── activity/          # Service de tracking
    ├── rewards/           # Gestion des récompenses
    ├── analytics/         # Service d'analytiques
    └── auth/              # Service d'authentification
```

### 1.2 Configuration Turborepo
Utilisation de pnpm comme gestionnaire de packages :
```json
{
  "packageManager": "pnpm@8.6.0",
  "workspaces": [
    "apps/*",
    "packages/*",
    "services/*"
  ]
}
```

## 2. Plan de Migration

### Phase 1 : Préparation (Semaine 1-2)

1. Configuration de l'environnement :
   ```bash
   # Installation des dépendances globales
   pnpm install
   
   # Configuration des hooks git
   pnpm dlx husky install
   pnpm dlx lint-staged
   ```

2. Migration des dépendances communes :
   ```json
   {
     "dependencies": {
       "@fixierun/ui": "workspace:*",
       "@fixierun/core": "workspace:*"
     }
   }
   ```

### Phase 2 : Migration des Services (Semaine 3-6)

1. Service d'Activité :
   - Migration depuis `FitApp-Consolidated/backend/activity-tracking`
   - Intégration avec zkEVM depuis `FitApp-zkEVM-Dashboard`

2. Service de Récompenses :
   - Fusion de `rewards` et `fixie-run-rewards-mobile`
   - Optimisation pour zkEVM

### Phase 3 : Applications Frontend (Semaine 7-10)

1. Application Web :
   ```typescript
   // apps/web/package.json
   {
     "name": "@fixierun/web",
     "dependencies": {
       "@fixierun/ui": "workspace:*",
       "@fixierun/core": "workspace:*",
       "next": "^13.4.0",
       "react": "^18.2.0"
     }
   }
   ```

2. Application Mobile :

#### Architecture Mobile Sécurisée
```typescript
// apps/mobile/src/core/health/health-connect.ts
export class HealthConnectService {
  // Intégration Health Connect avec chiffrement
  async syncHealthData(): Promise<EncryptedHealthData> {
    const healthData = await HealthConnect.getData();
    return encryptHealthData(healthData);
  }
}

// apps/mobile/src/core/crypto/encryption.ts
import { sodium } from 'libsodium-wrappers';

export class DataEncryption {
  static async encryptHealthData(data: HealthData): Promise<EncryptedData> {
    await sodium.ready;
    const key = sodium.crypto_secretbox_keygen();
    return {
      encrypted: sodium.crypto_secretbox_easy(
        JSON.stringify(data),
        nonce,
        key
      ),
      nonce: nonce
    };
  }
}
```

#### Configuration Mobile
```yaml
# apps/mobile/pubspec.yaml
name: fixierun_mobile
dependencies:
  flutter:
    sdk: flutter
  fixierun_core:
    path: ../../packages/core
  health_connect: ^1.0.0
  libsodium: ^2.0.0
  audit_logger: ^1.0.0
```

#### Système d'Audit et Logs
```typescript
// packages/core/src/audit/audit-logger.ts
export class AuditLogger {
  private static instance: AuditLogger;
  
  logHealthSync(data: {
    userId: string,
    dataType: string,
    timestamp: number,
    transactionHash?: string
  }) {
    const encryptedLog = this.encryptLog({
      ...data,
      source: 'health_connect',
      timestamp: Date.now()
    });
    
    return this.storeLog(encryptedLog);
  }
}
```

#### Service de Synchronisation
```typescript
// apps/mobile/src/services/sync-service.ts
export class SyncService {
  private healthConnect: HealthConnectService;
  private encryption: DataEncryption;
  private auditLogger: AuditLogger;
  private blockchainService: BlockchainService;

  async syncHealthData() {
    // 1. Récupérer et chiffrer les données Health Connect 
    const healthData = await this.healthConnect.syncHealthData();
    const encrypted = await this.encryption.encryptHealthData(healthData);

    // 2. Envoyer au backend pour validation
    const validatedData = await this.apiService.validateHealthData(encrypted);

    // 3. Interaction blockchain via backend
    const txHash = await this.blockchainService.recordHealthData(validatedData);

    // 4. Audit logging
    await this.auditLogger.logHealthSync({
      userId: this.getCurrentUser(),
      dataType: 'health_connect',
      txHash
    });
  }
}
```

#### Migration depuis Supabase
```typescript
// apps/mobile/src/migration/supabase-migration.ts
export class SupabaseMigration {
  // Migration des données existantes
  async migrateExistingData() {
    // 1. Récupérer les données Supabase
    const supabaseData = await this.fetchSupabaseData();
    
    // 2. Transformer pour nouveau format
    const transformedData = this.transformData(supabaseData);
    
    // 3. Migrer vers nouvelle DB
    await this.newDbService.batchImport(transformedData);
    
    // 4. Vérification et audit
    await this.verifyMigration(transformedData);
  }
}
```

#### Configuration Backend pour Mobile
```typescript
// services/mobile-sync/src/index.ts
export class MobileSyncService {
  // Validation des données mobiles
  async validateHealthData(
    encryptedData: EncryptedHealthData
  ): Promise<ValidatedHealthData> {
    // 1. Déchiffrement et validation
    const decrypted = await this.decryptData(encryptedData);
    const validated = await this.validateData(decrypted);
    
    // 2. Interaction blockchain sécurisée
    const txHash = await this.blockchainService.recordValidatedData(validated);
    
    // 3. Audit log
    await this.auditLogger.logValidation({
      dataHash: validated.hash,
      txHash
    });
    
    return {
      status: 'validated',
      txHash,
      timestamp: Date.now()
    };
  }
}
```

## 3. Meilleures Pratiques

### 3.1 Convention de Nommage
```typescript
// Packages
@fixierun/ui
@fixierun/core
@fixierun/blockchain

// Services
@fixierun/activity-service
@fixierun/rewards-service

// Apps
@fixierun/web
@fixierun/mobile
```

### 3.2 Scripts Partagés
```json
{
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint"
  }
}
```

### 3.3 Configuration ESLint Unifiée
```javascript
// packages/config/eslint-config/index.js
module.exports = {
  extends: ['next/core-web-vitals'],
  rules: {
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal'],
      'newlines-between': 'always'
    }]
  }
};
```

## 4. Étapes de Migration Détaillées

### 4.1 Migration des Smart Contracts

#### 4.1.1 Structure des Contrats Optimisés zkEVM
```solidity
// packages/blockchain/contracts/tracking/FitTrackerStorage.sol
contract FitTrackerStorage {
    // Structures de données optimisées
    struct Workout {
        uint256 id;
        uint256 timestamp;
        string workoutType;
        uint256 duration;
        uint256 caloriesBurned;
        string metadata;
    }

    struct StepRecord {
        uint256 date;
        uint256 count;
        uint256 distance;
    }

    struct Achievement {
        uint256 id;
        string name;
        string description;
        uint256 unlockedAt;
    }

    // Mappings optimisés pour zkEVM
    mapping(address => Workout[]) private userWorkouts;
    mapping(address => mapping(uint256 => StepRecord)) private userStepRecords;
    mapping(address => Achievement[]) private userAchievements;
    mapping(address => mapping(address => bool)) private authorizedApps;
}
```

#### 4.1.2 Optimisations Gas sur zkEVM
```solidity
// packages/blockchain/contracts/tracking/FitTrackerOperations.sol
contract FitTrackerOperations {
    // Bulk operations optimisées
    function bulkRecordSteps(
        uint256[] calldata dates,
        uint256[] calldata stepCounts,
        uint256[] calldata distances
    ) external {
        for (uint256 i = 0; i < dates.length; i++) {
            _recordStepBatch(dates[i], stepCounts[i], distances[i]);
        }
    }

    // Système d'autorisation optimisé
    function setAppAuthorization(address app, bool authorized) external {
        require(app != address(0), "Invalid app");
        authorizedApps[msg.sender][app] = authorized;
        emit AppAuthorized(msg.sender, app, authorized);
    }
}
```

#### 4.1.3 Événements et Métriques
```solidity
// packages/blockchain/contracts/tracking/FitTrackerEvents.sol
interface IFitTrackerEvents {
    event WorkoutAdded(
        address indexed user,
        uint256 indexed workoutId,
        string workoutType,
        uint256 timestamp
    );
    
    event StepsRecorded(
        address indexed user,
        uint256 indexed date,
        uint256 count
    );
    
    event AchievementUnlocked(
        address indexed user,
        uint256 indexed achievementId,
        string name
    );
}
```

#### 4.1.4 Factory et Déploiement
```typescript
// packages/blockchain/scripts/deploy.ts
async function deployFitTracker() {
    // Déploiement optimisé pour zkEVM
    const FitTrackerStorage = await ethers.getContractFactory("FitTrackerStorage");
    const storage = await FitTrackerStorage.deploy();
    
    const FitTrackerOperations = await ethers.getContractFactory("FitTrackerOperations");
    const operations = await FitTrackerOperations.deploy(storage.address);

    // Configuration du proxy pour mises à jour
    const proxy = await deployProxy(operations.address);
    
    return {
        storage: storage.address,
        operations: operations.address,
        proxy: proxy.address
    };
}
```

#### 4.1.5 Intégration Frontend
```typescript
// packages/blockchain/src/hooks/useFitTracker.ts
export const useFitTracker = () => {
    const { provider } = useWeb3();
    
    const recordWorkout = async (workout: Workout) => {
        const contract = getFitTrackerContract(provider);
        const tx = await contract.addWorkout(
            workout.type,
            workout.duration,
            workout.calories,
            JSON.stringify(workout.metadata)
        );
        await tx.wait();
    };

    const bulkSyncSteps = async (stepData: StepData[]) => {
        const contract = getFitTrackerContract(provider);
        const tx = await contract.bulkRecordSteps(
            stepData.map(d => d.date),
            stepData.map(d => d.count),
            stepData.map(d => d.distance)
        );
        await tx.wait();
    };
};
```

#### 4.1.6 Tests d'Optimisation
```typescript
// packages/blockchain/test/gas-optimization.test.ts
describe("FitTracker Gas Optimizations", () => {
    it("should optimize bulk operations gas usage", async () => {
        const gasUsed = await measureGasUsage(
            fitTracker.bulkRecordSteps,
            [dates, counts, distances]
        );
        expect(gasUsed).to.be.below(GAS_LIMIT_THRESHOLD);
    });

    it("should efficiently handle achievements", async () => {
        const gasUsed = await measureGasUsage(
            fitTracker.unlockAchievement,
            ["Marathon Complete", "Completed first marathon"]
        );
        expect(gasUsed).to.be.below(ACHIEVEMENT_GAS_LIMIT);
    });
});
```

### 4.2 Migration de l'API
1. Services FastAPI :
   ```python
   # services/activity/main.py
   from fastapi import FastAPI
   from .routers import activities, rewards

   app = FastAPI(title="FixieRun Activity Service")
   ```

2. Configuration Docker :
   ```yaml
   # docker-compose.yml
   version: '3.8'
   services:
     activity:
       build: ./services/activity
     rewards:
       build: ./services/rewards
   ```

## 5. Tests et Qualité

### 5.1 Configuration des Tests
```json
{
  "scripts": {
    "test": "jest",
    "test:e2e": "playwright test",
    "test:coverage": "jest --coverage"
  }
}
```

### 5.2 CI/CD
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test
```

## 6. Documentation

### 6.1 Structure de la Documentation
```markdown
docs/
├── getting-started.md
├── architecture/
│   ├── overview.md
│   └── decisions/
└── api/
    ├── rest-api.md
    └── graphql.md
```

### 6.2 Exemples d'Utilisation
```typescript
// Exemple d'utilisation du design system
import { Button } from '@fixierun/ui';

// Exemple d'intégration blockchain
import { useWeb3 } from '@fixierun/blockchain';
```

## 7. Monitoring et Performance

### 7.1 Stack de Monitoring

#### Architecture de Monitoring
```bash
monitoring/
├── prometheus/            # Métriques et alerting
│   ├── prometheus.yml    # Configuration principale
│   └── rules/            # Règles d'alerting
├── grafana/              # Visualisation
│   ├── dashboards/       # Dashboards préconfigurés
│   └── datasources/      # Sources de données
├── loki/                 # Agrégation de logs
│   └── local-config.yaml # Configuration Loki
└── promtail/            # Collection de logs
    └── config.yml       # Configuration Promtail
```

#### Configuration Docker Compose
```yaml
# docker-compose.monitoring.yml
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./monitoring/prometheus:/etc/prometheus
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
    ports:
      - "9090:9090"
    networks:
      - monitoring-network

  grafana:
    image: grafana/grafana:latest
    volumes:
      - ./monitoring/grafana:/etc/grafana
      - grafana_data:/var/lib/grafana
    environment:
      - GF_AUTH_DISABLE_LOGIN_FORM=false
      - GF_AUTH_ANONYMOUS_ENABLED=false
      - GF_SECURITY_ADMIN_PASSWORD=${GRAFANA_PASSWORD}
    ports:
      - "3001:3000"
    networks:
      - monitoring-network

  loki:
    image: grafana/loki:latest
    volumes:
      - ./monitoring/loki:/etc/loki
      - loki_data:/loki
    ports:
      - "3100:3100"
    networks:
      - monitoring-network

  promtail:
    image: grafana/promtail:latest
    volumes:
      - ./monitoring/promtail:/etc/promtail
      - /var/log:/var/log
    networks:
      - monitoring-network
```

### 7.2 Métriques et Alerting

#### Métriques Clés
```yaml
# monitoring/prometheus/rules/app_rules.yml
groups:
  - name: fixierun_alerts
    rules:
      # Performance Frontend
      - alert: HighPageLoadTime
        expr: page_load_time_seconds > 3
        for: 5m
        labels:
          severity: warning

      # Performance Backend
      - alert: HighAPILatency
        expr: http_request_duration_seconds > 1
        for: 5m
        labels:
          severity: warning

      # Blockchain
      - alert: HighGasFees
        expr: eth_gas_price > 100
        for: 10m
        labels:
          severity: warning
```

#### Dashboards Préconfigurés
```typescript
// monitoring/grafana/dashboards/main.json
{
  "title": "FixieRun Overview",
  "panels": [
    {
      "title": "Utilisateurs Actifs",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [{
        "expr": "sum(active_users_total)"
      }]
    },
    {
      "title": "Transactions NFT",
      "type": "graph",
      "datasource": "Prometheus",
      "targets": [{
        "expr": "sum(nft_transactions_total)"
      }]
    }
  ]
}
```

### 7.3 Intégration dans le Monorepo

#### Configuration des Services
```typescript
// packages/monitoring/src/metrics.ts
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus';
import { MeterProvider } from '@opentelemetry/metrics';

export class MetricsService {
  private static instance: MetricsService;
  private meterProvider: MeterProvider;

  private constructor() {
    this.meterProvider = new MeterProvider({
      exporter: new PrometheusExporter({
        port: 9464,
        endpoint: '/metrics'
      })
    });
  }

  public static getInstance(): MetricsService {
    if (!MetricsService.instance) {
      MetricsService.instance = new MetricsService();
    }
    return MetricsService.instance;
  }

  public recordMetric(name: string, value: number, labels: Record<string, string>) {
    const meter = this.meterProvider.getMeter('fixierun');
    const counter = meter.createCounter(name);
    counter.add(value, labels);
  }
}
```

#### Intégration dans les Applications
```typescript
// apps/web/src/middleware.ts
import { MetricsService } from '@fixierun/monitoring';

export async function middleware(request: NextRequest) {
  const metrics = MetricsService.getInstance();
  
  metrics.recordMetric('http_request_total', 1, {
    path: request.nextUrl.pathname,
    method: request.method
  });
}
```

### 7.4 Alerting et Notifications

#### Configuration des Alertes
```yaml
# monitoring/prometheus/alertmanager.yml
receivers:
  - name: 'team-alerts'
    slack_configs:
      - channel: '#alerts'
        api_url: '${SLACK_WEBHOOK_URL}'

route:
  receiver: 'team-alerts'
  group_by: ['alertname', 'cluster', 'service']
  group_wait: 30s
  group_interval: 5m
  repeat_interval: 4h
```

#### Intégration Slack
```typescript
// packages/monitoring/src/notifications.ts
export class AlertNotifier {
  static async sendAlert(alert: Alert) {
    const webhook = process.env.SLACK_WEBHOOK_URL;
    await fetch(webhook, {
      method: 'POST',
      body: JSON.stringify({
        text: `🚨 Alerte: ${alert.title}\n${alert.description}`
      })
    });
  }
}
```

## 8. Sécurité

### 8.1 Gestion des Secrets
```bash
# .env.example
NEXT_PUBLIC_CHAIN_ID=324
STACK_SECRET_SERVER_KEY=ssk_...
DATABASE_URL=postgresql://...
```

### 8.2 Audit et Conformité
- Audit des smart contracts
- Tests de pénétration
- Conformité RGPD
- Sécurité Web3

