<?php

namespace App\Controller;

use App\Entity\Like;
use App\Repository\LikeRepository;
use App\Repository\TweetRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api/likes')]
class LikeController extends AbstractController
{
    #[Route('', name: 'api_like_index', methods: ['GET'])]
    public function index(Request $request, LikeRepository $likeRepository, UserRepository $userRepository, TweetRepository $tweetRepository): JsonResponse
    {
        $userId = $request->query->get('user_id');
        $tweetId = $request->query->get('tweet_id');

        // Filter by user_id and/or tweet_id
        $criteria = [];
        if ($userId) {
            $user = $userRepository->find($userId);
            if (!$user) {
                return $this->json(['error' => 'User not found'], 404);
            }
            $criteria['user'] = $user;
        }

        if ($tweetId) {
            $tweet = $tweetRepository->find($tweetId);
            if (!$tweet) {
                return $this->json(['error' => 'Tweet not found'], 404);
            }
            $criteria['tweet'] = $tweet;
        }

        $likes = $likeRepository->findBy($criteria);

        return $this->json([
            'data' => array_map(
                fn(Like $like): array => $this->toArray($like),
                $likes
            ),
            'count' => count($likes),
        ]);
    }

    #[Route('/{id}', name: 'api_like_show', methods: ['GET'])]
    public function show(?Like $like): JsonResponse
    {
        if (!$like) {
            return $this->json(['error' => 'Like introuvable'], 404);
        }

        return $this->json($this->toArray($like));
    }

    #[Route('', name: 'api_like_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $entityManager,
        TweetRepository $tweetRepository
    ): JsonResponse {
        // Vérifier que l'utilisateur est authentifié
        $user = $this->getUser();
        if (!$user) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        $data = json_decode($request->getContent(), true);

        // Validation des données entrantes
        if (!isset($data['tweet_id'])) {
            return $this->json(['error' => 'tweet_id est requis'], 400);
        }

        $tweet = $tweetRepository->find($data['tweet_id']);
        if (!$tweet) {
            return $this->json(['error' => 'Tweet introuvable'], 404);
        }

        // Création du Like
        $like = new Like();
        $like->setUser($user);
        $like->setTweet($tweet);
        $like->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($like);
        $entityManager->flush();

        return $this->json($this->toArray($like), 201);
    }

    #[Route('/{id}', name: 'api_like_delete', methods: ['DELETE'])]
    public function delete(?Like $like, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$like) {
            return $this->json(['error' => 'Like introuvable'], 404);
        }

        $entityManager->remove($like);
        $entityManager->flush();

        return $this->json(null, 204);
    }

    /**
     * Transforme l'entité en tableau pour le JSON
     */
    private function toArray(Like $like): array
    {
        return [
            'id' => $like->getId(),
            'created_at' => $like->getCreatedAt()?->format(DATE_ATOM),
            'user' => [
                'id' => $like->getUser()?->getId(),
                'username' => $like->getUser()?->getUsername(),
            ],
            'tweet' => [
                'id' => $like->getTweet()?->getId(),
                'content' => $like->getTweet()?->getContent(),
            ],
        ];
    }
}
