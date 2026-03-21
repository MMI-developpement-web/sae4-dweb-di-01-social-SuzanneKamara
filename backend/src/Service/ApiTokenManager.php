<?php

namespace App\Service;

use App\Entity\ApiToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;

class ApiTokenManager
{
    public function __construct(
        private EntityManagerInterface $em
    ) {}

    public function generateTokenForUser(User $user): string
    {
        $userId = $user->getId();
        if (!$userId) {
            throw new \LogicException('Cannot generate a token for a user without ID.');
        }

        // Générer un token brut
        $rawToken = bin2hex(random_bytes(32));

        // Hacher le token
        $hashedToken = hash('sha256', $rawToken);

        // Rechercher par user_id pour éviter les problèmes d'entité détachée.
        $token = $this->em->getRepository(ApiToken::class)
            ->createQueryBuilder('t')
            ->andWhere('IDENTITY(t.user) = :userId')
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getOneOrNullResult();

        if ($token instanceof ApiToken) {
            $token->setToken($hashedToken);
            $token->setCreatedAt(new \DateTimeImmutable());
        } else {
            $token = new ApiToken($user, $hashedToken);
            $this->em->persist($token);
        }

        $this->em->flush();

        // Retourner le token brut au front
        return $rawToken;
    }
}
