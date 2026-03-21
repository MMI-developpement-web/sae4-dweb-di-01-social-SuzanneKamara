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
            return $this->json(['error' => 'Invalid credentials.'], 401);
        }

        // Génère un token, l’enregistre en base, retourne le token brut
        $rawToken = $tokenManager->generateTokenForUser($user);

        return $this->json([
            'token' => $rawToken
        ]);
    }
}