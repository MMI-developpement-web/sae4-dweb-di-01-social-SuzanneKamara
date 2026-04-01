<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Seed test data: users, tweets, follows, likes
 */
final class Version20260401000000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Seed test data with users, tweets, follows, and likes';
    }

    public function up(Schema $schema): void
    {
        $now = new \DateTime();
        $nowStr = $now->format('Y-m-d H:i:s');

        // Password: Test@1234 hashed with bcrypt algorithm
        $hashedPassword = '$2y$13$8DZjlAEbqSdEPE/QqRE7wuXzjfKNzVDwmFyVkSHEPZvVZ4kxl7Uhy';

        // Create test users
        $users = [
            ['username' => 'alice', 'email' => 'alice@example.com', 'bio' => 'Software engineer and coffee lover', 'location' => 'Paris'],
            ['username' => 'bob', 'email' => 'bob@example.com', 'bio' => 'Web developer interested in Vue.js', 'location' => 'Lyon'],
            ['username' => 'charlie', 'email' => 'charlie@example.com', 'bio' => 'DevOps enthusiast and cloud architect', 'location' => 'Marseille'],
            ['username' => 'diana', 'email' => 'diana@example.com', 'bio' => 'UX/UI Designer', 'location' => 'Lille'],
            ['username' => 'elvira', 'email' => 'elvira@example.com', 'bio' => 'Data scientist and AI researcher', 'location' => 'Bordeaux'],
        ];

        foreach ($users as $user) {
            $this->addSql(
                'INSERT INTO user (username, email, password_hash, roles, bio, location, is_verified, is_blocked) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    $user['username'],
                    $user['email'],
                    $hashedPassword,
                    json_encode(['ROLE_USER']),
                    $user['bio'],
                    $user['location'],
                    1,  // is_verified (1 = true)
                    0, // is_blocked (0 = false)
                ]
            );
        }

        // Get user IDs to create tweets and relationships
        $userIds = [1, 2, 3, 4, 5];

        // Create sample tweets
        $tweets = [
            ['user_id' => 1, 'content' => 'Just shipped a new feature! Really excited about the performance improvements. 🚀'],
            ['user_id' => 1, 'content' => 'Coffee count today: 3. Code quality: exponential.'],
            ['user_id' => 2, 'content' => 'Vue.js 3 Composition API is amazing. Making the switch from class-based components.'],
            ['user_id' => 2, 'content' => 'Web development in 2026: still fighting with CSS sometimes. But we love it anyway! 💚'],
            ['user_id' => 3, 'content' => 'Infrastructure as Code is a game changer. Terraform + Docker = productivity ⚡'],
            ['user_id' => 3, 'content' => 'Spent the day optimizing cloud costs. Saved 40% by migrating to serverless architecture.'],
            ['user_id' => 4, 'content' => 'Design systems save so much time. Consistency across products = happier users ✨'],
            ['user_id' => 4, 'content' => 'UX Research Tip: Talk to your users! The insights you get are invaluable.'],
            ['user_id' => 5, 'content' => 'Just trained a new ML model. Accuracy improved by 12% with the new dataset. 📊'],
            ['user_id' => 5, 'content' => 'Python > Java for data science. Change my mind! (Just kidding, I love Python)'],
            ['user_id' => 1, 'content' => 'Building a social network is harder than it looks. So many edge cases to handle!'],
            ['user_id' => 2, 'content' => 'Debugging is like being a detective. Except the criminal is usually yourself. 🔍'],
        ];

        foreach ($tweets as $tweet) {
            $this->addSql(
                'INSERT INTO tweet (user_id, content, created_at) VALUES (?, ?, ?)',
                [
                    $tweet['user_id'],
                    $tweet['content'],
                    $nowStr
                ]
            );
        }

        // Create follows relationships (table is named folowing_follower with typo)
        $follows = [
            [1, 2], [1, 3], [1, 4], [1, 5],
            [2, 1], [2, 3], [2, 4],
            [3, 1], [3, 2], [3, 5],
            [4, 1], [4, 2], [4, 3], [4, 5],
            [5, 1], [5, 2], [5, 3], [5, 4],
        ];

        foreach ($follows as [$followerId, $followingId]) {
            // Note: column names are following_id (the user being followed) and follower_id (the user following)
            $this->addSql(
                'INSERT INTO folowing_follower (follower_id, following_id, created_at) VALUES (?, ?, ?)',
                [$followerId, $followingId, $nowStr]
            );
        }

        // Create likes on tweets
        $likes = [
            [1, 3], [1, 4], [1, 5], // alice likes tweets from bob and charlie
            [2, 1], [2, 2], [2, 8], // bob likes alice and diana's tweets
            [3, 3], [3, 4], [3, 6], // charlie likes bob and diana's tweets
            [4, 1], [4, 2], [4, 7], // diana likes alice and elvira's tweets
            [5, 9], [5, 10],        // elvira likes her own tweets
        ];

        foreach ($likes as [$userId, $tweetId]) {
            // Check if tweet exists before creating like
            $tweetExists = $this->connection->executeQuery(
                'SELECT id FROM tweet WHERE id = ?',
                [$tweetId]
            )->fetchOne();

            if ($tweetExists) {
                $this->addSql(
                    'INSERT INTO `like` (user_id, tweet_id, created_at) VALUES (?, ?, ?)',
                    [$userId, $tweetId, $nowStr]
                );
            }
        }
    }

    public function down(Schema $schema): void
    {
        // Delete in reverse order of dependencies
        $this->addSql('DELETE FROM `like`');
        $this->addSql('DELETE FROM folowing_follower');
        $this->addSql('DELETE FROM tweet');
        $this->addSql('DELETE FROM user WHERE id IN (1, 2, 3, 4, 5)');
    }
}
