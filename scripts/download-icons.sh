#!/usr/bin/env bash
#
# Download all curated icons from icons.terrastruct.com into a local directory.
# Run at Docker build time so D2 CLI never needs to fetch icons over the network.
#
# Usage: ./scripts/download-icons.sh [OUTPUT_DIR]
#   OUTPUT_DIR defaults to ./icons

set -euo pipefail

OUTPUT_DIR="${1:-./icons}"
BASE_URL="https://icons.terrastruct.com"
FAILED=0
TOTAL=0
DOWNLOADED=0

# All icon paths from our curated catalog (276 icons).
# Each line is the path relative to icons.terrastruct.com.
# Spaces and special chars are preserved literally (curl handles encoding).
ICON_PATHS=(
  # === AWS ===
  # Compute
  "aws/Compute/Amazon-EC2.svg"
  "aws/Compute/AWS-Lambda.svg"
  "aws/Compute/Amazon-Elastic-Container-Service.svg"
  "aws/Compute/Amazon-Elastic-Kubernetes-Service.svg"
  "aws/Compute/AWS-Fargate.svg"
  "aws/Compute/AWS-Elastic-Beanstalk.svg"
  # Storage
  "aws/Storage/Amazon-Simple-Storage-Service-S3.svg"
  # Database
  "aws/Database/Amazon-RDS.svg"
  "aws/Database/Amazon-DynamoDB.svg"
  "aws/Database/Amazon-Aurora.svg"
  "aws/Database/Amazon-ElastiCache.svg"
  "aws/Database/Amazon-Redshift.svg"
  # Networking & Content Delivery
  "aws/Networking & Content Delivery/Amazon-API-Gateway.svg"
  "aws/Networking & Content Delivery/Amazon-CloudFront.svg"
  "aws/Networking & Content Delivery/Amazon-Route-53.svg"
  "aws/Networking & Content Delivery/Amazon-VPC.svg"
  "aws/Networking & Content Delivery/Elastic-Load-Balancing.svg"
  # Application Integration
  "aws/Application Integration/Amazon-Simple-Queue-Service-SQS.svg"
  "aws/Application Integration/Amazon-Simple-Notification-Service-SNS.svg"
  "aws/Application Integration/AWS-Step-Functions.svg"
  "aws/Application Integration/Amazon-EventBridge.svg"
  "aws/Application Integration/Amazon-AppSync.svg"
  # Analytics
  "aws/Analytics/Amazon-Kinesis.svg"
  "aws/Analytics/Amazon-Redshift.svg"
  "aws/Analytics/Amazon-Athena.svg"
  "aws/Analytics/Amazon-Elasticsearch-Service.svg"
  # Security, Identity, & Compliance
  "aws/Security, Identity, & Compliance/AWS-Identify-and-Access-Management_IAM.svg"
  "aws/Security, Identity, & Compliance/Amazon-Cognito.svg"
  "aws/Security, Identity, & Compliance/AWS-Secrets-Manager.svg"
  "aws/Security, Identity, & Compliance/AWS-WAF.svg"
  "aws/Security, Identity, & Compliance/AWS-Shield.svg"
  "aws/Security, Identity, & Compliance/AWS-Key-Management-Service.svg"
  # Management & Governance
  "aws/Management & Governance/Amazon-CloudWatch.svg"
  "aws/Management & Governance/AWS-CloudFormation.svg"
  "aws/Management & Governance/AWS-CloudTrail.svg"
  # Developer Tools
  "aws/Developer Tools/AWS-CodePipeline.svg"
  "aws/Developer Tools/AWS-CodeBuild.svg"
  "aws/Developer Tools/AWS-CodeDeploy.svg"
  "aws/Developer Tools/AWS-X-Ray.svg"
  # Internet of Things
  "aws/Internet of Things/AWS-IoT-Core.svg"

  # === GCP ===
  # Compute
  "gcp/Products and services/Compute/Compute Engine.svg"
  "gcp/Products and services/Compute/Cloud Functions.svg"
  "gcp/Products and services/Compute/Cloud Run.svg"
  "gcp/Products and services/Compute/App Engine.svg"
  "gcp/Products and services/Compute/Kubetnetes Engine.svg"
  # Storage
  "gcp/Products and services/Storage/Cloud Storage.svg"
  "gcp/Products and services/Storage/Persistent Disk.svg"
  "gcp/Products and services/Storage/Cloud Filestore.svg"
  # Databases
  "gcp/Products and services/Databases/Cloud SQL.svg"
  "gcp/Products and services/Databases/Cloud Spanner.svg"
  "gcp/Products and services/Databases/Cloud Bigtable.svg"
  "gcp/Products and services/Databases/Cloud Firestore.svg"
  "gcp/Products and services/Databases/Cloud Memorystore.svg"
  # Data Analytics
  "gcp/Products and services/Data Analytics/BigQuery.svg"
  "gcp/Products and services/Data Analytics/Cloud Dataflow.svg"
  "gcp/Products and services/Data Analytics/Cloud Dataproc.svg"
  "gcp/Products and services/Data Analytics/Cloud PubSub.svg"
  "gcp/Products and services/Data Analytics/Cloud Composer.svg"
  # Networking
  "gcp/Products and services/Networking/Cloud Load Balancing.svg"
  "gcp/Products and services/Networking/Cloud DNS.svg"
  "gcp/Products and services/Networking/Cloud CDN.svg"
  "gcp/Products and services/Networking/Virtual Private Cloud.svg"
  # Developer Tools
  "gcp/Products and services/Developer Tools/Cloud Build.svg"
  "gcp/Products and services/Developer Tools/Cloud Source Repositories.svg"
  "gcp/Products and services/Developer Tools/Cloud Scheduler.svg"
  "gcp/Products and services/Developer Tools/Cloud Tasks.svg"
  # AI and Machine Learning
  "gcp/Products and services/AI and Machine Learning/AI Platform.svg"
  "gcp/Products and services/AI and Machine Learning/Cloud Vision API.svg"
  "gcp/Products and services/AI and Machine Learning/Cloud Natural Language API.svg"

  # === Azure ===
  # Compute
  "azure/Compute Service Color/VM/VM.svg"
  "azure/Compute Service Color/VM/VM-Linux.svg"
  "azure/Compute Service Color/VM/VM-windows.svg"
  "azure/Compute Service Color/Function Apps.svg"
  "azure/Compute Service Color/Cloud Services.svg"
  "azure/Compute Service Color/Service Fabric Clusters.svg"
  "azure/Compute Service Color/Batch Accounts.svg"
  # Containers
  "azure/Container Service Color/Kubernetes Services.svg"
  "azure/Container Service Color/Container Instances.svg"
  "azure/Container Service Color/Container Registries.svg"
  # Databases
  "azure/Databases Service Color/SQL Databases.svg"
  "azure/Databases Service Color/Azure Cosmos DB.svg"
  "azure/Databases Service Color/Azure Cache for Redis.svg"
  "azure/Databases Service Color/Blob Storage.svg"
  "azure/Databases Service Color/Azure Database for PostgreSQL servers.svg"
  "azure/Databases Service Color/Azure Database for MySQL servers.svg"
  "azure/Databases Service Color/Azure SQL DataWarehouse.svg"
  # Networking
  "azure/Networking Service Color/Virtual Networks.svg"
  "azure/Networking Service Color/Load Balancers.svg"
  "azure/Networking Service Color/Application Gateway.svg"
  "azure/Networking Service Color/CDN Profiles.svg"
  "azure/Networking Service Color/Azure Firewall.svg"
  "azure/Networking Service Color/DNS Zones.svg"
  "azure/Networking Service Color/ExpressRoute Circuits.svg"
  "azure/Networking Service Color/Traffic Manager Profiles.svg"
  "azure/Networking Service Color/Front Doors.svg"
  # Web
  "azure/Web Service Color/App Services.svg"
  "azure/Web Service Color/App Service Plans.svg"
  "azure/Web Service Color/Azure Search.svg"
  "azure/Web Service Color/SignalR.svg"
  "azure/Web Service Color/Notification Hub Namespaces.svg"
  # Identity
  "azure/Identity Service Color/Active Directory.svg"
  "azure/Identity Service Color/Azure AD B2C.svg"
  "azure/Identity Service Color/Managed Identities.svg"
  # DevOps
  "azure/DevOps Service Color/Azure DevOps.svg"
  "azure/DevOps Service Color/Azure Pipelines.svg"
  "azure/DevOps Service Color/Azure Repos.svg"
  "azure/DevOps Service Color/Azure Boards.svg"
  "azure/DevOps Service Color/Application Insights.svg"
  # Analytics
  "azure/Analytics Service Color/Event Hubs.svg"
  "azure/Analytics Service Color/Stream Analytics Jobs.svg"
  "azure/Analytics Service Color/Data Factories.svg"
  "azure/Analytics Service Color/Azure Databricks.svg"
  "azure/Analytics Service Color/HDInsightClusters.svg"

  # === Dev ===
  "dev/typescript.svg"
  "dev/javascript.svg"
  "dev/python.svg"
  "dev/go.svg"
  "dev/rust.svg"
  "dev/java.svg"
  "dev/csharp.svg"
  "dev/cplusplus.svg"
  "dev/c.svg"
  "dev/ruby.svg"
  "dev/php.svg"
  "dev/swift.svg"
  "dev/scala.svg"
  "dev/haskell.svg"
  "dev/erlang.svg"
  "dev/clojure.svg"
  "dev/react.svg"
  "dev/vuejs.svg"
  "dev/angularjs.svg"
  "dev/nodejs.svg"
  "dev/django.svg"
  "dev/rails.svg"
  "dev/laravel.svg"
  "dev/dotnet.svg"
  "dev/electron.svg"
  "dev/redux.svg"
  "dev/postgresql.svg"
  "dev/mysql.svg"
  "dev/mongodb.svg"
  "dev/redis.svg"
  "dev/docker.svg"
  "dev/git.svg"
  "dev/github.svg"
  "dev/gitlab.svg"
  "dev/bitbucket.svg"
  "dev/npm.svg"
  "dev/yarn.svg"
  "dev/webpack.svg"
  "dev/nginx.svg"
  "dev/apache.svg"
  "dev/tomcat.svg"
  "dev/travis.svg"
  "dev/heroku.svg"
  "dev/vagrant.svg"
  "dev/linux.svg"
  "dev/ubuntu.svg"
  "dev/debian.svg"
  "dev/redhat.svg"
  "dev/android.svg"
  "dev/apple.svg"
  "dev/windows.svg"
  "dev/amazonwebservices.svg"
  "dev/visualstudio.svg"
  "dev/intellij.svg"
  "dev/vim.svg"
  "dev/atom.svg"
  "dev/chrome.svg"
  "dev/firefox.svg"
  "dev/safari.svg"
  "dev/slack.svg"

  # === Essentials ===
  "essentials/112-server.svg"
  "essentials/117-database.svg"
  "essentials/119-database.svg"
  "essentials/140-internet.svg"
  "essentials/214-worldwide.svg"
  "essentials/092-network.svg"
  "essentials/104-wifi.svg"
  "essentials/103-wireless internet.svg"
  "essentials/359-users.svg"
  "essentials/365-user.svg"
  "essentials/005-programmer.svg"
  "essentials/216-key.svg"
  "essentials/001-unlocked.svg"
  "essentials/204-settings.svg"
  "essentials/178-controls.svg"
  "essentials/313-search.svg"
  "essentials/257-file.svg"
  "essentials/245-folder.svg"
  "essentials/263-notepad.svg"
  "essentials/304-archive.svg"
  "essentials/273-calendar.svg"
  "essentials/175-bookmark.svg"
  "essentials/287-link.svg"
  "essentials/195-attachment.svg"
  "essentials/001-analytics.svg"
  "essentials/092-graph bar.svg"
  "essentials/050-line chart.svg"
  "essentials/089-data analysis.svg"
  "essentials/059-success.svg"
  "essentials/058-error.svg"
  "essentials/060-warning.svg"
  "essentials/060-information.svg"
  "essentials/062-404-error.svg"
  "essentials/096-upload.svg"
  "essentials/095-download.svg"
  "essentials/091-share.svg"
  "essentials/048-launch.svg"
  "essentials/108-megaphone.svg"
  "essentials/111-idea.svg"
  "essentials/142-target.svg"
  "essentials/335-home.svg"
  "essentials/131-star.svg"
  "essentials/170-flag.svg"
  "essentials/145-hourglass.svg"
  "essentials/220-layers.svg"
  "essentials/215-funnel.svg"
  "essentials/218-edit.svg"
  "essentials/066-power.svg"

  # === Infra ===
  "infra/003-firewall.svg"
  "infra/002-backup.svg"
  "infra/001-access-denied.svg"
  "infra/007-satellite.svg"
  "infra/010-data-sharing.svg"
  "infra/011-data-storage.svg"
  "infra/012-data.svg"
  "infra/013-transfer.svg"
  "infra/014-network.svg"
  "infra/019-network.svg"
  "infra/021-hardware.svg"
  "infra/022-hosting.svg"
  "infra/025-plug-in.svg"
  "infra/033-protection.svg"
  "infra/040-global network.svg"
  "infra/041-tower.svg"
  "infra/011-delete.svg"

  # === Social ===
  "social/002-youtube.svg"
  "social/007-whatsapp.svg"
  "social/014-twitter.svg"
  "social/015-twitch.svg"
  "social/019-spotify.svg"
  "social/021-snapchat.svg"
  "social/022-skype.svg"
  "social/024-reddit.svg"
  "social/026-pinterest.svg"
  "social/031-linkedin.svg"
  "social/034-instagram.svg"
  "social/039-github.svg"
  "social/045-facebook.svg"
  "social/044-messenger.svg"
  "social/047-dropbox.svg"
  "social/048-dribbble.svg"
  "social/054-behance.svg"
  "social/038-google-drive.svg"
  "social/011-vimeo.svg"
  "social/023-rss.svg"
  "social/020-soundcloud.svg"

  # === Tech ===
  "tech/022-server.svg"
  "tech/servers.svg"
  "tech/desktop.svg"
  "tech/laptop.svg"
  "tech/065-monitor-4.svg"
  "tech/079-tablet-1.svg"
  "tech/052-smartphone-3.svg"
  "tech/014-cpu.svg"
  "tech/012-cpu-2.svg"
  "tech/069-hard-drive.svg"
  "tech/diskette.svg"
  "tech/009-cooler.svg"
  "tech/router.svg"
  "tech/antenna.svg"
  "tech/browser-2.svg"
  "tech/battery-1.svg"
  "tech/power.svg"
  "tech/bar-chart.svg"
  "tech/bar-chart-1.svg"
  "tech/048-gamepad.svg"
  "tech/041-joystick.svg"
)

