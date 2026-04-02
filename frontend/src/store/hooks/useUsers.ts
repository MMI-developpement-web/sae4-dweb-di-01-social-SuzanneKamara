/**
 * useUsers Hook
 * Accès simplifié au store des utilisateurs
 */

import { useUserStore } from '../slices/userSlice'

export const useUsers = () => {
  return useUserStore((state) => ({
    users: state.users,
    currentUser: state.currentUser,
    followers: state.followers,
    following: state.following,
    isLoading: state.isLoading,
    error: state.error,
    fetchUser: state.fetchUser,
    fetchFollowers: state.fetchFollowers,
    fetchFollowing: state.fetchFollowing,
    followUser: state.followUser,
    unfollowUser: state.unfollowUser,
    searchUsers: state.searchUsers,
    setUsers: state.setUsers,
    setError: state.setError,
  }))
}
