import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common["Authorization"];
  }
};

// API functions
export const authApi = {
  getMe: () => api.get("/auth/me"),
  updateProfile: (data: { firstName: string; lastName: string }) =>
    api.put("/auth/profile", data),
};

export const testsApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get("/tests", { params }),
  getById: (id: string) => api.get(`/tests/${id}`),
  create: (formData: FormData) =>
    api.post("/tests", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id: string, formData: FormData) =>
    api.put(`/tests/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  delete: (id: string) => api.delete(`/tests/${id}`),
  download: (id: string) => api.get(`/tests/${id}/download`),
};

export const attemptsApi = {
  getAll: (params?: { status?: string; testId?: string; page?: number }) =>
    api.get("/attempts", { params }),
  getById: (id: string) => api.get(`/attempts/${id}`),
  submit: (formData: FormData) =>
    api.post("/attempts", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  claim: (id: string) => api.post(`/attempts/${id}/claim`),
  grade: (id: string, data: { obtainedMarks: number; feedback?: string }) =>
    api.put(`/attempts/${id}/grade`, data),
  reject: (id: string, data: { feedback: string }) =>
    api.put(`/attempts/${id}/reject`, data),
};

export const checkersApi = {
  getAll: () => api.get("/checkers"),
  getById: (id: string) => api.get(`/checkers/${id}`),
  getMyStats: () => api.get("/checkers/me/stats"),
  create: (data: any) => api.post("/checkers", data),
  update: (id: string, data: any) => api.put(`/checkers/${id}`, data),
  remove: (id: string) => api.delete(`/checkers/${id}`),
};

export const testSeriesApi = {
  getAll: (params?: { status?: string; page?: number; limit?: number }) =>
    api.get("/test-series", { params }),
  getById: (id: string) => api.get(`/test-series/${id}`),
  create: (data: {
    title: string;
    description?: string;
    price: number;
    numberOfTests: number;
    subject?: string;
    status?: string;
  }) => api.post("/test-series", data),
  update: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      price: number;
      numberOfTests: number;
      subject: string;
      status: string;
    }>
  ) => api.put(`/test-series/${id}`, data),
  delete: (id: string) => api.delete(`/test-series/${id}`),
  linkTests: (id: string, testIds: string[]) =>
    api.put(`/test-series/${id}/link-tests`, { testIds }),
};

export const purchasesApi = {
  getAll: (params?: { page?: number; limit?: number }) =>
    api.get("/purchases", { params }),
  getMySeries: () => api.get("/purchases/my-series"),
  create: (data: { testSeriesId: string; paymentReference?: string }) =>
    api.post("/purchases", data),
};

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getCheckerReport: () => api.get("/admin/reports/checkers"),
  getTestReport: () => api.get("/admin/reports/tests"),
  getSales: () => api.get("/admin/sales"),
  overrideAttempt: (
    id: string,
    data: { obtainedMarks?: number; feedback?: string }
  ) => api.put(`/admin/attempts/${id}/override`, data),
};

export const usersApi = {
  getAll: (params?: { role?: string; page?: number; limit?: number }) =>
    api.get("/users", { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  updateRole: (id: string, role: string) =>
    api.patch(`/users/${id}/role`, { role }),
  updateStatus: (id: string, isActive: boolean) =>
    api.patch(`/users/${id}/status`, { isActive }),
};