echo "Downloading ${#ICON_PATHS[@]} icons to ${OUTPUT_DIR}..."

for path in "${ICON_PATHS[@]}"; do
  TOTAL=$((TOTAL + 1))

  # Create a filesystem-safe local path (replace spaces and special chars)
  safe_path="$(echo "$path" | sed 's/ /_/g; s/&/_/g; s/,/_/g')"
  dir="${OUTPUT_DIR}/$(dirname "$safe_path")"
  mkdir -p "$dir"

  dest="${OUTPUT_DIR}/${safe_path}"
  # URL-encode path segments (spaces -> %20, & -> %26, etc.) but keep /
  encoded_url="${BASE_URL}/$(echo "$path" | sed 's/ /%20/g; s/&/%26/g; s/,/%2C/g')"

  if curl -fsSL --retry 2 --max-time 10 -o "$dest" "$encoded_url" 2>/dev/null; then
    DOWNLOADED=$((DOWNLOADED + 1))
  else
    echo "WARN: Failed to download: $path"
    FAILED=$((FAILED + 1))
    # Remove empty file if curl created one
    rm -f "$dest"
  fi
done

echo ""
echo "=== Icon Download Summary ==="
echo "Total:      ${TOTAL}"
echo "Downloaded: ${DOWNLOADED}"
echo "Failed:     ${FAILED}"
echo "Output dir: ${OUTPUT_DIR}"

if [ "$FAILED" -gt 10 ]; then
  echo "ERROR: Too many failures (${FAILED}). Aborting build."
  exit 1
fi

echo "Done."
