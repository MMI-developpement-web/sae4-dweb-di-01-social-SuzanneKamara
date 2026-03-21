<?php

namespace App\Entity;

use App\Repository\MediaRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: MediaRepository::class)]
class Media
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column]
    private ?int $tweet_id = null;

    #[ORM\Column(length: 500)]
    private ?string $file_url = null;

    #[ORM\Column(length: 10)]
    private ?string $media_type = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTweetId(): ?int
    {
        return $this->tweet_id;
    }

    public function setTweetId(int $tweet_id): static
    {
        $this->tweet_id = $tweet_id;

        return $this;
    }

    public function getFileUrl(): ?string
    {
        return $this->file_url;
    }

    public function setFileUrl(string $file_url): static
    {
        $this->file_url = $file_url;

        return $this;
    }

    public function getMediaType(): ?string
    {
        return $this->media_type;
    }

    public function setMediaType(string $media_type): static
    {
        $this->media_type = $media_type;

        return $this;
    }
}
