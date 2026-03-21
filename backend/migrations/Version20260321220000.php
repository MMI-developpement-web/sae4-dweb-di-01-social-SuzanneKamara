<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260321220000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add variable-length tweets for masonry layout showcase';
    }

    public function up(Schema $schema): void
    {
        $now = new \DateTime();
        $nowStr = $now->format('Y-m-d H:i:s');

        // Get first user ID to create tweets
        $userId = $this->connection->executeQuery('SELECT id FROM user LIMIT 1')->fetchOne();
        
        if ($userId === false) {
            // Create a test user if none exists
            $this->addSql("INSERT INTO user (username, email, password, roles, created_at) VALUES ('testuser', 'test@example.com', '\$2y\$13\$hashedpassword', 'ROLE_USER', ?)", [$nowStr]);
            $userId = $this->connection->lastInsertId();
        }

        $tweets = [
            // Very short (1-3 words)
            'Code',
            'API ✓',
            'Live!',
            'Hello',
            'Amazing',
            
            // Short (1 sentence)
            'Launching new feature today',
            'Coffee and coding',
            'Just shipped v2.0',
            'Excited about releases',
            'Building greatness',
            
            // Medium (2-3 sentences)
            'Working on the masonry layout. It\'s looking really good!',
            'Building something awesome with React and TypeScript. Love this stack!',
            'Finally fixed that annoying bug. Performance improved significantly.',
            
            // Longer tweets
            'Today we\'re releasing a brand new dashboard with improved analytics. The team worked hard on this feature.',
            'Just completed code review. All tests passing, metrics solid. Ready for production deployment tomorrow.',
            
            // Longer content (approaching 280 limits)
            'I\'ve been learning about web performance optimization. Small changes have huge impacts on UX. From lazy loading to code splitting, every optimization matters. The improvement is remarkable.',
            'Building scalable apps requires careful planning. We made progress on infrastructure. The new caching reduced times by 40%. Performance is now our top priority.',
            
            // Maximum content (280 chars or close)
            'Excited to announce major milestone! Team worked around the clock implementing new features. We refactored code, improved maintainability, performance. New architecture supports more scale. Testing comprehensive, release ready. Start of exciting phase!',
            'Another day, another feature shipped. Masonry layout working perfectly now. CSS columns method provides Pinterest-like experience. No fixed heights, flexible content. Performance metrics looking solid. Users will love this update!',
        ];

        foreach ($tweets as $index => $content) {
            $timestamp = $nowStr;
            $this->addSql(
                'INSERT INTO tweet (user_id, content, created_at) VALUES (?, ?, ?)',
                [$userId, $content, $timestamp]
            );
        }
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException('Cannot revert variable-length tweets insertion');
    }
}
