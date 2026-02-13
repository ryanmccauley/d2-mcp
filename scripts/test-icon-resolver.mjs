#!/usr/bin/env node

/**
 * Test the icon resolver against Claude's exact broken URLs.
 * Run: ICONS_DIR=/tmp/test-icons/full node scripts/test-icon-resolver.mjs
 */

// Claude's broken URLs from the error report
const CLAUDE_URLS = [
  "https://icons.terrastruct.com/essentials%2F359-users.svg",
  "https://icons.terrastruct.com/aws%2Fnetworking%2FCloudFront.svg",
  "https://icons.terrastruct.com/aws%2Fnetworking%2FRoute-53.svg",
  "https://icons.terrastruct.com/aws%2Fsecurity%2FWAF.svg",
  "https://icons.terrastruct.com/aws%2Fnetworking%2FAPI-Gateway.svg",
  "https://icons.terrastruct.com/aws%2Fnetworking%2FElastic-Load-Balancing.svg",
  "https://icons.terrastruct.com/aws%2Fcompute%2FECS.svg",
  "https://icons.terrastruct.com/aws%2Fcompute%2FLambda.svg",
  "https://icons.terrastruct.com/aws%2Fmobile%2FAppSync.svg",
  "https://icons.terrastruct.com/aws%2Fiot%2FIoT-Core.svg",
  "https://icons.terrastruct.com/aws%2Fdatabase%2FElastiCache.svg",
  "https://icons.terrastruct.com/aws%2Fdatabase%2FDynamoDB.svg",
  "https://icons.terrastruct.com/aws%2Fdatabase%2FAurora.svg",
  "https://icons.terrastruct.com/aws%2Fstorage%2FS3.svg",
  "https://icons.terrastruct.com/aws%2Fmessaging%2FSQS.svg",
  "https://icons.terrastruct.com/aws%2Fanalytics%2FKinesis.svg",
  "https://icons.terrastruct.com/aws%2Fmessaging%2FSNS.svg",
  "https://icons.terrastruct.com/aws%2Fanalytics%2FOpenSearch.svg",
  "https://icons.terrastruct.com/aws%2Fanalytics%2FRedshift.svg",
  "https://icons.terrastruct.com/aws%2Fanalytics%2FAthena.svg",
  "https://icons.terrastruct.com/aws%2Fmanagement%2FCloudWatch.svg",
  "https://icons.terrastruct.com/aws%2Fmanagement%2FX-Ray.svg",
  "https://icons.terrastruct.com/aws%2Fsecurity%2FKMS.svg",
  "https://icons.terrastruct.com/aws%2Fsecurity%2FSecrets-Manager.svg",
  "https://icons.terrastruct.com/dev%2Ffirebase.svg",
  "https://icons.terrastruct.com/dev%2Fapple.svg",
];

// Build a D2 source snippet using these URLs (like Claude would)
const d2Source = CLAUDE_URLS.map(
  (url, i) => `node${i}: { icon: ${url} }`
).join("\n");

// Dynamically import the compiled resolver
const { resolveIconUrls } = await import("../dist/icon-resolver.js");

console.log("=== Testing icon resolver with Claude's broken URLs ===\n");

const resolved = resolveIconUrls(d2Source);

// Check each URL
let passed = 0;
let failed = 0;
for (const url of CLAUDE_URLS) {
  if (resolved.includes(url)) {
    console.log(`FAIL: ${url}`);
    console.log(`  -> NOT resolved (still in source)\n`);
    failed++;
  } else {
    // Find what it was resolved to
    const lines = resolved.split("\n");
    const idx = CLAUDE_URLS.indexOf(url);
    const line = lines[idx];
    const match = line?.match(/icon: (.+)/);
    console.log(`OK:   ${url}`);
    console.log(`  -> ${match?.[1] || "???"}\n`);
    passed++;
  }
}

console.log(`\n=== Results: ${passed} passed, ${failed} failed out of ${CLAUDE_URLS.length} ===`);

if (failed > 0) {
  process.exit(1);
}
