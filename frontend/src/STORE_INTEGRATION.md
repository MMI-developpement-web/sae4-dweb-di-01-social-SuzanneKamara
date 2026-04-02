# 🔌 Guide d'Intégration du Store

## Vue d'ensemble

Ce guide montre comment intégrer le store Zustand dans tes composants existants.

## Structure : UI vs Containers

### Composants UI (Presentational)
- **Fichiers** : `src/components/ui/**`
- **Rôle** : Présentation pure
- **Props** : Reçoivent toutes les données en props
- **État local** : Seulement pour l'UI (show/hide, hover, etc.)
- **Export** : Composant simple sans hooks métier

```typescript
// ❌ AVANT : Composant UI mélangé avec logique
export default function Tweet({ tweetId }: any) {
  const { posts, likePost } = usePosts() // ❌ Logique métier dans UI
  const post = posts.find(p => p.id === tweetId)
  return <div onClick={() => likePost(tweetId)}>...</div>
}

// ✅ APRÈS : Composant UI pur
interface TweetProps {
  post: Post
  onLike: (postId: string) => void
  onRepost: (postId: string) => void
}

export default function Tweet({ post, onLike, onRepost }: TweetProps) {
  return (
    <div onClick={() => onLike(post.id)}>
      <p>{post.content}</p>
    </div>
  )
}
```

### Composants Containers (Smart)
- **Fichiers** : `src/containers/**`
- **Rôle** : Gestion logique & données
- **Hooks** : `useAuth()`, `usePosts()`, `useUsers()`, `useUI()`
- **Responsabilité** : Charger données, passer au composant UI

```typescript
// ✅ Container : logique métier
export default function TweetContainer({ tweetId }: any) {
  const { posts, likePost } = usePosts()
  const post = posts.find(p => p.id === tweetId)

  if (!post) return null

  return (
    <Tweet
      post={post}
      onLike={() => likePost(tweetId)}
      onRepost={() => {}}
    />
  )
}
```

## Etapes de migration

### 1. Identifier la logique métier

Dans tes composants actuels, identifie :
- **Appels API** → Container
- **Imports store** → Container
- **useEffect** pour charger données → Container
- **Présentation pure** → UI

```typescript
// ❌ Ancien : Tout mélangé
function PostCard({ postId }: any) {
  const [post, setPost] = useState(null)
  const { token } = useAuth() // ← Logique métier

  useEffect(() => {
    fetch(`/api/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(setPost)
  }, [postId, token])

  return <div>{post?.content}</div>
}
```

### 2. Extraire la logique dans un Container

```typescript
// ✅ Nouveau Container
function PostCardContainer({ postId }: any) {
  const { posts, isLoading } = usePosts()
  const post = posts.find(p => p.id === postId)

  if (isLoading) return <Skeleton />
  if (!post) return null

  return <PostCard post={post} />
}

// ✅ Nouveau composant UI
interface PostCardProps {
  post: Post
}

function PostCard({ post }: PostCardProps) {
  return <div>{post.content}</div>
}
```

### 3. Mettre à jour les imports

```typescript
// ❌ Ancien : import depuis ui2
import Tweet from '../ui2/Tweet'

// ✅ Nouveau : importer depuis la nouvelle structure
import Tweet from '@/components/ui/features/tweet/Tweet'

// Et si tu as besoin de la logique :
import TweetContainer from '@/containers/TweetContainer'
```

## Exemples d'intégration

### Feed

**Avant**
```typescript
export default function Feed() {
  const [tweets, setTweets] = useState([])

  useEffect(() => {
    fetch('/api/feed').then(r => r.json()).then(setTweets)
  }, [])

  return tweets.map(t => <Tweet key={t.id} tweet={t} />)
}
```

**Après**
```typescript
// Container
export default function FeedContainer() {
  const { posts: feed, isLoading, error, fetchFeed } = usePosts()

  useEffect(() => {
    fetchFeed()
  }, [])

  if (isLoading) return <Loading />
  if (error) return <Error message={error} />

  return <Feed posts={feed} />
}

// UI
interface FeedProps {
  posts: Post[]
}

function Feed({ posts }: FeedProps) {
  return posts.map(post => <Post key={post.id} post={post} />)
}
```

### Like Button

**Avant**
```typescript
export default function LikeButton({ postId }: any) {
  const [liked, setLiked] = useState(false)

  const handleLike = async () => {
    await fetch(`/api/posts/${postId}/like`, { method: 'POST' })
    setLiked(true)
  }

  return <button onClick={handleLike}>{liked ? '❤️' : '🤍'}</button>
}
```

**Après**
```typescript
// UI
interface LikeButtonProps {
  isLiked: boolean
  onLike: (postId: string) => void
  onUnlike: (postId: string) => void
}

function LikeButton({ isLiked, onLike, onUnlike }: LikeButtonProps) {
  const handleClick = () => {
    isLiked ? onUnlike() : onLike()
  }
  return (
    <button onClick={handleClick}>
      {isLiked ? '❤️' : '🤍'}
    </button>
  )
}

// Utilisation dans Tweet (UI)
export default function Tweet({ post, onLike }: TweetProps) {
  return (
    <div>
      <p>{post.content}</p>
      <LikeButton
        isLiked={post.isLiked}
        onLike={() => onLike(post.id)}
        onUnlike={() => onUnlike(post.id)}
      />
    </div>
  )
}
```

## Cas courants

### 1. Afficher un message d'erreur global

```typescript
import { useAuth } from '@/store'

export default function ErrorBanner() {
  const { error, clearError } = useAuth()

  if (!error) return null

  return (
    <div className="bg-red-100 p-4">
      {error}
      <button onClick={clearError}>✕</button>
    </div>
  )
}
```

### 2. Charger une page utilisateur

```typescript
import { useParams } from 'react-router-dom'
import { useUsers } from '@/store'
import { useEffect } from 'react'

export default function ProfileContainer() {
  const { id } = useParams()
  const { users, fetchUser } = useUsers()
  const user = users.get(id!)

  useEffect(() => {
    if (id && !users.has(id)) {
      fetchUser(id)
    }
  }, [id])

  if (!user) return <Loading />

  return <Profile user={user} />
}
```

### 3. Bouton suivi (Follow)

```typescript
export default function FollowButton({ userId, isFollowing }: any) {
  const { followUser, unfollowUser } = useUsers()

  const handleClick = async () => {
    if (isFollowing) {
      await unfollowUser(userId)
    } else {
      await followUser(userId)
    }
  }

  return (
    <button onClick={handleClick}>
      {isFollowing ? 'Unfollow' : 'Follow'}
    </button>
  )
}
```

## Checklist de migration

Pour chaque composant qui accède aux données :

- [ ] Identifier la logique métier (appels API, state global)
- [ ] Créer un Container qui utilise les hooks du store
- [ ] Refactoriser le composant UI pour accepter les données en props
- [ ] Remplacer les appels API/useState par les actions du store
- [ ] Tester que tout fonctionne
- [ ] Nettoyer les anciens imports

## Besoin d'aide ?

Consulte [store/README.md](../store/README.md) pour :
- La documentation complète du store
- Les hooks disponibles
- Les bonnes pratiques

