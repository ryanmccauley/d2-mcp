import { z } from "zod";

export const listIconsToolName = "list_icons";

export const listIconsToolDescription =
  "List available icons from the Terrastruct icon library for use in D2 diagrams. Icons are grouped by category (AWS, GCP, Azure, dev tools, etc.). Use the returned URLs with the 'icon' attribute in D2 source code.";

export const listIconsToolSchema = z.object({
  category: z
    .string()
    .optional()
    .describe(
      "Filter by category name (e.g. 'aws', 'gcp', 'azure', 'dev', 'essentials', 'infra', 'social', 'tech'). If omitted, returns all categories with example icons."
    ),
});

export type ListIconsToolInput = z.infer<typeof listIconsToolSchema>;

const BASE = "https://icons.terrastruct.com";

// Helper to build a URL-safe path with proper encoding
function icon(path: string): string {
  // Encode each path segment individually, preserving `/`
  return (
    BASE +
    "/" +
    path
      .split("/")
      .map((s) => encodeURIComponent(s))
      .join("/")
  );
}

// Curated icon catalog — all URLs verified against icons.terrastruct.com
const ICON_CATALOG: Record<
  string,
  { description: string; icons: { name: string; url: string }[] }
> = {
  aws: {
    description: "Amazon Web Services cloud icons",
    icons: [
      // Compute
      { name: "EC2", url: icon("aws/Compute/Amazon-EC2.svg") },
      { name: "Lambda", url: icon("aws/Compute/AWS-Lambda.svg") },
      { name: "ECS", url: icon("aws/Compute/Amazon-Elastic-Container-Service.svg") },
      { name: "EKS", url: icon("aws/Compute/Amazon-Elastic-Kubernetes-Service.svg") },
      { name: "Fargate", url: icon("aws/Compute/AWS-Fargate.svg") },
      { name: "Elastic Beanstalk", url: icon("aws/Compute/AWS-Elastic-Beanstalk.svg") },
      // Storage
      { name: "S3", url: icon("aws/Storage/Amazon-Simple-Storage-Service-S3.svg") },
      // Database
      { name: "RDS", url: icon("aws/Database/Amazon-RDS.svg") },
      { name: "DynamoDB", url: icon("aws/Database/Amazon-DynamoDB.svg") },
      { name: "Aurora", url: icon("aws/Database/Amazon-Aurora.svg") },
      { name: "ElastiCache", url: icon("aws/Database/Amazon-ElastiCache.svg") },
      { name: "Redshift", url: icon("aws/Database/Amazon-Redshift.svg") },
      // Networking & Content Delivery
      { name: "API Gateway", url: icon("aws/Networking & Content Delivery/Amazon-API-Gateway.svg") },
      { name: "CloudFront", url: icon("aws/Networking & Content Delivery/Amazon-CloudFront.svg") },
      { name: "Route 53", url: icon("aws/Networking & Content Delivery/Amazon-Route-53.svg") },
      { name: "VPC", url: icon("aws/Networking & Content Delivery/Amazon-VPC.svg") },
      { name: "Elastic Load Balancing", url: icon("aws/Networking & Content Delivery/Elastic-Load-Balancing.svg") },
      // Application Integration
      { name: "SQS", url: icon("aws/Application Integration/Amazon-Simple-Queue-Service-SQS.svg") },
      { name: "SNS", url: icon("aws/Application Integration/Amazon-Simple-Notification-Service-SNS.svg") },
      { name: "Step Functions", url: icon("aws/Application Integration/AWS-Step-Functions.svg") },
      { name: "EventBridge", url: icon("aws/Application Integration/Amazon-EventBridge.svg") },
      { name: "AppSync", url: icon("aws/Application Integration/Amazon-AppSync.svg") },
      // Analytics
      { name: "Kinesis", url: icon("aws/Analytics/Amazon-Kinesis.svg") },
      { name: "Redshift (Analytics)", url: icon("aws/Analytics/Amazon-Redshift.svg") },
      { name: "Athena", url: icon("aws/Analytics/Amazon-Athena.svg") },
      { name: "OpenSearch (Elasticsearch)", url: icon("aws/Analytics/Amazon-Elasticsearch-Service.svg") },
      // Security, Identity, & Compliance
      { name: "IAM", url: icon("aws/Security, Identity, & Compliance/AWS-Identify-and-Access-Management_IAM.svg") },
      { name: "Cognito", url: icon("aws/Security, Identity, & Compliance/Amazon-Cognito.svg") },
      { name: "Secrets Manager", url: icon("aws/Security, Identity, & Compliance/AWS-Secrets-Manager.svg") },
      { name: "WAF", url: icon("aws/Security, Identity, & Compliance/AWS-WAF.svg") },
      { name: "Shield", url: icon("aws/Security, Identity, & Compliance/AWS-Shield.svg") },
      { name: "KMS", url: icon("aws/Security, Identity, & Compliance/AWS-Key-Management-Service.svg") },
      // Management & Governance
      { name: "CloudWatch", url: icon("aws/Management & Governance/Amazon-CloudWatch.svg") },
      { name: "CloudFormation", url: icon("aws/Management & Governance/AWS-CloudFormation.svg") },
      { name: "CloudTrail", url: icon("aws/Management & Governance/AWS-CloudTrail.svg") },
      // Developer Tools
      { name: "CodePipeline", url: icon("aws/Developer Tools/AWS-CodePipeline.svg") },
      { name: "CodeBuild", url: icon("aws/Developer Tools/AWS-CodeBuild.svg") },
      { name: "CodeDeploy", url: icon("aws/Developer Tools/AWS-CodeDeploy.svg") },
      { name: "X-Ray", url: icon("aws/Developer Tools/AWS-X-Ray.svg") },
      // Internet of Things
      { name: "IoT Core", url: icon("aws/Internet of Things/AWS-IoT-Core.svg") },
    ],
  },
  gcp: {
    description: "Google Cloud Platform icons",
    icons: [
      // Compute
      { name: "Compute Engine", url: icon("gcp/Products and services/Compute/Compute Engine.svg") },
      { name: "Cloud Functions", url: icon("gcp/Products and services/Compute/Cloud Functions.svg") },
      { name: "Cloud Run", url: icon("gcp/Products and services/Compute/Cloud Run.svg") },
      { name: "App Engine", url: icon("gcp/Products and services/Compute/App Engine.svg") },
      { name: "GKE", url: icon("gcp/Products and services/Compute/Kubetnetes Engine.svg") },
      // Storage
      { name: "Cloud Storage", url: icon("gcp/Products and services/Storage/Cloud Storage.svg") },
      { name: "Persistent Disk", url: icon("gcp/Products and services/Storage/Persistent Disk.svg") },
      { name: "Filestore", url: icon("gcp/Products and services/Storage/Cloud Filestore.svg") },
      // Databases
      { name: "Cloud SQL", url: icon("gcp/Products and services/Databases/Cloud SQL.svg") },
      { name: "Cloud Spanner", url: icon("gcp/Products and services/Databases/Cloud Spanner.svg") },
      { name: "Cloud Bigtable", url: icon("gcp/Products and services/Databases/Cloud Bigtable.svg") },
      { name: "Cloud Firestore", url: icon("gcp/Products and services/Databases/Cloud Firestore.svg") },
      { name: "Cloud Memorystore", url: icon("gcp/Products and services/Databases/Cloud Memorystore.svg") },
      // Data Analytics
      { name: "BigQuery", url: icon("gcp/Products and services/Data Analytics/BigQuery.svg") },
      { name: "Cloud Dataflow", url: icon("gcp/Products and services/Data Analytics/Cloud Dataflow.svg") },
      { name: "Cloud Dataproc", url: icon("gcp/Products and services/Data Analytics/Cloud Dataproc.svg") },
      { name: "Cloud Pub/Sub", url: icon("gcp/Products and services/Data Analytics/Cloud PubSub.svg") },
      { name: "Cloud Composer", url: icon("gcp/Products and services/Data Analytics/Cloud Composer.svg") },
      // Networking
      { name: "Cloud Load Balancing", url: icon("gcp/Products and services/Networking/Cloud Load Balancing.svg") },
      { name: "Cloud DNS", url: icon("gcp/Products and services/Networking/Cloud DNS.svg") },
      { name: "Cloud CDN", url: icon("gcp/Products and services/Networking/Cloud CDN.svg") },
      { name: "Virtual Private Cloud", url: icon("gcp/Products and services/Networking/Virtual Private Cloud.svg") },
      // Developer Tools
      { name: "Cloud Build", url: icon("gcp/Products and services/Developer Tools/Cloud Build.svg") },
      { name: "Cloud Source Repositories", url: icon("gcp/Products and services/Developer Tools/Cloud Source Repositories.svg") },
      { name: "Cloud Scheduler", url: icon("gcp/Products and services/Developer Tools/Cloud Scheduler.svg") },
      { name: "Cloud Tasks", url: icon("gcp/Products and services/Developer Tools/Cloud Tasks.svg") },
      // AI and Machine Learning
      { name: "AI Platform", url: icon("gcp/Products and services/AI and Machine Learning/AI Platform.svg") },
      { name: "Cloud Vision API", url: icon("gcp/Products and services/AI and Machine Learning/Cloud Vision API.svg") },
      { name: "Cloud Natural Language API", url: icon("gcp/Products and services/AI and Machine Learning/Cloud Natural Language API.svg") },
    ],
  },
  azure: {
    description: "Microsoft Azure cloud icons",
    icons: [
      // Compute
      { name: "Virtual Machine", url: icon("azure/Compute Service Color/VM/VM.svg") },
      { name: "VM Linux", url: icon("azure/Compute Service Color/VM/VM-Linux.svg") },
      { name: "VM Windows", url: icon("azure/Compute Service Color/VM/VM-windows.svg") },
      { name: "Function Apps", url: icon("azure/Compute Service Color/Function Apps.svg") },
      { name: "Cloud Services", url: icon("azure/Compute Service Color/Cloud Services.svg") },
      { name: "Service Fabric Clusters", url: icon("azure/Compute Service Color/Service Fabric Clusters.svg") },
      { name: "Batch Accounts", url: icon("azure/Compute Service Color/Batch Accounts.svg") },
      // Containers
      { name: "Kubernetes Services", url: icon("azure/Container Service Color/Kubernetes Services.svg") },
      { name: "Container Instances", url: icon("azure/Container Service Color/Container Instances.svg") },
      { name: "Container Registries", url: icon("azure/Container Service Color/Container Registries.svg") },
      // Databases
      { name: "SQL Databases", url: icon("azure/Databases Service Color/SQL Databases.svg") },
      { name: "Cosmos DB", url: icon("azure/Databases Service Color/Azure Cosmos DB.svg") },
      { name: "Cache for Redis", url: icon("azure/Databases Service Color/Azure Cache for Redis.svg") },
      { name: "Blob Storage", url: icon("azure/Databases Service Color/Blob Storage.svg") },
      { name: "PostgreSQL Servers", url: icon("azure/Databases Service Color/Azure Database for PostgreSQL servers.svg") },
      { name: "MySQL Servers", url: icon("azure/Databases Service Color/Azure Database for MySQL servers.svg") },
      { name: "SQL Data Warehouse", url: icon("azure/Databases Service Color/Azure SQL DataWarehouse.svg") },
      // Networking
      { name: "Virtual Networks", url: icon("azure/Networking Service Color/Virtual Networks.svg") },
      { name: "Load Balancers", url: icon("azure/Networking Service Color/Load Balancers.svg") },
      { name: "Application Gateway", url: icon("azure/Networking Service Color/Application Gateway.svg") },
      { name: "CDN Profiles", url: icon("azure/Networking Service Color/CDN Profiles.svg") },
      { name: "Azure Firewall", url: icon("azure/Networking Service Color/Azure Firewall.svg") },
      { name: "DNS Zones", url: icon("azure/Networking Service Color/DNS Zones.svg") },
      { name: "ExpressRoute Circuits", url: icon("azure/Networking Service Color/ExpressRoute Circuits.svg") },
      { name: "Traffic Manager", url: icon("azure/Networking Service Color/Traffic Manager Profiles.svg") },
      { name: "Front Doors", url: icon("azure/Networking Service Color/Front Doors.svg") },
      // Web
      { name: "App Services", url: icon("azure/Web Service Color/App Services.svg") },
      { name: "App Service Plans", url: icon("azure/Web Service Color/App Service Plans.svg") },
      { name: "Azure Search", url: icon("azure/Web Service Color/Azure Search.svg") },
      { name: "SignalR", url: icon("azure/Web Service Color/SignalR.svg") },
      { name: "Notification Hubs", url: icon("azure/Web Service Color/Notification Hub Namespaces.svg") },
      // Identity
      { name: "Active Directory", url: icon("azure/Identity Service Color/Active Directory.svg") },
      { name: "Azure AD B2C", url: icon("azure/Identity Service Color/Azure AD B2C.svg") },
      { name: "Managed Identities", url: icon("azure/Identity Service Color/Managed Identities.svg") },
      // DevOps
      { name: "Azure DevOps", url: icon("azure/DevOps Service Color/Azure DevOps.svg") },
      { name: "Azure Pipelines", url: icon("azure/DevOps Service Color/Azure Pipelines.svg") },
      { name: "Azure Repos", url: icon("azure/DevOps Service Color/Azure Repos.svg") },
      { name: "Azure Boards", url: icon("azure/DevOps Service Color/Azure Boards.svg") },
      { name: "Application Insights", url: icon("azure/DevOps Service Color/Application Insights.svg") },
      // Analytics
      { name: "Event Hubs", url: icon("azure/Analytics Service Color/Event Hubs.svg") },
      { name: "Stream Analytics", url: icon("azure/Analytics Service Color/Stream Analytics Jobs.svg") },
      { name: "Data Factories", url: icon("azure/Analytics Service Color/Data Factories.svg") },
      { name: "Azure Databricks", url: icon("azure/Analytics Service Color/Azure Databricks.svg") },
      { name: "HDInsight Clusters", url: icon("azure/Analytics Service Color/HDInsightClusters.svg") },
    ],
  },
  dev: {
    description: "Developer tools, programming languages, and frameworks",
    icons: [
      // Languages
      { name: "TypeScript", url: icon("dev/typescript.svg") },
      { name: "JavaScript", url: icon("dev/javascript.svg") },
      { name: "Python", url: icon("dev/python.svg") },
      { name: "Go", url: icon("dev/go.svg") },
      { name: "Rust", url: icon("dev/rust.svg") },
      { name: "Java", url: icon("dev/java.svg") },
      { name: "C#", url: icon("dev/csharp.svg") },
      { name: "C++", url: icon("dev/cplusplus.svg") },
      { name: "C", url: icon("dev/c.svg") },
      { name: "Ruby", url: icon("dev/ruby.svg") },
      { name: "PHP", url: icon("dev/php.svg") },
      { name: "Swift", url: icon("dev/swift.svg") },
      { name: "Scala", url: icon("dev/scala.svg") },
      { name: "Haskell", url: icon("dev/haskell.svg") },
      { name: "Erlang", url: icon("dev/erlang.svg") },
      { name: "Clojure", url: icon("dev/clojure.svg") },
      // Frameworks & Libraries
      { name: "React", url: icon("dev/react.svg") },
      { name: "Vue.js", url: icon("dev/vuejs.svg") },
      { name: "Angular", url: icon("dev/angularjs.svg") },
      { name: "Node.js", url: icon("dev/nodejs.svg") },
      { name: "Django", url: icon("dev/django.svg") },
      { name: "Rails", url: icon("dev/rails.svg") },
      { name: "Laravel", url: icon("dev/laravel.svg") },
      { name: ".NET", url: icon("dev/dotnet.svg") },
      { name: "Electron", url: icon("dev/electron.svg") },
      { name: "Redux", url: icon("dev/redux.svg") },
      // Databases & Data
      { name: "PostgreSQL", url: icon("dev/postgresql.svg") },
      { name: "MySQL", url: icon("dev/mysql.svg") },
      { name: "MongoDB", url: icon("dev/mongodb.svg") },
      { name: "Redis", url: icon("dev/redis.svg") },
      // DevOps & Tools
      { name: "Docker", url: icon("dev/docker.svg") },
      { name: "Git", url: icon("dev/git.svg") },
      { name: "GitHub", url: icon("dev/github.svg") },
      { name: "GitLab", url: icon("dev/gitlab.svg") },
      { name: "Bitbucket", url: icon("dev/bitbucket.svg") },
      { name: "npm", url: icon("dev/npm.svg") },
      { name: "Yarn", url: icon("dev/yarn.svg") },
      { name: "Webpack", url: icon("dev/webpack.svg") },
      { name: "Nginx", url: icon("dev/nginx.svg") },
      { name: "Apache", url: icon("dev/apache.svg") },
      { name: "Tomcat", url: icon("dev/tomcat.svg") },
      { name: "Jenkins (Travis)", url: icon("dev/travis.svg") },
      { name: "Heroku", url: icon("dev/heroku.svg") },
      { name: "Vagrant", url: icon("dev/vagrant.svg") },
      // Platforms
      { name: "Linux", url: icon("dev/linux.svg") },
      { name: "Ubuntu", url: icon("dev/ubuntu.svg") },
      { name: "Debian", url: icon("dev/debian.svg") },
      { name: "Red Hat", url: icon("dev/redhat.svg") },
      { name: "Android", url: icon("dev/android.svg") },
      { name: "Apple", url: icon("dev/apple.svg") },
      { name: "Windows", url: icon("dev/windows.svg") },
      { name: "AWS", url: icon("dev/amazonwebservices.svg") },
      // Editors & IDEs
      { name: "Visual Studio", url: icon("dev/visualstudio.svg") },
      { name: "IntelliJ", url: icon("dev/intellij.svg") },
      { name: "Vim", url: icon("dev/vim.svg") },
      { name: "Atom", url: icon("dev/atom.svg") },
      // Browsers
      { name: "Chrome", url: icon("dev/chrome.svg") },
      { name: "Firefox", url: icon("dev/firefox.svg") },
      { name: "Safari", url: icon("dev/safari.svg") },
    ],
  },
  essentials: {
    description: "Essential general-purpose icons (servers, users, networks, etc.)",
    icons: [
      { name: "Server", url: icon("essentials/112-server.svg") },
      { name: "Database", url: icon("essentials/117-database.svg") },
      { name: "Database (alt)", url: icon("essentials/119-database.svg") },
      { name: "Internet", url: icon("essentials/140-internet.svg") },
      { name: "Worldwide", url: icon("essentials/214-worldwide.svg") },
      { name: "Network", url: icon("essentials/092-network.svg") },
      { name: "WiFi", url: icon("essentials/104-wifi.svg") },
      { name: "Wireless", url: icon("essentials/103-wireless internet.svg") },
      { name: "Users", url: icon("essentials/359-users.svg") },
      { name: "User", url: icon("essentials/365-user.svg") },
      { name: "Programmer", url: icon("essentials/005-programmer.svg") },
      { name: "Key", url: icon("essentials/216-key.svg") },
      { name: "Unlocked", url: icon("essentials/001-unlocked.svg") },
      { name: "Settings", url: icon("essentials/204-settings.svg") },
      { name: "Controls", url: icon("essentials/178-controls.svg") },
      { name: "Search", url: icon("essentials/313-search.svg") },
      { name: "File", url: icon("essentials/257-file.svg") },
      { name: "Folder", url: icon("essentials/245-folder.svg") },
      { name: "Notepad", url: icon("essentials/263-notepad.svg") },
      { name: "Archive", url: icon("essentials/304-archive.svg") },
      { name: "Calendar", url: icon("essentials/273-calendar.svg") },
      { name: "Bookmark", url: icon("essentials/175-bookmark.svg") },
      { name: "Link", url: icon("essentials/287-link.svg") },
      { name: "Attachment", url: icon("essentials/195-attachment.svg") },
      { name: "Analytics", url: icon("essentials/001-analytics.svg") },
      { name: "Graph Bar", url: icon("essentials/092-graph bar.svg") },
      { name: "Line Chart", url: icon("essentials/050-line chart.svg") },
      { name: "Data Analysis", url: icon("essentials/089-data analysis.svg") },
      { name: "Success", url: icon("essentials/059-success.svg") },
      { name: "Error", url: icon("essentials/058-error.svg") },
      { name: "Warning", url: icon("essentials/060-warning.svg") },
      { name: "Information", url: icon("essentials/060-information.svg") },
      { name: "404 Error", url: icon("essentials/062-404-error.svg") },
      { name: "Upload", url: icon("essentials/096-upload.svg") },
      { name: "Download", url: icon("essentials/095-download.svg") },
      { name: "Share", url: icon("essentials/091-share.svg") },
      { name: "Launch", url: icon("essentials/048-launch.svg") },
      { name: "Megaphone", url: icon("essentials/108-megaphone.svg") },
      { name: "Idea", url: icon("essentials/111-idea.svg") },
      { name: "Target", url: icon("essentials/142-target.svg") },
      { name: "Home", url: icon("essentials/335-home.svg") },
      { name: "Star", url: icon("essentials/131-star.svg") },
      { name: "Flag", url: icon("essentials/170-flag.svg") },
      { name: "Hourglass", url: icon("essentials/145-hourglass.svg") },
      { name: "Layers", url: icon("essentials/220-layers.svg") },
      { name: "Funnel", url: icon("essentials/215-funnel.svg") },
      { name: "Edit", url: icon("essentials/218-edit.svg") },
      { name: "Power", url: icon("essentials/066-power.svg") },
    ],
  },
  infra: {
    description: "Infrastructure and networking icons",
    icons: [
      { name: "Firewall", url: icon("infra/003-firewall.svg") },
      { name: "Backup", url: icon("infra/002-backup.svg") },
      { name: "Access Denied", url: icon("infra/001-access-denied.svg") },
      { name: "Satellite", url: icon("infra/007-satellite.svg") },
      { name: "Data Sharing", url: icon("infra/010-data-sharing.svg") },
      { name: "Data Storage", url: icon("infra/011-data-storage.svg") },
      { name: "Data", url: icon("infra/012-data.svg") },
      { name: "Transfer", url: icon("infra/013-transfer.svg") },
      { name: "Network", url: icon("infra/014-network.svg") },
      { name: "Network (alt)", url: icon("infra/019-network.svg") },
      { name: "Hardware", url: icon("infra/021-hardware.svg") },
      { name: "Hosting", url: icon("infra/022-hosting.svg") },
      { name: "Plugin", url: icon("infra/025-plug-in.svg") },
      { name: "Protection", url: icon("infra/033-protection.svg") },
      { name: "Global Network", url: icon("infra/040-global network.svg") },
      { name: "Tower", url: icon("infra/041-tower.svg") },
      { name: "Delete", url: icon("infra/011-delete.svg") },
    ],
  },
  social: {
    description: "Social media and communication platform logos",
    icons: [
      { name: "YouTube", url: icon("social/002-youtube.svg") },
      { name: "WhatsApp", url: icon("social/007-whatsapp.svg") },
      { name: "Twitter", url: icon("social/014-twitter.svg") },
      { name: "Twitch", url: icon("social/015-twitch.svg") },
      { name: "Spotify", url: icon("social/019-spotify.svg") },
      { name: "Snapchat", url: icon("social/021-snapchat.svg") },
      { name: "Skype", url: icon("social/022-skype.svg") },
      { name: "Reddit", url: icon("social/024-reddit.svg") },
      { name: "Pinterest", url: icon("social/026-pinterest.svg") },
      { name: "LinkedIn", url: icon("social/031-linkedin.svg") },
      { name: "Instagram", url: icon("social/034-instagram.svg") },
      { name: "GitHub", url: icon("social/039-github.svg") },
      { name: "Facebook", url: icon("social/045-facebook.svg") },
      { name: "Messenger", url: icon("social/044-messenger.svg") },
      { name: "Dropbox", url: icon("social/047-dropbox.svg") },
      { name: "Dribbble", url: icon("social/048-dribbble.svg") },
      { name: "Behance", url: icon("social/054-behance.svg") },
      { name: "Slack", url: icon("dev/slack.svg") },
      { name: "Google Drive", url: icon("social/038-google-drive.svg") },
      { name: "Vimeo", url: icon("social/011-vimeo.svg") },
      { name: "RSS", url: icon("social/023-rss.svg") },
      { name: "SoundCloud", url: icon("social/020-soundcloud.svg") },
    ],
  },
  tech: {
    description: "Hardware and technology icons",
    icons: [
      { name: "Server", url: icon("tech/022-server.svg") },
      { name: "Servers", url: icon("tech/servers.svg") },
      { name: "Desktop", url: icon("tech/desktop.svg") },
      { name: "Laptop", url: icon("tech/laptop.svg") },
      { name: "Monitor", url: icon("tech/065-monitor-4.svg") },
      { name: "Tablet", url: icon("tech/079-tablet-1.svg") },
      { name: "Smartphone", url: icon("tech/052-smartphone-3.svg") },
      { name: "CPU", url: icon("tech/014-cpu.svg") },
      { name: "CPU (alt)", url: icon("tech/012-cpu-2.svg") },
      { name: "Hard Drive", url: icon("tech/069-hard-drive.svg") },
      { name: "Diskette", url: icon("tech/diskette.svg") },
      { name: "Cooler", url: icon("tech/009-cooler.svg") },
      { name: "Router", url: icon("tech/router.svg") },
      { name: "Antenna", url: icon("tech/antenna.svg") },
      { name: "Browser", url: icon("tech/browser-2.svg") },
      { name: "Battery", url: icon("tech/battery-1.svg") },
      { name: "Power", url: icon("tech/power.svg") },
      { name: "Bar Chart", url: icon("tech/bar-chart.svg") },
      { name: "Bar Chart (alt)", url: icon("tech/bar-chart-1.svg") },
      { name: "Gamepad", url: icon("tech/048-gamepad.svg") },
      { name: "Joystick", url: icon("tech/041-joystick.svg") },
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
