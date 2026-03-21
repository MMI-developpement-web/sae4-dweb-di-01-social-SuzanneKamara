<?php

namespace App\Controller;

use App\Entity\Like;
use App\Repository\LikeRepository;
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
            fn (Like $like): array => $this->toArray($like),
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
    public function create(EntityManagerInterface $entityManager): JsonResponse
    {
        $like = (new Like())->setCreatedAt(new \DateTimeImmutable());

        $entityManager->persist($like);
        $entityManager->flush();

        return $this->json($this->toArray($like), 201);
    }

    #[Route('/{id}', name: 'api_like_update', methods: ['PUT'])]
    public function update(?Like $like, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$like) {
            return $this->json(['error' => 'Like introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        if (array_key_exists('created_at', $data)) {
            if (!is_string($data['created_at']) || trim($data['created_at']) === '') {
                return $this->json(['error' => 'Le champ created_at doit etre une date ISO8601'], 400);
            }

            try {
                $like->setCreatedAt(new \DateTimeImmutable($data['created_at']));
            } catch (\Exception) {
                return $this->json(['error' => 'Le champ created_at est invalide'], 400);
            }
        }

        $entityManager->flush();

        return $this->json($this->toArray($like));
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

    private function toArray(Like $like): array
    {
        return [
            'id' => $like->getId(),
            'created_at' => $like->getCreatedAt()?->format(DATE_ATOM),
        ];
    }
}
