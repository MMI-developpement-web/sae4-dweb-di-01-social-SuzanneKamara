/**
 * usePosts Hook
 * Accès simplifié au store des posts
 */

import { usePostStore } from '../slices/postSlice'

export const usePosts = () => {
  return usePostStore((state) => ({
    posts: state.posts,
    feed: state.feed,
    isLoading: state.isLoading,
    error: state.error,
    fetchPosts: state.fetchPosts,
    fetchFeed: state.fetchFeed,
    createPost: state.createPost,
    likePost: state.likePost,
    unlikePost: state.unlikePost,
    repostPost: state.repostPost,
    unrepostPost: state.unrepostPost,
    deletePost: state.deletePost,
    setPosts: state.setPosts,
    setError: state.setError,
  }))
}
