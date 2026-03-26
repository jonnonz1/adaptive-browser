mod commands;
mod models;
mod services;

use commands::{api_fetch, auth, manifest, preferences};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }

            // Initialize preferences directory
            services::preference_merger::ensure_preferences_dir(app.handle())?;

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            manifest::resolve_manifest,
            api_fetch::fetch_api_data,
            auth::store_token,
            auth::has_token,
            auth::get_token,
            preferences::get_merged_preferences,
            preferences::update_preference,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
