<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for updating user profile
 */
class UserUpdateDto
{
    public function __construct(
        #[Assert\Length(
            max: 500,
            maxMessage: 'La bio ne peut pas dépasser 500 caractères'
        )]
        public ?string $bio = null,

        #[Assert\Length(
            max: 100,
            maxMessage: 'La localisation ne peut pas dépasser 100 caractères'
        )]
        public ?string $location = null,

        #[Assert\Url(message: 'Le format du site web est invalide')]
        #[Assert\Length(
            max: 500,
            maxMessage: 'L\'URL du site web ne peut pas dépasser 500 caractères'
        )]
        public ?string $website_url = null,

        #[Assert\Url(message: 'Le format de l\'URL de l\'avatar est invalide')]
        public ?string $avatar_url = null,

        #[Assert\Url(message: 'Le format de l\'URL de la bannière est invalide')]
        public ?string $banner_url = null,
    ) {
    }
}
