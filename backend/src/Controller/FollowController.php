<?php

namespace App\Controller;

use App\Entity\FolowingFollower;
use App\Repository\FolowingFollowerRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/follows')]
class FollowController extends AbstractController
{
    #[Route('', name: 'api_follow_index', methods: ['GET'])]
    public function index(FolowingFollowerRepository $repo): JsonResponse
    {
        $follows = array_map(
            fn(FolowingFollower $f): array => $this->toArray($f),
            $repo->findAll()
        );

        return $this->json($follows);
    }

    #[Route('/{id}', name: 'api_follow_show', methods: ['GET'])]
    public function show(?FolowingFollower $follow): JsonResponse
    {
        if (!$follow) {
            return $this->json(['error' => 'Relation introuvable'], 404);
        }

        return $this->json($this->toArray($follow));
    }

    #[Route('', name: 'api_follow_create', methods: ['POST'])]
    public function create(
        Request $request,
        EntityManagerInterface $em,
        UserRepository $userRepository,
        FolowingFollowerRepository $followRepo
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);

        $followerId = $data['follower_id'] ?? null;   // Celui qui s'abonne
        $followingId = $data['following_id'] ?? null; // Celui qui est suivi

        if (!$followerId || !$followingId) {
            return $this->json(['error' => 'follower_id et following_id requis'], 400);
        }

        if ($followerId === $followingId) {
            return $this->json(['error' => 'On ne peut pas s\'abonner à soi-même'], 400);
        }

        $follower = $userRepository->find($followerId);
        $following = $userRepository->find($followingId);

        if (!$follower || !$following) {
            return $this->json(['error' => 'Un des utilisateurs est introuvable'], 404);
        }

        // Vérifier si l'abonnement existe déjà
        $existing = $followRepo->findOneBy([
            'follower' => $follower,
            'following' => $following
        ]);

        if ($existing) {
            return $this->json(['error' => 'Déjà abonné'], 409);
        }

        $follow = new FolowingFollower();
        $follow->setFollower($follower);
        $follow->setFollowing($following);
        $follow->setCreatedAt(new \DateTimeImmutable());

        $em->persist($follow);
        $em->flush();

        return $this->json($this->toArray($follow), 201);
    }

    #[Route('/{id}', name: 'api_follow_delete', methods: ['DELETE'])]
    public function delete(?FolowingFollower $follow, EntityManagerInterface $em): JsonResponse
    {
        if (!$follow) {
            return $this->json(['error' => 'Relation introuvable'], 404);
        }

        $em->remove($follow);
        $em->flush();

        return $this->json(null, 204);
    }

    private function toArray(FolowingFollower $follow): array
    {
        return [
            'id' => $follow->getId(),
            'created_at' => $follow->getCreatedAt()?->format(DATE_ATOM),
            'follower' => [
                'id' => $follow->getFollower()?->getId(),
                'username' => $follow->getFollower()?->getUsername(),
            ],
            'following' => [
                'id' => $follow->getFollowing()?->getId(),
                'username' => $follow->getFollowing()?->getUsername(),
            ],
        ];
    }
}
