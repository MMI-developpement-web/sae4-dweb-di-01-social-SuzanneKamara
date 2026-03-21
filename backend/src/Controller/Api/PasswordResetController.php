<?php

namespace App\Controller\Api;

use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Psr\Log\LoggerInterface;

#[Route('')]
class PasswordResetController extends AbstractController
{
    #[Route('/request-password-reset', name: 'request_password_reset', methods: ['POST'])]
    public function requestReset(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        MailerInterface $mailer,
        LoggerInterface $logger
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $email = $data['email'] ?? null;
        if (!is_string($email) || trim($email) === '') {
            return $this->json(['error' => 'Le champ email est requis'], 400);
        }

        $email = mb_strtolower(trim($email));

        $user = $userRepository->findOneBy(['email' => $email]);
        if (!$user) {
            // Pour des raisons de sécurité, on retourne le même message même si l'email n'existe pas
            return $this->json(['message' => 'Si cet email existe, un lien de reinitialisation a ete envoye.']);
        }

        // Générer un token de réinitialisation
        $resetToken = bin2hex(random_bytes(32));
        $user
            ->setPasswordResetToken($resetToken)
            ->setPasswordResetExpiresAt(new \DateTimeImmutable('+24 hours'));

        $entityManager->persist($user);
        $entityManager->flush();

        // Build a frontend URL so users can reset directly from the login page.
        $frontendUrl = $_ENV['FRONTEND_URL'] ?? 'http://localhost:8090';
        $resetUrl = rtrim($frontendUrl, '/') . '/login?token=' . urlencode($resetToken);

        $fromAddress = $_ENV['MAILER_FROM'] ?? 'no-reply@social.local';

        $message = (new Email())
            ->from($fromAddress)
            ->to($user->getEmail())
            ->subject('Reinitialisation de votre mot de passe')
            ->text("Bonjour {$user->getUsername()},\n\nCliquez sur ce lien pour reinitialiser votre mot de passe :\n{$resetUrl}\n\nCe lien expire dans 24 heures.\n\nSi vous n'avez pas demande cette reinitialisation, ignorez cet email.");

        try {
            $mailer->send($message);
        } catch (\Throwable $exception) {
            $logger->error('Password reset email delivery failed.', [
                'email' => $user->getEmail(),
                'error' => $exception->getMessage(),
            ]);
        }

        return $this->json(['message' => 'Si cet email existe, un lien de reinitialisation a ete envoye.']);
    }

    #[Route('/reset-password', name: 'reset_password_confirm', methods: ['POST'])]
    public function resetPassword(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $token = $data['token'] ?? null;
        $newPassword = $data['password'] ?? null;

        if (!is_string($token) || trim($token) === '') {
            return $this->json(['error' => 'Le token est requis'], 400);
        }

        if (!is_string($newPassword) || trim($newPassword) === '') {
            return $this->json(['error' => 'Le mot de passe est requis'], 400);
        }

        $token = trim($token);
        $newPassword = trim($newPassword);

        // Validation du mot de passe
        if (mb_strlen($newPassword) < 8) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 8 caracteres'], 400);
        }

        if (!preg_match('/[A-Z]/', $newPassword)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins une majuscule'], 400);
        }

        if (!preg_match('/[a-z]/', $newPassword)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins une minuscule'], 400);
        }

        if (!preg_match('/\d/', $newPassword)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins un chiffre'], 400);
        }

        if (!preg_match('/[^a-zA-Z0-9]/', $newPassword)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins un caractere special'], 400);
        }

        // Trouver l'utilisateur par le token
        $user = $userRepository->findOneBy(['password_reset_token' => $token]);
        if (!$user) {
            return $this->json(['error' => 'Token invalide.'], 400);
        }

        // Vérifier que le token n'a pas expiré
        $expiresAt = $user->getPasswordResetExpiresAt();
        if (!$expiresAt || $expiresAt < new \DateTimeImmutable()) {
            return $this->json(['error' => 'Le lien de reinitialisation a expire.'], 400);
        }

        // Mettre à jour le mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        // Nettoyer les champs de réinitialisation
        $user
            ->setPasswordResetToken(null)
            ->setPasswordResetExpiresAt(null);

        $entityManager->flush();

        return $this->json(['message' => 'Mot de passe reinitialise avec succes.']);
    }
}
