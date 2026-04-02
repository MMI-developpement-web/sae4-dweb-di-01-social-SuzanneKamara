// Compatibility file - Re-exports new components from their new locations
// This allows existing code to continue working during migration

export { default as Avatar } from './atoms/Avatar'
export { default as Button } from './atoms/Button'
export { default as Icon } from './atoms/Icon'
export { default as Input } from './atoms/Input'
export { default as Badge } from './atoms/Badge'
export { default as PP } from './atoms/PP'
export { default as Username } from './atoms/Username'

export { default as FollowButton } from './shared/FollowButton'
export { default as LikeButton } from './shared/LikeButton'
export { default as RepublicationButton } from './shared/RepublicationButton'
export { default as CommentButton } from './shared/CommentButton'
export { default as ModifyButton } from './shared/ModifyButton'

export { default as TweetCard } from './features/tweet/Tweet'
export { default as Tweet } from './features/tweet/Tweet'
export { default as TweetHeader } from './features/tweet/TweetHeader'
export { default as TweetFooter } from './features/tweet/TweetFooter'
export { default as TweetMignature } from './features/tweet/TweetMignature'
export { default as Hashtag } from './features/tweet/Hashtag'

export { default as Post } from './features/post/Post'
export { default as PostComposer } from './features/post/PostComposer'
export { default as PostCounter } from './features/post/PostCounter'

export { default as Header } from './features/navigation/Header'
export { default as NavigationBar } from './features/navigation/NavigationBar'
export { default as Footer } from './features/navigation/Footer'

export { default as Register } from './features/register/Register'
export { default as Profile } from './features/profile/Profile'
