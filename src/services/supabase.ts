import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Movie } from '../utils/movieEngine';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

// 1. Retrieve configuration from environment or admin settings in localStorage
export function getSupabaseConfig(): SupabaseConfig {
  const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
  const envKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

  const storedUrl = typeof window !== 'undefined' ? localStorage.getItem('movieduniya_supabase_url') || '' : '';
  const storedKey = typeof window !== 'undefined' ? localStorage.getItem('movieduniya_supabase_key') || '' : '';

  return {
    url: storedUrl.trim() || envUrl.trim(),
    anonKey: storedKey.trim() || envKey.trim()
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('movieduniya_supabase_url', url.trim());
    localStorage.setItem('movieduniya_supabase_key', anonKey.trim());
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('http') && anonKey.length > 10);
}

// 2. Initialize Supabase Client dynamically
let supabaseInstance: SupabaseClient | null = null;
let currentConfigKey = '';

export function getSupabaseClient(): SupabaseClient | null {
  const config = getSupabaseConfig();
  if (!config.url || !config.anonKey) return null;

  const configKey = `${config.url}_${config.anonKey}`;
  if (supabaseInstance && currentConfigKey === configKey) {
    return supabaseInstance;
  }

  try {
    supabaseInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      }
    });
    currentConfigKey = configKey;
    return supabaseInstance;
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err);
    return null;
  }
}

// 3. Test Connection
export async function testSupabaseConnection(): Promise<{ success: boolean; message: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Supabase credentials not configured. Please enter your Supabase Project URL and Public Anon Key.'
    };
  }

  try {
    const { data, error } = await client.from('movies').select('id').limit(1);
    if (error) {
      // Table might not exist yet
      if (error.code === '42P01') {
        return {
          success: false,
          message: 'Connected to Supabase, but the "movies" table has not been created yet. Please execute the SQL schema below in your Supabase SQL Editor.'
        };
      }
      return {
        success: false,
        message: `Supabase error: ${error.message} (${error.code || 'UNKNOWN'})`
      };
    }
    return {
      success: true,
      message: `Connection successful! Found table with ${data ? data.length : 0} queryable records.`
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'Network error while attempting to connect to Supabase.'
    };
  }
}

// 4. Fetch Movies from Supabase
export async function fetchSupabaseMovies(): Promise<Movie[] | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  try {
    const { data, error } = await client
      .from('movies')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Supabase fetch error:', error);
      return null;
    }

    if (!data || !Array.isArray(data)) return null;

    // Map database snake_case columns to Movie interface
    const mapped: Movie[] = data.map((row: any) => ({
      id: row.id || `mov-${Date.now()}`,
      title: row.title || 'Untitled',
      description: row.description || '',
      poster: row.poster || '',
      backdrop: row.backdrop || row.poster || '',
      videoUrl: row.video_url || row.videoUrl || '',
      language: row.language || 'Punjabi',
      category: row.category || 'Latest',
      genre: Array.isArray(row.genre) ? row.genre : (typeof row.genre === 'string' ? row.genre.split(',').map((g: string) => g.trim()) : ['Entertainment']),
      releaseYear: Number(row.release_year || row.releaseYear) || 2024,
      duration: row.duration || '2h 10m',
      rating: row.rating || '8.5',
      isVIP: row.is_vip !== undefined ? Boolean(row.is_vip) : true,
      isPublished: row.is_published !== undefined ? Boolean(row.is_published) : true,
      isFeatured: Boolean(row.is_featured),
      isTrending: Boolean(row.is_trending),
      views: Number(row.views) || 0,
      createdAt: row.created_at || new Date().toISOString()
    }));

    return mapped;
  } catch (err) {
    console.error('Exception fetching from Supabase:', err);
    return null;
  }
}

// 5. Insert or Update Movie in Supabase
export async function upsertSupabaseMovie(movie: Movie): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  const row = {
    id: movie.id,
    title: movie.title,
    description: movie.description,
    poster: movie.poster,
    backdrop: movie.backdrop || movie.poster,
    video_url: movie.videoUrl,
    language: movie.language,
    category: movie.category,
    genre: movie.genre,
    release_year: movie.releaseYear,
    duration: movie.duration,
    rating: movie.rating,
    is_vip: movie.isVIP,
    is_published: movie.isPublished,
    is_featured: Boolean(movie.isFeatured),
    is_trending: Boolean(movie.isTrending),
    views: movie.views || 0,
    created_at: movie.createdAt || new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  try {
    const { error } = await client.from('movies').upsert(row);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to sync with Supabase.' };
  }
}

// 6. Delete Movie from Supabase
export async function deleteSupabaseMovie(id: string): Promise<{ success: boolean; error?: string }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  try {
    const { error } = await client.from('movies').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to delete from Supabase.' };
  }
}

// 7. Supabase SQL Schema for One-Click Database Creation & Row Level Security
export const SUPABASE_SQL_SCHEMA = `-- 1. Create MovieDuniya Movies Table
CREATE TABLE IF NOT EXISTS public.movies (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    poster TEXT NOT NULL,
    backdrop TEXT,
    video_url TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'Punjabi',
    category TEXT NOT NULL DEFAULT 'Latest',
    genre TEXT[] DEFAULT ARRAY['Action', 'Drama'],
    release_year INTEGER DEFAULT 2024,
    duration TEXT DEFAULT '2h 15m',
    rating TEXT DEFAULT '8.5',
    is_vip BOOLEAN DEFAULT true,
    is_published BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    is_trending BOOLEAN DEFAULT false,
    views BIGINT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;

-- 3. Public Read Policy: Allow anyone (even unauthenticated visitors) to read published movies
CREATE POLICY "Allow public read access to published movies"
ON public.movies
FOR SELECT
TO public
USING (is_published = true OR auth.role() = 'authenticated');

-- 4. Admin Write Policy: Allow authenticated users / admins full access
CREATE POLICY "Allow admin full access to movies"
ON public.movies
FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. Optional Indexing for fast search and category filtering
CREATE INDEX IF NOT EXISTS idx_movies_language ON public.movies(language);
CREATE INDEX IF NOT EXISTS idx_movies_category ON public.movies(category);
CREATE INDEX IF NOT EXISTS idx_movies_published ON public.movies(is_published);
`;
