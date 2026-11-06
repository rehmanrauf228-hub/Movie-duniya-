/**
 * Resolves static asset paths correctly across both local root development
 * and subpath deployments such as GitHub Pages (/Movie-duniya/).
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  // If already an external URL or data URI, return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}
