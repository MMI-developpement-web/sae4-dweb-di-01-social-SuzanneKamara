# Déploiement du Frontend

## Étapes de déploiement sur le serveur

1. **Téléchargez le fichier `dist.tar.gz`** depuis votre machine locale vers le serveur:
   ```bash
   scp dist.tar.gz kamara4@mmi.unilim.fr:/public_html/SAE4.DWeb-DI.01/sae4-dweb-di-01-social-SuzanneKamara/
   ```

2. **Connectez-vous au serveur et décompressez**:
   ```bash
   ssh kamara4@mmi.unilim.fr
   cd /public_html/SAE4.DWeb-DI.01/sae4-dweb-di-01-social-SuzanneKamara/
   tar -xzf dist.tar.gz
   ```

3. **Nettoyez l'archive**:
   ```bash
   rm dist.tar.gz
   ```

## Configuration pour la production

Si vous déployez avec un préfixe de chemin (ex: `/~kamara4/SAE4.DWeb-DI.01/...`), rebuildez avec:

```bash
VITE_BASE_PATH="/~kamara4/SAE4.DWeb-DI.01/sae4-dweb-di-01-social-SuzanneKamara/frontend/" npm run build
```

Puis re-générez l'archive:
```bash
tar -czf dist.tar.gz dist/
```

## Vérification

Une fois déployé, votre frontend sera accessible à:
- `https://mmi.unilim.fr/~kamara4/SAE4.DWeb-DI.01/sae4-dweb-di-01-social-SuzanneKamara/frontend/`
