// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../interfaces/IOracle.sol";

/**
 * @title TestOracle
 * @dev Oracle de test pour la validation des activités
 */
contract TestOracle is IOracle {
    string private constant GPS_SOURCE = "Test Oracle";
    
    /**
     * @dev Valide une activité (toujours retourne true pour les tests)
     */
    function validateActivity(
        address user, 
        uint256 activityIndex, 
        bytes calldata gpsData, 
        uint256 timestamp
    ) external pure returns (bool) {
        return true;
    }
    
    /**
     * @dev Vérifie si les données GPS sont valides (toujours retourne true pour les tests)
     */
    function verifyGPSData(bytes calldata gpsData) external pure returns (bool) {
        return true;
    }
    
    /**
     * @dev Récupère la source des données GPS
     */
    function getGPSDataSource() external pure returns (string memory) {
        return GPS_SOURCE;
    }
} 