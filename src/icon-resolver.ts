import { readdirSync, statSync, existsSync } from "node:fs";
import { join, basename, relative } from "node:path";

/**
 * Icon resolver — rewrites `icons.terrastruct.com` URLs in D2 source code
 * to local file paths, so D2 CLI never makes network requests for icons.
 *
 * Handles the common case where AI clients (Claude, etc.) invent simplified
 * URLs that don't match the real icon paths (wrong case, missing prefixes,
 * simplified category names, %2F-encoded slashes, etc.).
 *
 * Resolution strategy:
 *   1. Exact match (decoded URL path → local file)
 *   2. Filename match (just the .svg filename, case-insensitive)
 *   3. Stripped-prefix match (remove Amazon-, AWS-, Cloud- prefixes from both sides)
 *   4. Short alias match (e.g. "Lambda.svg" → "AWS-Lambda.svg",
 *      "ECS.svg" → "Amazon-Elastic-Container-Service.svg")
 */

const ICONS_BASE_URL = "https://icons.terrastruct.com";

// Default icons directory — set by Dockerfile to /app/icons
const ICONS_DIR = process.env.ICONS_DIR || join(process.cwd(), "icons");

// ── Index types ─────────────────────────────────────────────────────

interface IconIndex {
  /** Decoded relative path (e.g. "aws/Compute/AWS-Lambda.svg") → absolute local path */
  byExactPath: Map<string, string>;
  /** Normalized relative path (lowercase, spaces/special chars → _) → absolute local path */
  byNormalizedPath: Map<string, string>;
  /** Lowercase filename (e.g. "aws-lambda.svg") → absolute local path */
  byFilename: Map<string, string>;
  /**
   * Lowercase stripped name → absolute local path.
   * Strips common prefixes: Amazon-, AWS-, Cloud-, Azure-, Elastic-
   * E.g. "lambda.svg" → "/app/icons/aws/Compute/AWS-Lambda.svg"
   */
  byStrippedName: Map<string, string>;
  /**
   * Lowercase short alias → absolute local path.
   * For well-known abbreviations: ECS, EKS, RDS, SQS, SNS, etc.
   */
  byAlias: Map<string, string>;
}

// Well-known short names → canonical filename substring (case-insensitive match)
const ALIASES: Record<string, string> = {
  "ec2": "Amazon-EC2",
  "ecs": "Amazon-Elastic-Container-Service",
  "eks": "Amazon-Elastic-Kubernetes-Service",
  "rds": "Amazon-RDS",
  "s3": "Amazon-Simple-Storage-Service-S3",
  "sqs": "Amazon-Simple-Queue-Service-SQS",
  "sns": "Amazon-Simple-Notification-Service-SNS",
  "vpc": "Amazon-VPC",
  "iam": "AWS-Identify-and-Access-Management_IAM",
  "kms": "AWS-Key-Management-Service",
  "waf": "AWS-WAF",
  "elb": "Elastic-Load-Balancing",
  "alb": "Elastic-Load-Balancing",
  "nlb": "Elastic-Load-Balancing",
  "gke": "Kubetnetes Engine",
  "iot-core": "IoT-Core",
  "iot core": "IoT-Core",
  "opensearch": "Elasticsearch-Service",
  "elasticsearch": "Elasticsearch-Service",
  "x-ray": "X-Ray",
  "xray": "X-Ray",
  "athena": "Amazon-Athena",
};

// Claude often uses simplified AWS category names. Map them to real ones.
const CATEGORY_ALIASES: Record<string, string[]> = {
  "compute": ["Compute", "Compute Service Color"],
  "storage": ["Storage"],
  "database": ["Database", "Databases", "Databases Service Color"],
  "networking": ["Networking & Content Delivery", "Networking Service Color"],
  "network": ["Networking & Content Delivery", "Networking Service Color"],
  "security": ["Security, Identity, & Compliance"],
  "messaging": ["Application Integration"],
  "integration": ["Application Integration"],
  "analytics": ["Analytics", "Analytics Service Color", "Data Analytics"],
  "management": ["Management & Governance"],
  "devtools": ["Developer Tools", "DevOps Service Color"],
  "developer tools": ["Developer Tools"],
  "containers": ["Container Service Color"],
  "container": ["Container Service Color"],
  "web": ["Web Service Color"],
  "identity": ["Identity Service Color"],
  "devops": ["DevOps Service Color"],
  "mobile": ["Application Integration"],
  "iot": ["Internet of Things"],  // IoT icons are under their own category
  "ai": ["AI and Machine Learning"],
  "ml": ["AI and Machine Learning"],
};

