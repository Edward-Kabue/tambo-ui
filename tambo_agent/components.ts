// agent/tambo_agent/components.ts
import { TamboComponent } from "@tambo-ai/react";
import { z } from "zod";

// Placeholder React components for Old Mutual UI
// In a real project these would import actual design system components.
const Button = (props: { variant?: string; size?: string; children: React.ReactNode }) => (
  <button className={`${props.variant ?? "primary"} ${props.size ?? "md"}`}>
    {props.children}
  </button>
);

const Card = (props: { title: string; content: string }) => (
  <div className="card">
    <h3>{props.title}</h3>
    <p>{props.content}</p>
  </div>
);

const DataChart = (props: { data: Array<{ x: string; y: number }>; type?: string }) => (
  <div className="chart">
    <p>Chart Type: {props.type ?? "bar"}</p>
    {/* Placeholder – replace with real chart library */}
  </div>
);

// Export the Tambo component registry
export const designSystemComponents: TamboComponent[] = [
  {
    name: "Button",
    description: "Primary button from Old Mutual design system",
    component: Button,
    propsSchema: z.object({
      variant: z.enum(["primary", "secondary", "danger"]).optional(),
      size: z.enum(["sm", "md", "lg"]).optional(),
      children: z.string().or(z.instanceof(React.ReactNode)),
    }),
  },
  {
    name: "Card",
    description: "Content card with title and body",
    component: Card,
    propsSchema: z.object({
      title: z.string(),
      content: z.string(),
    }),
  },
  {
    name: "DataChart",
    description: "Simple data chart component",
    component: DataChart,
    propsSchema: z.object({
      data: z.array(
        z.object({
          x: z.string(),
          y: z.number(),
        })
      ),
      type: z.enum(["line", "bar", "pie"]).optional(),
    }),
  },
];
