use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn call_llm(
    app: AppHandle,
    system_prompt: String,
    user_message: String,
) -> Result<String, String> {
    // Get API key from store
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    let api_key = store
        .get("llm_api_key")
        .and_then(|v| v.as_str().map(String::from))
        .ok_or_else(|| "No LLM API key configured. Go to Settings and add your Anthropic API key.".to_string())?;

    let provider = store
        .get("llm_provider")
        .and_then(|v| v.as_str().map(String::from))
        .unwrap_or_else(|| "anthropic".to_string());

    match provider.as_str() {
        "anthropic" => call_anthropic(&api_key, &system_prompt, &user_message).await,
        "openai" => call_openai(&api_key, &system_prompt, &user_message).await,
        _ => Err(format!("Unknown LLM provider: {}", provider)),
    }
}

async fn call_anthropic(
    api_key: &str,
    system_prompt: &str,
    user_message: &str,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": "claude-sonnet-4-20250514",
        "max_tokens": 4096,
        "system": system_prompt,
        "messages": [
            {
                "role": "user",
                "content": user_message
            }
        ]
    });

    let response = client
        .post("https://api.anthropic.com/v1/messages")
        .header("x-api-key", api_key)
        .header("anthropic-version", "2023-06-01")
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_default();
        return Err(format!("Anthropic API error {}: {}", status, error_body));
    }

    let result: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    // Extract text from the response
    let text = result["content"]
        .as_array()
        .and_then(|arr| arr.iter().find(|block| block["type"] == "text"))
        .and_then(|block| block["text"].as_str())
        .ok_or_else(|| "No text content in Anthropic response".to_string())?;

    Ok(text.to_string())
}

async fn call_openai(
    api_key: &str,
    system_prompt: &str,
    user_message: &str,
) -> Result<String, String> {
    let client = reqwest::Client::new();

    let body = serde_json::json!({
        "model": "gpt-4o",
        "max_tokens": 4096,
        "messages": [
            {
                "role": "system",
                "content": system_prompt
            },
            {
                "role": "user",
                "content": user_message
            }
        ]
    });

    let response = client
        .post("https://api.openai.com/v1/chat/completions")
        .header("Authorization", format!("Bearer {}", api_key))
        .header("content-type", "application/json")
        .json(&body)
        .send()
        .await
        .map_err(|e| format!("HTTP error: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let error_body = response.text().await.unwrap_or_default();
        return Err(format!("OpenAI API error {}: {}", status, error_body));
    }

    let result: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;

    let text = result["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| "No text content in OpenAI response".to_string())?;

    Ok(text.to_string())
}

#[tauri::command]
pub fn set_llm_config(
    app: AppHandle,
    api_key: String,
    provider: Option<String>,
) -> Result<(), String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    store.set("llm_api_key", serde_json::Value::String(api_key));
    if let Some(p) = provider {
        store.set("llm_provider", serde_json::Value::String(p));
    }
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn has_llm_config(app: AppHandle) -> Result<bool, String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    Ok(store
        .get("llm_api_key")
        .and_then(|v| v.as_str().map(|s| !s.is_empty()))
        .unwrap_or(false))
}
