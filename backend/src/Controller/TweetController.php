<?php

namespace App\Controller;

use App\Entity\Tweet;
use App\Repository\TweetRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/tweets')]
class TweetController extends AbstractController
{
    #[Route('/explore', name: 'api_tweet_explore', methods: ['GET'])]
    public function explore(Request $request, TweetRepository $tweetRepository): JsonResponse
    {
        $limit = max(1, min(100, (int) $request->query->get('limit', 40)));
        $offset = max(0, (int) $request->query->get('offset', 0));

        $tweets = $tweetRepository->findAllWithUserPage($limit + 1, $offset);
        $hasMore = count($tweets) > $limit;

        if ($hasMore) {
            $tweets = array_slice($tweets, 0, $limit);
        }

        return $this->json([
            'data' => array_map(fn(Tweet $tweet): array => $this->toArray($tweet), $tweets),
            'has_more' => $hasMore,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    #[Route('/feed', name: 'api_tweet_feed', methods: ['GET'])]
    public function feed(Request $request, TweetRepository $tweetRepository, UserRepository $userRepository): JsonResponse
    {
        $authUser = $this->getUser();
        if (!$authUser instanceof \App\Entity\User) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $currentUser = $userRepository->findOneBy(['email' => $authUser->getEmail()]);
        if (!$currentUser) {
            return $this->json(['error' => 'Utilisateur introuvable'], 401);
        }

        $limit = max(1, min(100, (int) $request->query->get('limit', 40)));
        $offset = max(0, (int) $request->query->get('offset', 0));

        $tweets = $tweetRepository->findFeedForUser($currentUser, $limit + 1, $offset);
        $hasMore = count($tweets) > $limit;

        if ($hasMore) {
            $tweets = array_slice($tweets, 0, $limit);
        }

        return $this->json([
            'data' => array_map(fn(Tweet $tweet): array => $this->toArray($tweet), $tweets),
            'has_more' => $hasMore,
            'limit' => $limit,
            'offset' => $offset,
        ]);
    }

    #[Route('/user/{userId}', name: 'api_tweet_user', methods: ['GET'])]
    public function userTweets(int $userId, Request $request, TweetRepository $tweetRepository, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($userId);
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        $limit = max(1, min(100, (int) $request->query->get('limit', 40)));
        $offset = max(0, (int) $request->query->get('offset', 0));

        $tweets = $tweetRepository->findByUserWithPagination($user, $limit + 1, $offset);
        $hasMore = count($tweets) > $limit;

        if ($hasMore) {
            $tweets = array_slice($tweets, 0, $limit);
        }

        return $this->json([
            'data' => array_map(fn(Tweet $tweet): array => $this->toArray($tweet), $tweets),
            'has_more' => $hasMore,
            'limit' => $limit,
            'offset' => $offset,
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
    public function create(Request $request, EntityManagerInterface $entityManager, TweetRepository $tweetRepository, UserRepository $userRepository): JsonResponse
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

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $content = $data['content'] ?? null;

        if (!is_string($content) || trim($content) === '') {
            return $this->json(['error' => 'Le champ content est requis'], 400);
        }

        if (mb_strlen($content) > 280) {
            return $this->json(['error' => 'Le contenu ne doit pas depasser 280 caracteres'], 400);
        }

        $tweet = (new Tweet())
            ->setUser($currentUser)  // Set the relation directly
            ->setUserId($currentUser->getId())  // Also set the foreign key
            ->setContent(trim($content))
            ->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($tweet);
        $entityManager->flush();

        // Reload with user relation
        $tweet = $tweetRepository->findOneWithUser($tweet->getId());

        return $this->json($this->toArray($tweet), 201);
    }

    #[Route('/{id}', name: 'api_tweet_update', methods: ['PUT'])]
    public function update(?Tweet $tweet, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$tweet) {
            return $this->json(['error' => 'Tweet introuvable'], 404);
        }

        // Verify authorization
        $currentUser = $this->getUser();
        if (!$currentUser instanceof \App\Entity\User || $currentUser->getId() !== $tweet->getUserId()) {
            return $this->json(['error' => 'Vous ne pouvez modifier que vos propres tweets'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        if (array_key_exists('content', $data)) {
            if (!is_string($data['content']) || trim($data['content']) === '') {
                return $this->json(['error' => 'Le champ content doit etre une chaine non vide'], 400);
            }

            if (mb_strlen($data['content']) > 280) {
                return $this->json(['error' => 'Le contenu ne doit pas depasser 280 caracteres'], 400);
            }

            $tweet->setContent(trim($data['content']));
        }

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

        return [
            'id' => $tweet->getId(),
            'user_id' => $tweet->getUserId(),
            'user' => $user ? [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'avatar_url' => $user->getAvatarUrl(),
            ] : null,
            'content' => $tweet->getContent(),
            'created_at' => $tweet->getCreatedAt()?->format(DATE_ATOM),
            'likes' => count($likes),
        ];
    }
}
