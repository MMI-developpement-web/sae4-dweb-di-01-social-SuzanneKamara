<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Create and update media table for tweet media support
 */
final class Version20260402120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add media table with proper relationships and fields for tweet images/videos';
    }

    public function up(Schema $schema): void
    {
        // Check if media table exists and drop it to recreate with proper schema
        if ($schema->hasTable('media')) {
            $this->addSql('DROP TABLE IF EXISTS media');
        }

        // Create media table with proper schema
        $this->addSql(
            'CREATE TABLE media (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tweet_id INT NULL,
                user_id INT NOT NULL,
                file_path VARCHAR(500) NOT NULL,
                media_type VARCHAR(20) NOT NULL,
                file_size INT NOT NULL,
                created_at DATETIME NOT NULL COMMENT \'(DC2Type:datetime_immutable)\',
                INDEX IDX_6A2CA10C7F726566 (tweet_id),
                INDEX IDX_6A2CA10CA76ED395 (user_id),
                CONSTRAINT FK_6A2CA10C7F726566 FOREIGN KEY (tweet_id) REFERENCES tweet(id) ON DELETE CASCADE,
                CONSTRAINT FK_6A2CA10CA76ED395 FOREIGN KEY (user_id) REFERENCES user(id)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci'
        );
    }

    public function down(Schema $schema): void
    {
        // Drop media table if it exists
        $this->addSql('DROP TABLE IF EXISTS media');
    }
}
