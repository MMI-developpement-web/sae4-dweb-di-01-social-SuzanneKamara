<?php

namespace App\Security;

use App\Repository\ApiTokenRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class ApiTokenAuthenticator extends AbstractAuthenticator
{
    public function __construct(
        private ApiTokenRepository $tokenRepository
    ) {}

    public function supports(Request $request): ?bool
    {
        // Ne pas activer sur la route de login
        if ($request->attributes->get('_route') === 'api_login_check') {
            return false;
        }

        return $request->headers->has('Authorization');
    }

    public function authenticate(Request $request): Passport
    {
        $authHeader = $request->headers->get('Authorization');

        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            throw new AuthenticationException('Missing or invalid Authorization header');
        }

        $rawToken = substr($authHeader, 7);
        $hashedToken = hash('sha256', $rawToken);

        // Chercher le token hashé en base
        $apiToken = $this->tokenRepository->findOneBy(['token' => $hashedToken]);

        if (!$apiToken) {
            throw new AuthenticationException('Invalid API token');
        }

        $user = $apiToken->getUser();
        if (!$user) {
            throw new AuthenticationException('User not found');
        }

        if (!$user->isVerified()) {
            throw new AuthenticationException('Email not verified');
        }

        return new SelfValidatingPassport(
            new UserBadge($user->getUserIdentifier())
        );
    }

    public function onAuthenticationSuccess(Request $request, $token, string $firewallName): ?JsonResponse
    {
        return null;
    }

    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?JsonResponse
    {
        return new JsonResponse([
            'error' => 'Authentication failed',
            'message' => $exception->getMessage(),
        ], 401);
    }
}
