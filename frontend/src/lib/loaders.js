import { fakeNetwork } from './utils';
import { apiFetchJson } from './api';
import { buildApiUrl } from './apiConfig';

const API_ENDPOINTS = {
    users: '/users',
    tweets: '/tweets',
    hashtags: '/hashtags',
    likes: '/likes',
    media: '/media',
};

async function fetchApiData(path) {
    return apiFetchJson(buildApiUrl(path));
}

export async function fetchUsers(userId = null) {
    await fakeNetwork();
    if (userId) {
        const encodedUserId = encodeURIComponent(userId);
        return fetchApiData(`${API_ENDPOINTS.users}/${encodedUserId}`);
    }
    return fetchApiData(API_ENDPOINTS.users);
}

export async function fetchTweets(userId = null) {
    await fakeNetwork();
    if (userId) {
        const encodedUserId = encodeURIComponent(userId);
        return fetchApiData(`${API_ENDPOINTS.tweets}?userId=${encodedUserId}`);
    }
    return fetchApiData(API_ENDPOINTS.tweets);
}

export async function fetchHashtags() {
    await fakeNetwork();
    return fetchApiData(API_ENDPOINTS.hashtags);
}

export async function fetchLikes(tweetId = null) {
    await fakeNetwork();
    if (tweetId) {
        const encodedTweetId = encodeURIComponent(tweetId);
        return fetchApiData(`${API_ENDPOINTS.likes}?tweetId=${encodedTweetId}`);
    }
    return fetchApiData(API_ENDPOINTS.likes);
}

export async function fetchMedia(mediaId = null) {
    await fakeNetwork();
    if (mediaId) {
        const encodedMediaId = encodeURIComponent(mediaId);
        return fetchApiData(`${API_ENDPOINTS.media}/${encodedMediaId}`);
    }
    return fetchApiData(API_ENDPOINTS.media);
}