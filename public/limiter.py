"""
Exemple de limiteur de taux en Python (référence uniquement)
Ce fichier est inclus à titre de référence et n'est pas utilisé activement dans l'application.
"""

import time
from typing import Dict, Any


class RateLimiter:
    """Limiteur de taux simple basé sur le temps"""
    
    def __init__(self, max_tokens: int = 10, reset_interval: int = 3600):
        """
        Initialise un limiteur de taux
        
        Args:
            max_tokens: Nombre maximum de jetons disponibles
            reset_interval: Intervalle en secondes après lequel les jetons sont réinitialisés
        """
        self.max_tokens = max_tokens
        self.tokens = max_tokens
        self.reset_interval = reset_interval
        self.last_reset = time.time()
    
    def check_and_update(self) -> bool:
        """
        Vérifie s'il reste des jetons et en consomme un si disponible
        
        Returns:
            bool: True si un jeton a été consommé, False sinon
        """
        current_time = time.time()
        
        # Réinitialiser les jetons si l'intervalle est écoulé
        if current_time - self.last_reset >= self.reset_interval:
            self.tokens = self.max_tokens
            self.last_reset = current_time
        
        # Vérifier s'il reste des jetons
        if self.tokens > 0:
            self.tokens -= 1
            return True
        
        return False
    
    def get_status(self) -> Dict[str, Any]:
        """
        Retourne l'état actuel du limiteur de taux
        
        Returns:
            Dict[str, Any]: État actuel avec jetons restants et temps jusqu'à la réinitialisation
        """
        current_time = time.time()
        time_until_reset = max(0, self.reset_interval - (current_time - self.last_reset))
        
        return {
            "tokens_remaining": self.tokens,
            "time_until_reset": time_until_reset,
            "can_proceed": self.tokens > 0
        }


# Exemple d'utilisation
if __name__ == "__main__":
    limiter = RateLimiter(max_tokens=5, reset_interval=60)
    
    for i in range(7):
        if limiter.check_and_update():
            print(f"Requête {i+1} autorisée")
        else:
            print(f"Requête {i+1} limitée")
        
        status = limiter.get_status()
        print(f"Jetons restants: {status['tokens_remaining']}")
        print(f"Temps jusqu'à la réinitialisation: {status['time_until_reset']:.1f} secondes")
        print("---")
        
        time.sleep(2)
