/**
 * User Store Slice
 * Gère les utilisateurs et les relations de suivi
 * Utilise le système de token API simple (pas JWT)
 */

import { create } from 'zustand'
import type { UserState, User } from '../types'
import { apiCall } from '../api-client'

export const useUserStore = create<UserState>((set, get) => ({
  users: new Map(),
  currentUser: null,
  followers: [],
  following: [],
  isLoading: false,
  error: null,

  fetchUser: async (userId: string) => {
    set({ isLoading: true, error: null })
    try {
      const user = await apiCall<User>(`/users/${userId}`)
      const { users } = get()
      users.set(userId, user)
      set({ users: new Map(users), isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message, isLoading: false })
    }
  },

  fetchFollowers: async () => {
    set({ isLoading: true, error: null })
    try {
      const followers = await apiCall<User[]>('/me/followers')
      const followerIds = followers.map((u) => u.id)
      set({ followers: followerIds, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message, isLoading: false })
    }
  },

  fetchFollowing: async () => {
    set({ isLoading: true, error: null })
    try {
      const following = await apiCall<User[]>('/me/following')
      const followingIds = following.map((u) => u.id)
      set({ following: followingIds, isLoading: false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message, isLoading: false })
    }
  },

  followUser: async (userId: string) => {
    try {
      await apiCall(`/users/${userId}/follow`, { method: 'POST' })

      const { following } = get()
      if (!following.includes(userId)) {
        set({ following: [...following, userId] })
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },
  unfollowUser: async (userId: string) => {
    try {
      await apiCall(`/users/${userId}/unfollow`, { method: 'POST' })

      const { following } = get()
      set({ following: following.filter((id) => id !== userId) })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
    }
  },

  searchUsers: async (query: string) => {
    try {
      const results = await apiCall<User[]>(`/users/search?q=${query}`)
      return results
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur'
      set({ error: message })
      return []
    }
  },

  setUsers: (userList: User[]) => {
    const usersMap = new Map()
    userList.forEach((u) => usersMap.set(u.id, u))
    set({ users: usersMap })
  },

  setError: (error: string | null) => {
    set({ error })
  },
}))
