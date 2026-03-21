<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260320173000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add email verification fields to User and default existing users to verified';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @sql = CONCAT('ALTER TABLE `', @user_table, '` ADD is_verified TINYINT(1) NOT NULL DEFAULT 1, ADD email_verification_token VARCHAR(64) DEFAULT NULL, ADD email_verification_expires_at DATETIME DEFAULT NULL')");
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
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @sql = CONCAT('DROP INDEX UNIQ_2DA1797716FA8C4C ON `', @user_table, '`')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @sql = CONCAT('ALTER TABLE `', @user_table, '` DROP is_verified, DROP email_verification_token, DROP email_verification_expires_at')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }
}
