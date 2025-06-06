# Guide d'installation et de configuration pour l'intégration Google Fit

Ce guide explique en détail comment configurer l'authentification OAuth 2.0 nécessaire pour utiliser l'API Google Fit avec notre intégration.

## Prérequis

- Un compte Google
- Python 3.8 ou supérieur
- pip pour l'installation des dépendances

## Étapes de configuration

### 1. Créer un projet Google Cloud

1. Accédez à la [Console Google Cloud](https://console.cloud.google.com/)
2. Cliquez sur "Sélectionner un projet" puis sur "Nouveau projet"
3. Nommez votre projet (ex: "FitApp Integration") et cliquez sur "Créer"
4. Sélectionnez votre nouveau projet

### 2. Activer l'API Google Fit

1. Dans le menu de navigation, allez dans "API et services" > "Bibliothèque"
2. Recherchez "Fitness API" et cliquez dessus
3. Cliquez sur le bouton "Activer"

### 3. Configurer l'écran de consentement OAuth

1. Dans "API et services", allez dans "Écran de consentement OAuth"
2. Sélectionnez "Externe" comme type d'utilisateur puis "Créer"
3. Remplissez les informations requises:
   - Nom de l'application: "FitApp"
   - Email de support
   - Logo de l'application (optionnel)
4. Cliquez sur "Enregistrer et continuer"
5. Dans la section "Étendues", ajoutez les étendues suivantes:
   - `https://www.googleapis.com/auth/fitness.activity.read`
   - `https://www.googleapis.com/auth/fitness.body.read`
   - `https://www.googleapis.com/auth/fitness.location.read`
   - `https://www.googleapis.com/auth/fitness.heart_rate.read`
6. Cliquez sur "Enregistrer et continuer"
7. Dans la section "Utilisateurs test", ajoutez votre adresse email
8. Cliquez sur "Enregistrer et continuer"

### 4. Créer des identifiants OAuth 2.0

1. Dans "API et services", allez dans "Identifiants"
2. Cliquez sur "Créer des identifiants" puis sélectionnez "ID client OAuth"
3. Pour le type d'application, choisissez "Application Web"
4. Donnez un nom à votre client (ex: "FitApp Client")
5. Dans "Origines JavaScript autorisées", ajoutez:
   - `http://localhost:3000`
6. Dans "URI de redirection autorisés", ajoutez:
   - `http://localhost:3000/oauth2callback`
7. Cliquez sur "Créer"
8. Une fenêtre apparaîtra avec votre ID client et votre clé secrète. Cliquez sur "Télécharger JSON"

### 5. Configurer l'authentification dans l'application

1. Renommez le fichier JSON téléchargé en `client_secret.json`
2. Placez-le dans le répertoire `credentials` du module Google Fit:
   ```
   FitApp-Consolidated/backend/activity-tracking/google_fit/credentials/client_secret.json
   ```
3. Assurez-vous que les permissions du fichier sont restreintes:
   ```bash
   chmod 600 credentials/client_secret.json
   ```
4. Alternativement, vous pouvez définir les variables d'environnement suivantes:
   ```bash
   export GOOGLE_CLIENT_ID="votre_client_id"
   export GOOGLE_CLIENT_SECRET="votre_client_secret"
   export GOOGLE_REDIRECT_URI="http://localhost:3000/oauth2callback"
   ```

## Première utilisation

Lors de la première exécution, le script vous guidera à travers le processus d'authentification:

1. Une URL sera affichée dans le terminal
2. Ouvrez cette URL dans votre navigateur
3. Connectez-vous à votre compte Google
4. Autorisez l'application à accéder à vos données Google Fit
5. Vous serez redirigé vers une page avec un code d'autorisation
6. Copiez ce code et collez-le dans le terminal

Une fois cette opération effectuée, vos identifiants seront enregistrés localement dans un fichier `token.json` et vous n'aurez plus besoin de vous authentifier pour les utilisations ultérieures (sauf si vous révoquez l'accès ou si le token expire).

## Dépannage

### Le fichier client_secret.json est introuvable

Vérifiez que le fichier est correctement placé dans le répertoire `credentials` et que le nom est exact.

### Erreur de redirection URI

Assurez-vous que l'URI de redirection configuré dans la console Google Cloud correspond exactement à celui utilisé dans l'application (`http://localhost:3000/oauth2callback` par défaut).

### Impossible de récupérer des données

Vérifiez que:
1. L'API Fitness est bien activée dans votre projet Google Cloud
2. Votre compte a des données dans Google Fit
3. Les autorisations nécessaires ont été accordées
4. La plage de dates demandée contient des données

Pour plus d'aide, consultez la [documentation officielle de l'API Google Fit](https://developers.google.com/fit/overview).

