// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Contrat des NFTs FixieRun
 * @dev NFTs représentant des équipements, badges et récompenses sur l'application FixieRun
 */
contract FixieNFT is ERC721Enumerable, ERC721URIStorage, Pausable, AccessControl {
    using Counters for Counters.Counter;
    
    // Compteur pour les IDs de tokens
    Counters.Counter private _tokenIdCounter;
    
    // Définition des rôles
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    // Mapping pour stocker les types d'équipements par tokenId
    mapping(uint256 => string) private _nftTypes;
    
    // Mapping pour stocker la rareté des NFTs
    mapping(uint256 => uint8) private _rarityLevels;
    
    // Mapping pour stocker le bonus de récompense par NFT
    mapping(uint256 => uint8) private _rewardBoosts;
    
    // Événements
    event NFTMinted(address indexed to, uint256 tokenId, string nftType, uint8 rarityLevel, uint8 rewardBoost);
    event NFTBoosted(uint256 tokenId, uint8 oldBoost, uint8 newBoost);
    
    // Types d'NFT
    string[] public nftTypes = ["shoes", "badge", "collectible", "equipment"];
    
    // Structure pour les métadonnées
    struct NFTMetadata {
        string name;
        string nftType;
        uint8 rarityLevel;
        uint8 rewardBoost;
        uint8 level;
        bool upgradable;
    }
    
    // Mapping des métadonnées
    mapping(uint256 => NFTMetadata) private _metadata;
    
    /**
     * @dev Constructeur du contrat
     * @param admin Adresse de l'administrateur qui recevra tous les rôles
     */
    constructor(address admin) ERC721("Fixie Run NFT", "FIXNFT") {
        // Configuration des rôles
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
        _grantRole(PAUSER_ROLE, admin);
        _grantRole(MINTER_ROLE, admin);
    }
    
    /**
     * @dev Mettre en pause toutes les opérations NFT
     * @notice Seule une adresse avec le rôle PAUSER peut appeler cette fonction
     */
    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }
    
    /**
     * @dev Reprendre les opérations NFT après une pause
     * @notice Seule une adresse avec le rôle PAUSER peut appeler cette fonction
     */
    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }
    
    /**
     * @dev Créer un nouveau NFT
     * @param to Adresse qui recevra le NFT
     * @param uri Lien vers les métadonnées du NFT
     * @param nftType Type de NFT ("shoes", "badge", "collectible", "equipment")
     * @param rarityLevel Niveau de rareté (1-5)
     * @param rewardBoost Pourcentage de boost sur les récompenses (0-100)
     * @param name Nom du NFT
     * @param level Niveau initial du NFT
     * @param upgradable Si le NFT peut être amélioré
     * @return uint256 ID du nouveau token créé
     */
    function safeMint(
        address to,
        string memory uri,
        string memory nftType,
        uint8 rarityLevel,
        uint8 rewardBoost,
        string memory name,
        uint8 level,
        bool upgradable
    ) public onlyRole(MINTER_ROLE) returns (uint256) {
        // Valider les paramètres
        require(rarityLevel >= 1 && rarityLevel <= 5, "Niveau de rarete invalide");
        require(rewardBoost <= 100, "Boost de recompense invalide");
        require(bytes(name).length > 0, "Le nom ne peut pas etre vide");
        
        // Valider que le type NFT est valide
        bool validType = false;
        for (uint i = 0; i < nftTypes.length; i++) {
            if (keccak256(bytes(nftTypes[i])) == keccak256(bytes(nftType))) {
                validType = true;
                break;
            }
        }
        require(validType, "Type NFT invalide");
        
        // Incrémenter et obtenir un nouveau tokenId
        _tokenIdCounter.increment();
        uint256 tokenId = _tokenIdCounter.current();
        
        // Mint du NFT
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        // Stocker les métadonnées
        _nftTypes[tokenId] = nftType;
        _rarityLevels[tokenId] = rarityLevel;
        _rewardBoosts[tokenId] = rewardBoost;
        
        _metadata[tokenId] = NFTMetadata({
            name: name,
            nftType: nftType,
            rarityLevel: rarityLevel,
            rewardBoost: rewardBoost,
            level: level,
            upgradable: upgradable
        });
        
        // Émettre l'événement
        emit NFTMinted(to, tokenId, nftType, rarityLevel, rewardBoost);
        
        return tokenId;
    }
    
    /**
     * @dev Augmenter le boost de récompense d'un NFT
     * @param tokenId ID du token à booster
     * @param newBoost Nouvelle valeur de boost
     * @notice Seule une adresse avec le rôle MINTER peut appeler cette fonction
     */
    function upgradeRewardBoost(uint256 tokenId, uint8 newBoost) public onlyRole(MINTER_ROLE) {
        require(_exists(tokenId), "NFT inexistant");
        require(newBoost <= 100, "Boost de recompense invalide");
        require(_metadata[tokenId].upgradable, "Le NFT ne peut pas etre ameliore");
        require(newBoost > _rewardBoosts[tokenId], "Le nouveau boost doit etre superieur");
        
        uint8 oldBoost = _rewardBoosts[tokenId];
        _rewardBoosts[tokenId] = newBoost;
        _metadata[tokenId].rewardBoost = newBoost;
        
        emit NFTBoosted(tokenId, oldBoost, newBoost);
    }
    
    /**
     * @dev Augmenter le niveau d'un NFT
     * @param tokenId ID du token à augmenter de niveau
     * @param newLevel Nouveau niveau
     * @notice Seule une adresse avec le rôle MINTER peut appeler cette fonction
     */
    function upgradeLevel(uint256 tokenId, uint8 newLevel) public onlyRole(MINTER_ROLE) {
        require(_exists(tokenId), "NFT inexistant");
        require(_metadata[tokenId].upgradable, "Le NFT ne peut pas etre ameliore");
        require(newLevel > _metadata[tokenId].level, "Le nouveau niveau doit etre superieur");
        
        _metadata[tokenId].level = newLevel;
    }
    
    /**
     * @dev Récupérer les métadonnées d'un NFT
     * @param tokenId ID du token
     * @return NFTMetadata structure contenant les métadonnées
     */
    function getNFTMetadata(uint256 tokenId) public view returns (NFTMetadata memory) {
        require(_exists(tokenId), "NFT inexistant");
        return _metadata[tokenId];
    }
    
    /**
     * @dev Récupérer le type d'un NFT
     * @param tokenId ID du token
     * @return string type du NFT
     */
    function getNFTType(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "NFT inexistant");
        return _nftTypes[tokenId];
    }
    
    /**
     * @dev Récupérer la rareté d'un NFT
     * @param tokenId ID du token
     * @return uint8 niveau de rareté (1-5)
     */
    function getRarityLevel(uint256 tokenId) public view returns (uint8) {
        require(_exists(tokenId), "NFT inexistant");
        return _rarityLevels[tokenId];
    }
    
    /**
     * @dev Récupérer le boost de récompense d'un NFT
     * @param tokenId ID du token
     * @return uint8 pourcentage de boost (0-100)
     */
    function getRewardBoost(uint256 tokenId) public view returns (uint8) {
        require(_exists(tokenId), "NFT inexistant");
        return _rewardBoosts[tokenId];
    }
    
    /**
     * @dev Récupérer le boost total de récompense pour toutes les NFTs possédées par un utilisateur
     * @param owner Adresse du propriétaire
     * @return uint16 somme totale des boosts (0-100+)
     */
    function getTotalRewardBoost(address owner) public view returns (uint16) {
        uint256 balance = balanceOf(owner);
        if (balance == 0) {
            return 0;
        }
        
        uint16 totalBoost = 0;
        for (uint256 i = 0; i < balance; i++) {
            uint256 tokenId = tokenOfOwnerByIndex(owner, i);
            totalBoost += _rewardBoosts[tokenId];
        }
        
        // Limiter à 100% de boost maximum
        return totalBoost > 100 ? 100 : totalBoost;
    }
    
    /**
     * @dev Hook interne qui est appelé avant chaque transfert de tokens
     */
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize)
        internal
        whenNotPaused
        override(ERC721, ERC721Enumerable)
    {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    /**
     * @dev Override requis par Solidity pour résoudre le conflit d'héritage multiple
     */
    function _burn(uint256 tokenId) 
        internal 
        override(ERC721, ERC721URIStorage) 
    {
        super._burn(tokenId);
        
        // Nettoyer les métadonnées
        delete _nftTypes[tokenId];
        delete _rarityLevels[tokenId];
        delete _rewardBoosts[tokenId];
        delete _metadata[tokenId];
    }
    
    /**
     * @dev Override requis par Solidity pour récupérer l'URI d'un token
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    /**
     * @dev Override requis pour supporter les interfaces
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}