import { z } from "zod";

export const listIconsToolName = "list_icons";

export const listIconsToolDescription =
  "List available icons from the Terrastruct icon library for use in D2 diagrams. Icons are grouped by category (AWS, GCP, Azure, Kubernetes, dev tools, etc.). Use the returned URLs with the 'icon' attribute in D2 source code.";

export const listIconsToolSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category name (e.g. 'aws', 'gcp', 'azure', 'k8s', 'dev', 'essentials', 'tech'). If omitted, returns all categories with example icons."
    ),
});

export type ListIconsToolInput = z.infer<typeof listIconsToolSchema>;

const BASE = "https://icons.terrastruct.com";

// Curated icon catalog from icons.terrastruct.com
const ICON_CATALOG: Record<
  string,
  { description: string; icons: { name: string; url: string }[] }
> = {
  aws: {
    description: "Amazon Web Services cloud icons",
    icons: [
      { name: "EC2", url: `${BASE}/aws%2F_Group%20Icons%2FEC2-instance-contents.svg` },
      { name: "S3", url: `${BASE}/aws%2Fstorage%2FS3.svg` },
      { name: "Lambda", url: `${BASE}/aws%2Fcompute%2FLambda.svg` },
      { name: "RDS", url: `${BASE}/aws%2Fdatabase%2FRDS.svg` },
      { name: "DynamoDB", url: `${BASE}/aws%2Fdatabase%2FDynamoDB.svg` },
      { name: "API Gateway", url: `${BASE}/aws%2Fnetworking%2FAPI-Gateway.svg` },
      { name: "CloudFront", url: `${BASE}/aws%2Fnetworking%2FCloudFront.svg` },
      { name: "VPC", url: `${BASE}/aws%2Fnetworking%2FVPC.svg` },
      { name: "SQS", url: `${BASE}/aws%2Fmessaging%2FSQS.svg` },
      { name: "SNS", url: `${BASE}/aws%2Fmessaging%2FSNS.svg` },
      { name: "ECS", url: `${BASE}/aws%2Fcompute%2FECS.svg` },
      { name: "EKS", url: `${BASE}/aws%2Fcompute%2FEKS.svg` },
      { name: "CloudWatch", url: `${BASE}/aws%2Fmanagement%2FCloudWatch.svg` },
      { name: "IAM", url: `${BASE}/aws%2Fsecurity%2FIAM.svg` },
      { name: "Elastic Load Balancing", url: `${BASE}/aws%2Fnetworking%2FElastic-Load-Balancing.svg` },
    ],
  },
  gcp: {
    description: "Google Cloud Platform icons",
    icons: [
      { name: "Compute Engine", url: `${BASE}/gcp%2FProducts%20and%20services%2FCompute%2FCompute%20Engine.svg` },
      { name: "Cloud Storage", url: `${BASE}/gcp%2FProducts%20and%20services%2FStorage%2FCloud%20Storage.svg` },
      { name: "Cloud Functions", url: `${BASE}/gcp%2FProducts%20and%20services%2FCompute%2FCloud%20Functions.svg` },
      { name: "Cloud Run", url: `${BASE}/gcp%2FProducts%20and%20services%2FCompute%2FCloud%20Run.svg` },
      { name: "BigQuery", url: `${BASE}/gcp%2FProducts%20and%20services%2FData%20Analytics%2FBigQuery.svg` },
      { name: "Cloud SQL", url: `${BASE}/gcp%2FProducts%20and%20services%2FDatabases%2FCloud%20SQL.svg` },
      { name: "GKE", url: `${BASE}/gcp%2FProducts%20and%20services%2FCompute%2FGoogle%20Kubernetes%20Engine.svg` },
      { name: "Pub/Sub", url: `${BASE}/gcp%2FProducts%20and%20services%2FData%20Analytics%2FPub-Sub.svg` },
    ],
  },
  azure: {
    description: "Microsoft Azure cloud icons",
    icons: [
      { name: "Virtual Machine", url: `${BASE}/azure%2FCompute%2FVirtual%20Machine.svg` },
      { name: "Blob Storage", url: `${BASE}/azure%2FStorage%2FBlob%20Storage.svg` },
      { name: "Functions", url: `${BASE}/azure%2FCompute%2FFunction%20Apps.svg` },
      { name: "SQL Database", url: `${BASE}/azure%2FDatabases%2FSQL%20Database.svg` },
      { name: "Kubernetes Service", url: `${BASE}/azure%2FContainers%2FKubernetes%20Services.svg` },
      { name: "App Service", url: `${BASE}/azure%2FApp%20Services%2FApp%20Services.svg` },
    ],
  },
  k8s: {
    description: "Kubernetes resource icons",
    icons: [
      { name: "Pod", url: `${BASE}/k8s%2Fpod.svg` },
      { name: "Service", url: `${BASE}/k8s%2Fsvc.svg` },
      { name: "Deployment", url: `${BASE}/k8s%2Fdeploy.svg` },
      { name: "Node", url: `${BASE}/k8s%2Fnode.svg` },
      { name: "Ingress", url: `${BASE}/k8s%2Fing.svg` },
      { name: "ConfigMap", url: `${BASE}/k8s%2Fcm.svg` },
      { name: "Secret", url: `${BASE}/k8s%2Fsecret.svg` },
      { name: "PersistentVolume", url: `${BASE}/k8s%2Fpv.svg` },
      { name: "Namespace", url: `${BASE}/k8s%2Fns.svg` },
    ],
  },
  dev: {
    description: "Developer tools and programming languages",
    icons: [
      { name: "GitHub", url: `${BASE}/dev%2Fgithub.svg` },
      { name: "Git", url: `${BASE}/dev%2Fgit.svg` },
      { name: "Docker", url: `${BASE}/dev%2Fdocker.svg` },
      { name: "TypeScript", url: `${BASE}/dev%2Ftypescript.svg` },
      { name: "JavaScript", url: `${BASE}/dev%2Fjavascript.svg` },
      { name: "Python", url: `${BASE}/dev%2Fpython.svg` },
      { name: "Go", url: `${BASE}/dev%2Fgo.svg` },
      { name: "Rust", url: `${BASE}/dev%2Frust.svg` },
      { name: "React", url: `${BASE}/dev%2Freact.svg` },
      { name: "Node.js", url: `${BASE}/dev%2Fnodejs.svg` },
      { name: "PostgreSQL", url: `${BASE}/dev%2Fpostgresql.svg` },
      { name: "MySQL", url: `${BASE}/dev%2Fmysql.svg` },
      { name: "MongoDB", url: `${BASE}/dev%2Fmongodb.svg` },
      { name: "Redis", url: `${BASE}/dev%2Fredis.svg` },
      { name: "Terraform", url: `${BASE}/dev%2Fterraform.svg` },
      { name: "Kubernetes", url: `${BASE}/dev%2Fkubernetes.svg` },
      { name: "Linux", url: `${BASE}/dev%2Flinux.svg` },
      { name: "Nginx", url: `${BASE}/dev%2Fnginx.svg` },
      { name: "Grafana", url: `${BASE}/dev%2Fgrafana.svg` },
      { name: "Prometheus", url: `${BASE}/dev%2Fprometheus.svg` },
    ],
  },
  essentials: {
    description: "Essential general-purpose icons (servers, users, networks, etc.)",
    icons: [
      { name: "Server", url: `${BASE}/essentials%2F112-server.svg` },
      { name: "Database", url: `${BASE}/essentials%2F119-database.svg` },
      { name: "Cloud", url: `${BASE}/essentials%2F187-cloud.svg` },
      { name: "User", url: `${BASE}/essentials%2F359-users.svg` },
      { name: "Globe", url: `${BASE}/essentials%2F092-globe.svg` },
      { name: "Lock", url: `${BASE}/essentials%2F112-lock.svg` },
      { name: "Gear", url: `${BASE}/essentials%2F182-gear.svg` },
      { name: "Document", url: `${BASE}/essentials%2F257-document.svg` },
      { name: "Folder", url: `${BASE}/essentials%2F259-folder.svg` },
      { name: "Mail", url: `${BASE}/essentials%2F264-mail.svg` },
      { name: "Bell", url: `${BASE}/essentials%2F265-bell.svg` },
      { name: "Calendar", url: `${BASE}/essentials%2F268-calendar.svg` },
      { name: "Checkmark", url: `${BASE}/essentials%2F267-checkmark.svg` },
      { name: "Warning", url: `${BASE}/essentials%2F275-warning.svg` },
    ],
  },
  tech: {
    description: "Tech company and product logos",
    icons: [
      { name: "Slack", url: `${BASE}/tech%2Fslack.svg` },
      { name: "Stripe", url: `${BASE}/tech%2Fstripe.svg` },
      { name: "Datadog", url: `${BASE}/tech%2Fdatadog.svg` },
      { name: "CircleCI", url: `${BASE}/tech%2Fcircleci.svg` },
    ],
  },
};

