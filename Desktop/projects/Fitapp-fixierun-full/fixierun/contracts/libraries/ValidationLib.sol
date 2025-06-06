// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

library ValidationLib {
    struct Activity {
        uint256 timestamp;
        uint256 distance;  // en mètres
        uint256 duration;  // en secondes
        uint256 calories;  // en calories
        uint256 validatedTimestamp;
        bool validated;
    }

    /**
     * @dev Valide les données de l'activité
     * @param activity Activité à valider
     * @param currentTimestamp Timestamp actuel
     * @return bool True si l'activité est valide
     */
    function validateActivity(Activity memory activity, uint256 currentTimestamp) internal pure returns (bool) {
        // Vérifie que l'activité n'est pas dans le futur
        require(activity.timestamp <= currentTimestamp, "Activité dans le futur");
        
        // Vérifie que la validation n'est pas avant l'activité
        if (activity.validated) {
            require(activity.validatedTimestamp >= activity.timestamp, "Validation avant l'activité");
            require(activity.validatedTimestamp <= currentTimestamp, "Validation dans le futur");
        }
        
        // Vérifie que la distance est raisonnable
        require(activity.distance <= 1000000, "Distance trop grande"); // 1000 km max
        
        // Vérifie que la durée est raisonnable
        require(activity.duration <= 14400, "Durée trop longue"); // 4 heures max
        
        // Vérifie que la vitesse moyenne est réaliste
        if (activity.duration > 0) {
            uint256 speed = activity.distance * 3600 / (activity.duration * 1000); // km/h
            require(speed <= 100, "Vitesse moyenne trop élevée"); // 100 km/h max
        }
        
        // Vérifie que les calories sont cohérentes
        if (activity.calories > 0 && activity.duration > 0) {
            uint256 caloriesPerHour = activity.calories * 3600 / activity.duration;
            require(caloriesPerHour <= 1500, "Calories par heure trop élevées"); // 1500 kcal/h max
        }
        
        return true;
    }
} 