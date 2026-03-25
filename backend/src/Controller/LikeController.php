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

#[Route('/likes')]
class LikeController extends AbstractController
{
    #[Route('', name: 'api_like_index', methods: ['GET'])]
    public function index(LikeRepository $likeRepository): JsonResponse
    {
        $likes = array_map(
            fn(Like $like): array => $this->toArray($like),
            $likeRepository->findAll()
        );

        return $this->json($likes);
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
        UserRepository $userRepository,
        TweetRepository $tweetRepository
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        // Validation des données entrantes
        if (!isset($data['user_id']) || !isset($data['tweet_id'])) {
            return $this->json(['error' => 'user_id et tweet_id sont requis'], 400);
        }

        $user = $userRepository->find($data['user_id']);
        $tweet = $tweetRepository->find($data['tweet_id']);

        if (!$user || !$tweet) {
            return $this->json(['error' => 'Utilisateur ou Tweet introuvable'], 404);
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
