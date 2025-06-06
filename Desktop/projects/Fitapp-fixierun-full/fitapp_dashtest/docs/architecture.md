# FixieRun Technical Architecture

## Overview

This document explains the architectural foundations of FixieRun, referencing components from the system diagram.

---

## Frontend Application

### UI Components & Application State

- **UI Components:** React components rendering visual interfaces for activity stats, NFT management, maps, wallet interactions, and user dashboards.
- **Application State:** Managed with state libraries (e.g., Redux or Zustand), storing user session, live activity, NFT assets, and synchronization flags.

### Core Features

- **Activity Tracking (`Track`):** Interfaces with mobile geolocation APIs to record user runs/bike rides, calculate rewards, and trigger token issuance.
- **NFT Management (`NFT`):** Manages local NFT inventory, communicates with backend/blockchain to fetch, mint, and display NFTs for the user.
- **Map Integration (`Map`):** Uses map API (like Mapbox/OpenStreetMap) for live and historical activity visualization.
- **Wallet Integration (`Wallet`):** Manages authentication and transaction signing using Web3 wallet providers (MetaMask, WalletConnect).

### Screens

Each screen in the SPA/mobile app corresponds to a feature or data view:

- **Dashboard:** Entry point aggregating activity stats, NFT and token status, and quick actions.
- **Track Screen:** Special interface for starting, viewing, and ending activities; real-time location and stats display.
- **NFT Gallery Screen:** Shows user-owned NFTs, filtering, rarity visualization, and access to NFT-related actions.
- **Marketplace Screen:** Browse, buy, and sell NFTs with in-app and blockchain transactions.
- **Profile Screen:** User profile, settings, and activity history.

---

## External Services

- **Geolocation API (`Geo`):** Device API (or server-side fallback) for precise user location and route mapping.
- **Blockchain Network:** Used for NFT minting, wallet signatures, and $FIXIE token transfers—integrated via smart contracts (e.g., zkEVM).
- **IPFS/Metadata Storage:** NFT/images and metadata stored in a decentralized storage layer (IPFS).
- **Map Tiles API:** Provider for rendering maps and routes.

---

## Component Interactions

- **UI ⇄ State:** Two-way sync—UI updates reflect state, and UI actions mutate state.
- **Track → Geo, Map → Map API, NFT → IPFS, Wallet → Blockchain:** Each feature communicates with the relevant external service.
- **Screens → Features:** Screens trigger business logic handled by core modules/features.
- **NFT ↔ Blockchain, NFT ↔ IPFS:** For minting, transferring, displaying, and storing NFTs.
- **Marketplace and NFT Gallery:** Both make use of the NFT and Wallet services.

---

## Summary

This architecture enables modular development, rapid iteration of features, and scalable Web3/fitness integration. Each module is testable independently and communicates via well-defined APIs and events.

---