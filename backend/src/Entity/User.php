<?php

namespace App\Entity;

use App\Repository\UserRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\Entity(repositoryClass: UserRepository::class)]
#[ORM\Table(name: 'user')]
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $username = null;

    #[ORM\Column(length: 255, unique: true)]
    private ?string $email = null;

    #[ORM\Column(name: 'password_hash', length: 255)]
    private ?string $password = null;

    #[ORM\Column(type: Types::JSON)]
    private array $roles = [];

    #[ORM\Column(type: Types::TEXT, nullable: true)]
    private ?string $bio = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $avatar_url = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $banner_url = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $location = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $website_url = null;

    /**
     * @var Collection<int, Tweet>
     */
    #[ORM\OneToMany(targetEntity: Tweet::class, mappedBy: 'user')]
    private Collection $tweet_id;

    #[ORM\OneToOne(mappedBy: 'user', cascade: ['persist', 'remove'])]
    private ?ApiToken $apiToken = null;

    #[ORM\Column]
    private bool $is_verified = true;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $email_verification_token = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $email_verification_expires_at = null;

    #[ORM\Column(length: 64, nullable: true)]
    private ?string $password_reset_token = null;

    #[ORM\Column(nullable: true)]
    private ?\DateTimeImmutable $password_reset_expires_at = null;

    /**
     * @var Collection<int, Like>
     */
    #[ORM\OneToMany(targetEntity: Like::class, mappedBy: 'user')]
    private Collection $liked;

    #[ORM\Column]
    private ?bool $isBlocked = null;

    public function __construct()
    {
        $this->tweet_id = new ArrayCollection();
        $this->liked = new ArrayCollection();
        $this->isBlocked = false;
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): static
    {
        $this->username = $username;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): static
    {
        $this->email = $email;

        return $this;
    }

    public function getUserIdentifier(): string
    {
        return $this->email ?? $this->username ?? '';
    }

    public function getPassword(): ?string
    {
        return $this->password;
    }

    public function setPassword(string $password): static
    {
        $this->password = $password;

        return $this;
    }

    public function getPasswordHash(): ?string
    {
        return $this->getPassword();
    }

    public function setPasswordHash(string $passwordHash): static
    {
        return $this->setPassword($passwordHash);
    }

    public function getRoles(): array
    {
        $roles = $this->roles;
        $roles[] = 'ROLE_USER';

        return array_values(array_unique($roles));
    }

    public function setRoles(array $roles): static
    {
        $this->roles = $roles;

        return $this;
    }

    public function eraseCredentials(): void {}

    public function getBio(): ?string
    {
        return $this->bio;
    }

    public function setBio(?string $bio): static
    {
        $this->bio = $bio;

        return $this;
    }

    public function getAvatarUrl(): ?string
    {
        return $this->avatar_url;
    }

    public function setAvatarUrl(?string $avatar_url): static
    {
        $this->avatar_url = $avatar_url;

        return $this;
    }

    public function getBannerUrl(): ?string
    {
        return $this->banner_url;
    }

    public function setBannerUrl(?string $banner_url): static
    {
        $this->banner_url = $banner_url;

        return $this;
    }

    public function getLocation(): ?string
    {
        return $this->location;
    }

    public function setLocation(?string $location): static
    {
        $this->location = $location;

        return $this;
    }

    public function getWebsiteUrl(): ?string
    {
        return $this->website_url;
    }

    public function setWebsiteUrl(?string $website_url): static
    {
        $this->website_url = $website_url;

        return $this;
    }

    /**
     * @return Collection<int, Tweet>
     */
    public function getTweetId(): Collection
    {
        return $this->tweet_id;
    }

    public function addTweetId(Tweet $tweetId): static
    {
        if (!$this->tweet_id->contains($tweetId)) {
            $this->tweet_id->add($tweetId);
            $tweetId->setUser($this);
        }

        return $this;
    }

    public function removeTweetId(Tweet $tweetId): static
    {
        if ($this->tweet_id->removeElement($tweetId)) {
            // set the owning side to null (unless already changed)
            if ($tweetId->getUser() === $this) {
                $tweetId->setUser(null);
            }
        }

        return $this;
    }

    public function getApiToken(): ?ApiToken
    {
        return $this->apiToken;
    }

    public function setApiToken(ApiToken $apiToken): static
    {
        // set the owning side of the relation if necessary
        if ($apiToken->getUser() !== $this) {
            $apiToken->setUser($this);
        }

        $this->apiToken = $apiToken;

        return $this;
    }

    public function isVerified(): bool
    {
        return $this->is_verified;
    }

    public function setIsVerified(bool $is_verified): static
    {
        $this->is_verified = $is_verified;

        return $this;
    }

    public function getEmailVerificationToken(): ?string
    {
        return $this->email_verification_token;
    }

    public function setEmailVerificationToken(?string $email_verification_token): static
    {
        $this->email_verification_token = $email_verification_token;

        return $this;
    }

    public function getEmailVerificationExpiresAt(): ?\DateTimeImmutable
    {
        return $this->email_verification_expires_at;
    }

    public function setEmailVerificationExpiresAt(?\DateTimeImmutable $email_verification_expires_at): static
    {
        $this->email_verification_expires_at = $email_verification_expires_at;

        return $this;
    }

    public function getPasswordResetToken(): ?string
    {
        return $this->password_reset_token;
    }

    public function setPasswordResetToken(?string $password_reset_token): static
    {
        $this->password_reset_token = $password_reset_token;

        return $this;
    }

    public function getPasswordResetExpiresAt(): ?\DateTimeImmutable
    {
        return $this->password_reset_expires_at;
    }

    public function setPasswordResetExpiresAt(?\DateTimeImmutable $password_reset_expires_at): static
    {
        $this->password_reset_expires_at = $password_reset_expires_at;

        return $this;
    }

    /**
     * @return Collection<int, Like>
     */
    public function getLiked(): Collection
    {
        return $this->liked;
    }

    public function addLiked(Like $liked): static
    {
        if (!$this->liked->contains($liked)) {
            $this->liked->add($liked);
            $liked->setUser($this);
        }

        return $this;
    }

    public function removeLiked(Like $liked): static
    {
        if ($this->liked->removeElement($liked)) {
            // set the owning side to null (unless already changed)
            if ($liked->getUser() === $this) {
                $liked->setUser(null);
            }
        }

        return $this;
    }

    public function isBlocked(): ?bool
    {
        return $this->isBlocked;
    }

    public function setIsBlocked(bool $isBlocked): static
    {
        $this->isBlocked = $isBlocked;

        return $this;
    }
}
