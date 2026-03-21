<?php

namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Psr\Log\LoggerInterface;

#[Route('/api/users')]
class UserController extends AbstractController
{
    #[Route('', name: 'api_user_index', methods: ['GET'])]
    public function index(Request $request, UserRepository $userRepository): JsonResponse
    {
        $email = $request->query->get('email');

        if (is_string($email) && trim($email) !== '') {
            $user = $userRepository->findOneBy(['email' => trim($email)]);

            if (!$user) {
                return $this->json([]);
            }

            return $this->json([$this->toArray($user)]);
        }

        $users = array_map(
            fn (User $user): array => $this->toArray($user),
            $userRepository->findAll()
        );

        return $this->json($users);
    }

    #[Route('/{id}', name: 'api_user_show', methods: ['GET'])]
    public function show(?User $user): JsonResponse
    {
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        return $this->json($this->toArray($user));
    }

    #[Route('', name: 'api_user_create', methods: ['POST'])]
    public function create(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
        LoggerInterface $logger
    ): JsonResponse {
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->json(['error' => 'JSON invalide'], 400);
        }

        $username = $data['username'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        if (!is_string($username) || trim($username) === '') {
            return $this->json(['error' => 'Le champ username est requis'], 400);
        }
        if (!is_string($email) || trim($email) === '') {
            return $this->json(['error' => 'Le champ email est requis'], 400);
        }
        if (!is_string($password) || trim($password) === '') {
            return $this->json(['error' => 'Le champ password est requis'], 400);
        }

        $username = trim($username);
        $email = mb_strtolower(trim($email));
        $password = trim($password);

        if (mb_strlen($username) < 3) {
            return $this->json(['error' => 'Le username doit contenir au moins 3 caracteres'], 400);
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->json(['error' => 'Le format de l\'email est invalide'], 400);
        }

        if (mb_strlen($password) < 8) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins 8 caracteres'], 400);
        }

        if (!preg_match('/[A-Z]/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins une majuscule'], 400);
        }

        if (!preg_match('/[a-z]/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins une minuscule'], 400);
        }

        if (!preg_match('/\d/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins un chiffre'], 400);
        }

        if (!preg_match('/[^a-zA-Z0-9]/', $password)) {
            return $this->json(['error' => 'Le mot de passe doit contenir au moins un caractere special'], 400);
        }

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'Un utilisateur avec cet email existe deja'], 409);
        }

        if ($userRepository->findOneBy(['username' => $username])) {
            return $this->json(['error' => 'Ce nom d\'utilisateur est deja utilise'], 409);
        }

        $user = (new User())
            ->setUsername($username)
            ->setEmail($email)
            // Registration endpoint should not accept privileged roles from client input.
            ->setRoles(['ROLE_USER'])
            ->setIsVerified(false)
            ->setBio(isset($data['bio']) && is_string($data['bio']) ? $data['bio'] : null)
            ->setAvatarUrl(isset($data['avatar_url']) && is_string($data['avatar_url']) ? $data['avatar_url'] : null)
            ->setBannerUrl(isset($data['banner_url']) && is_string($data['banner_url']) ? $data['banner_url'] : null)
            ->setLocation(isset($data['location']) && is_string($data['location']) ? $data['location'] : null)
            ->setWebsiteUrl(isset($data['website_url']) && is_string($data['website_url']) ? $data['website_url'] : null);

        $user->setPassword($passwordHasher->hashPassword($user, $password));
        $verificationToken = bin2hex(random_bytes(32));
        $user
            ->setEmailVerificationToken($verificationToken)
            ->setEmailVerificationExpiresAt(new \DateTimeImmutable('+24 hours'));

        $entityManager->persist($user);
        $entityManager->flush();

        $verificationUrl = $urlGenerator->generate(
            'api_verify_email',
            ['token' => $verificationToken],
            UrlGeneratorInterface::ABSOLUTE_URL
        );

        $fromAddress = $_ENV['MAILER_FROM'] ?? 'no-reply@social.local';

        $message = (new Email())
            ->from($fromAddress)
            ->to($user->getEmail())
            ->subject('Confirmez votre adresse email')
            ->text("Bonjour {$user->getUsername()},\n\nConfirmez votre email en ouvrant ce lien :\n{$verificationUrl}\n\nCe lien expire dans 24 heures.");

        $mailDeliveryFailed = false;
        $mailError = null;
        try {
            $mailer->send($message);
        } catch (\Throwable $exception) {
            $mailDeliveryFailed = true;
            $mailError = $exception->getMessage();

            $logger->error('Verification email delivery failed.', [
                'email' => $user->getEmail(),
                'error' => $mailError,
            ]);
        }

        $response = $this->toArray($user);
        if ($mailDeliveryFailed) {
            $response['warning'] = 'Compte cree, mais email de confirmation non envoye pour le moment.';
            if (($_ENV['APP_ENV'] ?? 'prod') !== 'prod' && $mailError) {
                $response['mail_error'] = $mailError;
            }
        }

        return $this->json($response, 201);
    }

    private function toArray(User $user): array
    {
        return [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'email' => $user->getEmail(),
            'bio' => $user->getBio(),
            'avatar_url' => $user->getAvatarUrl(),
            'banner_url' => $user->getBannerUrl(),
            'location' => $user->getLocation(),
            'website_url' => $user->getWebsiteUrl(),
            'is_verified' => $user->isVerified(),
        ];
    }
}