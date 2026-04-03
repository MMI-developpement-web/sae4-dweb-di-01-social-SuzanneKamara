<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for creating/updating tweets
 */
class TweetCreateDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le champ content est requis')]
        #[Assert\Length(
            min: 1,
            max: 280,
            minMessage: 'Le tweet doit contenir au moins 1 caractère',
            maxMessage: 'Le tweet ne peut pas dépasser 280 caractères'
        )]
        public string $content,

        #[Assert\Type('array', message: 'Les mediaIds doivent être un tableau')]
        #[Assert\Count(
            max: 4,
            maxMessage: 'Un tweet peut contenir au maximum 4 médias'
        )]
        public array $mediaIds = [],
    ) {}
}
