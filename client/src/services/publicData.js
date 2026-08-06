const BASE_URL = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');

const jsonCache = new Map();

export function getPublicAssetPath(relativePath) {
  const cleanPath = String(relativePath || '').replace(/^\/+/, '');
  return `${BASE_URL}${cleanPath}`;
}

export async function fetchPublicJson(relativePath) {
  const path = getPublicAssetPath(relativePath);
  if (!jsonCache.has(path)) {
    jsonCache.set(
      path,
      fetch(path).then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to fetch ${relativePath}`);
        }
        return response.json();
      }),
    );
  }
  return jsonCache.get(path);
}

export function normalizeProperty(property) {
  const typeValue = property?.type ?? property?.['type: '] ?? '';
  const bathroomsValue = property?.bathrooms ?? property?.['bathrooms: '] ?? 0;
  const imageValue = property?.image || property?.images?.[0]?.url || '';

  return {
    ...property,
    type: typeValue,
    bathrooms: Number(bathroomsValue) || 0,
    image: imageValue,
    images: property?.images?.length
      ? property.images
      : imageValue
        ? [{ url: imageValue }]
        : [],
  };
}
