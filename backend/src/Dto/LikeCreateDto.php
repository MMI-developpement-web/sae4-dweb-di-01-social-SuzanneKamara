<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for creating likes
 */
class LikeCreateDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'tweet_id est requis')]
        #[Assert\Type(
            type: 'int',
            message: 'tweet_id doit être un entier'
        )]
        public int $tweet_id,
    ) {
    }
}
