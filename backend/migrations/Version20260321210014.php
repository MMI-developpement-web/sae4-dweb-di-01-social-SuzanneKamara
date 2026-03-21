<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20260321210014 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE folowing_follower (id INT AUTO_INCREMENT NOT NULL, created_at DATETIME NOT NULL, following_id INT DEFAULT NULL, follower_id INT DEFAULT NULL, INDEX IDX_45EDFA241816E3A3 (following_id), INDEX IDX_45EDFA24AC24F853 (follower_id), PRIMARY KEY (id)) DEFAULT CHARACTER SET utf8mb4');
        $this->addSql('ALTER TABLE folowing_follower ADD CONSTRAINT FK_45EDFA241816E3A3 FOREIGN KEY (following_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE folowing_follower ADD CONSTRAINT FK_45EDFA24AC24F853 FOREIGN KEY (follower_id) REFERENCES user (id)');
        $this->addSql('DROP INDEX UNIQ_2DA1797716FA8C4C ON user');
        $this->addSql('ALTER TABLE user RENAME INDEX uniq_2da17977f85e0677 TO UNIQ_8D93D649F85E0677');
        $this->addSql('ALTER TABLE user RENAME INDEX uniq_2da17977e7927c74 TO UNIQ_8D93D649E7927C74');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE folowing_follower DROP FOREIGN KEY FK_45EDFA241816E3A3');
        $this->addSql('ALTER TABLE folowing_follower DROP FOREIGN KEY FK_45EDFA24AC24F853');
        $this->addSql('DROP TABLE folowing_follower');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2DA1797716FA8C4C ON user (email_verification_token)');
        $this->addSql('ALTER TABLE user RENAME INDEX uniq_8d93d649f85e0677 TO UNIQ_2DA17977F85E0677');
        $this->addSql('ALTER TABLE user RENAME INDEX uniq_8d93d649e7927c74 TO UNIQ_2DA17977E7927C74');
    }
}
