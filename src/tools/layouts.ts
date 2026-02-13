import { z } from "zod";

export const listLayoutsToolName = "list_layouts";

export const listLayoutsToolDescription =
  "List available D2 layout engines and their characteristics. Use these with the compile tool's layout parameter.";

export const listLayoutsToolSchema = z.object({});

const LAYOUTS = [
  {
    id: "dagre",
    name: "Dagre",
    description:
      "Fast, directed graph layout engine. Best for general-purpose diagrams, flowcharts, and dependency graphs. Default layout engine.",
    default: true,
  },
  {
    id: "elk",
    name: "ELK",
    description:
      "Eclipse Layout Kernel. Better for complex hierarchical layouts with many containers and nested structures. Produces more compact layouts for large diagrams.",
    default: false,
  },
];

export async function handleListLayouts() {
  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            layouts: LAYOUTS,
            usage:
              "Pass the layout ID to the compile tool's 'layout' parameter.",
          },
          null,
          2
        ),
      },
    ],
  };
}
