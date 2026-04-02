# 📦 Store Pattern - Zustand

## Vue d'ensemble

Le store utilise **Zustand** pour gérer l'état global de l'application de manière centralisée, réactive et performante.

## Architecture

```
store/
├── types.ts                 # Interfaces TypeScript (entités + états)
├── slices/
│   ├── authSlice.ts        # Gestion auth + user connecté
│   ├── postSlice.ts        # Gestion des posts + feed
│   ├── userSlice.ts        # Gestion users + follows
│   ├── uiSlice.ts          # Gestion UI globale (modales, overlay)
│   └── index.ts            # Exports
├── hooks/
│   ├── useAuth.ts          # Hook useAuth
│   ├── usePosts.ts         # Hook usePosts
│   ├── useUsers.ts         # Hook useUsers
│   ├── useUI.ts            # Hook useUI
│   └── index.ts            # Exports
├── index.ts                # Exports centralisées
└── README.md               # Cette documentation
```

## Usage

### Importer les hooks

```typescript
import { useAuth, usePosts, useUsers, useUI } from '@/store'
```

### Dans un composant

```typescript
import { useAuth } from '@/store'

export default function MyComponent() {
  const { user, isAuthenticated, logout } = useAuth()

  if (!isAuthenticated) return <p>Non connecté</p>

  return (
    <div>
      <p>Bienvenue, {user?.username}</p>
      <button onClick={logout}>Déconnexion</button>
    </div>
  )
}
```

## Slices & Hooks

### useAuth - Authentification

Gère la connexion, l'inscription, et l'utilisateur connecté.

**État** :
- `user` : Utilisateur connecté + token
- `isAuthenticated` : Boolean
- `isLoading` : Boolean
- `error` : Message d'erreur

**Actions** :
- `login(username, password)` : Connexion
- `register(username, email, password)` : Inscription
- `logout()` : Déconnexion
- `setUser(user)` : Mettre à jour l'utilisateur
- `setError(error)` : Définir une erreur
- `clearError()` : Nettoyer les erreurs

```typescript
const { user, login, logout, isLoading } = useAuth()

await login('john', 'password')
```

### usePosts - Posts & Feed

Gère les posts, le feed, les likes, et les reposts.

**État** :
- `posts` : Tableau de posts
- `feed` : IDs des posts du feed
- `isLoading` : Boolean
- `error` : Message d'erreur

**Actions** :
- `fetchPosts()` : Charger tous les posts
- `fetchFeed()` : Charger le feed personnalisé
- `createPost(payload)` : Créer un post
- `likePost(postId)` : Liker un post
- `unlikePost(postId)` : Unliker
- `repostPost(postId)` : Reposter
- `unrepostPost(postId)` : Unreposter
- `deletePost(postId)` : Supprimer

```typescript
const { posts, feed, createPost, likePost } = usePosts()

// Créer un post
await createPost({ content: 'Bonjour!', hashtags: ['hello'] })

// Liker un post
await likePost('post-123')
```

### useUsers - Utilisateurs & Follows

Gère les profils utilisateurs et les relations de suivi.

**État** :
- `users` : Map des utilisateurs
- `followers` : IDs des followers
- `following` : IDs des utilisateurs suivis
- `isLoading` : Boolean
- `error` : Message d'erreur

**Actions** :
- `fetchUser(userId)` : Charger un utilisateur
- `fetchFollowers()` : Charger les followers
- `fetchFollowing()` : Charger le suivi
- `followUser(userId)` : Suivre un utilisateur
- `unfollowUser(userId)` : Arrêter de suivre
- `searchUsers(query)` : Rechercher des utilisateurs

```typescript
const { followUser, following } = useUsers()

await followUser('user-123')
const isFollowing = following.includes('user-123')
```

### useUI - État de l'interface

Gère les modales, overlays, et préférences d'interface.

**État** :
- `isDarkMode` : Boolean
- `isShowingModal` : Boolean
- `modalType` : Type de modale
- `modalData` : Données passées à la modale
- `isShowingOverlay` : Boolean
- `overlayType` : Type d'overlay

**Actions** :
- `toggleDarkMode()` : Basculer le thème
- `openModal(type, data?)` : Ouvrir modale
- `closeModal()` : Fermer modale
- `openOverlay(type)` : Ouvrir overlay
- `closeOverlay()` : Fermer overlay

```typescript
const { isDarkMode, toggleDarkMode, openModal } = useUI()

// Basculer thème
toggleDarkMode()

// Ouvrir modale
openModal('POST_COMPOSER', { replyTo: 'post-123' })
```

## Bonnes pratiques

### ✅ À faire

1. **Utiliser les hooks personnalisés** au lieu des stores directs
   ```typescript
   // ✅ BON
   const { user } = useAuth()
   ```

