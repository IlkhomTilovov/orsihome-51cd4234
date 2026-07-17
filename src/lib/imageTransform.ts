/**
 * Supabase image transformation helper.
 * Rewrites `.../storage/v1/object/public/<bucket>/<path>` to
 * `.../storage/v1/render/image/public/<bucket>/<path>?width=..&quality=..&resize=cover`
 * so images are served resized/compressed by Supabase (much smaller payloads).
 *
 * Non-Supabase URLs are returned unchanged.
 */
export function transformStorageUrl(
  url: string | undefined | null,
  opts: { width?: number; height?: number; quality?: number; resize?: 'cover' | 'contain' | 'fill' } = {}
): string {
  if (!url) return url || '';
  // Only transform Supabase public-object URLs
  if (!url.includes('/storage/v1/object/public/')) return url;
  // Don't double-transform
  if (url.includes('/storage/v1/render/image/')) return url;

  const { width, height, quality = 75, resize = 'cover' } = opts;
  const rendered = url.replace('/storage/v1/object/public/', '/storage/v1/render/image/public/');
  const params = new URLSearchParams();
  if (width) params.set('width', String(width));
  if (height) params.set('height', String(height));
  params.set('quality', String(quality));
  params.set('resize', resize);
  return `${rendered}?${params.toString()}`;
}
