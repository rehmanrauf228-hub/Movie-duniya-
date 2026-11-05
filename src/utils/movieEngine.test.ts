import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SUBSCRIPTION_PLANS,
  filterMovies,
  canUserWatchMovie,
  calculateSubscriptionExpiry,
  verifyPaymentTransaction,
  formatDuration,
  Movie,
  UserAccount
} from './movieEngine.ts';

const mockMovies: Movie[] = [
  {
    id: 'm1',
    title: 'Carry On Jatta 3',
    description: 'Iconic comedy starring Gippy Grewal and Sonam Bajwa.',
    poster: '/posters/carry.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    language: 'Punjabi',
    category: 'Movies',
    genre: ['Comedy', 'Family'],
    releaseYear: 2023,
    duration: '2h 18m',
    rating: '8.4',
    isVIP: true,
    isPublished: true,
    views: 45000,
    createdAt: '2024-01-01'
  },
  {
    id: 'm2',
    title: 'The Legend of Maula Jatt',
    description: 'Action epic starring Fawad Khan and Hamza Ali Abbasi.',
    poster: '/posters/maula.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    language: 'Pakistani',
    category: 'Latest',
    genre: ['Action', 'Drama'],
    releaseYear: 2022,
    duration: '2h 33m',
    rating: '8.9',
    isVIP: false,
    isPublished: true,
    views: 89000,
    createdAt: '2024-01-02'
  },
  {
    id: 'm3',
    title: 'Pathaan',
    description: 'High octane spy action starring Shah Rukh Khan.',
    poster: '/posters/pathaan.jpg',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    language: 'Hindi',
    category: 'Trending',
    genre: ['Action', 'Thriller'],
    releaseYear: 2023,
    duration: '2h 26m',
    rating: '7.8',
    isVIP: true,
    isPublished: false, // Unpublished
    views: 62000,
    createdAt: '2024-01-03'
  }
];

test('subscription plans conform to requirements', () => {
  assert.equal(SUBSCRIPTION_PLANS.length, 3);
  const monthly = SUBSCRIPTION_PLANS.find(p => p.id === 'monthly');
  const quarterly = SUBSCRIPTION_PLANS.find(p => p.id === 'quarterly');
  const yearly = SUBSCRIPTION_PLANS.find(p => p.id === 'yearly');

  assert.equal(monthly?.price, 199);
  assert.equal(quarterly?.price, 499);
  assert.equal(quarterly?.isPopular, true);
  assert.equal(yearly?.price, 2999);
  assert.equal(yearly?.isBestValue, true);
});

test('filterMovies matches language and query correctly while excluding unpublished', () => {
  const punjabiResults = filterMovies(mockMovies, '', 'Punjabi');
  assert.equal(punjabiResults.length, 1);
  assert.equal(punjabiResults[0].title, 'Carry On Jatta 3');

  const unpublished = filterMovies(mockMovies, 'Pathaan');
  assert.equal(unpublished.length, 0); // isPublished=false is excluded

  const searchAction = filterMovies(mockMovies, 'Action');
  assert.equal(searchAction.length, 1);
  assert.equal(searchAction[0].title, 'The Legend of Maula Jatt');
});

test('canUserWatchMovie respects VIP and subscription rules', () => {
  const freeMovie = mockMovies[1];
  const vipMovie = mockMovies[0];

  // Anyone can watch free movie
  assert.equal(canUserWatchMovie(null, freeMovie).canWatch, true);

  // Guest cannot watch VIP movie
  assert.equal(canUserWatchMovie(null, vipMovie).canWatch, false);

  // Unsubscribed user cannot watch VIP movie
  const normalUser: UserAccount = {
    id: 'u1',
    name: 'Ali',
    email: 'ali@example.com',
    role: 'user',
    hasActiveSubscription: false,
    watchlist: [],
    continueWatching: {}
  };
  assert.equal(canUserWatchMovie(normalUser, vipMovie).canWatch, false);

  // Active subscriber can watch VIP movie
  const activeUser: UserAccount = {
    ...normalUser,
    hasActiveSubscription: true,
    subscriptionExpiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
  };
  assert.equal(canUserWatchMovie(activeUser, vipMovie).canWatch, true);

  // Admin can always watch VIP movie
  const adminUser: UserAccount = {
    ...normalUser,
    role: 'admin'
  };
  assert.equal(canUserWatchMovie(adminUser, vipMovie).canWatch, true);
});

test('verifyPaymentTransaction validates account and generates reference', () => {
  const valid = verifyPaymentTransaction('jazzcash', 'quarterly', '03001234567');
  assert.equal(valid.success, true);
  assert.match(valid.transactionRef, /^MD-JA-/);

  const invalid = verifyPaymentTransaction('easypaisa', 'monthly', '');
  assert.equal(invalid.success, false);
});

test('calculateSubscriptionExpiry computes correct future date', () => {
  const base = new Date('2026-01-01T00:00:00Z');
  const expiryQuarterly = calculateSubscriptionExpiry('quarterly', base);
  const expiryDate = new Date(expiryQuarterly);
  assert.equal(expiryDate.getUTCMonth(), 3); // 3 months later = April
});

test('formatDuration formats seconds to MM:SS or HH:MM:SS', () => {
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(3665), '1:01:05');
});
