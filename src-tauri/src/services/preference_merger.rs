use crate::models::preferences::*;
use std::path::PathBuf;
use tauri::AppHandle;
use tauri::Manager;

/// Get the preferences directory path
fn preferences_dir(app: &AppHandle) -> PathBuf {
    let config_dir = app
        .path()
        .app_config_dir()
        .unwrap_or_else(|_| PathBuf::from("."));
    config_dir.join("preferences")
}

/// Ensure the preferences directory exists and has default files
pub fn ensure_preferences_dir(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    let prefs_dir = preferences_dir(app);
    std::fs::create_dir_all(&prefs_dir)?;

    let user_prefs_path = prefs_dir.join("user.yaml");
    if !user_prefs_path.exists() {
        let default_prefs = include_str!("../../preferences/defaults.user.yaml");
        std::fs::write(&user_prefs_path, default_prefs)?;
    }

    Ok(())
}

/// Load user preferences from YAML
fn load_user_prefs(app: &AppHandle) -> Result<UserPreferences, Box<dyn std::error::Error>> {
    let path = preferences_dir(app).join("user.yaml");
    if path.exists() {
        let content = std::fs::read_to_string(&path)?;
        let prefs: UserPreferences = serde_yaml::from_str(&content)?;
        Ok(prefs)
    } else {
        Ok(UserPreferences::default())
    }
}

/// Load organization preferences if present
fn load_org_prefs(app: &AppHandle) -> Result<Option<OrgPreferences>, Box<dyn std::error::Error>> {
    let path = preferences_dir(app).join("org.yaml");
    if path.exists() {
        let content = std::fs::read_to_string(&path)?;
        let prefs: OrgPreferences = serde_yaml::from_str(&content)?;
        Ok(Some(prefs))
    } else {
        Ok(None)
    }
}

/// Merge org and user preferences, enforcing org constraints
pub fn load_and_merge(app: AppHandle) -> Result<MergedPreferences, Box<dyn std::error::Error>> {
    let user_prefs = load_user_prefs(&app)?;
    let org_prefs = load_org_prefs(&app)?;

    let mut constraints_applied = Vec::new();

    let merged_user = if let Some(ref org) = org_prefs {
        apply_constraints(user_prefs, org, &mut constraints_applied)
    } else {
        user_prefs
    };

    Ok(MergedPreferences {
        user: merged_user,
        org_name: org_prefs.map(|o| o.organization.name),
        constraints_applied: if constraints_applied.is_empty() {
            None
        } else {
            Some(constraints_applied)
        },
    })
}

