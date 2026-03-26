use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

#[tauri::command]
pub fn store_token(app: AppHandle, token: String) -> Result<(), String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    store
        .set("token", serde_json::Value::String(token));
    store.save().map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn has_token(app: AppHandle) -> Result<bool, String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    Ok(store
        .get("token")
        .and_then(|v| v.as_str().map(|s| !s.is_empty()))
        .unwrap_or(false))
}

#[tauri::command]
pub fn get_token(app: AppHandle) -> Result<Option<String>, String> {
    let store = app.store("auth.json").map_err(|e| e.to_string())?;
    Ok(store
        .get("token")
        .and_then(|v| v.as_str().map(String::from)))
}
