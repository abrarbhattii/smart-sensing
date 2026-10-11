import { SUPABASE_URL } from '../lib/env';
import people from '../images/home/people.jpg';

const MEDIA_BASE = `${SUPABASE_URL}/storage/v1/object/public/media/`;

// Images shipped with the site. The database refers to them as "/src/images/<folder>/<file>".
const BUNDLED_IMAGES = import.meta.glob('../images/**/*.{png,jpg,jpeg,gif,svg,webp}', { eager: true, import: 'default' });

export function mediaUrl(path) {
  return MEDIA_BASE + String(path).split('/').map(encodeURIComponent).join('/');
}

export const peopleFallback = people;

/**
 * Resolves stored image values: full URLs pass through, "/src/images/..." paths use the
 * bundled file, and legacy "./images/x.jpg" paths map to the media bucket.
 */
export function imageUrl(path, fallback = peopleFallback) {
  if (!path) return fallback;
  const value = String(path).trim().replace(/\\/g, '/');
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:') || value.startsWith('blob:')) return value;
  const bundled = value.match(/^\/?src\/images\/(.+)$/i);
  if (bundled) return BUNDLED_IMAGES[`../images/${bundled[1]}`] || fallback;
  const relative = value
    .replace(/^\.\//, '')
    .replace(/^\/+/, '')
    .replace(/^images\//, '');
  return mediaUrl(`images/${relative}`);
}
