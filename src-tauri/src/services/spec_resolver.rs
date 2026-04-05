use crate::models::ui_manifest::*;

/// Resolve a UI manifest for a given domain.
/// Currently uses bundled manifests; will later support HTTP discovery via /.well-known/ui-manifest.json
pub async fn resolve_manifest(domain: &str) -> Result<UiManifest, Box<dyn std::error::Error + Send + Sync>> {
    // Check bundled manifests first
    if let Some(manifest) = get_bundled_manifest(domain) {
        return Ok(manifest);
    }

    // TODO: Try fetching from /.well-known/ui-manifest.json
    // let url = format!("https://{}/.well-known/ui-manifest.json", domain);
    // let response = reqwest::get(&url).await?;
    // let manifest: UiManifest = response.json().await?;

    Err(format!(
        "No manifest found for '{}'. Try: api.github.com, news.ycombinator.com, or demo.pulse.dev",
        domain
    ).into())
}

fn get_bundled_manifest(domain: &str) -> Option<UiManifest> {
    match domain {
        "api.github.com" => Some(github_manifest()),
        "news.ycombinator.com" | "hackernews" | "hn" => Some(hn_manifest()),
        "demo.pulse.dev" | "demo" | "pulse" => Some(demo_manifest()),
        _ => None,
    }
}

fn hn_manifest() -> UiManifest {
    UiManifest {
        version: "1.0".into(),
        service: ServiceInfo {
            name: "Hacker News".into(),
            description: "Technology news and discussion community".into(),
            icon: Some("https://news.ycombinator.com/y18.svg".into()),
            domain: "news.ycombinator.com".into(),
            documentation: Some("https://github.com/HackerNews/API".into()),
        },
        openapi: None,
        auth: None,
        capabilities: vec![
            UiCapability {
                id: "top".into(),
                name: "Top Stories".into(),
                description: "Highest-ranked stories on Hacker News right now".into(),
                category: "feed".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "topstories".into(),
                    path: "/topstories".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "story".into(),
                    default_view: Some("table".into()),
                    alternate_views: Some(vec!["cards".into(), "list".into()]),
                    sortable_fields: Some(vec!["score".into(), "time".into(), "descendants".into()]),
                    groupable_fields: None,
                    searchable: Some(true),
                    primary_action: Some("navigate".into()),
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "new".into(),
                name: "New Stories".into(),
                description: "Most recently submitted stories".into(),
                category: "feed".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "newstories".into(),
                    path: "/newstories".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "story".into(),
                    default_view: Some("table".into()),
                    alternate_views: Some(vec!["cards".into()]),
                    sortable_fields: Some(vec!["time".into(), "score".into()]),
                    groupable_fields: None,
                    searchable: Some(true),
                    primary_action: Some("navigate".into()),
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "best".into(),
                name: "Best Stories".into(),
                description: "Highest-voted stories of all time".into(),
                category: "feed".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "beststories".into(),
                    path: "/beststories".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "story".into(),
                    default_view: Some("table".into()),
                    alternate_views: Some(vec!["cards".into()]),
                    sortable_fields: Some(vec!["score".into(), "descendants".into()]),
                    groupable_fields: None,
                    searchable: Some(true),
                    primary_action: Some("navigate".into()),
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "ask".into(),
                name: "Ask HN".into(),
                description: "Questions and discussions from the community".into(),
                category: "discussion".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "askstories".into(),
                    path: "/askstories".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "story".into(),
                    default_view: Some("cards".into()),
                    alternate_views: Some(vec!["table".into()]),
                    sortable_fields: Some(vec!["score".into(), "descendants".into(), "time".into()]),
                    groupable_fields: None,
                    searchable: Some(true),
                    primary_action: Some("navigate".into()),
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "show".into(),
                name: "Show HN".into(),
                description: "Projects and creations shared by the community".into(),
                category: "showcase".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "showstories".into(),
                    path: "/showstories".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "story".into(),
                    default_view: Some("cards".into()),
                    alternate_views: Some(vec!["table".into()]),
                    sortable_fields: Some(vec!["score".into(), "time".into()]),
                    groupable_fields: None,
                    searchable: Some(true),
                    primary_action: Some("navigate".into()),
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "jobs".into(),
                name: "Jobs".into(),
                description: "YC startup job postings".into(),
                category: "jobs".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "jobstories".into(),
                    path: "/jobstories".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "job".into(),
                    default_view: Some("cards".into()),
                    alternate_views: Some(vec!["table".into()]),
                    sortable_fields: Some(vec!["time".into()]),
                    groupable_fields: None,
                    searchable: Some(true),
                    primary_action: Some("navigate".into()),
                    actions: None,
                    related_capabilities: None,
                }],
            },
        ],
        navigation: Some(NavigationConfig {
            primary: vec!["top".into(), "new".into(), "best".into()],
            secondary: Some(vec!["ask".into(), "show".into(), "jobs".into()]),
        }),
        branding: Some(BrandingConfig {
            primary_color: Some("#ff6600".into()),
            accent_color: Some("#ff6600".into()),
            logo: Some("https://news.ycombinator.com/y18.svg".into()),
        }),
    }
}

