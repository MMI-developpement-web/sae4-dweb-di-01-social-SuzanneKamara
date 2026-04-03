<?php

namespace App\Controller;

use App\Dto\UserRegisterDto;
use App\Dto\UserUpdateDto;
use App\Dto\UserSearchDto;
use App\Entity\User;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\HttpKernel\Attribute\MapQueryString;
use Symfony\Component\HttpKernel\Attribute\MapRequestPayload;
use Psr\Log\LoggerInterface;

#[Route('/api/users')]
class UserController extends AbstractController
{
    #[Route('', name: 'api_user_index', methods: ['GET'])]
    public function index(#[MapQueryString] UserSearchDto $searchDto, UserRepository $userRepository): JsonResponse
    {
        if ($searchDto->email) {
            $user = $userRepository->findOneBy(['email' => $searchDto->email]);

            if (!$user) {
                return $this->json([]);
            }

            return $this->json([$this->toArray($user)]);
        }

        $users = array_map(
            fn(User $user): array => $this->toArray($user),
            $userRepository->findAll()
        );

        return $this->json($users);
    }

    #[Route('/me', name: 'api_user_me', methods: ['GET'])]
    public function me(): JsonResponse
    {
        $user = $this->getUser();
        if (!$user instanceof \App\Entity\User) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        return $this->json($this->toArray($user));
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
        #[MapRequestPayload] UserRegisterDto $userDto,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher,
        MailerInterface $mailer,
        UrlGeneratorInterface $urlGenerator,
        LoggerInterface $logger
    ): JsonResponse {
        $email = mb_strtolower(trim($userDto->email));

        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->json(['error' => 'Un utilisateur avec cet email existe deja'], 409);
        }

        if ($userRepository->findOneBy(['username' => $userDto->username])) {
            return $this->json(['error' => 'Ce nom d\'utilisateur est deja utilise'], 409);
        }

        $user = (new User())
            ->setUsername($userDto->username)
            ->setEmail($email)
            // Registration endpoint should not accept privileged roles from client input.
            ->setRoles(['ROLE_USER'])
            ->setIsVerified(false);

        $user->setPassword($passwordHasher->hashPassword($user, $userDto->password));
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

    #[Route('/{id}', name: 'api_user_update', methods: ['PUT'])]
    public function update(
        ?User $user,
        #[MapRequestPayload] UserUpdateDto $userDto,
        EntityManagerInterface $entityManager
    ): JsonResponse {
        if (!$user) {
            return $this->json(['error' => 'Utilisateur introuvable'], 404);
        }

        // Check authentication and authorization
        $currentUser = $this->getUser();
        if (!$currentUser instanceof \App\Entity\User) {
            return $this->json(['error' => 'Authentification requise'], 401);
        }

        // User can only edit their own profile
        if ($currentUser->getId() !== $user->getId()) {
            return $this->json(['error' => 'Vous n\'êtes pas autorisé à modifier ce profil'], 403);
        }

        // Update all fields from DTO
        if ($userDto->bio !== null) {
            $user->setBio($userDto->bio === '' ? null : $userDto->bio);
        }

        if ($userDto->location !== null) {
            $user->setLocation($userDto->location === '' ? null : $userDto->location);
        }

        if ($userDto->website_url !== null) {
            $user->setWebsiteUrl($userDto->website_url === '' ? null : $userDto->website_url);
        }

        if ($userDto->avatar_url !== null) {
            $user->setAvatarUrl($userDto->avatar_url === '' ? null : $userDto->avatar_url);
        }

        if ($userDto->banner_url !== null) {
            $user->setBannerUrl($userDto->banner_url === '' ? null : $userDto->banner_url);
        }

        // Persist changes
        $entityManager->flush();

        return $this->json($this->toArray($user), 200);
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
            'is_blocked' => $user->isBlocked(),
        ];
    }
}
