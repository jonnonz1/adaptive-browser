import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { adaptiveLibrary } from "../lib/openui-library";
import {
  buildPromptContext,
  buildFullSystemPrompt,
  extractDataShape,
} from "../lib/prompt-context";
import { useDebugStore } from "../stores/debug";
import { DEMO_RESPONSES } from "../lib/demo-responses";
import { generateUI } from "../lib/ui-generator";
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

      // Check for pre-baked demo responses (no LLM needed)
      const demoResponse = DEMO_RESPONSES[capabilityId];
      if (demoResponse && (domain === "demo.pulse.dev" || domain === "demo" || domain === "pulse")) {
        addEvent("cache_hit", { domain, capabilityId, source: "demo", responseLength: demoResponse.length });
        setLlmResponse(demoResponse);
        setState({ response: demoResponse, isStreaming: false, error: null });
        return;
      }

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

      // ── Strategy 1: Deterministic UI generator (instant, no LLM needed) ──
      const generatedUI = generateUI({
        capability,
        endpoint,
        preferences,
        data: apiData,
        serviceName: manifest.service.name,
      });

      if (generatedUI) {
        const genStart = performance.now();
        const genDuration = Math.round(performance.now() - genStart);
        addEvent("render_complete", { source: "generator", capabilityId, responseLength: generatedUI.length }, genDuration);
        setLlmResponse(generatedUI, undefined);
        setPromptInfo("(deterministic generator — no LLM used)", `Entity: ${endpoint.entity}\nSemantic: ${endpoint.semantic}\nView: ${preferences.entities?.[endpoint.entity]?.listView ?? preferences.defaults?.listView ?? endpoint.defaultView ?? "table"}\nItems: ${Array.isArray(apiData) ? (apiData as unknown[]).length : 1}`);

        // Cache the deterministic result too
        await invoke("store_cache", { domain, capabilityId, dataHash, prefsHash, response: generatedUI });
        const stats = await invoke<{ entry_count: number; total_hits: number; max_entries: number }>("get_cache_stats");
        setCacheStats({ entryCount: stats.entry_count, totalHits: stats.total_hits, maxEntries: stats.max_entries });

        setState({ response: generatedUI, isStreaming: false, error: null });
        return;
      }

      // ── Strategy 2: LLM generation (richer but requires API key) ──
      const dataShape = extractDataShape(apiData);

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

      setPromptInfo(systemPrompt, userMessage);
      addEvent("llm_request", {
        provider: "configured",
        systemPromptLength: systemPrompt.length,
        userMessageLength: userMessage.length,
      });

      const startTime = performance.now();

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
