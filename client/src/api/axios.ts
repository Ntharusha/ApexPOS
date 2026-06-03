// Centralized API utility — wraps native fetch with auth token injection
// Using native fetch to avoid requiring axios installation

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

function getToken(): string | null {
    try {
        const stored = localStorage.getItem('apex-pos-storage');
        if (stored) {
            const parsed = JSON.parse(stored);
            return parsed?.state?.token ?? null;
        }
    } catch (_) { }
    return null;
}

function buildHeaders(extra?: Record<string, string>): Record<string, string> {
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...extra,
    };
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
}

async function request<T>(
    method: string,
    path: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
): Promise<T> {
    const res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: buildHeaders(extraHeaders),
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    // Handle 401 globally
    if (res.status === 401) {
        localStorage.removeItem('apex-pos-storage');
        // Keep redirect simple; avoid full page reload if you have a router-aware approach.
        window.location.href = '/login';
        throw new Error('Unauthorized');
    }


    const contentType = res.headers.get('content-type') || '';
    const text = await res.text();

    if (!text) return {} as T;

    // Only parse JSON when the server actually returns JSON.
    if (contentType.includes('application/json')) {
        const data = JSON.parse(text);
        if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
        return data as T;
    }

    // Non-JSON responses: surface the raw body.
    if (!res.ok) throw new Error(text || `HTTP ${res.status}`);
    return text as unknown as T;

}

const api = {
    get: <T>(path: string) => request<T>('GET', path),
    post: <T>(path: string, body: unknown) => request<T>('POST', path, body),
    patch: <T>(path: string, body: unknown) => request<T>('PATCH', path, body),
    put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
    delete: <T>(path: string) => request<T>('DELETE', path),
};

export default api;
