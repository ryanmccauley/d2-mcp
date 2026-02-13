import { z } from "zod";
import { compileD2 } from "../d2.js";

export const compileToolName = "compile";

export const compileToolDescription =
  "Compile D2 diagram source code into an SVG image. D2 is a declarative diagramming language that turns text into diagrams. Returns the SVG markup as a string.";

export const compileToolSchema = z.object({
  code: z
    .string()
    .describe("The D2 source code to compile into a diagram"),
  layout: z
    .enum(["dagre", "elk"])
    .optional()
    .describe("Layout engine to use. 'dagre' (default) for general diagrams, 'elk' for more complex hierarchical layouts"),
  sketch: z
    .boolean()
    .optional()
    .describe("Enable hand-drawn sketch mode for a more informal aesthetic"),
  themeID: z
    .number()
    .int()
    .optional()
    .describe("Theme ID to use (0=default, 1=Neutral Grey, 3=Flagship Terrastruct, 4=Cool Classics, 5=Mixed Berry Blue, 6=Grape Soda, 7=Aubergine, 8=Colorblind Clear, 100=Terminal, 101=Terminal Grayscale, 102=Terminal Mono, 200=Origami)"),
  darkThemeID: z
    .number()
    .int()
    .optional()
    .describe("Theme ID for dark mode rendering"),
  pad: z
    .number()
    .int()
    .optional()
    .describe("Pixels of padding around the diagram (default: 100)"),
  center: z
    .boolean()
    .optional()
    .describe("Center the SVG in the containing viewbox"),
  scale: z
    .number()
    .optional()
    .describe("Scale factor for the output (e.g. 0.5 to halve, 1 for actual size, default fits to screen)"),
  target: z
    .string()
    .optional()
    .describe("Target board to render for multi-board diagrams. Use '*' for all boards, 'layers.x.*' for a specific layer and children"),
  animateInterval: z
    .number()
    .int()
    .optional()
    .describe("Interval in ms for animated multi-board SVGs. Required when targeting multiple boards"),
  noXMLTag: z
    .boolean()
    .optional()
    .describe("Omit the XML declaration tag from SVG output. Useful for direct HTML embedding"),
});

export type CompileToolInput = z.infer<typeof compileToolSchema>;

export async function handleCompile(input: CompileToolInput) {
  const { code, ...options } = input;
  const result = await compileD2(code, options);
  return {
    content: [
      {
        type: "text" as const,
        text: result.svg,
      },
    ],
  };
}
