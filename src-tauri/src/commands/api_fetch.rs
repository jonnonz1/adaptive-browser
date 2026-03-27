use crate::services::spec_resolver;
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub async fn fetch_api_data(
    app: AppHandle,
    domain: String,
    capability_id: String,
) -> Result<serde_json::Value, String> {
    // Get stored token
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    let token = store
        .get("token")
        .and_then(|v| v.as_str().map(String::from));

    // Resolve the manifest to find the endpoint
    let manifest = spec_resolver::resolve_manifest(&domain)
        .await
        .map_err(|e| e.to_string())?;

    let capability = manifest
        .capabilities
        .iter()
        .find(|c| c.id == capability_id)
        .ok_or_else(|| format!("Capability '{}' not found", capability_id))?;

    // Use the first "list" endpoint by default
    let endpoint = capability
        .endpoints
        .iter()
        .find(|e| e.semantic == "list")
        .or(capability.endpoints.first())
        .ok_or_else(|| format!("No endpoints found for capability '{}'", capability_id))?;

    // Demo mode: return synthetic data
    if domain == "demo.pulse.dev" || domain == "demo" || domain == "pulse" {
        return Ok(crate::services::demo_data::get_demo_data(&capability_id));
    }

    // Build the URL
    let url = format!("https://{}{}", domain, endpoint.path);

    let client = reqwest::Client::new();
    let mut request = client.request(
        match endpoint.method.to_uppercase().as_str() {
            "POST" => reqwest::Method::POST,
            "PUT" => reqwest::Method::PUT,
            "DELETE" => reqwest::Method::DELETE,
            "PATCH" => reqwest::Method::PATCH,
            _ => reqwest::Method::GET,
        },
        &url,
    );

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