let _index: IconIndex | null = null;

/**
 * Build the icon index by scanning the local icons directory.
 * Called lazily on first use.
 */
function buildIndex(): IconIndex {
  const index: IconIndex = {
    byExactPath: new Map(),
    byNormalizedPath: new Map(),
    byFilename: new Map(),
    byStrippedName: new Map(),
    byAlias: new Map(),
  };

  if (!existsSync(ICONS_DIR)) {
    console.warn(`[icon-resolver] Icons directory not found: ${ICONS_DIR}`);
    return index;
  }

  const files = walkDir(ICONS_DIR);

  for (const absPath of files) {
    const relPath = relative(ICONS_DIR, absPath);
    const fname = basename(relPath);
    const fnameLC = fname.toLowerCase();
    const stripped = stripPrefixes(fname).toLowerCase();

    // 1. Exact path match
    index.byExactPath.set(relPath, absPath);

    // 1b. Normalized path match (lowercase, spaces/special chars → _)
    const normalizedPath = normalizePath(relPath);
    if (!index.byNormalizedPath.has(normalizedPath)) {
      index.byNormalizedPath.set(normalizedPath, absPath);
    }

    // 2. Filename match (case-insensitive)
    // Don't overwrite — first match wins (prefer shorter paths)
    if (!index.byFilename.has(fnameLC)) {
      index.byFilename.set(fnameLC, absPath);
    }

    // 3. Stripped-prefix match
    if (!index.byStrippedName.has(stripped)) {
      index.byStrippedName.set(stripped, absPath);
    }
  }

  // 4. Alias index
  for (const [alias, canonicalSubstring] of Object.entries(ALIASES)) {
    const match = files.find((f) =>
      basename(f).includes(canonicalSubstring)
    );
    if (match) {
      index.byAlias.set(alias.toLowerCase() + ".svg", match);
    }
  }

  console.log(
    `[icon-resolver] Indexed ${index.byExactPath.size} icons from ${ICONS_DIR}`
  );

  return index;
}

function getIndex(): IconIndex {
  if (!_index) {
    _index = buildIndex();
  }
  return _index;
}

/**
 * Recursively walk a directory and return all .svg file paths.
 */
function walkDir(dir: string): string[] {
  const results: string[] = [];
  try {
    for (const entry of readdirSync(dir)) {
      const full = join(dir, entry);
      try {
        const stat = statSync(full);
        if (stat.isDirectory()) {
          results.push(...walkDir(full));
        } else if (entry.endsWith(".svg")) {
          results.push(full);
        }
      } catch {
        // Skip inaccessible entries
      }
    }
  } catch {
    // Skip inaccessible directories
  }
  return results;
}

/**
 * Strip common prefixes from an icon filename for fuzzy matching.
 */
function stripPrefixes(filename: string): string {
  return filename
    .replace(/^Amazon-/i, "")
    .replace(/^AWS-/i, "")
    .replace(/^Cloud-?/i, "")
    .replace(/^Azure-?/i, "")
    .replace(/^Elastic-/i, "");
}

/**
 * Normalize a path for comparison: lowercase, replace spaces/special chars with _.
 * This allows matching URL-decoded paths against sanitized filesystem paths.
 */
function normalizePath(p: string): string {
  return p
    .toLowerCase()
    .replace(/[\s&,]+/g, "_");
}

/**
 * Fully decode a URL path segment — handles %2F, %20, %26, HTML entities, etc.
 */
function fullyDecode(urlStr: string): string {
  try {
    // Repeatedly decode until stable (handles double-encoding)
    let prev = urlStr;
    let decoded = decodeURIComponent(urlStr);
    let rounds = 0;
    while (decoded !== prev && rounds < 3) {
      prev = decoded;
      decoded = decodeURIComponent(decoded);
      rounds++;
    }
    return decoded;
  } catch {
    return urlStr;
  }
}

/**
 * Try to resolve a single icon URL to a local file path.
 * Returns the absolute local path, or null if no match is found.
 */
