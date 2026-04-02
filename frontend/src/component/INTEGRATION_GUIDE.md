# Component Integration Guide - Golden Path

## Example: Tweet Component Integration

This guide shows the "golden path" for creating and integrating a fully functional component.

### Step 1: Create UI Component (Pure Presentation)

**Location**: `src/component/ui/features/tweet/Tweet.tsx`

```tsx
// Pure UI - no business logic, no API calls, no state mutations
interface TweetProps {
  tweet: {
    id: number
    content: string
    author: { username: string; avatar?: string }
    createdAt: string
    likes: number
  }
  onDelete?: () => void
  onUpdate?: () => void
  isAuthorBlocked?: boolean
  className?: string
}

export default function Tweet({
  tweet,
  onDelete,
  onUpdate,
  isAuthorBlocked = false,
  className,
}: TweetProps) {
  // Pure presentation logic only
  return (
    <article className={cn('border-b border-gray-200', className)}>
      <TweetHeader {...tweet} />
      {isAuthorBlocked ? <BlockedMessage /> : <TweetContent {...tweet} />}
      <TweetFooter tweetId={tweet.id} onDelete={onDelete} />
    </article>
  )
}
```

### Step 2: Export from Index

**Location**: `src/component/ui/features/tweet/index.ts`

```tsx
export { default as Tweet } from './Tweet'
export { default as TweetHeader } from './TweetHeader'
// ... other exports
```

### Step 3: Create Container (Smart Component)

**Location**: `src/component/containers/tweet/TweetContainer.tsx`

```tsx
// Smart container - handles logic, API, state
import { Tweet as TweetUI } from '../../ui/features/tweet'
import { useStore } from '@/store' // TODO: Implement store
import { deleteTweet } from '@/lib/api' // API calls

interface TweetContainerProps {
  tweetId: number
  onSuccess?: () => void
}

export default function TweetContainer({ tweetId, onSuccess }: TweetContainerProps) {
  // Get data from store
  const tweets = useStore((state) => state.tweets)
  const tweet = tweets[tweetId]

  // Handle business logic
  const handleDelete = async () => {
    try {
      await deleteTweet(tweetId)
      useStore.setState((state) => ({
        tweets: { ...state.tweets, [tweetId]: null }
      }))
      onSuccess?.()
    } catch (error) {
      console.error('Failed to delete tweet:', error)
    }
  }

  if (!tweet) return <div>Loading...</div>

  // Pass data to pure UI component
  return (
    <TweetUI
      tweet={tweet}
      onDelete={handleDelete}
    />
  )
}
```

### Step 4: Use in Route

**Location**: `src/routes/Feed.tsx`

```tsx
import { TweetContainer } from '@/component/containers' // Smart component
// OR use UI directly if no logic needed:
// import { Tweet } from '@/component/ui'

export default function Feed() {
  const tweetIds = [1, 2, 3] // From server or store

  return (
    <div className="space-y-4">
      {tweetIds.map((id) => (
        // Use container for smart behavior
        <TweetContainer key={id} tweetId={id} />
      ))}
    </div>
  )
}
```

### Step 5: Add Animations (Optional)

**Update container with motion.dev**:

```tsx
import { motion } from 'framer-motion'
import { slideInVariants, standardTransition } from '@/component/ui/animations'

export default function TweetContainer({ tweetId, onSuccess }: TweetContainerProps) {
  // ... existing code ...

  return (
    <motion.div
      variants={slideInVariants}
      initial="hidden"
      animate="visible"
      transition={standardTransition}
    >
      <TweetUI
        tweet={tweet}
        onDelete={handleDelete}
      />
    </motion.div>
  )
}
```

---

## Pattern Summary

