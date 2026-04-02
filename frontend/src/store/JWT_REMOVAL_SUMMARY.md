# ✅ JWT Retiré - Store Pattern Simplifié

## 🎯 Objectif
Retirer la logique JWT et adapter le store au **véritable système de token API simple** du projet (Symfony Security).

## 📋 Changements Effectués

### 1️⃣ Types (`store/types.ts`)
- ✅ **Retiré** : `AuthUser extends User { token }`
- ✅ **Modifié** : `AuthState` pour séparer `user` et `token`
  ```typescript
  export interface AuthState {
    user: User | null
    token: string | null  // Nouveau
    // ... autres propriétés
  }
  ```

### 2️⃣ Auth Slice (`store/slices/authSlice.ts`)
- ✅ **Endpoint changé** : `/auth/login` → `/login_check` (Symfony endpoint réel)
- ✅ **Retiré** : Méthode `register()` 
- ✅ **Ajouté** : Méthode `setToken()` pour gérer le token indépendamment
- ✅ **Gestion du token** : Sauvegarde/suppression automatique en localStorage

### 3️⃣ Post Slice (`store/slices/postSlice.ts`)
- ✅ **Refactorisé** : Utilise `apiCall()` au lieu de `fetch()` direct
- ✅ **Supprimé** : `getAuthHeaders()` local
- ✅ **Import ajouté** : `import { apiCall } from '../api-client'`

### 4️⃣ User Slice (`store/slices/userSlice.ts`)
- ✅ **Refactorisé** : Utilise `apiCall()` au lieu de `fetch()` direct
- ✅ **Supprimé** : `getAuthHeaders()` local
- ✅ **Import ajouté** : `import { apiCall } from '../api-client'`

### 5️⃣ Hook useAuth (`store/hooks/useAuth.ts`)
- ✅ **Retiré** : `register` (n'existe plus)
- ✅ **Ajouté** : `token` et `setToken`

### 6️⃣ Nouveau Helper (`store/api-client.ts`) ✨
Créé un helper centralisé pour tous les appels API :
```typescript
// Gère automatiquement :
// - L'Authorization header avec le token
// - Les erreurs d'API
// - Le Content-Type

await apiCall('/posts')
await apiCall('/posts', { method: 'POST', body: '...' })
```

### 7️⃣ Store Index (`store/index.ts`)
- ✅ **Retiré** : Export de `AuthUser`
- ✅ **Ajouté** : Export de `apiCall` et `apiFetch`

## 🔑 Système Réel Implémenté

```
Backend (Symfony)
├── SecurityController (/login_check)
│   └── Utilise ApiTokenManager
│       ├── Génère token brut (random_bytes)
│       ├── Hash en SHA256
│       └── Stocke en BD (ApiToken entity)
│
Frontend (Store Pattern)
├── authSlice
│   └── Appelle /login_check
│       └── Reçoit token brut
│           └── Sauvegarde en localStorage
│
├── api-client
│   └── À chaque appel
│       ├── Récupère token de localStorage
│       ├── Ajoute Authorization: Bearer {token}
│       └── Envoie la requête
│
Backend (Validation)
├── Reçoit Authorization header
├── Hash le token reçu
└── Compare avec la BD
```

## 📁 Fichiers Modifiés

| Fichier | Changement |
|---------|-----------|
| `store/types.ts` | ✅ AuthState refactorisé |
| `store/slices/authSlice.ts` | ✅ Login adapté, register retiré |
| `store/slices/postSlice.ts` | ✅ Utilise apiCall() |
| `store/slices/userSlice.ts` | ✅ Utilise apiCall() |
| `store/hooks/useAuth.ts` | ✅ Token ajouté |
| `store/index.ts` | ✅ Exports mises à jour |
| `store/api-client.ts` | ✨ **CRÉÉ** - Helper API |
| `store/SIMPLE_TOKEN_SYSTEM.md` | ✨ **CRÉÉ** - Documentation |

## 🚀 Utilisation

### Avant (avec JWT)
```typescript
// ❌ Pas possible - register n'existe pas
const { register } = useAuth()
```

### Après (Token simple)
```typescript
// ✅ Login uniquement
const { login, token, user } = useAuth()
await login('john', 'password')

// ✅ Token inclus automatiquement
const posts = await apiCall('/posts')
```

## ✅ Checklist

- [x] JWT retiré complètement
- [x] Types simplifiés (User != AuthUser)
- [x] Login utilise le vrai endpoint `/login_check`
- [x] Token stocké séparément en localStorage
- [x] Helper `apiCall()` crée (centralisage gestion token)
- [x] Tous les slices refactorisés
- [x] Hooks mises à jour
- [x] Documentation complète (`SIMPLE_TOKEN_SYSTEM.md`)
- [x] Pas de dépendance externe JWT nécessaire

## 📚 Lire d'abord

**[SIMPLE_TOKEN_SYSTEM.md](./SIMPLE_TOKEN_SYSTEM.md)** - Guide complet du système d'authentification

## ✨ Avantages

✅ **Plus simple** - Pas de JWT complexe, juste un token en base  
✅ **Synchronisé** - Reflète le vrai backend  
✅ **Centralisé** - `apiCall()` gère tous les appels  
✅ **Typé** - TypeScript full-type couverture  
✅ **Maintenable** - Code lisible et documenté

## 🔄 Prochaines Étapes

1. Tester le login avec `/login_check`
2. Vérifier que le token est en localStorage après login
3. Tester que les appels API incluent bien l'Authorization header
4. Mettre à jour les containers pour utiliser les hooks
5. Tester le logout et suppression du token
