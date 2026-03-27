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
        // Générer un token brut
        $rawToken = bin2hex(random_bytes(32));

        // Hacher le token
        $hashedToken = hash('sha256', $rawToken);

        $userId = $user->getId();

        // Utiliser une requête SQL directe pour UPDATE ou INSERT
        $conn = $this->em->getConnection();
        
        // Vérifier si un token existe déjà
        $existingToken = $conn->fetchOne(
            'SELECT token FROM api_token WHERE user_id = ? LIMIT 1',
            [$userId],
            ['integer']
        );

        if ($existingToken) {
            // UPDATE - Garder le user_id unique
            $conn->executeStatement(
                'UPDATE api_token SET token = ?, created_at = NOW() WHERE user_id = ?',
                [$hashedToken, $userId],
                ['string', 'integer']
            );
        } else {
            // INSERT
            $conn->executeStatement(
                'INSERT INTO api_token (user_id, token, created_at) VALUES (?, ?, NOW())',
                [$userId, $hashedToken],
                ['integer', 'string']
            );
        }

        // Retourner le token brut au front
        return $rawToken;
    }
}
