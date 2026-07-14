export function withBase(path = '/') {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalizedPath = path === '/' ? '/' : `/${path.replace(/^\/+/, '')}`;

  return `${base}${normalizedPath}`;
}
