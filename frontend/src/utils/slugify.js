// utils/slugify.js
export function createHybridSlug(title = '', id = '') {
  const cleanTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-alphanumeric chars
    .replace(/[\s_-]+/g, '-')  // Replace spaces and underscores with a single hyphen
    .replace(/^-+|-+$/g, '');  // Trim leading/trailing hyphens

  return `${cleanTitle}--${id}`;
}

export function extractIdFromHybridSlug(slug = '') {
  // Splits on the double-hyphen delimiter to retrieve the Mongo ObjectId
  const parts = slug.split('--');
  return parts.length > 1 ? parts[parts.length - 1] : slug;
}
