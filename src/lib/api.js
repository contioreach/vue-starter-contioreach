/* The client's only door to data. Everything goes through the app's own API
   server on the same origin — the CMS hostname and key are never here, and
   never in the bundle. */
async function request(path) {
  const response = await fetch(path, { headers: { Accept: "application/json" } });

  if (!response.ok) {
    const error = new Error(`Request failed: ${response.status}`);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

export const getConfig = () => request("/api/config");

export function getListing({ page = 1, limit, category } = {}) {
  const params = new URLSearchParams({ page: String(page) });
  if (limit) params.set("limit", String(limit));
  if (category) params.set("category", category);
  return request(`/api/listing?${params}`);
}

export const getPost = (slug) => request(`/api/posts/${encodeURIComponent(slug)}`);
export const getCategory = (slug) => request(`/api/categories/${encodeURIComponent(slug)}`);