fn demo_manifest() -> UiManifest {
    UiManifest {
        version: "1.0".into(),
        service: ServiceInfo {
            name: "Pulse Analytics".into(),
            description: "SaaS analytics and observability platform".into(),
            icon: None,
            domain: "demo.pulse.dev".into(),
            documentation: None,
        },
        openapi: None,
        auth: None,
        capabilities: vec![
            UiCapability {
                id: "overview".into(),
                name: "Overview".into(),
                description: "Platform health and key metrics dashboard".into(),
                category: "analytics".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "dashboard/overview".into(),
                    path: "/__demo__/overview".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "metric".into(),
                    default_view: Some("dashboard".into()),
                    alternate_views: None,
                    sortable_fields: None,
                    groupable_fields: None,
                    searchable: None,
                    primary_action: None,
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "engagement".into(),
                name: "Engagement".into(),
                description: "User engagement, retention, and feature adoption".into(),
                category: "analytics".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "analytics/engagement".into(),
                    path: "/__demo__/engagement".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "engagement".into(),
                    default_view: Some("dashboard".into()),
                    alternate_views: None,
                    sortable_fields: None,
                    groupable_fields: None,
                    searchable: None,
                    primary_action: None,
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "infrastructure".into(),
                name: "Infrastructure".into(),
                description: "Service health, deployments, and system status".into(),
                category: "ops".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "ops/infrastructure".into(),
                    path: "/__demo__/infrastructure".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "service".into(),
                    default_view: Some("status".into()),
                    alternate_views: None,
                    sortable_fields: None,
                    groupable_fields: None,
                    searchable: None,
                    primary_action: None,
                    actions: None,
                    related_capabilities: None,
                }],
            },
            UiCapability {
                id: "revenue".into(),
                name: "Revenue".into(),
                description: "MRR, churn, and subscription analytics".into(),
                category: "finance".into(),
                endpoints: vec![CapabilityEndpoint {
                    operation_id: "finance/revenue".into(),
                    path: "/__demo__/revenue".into(),
                    method: "GET".into(),
                    semantic: "list".into(),
                    entity: "revenue".into(),
                    default_view: Some("dashboard".into()),
                    alternate_views: None,
                    sortable_fields: None,
                    groupable_fields: None,
                    searchable: None,
                    primary_action: None,
                    actions: None,
                    related_capabilities: None,
                }],
            },
        ],
        navigation: Some(NavigationConfig {
            primary: vec!["overview".into(), "engagement".into(), "infrastructure".into()],
            secondary: Some(vec!["revenue".into()]),
        }),
        branding: Some(BrandingConfig {
            primary_color: Some("#8b5cf6".into()),
            accent_color: Some("#d946ef".into()),
            logo: None,
        }),
    }
}

