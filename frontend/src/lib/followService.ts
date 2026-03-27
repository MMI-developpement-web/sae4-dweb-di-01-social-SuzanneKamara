import { apiFetchJson, apiFetch } from './api';
import { buildApiUrl } from './apiConfig';

export interface User {
  id: number;
  username: string;
}

export interface FollowRelation {
  id: number;
  follower: User;
  following: User;
  created_at: string;
}

export interface FollowsResponse {
  data: FollowRelation[];
  count: number;
}

/**
 * Follow a user (current user follows the target user)
 * @param followingId - The ID of the user to follow
 * @returns The created FollowRelation
 */
export async function followUser(followingId: number): Promise<FollowRelation> {
  const response = await apiFetchJson<FollowRelation>(buildApiUrl('/follows'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      following_id: followingId,
    }),
  });
  return response;
}

/**
 * Unfollow a user by deleting the follow relation
 * @param followRelationId - The ID of the follow relation to delete
 */
export async function unfollowUser(followRelationId: number): Promise<void> {
  const response = await apiFetch(buildApiUrl(`/follows/${followRelationId}`), {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Failed to unfollow user: ${response.statusText}`);
  }
}

/**
 * Get follow status between current user and target user
 * @param currentUserId - The ID of the current user (follower)
 * @param targetUserId - The ID of the user to check (following)
 * @returns The FollowRelation if exists, null otherwise
 */
export async function getFollowStatus(
  currentUserId: number,
  targetUserId: number
): Promise<FollowRelation | null> {
  try {
    const response = await apiFetchJson<FollowsResponse>(
      buildApiUrl(`/follows?follower_id=${currentUserId}&following_id=${targetUserId}`),
      {
        method: 'GET',
      }
    );

    return response.data.length > 0 ? response.data[0] : null;
  } catch (err) {
    console.error('Failed to get follow status:', err);
    return null;
  }
}

/**
 * Get all followers of a user
 * @param userId - The ID of the user
 * @returns Array of FollowRelation where the user is being followed
 */
export async function getFollowers(userId: number): Promise<FollowRelation[]> {
  try {
    const response = await apiFetchJson<FollowsResponse>(
      buildApiUrl(`/follows?following_id=${userId}`),
      {
        method: 'GET',
      }
    );

    return response.data;
  } catch (err) {
    console.error('Failed to get followers:', err);
    return [];
  }
}

/**
 * Get all users that a user is following
 * @param userId - The ID of the user
 * @returns Array of FollowRelation where the user is the follower
 */
export async function getFollowing(userId: number): Promise<FollowRelation[]> {
  try {
    const response = await apiFetchJson<FollowsResponse>(
      buildApiUrl(`/follows?follower_id=${userId}`),
      {
        method: 'GET',
      }
    );

    return response.data;
  } catch (err) {
    console.error('Failed to get following:', err);
    return [];
  }
}
