<?php

namespace App\Repository;

use App\Entity\User;
use App\Entity\Tweet;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Tweet>
 */
class TweetRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Tweet::class);
    }

    /**
     * Find all tweets with eager loading of user relation
     * @return Tweet[] Returns an array of Tweet objects
     */
    public function findAllWithUser(): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.user', 'u')
            ->addSelect('u')
            ->orderBy('t.created_at', 'DESC')
            ->getQuery()
            ->getResult();
    }

    /**
     * Returns tweets for explore page, ordered newest first.
     *
     * @return Tweet[]
     */
    public function findAllWithUserPage(int $limit = 40, int $offset = 0): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.user', 'u')
            ->addSelect('u')
            ->orderBy('t.created_at', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }

    /**
     * Find one tweet by ID with eager loading of user relation
     */
    public function findOneWithUser(int $id): ?Tweet
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.user', 'u')
            ->addSelect('u')
            ->andWhere('t.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * Returns tweets from accounts followed by the given user, ordered newest first.
     *
     * @return Tweet[]
     */
    public function findFeedForUser(User $user, int $limit = 40, int $offset = 0): array
    {
        return $this->createQueryBuilder('t')
            ->leftJoin('t.user', 'u')
            ->addSelect('u')
            ->leftJoin('App\\Entity\\FolowingFollower', 'ff', 'WITH', 'ff.following = u AND ff.follower = :currentUser')
            ->andWhere('ff.id IS NOT NULL OR u = :currentUser')
            ->setParameter('currentUser', $user)
            ->orderBy('t.created_at', 'DESC')
            ->setMaxResults($limit)
            ->setFirstResult($offset)
            ->getQuery()
            ->getResult();
    }
}
