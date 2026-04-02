/**
 * Post Store Slice
 * Gère les posts et le feed
 * Utilise le système de token API simple (pas JWT)
 */

import { create } from 'zustand'
import type { PostState, Post, PostCreatePayload } from '../types'
import { apiCall } from '../api-client'

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  feed: [],
  isLoading: false,
  error: null,

  fetchPosts: async () => {
    set({ isLoading: true, error: null })
    try {
      const posts = await apiCall<Post[]>('/posts')
      set({ posts, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message, isLoading: false })
    }
  },

  fetchFeed: async () => {
    set({ isLoading: true, error: null })
    try {
      const feedPosts = await apiCall<Post[]>('/feed')
      const feed = feedPosts.map((p) => p.id)
      set({ posts: feedPosts, feed, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message, isLoading: false })
    }
  },

  createPost: async (payload: PostCreatePayload) => {
    set({ isLoading: true, error: null })
    try {
      const newPost = await apiCall<Post>('/posts', {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      const { posts, feed } = get()
      set({
        posts: [newPost, ...posts],
        feed: [newPost.id, ...feed],
        isLoading: false,
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message, isLoading: false })
      throw error
    }
  },

  likePost: async (postId: string) => {
    try {
      await apiCall(`/posts/${postId}/like`, { method: 'POST' })

      const { posts } = get()
      set({
        posts: posts.map((p) =>
          p.id === postId ? { ...p, isLiked: true, likes: p.likes + 1 } : p
        ),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },

  unlikePost: async (postId: string) => {
    try {
      await apiCall(`/posts/${postId}/unlike`, { method: 'POST' })

      const { posts } = get()
      set({
        posts: posts.map((p) =>
          p.id === postId ? { ...p, isLiked: false, likes: p.likes - 1 } : p
        ),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },

  repostPost: async (postId: string) => {
    try {
      await apiCall(`/posts/${postId}/repost`, { method: 'POST' })

      const { posts } = get()
      set({
        posts: posts.map((p) =>
          p.id === postId ? { ...p, isReposted: true, reposts: p.reposts + 1 } : p
        ),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },

  unrepostPost: async (postId: string) => {
    try {
      await apiCall(`/posts/${postId}/unrepost`, { method: 'POST' })

      const { posts } = get()
      set({
        posts: posts.map((p) =>
          p.id === postId ? { ...p, isReposted: false, reposts: p.reposts - 1 } : p
        ),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },

  deletePost: async (postId: string) => {
    try {
      await apiCall(`/posts/${postId}`, { method: 'DELETE' })

      const { posts, feed } = get()
      set({
        posts: posts.filter((p) => p.id !== postId),
        feed: feed.filter((id) => id !== postId),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },

  setPosts: (posts: Post[]) => {
    set({ posts })
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))
