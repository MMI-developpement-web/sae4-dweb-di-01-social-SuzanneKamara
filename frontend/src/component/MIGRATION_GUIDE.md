# Component Migration Guide

## File Mapping - Old → New

### Root UI Components (Old → New)

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| `ui/Avatar.tsx` | `ui/atoms/Avatar.tsx` | Atom | ✅ Migrated |
| `ui/Button.tsx` | `ui/atoms/Button.tsx` | Atom | ✅ Migrated |
| `ui/Icon.tsx` | `ui/atoms/Icon.tsx` | Atom | ✅ Refactored |
| `ui/Input.tsx` | `ui/atoms/Input.tsx` | Atom | ✅ Refactored |
| `ui/Badge.tsx` | `ui/atoms/Badge.tsx` | Atom | ✅ Migrated |
| `ui/PP.tsx` | `ui/atoms/PP.tsx` | Atom | ✅ Created |
| `ui/Username.tsx` | `ui/atoms/Username.tsx` | Atom | ✅ Created |

### Shared Components (Old → New)

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| `ui/FollowButton.tsx` | `ui/shared/FollowButton.tsx` | Shared | ✅ Migrated |
| `ui/LikeButton.tsx` | `ui/shared/LikeButton.tsx` | Shared | ✅ Refactored |
| `ui/RepublicationButton.tsx` | `ui/shared/RepublicationButton.tsx` | Shared | ✅ Created |
| `ui/CommentButton.tsx` | `ui/shared/CommentButton.tsx` | Shared | ✅ Created |
| `ui/ModifyButton.tsx` | `ui/shared/ModifyButton.tsx` | Shared | ✅ Created |

### Tweet Feature Components

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| `ui/TweetCard.tsx` | `ui/features/tweet/Tweet.tsx` | Tweet | ✅ Refactored |
| `ui2/Tweet.tsx` | `ui/features/tweet/Tweet.tsx` | Tweet | ✅ Created |
| `ui2/TweetHeader.tsx` | `ui/features/tweet/TweetHeader.tsx` | Tweet | ✅ Refactored |
| `ui2/TweetFooter.tsx` | `ui/features/tweet/TweetFooter.tsx` | Tweet | ✅ Created |
| `ui2/TweetMignature.tsx` | `ui/features/tweet/TweetMignature.tsx` | Tweet | ✅ Created |
| `ui2/Hashtag.tsx` | `ui/features/tweet/Hashtag.tsx` | Tweet | ✅ Created |

### Post Feature Components

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| `ui/Post.tsx` | `ui/features/post/Post.tsx` | Post | ✅ Migrated |
| `ui/PostContent.tsx` | `ui/features/post/PostContent.tsx` | Post | ⏳ Pending |
| `ui/PostFooter.tsx` | `ui/features/post/PostFooter.tsx` | Post | ⏳ Pending |
| `ui2/PostComposer.tsx` | `ui/features/post/PostComposer.tsx` | Post | ✅ Created |
| `ui2/PostCounter.tsx` | `ui/features/post/PostCounter.tsx` | Post | ✅ Created |

### Navigation Feature Components

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| `ui2/Header.tsx` | `ui/features/navigation/Header.tsx` | Navigation | ✅ Created |
| `ui2/NavigationBar.tsx` | `ui/features/navigation/NavigationBar.tsx` | Navigation | ✅ Created |
| `ui2/Footer.tsx` | `ui/features/navigation/Footer.tsx` | Navigation | ✅ Created |
| `ui2/Logo.tsx` | `ui/features/navigation/Logo.tsx` | Navigation | ✅ Created |

### Register Feature Components

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| `ui/Register.tsx` | `ui/features/register/Register.tsx` | Register | ⏳ Pending |

### Others

| Old Path | New Path | Type | Status |
|----------|----------|------|--------|
| N/A | `ui/animations/motionVariants.ts` | Animation | ✅ Created |
| N/A | `ui/animations/useMotionAnimation.ts` | Animation | ✅ Created |

## Import Updates Needed

### Files to Update
The following files in `routes/` need to update their imports:

- [ ] `routes/Feed.tsx` - Update Tweet/TweetCard imports
- [ ] `routes/Profile.tsx` - Update Profile imports
- [ ] `routes/Explore.tsx` - Update navigation imports
- [ ] `routes/Settings.tsx` - Update component imports
- [ ] `routes/Post.tsx` - Update post component imports

### Example: Before & After

**Before:**
```tsx
import Button from '../component/ui/Button'
import Avatar from '../component/ui/Avatar'
import LikeButton from '../component/ui/LikeButton'
import TweetCard from '../component/ui/TweetCard'
```

**After (Option A - Specific imports):**
```tsx
import { Button, Avatar, LikeButton } from '@/component/ui/atoms'
import { LikeButton } from '@/component/ui/shared'
import { Tweet } from '@/component/ui/features/tweet'
```

**After (Option B - Main export):**
```tsx
import { Button, Avatar, Tweet } from '@/component/ui'
```

**After (Option C - During migration - Backward compatible):**
```tsx
// Still works! Re-exported from new locations
import Button from '@/component/ui/Button'
import Avatar from '@/component/ui/Avatar'
```

## Backward Compatibility

All old imports continue to work through `backwards-compatibility.ts` re-exports. This allows gradual migration without breaking existing code.

To gradually migrate:
1. Update imports one file at a time
2. Use new specific paths (e.g., `@/component/ui/atoms/Button`)
3. Eventually standardize on main export path (e.g., `@/component/ui`)

## Containers (To Be Created)

These are smart components connecting UI to logic:

- [ ] `containers/tweet/TweetContainer.tsx` - ✅ Created
- [ ] `containers/post/PostComposerContainer.tsx` - ✅ Created
- [ ] `containers/profile/ProfileContainer.tsx` - ⏳ Pending
- [ ] `containers/feed/FeedContainer.tsx` - ⏳ Pending

## Next Steps

1. ✅ Create new component structure
2. ⏳ Update route files to use new imports
3. ⏳ Create store for state management
4. ⏳ Finalize container implementations
5. ⏳ Add animations with motion.dev
6. ⏳ Create responsive variants (desktop)
7. ⏳ Remove old UI folder (after full migration)