/// Apply organizational constraints to user preferences
fn apply_constraints(
    mut user: UserPreferences,
    org: &OrgPreferences,
    applied: &mut Vec<String>,
) -> UserPreferences {
    if let Some(ref constraints) = org.constraints {
        // Apply display constraints
        if let Some(display_constraints) = constraints.get("display") {
            if let Some(ref mut display) = user.display {
                // Theme constraint
                if let Some(theme_constraint) = display_constraints.get("theme") {
                    if let Some(ref theme) = display.theme {
                        if let Some(allowed) = theme_constraint.get("allowed").and_then(|v| v.as_array()) {
                            let allowed_strs: Vec<&str> = allowed.iter().filter_map(|v| v.as_str()).collect();
                            if !allowed_strs.contains(&theme.as_str()) {
                                display.theme = theme_constraint
                                    .get("default")
                                    .and_then(|v| v.as_str())
                                    .map(String::from);
                                applied.push(format!("display.theme constrained to {:?}", allowed_strs));
                            }
                        }
                    }
                }

                // Density constraint
                if let Some(density_constraint) = display_constraints.get("density") {
                    if let Some(ref density) = display.density {
                        if let Some(allowed) = density_constraint.get("allowed").and_then(|v| v.as_array()) {
                            let allowed_strs: Vec<&str> = allowed.iter().filter_map(|v| v.as_str()).collect();
                            if !allowed_strs.contains(&density.as_str()) {
                                display.density = density_constraint
                                    .get("default")
                                    .and_then(|v| v.as_str())
                                    .map(String::from);
                                applied.push(format!("display.density constrained to {:?}", allowed_strs));
                            }
                        }
                    }
                }

                // Font size constraint
                if let Some(font_size_constraint) = display_constraints.get("fontSize") {
                    if let Some(ref mut size) = display.font_size {
                        if let Some(min) = font_size_constraint.get("min").and_then(|v| v.as_u64()) {
                            if (*size as u64) < min {
                                *size = min as u32;
                                applied.push(format!("display.fontSize clamped to min {}", min));
                            }
                        }
                        if let Some(max) = font_size_constraint.get("max").and_then(|v| v.as_u64()) {
                            if (*size as u64) > max {
                                *size = max as u32;
                                applied.push(format!("display.fontSize clamped to max {}", max));
                            }
                        }
                    }
                }
            }
        }

        // Apply defaults constraints (forced values)
        if let Some(defaults_constraints) = constraints.get("defaults") {
            if let Some(ref mut defaults) = user.defaults {
                if let Some(confirm_constraint) = defaults_constraints.get("confirmDestructive") {
                    if let Some(true) = confirm_constraint.get("forced").and_then(|v| v.as_bool()) {
                        // This is on the interaction prefs, handle it there
                        if let Some(ref mut interaction) = user.interaction {
                            interaction.confirm_destructive = Some(true);
                            applied.push("interaction.confirmDestructive forced to true".into());
                        }
                    }
                }

                if let Some(list_constraint) = defaults_constraints.get("listView") {
                    if let Some(ref list_view) = defaults.list_view {
                        if let Some(allowed) = list_constraint.get("allowed").and_then(|v| v.as_array()) {
                            let allowed_strs: Vec<&str> = allowed.iter().filter_map(|v| v.as_str()).collect();
                            if !allowed_strs.contains(&list_view.as_str()) {
                                defaults.list_view = list_constraint
                                    .get("default")
                                    .and_then(|v| v.as_str())
                                    .map(String::from);
                                applied.push(format!("defaults.listView constrained to {:?}", allowed_strs));
                            }
                        }
                    }
                }
            }
        }
    }

    // Apply required fields — union with user's visible fields
    if let Some(ref required_fields) = org.required_fields {
        let entities = user.entities.get_or_insert_with(Default::default);
        for (entity, required) in required_fields {
            let entry = entities.entry(entity.clone()).or_insert_with(|| EntityPreference {
                list_view: None,
                sort_by: None,
                sort_direction: None,
                visible_fields: None,
                group_by: None,
            });
            let visible = entry.visible_fields.get_or_insert_with(Vec::new);
            for field in required {
                if !visible.contains(field) {
                    visible.push(field.clone());
                    applied.push(format!("entities.{}.visibleFields: added required '{}'", entity, field));
                }
            }
        }
    }

    user
}

/// Update a single user preference value
pub fn update_user_preference(
    app: AppHandle,
    path: &str,
    value: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let prefs_path = preferences_dir(&app).join("user.yaml");
    let content = if prefs_path.exists() {
        std::fs::read_to_string(&prefs_path)?
    } else {
        String::new()
    };

    let mut doc: serde_yaml::Value = if content.is_empty() {
        serde_yaml::Value::Mapping(serde_yaml::Mapping::new())
    } else {
        serde_yaml::from_str(&content)?
    };

    // Parse the value
    let parsed_value: serde_yaml::Value = serde_yaml::from_str(value)
        .unwrap_or(serde_yaml::Value::String(value.to_string()));

    // Navigate the path and set the value
    let parts: Vec<&str> = path.split('.').collect();
    let mut current = &mut doc;
    for (i, part) in parts.iter().enumerate() {
        if i == parts.len() - 1 {
            if let serde_yaml::Value::Mapping(ref mut map) = current {
                map.insert(
                    serde_yaml::Value::String(part.to_string()),
                    parsed_value.clone(),
                );
            }
        } else {
            if let serde_yaml::Value::Mapping(ref mut map) = current {
                let key = serde_yaml::Value::String(part.to_string());
                if !map.contains_key(&key) {
                    map.insert(key.clone(), serde_yaml::Value::Mapping(serde_yaml::Mapping::new()));
                }
                current = map.get_mut(&key).unwrap();
            }
        }
    }

    let yaml_str = serde_yaml::to_string(&doc)?;
    std::fs::write(&prefs_path, yaml_str)?;

    Ok(())
}
