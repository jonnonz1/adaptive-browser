import type { ComponentRenderProps } from "@openuidev/react-lang";
import { useRenderNode } from "@openuidev/react-lang";

interface StackProps {
  children: unknown[];
  direction?: "horizontal" | "vertical";
  gap?: number;
  align?: "start" | "center" | "end" | "stretch";
}

export function StackComponent({ props }: ComponentRenderProps<StackProps>) {
  const renderNode = useRenderNode();
  const { children, direction = "vertical", gap = 16, align = "stretch" } = props;

  return (
    <div
      className="flex"
      style={{
        flexDirection: direction === "horizontal" ? "row" : "column",
        gap: `${gap}px`,
        alignItems: align === "stretch" ? "stretch" : `flex-${align}`,
      }}
    >
      {children?.map((child, i) => (
        <div key={i}>{renderNode(child)}</div>
      ))}
    </div>
  );
}

interface HeadingProps {
  text: string;
  level?: number;
}

export function HeadingComponent({ props }: ComponentRenderProps<HeadingProps>) {
  const { text, level = 2 } = props;
  const sizes: Record<number, string> = {
    1: "text-3xl",
    2: "text-2xl",
    3: "text-xl",
    4: "text-lg",
    5: "text-base",
    6: "text-sm",
  };

  return (
    <div
      className={`${sizes[level] ?? sizes[2]} font-bold`}
      style={{ color: "var(--color-text-primary)" }}
    >
      {text}
    </div>
  );
}

interface TextProps {
  content: string;
  variant?: "body" | "caption" | "code";
}

export function TextComponent({ props }: ComponentRenderProps<TextProps>) {
  const { content, variant = "body" } = props;

  const styles: Record<string, string> = {
    body: "text-sm",
    caption: "text-xs",
    code: "text-sm font-mono",
  };

  return (
    <p
      className={styles[variant]}
      style={{
        color: variant === "caption" ? "var(--color-text-secondary)" : "var(--color-text-primary)",
        ...(variant === "code" ? { backgroundColor: "var(--color-bg-tertiary)", padding: "2px 6px", borderRadius: "4px" } : {}),
      }}
    >
      {content}
    </p>
  );
}

interface BadgeProps {
  text: string;
  color?: string;
}

export function BadgeComponent({ props }: ComponentRenderProps<BadgeProps>) {
  const { text, color } = props;

  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-xs font-medium"
      style={{
        backgroundColor: color || "var(--color-bg-tertiary)",
        color: "var(--color-text-primary)",
      }}
    >
      {text}
    </span>
  );
}
