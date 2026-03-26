use crate::models::ui_manifest::UiManifest;
use crate::services::spec_resolver;

#[tauri::command]
pub async fn resolve_manifest(domain: String) -> Result<UiManifest, String> {
    spec_resolver::resolve_manifest(&domain)
        .await
        .map_err(|e| e.to_string())
}
