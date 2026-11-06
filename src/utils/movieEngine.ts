export interface Movie {
  id: string;
  title: string;
  description: string;
  poster: string;
  backdrop?: string;
  videoUrl: string;
  language: 'Punjabi' | 'English' | 'Pakistani' | 'Hindi' | 'Other';
  category: 'Movies' | 'Web Series' | 'Latest' | 'Trending' | 'Recently Added';
  genre: string[];
  releaseYear: number;
  duration: string;
  rating: string;
  isVIP: boolean;
  isPublished: boolean;
  isFeatured?: boolean;
  isTrending?: boolean;
  videoType?: 'mp4' | 'hls' | 'auto';
  views: number;
  createdAt: string;
}

export interface SubscriptionPlan {
  id: 'monthly' | 'quarterly' | 'yearly';
  name: string;
  price: number;
  currency: string;
  durationMonths: number;
  periodText: string;
  isPopular?: boolean;
  isBestValue?: boolean;
  features: string[];
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'monthly',
    name: 'Monthly Plan',
    price: 199,
    currency: 'Rs.',
    durationMonths: 1,
    periodText: '/ Month',
    features: [
      'Unlimited Movies & Series',
      'HD Quality Streaming',
      'Access on All Devices'
    ]
  },
  {
    id: 'quarterly',
    name: '3 Months Plan',
    price: 499,
    currency: 'Rs.',
    durationMonths: 3,
    periodText: '/ 3 Months',
    isPopular: true,
    features: [
      'Unlimited Movies & Series',
      'HD Quality Streaming',
      'Access on All Devices'
    ]
  },
  {
    id: 'yearly',
    name: '1 Year Plan',
    price: 2999,
    currency: 'Rs.',
    durationMonths: 12,
    periodText: '/ Year',
    isBestValue: true,
    features: [
      'Unlimited Movies & Series',
      'HD Quality Streaming',
      'Access on All Devices'
    ]
  }
];

export interface PaymentTransaction {
  id: string;
  userId: string;
  userEmail: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  gateway: 'jazzcash' | 'easypaisa' | 'card' | 'bank';
  accountReference: string;
  transactionRef: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paidAt: string;
  expiresAt: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'subscriber' | 'user';
  hasActiveSubscription: boolean;
  subscriptionPlan?: string;
  subscriptionExpiresAt?: string;
  watchlist: string[];
  continueWatching: Record<string, { currentTime: number; duration: number; updatedAt: string }>;
}

export function filterMovies(
  movies: Movie[],
  query: string,
  filterLanguage?: string,
  filterCategory?: string,
  filterGenre?: string
): Movie[] {
  const q = query.trim().toLowerCase();
  return movies.filter((m) => {
    if (!m.isPublished) return false;
    if (filterLanguage && filterLanguage !== 'All' && m.language.toLowerCase() !== filterLanguage.toLowerCase()) {
      return false;
    }
    if (filterCategory && filterCategory !== 'All' && m.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    if (filterGenre && filterGenre !== 'All' && !m.genre.some((g) => g.toLowerCase() === filterGenre.toLowerCase())) {
      return false;
    }
    if (q) {
      const matchTitle = m.title.toLowerCase().includes(q);
      const matchDesc = m.description.toLowerCase().includes(q);
      const matchLang = m.language.toLowerCase().includes(q);
      const matchGenre = m.genre.some((g) => g.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchLang && !matchGenre) {
        return false;
      }
    }
    return true;
  });
}

export function canUserWatchMovie(user: UserAccount | null, movie: Movie): { canWatch: boolean; reason?: string } {
  if (!movie.isVIP) {
    return { canWatch: true };
  }
  if (!user) {
    return { canWatch: false, reason: 'Login required to stream VIP movies' };
  }
  if (user.role === 'admin') {
    return { canWatch: true };
  }
  if (user.hasActiveSubscription) {
    if (user.subscriptionExpiresAt) {
      const expiry = new Date(user.subscriptionExpiresAt).getTime();
      if (expiry > Date.now()) {
        return { canWatch: true };
      }
    } else {
      return { canWatch: true };
    }
  }
  return { canWatch: false, reason: 'Active subscription required for VIP movie' };
}

export function calculateSubscriptionExpiry(planId: string, fromDate = new Date()): string {
  const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId) || SUBSCRIPTION_PLANS[0];
  const d = new Date(fromDate);
  d.setMonth(d.getMonth() + plan.durationMonths);
  return d.toISOString();
}

export function verifyPaymentTransaction(
  gateway: 'jazzcash' | 'easypaisa' | 'card' | 'bank',
  planId: string,
  accountInfo: string
): { success: boolean; transactionRef: string; error?: string } {
  if (!accountInfo || accountInfo.trim().length < 4) {
    return { success: false, transactionRef: '', error: 'Invalid account details or phone number provided.' };
  }
  const prefix = gateway.toUpperCase().slice(0, 2);
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  const transactionRef = `MD-${prefix}-${Date.now().toString().slice(-4)}-${randomNum}`;
  return {
    success: true,
    transactionRef
  };
}

export function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
