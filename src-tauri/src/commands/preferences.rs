use crate::models::preferences::MergedPreferences;
use crate::services::preference_merger;
use tauri::AppHandle;
use tauri::Manager;

#[tauri::command]
pub fn get_merged_preferences(app: AppHandle) -> Result<MergedPreferences, String> {
    preference_merger::load_and_merge(app.clone()).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_preference(app: AppHandle, path: String, value: String) -> Result<(), String> {
    preference_merger::update_user_preference(app.clone(), &path, &value)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_raw_preferences(app: AppHandle, file_type: String) -> Result<String, String> {
    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    let prefs_dir = config_dir.join("preferences");

    let filename = match file_type.as_str() {
        "user" => "user.yaml",
        "org" => "org.yaml",
        _ => return Err(format!("Unknown preference file type: {}", file_type)),
    };

    let path = prefs_dir.join(filename);
    if path.exists() {
        std::fs::read_to_string(&path).map_err(|e| e.to_string())
    } else {
        // Return default content for new files
        match file_type.as_str() {
            "user" => Ok(include_str!("../../preferences/defaults.user.yaml").to_string()),
            "org" => Ok("# Organization preferences\n# Place org constraints here\nversion: \"1\"\n\norganization:\n  name: \"My Org\"\n  id: \"my-org\"\n".to_string()),
            _ => Ok(String::new()),
        }
    }
}

#[tauri::command]
pub fn save_raw_preferences(app: AppHandle, file_type: String, content: String) -> Result<(), String> {
    // Validate YAML before saving
    let _: serde_yaml::Value = serde_yaml::from_str(&content)
        .map_err(|e| format!("Invalid YAML: {}", e))?;

    let config_dir = app
        .path()
        .app_config_dir()
        .map_err(|e| e.to_string())?;
    let prefs_dir = config_dir.join("preferences");
    std::fs::create_dir_all(&prefs_dir).map_err(|e| e.to_string())?;

    let filename = match file_type.as_str() {
        "user" => "user.yaml",
        "org" => "org.yaml",
        _ => return Err(format!("Unknown preference file type: {}", file_type)),
    };

    let path = prefs_dir.join(filename);
    std::fs::write(&path, content).map_err(|e| e.to_string())
}
