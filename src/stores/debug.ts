import { create } from "zustand";

export type DebugEventType =
  | "manifest_resolve"
  | "api_fetch"
  | "cache_check"
  | "cache_hit"
  | "cache_miss"
  | "cache_store"
  | "llm_request"
  | "llm_response"
  | "llm_error"
  | "render_start"
  | "render_complete"
  | "preference_load";

export interface DebugEvent {
  id: string;
  type: DebugEventType;
  timestamp: number;
  duration?: number;
  data: Record<string, unknown>;
}

interface DebugState {
  isOpen: boolean;
  events: DebugEvent[];
  activeTab: "events" | "prompt" | "cache" | "performance";

  // Current prompt info (persisted across renders)
  lastSystemPrompt: string | null;
  lastUserMessage: string | null;
  lastLlmResponse: string | null;
  lastTokenUsage: { input: number; output: number } | null;

  // Cache stats
  cacheStats: { entryCount: number; totalHits: number; maxEntries: number } | null;

  toggle: () => void;
  open: () => void;
  close: () => void;
  setTab: (tab: DebugState["activeTab"]) => void;
  addEvent: (type: DebugEventType, data: Record<string, unknown>, duration?: number) => void;
  setPromptInfo: (system: string, user: string) => void;
  setLlmResponse: (response: string, tokens?: { input: number; output: number }) => void;
  setCacheStats: (stats: DebugState["cacheStats"]) => void;
  clearEvents: () => void;
}

let eventCounter = 0;

export const useDebugStore = create<DebugState>((set) => ({
  isOpen: false,
  events: [],
  activeTab: "events",
  lastSystemPrompt: null,
  lastUserMessage: null,
  lastLlmResponse: null,
  lastTokenUsage: null,
  cacheStats: null,

  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  setTab: (tab) => set({ activeTab: tab }),

  addEvent: (type, data, duration) =>
    set((s) => ({
      events: [
        {
          id: `evt-${++eventCounter}`,
          type,
          timestamp: Date.now(),
          duration,
          data,
        },
        ...s.events,
      ].slice(0, 200), // Keep last 200 events
    })),

  setPromptInfo: (system, user) =>
    set({ lastSystemPrompt: system, lastUserMessage: user }),

  setLlmResponse: (response, tokens) =>
    set({ lastLlmResponse: response, lastTokenUsage: tokens ?? null }),

  setCacheStats: (stats) => set({ cacheStats: stats }),

  clearEvents: () =>
    set({
      events: [],
      lastSystemPrompt: null,
      lastUserMessage: null,
      lastLlmResponse: null,
      lastTokenUsage: null,
    }),
}));
