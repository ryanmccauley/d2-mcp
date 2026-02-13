#!/usr/bin/env node

/**
 * Test script that sends Claude's exact broken icon request to the deployed
 * MCP server via Streamable HTTP, mimicking the real Claude integration.
 *
 * Usage:
 *   node scripts/test-deployed.mjs [SERVER_URL]
 *
 * Default server: https://d2-mcp.onrender.com
 */

const SERVER_URL = process.argv[2] || "https://d2-mcp.onrender.com";
const MCP_ENDPOINT = `${SERVER_URL}/mcp`;

// Claude's exact D2 code from the error report
const CLAUDE_D2_CODE = `
direction: right

users: Users Worldwide {
  icon: https://icons.terrastruct.com/essentials%2F359-users.svg
}

cdn: CloudFront CDN {
  icon: https://icons.terrastruct.com/aws%2Fnetworking%2FCloudFront.svg
}

aws: AWS Global Infrastructure {
  style.fill: "#FF9900"
  style.font-color: white

  edge: Edge Services {
    r53: Route 53 {
      icon: https://icons.terrastruct.com/aws%2Fnetworking%2FRoute-53.svg
    }
    waf: WAF & Shield {
      icon: https://icons.terrastruct.com/aws%2Fsecurity%2FWAF.svg
    }
    apigateway: API Gateway {
      icon: https://icons.terrastruct.com/aws%2Fnetworking%2FAPI-Gateway.svg
    }
  }

  app: Application Tier {
    alb: Application Load Balancer {
      icon: https://icons.terrastruct.com/aws%2Fnetworking%2FElastic-Load-Balancing.svg
    }
    ecs: ECS Fargate Cluster {
      icon: https://icons.terrastruct.com/aws%2Fcompute%2FECS.svg
      msg_service: Message Service
      auth_service: Auth Service
    }
    lambda: Lambda Functions {
      icon: https://icons.terrastruct.com/aws%2Fcompute%2FLambda.svg
      notification: Push Notifications
      analytics: Analytics Processing
    }
  }

  data: Data Persistence {
    dynamodb: DynamoDB {
      icon: https://icons.terrastruct.com/aws%2Fdatabase%2FDynamoDB.svg
      messages: Messages Table
      users_db: Users Table
    }
    s3: S3 Buckets {
      icon: https://icons.terrastruct.com/aws%2Fstorage%2FS3.svg
      media: Media Files
    }
  }

  queues: Async Processing {
    sqs: SQS Queues {
      icon: https://icons.terrastruct.com/aws%2Fmessaging%2FSQS.svg
      msg_queue: Message Queue
    }
    kinesis: Kinesis Data Streams {
      icon: https://icons.terrastruct.com/aws%2Fanalytics%2FKinesis.svg
    }
    sns: SNS Topics {
      icon: https://icons.terrastruct.com/aws%2Fmessaging%2FSNS.svg
    }
  }

  ops: Operations {
    cloudwatch: CloudWatch {
      icon: https://icons.terrastruct.com/aws%2Fmanagement%2FCloudWatch.svg
    }
    kms: KMS Encryption {
      icon: https://icons.terrastruct.com/aws%2Fsecurity%2FKMS.svg
    }
  }
}

users -> cdn: Static Assets
users -> aws.edge.r53: DNS
users -> aws.edge.apigateway: REST API
aws.edge.apigateway -> aws.app.alb: Route
aws.app.alb -> aws.app.ecs: Distribute
aws.app.ecs -> aws.data.dynamodb: Store
aws.app.ecs -> aws.data.s3: Upload
aws.app.ecs -> aws.queues.sqs: Queue
aws.app.ecs -> aws.ops.cloudwatch: Logs
`;

async function jsonRpcRequest(method, params, id) {
  return { jsonrpc: "2.0", method, params, id };
}

