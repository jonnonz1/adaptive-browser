mod commands;
mod models;
mod services;

use commands::{api_fetch, auth, llm, manifest, preferences};
use services::ui_cache::UiCache;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .manage(UiCache::new(100))
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
            preferences::get_raw_preferences,
            preferences::save_raw_preferences,
            llm::call_llm,
            llm::set_llm_config,
            llm::has_llm_config,
            commands::cache::check_cache,
            commands::cache::store_cache,
            commands::cache::get_cache_stats,
            commands::cache::clear_cache,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
