import { z } from "zod";
import { defineComponent, createLibrary } from "@openuidev/react-lang";
import { DataTableComponent } from "../components/adaptive/DataTable";
import { DetailViewComponent } from "../components/adaptive/DetailView";
import { CardGridComponent } from "../components/adaptive/CardGrid";
import { StatCardComponent } from "../components/adaptive/StatCard";
import { ActionBarComponent } from "../components/adaptive/ActionBar";
import { ProgressBarComponent } from "../components/adaptive/ProgressBar";
import { StatusListComponent } from "../components/adaptive/StatusList";
import { MetricGridComponent } from "../components/adaptive/MetricGrid";
import { ColorBadgeComponent } from "../components/adaptive/ColorBadge";
import { ActivityFeedComponent } from "../components/adaptive/ActivityFeed";
import {
  StackComponent,
  HeadingComponent,
  TextComponent,
  BadgeComponent,
} from "../components/adaptive/Layout";

const DataTable = defineComponent({
  name: "DataTable",
  description: "Sortable paginated data table for entity lists.",
  props: z.object({
    columns: z.array(z.object({ key: z.string(), label: z.string(), sortable: z.boolean().optional() })),
    rows: z.array(z.record(z.string(), z.unknown())),
    sortBy: z.string().optional(),
    sortDirection: z.enum(["asc", "desc"]).optional(),
    pageSize: z.number().optional(),
    title: z.string().optional(),
  }),
  component: DataTableComponent,
});

const DetailView = defineComponent({
  name: "DetailView",
  description: "Structured single-entity view with grouped fields and actions.",
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    sections: z.array(z.object({
      title: z.string(),
      fields: z.array(z.object({
        key: z.string(), label: z.string(), value: z.unknown(),
        type: z.enum(["text", "link", "badge", "date", "code"]).optional(),
      })),
    })),
    actions: z.array(z.object({
      label: z.string(), variant: z.enum(["primary", "secondary", "danger"]).optional(),
    })).optional(),
  }),
  component: DetailViewComponent,
});

const CardGrid = defineComponent({
  name: "CardGrid",
  description: "Grid of summary cards with badges and fields for visual browsing.",
  props: z.object({
    cards: z.array(z.object({
      title: z.string(), subtitle: z.string().optional(),
      badges: z.array(z.object({ text: z.string(), color: z.string().optional() })).optional(),
      fields: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
      actions: z.array(z.object({ label: z.string() })).optional(),
    })),
    columns: z.number().optional(),
    title: z.string().optional(),
  }),
  component: CardGridComponent,
});

const StatCard = defineComponent({
  name: "StatCard",
  description: "Single KPI metric card with optional trend indicator.",
  props: z.object({
    label: z.string(), value: z.string(), change: z.string().optional(),
    changeDirection: z.enum(["up", "down", "neutral"]).optional(),
    description: z.string().optional(),
  }),
  component: StatCardComponent,
});

const ActionBar = defineComponent({
  name: "ActionBar",
  description: "Row of action buttons with confirm support.",
  props: z.object({
    actions: z.array(z.object({
      label: z.string(), variant: z.enum(["primary", "secondary", "danger"]).optional(),
      confirmMessage: z.string().optional(),
    })),
  }),
  component: ActionBarComponent,
});

const MetricGrid = defineComponent({
  name: "MetricGrid",
  description: "Grid of colorful metric cards with icons, sparklines, and trend badges. Use colors: blue, violet, fuchsia, rose, orange, amber, emerald, teal, cyan, sky, indigo, pink. Icons: activity, users, zap, globe, chart, dollar, eye, heart, star.",
  props: z.object({
    metrics: z.array(z.object({
      label: z.string(), value: z.string(), change: z.string().optional(),
      changeDirection: z.enum(["up", "down", "neutral"]).optional(),
      icon: z.string().optional(), color: z.string().optional(),
      sparkline: z.array(z.number()).optional(),
    })),
    columns: z.number().optional(),
  }),
  component: MetricGridComponent,
});

const ProgressBar = defineComponent({
  name: "ProgressBar",
  description: "Colored progress bar with label and value. Colors: blue, violet, fuchsia, rose, orange, amber, lime, emerald, teal, cyan, sky, indigo, pink.",
  props: z.object({
    label: z.string(), value: z.number(), max: z.number().optional(),
    color: z.string().optional(), showValue: z.boolean().optional(),
    suffix: z.string().optional(),
  }),
  component: ProgressBarComponent,
});

const StatusList = defineComponent({
  name: "StatusList",
  description: "List of items with colored status icons. Statuses: success, warning, error, pending, active, info, violet, fuchsia, rose, emerald.",
  props: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      label: z.string(), status: z.string(),
      value: z.string().optional(), description: z.string().optional(),
    })),
  }),
  component: StatusListComponent,
});

const ColorBadge = defineComponent({
  name: "ColorBadge",
  description: "Colored badge/tag. Colors: blue, violet, fuchsia, rose, orange, amber, lime, emerald, teal, cyan, sky, indigo, pink, green, red, yellow, gray.",
  props: z.object({
    text: z.string(), color: z.string().optional(),
    size: z.enum(["sm", "md", "lg"]).optional(), dot: z.boolean().optional(),
  }),
  component: ColorBadgeComponent,
});

const ActivityFeed = defineComponent({
  name: "ActivityFeed",
  description: "Chronological feed of events with colored icons and badges. Icons: user, zap, star, branch, message, bell, heart, eye. Colors: blue, violet, fuchsia, rose, emerald, cyan, orange, pink, amber, indigo.",
  props: z.object({
    title: z.string().optional(),
    items: z.array(z.object({
      icon: z.string().optional(), color: z.string().optional(),
      title: z.string(), description: z.string().optional(),
      timestamp: z.string().optional(), badge: z.string().optional(),
      badgeColor: z.string().optional(),
    })),
  }),
  component: ActivityFeedComponent,
});

const Stack = defineComponent({
  name: "Stack",
  description: "Flex layout container for arranging children vertically or horizontally.",
  props: z.object({
    children: z.array(z.unknown()),
    direction: z.enum(["horizontal", "vertical"]).optional(),
    gap: z.number().optional(),
    align: z.enum(["start", "center", "end", "stretch"]).optional(),
  }),
  component: StackComponent,
});

const Heading = defineComponent({
  name: "Heading",
  description: "Heading element (h1-h6).",
  props: z.object({ text: z.string(), level: z.number().optional() }),
  component: HeadingComponent,
});

const Text = defineComponent({
  name: "Text",
  description: "Text paragraph or caption.",
  props: z.object({
    content: z.string(),
    variant: z.enum(["body", "caption", "code"]).optional(),
  }),
  component: TextComponent,
});

const Badge = defineComponent({
  name: "Badge",
  description: "Simple status badge.",
  props: z.object({ text: z.string(), color: z.string().optional() }),
  component: BadgeComponent,
});

export const adaptiveLibrary = createLibrary({
  components: [
    Stack, MetricGrid, DataTable, DetailView, CardGrid, StatCard,
    ActionBar, ProgressBar, StatusList, ColorBadge, ActivityFeed,
    Heading, Text, Badge,
  ],
  root: "Stack",
});
