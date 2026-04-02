# Component Architecture

## Structure Overview

```
src/component/
├── ui/                          # All UI components (presentation layer)
│   ├── atoms/                   # Reusable primitives
│   │   ├── Avatar.tsx
│   │   ├── Button.tsx
│   │   ├── Icon.tsx
│   │   ├── Input.tsx
│   │   ├── Badge.tsx
│   │   ├── Username.tsx
│   │   ├── PP.tsx
│   │   └── index.ts
│   │
│   ├── shared/                  # Cross-domain reusable components
│   │   ├── FollowButton.tsx
│   │   ├── LikeButton.tsx
│   │   ├── RepublicationButton.tsx
│   │   ├── CommentButton.tsx
│   │   ├── ModifyButton.tsx
│   │   └── index.ts
│   │
│   ├── features/                # Domain-specific components
│   │   ├── tweet/
│   │   │   ├── Tweet.tsx
│   │   │   ├── TweetHeader.tsx
│   │   │   ├── TweetContent.tsx
│   │   │   ├── TweetFooter.tsx
│   │   │   ├── TweetMignature.tsx
│   │   │   ├── Hashtag.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── profile/
│   │   │   ├── Profile.tsx
│   │   │   ├── Banner.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── post/
│   │   │   ├── Post.tsx
│   │   │   ├── PostComposer.tsx
│   │   │   ├── PostCounter.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── navigation/
│   │   │   ├── Header.tsx
│   │   │   ├── NavigationBar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── Logo.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── register/
│   │       ├── Register.tsx
│   │       └── index.ts
│   │
│   ├── animations/              # Animation helpers and utilities
│   │   ├── motionVariants.ts
│   │   ├── useMotionAnimation.ts
│   │   └── index.ts
│   │
│   ├── index.ts                 # Main export file
│   └── backwards-compatibility.ts # For gradual migration
│
├── containers/                  # Smart components (logic + UI)
│   ├── tweet/
│   │   └── TweetContainer.tsx
│   │
│   ├── post/
│   │   └── PostComposerContainer.tsx
│   │
│   └── index.ts
│
└── context/                     # Context providers and hooks
```

## Import Examples

### Atoms (Primitives)
```tsx
import { Avatar, Button, Icon, Input, Badge, Username, PP } from '@/component/ui/atoms'
// Or
import { Avatar } from '@/component/ui'
```

### Shared (Cross-domain)
```tsx
import { 
  FollowButton, 
  LikeButton, 
  CommentButton 
} from '@/component/ui/shared'
```

### Features (Domain-specific)
```tsx
// Tweet domain
import { Tweet, TweetHeader, TweetMignature } from '@/component/ui/features/tweet'
import { Tweet, TweetHeader } from '@/component/ui'

// Post domain
import { PostComposer } from '@/component/ui/features/post'
```

### Containers (Smart components)
```tsx
import { TweetContainer, PostComposerContainer } from '@/component/containers'
```

### Backwards Compatibility (during migration)
```tsx
// Old imports still work!
import Avatar from '@/component/ui/Avatar'
import Button from '@/component/ui/Button'
```

## Design Principles

### 1. **Separation of Concerns**
- **UI Components**: Pure presentation, no business logic
- **Containers**: Connect UI to logic (store, API, hooks)
- **Store**: Global state management

### 2. **Reusability**
- **Atoms**: Smallest reusable units (Button, Input, Avatar)
- **Shared**: Higher-level reusable components (FollowButton, LikeButton)
- **Features**: Domain-specific combinations (Tweet, Profile, Post)

### 3. **Hierarchy Structure**
Follows the hierarchy defined in `structure.md`:
```
Tweet
├── TweetHeader     (uses: Avatar, Username, FollowButton, PP)
├── TweetContent    (uses: Hashtag, content)
└── TweetFooter     (uses: LikeButton, CommentButton, RepublicationButton)
```

### 4. **Mobile-First & Responsive**
- Default styles are mobile
- Use Tailwind breakpoints for desktop (sm:, md:, lg:, etc.)
- Components accept className prop for customization

### 5. **Animations**
- Use `motion.dev` helpers from `animations/`
- Implement animations at the container level when possible
- Keep UI components animation-agnostic for reusability

## Component Types

### UI Component (Pure Presentation)
```tsx
interface Props {
  // Data
  title: string
  count: number
  
  // Handlers
  onClick?: () => void
  
  // Styling
  className?: string
}

export default function MyComponent({ title, count, onClick, className }: Props) {
  return <div className={cn('...')}>{title} {count}</div>
}
```

### Container Component (Logic)
```tsx
// Connects to store/API, manages state, renders UI component
export default function MyContainer() {
  const data = useStore(state => state.data) // From store
  
  return <MyComponent {...data} onClick={handleClick} />
}
```

## Migration Path

Old → New mapping:
- `ui/Avatar.tsx` → `ui/atoms/Avatar.tsx`
- `ui/TweetCard.tsx` → `ui/features/tweet/Tweet.tsx`
- `ui/PostContent.tsx` → `ui/features/post/Post.tsx`

**Backward compatibility maintained** - old imports still work during transition.

## Animation Integration (motion.dev)

```tsx
import { slideInVariants, standardTransition } from '@/component/ui/animations'

export default function TweetMignature(props) {
  return (
    <motion.article
      variants={slideInVariants}
      animate="visible"
      initial="hidden"
      transition={standardTransition}
    >
      {/* Content */}
    </motion.article>
  )
}
```

## Next Steps

1. ✅ Create UI component hierarchy
2. ✅ Create containers for logic
3. ⏳ Create store (Redux/Zustand) for global state
4. ⏳ Add animation integration
5. ⏳ Update existing pages to use new components
6. ⏳ Create responsive variants for desktop
