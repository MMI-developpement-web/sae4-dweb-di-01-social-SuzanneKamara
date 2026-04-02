# 🏗️ Architecture Store Pattern

## Flux de données

```
┌─────────────────────────────────────────────────────────────┐
│                    ROUTES / PAGES                           │
│            (Feed.tsx, Profile.tsx, etc.)                    │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│              CONTAINERS (Smart Components)                  │
│         (FeedContainer, ProfileContainer, etc.)             │
│  - Utilise les hooks du store (useAuth, usePosts, etc.)    │
│  - Fetch les données via useEffect                          │
│  - Gère la logique métier                                   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Passe les données en props
                      ▼
┌─────────────────────────────────────────────────────────────┐
│            UI COMPONENTS (Dumb Components)                  │
│          (Tweet, Post, Profile, Button, etc.)               │
│  - Reçoivent tout en props                                  │
│  - Pas de hooks du store                                    │
│  - Présentation pure                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Appelle les callbacks
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    STORE (Zustand)                          │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐        │
│  │  authSlice   │ │ postSlice    │ │ userSlice    │        │
│  │ (login,      │ │(createPost,  │ │(followUser,  │        │
│  │  register,   │ │ likePost,    │ │ searchUsers) │        │
│  │  logout)     │ │ fetchFeed)   │ │              │        │
│  └──────────────┘ └──────────────┘ └──────────────┘        │
│  ┌──────────────┐                                          │
│  │  uiSlice     │                                          │
│  │(openModal,   │                                          │
│  │ closeModal)  │                                          │
│  └──────────────┘                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ Appels API
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                   BACKEND API                               │
│         (Symfony/Laravel/Node.js)                           │
└─────────────────────────────────────────────────────────────┘
```

## Hiérarchie des fichiers

```
frontend/src/
├── store/                      # 📦 STORE (État global)
│   ├── types.ts               # Types & Interfaces
│   ├── index.ts               # Exports principales
│   ├── slices/
│   │   ├── authSlice.ts      # État auth + user
│   │   ├── postSlice.ts      # État posts + feed
│   │   ├── userSlice.ts      # État users + follows
│   │   ├── uiSlice.ts        # État UI
│   │   └── index.ts          # Exports slices
│   ├── hooks/
│   │   ├── useAuth.ts        # Hook useAuth
│   │   ├── usePosts.ts       # Hook usePosts
│   │   ├── useUsers.ts       # Hook useUsers
│   │   ├── useUI.ts          # Hook useUI
│   │   └── index.ts          # Exports hooks
│   └── README.md             # 📖 Documentation complète
│
├── containers/                 # 🎯 CONTENEURS (Smart)
│   ├── FeedContainer.tsx
│   ├── AuthContainer.tsx
│   ├── PostComposerContainer.tsx
│   └── index.ts
│
├── components/
│   ├── ui/                    # 🎨 COMPOSANTS UI (Dumb)
│   │   ├── atoms/
│   │   ├── shared/
│   │   ├── features/
│   │   │   ├── tweet/
│   │   │   ├── post/
│   │   │   ├── profile/
│   │   │   └── ...
│   │   └── animations/
│   
├── pages/                      # 📄 PAGES/ROUTES
│   ├── Feed.tsx
│   ├── Profile.tsx
│   └── ...
│
├── STORE_INTEGRATION.md        # 📖 Guide d'intégration
└── STORE_IMPLEMENTATION_SUMMARY.md # 📖 Récapitulatif
```

## Exemple : Afficher un Tweet

```
1. Feed.tsx (page)
   ↓
2. FeedContainer (container)
   ├─ useAuth() → vérifier user
   ├─ usePosts() → charger posts
   └─ fetchFeed() dans useEffect
   ↓
3. Feed ({ posts }) (UI)
   └─ map posts
      ↓
4. TweetContainer ({ tweet }) (container)
   ├─ usePosts() → get likePost
   └─ useUsers() → get followUser
   ↓
5. Tweet ({ post, onLike, onFollow }) (UI)
   ├─ TweetHeader
   │  ├─ Avatar (UI)
   │  ├─ Username (UI)
   │  └─ FollowButton (reçoit onFollow)
   ├─ TweetContent
   │  └─ Hashtag (UI)
   └─ TweetFooter
      ├─ LikeButton (reçoit onLike)
      ├─ RepublicationButton (UI)
      └─ CommentButton (UI)
   ↓
6. Utilisateur clique Like
   ↓
7. onLike() → TweetContainer.likePost()
   ↓
8. Store dispatch action → likePost(postId)
   ↓
9. API call → POST /api/posts/{id}/like
   ↓
10. Store updates local state
    ↓
11. Components re-render → Tweet affiche ❤️
```

## Communication entre composants

### Props Down (UI Dumb → Callbacks)
```typescript
// Container passe données ET callbacks
<Tweet
  post={post}
  onLike={() => likePost(post.id)}  // Callback
  onRepost={() => repostPost(post.id)}
  onComment={() => openModal('REPLY', { post })}
/>

// UI Component reçoit puis appelle
interface TweetProps {
  post: Post
  onLike: () => void
  onRepost: () => void
  onComment: () => void
}

function Tweet({ post, onLike, onRepost, onComment }: TweetProps) {
  return (
    <div>
      <p>{post.content}</p>
      <button onClick={onLike}>Like</button>
      <button onClick={onRepost}>Repost</button>
      <button onClick={onComment}>Comment</button>
    </div>
  )
}
```

### Actions Store
```typescript
// Store (Zustand)
export const usePostStore = create<PostState>((set, get) => ({
  likePost: async (postId: string) => {
    // 1. Hit API
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    
    // 2. Update local state
    const { posts } = get()
    set({
      posts: posts.map(p =>
        p.id === postId 
          ? { ...p, isLiked: true, likes: p.likes + 1 }
          : p
      )
    })
  }
}))
```

## Flux d'authentification

```
1. User enter credentials
   ↓
2. LoginForm appelle useAuth().login()
   ↓
3. authSlice.login() lance :
   - POST /api/auth/login avec credentials
   - Reçoit { user, token }
   - Sauve token en localStorage
   - Update state : user, isAuthenticated = true
   ↓
4. useAuth() retourne user = { id, username, avatar, ... }
   ↓
5. Composants qui utilisent useAuth() se re-render
   ↓
6. Routes peuvent rediriger vers /home
```

## Lifecycle des données

```
INIT
  ↓
Container mounts → useEffect
  ↓
fetchFeed()
  ↓
Store lance API call
  ↓
API retourne posts[]
  ↓
Store update : posts, feed, isLoading = false
  ↓
useSelector détecte changement
  ↓
Components re-render avec nouvelles données
  ↓
UI affiche posts
```

## Étapes suivantes

1. **Intégrer les containers** dans les pages (Feed.tsx, Profile.tsx, etc.)
2. **Refactoriser les composants** pour séparer UI/Containers
3. **Mettre à jour les routes** pour utiliser les containers
4. **Tester le flow complet** : login → fetch feed → like post
5. **Passer en production** avec authentication JWT complète

