/**
 * Store Types & Interfaces
 * Définit la structure de données pour tout l'état global de l'application
 */

// ============ ENTITIES ============

export interface User {
  id: string
  username: string
  email: string
  avatar?: string
  banner?: string
  bio?: string
  followers: number
  following: number
  isBlocked?: boolean
  createdAt?: string
}

export interface Post {
  id: string
  authorId: string
  author?: User
  content: string
  hashtags: string[]
  image?: string
  createdAt: string
  likes: number
  reposts: number
  comments: number
  isLiked?: boolean
  isReposted?: boolean
}

export interface PostCreatePayload {
  content: string
  hashtags?: string[]
  image?: string
}

// ============ STORE STATES ============

/** État d'authentification */
export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  // Actions
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setError: (error: string | null) => void
  clearError: () => void
}

/** État des posts */
export interface PostState {
  posts: Post[]
  feed: string[] // IDs des posts du feed
  isLoading: boolean
  error: string | null
  // Actions
  fetchPosts: () => Promise<void>
  fetchFeed: () => Promise<void>
  createPost: (payload: PostCreatePayload) => Promise<void>
  likePost: (postId: string) => Promise<void>
  unlikePost: (postId: string) => Promise<void>
  repostPost: (postId: string) => Promise<void>
  unrepostPost: (postId: string) => Promise<void>
  deletePost: (postId: string) => Promise<void>
  setPosts: (posts: Post[]) => void
  setError: (error: string | null) => void
}

/** État des utilisateurs */
export interface UserState {
  users: Map<string, User>
  currentUser: User | null
  followers: string[] // IDs des followers du user actuel
  following: string[] // IDs des utilisateurs suivis
  isLoading: boolean
  error: string | null
  // Actions
  fetchUser: (userId: string) => Promise<void>
  fetchFollowers: () => Promise<void>
  fetchFollowing: () => Promise<void>
  followUser: (userId: string) => Promise<void>
  unfollowUser: (userId: string) => Promise<void>
  searchUsers: (query: string) => Promise<User[]>
  setUsers: (users: User[]) => void
  setError: (error: string | null) => void
}

/** État de l'interface */
export interface UIState {
  isDarkMode: boolean
  isShowingModal: boolean
  modalType: string | null
  modalData: any
  isShowingOverlay: boolean
  overlayType: string | null
  // Actions
  toggleDarkMode: () => void
  openModal: (type: string, data?: any) => void
  closeModal: () => void
  openOverlay: (type: string) => void
  closeOverlay: () => void
}