async function sendRequest(body, sessionId) {
  const headers = {
    "Content-Type": "application/json",
    Accept: "application/json, text/event-stream",
  };
  if (sessionId) {
    headers["mcp-session-id"] = sessionId;
  }

  const res = await fetch(MCP_ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  return res;
}

function parseSSEResponse(text) {
  // Parse Server-Sent Events format
  const events = [];
  const lines = text.split("\n");
  let currentData = "";

  for (const line of lines) {
    if (line.startsWith("data: ")) {
      currentData += line.slice(6);
    } else if (line === "" && currentData) {
      try {
        events.push(JSON.parse(currentData));
      } catch {
        // Not JSON, skip
      }
      currentData = "";
    }
  }
  // Handle last event without trailing newline
  if (currentData) {
    try {
      events.push(JSON.parse(currentData));
    } catch {
      // Not JSON
    }
  }

  return events;
}

async function main() {
  console.log(`Testing against: ${SERVER_URL}`);
  console.log("=".repeat(60));

  // Step 1: Health check
  console.log("\n1. Health check...");
  try {
    const healthRes = await fetch(`${SERVER_URL}/health`);
    const health = await healthRes.json();
    console.log(`   Status: ${health.status} (${healthRes.status})`);
  } catch (err) {
    console.log(`   FAILED: ${err.message}`);
    console.log(
      "   Server may be sleeping (Render free tier). Retrying in 30s..."
    );
    await new Promise((r) => setTimeout(r, 30000));
    const healthRes = await fetch(`${SERVER_URL}/health`);
    const health = await healthRes.json();
    console.log(`   Status: ${health.status} (${healthRes.status})`);
  }

  // Step 2: Initialize MCP session
  console.log("\n2. Initializing MCP session...");
  const initReq = await jsonRpcRequest(
    "initialize",
    {
      protocolVersion: "2025-03-26",
      capabilities: {},
      clientInfo: { name: "test-script", version: "1.0.0" },
    },
    1
  );

  const initRes = await sendRequest(initReq, null);
  const sessionId = initRes.headers.get("mcp-session-id");
  const initText = await initRes.text();
  const initEvents = parseSSEResponse(initText);

  if (!sessionId) {
    // Try JSON response
    try {
      const json = JSON.parse(initText);
      console.log(`   Session: (inline response)`);
      console.log(`   Server: ${json.result?.serverInfo?.name} v${json.result?.serverInfo?.version}`);
    } catch {
      console.log(`   FAILED: No session ID in response`);
      console.log(`   Response: ${initText.substring(0, 500)}`);
      process.exit(1);
    }
  } else {
    console.log(`   Session: ${sessionId}`);
    if (initEvents.length > 0 && initEvents[0].result) {
      console.log(
        `   Server: ${initEvents[0].result.serverInfo?.name} v${initEvents[0].result.serverInfo?.version}`
      );
    }
  }

  const sid = sessionId;

  // Step 3: Send initialized notification
  console.log("\n3. Sending initialized notification...");
  const notifReq = { jsonrpc: "2.0", method: "notifications/initialized" };
  await sendRequest(notifReq, sid);
  console.log("   Done.");

  // Step 4: Call compile tool with Claude's broken icon URLs
  console.log("\n4. Calling compile tool with Claude's broken icon URLs...");
  console.log("   (This is the request that was failing with 403 errors)");
  const compileReq = await jsonRpcRequest(
    "tools/call",
    {
      name: "compile",
      arguments: {
        code: CLAUDE_D2_CODE,
        layout: "dagre",
        pad: 100,
        themeID: 3,
      },
    },
    2
  );

  const startTime = Date.now();
  const compileRes = await sendRequest(compileReq, sid);
  const elapsed = Date.now() - startTime;

  const compileText = await compileRes.text();

  console.log(`   HTTP Status: ${compileRes.status}`);
  console.log(`   Time: ${elapsed}ms`);

  // Parse the response
  let result;
  try {
    // Try direct JSON first
    result = JSON.parse(compileText);
  } catch {
    // Try SSE format
    const events = parseSSEResponse(compileText);
    result = events.find((e) => e.result || e.error);
  }

  if (!result) {
    console.log("   FAILED: Could not parse response");
    console.log(`   Raw (first 1000 chars): ${compileText.substring(0, 1000)}`);
    process.exit(1);
  }

  if (result.error) {
    console.log(`\n   ERROR: ${result.error.message}`);
    console.log(`   Code: ${result.error.code}`);
    if (result.error.data) {
      console.log(`   Data: ${JSON.stringify(result.error.data).substring(0, 500)}`);
    }
    process.exit(1);
  }

  const content = result.result?.content || [];
  const imageContent = content.find((c) => c.type === "image");
  const textContent = content.find((c) => c.type === "text");

  console.log(`\n   SUCCESS!`);
  console.log(`   Content blocks: ${content.length}`);

  if (imageContent) {
    const pngSize = Buffer.from(imageContent.data, "base64").length;
    console.log(`   PNG image: ${(pngSize / 1024).toFixed(1)} KB`);
  }

  if (textContent) {
    const svgSize = textContent.text.length;
    console.log(`   SVG markup: ${(svgSize / 1024).toFixed(1)} KB`);

    // Check for any remaining icon error references
    if (textContent.text.includes("failed to bundle")) {
      console.log("\n   WARNING: SVG contains bundle failure references!");
    }

    // Check if SVG contains embedded icon data
    const dataUriCount = (textContent.text.match(/data:image/g) || []).length;
    const localFileCount = (textContent.text.match(/xlink:href="\/app\/icons/g) || []).length;
    console.log(`   Embedded data URIs in SVG: ${dataUriCount}`);
    console.log(`   Local file refs in SVG: ${localFileCount}`);
  }

  // Step 5: Clean up session
  console.log("\n5. Cleaning up session...");
  if (sid) {
    await fetch(MCP_ENDPOINT, {
      method: "DELETE",
      headers: { "mcp-session-id": sid },
    });
  }
  console.log("   Done.");

  console.log("\n" + "=".repeat(60));
  console.log("TEST PASSED - Icons compiled successfully!");
  console.log("=".repeat(60));
}

main().catch((err) => {
  console.error("\nFATAL:", err.message);
  process.exit(1);
});
