<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for pagination query strings
 */
class PaginationDto
{
    public function __construct(
        #[Assert\Positive(message: 'La limite doit être positive')]
        #[Assert\LessThanOrEqual(
            value: 100,
            message: 'La limite ne peut pas dépasser 100'
        )]
        public int $limit = 40,

        #[Assert\PositiveOrZero(message: 'L\'offset doit être positif ou zéro')]
        #[Assert\LessThanOrEqual(
            value: 10000,
            message: 'L\'offset ne peut pas dépasser 10 000'
        )]
        public int $offset = 0,
    ) {}
}
