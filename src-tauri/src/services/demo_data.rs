use serde_json::{json, Value};

pub fn get_demo_data(capability_id: &str) -> Value {
    match capability_id {
        "overview" => overview_data(),
        "engagement" => engagement_data(),
        "infrastructure" => infrastructure_data(),
        "revenue" => revenue_data(),
        _ => json!([]),
    }
}

fn overview_data() -> Value {
    json!({
        "__demo__": true,
        "metrics": {
            "mau": 284930,
            "mau_change": "+12.4%",
            "dau": 47821,
            "dau_change": "+8.1%",
            "revenue_mtd": "$1.42M",
            "revenue_change": "+23.5%",
            "nps": 72,
            "nps_change": "+4",
            "p99_latency": "142ms",
            "latency_change": "-18ms",
            "uptime": "99.97%",
            "error_rate": "0.03%",
            "deploys_today": 14,
            "active_experiments": 8
        },
        "recent_activity": [
            {"type": "deploy", "message": "v2.41.0 deployed to production", "time": "3m ago", "status": "success"},
            {"type": "alert", "message": "P99 latency spike on /api/search", "time": "12m ago", "status": "warning"},
            {"type": "milestone", "message": "Crossed 280K MAU milestone", "time": "1h ago", "status": "success"},
            {"type": "experiment", "message": "A/B test 'new-onboarding' reached significance", "time": "2h ago", "status": "info"},
            {"type": "incident", "message": "Redis failover completed successfully", "time": "4h ago", "status": "resolved"},
            {"type": "release", "message": "Feature flag 'dark-mode-v2' enabled for 50%", "time": "5h ago", "status": "active"},
            {"type": "user", "message": "Enterprise customer Acme Corp onboarded", "time": "6h ago", "status": "success"},
            {"type": "alert", "message": "Disk usage on worker-3 above 80%", "time": "8h ago", "status": "warning"}
        ],
        "top_features": [
            {"name": "Dashboard", "usage": 94, "trend": "stable"},
            {"name": "Reports", "usage": 78, "trend": "up"},
            {"name": "API Access", "usage": 65, "trend": "up"},
            {"name": "Alerts", "usage": 52, "trend": "stable"},
            {"name": "Integrations", "usage": 41, "trend": "up"},
            {"name": "Team Management", "usage": 38, "trend": "down"},
            {"name": "Custom Workflows", "usage": 29, "trend": "up"},
            {"name": "Audit Log", "usage": 18, "trend": "stable"}
        ]
    })
}

fn engagement_data() -> Value {
    json!({
        "__demo__": true,
        "cohort_retention": {
            "week_1": 82,
            "week_2": 71,
            "week_4": 58,
            "week_8": 47,
            "week_12": 41
        },
        "activation_funnel": [
            {"step": "Signed Up", "count": 12480, "rate": 100},
            {"step": "Created First Project", "count": 8736, "rate": 70},
            {"step": "Invited Team Member", "count": 5992, "rate": 48},
            {"step": "Connected Integration", "count": 4494, "rate": 36},
            {"step": "First Dashboard Created", "count": 3744, "rate": 30},
            {"step": "Upgraded to Paid", "count": 1872, "rate": 15}
        ],
        "user_segments": [
            {"name": "Power Users", "count": 14240, "percentage": 5.0, "color": "violet", "avg_sessions": 28},
            {"name": "Regular Users", "count": 85440, "percentage": 30.0, "color": "fuchsia", "avg_sessions": 12},
            {"name": "Casual Users", "count": 128160, "percentage": 45.0, "color": "cyan", "avg_sessions": 4},
            {"name": "At Risk", "count": 42720, "percentage": 15.0, "color": "amber", "avg_sessions": 1},
            {"name": "Churned (30d)", "count": 14240, "percentage": 5.0, "color": "rose", "avg_sessions": 0}
        ],
        "feature_adoption": [
            {"feature": "Dashboard Analytics", "adoption": 94, "color": "violet"},
            {"feature": "Custom Reports", "adoption": 78, "color": "fuchsia"},
            {"feature": "API Access", "adoption": 65, "color": "cyan"},
            {"feature": "Alert Rules", "adoption": 52, "color": "sky"},
            {"feature": "Integrations Hub", "adoption": 41, "color": "emerald"},
            {"feature": "Team Workspaces", "adoption": 38, "color": "amber"},
            {"feature": "Custom Workflows", "adoption": 29, "color": "orange"},
            {"feature": "Audit Log", "adoption": 18, "color": "rose"}
        ]
    })
}

