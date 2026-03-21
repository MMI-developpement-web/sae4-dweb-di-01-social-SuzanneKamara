<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260321103933 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @sql = CONCAT('DROP INDEX UNIQ_2DA1797716FA8C4C ON `', @user_table, '`')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @sql = CONCAT('ALTER TABLE `', @user_table, '` ADD password_reset_token VARCHAR(64) DEFAULT NULL, ADD password_reset_expires_at DATETIME DEFAULT NULL, CHANGE is_verified is_verified TINYINT NOT NULL')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @sql = CONCAT('CREATE UNIQUE INDEX UNIQ_2DA1797716FA8C4C ON `', @user_table, '` (email_verification_token)')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @sql = CONCAT('ALTER TABLE `', @user_table, '` DROP password_reset_token, DROP password_reset_expires_at, CHANGE is_verified is_verified TINYINT DEFAULT 1 NOT NULL')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @sql = CONCAT('CREATE UNIQUE INDEX UNIQ_2DA1797716FA8C4C ON `', @user_table, '` (email_verification_token)')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }
}
