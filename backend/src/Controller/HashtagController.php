<?php

namespace App\Controller;

use App\Entity\Hashtag;
use App\Repository\HashtagRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/hashtags')]
class HashtagController extends AbstractController
{
    #[Route('', name: 'api_hashtag_index', methods: ['GET'])]
    public function index(HashtagRepository $hashtagRepository): JsonResponse
    {
        $hashtags = array_map(
            fn (Hashtag $hashtag): array => $this->toArray($hashtag),
            $hashtagRepository->findAll()
        );

        return $this->json($hashtags);
    }

    #[Route('/{id}', name: 'api_hashtag_show', methods: ['GET'])]
    public function show(?Hashtag $hashtag): JsonResponse
    {
        if (!$hashtag) {
            return $this->json(['error' => 'Hashtag introuvable'], 404);
        }

        return $this->json($this->toArray($hashtag));
    }

    #[Route('', name: 'api_hashtag_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $name = $data['name'] ?? null;
        if (!is_string($name) || trim($name) === '') {
            return $this->json(['error' => 'Le champ name est requis'], 400);
        }

        $hashtag = (new Hashtag())->setName(trim($name));
        $entityManager->persist($hashtag);
        $entityManager->flush();

        return $this->json($this->toArray($hashtag), 201);
    }

    #[Route('/{id}', name: 'api_hashtag_update', methods: ['PUT'])]
    public function update(?Hashtag $hashtag, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$hashtag) {
            return $this->json(['error' => 'Hashtag introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $name = $data['name'] ?? null;
        if (!is_string($name) || trim($name) === '') {
            return $this->json(['error' => 'Le champ name est requis'], 400);
        }

        $hashtag->setName(trim($name));
        $entityManager->flush();

        return $this->json($this->toArray($hashtag));
    }

    #[Route('/{id}', name: 'api_hashtag_delete', methods: ['DELETE'])]
    public function delete(?Hashtag $hashtag, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$hashtag) {
            return $this->json(['error' => 'Hashtag introuvable'], 404);
        }

        $entityManager->remove($hashtag);
        $entityManager->flush();

        return $this->json(null, 204);
    }

    private function toArray(Hashtag $hashtag): array
    {
        return [
            'id' => $hashtag->getId(),
            'name' => $hashtag->getName(),
        ];
    }
}