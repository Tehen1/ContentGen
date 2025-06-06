graph TD
    Client[Client Applications]
    Frontend[Frontend Web App]
    Mobile[Mobile Flutter App]
    
    ActivityTracking[Activity Tracking Service]
    Analytics[Analytics Service]
    Challenges[Challenges Service]
    NFT[NFT Management Service]
    Rewards[Rewards Service]
    
    Blockchain[Blockchain Integration]
    
    Client -->|HTTP/REST| Frontend
    Client -->|Mobile App| Mobile
    
    Frontend -->|API Calls| ActivityTracking
    Frontend -->|API Calls| Analytics
    Frontend -->|API Calls| Challenges
    Frontend -->|API Calls| NFT
    Frontend -->|API Calls| Rewards
    
    Mobile -->|API Calls| ActivityTracking
    Mobile -->|API Calls| Analytics
    Mobile -->|API Calls| Challenges
    Mobile -->|API Calls| NFT
    Mobile -->|API Calls| Rewards
    
    ActivityTracking -->|Data Processing| Analytics
    Challenges -->|Achievement Tracking| Rewards
    Rewards -->|Token Generation| NFT
    NFT -->|Blockchain TX| Blockchain
    Rewards -->|Blockchain TX| Blockchain
    
    subgraph "Containerized Services"
        ActivityTracking
        Analytics
        Challenges
        NFT
        Rewards
    end