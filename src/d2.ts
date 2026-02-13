import { execFile } from "node:child_process";

/**
 * Path to the d2 CLI binary. Defaults to "d2" (resolved via PATH).
 * Override with the D2_PATH environment variable if installed elsewhere.
 */
const D2_BIN = process.env.D2_PATH || "d2";

/** Timeout for CLI invocations (30 seconds). */
const CLI_TIMEOUT_MS = 30_000;

export interface CompileResult {
  svg: string;
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

/**
 * Compile D2 source code into SVG by shelling out to the d2 CLI.
 *
 * Equivalent to: echo '<code>' | d2 [flags] - -
 *   - First `-` = read from stdin
 *   - Second `-` = write to stdout
 */
export async function compileD2(
  code: string,
  options: CompileOptions = {}
): Promise<CompileResult> {
  const args = buildCompileArgs(options);
  // Input from stdin (`-`), output to stdout (`-`)
  args.push("-", "-");

  const stdout = await runD2(args, code);
  return { svg: stdout };
}

/**
 * Validate D2 source code without rendering.
 *
 * Equivalent to: echo '<code>' | d2 validate -
 */
export async function validateD2(
  code: string
): Promise<{ valid: boolean; errors: string[] }> {
  try {
    await runD2(["validate", "-"], code);
    return { valid: true, errors: [] };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    // The CLI prints error details to stderr on validation failure
    return { valid: false, errors: [message] };
  }
}

/**
 * Get the installed D2 CLI version.
 *
 * Equivalent to: d2 --version
 */
export async function getD2Version(): Promise<string> {
  const output = await runD2(["--version"]);
  return output.trim();
}

// ── Helpers ──────────────────────────────────────────────────────────

function buildCompileArgs(options: CompileOptions): string[] {
  const args: string[] = [];

  if (options.layout) {
    args.push("--layout", options.layout);
  }
  if (options.themeID !== undefined) {
    args.push("--theme", String(options.themeID));
  }
  if (options.darkThemeID !== undefined) {
    args.push("--dark-theme", String(options.darkThemeID));
  }
  if (options.sketch) {
    args.push("--sketch");
  }
  if (options.pad !== undefined) {
    args.push("--pad", String(options.pad));
  }
  if (options.center) {
    args.push("--center");
  }
  if (options.scale !== undefined) {
    args.push("--scale", String(options.scale));
  }
  if (options.target !== undefined) {
    args.push("--target", options.target);
  }
  if (options.animateInterval !== undefined) {
    args.push("--animate-interval", String(options.animateInterval));
  }
  if (options.noXMLTag) {
    args.push("--no-xml-tag");
  }

  return args;
}

/**
 * Run the d2 CLI with the given args, optionally piping `stdin` data.
 * Resolves with stdout on success; rejects with stderr on non-zero exit.
 */
function runD2(args: string[], stdin?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = execFile(
      D2_BIN,
      args,
      {
        timeout: CLI_TIMEOUT_MS,
        maxBuffer: 20 * 1024 * 1024, // 20 MB — SVGs can be large
        encoding: "utf-8",
      },
      (error, stdout, stderr) => {
        if (error) {
          // Combine stderr with the error message for context
          const detail = stderr?.trim() || error.message;
          reject(new Error(detail));
          return;
        }
        resolve(stdout);
      }
    );

    if (stdin && child.stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }
  });
}
