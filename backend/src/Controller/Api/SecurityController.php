<?php

namespace App\Controller\Api;

use App\Entity\User;
use App\Service\ApiTokenManager;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\CurrentUser;

class SecurityController extends AbstractController
{
    public function __construct(
        private ApiTokenManager $tokenManager
    ) {}

    #[Route('/login_check', name: 'login_check', methods: ['POST'], format: 'json')]
    public function login(
        #[CurrentUser] ?User $user,
        ApiTokenManager $tokenManager
    ): Response {
        if (!$user) {
            error_log("❌ LOGIN - Credentials invalides");
            return $this->json(['error' => 'Invalid credentials.'], 401);
        }

        error_log("✅ LOGIN - Utilisateur authentifié: {$user->getEmail()} (ID: {$user->getId()})");

        // Génère un token, l'enregistre en base, retourne le token brut
        $rawToken = $tokenManager->generateTokenForUser($user);

        error_log("✅ LOGIN - Token généré retourné au client");

        return $this->json([
            'token' => $rawToken
        ]);
    }
}
