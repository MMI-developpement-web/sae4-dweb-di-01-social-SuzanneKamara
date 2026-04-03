import { apiFetch, apiFetchJson, apiFetchPublic } from './api'
import { buildApiUrl } from './apiConfig'

export interface Tweet {
  id: string | number
  content: string
  author: {
    id: string | number
    username: string
    email: string
    avatar_url?: string
    is_blocked?: boolean
  }
  hashtags?: Array<{
    id: string | number
    name: string
  }>
  media?: Array<{
    id: string | number
    media_type: string
    file_url: string
    file_size: number
  }>
  createdAt?: string
  updatedAt?: string
  likes?: number
}

export interface CreateTweetPayload {
  content: string
  mediaIds?: number[]
}

export interface UpdateTweetPayload {
  content: string
}

export interface FollowingTweetsPage {
  tweets: Tweet[]
  hasMore: boolean
}

const CANDIDATE_POST_ENDPOINTS = ['/tweets']

function toRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : null
}

function toTweet(item: unknown): Tweet | null {
  const raw = toRecord(item)
  if (!raw) {
    return null
  }

  const id = raw.id ?? raw['@id'] ?? raw.uuid
  if (typeof id !== 'string' && typeof id !== 'number') {
    return null
  }

  const contentCandidate = raw.content ?? raw.text ?? raw.body ?? raw.message
  const content = typeof contentCandidate === 'string' ? contentCandidate : ''

  const authorRaw = toRecord(raw.author) ?? toRecord(raw.user) ?? {}
  const authorId = authorRaw.id ?? authorRaw['@id'] ?? 'unknown'
  const usernameCandidate = authorRaw.username ?? authorRaw.name ?? authorRaw.displayName
  const emailCandidate = authorRaw.email
  const avatarUrlCandidate = authorRaw.avatar_url ?? authorRaw.avatarUrl ?? ''
  const isBlockedCandidate = authorRaw.is_blocked ?? authorRaw.isBlocked ?? false

  const hashtagsRaw = Array.isArray(raw.hashtags) ? raw.hashtags : []
  const hashtags: Array<{ id: string | number; name: string }> = []

  hashtagsRaw.forEach((tag, index) => {
    const tagRecord = toRecord(tag)
    if (!tagRecord) {
      const tagName = typeof tag === 'string' ? tag.replace(/^#/, '') : ''
      if (tagName) {
        hashtags.push({ id: index, name: tagName })
      }
      return
    }

    const tagId = tagRecord.id ?? tagRecord['@id'] ?? index
    const tagNameCandidate = tagRecord.name ?? tagRecord.label
    const tagName = typeof tagNameCandidate === 'string' ? tagNameCandidate.replace(/^#/, '') : ''

    if (tagName) {
      hashtags.push({ id: String(tagId), name: tagName })
    }
  })

  // Extract media from raw data
  const mediaRaw = Array.isArray(raw.media) ? raw.media : []
  const media: Array<{ id: string | number; media_type: string; file_url: string; file_size: number }> = []

  mediaRaw.forEach((item) => {
    const mediaRecord = toRecord(item)
    if (!mediaRecord) return

    const mediaId = mediaRecord.id ?? mediaRecord['@id']
    const mediaType = mediaRecord.media_type ?? mediaRecord.mediaType ?? ''
    const fileUrl = mediaRecord.file_url ?? mediaRecord.fileUrl ?? mediaRecord.url ?? ''
    const fileSize = typeof mediaRecord.file_size === 'number' ? mediaRecord.file_size : 0

    if (mediaId && mediaType && fileUrl) {
      media.push({
        id: mediaId,
        media_type: String(mediaType),
        file_url: String(fileUrl),
        file_size: fileSize,
      })
    }
  })

  return {
    id,
    content,
    author: {
      id: String(authorId),
      username: typeof usernameCandidate === 'string' ? usernameCandidate : 'unknown',
      email: typeof emailCandidate === 'string' ? emailCandidate : '',
      avatar_url: typeof avatarUrlCandidate === 'string' && avatarUrlCandidate ? avatarUrlCandidate : undefined,
      is_blocked: Boolean(isBlockedCandidate),
    },
    hashtags,
    media,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.created_at === 'string'
          ? raw.created_at
          : undefined,
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : undefined,
  }
}

function normalizeTweetList(payload: unknown): Tweet[] {
  if (Array.isArray(payload)) {
    return payload.map(toTweet).filter((tweet): tweet is Tweet => Boolean(tweet))
  }

  const objectPayload = toRecord(payload)
  if (!objectPayload) {
    return []
  }

  const hydraMembers = objectPayload['hydra:member']
  if (Array.isArray(hydraMembers)) {
    return hydraMembers.map(toTweet).filter((tweet): tweet is Tweet => Boolean(tweet))
  }

  const data = objectPayload.data
  if (Array.isArray(data)) {
    return data.map(toTweet).filter((tweet): tweet is Tweet => Boolean(tweet))
  }

  const singleTweet = toTweet(objectPayload)
  return singleTweet ? [singleTweet] : []
}

async function handleApiError(response: Response): Promise<never> {
  const errorData = await response.json().catch(() => ({}))
  const message = typeof (errorData as Record<string, unknown>).message === 'string'
    ? (errorData as Record<string, unknown>).message
    : `HTTP ${response.status}`
  throw new Error(String(message))
}

export async function fetchAllTweets(): Promise<Tweet[]> {
  for (const endpoint of CANDIDATE_POST_ENDPOINTS) {
    try {
      const response = await apiFetch(buildApiUrl(endpoint), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      })

      if (!response.ok) {
        continue
      }

      const payload = (await response.json()) as unknown
      const tweets = normalizeTweetList(payload)
      if (tweets.length > 0) {
        return tweets
      }
    } catch {
      continue
    }
  }

  return []
}

export async function fetchFollowingTweets(): Promise<Tweet[]> {
  const page = await fetchFollowingTweetsPage(40, 0)
  return page.tweets
}

export async function fetchFollowingTweetsPage(limit = 40, offset = 0): Promise<FollowingTweetsPage> {
  const response = await apiFetch(buildApiUrl(`/tweets/feed?limit=${limit}&offset=${offset}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    await handleApiError(response)
  }

  const payload = (await response.json()) as unknown
  const payloadRecord = toRecord(payload)

  if (payloadRecord && Array.isArray(payloadRecord.data)) {
    return {
      tweets: normalizeTweetList(payloadRecord.data),
      hasMore: Boolean(payloadRecord.has_more),
    }
  }

  const tweets = normalizeTweetList(payload)
  return {
    tweets,
    hasMore: tweets.length === limit,
  }
}

export async function fetchExploreTweetsPage(limit = 40, offset = 0): Promise<FollowingTweetsPage> {
  const response = await apiFetchPublic(buildApiUrl(`/tweets/explore?limit=${limit}&offset=${offset}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    await handleApiError(response)
  }

  const payload = (await response.json()) as unknown
  const payloadRecord = toRecord(payload)

  if (payloadRecord && Array.isArray(payloadRecord.data)) {
    return {
      tweets: normalizeTweetList(payloadRecord.data),
      hasMore: Boolean(payloadRecord.has_more),
    }
  }

  const tweets = normalizeTweetList(payload)
  return {
    tweets,
    hasMore: tweets.length === limit,
  }
}

export async function fetchUserTweetsPage(userId: string | number, limit = 40, offset = 0): Promise<FollowingTweetsPage> {
  const response = await apiFetch(buildApiUrl(`/tweets/user/${userId}?limit=${limit}&offset=${offset}`), {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    await handleApiError(response)
  }

  const payload = (await response.json()) as unknown
  const payloadRecord = toRecord(payload)

  if (payloadRecord && Array.isArray(payloadRecord.data)) {
    return {
      tweets: normalizeTweetList(payloadRecord.data),
      hasMore: Boolean(payloadRecord.has_more),
    }
  }

  const tweets = normalizeTweetList(payload)
  return {
    tweets,
    hasMore: tweets.length === limit,
  }
}

export async function createTweet(payload: CreateTweetPayload): Promise<Tweet> {
  const response = await apiFetchJson<Tweet>(buildApiUrl('/tweets'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response
}

export async function updateTweet(tweetId: string | number, payload: UpdateTweetPayload): Promise<Tweet> {
  const response = await apiFetchJson<Tweet>(buildApiUrl(`/tweets/${tweetId}`), {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
  return response
}

export async function deleteTweet(tweetId: string | number): Promise<void> {
  const response = await apiFetch(buildApiUrl(`/tweets/${tweetId}`), {
    method: 'DELETE',
  })

  if (!response.ok) {
    await handleApiError(response)
  }
}

export function extractHashtagsFromContent(content: string): string[] {
  const hashtagRegex = /#[\w]+/g
  return content.match(hashtagRegex) || []
}