2. **Accéder au store dans les composants de contrôle** (containers)
   ```typescript
   // Composant container
   export default function FeedContainer() {
     const { posts, fetchFeed } = usePosts()
     
     useEffect(() => {
       fetchFeed()
     }, [])
     
     return <Feed posts={posts} />
   }
   ```

3. **Passer les données comme props aux composants UI**
   ```typescript
   // Composant UI dumb
   function Feed({ posts }: { posts: Post[] }) {
     return posts.map(post => <Post key={post.id} post={post} />)
   }
   ```

4. **Utiliser `useEffect` pour charges les données au montage**
   ```typescript
   useEffect(() => {
     fetchPosts()
   }, [])
   ```

### ❌ À éviter

1. **Ne pas importer directement les stores dans les composants UI**
   ```typescript
   // ❌ MAUVAIS
   import { usePostStore } from '@/store/slices'
   ```

2. **Ne pas faire de prop drilling inutile**
   ```typescript
   // ❌ MAUVAIS: Passer par 5 niveaux de composants
   <Parent data={data} setData={setData}>
     <Child data={data} setData={setData}>
       ...
   ```

3. **Ne pas mettre la logique asynchrone dans les composants UI**
   ```typescript
   // ❌ MAUVAIS: Logique API dans un composant UI
   function Button() {
     return <button onClick={async () => await fetch(...)}>
   }
   
   // ✅ BON: Logique dans le container/hook
   function Container() {
     const { likePost } = usePosts()
     return <Button onClick={() => likePost(id)} />
   }
   ```

## Configuration API

Le store utilise `VITE_API_URL` pour l'adresse de l'API. À définir dans `.env` :

```
VITE_API_URL=http://localhost:8000/api
```

Par défaut : `http://localhost:8000/api`

## Authentification

Le token JWT est stocké dans `localStorage` :
- Sauvegardé après login/register
- Envoyé en header `Authorization: Bearer <token>`
- Supprimé lors du logout

```typescript
const { user, login } = useAuth()
await login('john', 'password')
// localStorage.auth_token = "<jwt-token>"
```

## Patterns courants

### Charger des données au montage

```typescript
import { useEffect } from 'react'
import { usePosts } from '@/store'

export default function FeedContainer() {
  const { posts, fetchFeed, isLoading, error } = usePosts()

  useEffect(() => {
    fetchFeed()
  }, [])

  if (isLoading) return <p>Chargement...</p>
  if (error) return <p>Erreur: {error}</p>
  
  return <Feed posts={posts} />
}
```

### Ajouter une validation avant action

```typescript
import { useAuth } from '@/store'

export default function LikeButton({ postId }: any) {
  const { isAuthenticated } = useAuth()
  const { likePost } = usePosts()

  const handleLike = () => {
    if (!isAuthenticated) {
      // Rediriger vers login ou afficher modale
      return
    }
    likePost(postId)
  }

  return <button onClick={handleLike}>Like</button>
}
```

### Afficher une modale

```typescript
import { useUI } from '@/store'

export default function NewPostButton() {
  const { openModal } = useUI()

  return (
    <button onClick={() => openModal('POST_COMPOSER')}>
      Nouveau post
    </button>
  )
}
```

## Types disponibles

```typescript
import type {
  User,
  AuthUser,
  Post,
  PostCreatePayload,
  AuthState,
  PostState,
  UserState,
  UIState,
} from '@/store'
```

## Debugging

Zustand supporte Redux DevTools. Pour inspecter le store en développement :

```typescript
// Dans la console (si connecté à Redux DevTools)
window.__REDUX_DEVTOOLS_EXTENSION__
```

## Prochaines étapes

- [ ] Implémenter la persistance (localStorage) avec `persist` middleware
- [ ] Ajouter les devtools Redux
- [ ] Implémenter la pagination des posts
- [ ] Ajouter le cache/invalidation
- [ ] Notifications en temps réel (WebSocket)
  setFeed: (tweets: number[]) => void

  // Follows
  toggleFollow: (userId: number) => void

  // UI
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Example usage with Zustand:
 * 
 * import { create } from 'zustand'
 * 
 * export const useStore = create<StoreState & StoreActions>((set) => ({
 *   // Initial state
 *   currentUser: null,
 *   isAuthenticated: false,
 *   tweets: {},
 *   feed: [],
 *   follows: {},
 *   loading: false,
 *   error: null,
 * 
 *   // Actions
 *   setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
 *   logout: () => set({ currentUser: null, isAuthenticated: false }),
 *   setTweet: (tweetId, tweet) => set((state) => ({
 *     tweets: { ...state.tweets, [tweetId]: tweet }
 *   })),
 *   // ... more actions
 * }))
 */

/**
 * Usage in components:
 * 
 * import { useStore } from '@/store'
 * 
 * export default function MyComponent() {
 *   const currentUser = useStore((state) => state.currentUser)
 *   const setCurrentUser = useStore((state) => state.setCurrentUser)
 * 
 *   return <div>{currentUser?.username}</div>
 * }
 */
