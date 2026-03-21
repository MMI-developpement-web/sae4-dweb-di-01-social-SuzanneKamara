<?php
namespace App\Security;

use App\Repository\ApiTokenRepository;
use Symfony\Component\Security\Core\Exception\BadCredentialsException;
use Symfony\Component\Security\Http\AccessToken\AccessTokenHandlerInterface;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;

class AccessTokenHandler implements AccessTokenHandlerInterface
{
    public function __construct(
        private ApiTokenRepository $repository
    ) {
    }

    public function getUserBadgeFrom(string $accessToken): UserBadge
    {
        $hashedToken = hash('sha256', $accessToken);

        $apiToken = $this->repository->findOneBy(['token' => $hashedToken]);
        if (null === $apiToken) {
            throw new BadCredentialsException('Invalid credentials.');
        }

        $user = $apiToken->getUser();
        if (null === $user) {
            throw new BadCredentialsException('Invalid credentials.');
        }

        if (!$user->isVerified()) {
            throw new BadCredentialsException('Email not verified.');
        }

        return new UserBadge($user->getUserIdentifier());
    }
}