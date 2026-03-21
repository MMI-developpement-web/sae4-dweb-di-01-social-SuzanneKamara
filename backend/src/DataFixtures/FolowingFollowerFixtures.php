<?php

namespace App\DataFixtures;

use App\Entity\FolowingFollower;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Common\DataFixtures\DependentFixtureInterface;
use Doctrine\Persistence\ObjectManager;

#FixtureGroup('following')
class FolowingFollowerFixtures extends Fixture implements DependentFixtureInterface
{
    public function load(ObjectManager $manager): void
    {
        // Get all users from the database
        $userRepository = $manager->getRepository(User::class);
        $users = $userRepository->findAll();

        if (count($users) < 2) {
            return; // Need at least 2 users to create follows
        }

        $baseFollowsPerUser = (int) ($_ENV['FIXTURES_FOLLOWS_PER_USER'] ?? 5);
        $totalFollows = (int) ($_ENV['FIXTURES_TOTAL_FOLLOWS'] ?? min(100, count($users) * 3));

        $created = 0;
        $now = new \DateTimeImmutable();

        // Create random follows
        for ($i = 0; $i < $totalFollows && $created < $totalFollows; ++$i) {
            $follower = $users[array_rand($users)];
            $following = $users[array_rand($users)];

            // Don't allow self-follows
            if ($follower->getId() === $following->getId()) {
                continue;
            }

            // Check if this follow relationship already exists
            $existingFollow = $manager->getRepository(FolowingFollower::class)->findOneBy([
                'follower' => $follower,
                'following' => $following,
            ]);

            if ($existingFollow) {
                continue; // Skip if already exists
            }

            $follow = (new FolowingFollower())
                ->setFollower($follower)
                ->setFollowing($following)
                ->setCreatedAt($now->sub(new \DateInterval(sprintf('PT%dM', random_int(1, 60 * 24 * 30)))));

            $manager->persist($follow);
            ++$created;

            // Flush every 50 records to avoid memory issues
            if ($created % 50 === 0) {
                $manager->flush();
            }
        }

        $manager->flush();
    }

    public function getDependencies(): array
    {
        return [AppFixtures::class];
    }
}
