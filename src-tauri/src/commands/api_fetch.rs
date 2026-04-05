use crate::services::spec_resolver;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn fetch_api_data(
    app: AppHandle,
    domain: String,
    capability_id: String,
) -> Result<serde_json::Value, String> {
    // Resolve the manifest to find the endpoint
    let manifest = spec_resolver::resolve_manifest(&domain)
        .await
        .map_err(|e| e.to_string())?;

    let capability = manifest
        .capabilities
        .iter()
        .find(|c| c.id == capability_id)
        .ok_or_else(|| format!("Capability '{}' not found", capability_id))?;

    let endpoint = capability
        .endpoints
        .iter()
        .find(|e| e.semantic == "list")
        .or(capability.endpoints.first())
        .ok_or_else(|| format!("No endpoints found for capability '{}'", capability_id))?;

    // Demo mode
    if domain == "demo.pulse.dev" || domain == "demo" || domain == "pulse" {
        return Ok(crate::services::demo_data::get_demo_data(&capability_id));
    }

    // Hacker News: special two-step fetch (IDs → items)
    if domain == "news.ycombinator.com" || domain == "hackernews" || domain == "hn" {
        return fetch_hn_stories(&endpoint.path).await;
    }

    // Generic API fetch
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    let token = store
        .get("token")
        .and_then(|v| v.as_str().map(String::from));

    let url = format!("https://{}{}", domain, endpoint.path);

    let client = reqwest::Client::new();
    let mut request = client.get(&url);
    request = request.header("Accept", "application/vnd.github+json");
    request = request.header("User-Agent", "Adaptive-Browser/0.1.0");

    if let Some(ref token) = token {
        request = request.header("Authorization", format!("Bearer {}", token));
    }

    let response = request.send().await.map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        return Err(format!("API error {}: {}", status, body));
    }

    let data: serde_json::Value = response.json().await.map_err(|e| e.to_string())?;
    Ok(data)
}

/// Fetch Hacker News stories: get IDs, then fetch top 30 items concurrently.
async fn fetch_hn_stories(path: &str) -> Result<serde_json::Value, String> {
    let base = "https://hacker-news.firebaseio.com/v0";
    let client = reqwest::Client::new();

    // Step 1: Get story IDs
    let ids_url = format!("{}{}.json", base, path);
    let ids_response = client
        .get(&ids_url)
        .send()
        .await
        .map_err(|e| format!("Failed to fetch HN story IDs: {}", e))?;

    let ids: Vec<u64> = ids_response
        .json()
        .await
        .map_err(|e| format!("Failed to parse HN IDs: {}", e))?;

    // Step 2: Fetch top 30 items concurrently
    let fetch_count = ids.len().min(30);
    let mut handles = Vec::with_capacity(fetch_count);

    for &id in ids.iter().take(fetch_count) {
        let client = client.clone();
        let url = format!("{}/item/{}.json", base, id);
        handles.push(tokio::spawn(async move {
            let resp = client.get(&url).send().await.ok()?;
            let item: serde_json::Value = resp.json().await.ok()?;
            Some(item)
        }));
    }

    let mut stories = Vec::with_capacity(fetch_count);
    for handle in handles {
        if let Ok(Some(item)) = handle.await {
            // Convert unix timestamp to human-readable and extract domain
            let mut story = item.clone();
            if let Some(obj) = story.as_object_mut() {
                // Add human-readable time
                if let Some(time) = obj.get("time").and_then(|t| t.as_u64()) {
                    let now = std::time::SystemTime::now()
                        .duration_since(std::time::UNIX_EPOCH)
                        .unwrap_or_default()
                        .as_secs();
                    let ago = now.saturating_sub(time);
                    let time_ago = if ago < 60 {
                        format!("{}s ago", ago)
                    } else if ago < 3600 {
                        format!("{}m ago", ago / 60)
                    } else if ago < 86400 {
                        format!("{}h ago", ago / 3600)
                    } else {
                        format!("{}d ago", ago / 86400)
                    };
                    obj.insert("time_ago".into(), serde_json::Value::String(time_ago));
                }

                // Extract domain from URL
                if let Some(url) = obj.get("url").and_then(|u| u.as_str()) {
                    if let Ok(parsed) = url::Url::parse(url) {
                        if let Some(host) = parsed.host_str() {
                            let domain = host.strip_prefix("www.").unwrap_or(host);
                            obj.insert("domain".into(), serde_json::Value::String(domain.to_string()));
                        }
                    }
                }

                // Rename 'descendants' to 'comments' for clarity
                if let Some(d) = obj.remove("descendants") {
                    obj.insert("comments".into(), d);
                }
            }
            stories.push(story);
        }
    }

    Ok(serde_json::Value::Array(stories))
}
