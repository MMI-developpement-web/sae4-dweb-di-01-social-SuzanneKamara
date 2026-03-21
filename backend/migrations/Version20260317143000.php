<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260317143000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Bring existing user tables in sync with the auth-ready User entity';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @roles_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @user_table AND column_name = 'roles')");
        $this->addSql("SET @sql = IF(@roles_exists = 0, CONCAT('ALTER TABLE `', @user_table, '` ADD roles JSON DEFAULT NULL'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @sql = CONCAT('UPDATE `', @user_table, '` SET roles = ''[]'' WHERE roles IS NULL')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @roles_nullable = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @user_table AND column_name = 'roles' AND is_nullable = 'YES')");
        $this->addSql("SET @sql = IF(@roles_nullable = 1, CONCAT('ALTER TABLE `', @user_table, '` MODIFY roles JSON NOT NULL'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @username_index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649F85E0677')");
        $this->addSql("SET @sql = IF(@username_index_exists = 0, CONCAT('CREATE UNIQUE INDEX UNIQ_8D93D649F85E0677 ON `', @user_table, '` (username)'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @email_index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649E7927C74')");
        $this->addSql("SET @sql = IF(@email_index_exists = 0, CONCAT('CREATE UNIQUE INDEX UNIQ_8D93D649E7927C74 ON `', @user_table, '` (email)'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }

    public function down(Schema $schema): void
    {
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @username_index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649F85E0677')");
        $this->addSql("SET @sql = IF(@username_index_exists = 1, CONCAT('DROP INDEX UNIQ_8D93D649F85E0677 ON `', @user_table, '`'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @email_index_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649E7927C74')");
        $this->addSql("SET @sql = IF(@email_index_exists = 1, CONCAT('DROP INDEX UNIQ_8D93D649E7927C74 ON `', @user_table, '`'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
        $this->addSql("SET @roles_exists = (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = DATABASE() AND table_name = @user_table AND column_name = 'roles')");
        $this->addSql("SET @sql = IF(@roles_exists = 1, CONCAT('ALTER TABLE `', @user_table, '` DROP COLUMN roles'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }
}