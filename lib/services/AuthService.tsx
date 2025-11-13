import createAPIService from "./BaseAPI";

const apiService = createAPIService();

// Define Auth Types
export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  companyName: string;
}

export interface ResetPasswordRequestData {
  email: string;
}

export interface ResetPasswordData {
  token: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Auth Service
const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<User | null> => {
    const result = await apiService.post(data, "auth/signup");
    return result ? (result.data?.data || result.data || null) : null;
    
  },

  // Login user
  login: async (data: LoginData): Promise<{ token: string; user: User } | null> => {
    const result = await apiService.post(data, "auth/login");
    return result ? (result.data?.data || result.data || null) : null;
  },

  // Get current user profile
  getProfile: async (): Promise<User | null> => {
    const result = await apiService.get("auth/me");
    return result ? (result.data?.data || result.data || null) : null;
  },

  // Logout user
  logout: async () => {
    const result = await apiService.post({}, "auth/logout");
    return result ? (result.data?.data || result.data || null) : null;
  },

  // Request password reset (send email)
  requestPasswordReset: async (data: ResetPasswordRequestData) => {
    const result = await apiService.post(data, "auth/request-password-reset");
    return result ? (result.data?.data || result.data || null) : null;
  },

  // Reset password with token
  resetPassword: async (data: ResetPasswordData) => {
    const result = await apiService.post(data, "auth/reset-password");
    return result ? (result.data?.data || result.data || null) : null;
  },
};

export default authService;