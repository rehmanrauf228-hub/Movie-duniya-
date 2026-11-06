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
  const rawBase = import.meta.env.BASE_URL || './';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
  const cleanPath = path.replace(/^\//, '');
  return `${base}${cleanPath}`;
}
