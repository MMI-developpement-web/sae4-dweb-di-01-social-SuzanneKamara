<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Create blocked table for user blocking functionality
 * 
 * Allows users to block other users, preventing them from:
 * - Following the blocker user
 * - Liking the blocker's tweets
 * - Seeing the blocker's profile/content
 * 
 * Constraints:
 * - UNIQUE on (blocker_id, blocked_id): A user can only block another user once
 * - CASCADE delete: Removing a user removes all their blocks (both as blocker and blocked)
 */
final class Version20260327223453 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE blocked (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, blocker_id INT NOT NULL, blocked_id INT NOT NULL, INDEX IDX_DA55EB80548D5975 (blocker_id), INDEX IDX_DA55EB8021FF5136 (blocked_id), UNIQUE INDEX UNIQ_BLOCKED_RELATION (blocker_id, blocked_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE blocked ADD CONSTRAINT FK_DA55EB80548D5975 FOREIGN KEY (blocker_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE blocked ADD CONSTRAINT FK_DA55EB8021FF5136 FOREIGN KEY (blocked_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE blocked DROP FOREIGN KEY FK_DA55EB80548D5975');
        $this->addSql('ALTER TABLE blocked DROP FOREIGN KEY FK_DA55EB8021FF5136');
        $this->addSql('DROP TABLE blocked');
    }
}
