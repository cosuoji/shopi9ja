import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '../api/client';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      store: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // Safely update or merge store metadata
      setStore: (updatedStore) =>
        set((state) => ({
          store: state.store ? { ...state.store, ...updatedStore } : updatedStore,
        })),

      // Login action
      login: async (credentials) => {
        set({ isLoading: true });
        try {
          const res = await api.post('/api/auth/login', credentials);
          const { user, token, store } = res.data;

          // Attach token to API client defaults
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

          set({ user, token, store, isAuthenticated: true, isLoading: false });
          return { success: true };
        } catch (error) {
          set({ isLoading: false });
          return {
            success: false,
            message: error.response?.data?.message || 'Login failed',
          };
        }
      },

      // Logout action
      logout: () => {
        delete api.defaults.headers.common['Authorization'];
        set({ user: null, store: null, token: null, isAuthenticated: false });
      },

      // Initialize token on initial app load / page refresh
      initializeAuth: () => {
        const token = get().token;
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
          delete api.defaults.headers.common['Authorization'];
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        store: state.store,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        // Automatically sync Axios headers as soon as Zustand finishes reading localStorage
        if (state?.token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
        }
      },
    }
  )
);