export async function handleListIcons(input: ListIconsToolInput) {
  const { category } = input;

  if (category) {
    const key = category.toLowerCase();
    const cat = ICON_CATALOG[key];
    if (!cat) {
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                error: `Unknown category '${category}'`,
                available: Object.keys(ICON_CATALOG),
              },
              null,
              2
            ),
          },
        ],
      };
    }
    return {
      content: [
        {
          type: "text" as const,
          text: JSON.stringify(
            {
              category: key,
              description: cat.description,
              icons: cat.icons,
              usage: `In D2, use an icon like:\nmy_shape: {\n  icon: ${cat.icons[0].url}\n}\n\nOr as a standalone image:\nmy_icon: {\n  icon: ${cat.icons[0].url}\n  shape: image\n}`,
              browse_all: "https://icons.terrastruct.com",
            },
            null,
            2
          ),
        },
      ],
    };
  }

  // Return all categories with counts and examples
  const summary = Object.entries(ICON_CATALOG).map(([key, cat]) => ({
    category: key,
    description: cat.description,
    count: cat.icons.length,
    examples: cat.icons.slice(0, 3).map((i) => i.name),
  }));

  return {
    content: [
      {
        type: "text" as const,
        text: JSON.stringify(
          {
            categories: summary,
            usage:
              "Call this tool with a 'category' parameter to see all icons in that category. Use the icon URLs with the 'icon' attribute in D2 source code.",
            browse_all: "https://icons.terrastruct.com",
          },
          null,
          2
        ),
      },
    ],
  };
}