function resolveOneUrl(url: string): string | null {
  const index = getIndex();

  // Extract path after the base URL
  let iconPath: string;
  if (url.startsWith(ICONS_BASE_URL + "/")) {
    iconPath = url.slice(ICONS_BASE_URL.length + 1);
  } else if (url.startsWith(ICONS_BASE_URL + "%2F")) {
    // Sometimes the first / is also encoded
    iconPath = url.slice(ICONS_BASE_URL.length + 3);
  } else {
    return null; // Not an icons.terrastruct.com URL
  }

  // Fully decode the path
  const decoded = fullyDecode(iconPath);

  // 1. Exact path match
  const exact = index.byExactPath.get(decoded);
  if (exact) return exact;

  // 2. Try with decoded slashes (Claude encodes / as %2F)
  //    The decoded path may have come from double-encoding: aws%2Fcompute%2F...
  const decodedSlash = decoded.replace(/%2F/gi, "/");
  const exactSlash = index.byExactPath.get(decodedSlash);
  if (exactSlash) return exactSlash;

  // 2b. Normalized path match (handles spaces, &, case differences)
  const normalizedInput = normalizePath(decodedSlash);
  const byNorm = index.byNormalizedPath.get(normalizedInput);
  if (byNorm) return byNorm;

  // Extract components for fuzzy matching
  const parts = decodedSlash.split("/");
  const filename = parts[parts.length - 1];
  const filenameLC = filename.toLowerCase();

  // 3. Filename match (case-insensitive)
  const byName = index.byFilename.get(filenameLC);
  if (byName) return byName;

  // 4. Alias match (e.g. "ECS.svg" → known full name)
  const byAlias = index.byAlias.get(filenameLC);
  if (byAlias) return byAlias;

  // 5. Stripped-prefix match
  const stripped = stripPrefixes(filename).toLowerCase();
  const byStripped = index.byStrippedName.get(stripped);
  if (byStripped) return byStripped;

  // 6. Category-aware fuzzy match
  //    Claude uses simplified categories (e.g. "networking" → "Networking & Content Delivery")
  if (parts.length >= 3) {
    const provider = parts[0].toLowerCase(); // "aws", "gcp", "azure"
    const category = parts.slice(1, -1).join("/").toLowerCase();
    const realCategories = CATEGORY_ALIASES[category] || [];

    for (const realCat of realCategories) {
      // Try: provider/realCategory/filename (exact)
      const tryPath = `${parts[0]}/${realCat}/${filename}`;
      const found = index.byExactPath.get(tryPath);
      if (found) return found;

      // Try: provider/realCategory/* with stripped prefix match
      for (const [path, absPath] of index.byExactPath) {
        const pathLC = path.toLowerCase();
        if (
          pathLC.startsWith(provider + "/" + realCat.toLowerCase() + "/") &&
          stripPrefixes(basename(path)).toLowerCase() === stripped
        ) {
          return absPath;
        }
      }
    }
  }

  // 7. Last resort: scan all files for exact stem match on the filename
  //    (not substring — too many false positives like "c.svg" matching everything)
  const stem = filename.replace(/\.svg$/i, "").toLowerCase();
  if (stem.length >= 3) {
    for (const [, absPath] of index.byExactPath) {
      const candidateStem = basename(absPath)
        .replace(/\.svg$/i, "")
        .toLowerCase();
      // Only match if one stem equals the other exactly (after stripping prefixes)
      const candidateStripped = stripPrefixes(basename(absPath))
        .replace(/\.svg$/i, "")
        .toLowerCase();
      if (candidateStripped === stem || stem === candidateStripped) {
        return absPath;
      }
    }
  }

  return null;
}

/**
 * Rewrite all `icons.terrastruct.com` URLs in D2 source code to local file paths.
 *
 * This is the main entry point. Call before passing D2 source to the CLI.
 */
export function resolveIconUrls(d2Source: string): string {
  // Match any URL starting with https://icons.terrastruct.com
  // The URL may contain encoded characters (%2F, %20, etc.)
  // In D2 source, icon URLs appear after `icon:` attribute
  const urlRegex =
    /https?:\/\/icons\.terrastruct\.com[^\s)}\]"'`,;\\]*/gi;

  let resolvedCount = 0;
  let failedUrls: string[] = [];

  const result = d2Source.replace(urlRegex, (match) => {
    const localPath = resolveOneUrl(match);
    if (localPath) {
      resolvedCount++;
      return localPath;
    }
    failedUrls.push(match);
    return match; // Leave unresolved URLs as-is
  });

  if (resolvedCount > 0 || failedUrls.length > 0) {
    console.log(
      `[icon-resolver] Resolved ${resolvedCount} icon URLs to local files` +
        (failedUrls.length > 0
          ? `, ${failedUrls.length} unresolved: ${failedUrls.join(", ")}`
          : "")
    );
  }

  return result;
}
