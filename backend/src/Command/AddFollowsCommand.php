<?php

namespace App\Command;

use App\Entity\FolowingFollower;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Console\Attribute\AsCommand;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Input\InputOption;
use Symfony\Component\Console\Output\OutputInterface;

#[AsCommand(
    name: 'app:add-follows',
    description: 'Add random follow relationships between users',
    hidden: false,
)]
class AddFollowsCommand extends Command
{
    public function __construct(private EntityManagerInterface $entityManager)
    {
        parent::__construct();
    }

    protected function configure(): void
    {
        $this
            ->addOption('count', 'c', InputOption::VALUE_OPTIONAL, 'Number of follow relationships to create', '150')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output): int
    {
        $count = (int) $input->getOption('count');
        
        $userRepository = $this->entityManager->getRepository(User::class);
        $followRepository = $this->entityManager->getRepository(FolowingFollower::class);
        $users = $userRepository->findAll();

        $output->writeln('');
        $output->writeln('📊 <info>Users found: ' . count($users) . '</info>');

        if (count($users) < 2) {
            $output->writeln('<error>✗ Need at least 2 users to create follows!</error>');
            return Command::FAILURE;
        }

        $created = 0;
        $maxAttempts = $count * 10;
        $attempts = 0;
        $now = new \DateTimeImmutable();

        while ($created < $count && $attempts < $maxAttempts) {
            $attempts++;

            $follower = $users[array_rand($users)];
            $following = $users[array_rand($users)];

            // Don't allow self-follows
            if ($follower->getId() === $following->getId()) {
                continue;
            }

            // Check if already exists
            $existing = $followRepository->findOneBy([
                'follower' => $follower,
                'following' => $following,
            ]);

            if ($existing) {
                continue;
            }

            $follow = (new FolowingFollower())
                ->setFollower($follower)
                ->setFollowing($following)
                ->setCreatedAt($now->sub(new \DateInterval(sprintf('PT%dM', random_int(1, 60 * 24 * 30)))));

            $this->entityManager->persist($follow);
            ++$created;

            // Flush every 50 records
            if ($created % 50 === 0) {
                $this->entityManager->flush();
                $output->writeln('  ➜ <comment>' . $created . '/' . $count . ' follows created...</comment>');
            }
        }

        $this->entityManager->flush();

        $output->writeln('');
        $output->writeln('✅ <info>Successfully created ' . $created . ' follow relationships!</info>');
        $output->writeln('   Attempts: ' . $attempts . '/' . $maxAttempts);
        $output->writeln('');

        return Command::SUCCESS;
    }
}
