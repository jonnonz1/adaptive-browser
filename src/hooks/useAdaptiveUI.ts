import { useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { adaptiveLibrary } from "../lib/openui-library";
import {
  buildPromptContext,
  buildFullSystemPrompt,
  extractDataShape,
} from "../lib/prompt-context";
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

export function useAdaptiveUI() {
  const [state, setState] = useState<AdaptiveUIState>({
    response: null,
    isStreaming: false,
    error: null,
  });

  const generate = useCallback(async (opts: GenerateOptions) => {
    const { capabilityId, apiData, manifest, preferences } = opts;

    setState({ response: null, isStreaming: true, error: null });

    try {
      const capability = manifest.capabilities.find((c) => c.id === capabilityId);
      if (!capability) throw new Error(`Capability '${capabilityId}' not found`);

      const endpoint =
        capability.endpoints.find((e) => e.semantic === "list") ??
        capability.endpoints[0];
      if (!endpoint) throw new Error("No endpoints found");

      const dataShape = extractDataShape(apiData);

      // Build the context message
      const contextMessage = buildPromptContext({
        capability,
        endpoint,
        preferences,
        dataShape,
        serviceName: manifest.service.name,
      });

      // Build system prompt from library + our additions
      const systemPrompt = buildFullSystemPrompt(adaptiveLibrary.prompt());

      // Build the user message with actual data
      const dataSlice = Array.isArray(apiData)
        ? (apiData as unknown[]).slice(0, 25)
        : apiData;

      const userMessage = `${contextMessage}

## Actual Data (use this to populate the UI)
\`\`\`json
${JSON.stringify(dataSlice, null, 2)}
\`\`\`

Generate the UI now using OpenUI Lang.`;

      // Call LLM via Tauri backend
      const llmResponse = await invoke<string>("call_llm", {
        systemPrompt,
        userMessage,
      });

      setState({ response: llmResponse, isStreaming: false, error: null });
    } catch (err) {
      setState({
        response: null,
        isStreaming: false,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }, []);

  return {
    ...state,
    generate,
    library: adaptiveLibrary,
  };
}
