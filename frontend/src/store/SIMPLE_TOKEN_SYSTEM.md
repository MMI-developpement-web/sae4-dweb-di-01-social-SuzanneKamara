# Store Pattern - Système de Token API Simple

## 📌 Vue d'ensemble

Ce projet utilise un **système de token API simple** (pas JWT), basé sur **Symfony Security** :

1. **Authentification** : Formulaire de login Symfony (user/password)
2. **Token** : Chaîne aléatoire (64 caractères en hex, hachée en SHA256)
3. **Stockage** : Token hachés en base de données, lié à chaque User
4. **Transmission** : Header `Authorization: Bearer {token}`
5. **Validation** : Le backend valide le token en le comparant avec la base

## 🔑 Authentification

### Endpoint Backend
```http
POST /api/login_check
Content-Type: application/json

{
  "username": "john",
  "password": "secret123"
}

Response 200:
{
  "token": "a1b2c3d4e5...",  // Token brut (à stocker en localStorage)
  "user": {
    "id": 1,
    "username": "john",
    "email": "john@example.com",
    "is_blocked": false
  }
}
```

### Frontend - Login
```typescript
import { useAuth } from '@/store'

export default function LoginPage() {
  const { login, isLoading, error } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await login('john', 'secret123')
      // Redirect to home
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" placeholder="Username" required />
      <input type="password" placeholder="Password" required />
      <button disabled={isLoading}>Login</button>
      {error && <p className="error">{error}</p>}
    </form>
  )
}
```

## 🔐 Token Storage & Retrieval

### Stockage Automatique
Le token est **automatiquement sauvegardé** en `localStorage` sous la clé `auth_token` :

```typescript
// Dans authSlice.ts
localStorage.setItem('auth_token', token)
```

### Récupération Automatique
À chaque appel API, le token est **automatiquement envoyé** en Authorization header :

```typescript
// Dans api-client.ts (apiFetch function)
const token = localStorage.getItem('auth_token')
if (token) {
  headers.set('Authorization', `Bearer ${token}`)
}
```

## 📡 Appels API avec Token

### Utiliser `apiCall` (recommandé)
```typescript
import { apiCall } from '@/store'

// GET
const posts = await apiCall<Post[]>('/posts')

// POST
const newPost = await apiCall<Post>('/posts', {
  method: 'POST',
  body: JSON.stringify({ content: 'Hello world' })
})

// DELETE
await apiCall(`/posts/${postId}`, { method: 'DELETE' })
```

### Utiliser directement dans les stores
```typescript
// Dans postSlice.ts, userSlice.ts, etc.
const posts = await apiCall<Post[]>('/posts')
```

### Helper `apiFetch` (si besoin direct)
```typescript
import { apiFetch } from '@/store'

const response = await apiFetch('/posts')
const data = await response.json()
```

## 📦 Hooks Disponibles

### `useAuth()`
Accès à l'authentification :
```typescript
const { 
  user,           // User | null
  token,          // string | null (le token brut)
  isAuthenticated,// boolean
  isLoading,      // boolean
  error,          // string | null
  login,          // (username, password) => Promise<void>
  logout,         // () => void
  setUser,        // (user) => void
  setToken,       // (token) => void
  setError,       // (error) => void
  clearError      // () => void
} = useAuth()
```

### `usePosts()`
Accès aux posts :
```typescript
const { posts, isLoading, error, fetchPosts, likePost, unlikePost } = usePosts()
```

### `useUsers()`
Accès aux utilisateurs :
```typescript
const { 
  followers, following, fetchFollowers, followUser, unfollowUser 
} = useUsers()
```

### `useUI()`
Accès à l'UI state :
```typescript
const { isDarkMode, toggleDarkMode, openModal, closeModal } = useUI()
```

## 🚀 Utilisation dans les Containers

### Exemple : FeedContainer
```typescript
import { useAuth, usePosts } from '@/store'
import Feed from '@/components/ui/features/feed/Feed'

export default function FeedContainer() {
  const { user } = useAuth()        // Token auto-envoyé dans les appels
  const { posts, fetchFeed, likePost } = usePosts()

  useEffect(() => {
    fetchFeed()  // Token inclus automatiquement
  }, [])

  if (!user) return <p>Non authentifié</p>

  return (
    <Feed 
      posts={posts} 
      onLike={likePost}
    />
  )
}
```

## ⚙️ Configuration

Le URL de l'API est lu depuis les variables d'environnement :
```
VITE_API_URL=http://localhost:8000/api
```

Si non définie, utilise `http://localhost:8000/api` par défaut.

## 🔍 Debugging

### Voir le token en localStorage
```javascript
localStorage.getItem('auth_token')
```

### Voir les headers envoyés
Ouvrir DevTools → Network → Cliquer sur une requête → Headers → Authorization

### Vérifier l'authentification
```typescript
const { user, token } = useAuth()
console.log('Authentifié?', !!token)
console.log('Utilisateur:', user)
```

## ⚠️ Points Importants

- ✅ **Token sauvegardé** en localStorage → Persiste à travers les rechargements
- ✅ **Token inclus automatiquement** en Authorization header
- ✅ **Pas de JWT** → Simple chaîne aléatoire + stockage en base
- ✅ **Gestion des erreurs** → 401 = pas authentifié, 403 = compte bloqué
- ❌ **Ne pas modifier** `auth_token` directement en localStorage
- ❌ **Ne pas envoyer** le token en paramètre de requête
- ❌ **Ne pas stocker** d'infos sensibles dans le token

## 🔄 Flux d'Authentification

```
User Login (username/password)
    ↓
POST /api/login_check
    ↓
Backend: Valide credentials → Génère token → Hache en SHA256 → Stocke en BD
    ↓
Response: Token brut + User
    ↓
Frontend: Sauvegarde token en localStorage
    ↓
Tous les appels API: Authorization: Bearer {token}
    ↓
Backend: Valide le token contre la base
```

## 📚 Ressources

- [Symfony Security](https://symfony.com/doc/current/security.html)
- [Zustand Store](https://github.com/pmndrs/zustand)
- [API Client Helper](./api-client.ts)
- [Store Index](./index.ts)
