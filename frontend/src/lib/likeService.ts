import { apiFetch, apiFetchJson } from './api'
import { buildApiUrl } from './apiConfig'

export interface Like {
  id: number
  created_at: string
  user: {
    id: number
    username: string
  }
  tweet: {
    id: number
    content: string
  }
}

export interface LikesResponse {
  data: Like[]
  count: number
}

const LIKES_ENDPOINT = '/likes'

/**
 * Like a tweet
 * @param tweetId - The ID of the tweet to like
 * @returns The created Like object
 */
export async function likeTweet(tweetId: number | string): Promise<Like> {
  const response = await apiFetchJson<Like>(buildApiUrl(LIKES_ENDPOINT), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tweet_id: tweetId,
    }),
  })

  return response
}

/**
 * Unlike a tweet by deleting the like
 * @param likeId - The ID of the like to delete
 */
export async function unlikeTweet(likeId: number): Promise<void> {
  const response = await apiFetch(buildApiUrl(`${LIKES_ENDPOINT}/${likeId}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    throw new Error(`Failed to unlike tweet: ${response.statusText}`)
  }
}

/**
 * Get all likes (mostly for debugging, not used in main flow)
 */
export async function getAllLikes(): Promise<Like[]> {
  const response = await apiFetchJson<LikesResponse>(buildApiUrl(LIKES_ENDPOINT), {
    method: 'GET',
  })

  return response.data
}

/**
 * Get a specific like by ID
 */
export async function getLikeById(likeId: number): Promise<Like> {
  const response = await apiFetchJson<Like>(buildApiUrl(`${LIKES_ENDPOINT}/${likeId}`), {
    method: 'GET',
  })

  return response
}

/**
 * Get likes for a specific user and tweet
 * @param userId - The user ID
 * @param tweetId - The tweet ID
 * @returns Array of Like objects (usually 0 or 1)
 */
export async function getLikesByUserAndTweet(userId: number, tweetId: number | string): Promise<Like[]> {
  const response = await apiFetchJson<LikesResponse>(
    buildApiUrl(`${LIKES_ENDPOINT}?user_id=${userId}&tweet_id=${tweetId}`),
    {
      method: 'GET',
    }
  )

  return response.data
}
