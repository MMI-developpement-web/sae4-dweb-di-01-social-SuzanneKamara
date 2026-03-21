<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260321120000 extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Drop following and follower tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('DROP TABLE IF EXISTS `Following`');
        $this->addSql('DROP TABLE IF EXISTS `Follower`');
        $this->addSql('DROP TABLE IF EXISTS following');
        $this->addSql('DROP TABLE IF EXISTS follower');
    }

    public function down(Schema $schema): void
    {
        $this->throwIrreversibleMigrationException('This migration drops Following/Follower tables and cannot be safely reverted.');
    }
}
