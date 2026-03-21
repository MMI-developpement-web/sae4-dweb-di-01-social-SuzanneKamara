#!/usr/bin/env php
<?php
// Quick script to add follow relationships

require_once __DIR__.'/../../vendor/autoload_runtime.php';

return function (\Symfony\Component\Console\Application $app) {
    $container = $app->getKernel()->getContainer();
    $em = $container->get('doctrine.orm.entity_manager');
    $userRepo = $em->getRepository('App:User');
    
    $users = $userRepo->findAll();
    echo count($users) . " users found\n";
    
    if (count($users) < 2) {
        echo "Need at least 2 users!\n";
        return;
    }
    
    $created = 0;
    $maxFollows = 150;
    $maxAttempts = $maxFollows * 10;
    $attempts = 0;
    
    while ($created < $maxFollows && $attempts < $maxAttempts) {
        $attempts++;
        
        $follower = $users[array_rand($users)];
        $following = $users[array_rand($users)];
        
        if ($follower->getId() === $following->getId()) {
            continue;
        }
        
        // Check if already exists
        $existing = $em->getRepository('App:FolowingFollower')->findOneBy([
            'follower' => $follower,
            'following' => $following
        ]);
        
        if ($existing) {
            continue;
        }
        
        $follow = (new \App\Entity\FolowingFollower())
            ->setFollower($follower)
            ->setFollowing($following)
            ->setCreatedAt(new \DateTimeImmutable());
        
        $em->persist($follow);
        $created++;
        
        if ($created % 50 === 0) {
            echo "Created $created follows...\n";
            $em->flush();
        }
    }
    
    $em->flush();
    echo "✅ Created $created follow relationships!\n";
};
