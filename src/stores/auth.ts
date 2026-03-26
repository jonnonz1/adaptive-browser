import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";

interface AuthState {
  isAuthenticated: boolean;
  isAuthDialogOpen: boolean;

  showAuthDialog: () => void;
  hideAuthDialog: () => void;
  setToken: (token: string) => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  isAuthDialogOpen: false,

  showAuthDialog: () => set({ isAuthDialogOpen: true }),
  hideAuthDialog: () => set({ isAuthDialogOpen: false }),

  setToken: async (token: string) => {
    try {
      await invoke("store_token", { token });
      set({ isAuthenticated: true });
    } catch (err) {
      console.error("Failed to store token:", err);
    }
  },

  checkAuth: async () => {
    try {
      const hasToken = await invoke<boolean>("has_token");
      set({ isAuthenticated: hasToken });
    } catch {
      set({ isAuthenticated: false });
    }
  },
}));
