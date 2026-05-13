import axios from "axios";

const STORE_KEY = "rplms-auth";

function getStored(): { accessToken: string | null; refreshToken: string | null } {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return { accessToken: null, refreshToken: null };
    const parsed = JSON.parse(raw);
    return {
      accessToken: parsed?.state?.accessToken ?? null,
      refreshToken: parsed?.state?.refreshToken ?? null,
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function setAccessToken(token: string) {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.state.accessToken = token;
    localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
}

function clearTokens() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    parsed.state.accessToken = null;
    parsed.state.refreshToken = null;
    localStorage.setItem(STORE_KEY, JSON.stringify(parsed));
  } catch {
    // ignore
  }
  document.cookie = "rplms_access=; path=/; max-age=0";
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const { accessToken } = getStored();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { refreshToken } = getStored();
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/token/refresh/`,
          { refresh: refreshToken }
        );
        setAccessToken(data.access);
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch {
        clearTokens();
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default api;
