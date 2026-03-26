use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiManifest {
    pub version: String,
    pub service: ServiceInfo,
    pub openapi: Option<OpenApiRef>,
    pub auth: Option<AuthConfig>,
    pub capabilities: Vec<UiCapability>,
    pub navigation: Option<NavigationConfig>,
    pub branding: Option<BrandingConfig>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceInfo {
    pub name: String,
    pub description: String,
    pub icon: Option<String>,
    pub domain: String,
    pub documentation: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OpenApiRef {
    pub url: String,
    pub version: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AuthConfig {
    #[serde(rename = "type")]
    pub auth_type: String,
    pub flows: Option<serde_json::Value>,
    pub fallback: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UiCapability {
    pub id: String,
    pub name: String,
    pub description: String,
    pub category: String,
    pub endpoints: Vec<CapabilityEndpoint>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityEndpoint {
    #[serde(rename = "operationId")]
    pub operation_id: String,
    pub path: String,
    pub method: String,
    pub semantic: String,
    pub entity: String,
    #[serde(rename = "defaultView")]
    pub default_view: Option<String>,
    #[serde(rename = "alternateViews")]
    pub alternate_views: Option<Vec<String>>,
    #[serde(rename = "sortableFields")]
    pub sortable_fields: Option<Vec<String>>,
    #[serde(rename = "groupableFields")]
    pub groupable_fields: Option<Vec<String>>,
    pub searchable: Option<bool>,
    #[serde(rename = "primaryAction")]
    pub primary_action: Option<String>,
    pub actions: Option<Vec<String>>,
    #[serde(rename = "relatedCapabilities")]
    pub related_capabilities: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct NavigationConfig {
    pub primary: Vec<String>,
    pub secondary: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct BrandingConfig {
    #[serde(rename = "primaryColor")]
    pub primary_color: Option<String>,
    #[serde(rename = "accentColor")]
    pub accent_color: Option<String>,
    pub logo: Option<String>,
}
