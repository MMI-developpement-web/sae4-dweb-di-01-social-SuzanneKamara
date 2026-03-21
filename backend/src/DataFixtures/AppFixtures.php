<?php

namespace App\DataFixtures;

use App\Entity\Tweet;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    public function __construct(
        private UserPasswordHasherInterface $passwordHasher
    ) {
    }

    public function load(ObjectManager $manager): void
    {
        $adminEmail = $_ENV['ADMIN_EMAIL'] ?? 'admin@example.com';
        $adminUsername = $_ENV['ADMIN_USERNAME'] ?? 'admin';
        $adminPassword = $_ENV['ADMIN_PASSWORD'] ?? 'ChangeMe123!';

        $targetUsersCount = max(1, (int) ($_ENV['FIXTURES_USERS_COUNT'] ?? 250));
        $usersToGenerate = max(0, $targetUsersCount - 1);
        $tweetsToGenerate = max(0, (int) ($_ENV['FIXTURES_TWEETS_COUNT'] ?? 400));
        $defaultPassword = $_ENV['FIXTURES_USERS_PASSWORD'] ?? 'Test1234!';

        /** @var User|null $admin */
        $admin = $manager->getRepository(User::class)->findOneBy(['email' => $adminEmail]);

        if (!$admin) {
            $admin = (new User())
                ->setEmail($adminEmail)
                ->setUsername($adminUsername);
            $manager->persist($admin);
        } else {
            $admin->setUsername($adminUsername);
        }

        $admin->setRoles(['ROLE_ADMIN']);
        $admin->setIsVerified(true);
        $admin->setPassword($this->passwordHasher->hashPassword($admin, $adminPassword));

        $users = [$admin];
        $sharedPasswordHash = $this->passwordHasher->hashPassword($admin, $defaultPassword);

        for ($i = 1; $i <= $usersToGenerate; ++$i) {
            $user = (new User())
                ->setUsername($this->buildUsername($i))
                ->setEmail(sprintf('user%05d@example.test', $i))
                ->setPassword($sharedPasswordHash)
                ->setRoles([])
                ->setIsVerified(true)
                ->setBio($this->pickBio())
                ->setLocation($this->pickLocation())
                ->setWebsiteUrl(sprintf('https://example.test/u/%d', $i))
                ->setAvatarUrl(sprintf('https://api.dicebear.com/9.x/identicon/svg?seed=user%d', $i))
                ->setBannerUrl(sprintf('https://picsum.photos/seed/banner%d/1200/400', $i));

            $manager->persist($user);
            $users[] = $user;
        }

        $manager->flush();

        $hashtags = [
            '#tech',
            '#symfony',
            '#webdev',
            '#opensource',
            '#design',
            '#backend',
            '#frontend',
            '#javascript',
            '#php',
            '#ux',
        ];

        $phrases = [
            'Working on a new feature and iterating quickly.',
            'Small refactor, big readability win.',
            'Today I focused on performance and query optimization.',
            'Shipping improvements one commit at a time.',
            'Testing edge cases before merging to main.',
            'Trying a cleaner architecture for the API layer.',
            'Debugging done, now writing proper test coverage.',
            'Feature complete, polishing the details now.',
            'Learning something new every day in this stack.',
            'Monitoring logs and tightening error handling.',
        ];

        $now = new \DateTimeImmutable();

        for ($i = 0; $i < $tweetsToGenerate; ++$i) {
            /** @var User $author */
            $author = $users[array_rand($users)];
            $authorId = $author->getId();

            if ($authorId === null) {
                continue;
            }

            $content = $phrases[array_rand($phrases)] . ' ' . $hashtags[array_rand($hashtags)];

            if (strlen($content) > 280) {
                $content = substr($content, 0, 280);
            }

            $tweet = (new Tweet())
                ->setUser($author)
                ->setUserId($authorId)
                ->setContent($content)
                ->setCreatedAt($now->sub(new \DateInterval(sprintf('PT%dM', random_int(1, 60 * 24 * 90)))));

            $manager->persist($tweet);
        }

        $manager->flush();
    }

    private function buildUsername(int $index): string
    {
        $prefixes = ['luna', 'pixel', 'neo', 'code', 'wave', 'orbit', 'echo', 'atlas', 'nova', 'zen'];
        $suffixes = ['dev', 'lab', 'studio', 'hub', 'node', 'flow', 'craft', 'space', 'core', 'byte'];

        return sprintf('%s_%s_%04d', $prefixes[array_rand($prefixes)], $suffixes[array_rand($suffixes)], $index);
    }

    private function pickBio(): string
    {
        $bios = [
            'Building digital products with clean code and curiosity.',
            'Backend enthusiast who also enjoys UI details.',
            'Trying to keep APIs fast, clear, and well documented.',
            'Learning in public and sharing practical dev notes.',
            'Shipping features and improving developer experience.',
        ];

        return $bios[array_rand($bios)];
    }

    private function pickLocation(): string
    {
        $locations = ['Paris', 'Lyon', 'Marseille', 'Lille', 'Nantes', 'Bordeaux', 'Toulouse', 'Nice'];

        return $locations[array_rand($locations)];
    }
}
