# Guide Technique - Smart Contracts FitApp

## Architecture Générale

### Contracts Principaux
- `HealthCoin.sol` : Token ERC-20 pour les récompenses santé
- `ProfileManager.sol` : Gestion des profils utilisateurs
- `AchievementTracker.sol` : Suivi des réalisations et badges
- `NFTManager.sol` : Gestion des NFT (certificats, récompenses)

### Fonctionnalités Clés
- Minting de tokens (HealthCoin)
- Création et gestion de profils
- Suivi des réalisations
- Minting et transfert de NFT
- Système de récompenses

## Structure des Contracts

```
blockchain/
├── contracts/
│   ├── interfaces/
│   │   ├── IHealthCoin.sol
│   │   ├── IProfileManager.sol
│   │   └── IAchievementTracker.sol
│   ├── HealthCoin.sol
│   ├── ProfileManager.sol
│   ├── AchievementTracker.sol
│   └── NFTManager.sol
├── scripts/
│   ├── deploy/
│   │   ├── deploy_healthcoin.ts
│   │   ├── deploy_profile_manager.ts
│   │   └── deploy_achievement_tracker.ts
│   └── test/
│       ├── test_healthcoin.ts
│       ├── test_profile_manager.ts
│       └── test_achievement_tracker.ts
└── tests/
    ├── HealthCoin.test.ts
    ├── ProfileManager.test.ts
    └── AchievementTracker.test.ts
```

## Best Practices

### Sécurité
- Utiliser OpenZeppelin pour les patterns de sécurité
- Implémenter des pauses d'urgence
- Limiter les droits d'administration
- Utiliser des vérifications de transfert

### Tests
- Tests unitaires pour chaque fonction
- Tests d'intégration pour les interactions
- Tests de sécurité (reentrancy, overflow, etc.)
- Tests de gas optimisation

### Déploiement
- Scripts de déploiement automatisés
- Gestion des versions des contrats
- Documentation des interfaces
- Vérification sur Etherscan

## Exemple de Contract (HealthCoin.sol)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract HealthCoin is ERC20, Ownable, Pausable {
    constructor() ERC20("HealthCoin", "HEALTH") {
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    function mint(address to, uint256 amount) public onlyOwner whenNotPaused {
        _mint(to, amount);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    function _beforeTokenTransfer(address from, address to, uint256 amount)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, amount);
    }
}
```

## Tests Automatisés

```typescript
// HealthCoin.test.ts
describe("HealthCoin", function () {
    let healthCoin: HealthCoin;
    let owner: SignerWithAddress;
    let addr1: SignerWithAddress;
    let addr2: SignerWithAddress;

    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();
        const HealthCoin = await ethers.getContractFactory("HealthCoin");
        healthCoin = await HealthCoin.deploy();
    });

    it("Should mint tokens to owner", async function () {
        const ownerBalance = await healthCoin.balanceOf(owner.address);
        expect(ownerBalance).to.equal(1000000 * 10 ** 18);
    });

    it("Should transfer tokens between accounts", async function () {
        await healthCoin.mint(addr1.address, 100 * 10 ** 18);
        await healthCoin.connect(addr1).transfer(addr2.address, 50 * 10 ** 18);
        
        const addr1Balance = await healthCoin.balanceOf(addr1.address);
        const addr2Balance = await healthCoin.balanceOf(addr2.address);
        
        expect(addr1Balance).to.equal(50 * 10 ** 18);
        expect(addr2Balance).to.equal(50 * 10 ** 18);
    });
});
```

## Déploiement

```typescript
// deploy_healthcoin.ts
async function main() {
    const HealthCoin = await ethers.getContractFactory("HealthCoin");
    const healthCoin = await HealthCoin.deploy();
    
    console.log("HealthCoin deployed to:", healthCoin.address);
    
    // Vérification sur Etherscan
    await healthCoin.deployed();
    console.log("Verifying contract...");
    await run("verify:verify", {
        address: healthCoin.address,
        constructorArguments: [],
    });
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
```

## Documentation

- Chaque fonction doit avoir une documentation NatSpec
- Diagrammes d'architecture des contrats
- Guide d'intégration pour les dApps
- Documentation des interfaces et événements
