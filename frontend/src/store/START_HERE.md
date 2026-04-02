# 📚 Store Pattern - Guide de Démarrage

## 🎯 Tu es Ici

Bienvenue! Voici le **dossier store** qui gère **toute l'authentification et l'état global** de l'application.

## 📖 Où Commencer? (Par Ordre de Lecture)

### 1️⃣ **Première Visite?**
👉 Lis : **[IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md)**
- ⏱️ Temps: 5 min
- 📚 Contenu: Résumé des changements JWT → Token Simple
- 🎯 Objectif: Comprendre l'architecture en 30 secondes

### 2️⃣ **Comment Utiliser le Store?**
👉 Lis : **[SIMPLE_TOKEN_SYSTEM.md](./SIMPLE_TOKEN_SYSTEM.md)**
- ⏱️ Temps: 10 min
- 📚 Contenu: Système de token, API calls, hooks disponibles
- 🎯 Objectif: Savoir comment faire un login, appel API, etc.

### 3️⃣ **Quels Changements Ont Été Faits?**
👉 Lis : **[JWT_REMOVAL_SUMMARY.md](./JWT_REMOVAL_SUMMARY.md)**
- ⏱️ Temps: 5 min
- 📚 Contenu: Détail des fichiers modifiés, avant/après
- 🎯 Objectif: Comprendre les évolutions techniques

### 4️⃣ **Je Veux Coder**
👉 Consulte : **[store/README.md](./store/README.md)** (si existe) ou vois les sections ci-dessous

## 📁 Arborescence

```
store/
├── 📄 IMPLEMENTATION_COMPLETE.md   ← Commence ici!
├── 📄 SIMPLE_TOKEN_SYSTEM.md       ← Guide d'utilisation
├── 📄 JWT_REMOVAL_SUMMARY.md       ← Changements techniques
├── 📄 api-client.ts                ← Helper pour appels API ⭐
├── 📄 types.ts                     ← Types TypeScript
├── 📄 index.ts                     ← Exports principales
├── 📁 slices/
│   ├── authSlice.ts               ← Login/Logout
│   ├── postSlice.ts               ← Posts + Likes
│   ├── userSlice.ts               ← Users + Follow
│   └── uiSlice.ts                 ← UI State
├── 📁 hooks/
│   ├── useAuth.ts                 ← Hook authentification
│   ├── usePosts.ts                ← Hook posts
│   ├── useUsers.ts                ← Hook users
│   └── useUI.ts                   ← Hook UI
└── 📁 slices/
    └── index.ts                   ← Exports des hooks
```

## 🔑 Les 3 Choses à Savoir

### 1. Token = Juste une String
```typescript
// ✅ C'est tout ce qu'il faut savoir
const token = "a1b2c3d4e5f6..."  // 64 caractères en hex
// Le backend la hash en SHA256 et valide contre la BD
```

### 2. Login
```typescript
import { useAuth } from '@/store'

const { login } = useAuth()
await login('john', 'password123')  // Token sauvegardé auto
```

### 3. Appels API
```typescript
import { apiCall } from '@/store'

const posts = await apiCall('/posts')  // Token inclus auto ✨
```

## 💡 Exemples Rapides

### Login & Afficher User
```typescript
import { useAuth } from '@/store'

export default function Profile() {
  const { user, login, logout } = useAuth()

  if (!user) {
    return <button onClick={() => login('john', 'pass')}>Login</button>
  }

  return (
    <div>
      <p>Welcome {user.username}!</p>
      <button onClick={logout}>Logout</button>
    </div>
  )
}
```

### Charger Posts
```typescript
import { usePosts } from '@/store'
import { useEffect } from 'react'

export default function Feed() {
  const { posts, fetchFeed, isLoading } = usePosts()

  useEffect(() => {
    fetchFeed()  // Token inclus auto
  }, [])

  if (isLoading) return <p>Loading...</p>

  return (
    <div>
      {posts.map(post => (
        <div key={post.id}>{post.content}</div>
      ))}
    </div>
  )
}
```

### Liker un Post
```typescript
const { likePost } = usePosts()

const handleLike = async () => {
  await likePost(postId)  // Token inclus auto
}
```

## ⚠️ Pièges à Éviter

```typescript
// ❌ MAUVAIS - Ne pas chercher le token directement
const token = localStorage.getItem('auth_token')

// ✅ BON - Utiliser le store
const { token } = useAuth()

// ❌ MAUVAIS - Ne pas faire fetch direct
fetch('/api/posts')

// ✅ BON - Utiliser apiCall
const posts = await apiCall('/posts')

// ❌ MAUVAIS - Ne pas coder en dur le header
fetch('/api/posts', {
  headers: { Authorization: `Bearer ${token}` }
})

// ✅ BON - apiCall le fait pour toi
const posts = await apiCall('/posts')
```

## 🆘 Ça Ne Marche Pas?

### Login n'ajoute pas le token
```typescript
// Vérifier que login a été appelé
const { isAuthenticated } = useAuth()
console.log('Authentifié?', isAuthenticated)

// Vérifier localStorage
console.log(localStorage.getItem('auth_token'))
```

### Appels API sans Authorization header
```typescript
// Assure-toi d'utiliser apiCall
import { apiCall } from '@/store'
const posts = await apiCall('/posts')  // ✅ Correct

// Pas fetch direct
fetch('/api/posts')  // ❌ Pas de header auto
```

### Composants ne se re-render pas
```typescript
// Assure-toi d'importer le hook
import { useAuth } from '@/store'  // ✅

// Pas de problèmes de closure
useEffect(() => {
  login('john', 'pass')
}, [login])  // ✅ Inclure login dans la dépendance
```

## 🔗 Ressources Utiles

- **[SIMPLE_TOKEN_SYSTEM.md](./SIMPLE_TOKEN_SYSTEM.md)** - Full API reference
- **[.instructions.md](../.instructions.md)** - Architecture générale du projet
- **[api-client.ts](./api-client.ts)** - Code source du helper API
- **[types.ts](./types.ts)** - Tous les types TypeScript

## 🧪 Tester Rapidement

```bash
# 1. Démarrer l'app
npm run dev

# 2. Ouvrir DevTools (F12)
# 3. Aller à Application → Local Storage
# 4. Tester le login
# 5. Voir apparaître `auth_token`

# 6. Aller au Network tab
# 7. Tester un appel API
# 8. Voir le header `Authorization: Bearer ...`
```

## ✅ Checklist Avant De Coder

- [ ] J'ai lu [IMPLEMENTATION_COMPLETE.md](./IMPLEMENTATION_COMPLETE.md) (5 min)
- [ ] Je connais les 3 hooks principales (useAuth, usePosts, useUsers)
- [ ] Je sais utiliser `apiCall()` pour les appels API
- [ ] J'ai vérifié que le token est en localStorage après login
- [ ] Je sais qu'il n'y a pas de JWT, juste une string

## 🚀 Prêt à Coder?

1. Crée un composant qui utilise `useAuth()`
2. Teste le login
3. Utilise `apiCall()` pour charger les données
4. Regarde le Network tab pour voir les headers
5. Bravo! Tu utilises le store correctement ✨

---

**Besoin d'aide?** Consulte les fichiers de documentation ci-dessus ou regarde les `slices/` et `hooks/` pour des exemples concrets.

**Happy Coding! 🎉**
