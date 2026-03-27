/**
 * Pre-baked OpenUI Lang responses for the Pulse Analytics demo.
 * These render without requiring an LLM API key.
 */

export const DEMO_RESPONSES: Record<string, string> = {
  overview: `root = Stack([metrics, row2, features], "vertical", 24)
metrics = MetricGrid(metricItems, 4)
metricItems = [{"label": "Monthly Active Users", "value": "284.9K", "change": "+12.4%", "changeDirection": "up", "icon": "users", "color": "violet", "sparkline": [210, 225, 238, 244, 251, 260, 268, 275, 280, 283, 284, 285]}, {"label": "Daily Active Users", "value": "47.8K", "change": "+8.1%", "changeDirection": "up", "icon": "activity", "color": "fuchsia", "sparkline": [38, 39, 41, 42, 43, 44, 45, 45, 46, 47, 47, 48]}, {"label": "Revenue MTD", "value": "$1.42M", "change": "+23.5%", "changeDirection": "up", "icon": "dollar", "color": "emerald", "sparkline": [980, 1020, 1050, 1080, 1120, 1150, 1190, 1240, 1290, 1340, 1380, 1420]}, {"label": "NPS Score", "value": "72", "change": "+4", "changeDirection": "up", "icon": "heart", "color": "rose", "sparkline": [62, 64, 65, 66, 67, 68, 68, 69, 70, 71, 71, 72]}, {"label": "P99 Latency", "value": "142ms", "change": "-18ms", "changeDirection": "down", "icon": "zap", "color": "cyan", "sparkline": [180, 175, 168, 162, 158, 155, 150, 148, 146, 144, 143, 142]}, {"label": "Uptime", "value": "99.97%", "change": "stable", "changeDirection": "neutral", "icon": "globe", "color": "sky", "sparkline": [99.95, 99.96, 99.97, 99.97, 99.96, 99.98, 99.97, 99.97, 99.98, 99.97, 99.97, 99.97]}, {"label": "Deploys Today", "value": "14", "change": "+3", "changeDirection": "up", "icon": "zap", "color": "indigo"}, {"label": "Active Experiments", "value": "8", "change": "2 significant", "changeDirection": "neutral", "icon": "chart", "color": "amber"}]
row2 = Stack([activity, features_inner], "horizontal", 16)
activity = ActivityFeed("Recent Activity", activityItems)
activityItems = [{"icon": "zap", "color": "emerald", "title": "v2.41.0 deployed to production", "description": "API Gateway — zero-downtime rolling deploy", "timestamp": "3m ago", "badge": "Deploy", "badgeColor": "emerald"}, {"icon": "bell", "color": "amber", "title": "P99 latency spike on /api/search", "description": "Search Engine latency exceeded 300ms threshold", "timestamp": "12m ago", "badge": "Warning", "badgeColor": "amber"}, {"icon": "star", "color": "violet", "title": "Crossed 280K MAU milestone", "description": "12.4% month-over-month growth continues", "timestamp": "1h ago", "badge": "Milestone", "badgeColor": "violet"}, {"icon": "eye", "color": "fuchsia", "title": "A/B test 'new-onboarding' reached significance", "description": "Variant B shows +34% activation rate", "timestamp": "2h ago", "badge": "Experiment", "badgeColor": "fuchsia"}, {"icon": "zap", "color": "cyan", "title": "Redis failover completed successfully", "description": "Primary switched to replica-2 with 0ms data loss", "timestamp": "4h ago", "badge": "Resolved", "badgeColor": "cyan"}, {"icon": "eye", "color": "indigo", "title": "Feature flag 'dark-mode-v2' enabled for 50%", "description": "Gradual rollout to remaining users over 48h", "timestamp": "5h ago", "badge": "Rollout", "badgeColor": "indigo"}, {"icon": "user", "color": "pink", "title": "Enterprise customer Acme Corp onboarded", "description": "$16K/mo contract — 450 seats", "timestamp": "6h ago", "badge": "Enterprise", "badgeColor": "pink"}]
features_inner = Stack([features_heading, featureList], "vertical", 12)
features_heading = Heading("Feature Adoption", 3)
featureList = Stack([f1, f2, f3, f4, f5, f6, f7, f8], "vertical", 8)
f1 = ProgressBar("Dashboard Analytics", 94, 100, "violet", true, "%")
f2 = ProgressBar("Custom Reports", 78, 100, "fuchsia", true, "%")
f3 = ProgressBar("API Access", 65, 100, "cyan", true, "%")
f4 = ProgressBar("Alert Rules", 52, 100, "sky", true, "%")
f5 = ProgressBar("Integrations Hub", 41, 100, "emerald", true, "%")
f6 = ProgressBar("Team Workspaces", 38, 100, "amber", true, "%")
f7 = ProgressBar("Custom Workflows", 29, 100, "orange", true, "%")
f8 = ProgressBar("Audit Log", 18, 100, "rose", true, "%")
features = Text("", "caption")`,

  engagement: `root = Stack([heading, segments_row, funnel_heading, funnel, adoption_heading, adoption_bars], "vertical", 24)
heading = Heading("User Engagement & Retention", 2)
segments_row = MetricGrid(segmentMetrics, 5)
segmentMetrics = [{"label": "Power Users", "value": "14.2K", "change": "5% of total", "changeDirection": "up", "icon": "zap", "color": "violet", "sparkline": [11, 11.5, 12, 12.5, 13, 13.2, 13.5, 13.8, 14, 14.1, 14.2, 14.2]}, {"label": "Regular Users", "value": "85.4K", "change": "30% of total", "changeDirection": "up", "icon": "users", "color": "fuchsia", "sparkline": [72, 74, 76, 78, 79, 80, 81, 82, 83, 84, 85, 85]}, {"label": "Casual Users", "value": "128.2K", "change": "45% of total", "changeDirection": "neutral", "icon": "eye", "color": "cyan"}, {"label": "At Risk", "value": "42.7K", "change": "15% of total", "changeDirection": "down", "icon": "heart", "color": "amber"}, {"label": "Churned (30d)", "value": "14.2K", "change": "5% of total", "changeDirection": "down", "icon": "activity", "color": "rose"}]
funnel_heading = Heading("Activation Funnel", 3)
funnel = Stack([s1, s2, s3, s4, s5, s6], "vertical", 6)
s1 = ProgressBar("Signed Up — 12,480", 100, 100, "violet", true, "%")
s2 = ProgressBar("Created First Project — 8,736", 70, 100, "fuchsia", true, "%")
s3 = ProgressBar("Invited Team Member — 5,992", 48, 100, "cyan", true, "%")
s4 = ProgressBar("Connected Integration — 4,494", 36, 100, "sky", true, "%")
s5 = ProgressBar("First Dashboard Created — 3,744", 30, 100, "emerald", true, "%")
s6 = ProgressBar("Upgraded to Paid — 1,872", 15, 100, "amber", true, "%")
adoption_heading = Heading("Feature Adoption by Segment", 3)
adoption_bars = Stack([a1, a2, a3, a4, a5, a6, a7, a8], "vertical", 8)
a1 = ProgressBar("Dashboard Analytics", 94, 100, "violet", true, "%")
a2 = ProgressBar("Custom Reports", 78, 100, "fuchsia", true, "%")
a3 = ProgressBar("API Access", 65, 100, "cyan", true, "%")
a4 = ProgressBar("Alert Rules", 52, 100, "sky", true, "%")
a5 = ProgressBar("Integrations Hub", 41, 100, "emerald", true, "%")
a6 = ProgressBar("Team Workspaces", 38, 100, "amber", true, "%")
a7 = ProgressBar("Custom Workflows", 29, 100, "orange", true, "%")
a8 = ProgressBar("Audit Log", 18, 100, "rose", true, "%")`,

  infrastructure: `root = Stack([heading, health_metrics, services_heading, services, deploys_heading, deploys], "vertical", 24)
heading = Heading("Infrastructure Status", 2)
health_metrics = MetricGrid(healthItems, 4)
healthItems = [{"label": "Total Requests", "value": "56.4K/min", "change": "+14%", "changeDirection": "up", "icon": "activity", "color": "violet", "sparkline": [48, 49, 50, 51, 52, 53, 54, 54, 55, 55, 56, 56]}, {"label": "Avg Latency", "value": "67ms", "change": "-12ms", "changeDirection": "down", "icon": "zap", "color": "emerald"}, {"label": "Error Rate", "value": "0.03%", "change": "-0.01%", "changeDirection": "down", "icon": "chart", "color": "cyan"}, {"label": "Active Services", "value": "8/8", "change": "1 degraded", "changeDirection": "neutral", "icon": "globe", "color": "amber"}]
services_heading = Heading("Service Health", 3)
services = StatusList("", serviceItems)
serviceItems = [{"label": "API Gateway", "status": "success", "value": "23ms / 14.2K rpm", "description": "99.99% uptime — 0.01% error rate"}, {"label": "Auth Service", "status": "success", "value": "8ms / 3.1K rpm", "description": "99.99% uptime — 0.00% error rate"}, {"label": "Search Engine", "status": "warning", "value": "342ms / 892 rpm", "description": "99.82% uptime — 2.1% error rate — investigating latency"}, {"label": "Analytics Pipeline", "status": "success", "value": "156ms / 5.6K rpm", "description": "99.97% uptime — processing 2.8M events/hr"}, {"label": "Notification Service", "status": "success", "value": "45ms / 1.8K rpm", "description": "99.95% uptime — 0.05% error rate"}, {"label": "File Storage", "status": "success", "value": "67ms / 2.3K rpm", "description": "99.98% uptime — 4.2TB stored"}, {"label": "ML Inference", "status": "success", "value": "89ms / 412 rpm", "description": "99.94% uptime — GPU utilization 72%"}, {"label": "WebSocket Hub", "status": "active", "value": "4ms / 28.1K rpm", "description": "100.00% uptime — 12.4K active connections"}]
deploys_heading = Heading("Recent Deployments", 3)
deploys = ActivityFeed("", deployItems)
deployItems = [{"icon": "zap", "color": "emerald", "title": "v2.41.0 → API Gateway", "description": "Sarah Chen — rolling deploy, 0 errors", "timestamp": "3m ago", "badge": "Success", "badgeColor": "emerald"}, {"icon": "zap", "color": "emerald", "title": "v1.18.2 → Auth Service", "description": "Alex Kim — canary passed, full rollout", "timestamp": "45m ago", "badge": "Success", "badgeColor": "emerald"}, {"icon": "bell", "color": "rose", "title": "v3.5.0 → Search Engine", "description": "Jordan Lee — latency regression detected, auto-rollback triggered", "timestamp": "2h ago", "badge": "Rollback", "badgeColor": "rose"}, {"icon": "zap", "color": "cyan", "title": "v2.40.1 → API Gateway", "description": "Sarah Chen — hotfix for rate limiter edge case", "timestamp": "4h ago", "badge": "Hotfix", "badgeColor": "cyan"}, {"icon": "star", "color": "violet", "title": "v1.9.0 → ML Inference", "description": "Priya Patel — new recommendation model, +8% CTR", "timestamp": "6h ago", "badge": "Feature", "badgeColor": "violet"}]`,

  revenue: `root = Stack([heading, rev_metrics, breakdown_heading, plan_cards, churn_heading, churn_row], "vertical", 24)
heading = Heading("Revenue Analytics", 2)
rev_metrics = MetricGrid(revItems, 4)
revItems = [{"label": "Monthly Recurring Revenue", "value": "$1.42M", "change": "+23.5%", "changeDirection": "up", "icon": "dollar", "color": "emerald", "sparkline": [980, 1020, 1050, 1080, 1120, 1150, 1190, 1240, 1290, 1340, 1380, 1420]}, {"label": "Annual Run Rate", "value": "$17.0M", "change": "+23.5%", "changeDirection": "up", "icon": "chart", "color": "violet"}, {"label": "Net Revenue Retention", "value": "124%", "change": "+6%", "changeDirection": "up", "icon": "star", "color": "fuchsia"}, {"label": "Avg Revenue Per User", "value": "$238", "change": "+18%", "changeDirection": "up", "icon": "users", "color": "cyan"}]
breakdown_heading = Heading("Revenue by Plan", 3)
plan_cards = CardGrid(planItems, 4, "")
planItems = [{"title": "Enterprise", "subtitle": "$680K MRR — 42 customers", "badges": [{"text": "+18% growth", "color": "violet"}], "fields": [{"label": "ARPU", "value": "$16,190"}, {"label": "Avg Contract", "value": "24 months"}, {"label": "NPS", "value": "78"}]}, {"title": "Business", "subtitle": "$420K MRR — 280 customers", "badges": [{"text": "+31% growth", "color": "fuchsia"}], "fields": [{"label": "ARPU", "value": "$1,500"}, {"label": "Avg Contract", "value": "12 months"}, {"label": "NPS", "value": "71"}]}, {"title": "Pro", "subtitle": "$240K MRR — 1,600 customers", "badges": [{"text": "+25% growth", "color": "cyan"}], "fields": [{"label": "ARPU", "value": "$150"}, {"label": "Avg Tenure", "value": "8 months"}, {"label": "NPS", "value": "68"}]}, {"title": "Starter", "subtitle": "$80K MRR — 4,000 customers", "badges": [{"text": "+12% growth", "color": "emerald"}], "fields": [{"label": "ARPU", "value": "$20"}, {"label": "Avg Tenure", "value": "4 months"}, {"label": "NPS", "value": "62"}]}]
churn_heading = Heading("Churn Analysis", 3)
churn_row = MetricGrid(churnItems, 4)
churnItems = [{"label": "Logo Churn Rate", "value": "2.1%", "change": "-0.3%", "changeDirection": "down", "icon": "activity", "color": "rose"}, {"label": "Revenue Churn", "value": "1.4%", "change": "-0.5%", "changeDirection": "down", "icon": "dollar", "color": "amber"}, {"label": "Customers Lost", "value": "124", "change": "-18", "changeDirection": "down", "icon": "users", "color": "orange"}, {"label": "Revenue Lost", "value": "$19.9K", "change": "-$4.2K", "changeDirection": "down", "icon": "chart", "color": "pink"}]`,
};
