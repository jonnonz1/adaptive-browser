import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { UiManifest, UiCapability, ServiceInfo } from "../lib/types";

interface NavigationState {
  currentUrl: string;
  currentService: ServiceInfo | null;
  capabilities: UiCapability[];
  activeCapability: string | null;
  apiData: unknown;
  isLoading: boolean;
  error: string | null;
  history: string[];

  navigateTo: (url: string) => Promise<void>;
  setActiveCapability: (id: string) => void;
  fetchCapabilityData: (capabilityId: string) => Promise<void>;
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentUrl: "",
  currentService: null,
  capabilities: [],
  activeCapability: null,
  apiData: null,
  isLoading: false,
  error: null,
  history: [],

  navigateTo: async (url: string) => {
    const cleanUrl = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    set({ currentUrl: cleanUrl, isLoading: true, error: null, apiData: null });

    try {
      const manifest = await invoke<UiManifest>("resolve_manifest", { domain: cleanUrl });
      set({
        currentService: manifest.service,
        capabilities: manifest.capabilities,
        activeCapability: manifest.capabilities[0]?.id || null,
        isLoading: false,
        history: [...get().history, cleanUrl],
      });

      // Auto-fetch first capability data
      if (manifest.capabilities[0]) {
        get().fetchCapabilityData(manifest.capabilities[0].id);
      }
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },

  setActiveCapability: (id: string) => {
    set({ activeCapability: id, apiData: null });
    get().fetchCapabilityData(id);
  },

  fetchCapabilityData: async (capabilityId: string) => {
    const { currentUrl } = get();
    if (!currentUrl) return;

    set({ isLoading: true, error: null });
    try {
      const data = await invoke("fetch_api_data", {
        domain: currentUrl,
        capabilityId,
      });
      set({ apiData: data, isLoading: false });
    } catch (err) {
      set({
        isLoading: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  },
}));
