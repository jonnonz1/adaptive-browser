import { z } from "zod";
import { defineComponent, createLibrary } from "@openuidev/react-lang";
import { DataTableComponent } from "../components/adaptive/DataTable";
import { DetailViewComponent } from "../components/adaptive/DetailView";
import { CardGridComponent } from "../components/adaptive/CardGrid";
import { StatCardComponent } from "../components/adaptive/StatCard";
import { ActionBarComponent } from "../components/adaptive/ActionBar";
import {
  StackComponent,
  HeadingComponent,
  TextComponent,
  BadgeComponent,
} from "../components/adaptive/Layout";

// --- Component Definitions ---

const DataTable = defineComponent({
  name: "DataTable",
  description:
    "A sortable, paginated data table for displaying lists of entities. Use for structured data that benefits from columnar layout.",
  props: z.object({
    columns: z.array(
      z.object({
        key: z.string(),
        label: z.string(),
        sortable: z.boolean().optional(),
      })
    ),
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
  description:
    "A structured view for displaying a single entity with grouped fields and actions. Use for detail/show pages.",
  props: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    sections: z.array(
      z.object({
        title: z.string(),
        fields: z.array(
          z.object({
            key: z.string(),
            label: z.string(),
            value: z.unknown(),
            type: z.enum(["text", "link", "badge", "date", "code"]).optional(),
          })
        ),
      })
    ),
    actions: z
      .array(
        z.object({
          label: z.string(),
          variant: z.enum(["primary", "secondary", "danger"]).optional(),
        })
      )
      .optional(),
  }),
  component: DetailViewComponent,
});

const CardGrid = defineComponent({
  name: "CardGrid",
  description:
    "A grid of summary cards for browsing entities visually. Use when users prefer a visual overview over tabular data.",
  props: z.object({
    cards: z.array(
      z.object({
        title: z.string(),
        subtitle: z.string().optional(),
        badges: z
          .array(z.object({ text: z.string(), color: z.string().optional() }))
          .optional(),
        fields: z
          .array(z.object({ label: z.string(), value: z.string() }))
          .optional(),
        actions: z.array(z.object({ label: z.string() })).optional(),
      })
    ),
    columns: z.number().optional(),
    title: z.string().optional(),
  }),
  component: CardGridComponent,
});

const StatCard = defineComponent({
  name: "StatCard",
  description: "A single metric/KPI display card. Use for summary statistics.",
  props: z.object({
    label: z.string(),
    value: z.string(),
    change: z.string().optional(),
    changeDirection: z.enum(["up", "down", "neutral"]).optional(),
    description: z.string().optional(),
  }),
  component: StatCardComponent,
});

const ActionBar = defineComponent({
  name: "ActionBar",
  description:
    "A row of action buttons. Use for primary actions available on the current view.",
  props: z.object({
    actions: z.array(
      z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "danger"]).optional(),
        confirmMessage: z.string().optional(),
      })
    ),
  }),
  component: ActionBarComponent,
});

const Stack = defineComponent({
  name: "Stack",
  description:
    "A flex container for arranging child components vertically or horizontally. The primary layout component.",
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
  description: "A heading element (h1-h6). Use for section titles.",
  props: z.object({
    text: z.string(),
    level: z.number().optional(),
  }),
  component: HeadingComponent,
});

const Text = defineComponent({
  name: "Text",
  description: "A text paragraph. Use for descriptions, captions, and body text.",
  props: z.object({
    content: z.string(),
    variant: z.enum(["body", "caption", "code"]).optional(),
  }),
  component: TextComponent,
});

const Badge = defineComponent({
  name: "Badge",
  description: "A small status badge/tag. Use for labels, statuses, and categories.",
  props: z.object({
    text: z.string(),
    color: z.string().optional(),
  }),
  component: BadgeComponent,
});

// --- Library ---

export const adaptiveLibrary = createLibrary({
  components: [
    Stack,
    DataTable,
    DetailView,
    CardGrid,
    StatCard,
    ActionBar,
    Heading,
    Text,
    Badge,
  ],
  root: "Stack",
});
