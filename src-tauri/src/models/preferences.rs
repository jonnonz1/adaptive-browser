use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct UserPreferences {
    pub version: Option<String>,
    pub identity: Option<IdentityPrefs>,
    pub display: Option<DisplayPrefs>,
    pub defaults: Option<DefaultPrefs>,
    pub interaction: Option<InteractionPrefs>,
    pub entities: Option<HashMap<String, EntityPreference>>,
    pub services: Option<HashMap<String, serde_json::Value>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct IdentityPrefs {
    #[serde(rename = "displayName")]
    pub display_name: Option<String>,
    pub role: Option<String>,
    pub timezone: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DisplayPrefs {
    pub theme: Option<String>,
    pub density: Option<String>,
    #[serde(rename = "fontSize")]
    pub font_size: Option<u32>,
    #[serde(rename = "fontFamily")]
    pub font_family: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DefaultPrefs {
    #[serde(rename = "listView")]
    pub list_view: Option<String>,
    #[serde(rename = "detailView")]
    pub detail_view: Option<String>,
    #[serde(rename = "pageSize")]
    pub page_size: Option<u32>,
    #[serde(rename = "dateFormat")]
    pub date_format: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InteractionPrefs {
    #[serde(rename = "confirmDestructive")]
    pub confirm_destructive: Option<bool>,
    #[serde(rename = "keyboardShortcutsEnabled")]
    pub keyboard_shortcuts_enabled: Option<bool>,
    #[serde(rename = "inlineEditing")]
    pub inline_editing: Option<bool>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EntityPreference {
    #[serde(rename = "listView")]
    pub list_view: Option<String>,
    #[serde(rename = "sortBy")]
    pub sort_by: Option<String>,
    #[serde(rename = "sortDirection")]
    pub sort_direction: Option<String>,
    #[serde(rename = "visibleFields")]
    pub visible_fields: Option<Vec<String>>,
    #[serde(rename = "groupBy")]
    pub group_by: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrgPreferences {
    pub version: Option<String>,
    pub organization: OrgInfo,
    pub constraints: Option<serde_json::Value>,
    pub defaults: Option<serde_json::Value>,
    #[serde(rename = "requiredFields")]
    pub required_fields: Option<HashMap<String, Vec<String>>>,
    pub workflows: Option<Vec<serde_json::Value>>,
    #[serde(rename = "allowedServices")]
    pub allowed_services: Option<Vec<AllowedService>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OrgInfo {
    pub name: String,
    pub id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AllowedService {
    pub domain: String,
    #[serde(rename = "requiredScopes")]
    pub required_scopes: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergedPreferences {
    #[serde(flatten)]
    pub user: UserPreferences,
    #[serde(rename = "_orgName")]
    pub org_name: Option<String>,
    #[serde(rename = "_constraintsApplied")]
    pub constraints_applied: Option<Vec<String>>,
}
