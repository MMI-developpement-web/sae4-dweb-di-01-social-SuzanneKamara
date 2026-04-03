// Centralized message constants for i18n-ready messaging

export const MESSAGES = {
  // Profile Form
  PROFILE_UPDATED: 'Profil mis à jour avec succès ✓',
  GENERIC_ERROR: 'Une erreur est survenue',
  ACCOUNT_DELETION_PENDING: 'Compte en cours de suppression...',
  ACCOUNT_DELETION_FAILED: 'Impossible de supprimer le compte',
  PROFILE_LOAD_ERROR: 'Erreur lors du chargement du profil',

  // Tweets & Posts
  TWEET_EMPTY: 'Le tweet ne peut pas être vide.',
  TWEET_EMPTY_EN: 'Tweet cannot be empty.',
  TWEET_UPDATE_FAILED: 'Impossible de modifier le tweet.',
  TWEET_UPDATE_FAILED_EN: 'Failed to update tweet.',
  TWEET_DELETE_FAILED: 'Impossible de supprimer le tweet.',
  TWEET_DELETE_FAILED_EN: 'Failed to delete tweet.',
  TWEETS_LOAD_FAILED: 'Failed to load tweets.',
  NO_FOLLOWED_POSTS: 'Aucun post des comptes suivis pour le moment.',

  // Confirmations & Dialogs
  CONFIRM_DELETE_ACCOUNT: 'Êtes-vous sûr de vouloir supprimer votre compte? Cette action est irréversible.',
  CONFIRM_DELETE_TWEET: 'Vous êtes sur le point de supprimer cette publication',
  
  // Errors
  UNKNOWN_ERROR: 'Erreur inconnue',
  
  // Post Composer
  POST_CREATE_ERROR: 'Erreur création post:',
} as const
