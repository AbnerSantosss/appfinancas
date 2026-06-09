/**
 * Cliente HTTP para a API REST do backend.
 * Substitui o supabaseClient.ts.
 * 
 * Usa VITE_API_URL como base (default: /api em produção via Nginx proxy).
 */

const API_BASE = import.meta.env.VITE_API_URL || '/api';

// ─── Gerenciamento de Token ─────────────────────────────

const TOKEN_KEY = 'sena_auth_token';
const USER_KEY = 'sena_auth_user';

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ─── Fetch Wrapper ──────────────────────────────────────

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = 'ApiError';
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    const message = body.error || `Erro ${response.status}`;

    // Se token expirado ou acesso bloqueado, limpa autenticação
    if (response.status === 401 || (response.status === 403 && message === 'Acesso bloqueado pelo administrador.')) {
      clearAuth();
      window.location.reload();
    }

    throw new ApiError(message, response.status);
  }

  return response.json();
}

// ─── API Methods ────────────────────────────────────────

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint, { method: 'GET' }),

  post: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),

  put: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),

  patch: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    }),

  delete: <T>(endpoint: string, data?: unknown) =>
    request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    }),
};

// ─── Auth API ───────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string) => {
    const result = await api.post<{ token: string; user: AuthUser }>(
      '/auth/login',
      { email, password }
    );
    setToken(result.token);
    setStoredUser(result.user);
    return result;
  },

  signup: (email: string, password: string, name?: string) =>
    api.post<{ user: AuthUser }>('/auth/signup', { email, password, name }),

  me: () => api.get<AuthUser>('/auth/me'),

  updateProfile: async (name: string) => {
    const user = await api.put<AuthUser>('/auth/profile', { name });
    setStoredUser(user);
    return user;
  },

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put<{ success: boolean }>('/auth/change-password', { currentPassword, newPassword }),

  forgotPassword: (email: string) =>
    api.post<{ success: boolean; message: string }>('/auth/forgot-password', { email }),

  logout: () => {
    clearAuth();
    window.location.reload();
  },

  verifyEmail: (token: string) =>
    api.post<{ success: boolean; message: string }>('/auth/verify-email', { token }),
};

// ─── Expenses API ───────────────────────────────────────

export interface ExpenseData {
  id: string;
  description: string;
  value: number;
  totalValue: number | null;
  type: string;
  installments: number | null;
  startMonth: string;
  category: string;
  paidMonths: string[];
  notes: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export const expensesApi = {
  list: () => api.get<ExpenseData[]>('/expenses'),

  create: (data: Omit<ExpenseData, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) =>
    api.post<ExpenseData>('/expenses', data),

  update: (id: string, data: Partial<ExpenseData>) =>
    api.put<ExpenseData>(`/expenses/${id}`, data),

  delete: (id: string) => api.delete<{ success: boolean }>(`/expenses/${id}`),

  togglePaid: (id: string, monthISO: string) =>
    api.patch<ExpenseData>(`/expenses/${id}/toggle-paid`, { monthISO }),

  markAllPaid: (monthISO: string) =>
    api.post<{ updated: number }>('/expenses/mark-all-paid', { monthISO }),

  resetAll: () => api.delete<{ success: boolean }>('/expenses/reset'),
};

// ─── Settings API ───────────────────────────────────────

export interface SmtpConfigResponse {
  configured: boolean;
  config: { host: string; port: number; user: string; pass: string; from: string } | null;
}

export const settingsApi = {
  getSalary: () => api.get<{ salary: number }>('/settings/salary'),
  updateSalary: (salary: number) => api.put<{ success: boolean; salary: number }>('/settings/salary', { salary }),

  getSmtp: () => api.get<SmtpConfigResponse>('/settings/smtp'),
  updateSmtp: (config: { host: string; port: number; user: string; pass: string; from: string }) =>
    api.put<{ success: boolean }>('/settings/smtp', config),
  testSmtp: (config: { host: string; port: number; user: string; pass: string; from: string }) =>
    api.post<{ success: boolean; message: string }>('/settings/smtp/test', config),
};

// ─── Family API ─────────────────────────────────────────

export interface FamilyMember {
  id: string;
  email: string;
  name: string | null;
  role: string;
  familyId: string | null;
  isEmailVerified: boolean;
  createdAt: string;
}

export const familyApi = {
  listMembers: () => api.get<FamilyMember[]>('/auth/family/members'),
  inviteMember: (email: string, password: string, name: string) =>
    api.post<{ user: FamilyMember; emailSent: boolean }>('/auth/family/invite', { email, password, name }),
  resendVerification: (userId: string) =>
    api.post<{ success: boolean; message: string }>(`/auth/users/${userId}/resend-verification`),
};

// ─── Admin API (User Management) ────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  role: string;
  familyId?: string | null;
  isActive: boolean;
  isEmailVerified: boolean;
  lastActiveAt?: string | null;
  createdAt: string;
  expenseCount: number;
}

export interface InviteResult {
  user: AdminUser;
  emailSent: boolean;
}

export interface ResetPasswordResult {
  newPassword: string;
  emailSent: boolean;
  userEmail: string;
}

export const adminApi = {
  listUsers: () => api.get<AdminUser[]>('/auth/users'),

  inviteUser: (email: string, password: string, name?: string) =>
    api.post<InviteResult>('/auth/invite', { email, password, name }),

  resetPassword: (userId: string) =>
    api.post<ResetPasswordResult>(`/auth/reset-password/${userId}`),

  deleteUser: (userId: string) =>
    api.delete<{ success: boolean; deletedEmail: string }>(`/auth/users/${userId}`),

  toggleStatus: (userId: string) =>
    api.patch<{ success: boolean }>(`/auth/users/${userId}/toggle-status`),

  resendVerification: (userId: string) =>
    api.post<{ success: boolean; message: string }>(`/auth/users/${userId}/resend-verification`),
};
