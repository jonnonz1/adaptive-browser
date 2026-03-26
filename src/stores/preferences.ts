import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { MergedPreferences } from "../lib/types";

interface PreferencesState {
  preferences: MergedPreferences | null;
  isLoading: boolean;

  loadPreferences: () => Promise<void>;
  updatePreference: (path: string, value: unknown) => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set) => ({
  preferences: null,
  isLoading: false,

  loadPreferences: async () => {
    set({ isLoading: true });
    try {
      const prefs = await invoke<MergedPreferences>("get_merged_preferences");
      set({ preferences: prefs, isLoading: false });
    } catch (err) {
      console.error("Failed to load preferences:", err);
      set({ isLoading: false });
    }
  },

  updatePreference: async (path: string, value: unknown) => {
    try {
      await invoke("update_preference", { path, value: JSON.stringify(value) });
      // Reload merged preferences
      const prefs = await invoke<MergedPreferences>("get_merged_preferences");
      set({ preferences: prefs });
    } catch (err) {
      console.error("Failed to update preference:", err);
    }
  },
}));
