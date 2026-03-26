use crate::services::ui_cache::{CacheStats, UiCache};
use tauri::State;

#[tauri::command]
pub fn check_cache(
    cache: State<'_, UiCache>,
    domain: String,
    capability_id: String,
    data_hash: String,
    prefs_hash: String,
) -> Option<String> {
    let key = UiCache::cache_key(&domain, &capability_id, &data_hash, &prefs_hash);
    cache.get(&key).map(|entry| entry.response)
}

#[tauri::command]
pub fn store_cache(
    cache: State<'_, UiCache>,
    domain: String,
    capability_id: String,
    data_hash: String,
    prefs_hash: String,
    response: String,
) {
    let key = UiCache::cache_key(&domain, &capability_id, &data_hash, &prefs_hash);
    // Cache for 30 minutes
    cache.put(key, response, 1800);
}

#[tauri::command]
pub fn get_cache_stats(cache: State<'_, UiCache>) -> CacheStats {
    cache.stats()
}

#[tauri::command]
pub fn clear_cache(cache: State<'_, UiCache>) {
    cache.clear();
}
