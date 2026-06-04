/* Tiny fetch wrapper for the admin API. Bearer token lives in sessionStorage. */
export const tokenStore = {
  get: () => sessionStorage.getItem("va_admin_token"),
  set: (t) => sessionStorage.setItem("va_admin_token", t),
  clear: () => sessionStorage.removeItem("va_admin_token"),
};

export async function api(path, opts = {}) {
  const headers = { "Content-Type": "application/json", ...(opts.headers || {}) };
  const token = tokenStore.get();
  if (token) headers["Authorization"] = "Bearer " + token;

  const res = await fetch(path, { ...opts, headers });
  if (res.status === 401) {
    tokenStore.clear();
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    let detail = res.statusText;
    try { detail = (await res.json()).detail || detail; } catch (_) {}
    throw new Error(detail);
  }
  if (res.status === 204) return null;
  return res.json();
}
