<?php

namespace App\Controller;

use App\Dto\TweetCreateDto;
use App\Dto\TweetUpdateDto;
use App\Dto\PaginationDto;
use App\Entity\Tweet;
use App\Repository\TweetRepository;
use App\Repository\UserRepository;
use App\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/tweets')]
class TweetController extends AbstractController
{
    #[Route('/explore', name: 'api_tweet_explore', methods: ['GET'])]
    public function explore(#[MapQueryString] PaginationDto $pagination, TweetRepository $tweetRepository): JsonResponse
    {
        $tweets = $tweetRepository->findAllWithUserPage($pagination->limit + 1, $pagination->offset);
        $hasMore = count($tweets) > $pagination->limit;

        if ($hasMore) {
            $tweets = array_slice($tweets, 0, $pagination->limit);
        }

        // Shuffle the tweets for a randomized explore experience
        shuffle($tweets);

        return $this->json([
            'data' => array_map(fn(Tweet $tweet): array => $this->toArray($tweet), $tweets),
            'has_more' => $hasMore,
            'limit' => $pagination->limit,
            'offset' => $pagination->offset,
        ]);
    }

    #[Route('/feed', name: 'api_tweet_feed', methods: ['GET'])]
    public function feed(#[MapQueryString] PaginationDto $pagination, TweetRepository $tweetRepository, UserRepository $userRepository): JsonResponse
    {
        $authUser = $this->getUser();
        if (!$authUser instanceof \App\Entity\User) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $currentUser = $userRepository->findOneBy(['email' => $authUser->getEmail()]);
        if (!$currentUser) {
            return $this->json(['error' => 'Utilisateur introuvable'], 401);
        }

        $tweets = $tweetRepository->findFeedForUser($currentUser, $pagination->limit + 1, $pagination->offset);
        $hasMore = count($tweets) > $pagination->limit;

        if ($hasMore) {
            $tweets = array_slice($tweets, 0, $pagination->limit);
        }

        return $this->json([
            'data' => array_map(fn(Tweet $tweet): array => $this->toArray($tweet), $tweets),
            'has_more' => $hasMore,
            'limit' => $pagination->limit,
            'offset' => $pagination->offset,
        ]);
    }

    #[Route('/user/{userId}', name: 'api_tweet_user', methods: ['GET'])]
    public function userTweets(int $userId, #[MapQueryString] PaginationDto $pagination, TweetRepository $tweetRepository, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $tweets = $tweetRepository->findByUserWithPagination($user, $pagination->limit + 1, $pagination->offset);
        $hasMore = count($tweets) > $pagination->limit;

        if ($hasMore) {
            $tweets = array_slice($tweets, 0, $pagination->limit);
        }

        return $this->json([
            'data' => array_map(fn(Tweet $tweet): array => $this->toArray($tweet), $tweets),
            'has_more' => $hasMore,
            'limit' => $pagination->limit,
            'offset' => $pagination->offset,
        ]);
    }

    #[Route('', name: 'api_tweet_index', methods: ['GET'])]
    public function index(TweetRepository $tweetRepository): JsonResponse
    {
        $tweets = array_map(
            fn(Tweet $tweet): array => $this->toArray($tweet),
            $tweetRepository->findAllWithUser()
        );

        return $this->json($tweets);
    }

    #[Route('/{id}', name: 'api_tweet_show', methods: ['GET'])]
    public function show(?Tweet $tweet, TweetRepository $tweetRepository): JsonResponse
    {
        if (!$tweet) {
            return $this->json(['error' => 'Tweet introuvable'], 404);
        }

        // Reload with user relation to ensure it's loaded
        $tweet = $tweetRepository->findOneWithUser($tweet->getId());
        if (!$tweet) {
            return $this->json(['error' => 'Tweet introuvable'], 404);
        }

        return $this->json($this->toArray($tweet));
    }

    #[Route('', name: 'api_tweet_create', methods: ['POST'])]
    public function create(#[MapRequestPayload] TweetCreateDto $tweetDto, EntityManagerInterface $entityManager, TweetRepository $tweetRepository, UserRepository $userRepository, MediaRepository $mediaRepository): JsonResponse
    {
        // Verify user is authenticated
        $authUser = $this->getUser();
        if (!$authUser instanceof \App\Entity\User) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        // Reload user from database to ensure it's fully hydrated
        $currentUser = $userRepository->findOneBy(['email' => $authUser->getEmail()]);
        if (!$currentUser || !$currentUser->getId()) {
            return $this->json(['error' => 'Utilisateur non trouvé ou ID introuvable'], 401);
        }

        $tweet = (new Tweet())
            ->setUser($currentUser)  // Set the relation directly
            ->setUserId($currentUser->getId())  // Also set the foreign key
            ->setContent(trim($tweetDto->content))
            ->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($tweet);
        $entityManager->flush();

        // Associate media files with tweet
        if (count($tweetDto->mediaIds) > 0) {
            foreach ($tweetDto->mediaIds as $mediaId) {
                $media = $mediaRepository->find($mediaId);

                // Verify media exists and belongs to the current user
                if (!$media) {
                    return $this->json(['error' => sprintf('Media %d non trouvé', $mediaId)], 404);
                }

                if ($media->getUser()->getId() !== $currentUser->getId()) {
                    return $this->json(['error' => 'Media n\'appartient pas à l\'utilisateur'], 403);
                }

                // Link media to tweet
                $tweet->addMedia($media);
                $media->setTweet($tweet);
            }

            $entityManager->flush();
        }

        // Reload with user relation
        $tweet = $tweetRepository->findOneWithUser($tweet->getId());

        return $this->json($this->toArray($tweet), 201);
    }

    #[Route('/{id}', name: 'api_tweet_update', methods: ['PUT'])]
    public function update(?Tweet $tweet, #[MapRequestPayload] TweetUpdateDto $tweetDto, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$tweet) {
            return $this->json(['error' => 'Tweet introuvable'], 404);
        }

        // Verify authorization
        $currentUser = $this->getUser();
        if (!$currentUser instanceof \App\Entity\User || $currentUser->getId() !== $tweet->getUserId()) {
            return $this->json(['error' => 'Vous ne pouvez modifier que vos propres tweets'], 403);
        }

        $tweet->setContent(trim($tweetDto->content));
        $entityManager->flush();

        return $this->json($this->toArray($tweet));
    }

    #[Route('/{id}', name: 'api_tweet_delete', methods: ['DELETE'])]
    public function delete(?Tweet $tweet, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$tweet) {
            return $this->json(['error' => 'Tweet introuvable'], 404);
        }

        // Verify authorization
        $currentUser = $this->getUser();
        if (!$currentUser instanceof \App\Entity\User || $currentUser->getId() !== $tweet->getUserId()) {
            return $this->json(['error' => 'Vous ne pouvez supprimer que vos propres tweets'], 403);
        }

        $entityManager->remove($tweet);
        $entityManager->flush();

        return $this->json(null, 204);
    }

    private function toArray(Tweet $tweet): array
    {
        $user = $tweet->getUser();
        $likes = $tweet->getLiked() ?? [];
        $media = $tweet->getMedia();

        $mediaArray = [];
        if ($media && count($media) > 0) {
            foreach ($media as $m) {
                $mediaArray[] = [
                    'id' => $m->getId(),
                    'media_type' => $m->getMediaType(),
                    'file_url' => $m->getUrl(),
                    'file_size' => $m->getFileSize(),
                ];
            }
        }

        return [
            'id' => $tweet->getId(),
            'user_id' => $tweet->getUserId(),
            'author' => $user ? [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'avatar_url' => $user->getAvatarUrl(),
                'is_blocked' => $user->isBlocked(),
            ] : null,
            'user' => $user ? [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'avatar_url' => $user->getAvatarUrl(),
                'is_blocked' => $user->isBlocked(),
            ] : null,
            'content' => $tweet->getContent(),
            'created_at' => $tweet->getCreatedAt()?->format(DATE_ATOM),
            'likes' => count($likes),
            'media' => $mediaArray,
        ];
    }
}
