import { create } from "zustand";

interface SettingsState {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
}));
