<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for creating follows
 */
class FollowCreateDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'following_id est requis')]
        #[Assert\Type(
            type: 'int',
            message: 'following_id doit être un entier'
        )]
        public int $following_id,
    ) {}
}
