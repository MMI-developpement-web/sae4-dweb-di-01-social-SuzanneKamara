<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for creating/managing blocks
 */
class BlockCreateDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'target_user_id est requis')]
        #[Assert\Type(
            type: 'int',
            message: 'target_user_id doit être un entier'
        )]
        public int $target_user_id,
    ) {}
}
