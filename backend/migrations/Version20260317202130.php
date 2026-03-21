<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260317202130 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Normalize username/email unique index names on user table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @username_old_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649F85E0677')");
        $this->addSql("SET @username_new_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_2DA17977F85E0677')");
        $this->addSql("SET @sql = IF(@username_old_exists = 1 AND @username_new_exists = 0, CONCAT('ALTER TABLE `', @user_table, '` RENAME INDEX UNIQ_8D93D649F85E0677 TO UNIQ_2DA17977F85E0677'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');

        $this->addSql("SET @email_old_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649E7927C74')");
        $this->addSql("SET @email_new_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_2DA17977E7927C74')");
        $this->addSql("SET @sql = IF(@email_old_exists = 1 AND @email_new_exists = 0, CONCAT('ALTER TABLE `', @user_table, '` RENAME INDEX UNIQ_8D93D649E7927C74 TO UNIQ_2DA17977E7927C74'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }

    public function down(Schema $schema): void
    {
        $this->addSql("SET @user_table = (SELECT CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = 'User') THEN 'User' ELSE 'user' END)");
        $this->addSql("SET @username_old_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_2DA17977F85E0677')");
        $this->addSql("SET @username_new_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649F85E0677')");
        $this->addSql("SET @sql = IF(@username_old_exists = 1 AND @username_new_exists = 0, CONCAT('ALTER TABLE `', @user_table, '` RENAME INDEX UNIQ_2DA17977F85E0677 TO UNIQ_8D93D649F85E0677'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');

        $this->addSql("SET @email_old_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_2DA17977E7927C74')");
        $this->addSql("SET @email_new_exists = (SELECT COUNT(*) FROM information_schema.statistics WHERE table_schema = DATABASE() AND table_name = @user_table AND index_name = 'UNIQ_8D93D649E7927C74')");
        $this->addSql("SET @sql = IF(@email_old_exists = 1 AND @email_new_exists = 0, CONCAT('ALTER TABLE `', @user_table, '` RENAME INDEX UNIQ_2DA17977E7927C74 TO UNIQ_8D93D649E7927C74'), 'SELECT 1')");
        $this->addSql('PREPARE stmt FROM @sql');
        $this->addSql('EXECUTE stmt');
        $this->addSql('DEALLOCATE PREPARE stmt');
    }
}
