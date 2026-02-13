import { D2 } from "@terrastruct/d2";
import type { CompileOptions as D2CompileOptions, CompileResponse, RenderOptions } from "@terrastruct/d2";

let instance: D2 | null = null;

export function getD2(): D2 {
  if (!instance) {
    instance = new D2();
  }
  return instance;
}

export interface CompileResult {
  svg: string;
  diagram: CompileResponse["diagram"];
}

export interface CompileOptions {
  layout?: "dagre" | "elk";
  sketch?: boolean;
  themeID?: number;
  darkThemeID?: number;
  pad?: number;
  center?: boolean;
  scale?: number;
  animateInterval?: number;
  target?: string;
  noXMLTag?: boolean;
}

export async function compileD2(
  code: string,
  options: CompileOptions = {}
): Promise<CompileResult> {
  const d2 = getD2();

  const d2CompileOptions: D2CompileOptions = {};
  if (options.layout) d2CompileOptions.layout = options.layout;
  if (options.sketch !== undefined) d2CompileOptions.sketch = options.sketch;
  if (options.themeID !== undefined) d2CompileOptions.themeID = options.themeID;
  if (options.darkThemeID !== undefined)
    d2CompileOptions.darkThemeID = options.darkThemeID;
  if (options.pad !== undefined) d2CompileOptions.pad = options.pad;
  if (options.center !== undefined) d2CompileOptions.center = options.center;
  if (options.scale !== undefined) d2CompileOptions.scale = options.scale;
  if (options.target !== undefined) d2CompileOptions.target = options.target;
  if (options.noXMLTag !== undefined) d2CompileOptions.noXMLTag = options.noXMLTag;
  if (options.animateInterval !== undefined)
    d2CompileOptions.animateInterval = options.animateInterval;

  const result = await d2.compile(code, { options: d2CompileOptions });

  const renderOptions: RenderOptions = { ...result.renderOptions };
  // Apply any overrides from compile options onto render options
  if (options.sketch !== undefined) renderOptions.sketch = options.sketch;
  if (options.themeID !== undefined) renderOptions.themeID = options.themeID;
  if (options.darkThemeID !== undefined)
    renderOptions.darkThemeID = options.darkThemeID;
  if (options.pad !== undefined) renderOptions.pad = options.pad;
  if (options.center !== undefined) renderOptions.center = options.center;
  if (options.scale !== undefined) renderOptions.scale = options.scale;
  if (options.noXMLTag !== undefined) renderOptions.noXMLTag = options.noXMLTag;
  if (options.animateInterval !== undefined)
    renderOptions.animateInterval = options.animateInterval;
  if (options.target !== undefined) renderOptions.target = options.target;

  const svg = await d2.render(result.diagram, renderOptions);

  return { svg, diagram: result.diagram };
}

export async function validateD2(
  code: string
): Promise<{ valid: boolean; errors: string[] }> {
  const d2 = getD2();
  try {
    await d2.compile(code, { options: {} });
    return { valid: true, errors: [] };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : String(err);
    return { valid: false, errors: [message] };
  }
}

export async function getD2Version(): Promise<{
  engine: string;
  js: string;
}> {
  const d2 = getD2() as D2 & { version?: () => Promise<string>; jsVersion?: () => Promise<string> };
  const engine = d2.version ? await d2.version() : "unknown";
  const js = d2.jsVersion ? await d2.jsVersion() : "unknown";
  return { engine, js };
}
