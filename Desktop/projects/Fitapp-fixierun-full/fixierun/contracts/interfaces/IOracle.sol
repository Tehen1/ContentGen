// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

/**
 * @title IOracle
 * @dev Interface pour un oracle de validation des activités
 */
interface IOracle {
    /**
     * @dev Valide une activité en utilisant des données externes
     * @param user Adresse de l'utilisateur
     * @param activityIndex Index de l'activité à valider
     * @param gpsData Données GPS pour vérifier l'activité
     * @param timestamp Timestamp de la validation
     * @return bool True si l'activité est validée
     */
    function validateActivity(
        address user, 
        uint256 activityIndex, 
        bytes calldata gpsData, 
        uint256 timestamp
    ) external returns (bool);
    
    /**
     * @dev Vérifie si les données GPS sont valides
     * @param gpsData Données GPS à vérifier
     * @return bool True si les données sont valides
     */
    function verifyGPSData(bytes calldata gpsData) external view returns (bool);
    
    /**
     * @dev Récupère la source des données GPS
     * @return string Source des données GPS
     */
    function getGPSDataSource() external view returns (string memory);
} 