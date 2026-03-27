<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Add UNIQUE constraint to like table to prevent duplicate likes
 * Ensures: One user can like a tweet only once
 * Allows: A tweet to receive unlimited likes from different users
 */
final class Version20260326180000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add UNIQUE constraint on (user_id, tweet_id) to like table';
    }

    public function up(Schema $schema): void
    {
        // Add UNIQUE constraint to prevent duplicate likes
        // This ensures a user can only like a tweet once
        $this->addSql('ALTER TABLE `like` ADD UNIQUE KEY unique_user_tweet (user_id, tweet_id)');
    }

    public function down(Schema $schema): void
    {
        // Remove the UNIQUE constraint for rollback
        $this->addSql('ALTER TABLE `like` DROP INDEX unique_user_tweet');
    }
}
