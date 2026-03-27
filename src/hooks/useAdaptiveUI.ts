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

      // Clean the data: strip URL fields and noise, flatten nested objects, limit size
      const cleanedData = cleanDataForPrompt(apiData);

      const userMessage = `${contextMessage}

## Actual Data — Use These Real Values
${JSON.stringify(cleanedData, null, 2)}

Now generate OpenUI Lang. Use MetricGrid at the top with colorful summary stats derived from this data. Then render the main view (${dataShape.totalItems > 1 ? "DataTable or CardGrid" : "DetailView"}) populated with the actual values above. Use vibrant, varied colors.`;

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

      // Strip markdown code fences if the LLM wraps output in ```
      const cleanedResponse = llmResponse
        .replace(/^```[\w]*\n?/gm, "")
        .replace(/\n?```$/gm, "")
        .trim();

      setLlmResponse(cleanedResponse);

      // Cache the response
      await invoke("store_cache", {
        domain,
        capabilityId,
        dataHash,
        prefsHash,
        response: cleanedResponse,
      });
      addEvent("cache_store", { domain, capabilityId });

      // Update cache stats
      const stats = await invoke<{ entry_count: number; total_hits: number; max_entries: number }>("get_cache_stats");
      setCacheStats({ entryCount: stats.entry_count, totalHits: stats.total_hits, maxEntries: stats.max_entries });

      const renderStart = performance.now();
      setState({ response: cleanedResponse, isStreaming: false, error: null });
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

/**
 * Clean API data for the LLM prompt: strip URL noise, flatten nested objects,
 * limit to 20 items, truncate long strings. This dramatically reduces token
 * usage and helps the LLM focus on the actual content.
 */
function cleanDataForPrompt(data: unknown): unknown {
  if (Array.isArray(data)) {
    return data.slice(0, 20).map((item) =>
      typeof item === "object" && item !== null ? cleanObject(item as Record<string, unknown>) : item
    );
  }
  if (data && typeof data === "object") {
    return cleanObject(data as Record<string, unknown>);
  }
  return data;
}

function cleanObject(obj: Record<string, unknown>): Record<string, unknown> {
  const clean: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    // Skip URL fields and internal IDs — pure noise for UI generation
    if (key.endsWith("_url") || key === "url" || key === "node_id" || key === "gravatar_id") continue;
    if (key === "permissions" || key === "plan") continue; // GitHub noise

    if (value === null || value === undefined) {
      clean[key] = null;
    } else if (typeof value === "string") {
      clean[key] = value.length > 100 ? value.slice(0, 100) + "..." : value;
    } else if (typeof value === "number" || typeof value === "boolean") {
      clean[key] = value;
    } else if (typeof value === "object" && !Array.isArray(value)) {
      // Flatten nested objects to their display value
      const nested = value as Record<string, unknown>;
      clean[key] = nested.login ?? nested.name ?? nested.title ?? nested.label ?? `{object}`;
    } else if (Array.isArray(value)) {
      if (value.length === 0) {
        clean[key] = [];
      } else if (typeof value[0] === "object" && value[0] !== null) {
        // Array of objects — extract names/labels
        const items = value as Record<string, unknown>[];
        clean[key] = items.slice(0, 5).map((v) => v.name ?? v.login ?? v.title ?? v.label ?? "{item}");
      } else {
        clean[key] = value.slice(0, 5);
      }
    }
  }
  return clean;
}
