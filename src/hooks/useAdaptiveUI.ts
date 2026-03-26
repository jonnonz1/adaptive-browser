import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { adaptiveLibrary } from "../lib/openui-library";
import {
  buildPromptContext,
  buildFullSystemPrompt,
  extractDataShape,
} from "../lib/prompt-context";
import { useDebugStore } from "../stores/debug";
import type { UiManifest, MergedPreferences } from "../lib/types";

interface AdaptiveUIState {
  response: string | null;
  isStreaming: boolean;
  error: string | null;
}

interface GenerateOptions {
  domain: string;
  capabilityId: string;
  apiData: unknown;
  manifest: UiManifest;
  preferences: MergedPreferences;
}

// Simple hash for cache keys (frontend-side)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

export function useAdaptiveUI() {
  const [state, setState] = useState<AdaptiveUIState>({
    response: null,
    isStreaming: false,
    error: null,
  });

  const { addEvent, setPromptInfo, setLlmResponse, setCacheStats } = useDebugStore.getState();

  const generate = useCallback(async (opts: GenerateOptions) => {
    const { domain, capabilityId, apiData, manifest, preferences } = opts;

    setState({ response: null, isStreaming: true, error: null });

    try {
      const capability = manifest.capabilities.find((c) => c.id === capabilityId);
      if (!capability) throw new Error(`Capability '${capabilityId}' not found`);

      const endpoint =
        capability.endpoints.find((e) => e.semantic === "list") ??
        capability.endpoints[0];
      if (!endpoint) throw new Error("No endpoints found");

      // Build cache key components
      const dataHash = simpleHash(JSON.stringify(apiData).slice(0, 2000));
      const prefsHash = simpleHash(JSON.stringify(preferences));

      // Check cache first
      addEvent("cache_check", { domain, capabilityId, dataHash, prefsHash });

      const cached = await invoke<string | null>("check_cache", {
        domain,
        capabilityId,
        dataHash,
        prefsHash,
      });

      if (cached) {
        addEvent("cache_hit", { domain, capabilityId, responseLength: cached.length });
        setState({ response: cached, isStreaming: false, error: null });

        // Update cache stats
        const stats = await invoke<{ entry_count: number; total_hits: number; max_entries: number }>("get_cache_stats");
        setCacheStats({ entryCount: stats.entry_count, totalHits: stats.total_hits, maxEntries: stats.max_entries });
        return;
      }

      addEvent("cache_miss", { domain, capabilityId });

      const dataShape = extractDataShape(apiData);

      // Build the context message
      const contextMessage = buildPromptContext({
        capability,
        endpoint,
        preferences,
        dataShape,
        serviceName: manifest.service.name,
      });

      const systemPrompt = buildFullSystemPrompt(adaptiveLibrary.prompt());

      const dataSlice = Array.isArray(apiData)
        ? (apiData as unknown[]).slice(0, 25)
        : apiData;

      const userMessage = `${contextMessage}

## Actual Data (use this to populate the UI)
\`\`\`json
${JSON.stringify(dataSlice, null, 2)}
\`\`\`

Generate the UI now using OpenUI Lang.`;

      // Store prompt info for debug panel
      setPromptInfo(systemPrompt, userMessage);
      addEvent("llm_request", {
        provider: "configured",
        systemPromptLength: systemPrompt.length,
        userMessageLength: userMessage.length,
      });

      const startTime = performance.now();

      // Call LLM
      const llmResponse = await invoke<string>("call_llm", {
        systemPrompt,
        userMessage,
      });

      const duration = Math.round(performance.now() - startTime);

      addEvent("llm_response", {
        responseLength: llmResponse.length,
        domain,
        capabilityId,
      }, duration);

      setLlmResponse(llmResponse);

      // Cache the response
      await invoke("store_cache", {
        domain,
        capabilityId,
        dataHash,
        prefsHash,
        response: llmResponse,
      });
      addEvent("cache_store", { domain, capabilityId });

      // Update cache stats
      const stats = await invoke<{ entry_count: number; total_hits: number; max_entries: number }>("get_cache_stats");
      setCacheStats({ entryCount: stats.entry_count, totalHits: stats.total_hits, maxEntries: stats.max_entries });

      const renderStart = performance.now();
      setState({ response: llmResponse, isStreaming: false, error: null });
      addEvent("render_complete", { capabilityId }, Math.round(performance.now() - renderStart));

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      addEvent("llm_error", { error: errorMsg });
      setState({
        response: null,
        isStreaming: false,
        error: errorMsg,
      });
    }
  }, [addEvent, setPromptInfo, setLlmResponse, setCacheStats]);

  return {
    ...state,
    generate,
    library: adaptiveLibrary,
  };
}
