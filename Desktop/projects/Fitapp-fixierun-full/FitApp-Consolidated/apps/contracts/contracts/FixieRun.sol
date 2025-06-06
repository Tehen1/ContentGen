// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "./interfaces/IOracle.sol";
import "./libraries/ValidationLib.sol";
import "./libraries/SafeCast.sol";
import "./libraries/EnumerableSet.sol";

/**
 * @title FixieRun
 * @dev Contrat principal pour l'application FixieRun combinant cyclisme, blockchain et données de santé
 */
contract FixieRun is ReentrancyGuard {
    using SafeCast for uint256;
    using SafeCast for int256;
    using EnumerableSet for EnumerableSet.AddressSet;
    using ValidationLib for ValidationLib.Activity;

    // Types d'événements
    event ActivityAdded(address indexed user, uint256 activityId, uint256 timestamp);
    event ActivityValidated(address indexed user, uint256 activityId);
    event BikeRegistered(address indexed user, uint256 bikeId);
    event BikeStatusUpdated(address indexed user, uint256 bikeId, bool active);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardRateUpdated(uint256 oldRate, uint256 newRate);
    event OracleUpdated(address indexed oldOracle, address indexed newOracle);
    event UserBlacklisted(address indexed user, bool isBlacklisted);
    
    // Structure pour les activités
    struct Activity {
        uint256 timestamp;
        uint256 distance;  // en mètres
        uint256 duration;  // en secondes
        uint256 calories;  // en calories
        uint256 validatedTimestamp;
        bool validated;
    }
    
    // Structure pour les NFT de vélo
    struct Bike {
        uint256 id;
        string model;
        uint256 efficiency;  // facteur d'efficacité pour les récompenses (1-1000)
        bool active;
        uint256 lastMaintenance;
    }
    
    // Données de base
    address public owner;
    IOracle public oracle;
    ERC20Burnable public rewardToken;
    uint256 public rewardRate = 100;  // tokens par km (en centièmes)
    uint256 public maintenanceInterval = 30 days;
    
    // Stockage des données
    mapping(address => Activity[]) public userActivities;
    mapping(address => Bike[]) public userBikes;
    mapping(address => uint256) public rewards;
    mapping(address => bool) public isUserBlacklisted;
    EnumerableSet.AddressSet private blacklistedUsersSet;

    // Modificateur pour vérifier l'authenticité de l'appelant
    modifier onlyOwner() {
        require(msg.sender == owner, "Seul le propriétaire peut exécuter cette fonction");
        _;
    }

    modifier onlyOracle() {
        require(msg.sender == address(oracle), "Seul l'oracle peut exécuter cette fonction");
        _;
    }

    modifier whenNotBlacklisted(address user) {
        require(!isUserBlacklisted[user], "Utilisateur blacklisté");
        _;
    }

    /**
     * @dev Constructeur
     * @param _rewardToken Adresse du token ERC20 utilisé pour les récompenses
     */
    constructor(ERC20Burnable _rewardToken) {
        owner = msg.sender;
        rewardToken = _rewardToken;
    }

    /**
     * @dev Enregistre une nouvelle activité
     * @param _distance Distance parcourue en mètres
     * @param _duration Durée en secondes
     * @param _calories Calories brûlées
     */
    function recordRide(
        uint256 _distance, 
        uint256 _duration, 
        uint256 _calories
    ) 
        external 
        nonReentrant 
        whenNotBlacklisted(msg.sender)
    {
        require(_distance > 0, "La distance doit être positive");
        require(_duration > 0, "La durée doit être positive");
        
        // Vérifie qu'un vélo est actif
        require(hasActiveBike(msg.sender), "Vous devez avoir un vélo actif");

        // Crée la nouvelle activité
        Activity memory newActivity = Activity({
            timestamp: block.timestamp,
            distance: _distance,
            duration: _duration,
            calories: _calories,
            validated: false,
            validatedTimestamp: 0
        });

        // Stocke l'activité
        userActivities[msg.sender].push(newActivity);

        // Émet l'événement
        emit ActivityAdded(msg.sender, userActivities[msg.sender].length - 1, block.timestamp);
    }

    /**
     * @dev Valide une activité (par l'oracle)
     * @param _user Adresse de l'utilisateur
     * @param _activityIndex Index de l'activité à valider
     */
    function validateActivity(address _user, uint256 _activityIndex) 
        external 
        onlyOracle 
        nonReentrant
    {
        require(_activityIndex < userActivities[_user].length, "Activité inexistante");
        
        Activity storage activity = userActivities[_user][_activityIndex];
        require(!activity.validated, "Activité déjà validée");

        // Valide l'activité
        activity.validated = true;
        activity.validatedTimestamp = block.timestamp;

        // Vérifie les données de l'activité
        require(
            ValidationLib.validateActivity(activity, block.timestamp), 
            "Données d'activité invalides"
        );

        // Calcule la récompense
        uint256 km = activity.distance / 1000;
        uint256 baseReward = km * rewardRate;
        uint256 efficiencyFactor = getActiveBikeEfficiency(_user);
        uint256 rewardAmount = baseReward * efficiencyFactor / 1000;

        // Ajoute la récompense
        rewards[_user] += rewardAmount;

        // Émet l'événement
        emit ActivityValidated(_user, _activityIndex);
        emit RewardClaimed(_user, rewardAmount);
    }

    /**
     * @dev Enregistre un nouveau vélo NFT
     * @param _bikeId ID du vélo
     * @param _model Modèle du vélo
     * @param _efficiency Facteur d'efficacité (1-1000)
     */
    function registerBike(
        uint256 _bikeId, 
        string memory _model, 
        uint256 _efficiency
    ) 
        external 
        nonReentrant 
        whenNotBlacklisted(msg.sender)
    {
        require(_efficiency > 0 && _efficiency <= 1000, "Efficacité invalide");
        
        Bike memory newBike = Bike({
            id: _bikeId,
            model: _model,
            efficiency: _efficiency,
            active: true,
            lastMaintenance: block.timestamp
        });
        
        userBikes[msg.sender].push(newBike);
        emit BikeRegistered(msg.sender, _bikeId);
    }

    /**
     * @dev Active/désactive un vélo
     * @param _bikeIndex Index du vélo à modifier
     */
    function toggleBikeStatus(uint256 _bikeIndex) 
        external 
        nonReentrant 
        whenNotBlacklisted(msg.sender)
    {
        require(_bikeIndex < userBikes[msg.sender].length, "Vélo inexistant");
        
        // Vérifie si un autre vélo est déjà actif
        if (!userBikes[msg.sender][_bikeIndex].active) {
            bool hasOtherActive = false;
            for (uint256 i = 0; i < userBikes[msg.sender].length; i++) {
                if (i != _bikeIndex && userBikes[msg.sender][i].active) {
                    hasOtherActive = true;
                    break;
                }
            }
            require(hasOtherActive, "Vous devez avoir au moins un vélo actif");
        }

        // Bascule l'état du vélo
        userBikes[msg.sender][_bikeIndex].active = !userBikes[msg.sender][_bikeIndex].active;
        
        // Émet l'événement
        emit BikeStatusUpdated(
            msg.sender, 
            userBikes[msg.sender][_bikeIndex].id, 
            userBikes[msg.sender][_bikeIndex].active
        );
    }

    /**
     * @dev Réclame les récompenses accumulées
     */
    function claimRewards() external nonReentrant whenNotBlacklisted(msg.sender) {
        uint256 amount = rewards[msg.sender];
        require(amount > 0, "Aucune récompense disponible");
        
        // Met à jour les récompenses
        rewards[msg.sender] = 0;
        
        // Vérifie que le token est suffisant
        require(
            rewardToken.balanceOf(address(this)) >= amount, 
            "Solde du contrat insuffisant"
        );
        
        // Transfère les tokens
        rewardToken.transfer(msg.sender, amount);
        
        // Émet l'événement
        emit RewardClaimed(msg.sender, amount);
    }

    /**
     * @dev Met à jour le taux de récompense
     * @param _newRate Nouveau taux de récompense (en centièmes)
     */
    function setRewardRate(uint256 _newRate) external onlyOwner {
        require(_newRate > 0, "Taux de récompense invalide");
        uint256 oldRate = rewardRate;
        rewardRate = _newRate;
        emit RewardRateUpdated(oldRate, _newRate);
    }

    /**
     * @dev Met à jour l'oracle
     * @param _newOracle Nouvelle adresse de l'oracle
     */
    function setOracle(IOracle _newOracle) external onlyOwner {
        require(address(_newOracle) != address(0), "Oracle invalide");
        address oldOracle = address(oracle);
        oracle = _newOracle;
        emit OracleUpdated(oldOracle, address(_newOracle));
    }

    /**
     * @dev Blackliste/dé-blackliste un utilisateur
     * @param user Adresse de l'utilisateur
     * @param isBlacklisted Statut de blackliste
     */
    function blacklistUser(address user, bool isBlacklisted) external onlyOwner {
        isUserBlacklisted[user] = isBlacklisted;
        if (isBlacklisted) {
            blacklistedUsersSet.add(user);
        } else {
            blacklistedUsersSet.remove(user);
        }
        emit UserBlacklisted(user, isBlacklisted);
    }

    /**
     * @dev Vérifie si un utilisateur a un vélo actif
     * @param user Adresse de l'utilisateur
     */
    function hasActiveBike(address user) public view returns (bool) {
        for (uint256 i = 0; i < userBikes[user].length; i++) {
            if (userBikes[user][i].active) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Récupère l'efficacité du vélo actif
     * @param user Adresse de l'utilisateur
     */
    function getActiveBikeEfficiency(address user) public view returns (uint256) {
        for (uint256 i = 0; i < userBikes[user].length; i++) {
            if (userBikes[user][i].active) {
                return userBikes[user][i].efficiency;
            }
        }
        return 0;
    }

    /**
     * @dev Récupère le nombre d'activités d'un utilisateur
     * @param user Adresse de l'utilisateur
     */
    function getUserActivityCount(address user) external view returns (uint256) {
        return userActivities[user].length;
    }

    /**
     * @dev Récupère le nombre de vélos d'un utilisateur
     * @param user Adresse de l'utilisateur
     */
    function getUserBikeCount(address user) external view returns (uint256) {
        return userBikes[user].length;
    }

    /**
     * @dev Récupère les informations d'une activité
     * @param user Adresse de l'utilisateur
     * @param index Index de l'activité
     */
    function getActivityInfo(address user, uint256 index) external view returns (Activity memory) {
        return userActivities[user][index];
    }

    /**
     * @dev Récupère les informations d'un vélo
     * @param user Adresse de l'utilisateur
     * @param index Index du vélo
     */
    function getBikeInfo(address user, uint256 index) external view returns (Bike memory) {
        return userBikes[user][index];
    }

    /**
     * @dev Vérifie si un utilisateur a besoin d'une maintenance
     * @param user Adresse de l'utilisateur
     */
    function needsMaintenance(address user) external view returns (bool) {
        for (uint256 i = 0; i < userBikes[user].length; i++) {
            if (userBikes[user][i].active && 
                block.timestamp - userBikes[user][i].lastMaintenance > maintenanceInterval) {
                return true;
            }
        }
        return false;
    }

    /**
     * @dev Met à jour l'intervalle de maintenance requis
     * @param interval Nouvel intervalle en secondes
     */
    function setMaintenanceInterval(uint256 interval) external onlyOwner {
        require(interval > 0, "Intervalle invalide");
        maintenanceInterval = interval;
    }
} 