```
┌─────────────────────────────────────────────────────────────┐
│                         Route/Page                           │
│  (e.g., Feed.tsx - Orchestrates containers)                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Container (Smart)                       │
│  (Connects to Store, handles logic, API calls, animations)  │
│  e.g., TweetContainer, PostComposerContainer                │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        UI Component                          │
│  (Pure presentation, receives all data as props)            │
│  e.g., Tweet, PostComposer, TweetHeader                     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Atoms & Shared Components                  │
│  (Reusable primitives: Avatar, Button, FollowButton, etc.)  │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    Global Store (Zustand)                    │
│  (Centralizes: users, tweets, follows, ui state)            │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Flow Example

### Iteration: User likes a tweet

1. **User clicks LikeButton** (in TweetUI)
   ```
   LikeButton (UI) → onClick handler
   ```

2. **Container handles the logic** (TweetContainer)
   ```
   TweetContainer → Call API (likeTweet)
   ```

3. **Store updates**
   ```
   Store → Update tweet.isLiked, tweet.likes++
   ```

4. **UI re-renders with new data**
   ```
   TweetUI receives updated tweet props → renders with filled heart ❤️
   ```

---

## Best Practices

### ✅ DO

- ✅ Keep UI components **pure** (props in, JSX out)
- ✅ Handle logic in **containers** (API, state mutations)
- ✅ Centralize state in **store** (single source of truth)
- ✅ Use **atoms** and **shared** components for reusability
- ✅ Accept **className prop** for styling flexibility
- ✅ Write **TypeScript interfaces** for props
- ✅ Animate via **containers** when possible (less re-renders)

### ❌ DON'T

- ❌ Put API calls in UI components
- ❌ Directly mutate state in components
- ❌ Create multiple sources of truth
- ❌ Use useState for global state
- ❌ Hard-code styles (use Tailwind + className)
- ❌ Mix UI and business logic
- ❌ Pass unnecessary props down (use store instead)

---

## Testing Examples

### Test UI Component (Easy - Pure)
```tsx
import { render, screen } from '@testing-library/react'
import Tweet from './Tweet'

test('renders tweet content', () => {
  const tweet = { id: 1, content: 'Hello', author: { ... } }
  render(<Tweet tweet={tweet} />)
  expect(screen.getByText('Hello')).toBeInTheDocument()
})
```

### Test Container (Medium - With Store Mock)
```tsx
import { render, screen } from '@testing-library/react'
import TweetContainer from './TweetContainer'
// Mock store and API

test('deletes tweet on button click', async () => {
  // Mock store and delete API
  render(<TweetContainer tweetId={1} />)
  // Verify behavior
})
```

---

## Checklist for New Component

- [ ] Create UI component in appropriate `features/` folder
- [ ] Export from folder's `index.ts`
- [ ] Export from main `ui/index.ts`
- [ ] Create Container if logic needed
- [ ] Add to `containers/index.ts`
- [ ] Update `MIGRATION_GUIDE.md` if replacing old component
- [ ] Add TypeScript interfaces for props
- [ ] Include className prop for customization
- [ ] Test component in isolation
- [ ] Add animation variants if appropriate
- [ ] Document in component file or COMPONENT_ARCHITECTURE.md

---

## Real-World Example: Adding Comment Feature

1. **Create UI components**:
   - `ui/features/tweet/CommentBox.tsx` (pure UI)
   - `ui/shared/CommentCount.tsx` (shared)

2. **Create container**:
   - `containers/tweet/CommentBoxContainer.tsx` (logic + API)

3. **Update store types**:
   - Add `comments` slice to `store/types.ts`

4. **Use in route**:
   ```tsx
   import { CommentBoxContainer } from '@/component/containers'
   
   <CommentBoxContainer tweetId={tweetId} />
   ```

That's it! The data flows through the system, store manages state, and UI stays pure.

---

## Need Help?

- Component Architecture: See `COMPONENT_ARCHITECTURE.md`
- File Mapping: See `MIGRATION_GUIDE.md`
- Store Pattern: See `store/README.md`
- Existing Examples: Check implemented containers in `containers/`
