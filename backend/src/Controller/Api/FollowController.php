<?php

namespace App\Controller\Api;

use App\Dto\FollowCreateDto;
use App\Entity\FolowingFollower;
use App\Entity\User;
use App\Repository\FolowingFollowerRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/follows')]
class FollowController extends AbstractController
{
    #[Route('', name: 'follow_index', methods: ['GET'])]
    public function index(Request $request, FolowingFollowerRepository $repo): JsonResponse
    {
        $followerId = $request->query->get('follower_id');
        $followingId = $request->query->get('following_id');

        $query = [];
        if ($followerId) {
            $query['follower'] = (int)$followerId;
        }
        if ($followingId) {
            $query['following'] = (int)$followingId;
        }

        if (empty($query)) {
            // Return all follows with pagination
            $follows = $repo->findAll();
        } else {
            // Return filtered follows
            $follows = $repo->findBy($query);
        }

        $data = array_map(
            fn(FolowingFollower $f): array => $this->toArray($f),
            $follows
        );

        return $this->json([
            'data' => $data,
            'count' => count($data),
        ]);
    }

    #[Route('/{id}', name: 'follow_show', methods: ['GET'])]
    public function show(?FolowingFollower $follow): JsonResponse
    {
        if (!$follow) {
            return $this->json(['error' => 'Relation introuvable'], 404);
        }

        return $this->json($this->toArray($follow));
    }

    #[Route('', name: 'follow_create', methods: ['POST'])]
    public function create(
        #[MapRequestPayload] FollowCreateDto $followDto,
        EntityManagerInterface $em,
        UserRepository $userRepository,
        FolowingFollowerRepository $followRepo
    ): JsonResponse {
        $currentUser = $this->getUser();
        if (!$currentUser instanceof User) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        if ($currentUser->getId() === $followDto->following_id) {
            return $this->json(['error' => 'On ne peut pas s\'abonner à soi-même'], 400);
        }

        $following = $userRepository->find($followDto->following_id);

        if (!$following) {
            return $this->json(['error' => 'Utilisateur à suivre introuvable'], 404);
        }

        // Check if already following
        $existing = $followRepo->findOneBy([
            'follower' => $currentUser,
            'following' => $following
        ]);

        if ($existing) {
            return $this->json(['error' => 'Déjà abonné'], 409);
        }

        $follow = new FolowingFollower();
        $follow->setFollower($currentUser);
        $follow->setFollowing($following);
        $follow->setCreatedAt(new \DateTimeImmutable());

        $em->persist($follow);
        $em->flush();

        return $this->json($this->toArray($follow), 201);
    }

    #[Route('/{id}', name: 'follow_delete', methods: ['DELETE'])]
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
