<?php

namespace App\Dto;

use Symfony\Component\Validator\Constraints as Assert;

/**
 * DTO for user registration
 */
class UserRegisterDto
{
    public function __construct(
        #[Assert\NotBlank(message: 'Le champ username est requis')]
        #[Assert\Length(
            min: 3,
            minMessage: 'Le username doit contenir au moins 3 caractères',
            max: 255,
            maxMessage: 'Le username ne peut pas dépasser 255 caractères'
        )]
        public string $username,

        #[Assert\NotBlank(message: 'Le champ email est requis')]
        #[Assert\Email(message: 'Le format de l\'email est invalide')]
        public string $email,

        #[Assert\NotBlank(message: 'Le champ password est requis')]
        #[Assert\Length(
            min: 8,
            minMessage: 'Le mot de passe doit contenir au moins 8 caractères'
        )]
        #[Assert\Regex(
            pattern: '/[A-Z]/',
            message: 'Le mot de passe doit contenir au moins une majuscule'
        )]
        #[Assert\Regex(
            pattern: '/[a-z]/',
            message: 'Le mot de passe doit contenir au moins une minuscule'
        )]
        #[Assert\Regex(
            pattern: '/[0-9]/',
            message: 'Le mot de passe doit contenir au moins un chiffre'
        )]
        #[Assert\Regex(
            pattern: '/[!@#$%^&*()_+=\-\[\]{}|;:\'",<>?\/\\]/',
            message: 'Le mot de passe doit contenir au moins un caractère spécial'
        )]
        public string $password,
    ) {}
}
