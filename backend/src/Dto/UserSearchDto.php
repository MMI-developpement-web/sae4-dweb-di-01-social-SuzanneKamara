<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for searching users by email
 */
class UserSearchDto
{
    public function __construct(
        #[Assert\Email(
            message: 'Le format de l\'email est invalide',
            mode: 'html5'
        )]
        public ?string $email = null,
    ) {}
}
