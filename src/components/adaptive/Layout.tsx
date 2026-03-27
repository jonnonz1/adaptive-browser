import type { ComponentRenderProps } from "@openuidev/react-lang";
import { useRenderNode } from "@openuidev/react-lang";

interface StackProps { children: unknown[]; direction?: "horizontal" | "vertical"; gap?: number; align?: "start" | "center" | "end" | "stretch"; }

export function StackComponent({ props }: ComponentRenderProps<StackProps>) {
  const renderNode = useRenderNode();
  const { children, direction = "vertical", gap = 16, align = "stretch" } = props;
  return (
    <div className="flex" style={{
      flexDirection: direction === "horizontal" ? "row" : "column",
      gap: `${gap}px`,
      alignItems: align === "stretch" ? "stretch" : `flex-${align}`,
    }}>
      {children?.map((child, i) => <div key={i}>{renderNode(child)}</div>)}
    </div>
  );
}

interface HeadingProps { text: string; level?: number; }

export function HeadingComponent({ props }: ComponentRenderProps<HeadingProps>) {
  const { text, level = 2 } = props;
  const cls: Record<number, string> = { 1: "text-3xl", 2: "text-2xl", 3: "text-xl", 4: "text-lg", 5: "text-base", 6: "text-sm" };
  return <div className={`${cls[level] ?? cls[2]} font-bold tracking-tight text-foreground`}>{text}</div>;
}

interface TextProps { content: string; variant?: "body" | "caption" | "code"; }

export function TextComponent({ props }: ComponentRenderProps<TextProps>) {
  const { content, variant = "body" } = props;
  if (variant === "code") return <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">{content}</code>;
  return <p className={variant === "caption" ? "text-xs text-muted-foreground" : "text-sm text-foreground"}>{content}</p>;
}

interface BadgeProps { text: string; color?: string; }

export function BadgeComponent({ props }: ComponentRenderProps<BadgeProps>) {
  return (
    <span className="inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-foreground">
      {props.text}
    </span>
  );
}
