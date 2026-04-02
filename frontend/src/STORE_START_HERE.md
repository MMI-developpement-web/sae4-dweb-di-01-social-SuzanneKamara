# 🎯 Implementation du Store Pattern - START HERE

## ✅ À lire en premier

Bienvenue ! Tu trouveras ici tout ce qu'il faut savoir sur le store implémenté.

### 📍 Pour comprendre l'architecture générale
→ **[STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md)**
- Flux de données
- Diagrammes
- Hiérarchie des fichiers
- Lifecycle des données

### 📚 Pour utiliser le store dans tes composants
→ **[STORE_INTEGRATION.md](./STORE_INTEGRATION.md)**
- Guide complet d'intégration
- Exemples avant/après
- Checklist de migration
- Cas courants (Feed, Like, Follow, etc.)

### 🛠️ Pour connaître tous les hooks & slices
→ **[store/README.md](./store/README.md)**
- Documentation complète du store
- Tous les hooks (useAuth, usePosts, useUsers, useUI)
- Patterns & bonnes pratiques
- Configuration API

### 📋 Pour un résumé rapide
→ **[STORE_IMPLEMENTATION_SUMMARY.md](./STORE_IMPLEMENTATION_SUMMARY.md)**
- Ce qui a été créé
- Exemples d'utilisation
- Prochaines étapes
- Configuration

---

## 🚀 Quick Start (5 minutes)

### 1. Importer les hooks

```typescript
import { useAuth, usePosts, useUsers, useUI } from '@/store'
```

### 2. Utiliser dans un composant

```typescript
export default function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth()
  const { posts, likePost, createPost } = usePosts()

  return (
    <div>
      {isAuthenticated && <p>Éhé, {user?.username}!</p>}
      <button onClick={logout}>Déconnexion</button>
    </div>
  )
}
```

### 3. Créer un Container

```typescript
export default function FeedContainer() {
  const { posts, fetchFeed, isLoading } = usePosts()

  useEffect(() => {
    fetchFeed()
  }, [])

  if (isLoading) return <Loading />
  return <Feed posts={posts} />
}
```

### 4. Composer des actions

```typescript
const { likePost } = usePosts()
const { followUser } = useUsers()

// Liker un post
await likePost('post-123')

// Suivre un user
await followUser('user-456')
```

---

## 📦 Structure créée

```
✅ store/
   ├── types.ts (entités + interfaces)
   ├── slices/ (4 slices Zustand)
   │   ├── authSlice.ts
   │   ├── postSlice.ts
   │   ├── userSlice.ts
   │   └── uiSlice.ts
   ├── hooks/ (4 custom hooks)
   │   ├── useAuth.ts
   │   ├── usePosts.ts
   │   ├── useUsers.ts
   │   └── useUI.ts
   └── README.md

✅ containers/
   ├── FeedContainer.tsx
   ├── AuthContainer.tsx
   ├── PostComposerContainer.tsx
   └── index.ts

✅ Configuration
   ├── .env.example (variables d'env)
   └── package.json (zustand installé)
```

---

## 🎯 Hooks disponibles

### `useAuth()` - Authentification
```typescript
const { user, isAuthenticated, login, register, logout, error } = useAuth()
```

### `usePosts()` - Posts
```typescript
const { posts, feed, createPost, likePost, unlikePost, repostPost, fetchFeed, error } = usePosts()
```

### `useUsers()` - Utilisateurs
```typescript
const { users, followers, following, followUser, unfollowUser, searchUsers, error } = useUsers()
```

### `useUI()` - Interface
```typescript
const { isDarkMode, toggleDarkMode, openModal, closeModal, openOverlay, closeOverlay } = useUI()
```

---

## ⚙️ Configuration

Crée un `.env.local` à la racine `frontend/` :

```env
VITE_API_URL=http://localhost:8000/api
VITE_DEBUG=true
```

---

## 🔄 Patterns principaux

### Pattern 1 : Container → UI
```typescript
// Container (logique)
function FeedContainer() {
  const { posts, fetchFeed } = usePosts()
  useEffect(() => { fetchFeed() }, [])
  return <Feed posts={posts} />
}

// UI (présentation)
function Feed({ posts }: any) {
  return posts.map(p => <Post post={p} />)
}
```

### Pattern 2 : Callbacks dans Props
```typescript
// Container passe callbacks
<Tweet post={post} onLike={() => likePost(post.id)} />

// UI appelle les callbacks
function Tweet({ post, onLike }: any) {
  return <button onClick={onLike}>Like</button>
}
```

### Pattern 3 : useEffect pour charger données
```typescript
useEffect(() => {
  fetchPosts() // Charger au montage
}, []) // Dépendance vide = une seule fois
```

---

## ✨ État du projet

| Aspect | Status |
|--------|--------|
| Store Zustand | ✅ Implémenté |
| 4 Slices (auth, post, user, ui) | ✅ Prêt |
| 4 Custom Hooks | ✅ Prêt |
| 3 Containers d'exemple | ✅ Prêt |
| Types TypeScript | ✅ Complets |
| Documentation | ✅ Complète |
| API Config | ✅ Configurée |
| JWT Auth | ✅ Automatique |

---

## 🎓 Prochaines étapes

### À faire maintenant
1. Lire [STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md) pour comprendre la structure
2. Suivre [STORE_INTEGRATION.md](./STORE_INTEGRATION.md) pour intégrer dans tes composants
3. Créer les containers pour tes pages

### Avant production
1. Refactoriser tous les composants (séparer UI/Containers)
2. Ajouter la persistance localStorage (persist middleware)
3. Tester le flow complet (login → feed → like)
4. Connecter les routes réelles (Feed.tsx, Profile.tsx, etc.)

---

## 📞 Besoin d'aide ?

- **"Comment utiliser le store ?"** → [store/README.md](./store/README.md)
- **"Comment intégrer dans mes composants ?"** → [STORE_INTEGRATION.md](./STORE_INTEGRATION.md)
- **"Comment ça marche ?"** → [STORE_ARCHITECTURE.md](./STORE_ARCHITECTURE.md)
- **"Quick reference ?"** → [STORE_IMPLEMENTATION_SUMMARY.md](./STORE_IMPLEMENTATION_SUMMARY.md)

---

## 🎉 C'est bon pour commencer !

Le store est **100% opérationnel** et prêt à être utilisé. Toute la documentation et les exemples sont là. À toi de jouer! 🚀

