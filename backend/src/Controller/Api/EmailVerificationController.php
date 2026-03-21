<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class EmailVerificationController extends AbstractController
{
    #[Route('/verify-email', name: 'verify_email', methods: ['GET'])]
    public function verify(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager
    ): Response {
        $token = $request->query->get('token');

        if (!is_string($token) || trim($token) === '') {
            return $this->json(['error' => 'Token manquant.'], 400);
        }

        $user = $userRepository->findOneBy(['email_verification_token' => $token]);
        if (!$user) {
            return $this->json(['error' => 'Token invalide.'], 400);
        }

        $expiresAt = $user->getEmailVerificationExpiresAt();
        if (!$expiresAt || $expiresAt < new \DateTimeImmutable()) {
            return $this->json(['error' => 'Le lien de verification a expire.'], 400);
        }

        $user
            ->setIsVerified(true)
            ->setEmailVerificationToken(null)
            ->setEmailVerificationExpiresAt(null);

        $entityManager->flush();

        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:8090';
        $loginUrl = sprintf(
            '%s/login?verified=1&email=%s',
            rtrim($frontendUrl, '/'),
            urlencode((string) $user->getEmail())
        );

        return new RedirectResponse($loginUrl);
    }
}
