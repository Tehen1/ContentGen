flowchart TD
    subgraph "Client Applications"
        MobileApp["Mobile App (iOS/Android)"]
        WebApp["Web Application"]
        Wearables["Smartwatch Apps"]
    end
    
    subgraph "Backend Services"
        API["API Gateway"]
        Auth["Authentication Service"]
        Activities["Activity Tracking Service"]
        Analytics["Analytics Engine"]
        RewardEngine["Reward Calculation Engine"]
        NFTService["NFT Management Service"]
        Social["Social/Multiplayer Service"]
    end
    
    subgraph "Blockchain Layer"
        SmartContracts["Smart Contracts"]
        TokenContract["$FIXIE Token Contract"]
        NFTContract["NFT Contracts"]
        MarketplaceContract["Marketplace Contract"]
        GovernanceContract["Governance Contract"]
    end
    
    subgraph "Data Storage"
        ActivityDB[(Activity Database)]
        UserDB[(User Database)]
        MetadataDB[(NFT Metadata)]
        IPFS[("IPFS Storage")]
    end
    
    subgraph "External Services"
        Maps["Mapping Services"]
        Weather["Weather API"]
        HeartRate["Heart Rate Monitors"]
    end
    
    MobileApp --> API
    WebApp --> API
    Wearables --> API
    
    API --> Auth
    API --> Activities
    API --> Analytics
    API --> RewardEngine
    API --> NFTService
    API --> Social
    
    Activities --> ActivityDB
    Auth --> UserDB
    NFTService --> MetadataDB
    NFTService --> IPFS
    
    RewardEngine --> SmartContracts
    NFTService --> SmartContracts
    
    SmartContracts --> TokenContract
    SmartContracts --> NFTContract
    SmartContracts --> MarketplaceContract
    SmartContracts --> GovernanceContract
    
    Activities --> Maps
    Activities --> Weather
    Activities --> HeartRate