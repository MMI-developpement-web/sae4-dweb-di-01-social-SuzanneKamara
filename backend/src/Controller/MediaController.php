<?php

namespace App\Controller;

use App\Entity\Media;
use App\Repository\MediaRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/media')]
class MediaController extends AbstractController
{
    #[Route('', name: 'api_media_index', methods: ['GET'])]
    public function index(MediaRepository $mediaRepository): JsonResponse
    {
        $mediaList = array_map(
            fn (Media $media): array => $this->toArray($media),
            $mediaRepository->findAll()
        );

        return $this->json($mediaList);
    }

    #[Route('/{id}', name: 'api_media_show', methods: ['GET'])]
    public function show(?Media $media): JsonResponse
    {
        if (!$media) {
            return $this->json(['error' => 'Media introuvable'], 404);
        }

        return $this->json($this->toArray($media));
    }

    #[Route('', name: 'api_media_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $tweetId = $data['tweet_id'] ?? null;
        $fileUrl = $data['file_url'] ?? null;
        $mediaType = $data['media_type'] ?? null;

        if (!is_int($tweetId)) {
            return $this->json(['error' => 'Le champ tweet_id est requis (int)'], 400);
        }
        if (!is_string($fileUrl) || trim($fileUrl) === '') {
            return $this->json(['error' => 'Le champ file_url est requis'], 400);
        }
        if (!is_string($mediaType) || trim($mediaType) === '') {
            return $this->json(['error' => 'Le champ media_type est requis'], 400);
        }

        $media = (new Media())
            ->setTweetId($tweetId)
            ->setFileUrl(trim($fileUrl))
            ->setMediaType(trim($mediaType));

        $entityManager->persist($media);
        $entityManager->flush();

        return $this->json($this->toArray($media), 201);
    }

    #[Route('/{id}', name: 'api_media_update', methods: ['PUT'])]
    public function update(?Media $media, Request $request, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$media) {
            return $this->json(['error' => 'Media introuvable'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        if (array_key_exists('tweet_id', $data)) {
            if (!is_int($data['tweet_id'])) {
                return $this->json(['error' => 'Le champ tweet_id doit etre un entier'], 400);
            }
            $media->setTweetId($data['tweet_id']);
        }

        if (array_key_exists('file_url', $data)) {
            if (!is_string($data['file_url']) || trim($data['file_url']) === '') {
                return $this->json(['error' => 'Le champ file_url doit etre une chaine non vide'], 400);
            }
            $media->setFileUrl(trim($data['file_url']));
        }

        if (array_key_exists('media_type', $data)) {
            if (!is_string($data['media_type']) || trim($data['media_type']) === '') {
                return $this->json(['error' => 'Le champ media_type doit etre une chaine non vide'], 400);
            }
            $media->setMediaType(trim($data['media_type']));
        }

        $entityManager->flush();

        return $this->json($this->toArray($media));
    }

    #[Route('/{id}', name: 'api_media_delete', methods: ['DELETE'])]
    public function delete(?Media $media, EntityManagerInterface $entityManager): JsonResponse
    {
        if (!$media) {
            return $this->json(['error' => 'Media introuvable'], 404);
        }

        $entityManager->remove($media);
        $entityManager->flush();

        return $this->json(null, 204);
    }

    private function toArray(Media $media): array
    {
        return [
            'id' => $media->getId(),
            'tweet_id' => $media->getTweetId(),
            'file_url' => $media->getFileUrl(),
            'media_type' => $media->getMediaType(),
        ];
    }
}