fn github_manifest() -> UiManifest {
    UiManifest {
        version: "1.0".into(),
        service: ServiceInfo {
            name: "GitHub".into(),
            description: "Code hosting and collaboration platform".into(),
            icon: Some("https://github.githubassets.com/favicons/favicon.svg".into()),
            domain: "api.github.com".into(),
            documentation: Some("https://docs.github.com".into()),
        },
        openapi: Some(OpenApiRef {
            url: "https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.json".into(),
            version: "3.1".into(),
        }),
        auth: Some(AuthConfig {
            auth_type: "bearer".into(),
            flows: None,
            fallback: Some("personal_access_token".into()),
        }),
        capabilities: vec![
            UiCapability {
                id: "repositories".into(),
                name: "Repositories".into(),
                description: "Browse, search, and manage code repositories".into(),
                category: "core".into(),
                endpoints: vec![
                    CapabilityEndpoint {
                        operation_id: "repos/list-for-authenticated-user".into(),
                        path: "/user/repos".into(),
                        method: "GET".into(),
                        semantic: "list".into(),
                        entity: "repository".into(),
                        default_view: Some("table".into()),
                        alternate_views: Some(vec!["cards".into(), "list".into()]),
                        sortable_fields: Some(vec![
                            "name".into(), "updated_at".into(), "stargazers_count".into(),
                            "created_at".into(), "pushed_at".into(),
                        ]),
                        groupable_fields: Some(vec!["language".into(), "visibility".into()]),
                        searchable: Some(true),
                        primary_action: Some("navigate".into()),
                        actions: Some(vec!["create".into(), "delete".into(), "star".into(), "fork".into()]),
                        related_capabilities: None,
                    },
                    CapabilityEndpoint {
                        operation_id: "repos/get".into(),
                        path: "/repos/{owner}/{repo}".into(),
                        method: "GET".into(),
                        semantic: "detail".into(),
                        entity: "repository".into(),
                        default_view: Some("detail".into()),
                        alternate_views: None,
                        sortable_fields: None,
                        groupable_fields: None,
                        searchable: None,
                        primary_action: None,
                        actions: Some(vec!["star".into(), "fork".into(), "watch".into()]),
                        related_capabilities: Some(vec![
                            "issues".into(), "pull_requests".into(), "actions".into(),
                        ]),
                    },
                ],
            },
            UiCapability {
                id: "issues".into(),
                name: "Issues".into(),
                description: "Track bugs, enhancements, and tasks".into(),
                category: "project_management".into(),
                endpoints: vec![
                    CapabilityEndpoint {
                        operation_id: "issues/list-for-authenticated-user".into(),
                        path: "/user/issues".into(),
                        method: "GET".into(),
                        semantic: "list".into(),
                        entity: "issue".into(),
                        default_view: Some("table".into()),
                        alternate_views: Some(vec!["kanban".into(), "list".into()]),
                        sortable_fields: Some(vec![
                            "created_at".into(), "updated_at".into(), "comments".into(),
                        ]),
                        groupable_fields: Some(vec!["state".into(), "assignee".into(), "labels".into()]),
                        searchable: Some(true),
                        primary_action: Some("navigate".into()),
                        actions: Some(vec!["create".into(), "close".into(), "assign".into(), "label".into()]),
                        related_capabilities: None,
                    },
                ],
            },
            UiCapability {
                id: "pull_requests".into(),
                name: "Pull Requests".into(),
                description: "Review and merge code changes".into(),
                category: "code_review".into(),
                endpoints: vec![
                    CapabilityEndpoint {
                        operation_id: "pulls/list".into(),
                        path: "/user/repos".into(), // We'll use repos and filter PRs
                        method: "GET".into(),
                        semantic: "list".into(),
                        entity: "pull_request".into(),
                        default_view: Some("table".into()),
                        alternate_views: Some(vec!["list".into()]),
                        sortable_fields: Some(vec![
                            "created_at".into(), "updated_at".into(),
                        ]),
                        groupable_fields: Some(vec!["state".into(), "author".into()]),
                        searchable: Some(true),
                        primary_action: Some("navigate".into()),
                        actions: Some(vec!["create".into(), "merge".into(), "close".into(), "review".into()]),
                        related_capabilities: None,
                    },
                ],
            },
            UiCapability {
                id: "gists".into(),
                name: "Gists".into(),
                description: "Share code snippets and notes".into(),
                category: "content".into(),
                endpoints: vec![
                    CapabilityEndpoint {
                        operation_id: "gists/list".into(),
                        path: "/gists".into(),
                        method: "GET".into(),
                        semantic: "list".into(),
                        entity: "gist".into(),
                        default_view: Some("cards".into()),
                        alternate_views: Some(vec!["table".into(), "list".into()]),
                        sortable_fields: Some(vec!["created_at".into(), "updated_at".into()]),
                        groupable_fields: None,
                        searchable: Some(true),
                        primary_action: Some("navigate".into()),
                        actions: Some(vec!["create".into(), "delete".into(), "star".into(), "fork".into()]),
                        related_capabilities: None,
                    },
                ],
            },
            UiCapability {
                id: "starred".into(),
                name: "Starred".into(),
                description: "Repositories you've starred".into(),
                category: "discovery".into(),
                endpoints: vec![
                    CapabilityEndpoint {
                        operation_id: "activity/list-repos-starred-by-authenticated-user".into(),
                        path: "/user/starred".into(),
                        method: "GET".into(),
                        semantic: "list".into(),
                        entity: "repository".into(),
                        default_view: Some("cards".into()),
                        alternate_views: Some(vec!["table".into(), "list".into()]),
                        sortable_fields: Some(vec!["starred_at".into()]),
                        groupable_fields: Some(vec!["language".into()]),
                        searchable: Some(true),
                        primary_action: Some("navigate".into()),
                        actions: Some(vec!["unstar".into()]),
                        related_capabilities: None,
                    },
                ],
            },
        ],
        navigation: Some(NavigationConfig {
            primary: vec!["repositories".into(), "issues".into(), "pull_requests".into()],
            secondary: Some(vec!["gists".into(), "starred".into()]),
        }),
        branding: Some(BrandingConfig {
            primary_color: Some("#0d1117".into()),
            accent_color: Some("#58a6ff".into()),
            logo: Some("https://github.githubassets.com/favicons/favicon.svg".into()),
        }),
    }
}