fn infrastructure_data() -> Value {
    json!({
        "__demo__": true,
        "services": [
            {"name": "API Gateway", "status": "healthy", "latency": "23ms", "requests": "14.2K/min", "error_rate": "0.01%", "uptime": "99.99%"},
            {"name": "Auth Service", "status": "healthy", "latency": "8ms", "requests": "3.1K/min", "error_rate": "0.00%", "uptime": "99.99%"},
            {"name": "Search Engine", "status": "degraded", "latency": "342ms", "requests": "892/min", "error_rate": "2.1%", "uptime": "99.82%"},
            {"name": "Analytics Pipeline", "status": "healthy", "latency": "156ms", "requests": "5.6K/min", "error_rate": "0.02%", "uptime": "99.97%"},
            {"name": "Notification Service", "status": "healthy", "latency": "45ms", "requests": "1.8K/min", "error_rate": "0.05%", "uptime": "99.95%"},
            {"name": "File Storage", "status": "healthy", "latency": "67ms", "requests": "2.3K/min", "error_rate": "0.01%", "uptime": "99.98%"},
            {"name": "ML Inference", "status": "healthy", "latency": "89ms", "requests": "412/min", "error_rate": "0.10%", "uptime": "99.94%"},
            {"name": "WebSocket Hub", "status": "healthy", "latency": "4ms", "requests": "28.1K/min", "error_rate": "0.00%", "uptime": "100.00%"}
        ],
        "recent_deploys": [
            {"version": "v2.41.0", "service": "API Gateway", "time": "3m ago", "status": "success", "author": "Sarah Chen"},
            {"version": "v1.18.2", "service": "Auth Service", "time": "45m ago", "status": "success", "author": "Alex Kim"},
            {"version": "v3.5.0", "service": "Search Engine", "time": "2h ago", "status": "rollback", "author": "Jordan Lee"},
            {"version": "v2.40.1", "service": "API Gateway", "time": "4h ago", "status": "success", "author": "Sarah Chen"},
            {"version": "v1.9.0", "service": "ML Inference", "time": "6h ago", "status": "success", "author": "Priya Patel"}
        ]
    })
}

fn revenue_data() -> Value {
    json!({
        "__demo__": true,
        "mrr": {
            "current": 1420000,
            "previous": 1150000,
            "growth": 23.5,
            "arr": 17040000
        },
        "breakdown": [
            {"plan": "Enterprise", "mrr": 680000, "customers": 42, "arpu": 16190, "color": "violet", "growth": "+18%"},
            {"plan": "Business", "mrr": 420000, "customers": 280, "arpu": 1500, "color": "fuchsia", "growth": "+31%"},
            {"plan": "Pro", "mrr": 240000, "customers": 1600, "arpu": 150, "color": "cyan", "growth": "+25%"},
            {"plan": "Starter", "mrr": 80000, "customers": 4000, "arpu": 20, "color": "emerald", "growth": "+12%"}
        ],
        "churn": {
            "rate": 2.1,
            "revenue_churn": 1.4,
            "customers_lost": 124,
            "revenue_lost": 19880
        },
        "monthly_trend": [980, 1020, 1050, 1080, 1120, 1150, 1190, 1240, 1290, 1340, 1380, 1420]
    })
}
