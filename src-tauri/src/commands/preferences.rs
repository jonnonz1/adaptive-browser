use crate::models::preferences::MergedPreferences;
use crate::services::preference_merger;
use tauri::AppHandle;

#[tauri::command]
pub fn get_merged_preferences(app: AppHandle) -> Result<MergedPreferences, String> {
    preference_merger::load_and_merge(app.clone()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_preference(app: AppHandle, path: String, value: String) -> Result<(), String> {
    preference_merger::update_user_preference(app.clone(), &path, &value)
        .map_err(|e| e.to_string())
}
