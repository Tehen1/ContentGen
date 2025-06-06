# Guide de Dépannage Fixie.Run

Ce guide vous aidera à résoudre les problèmes courants rencontrés lors de l'exécution de l'application Fixie.Run.

## Erreurs Serveur Courantes

### 1. Erreur: "The module does not provide an export named X"

Cette erreur se produit généralement lorsqu'un composant n'exporte pas correctement une fonction ou une variable.

**Solution:**

- Vérifiez que le composant exporte correctement la fonction ou la variable demandée
- Assurez-vous que l'export par défaut et les exports nommés sont correctement définis
- Exemple: `export default ThemeSwitcher` et `export { ThemeSwitcher }`

### 2. Erreur: "Hydration failed"

Cette erreur se produit lorsque le HTML généré côté serveur ne correspond pas au HTML généré côté client.

**Solution:**

- Ajoutez `suppressHydrationWarning` à la balise HTML dans `app/layout.tsx`
- Utilisez `useEffect` avec une vérification de montage dans les composants qui utilisent des API du navigateur
- Exemple:

  ```tsx
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])
  if (!mounted) return <FallbackComponent />
  ```

### 3. Erreur: "Module not found"

Cette erreur se produit lorsqu'un module importé n'existe pas ou n'est pas accessible.

**Solution:**

- Vérifiez que le module est correctement installé dans `package.json`
- Vérifiez que le chemin d'importation est correct
- Exécutez `npm install` pour installer les dépendances manquantes

## Scripts de Diagnostic

Nous avons créé des scripts pour vous aider à diagnostiquer et résoudre les problèmes:

1. **Diagnostic des erreurs serveur:**

    ```bash
    npx tsx scripts/server-error-diagnostics.ts
    ```

2. **Correction automatique des erreurs serveur:**

    ```bash
    npx tsx scripts/fix-server-errors.ts
    ```

3. **Vérification des composants:**

    ```bash
    npm run check-components
    ```

## Nettoyage du Cache

Si vous rencontrez des problèmes persistants, essayez de nettoyer le cache:

```bash
# Nettoyer le cache Next.js
rm -rf .next

# Nettoyer le cache npm
npm cache clean --force

# Réinstaller les dépendances
rm -rf node_modules
npm install
```

## Problèmes Spécifiques

### Problème avec ThemeSwitcher

Si vous rencontrez des problèmes avec le sélecteur de thème:

1. Vérifiez que `next-themes` est correctement installé
2. Assurez-vous que `ThemeProvider` enveloppe votre application
3. Vérifiez que `ThemeSwitcher` exporte à la fois par défaut et de manière nommée

### Problème avec Web3Provider

Si vous rencontrez des problèmes avec la connexion Web3:

1. Vérifiez que `web3` est correctement installé
2. Assurez-vous que `Web3Provider` enveloppe votre application
3. Utilisez une vérification de montage pour éviter les erreurs d'hydratation

## Besoin d'Aide Supplémentaire?

Si vous rencontrez toujours des problèmes après avoir suivi ce guide, veuillez:

1. Ouvrir une issue sur GitHub
2. Fournir les logs d'erreur complets
3. Décrire les étapes pour reproduire le problème
