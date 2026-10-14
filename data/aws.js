ATLAS.addTrack({
  id: "aws", title: "AWS Cloud", icon: "☁", color: "#f97316", accent: "#fdba74",
  tagline: "IAM, VPC, EC2, ECS, Lambda, S3, RDS, messaging & observability",
  blurb: "Core AWS services a Java full-stack lead deploys to: identity, networking, compute (EC2/ECS/Fargate/EKS/Lambda), storage, databases, messaging (SQS/SNS/MSK), observability, security and architecture scenarios."
}, [
  // ───────── Fundamentals ─────────
  { l:"B", t:"Fundamentals", q:"What are Regions, Availability Zones and Edge Locations?",
    a:`- **Region** – a geographic area (‹ap-south-1› Mumbai) with multiple isolated data-centre clusters; choose for latency, data residency, service availability and cost.
- **Availability Zone (AZ)** – one or more physically separate data centres within a region with independent power/networking, connected by low-latency links. Deploy across ≥2 AZs for high availability.
- **Edge locations** – CDN/DNS points of presence used by CloudFront, Route 53 and Global Accelerator.
- **Local Zones / Wavelength** – compute closer to users.`,
    k:"Regions for geography, AZs for fault isolation, edges for latency." },
  { l:"B", t:"Fundamentals", q:"Explain the AWS shared responsibility model.",
    a:`- **AWS** is responsible for security **of** the cloud: hardware, facilities, hypervisor, managed-service infrastructure.
- **You** are responsible for security **in** the cloud: IAM, data encryption, network configuration (security groups, NACLs), OS patching on EC2, application security, and configuration of managed services.

The more managed the service (Lambda, Fargate, S3), the less you manage — but data, identity and configuration are always yours.`,
    k:"AWS secures the cloud; you secure what you put in it." },
  { l:"B", t:"Fundamentals", q:"What are the main AWS compute options and when do you use each?",
    a:`- **EC2** – virtual machines; full control; legacy apps, custom OS needs, steady workloads.
- **ECS (EC2 or Fargate launch type)** – AWS-native container orchestration; simple for Docker microservices.
- **EKS** – managed Kubernetes; portability, K8s ecosystem.
- **Fargate** – serverless containers; no node management.
- **Lambda** – event-driven functions; spiky/short tasks, glue code, no servers.
- **Elastic Beanstalk / App Runner** – PaaS-style app hosting.
- **Batch** – large batch jobs.`,
    k:"VMs, containers or functions — pick by control vs operational effort." },
  // ───────── IAM ─────────
  { l:"B", t:"IAM", q:"Explain IAM users, groups, roles and policies.",
    a:`- **User** – an identity for a person or (legacy) application with long-term credentials.
- **Group** – a collection of users sharing permissions.
- **Role** – an identity with temporary credentials assumed by trusted entities (EC2, ECS tasks, Lambda, other accounts, federated users via SSO).
- **Policy** – JSON document of permissions (Effect, Action, Resource, Condition), attached to identities or resources.

Best practice: use IAM Identity Center (SSO) for humans, roles for workloads, no long-lived access keys, MFA, least privilege.`,
    k:"Humans via SSO, workloads via roles, permissions via least-privilege policies." },
  { l:"I", t:"IAM", q:"How is an IAM request evaluated (explicit deny, allow, SCPs, boundaries)?",
    a:`1. By default everything is **implicitly denied**.
2. An **explicit Deny** anywhere (identity policy, resource policy, SCP, permissions boundary, session policy) always wins.
3. Otherwise the request needs an **Allow** that applies, and must also be permitted by any Organization **SCPs**, **permissions boundaries** and session policies (they set maximum permissions; they don't grant).
4. Resource-based policies (S3 bucket policies, KMS key policies) can grant cross-account access.`,
    k:"Explicit deny > allow > implicit deny; SCPs and boundaries cap permissions." },
  { l:"I", t:"IAM", q:"How does an ECS task or EC2 instance get AWS permissions securely?",
    a:`Assign an **IAM role**:
- EC2 → **instance profile**; credentials served by the instance metadata service (use IMDSv2).
- ECS → **task role** (app permissions, e.g. read an S3 bucket, publish to SQS) and a separate **task execution role** (pull images from ECR, write logs, fetch secrets).
- EKS → IRSA / EKS Pod Identity.
- Lambda → execution role.

The AWS SDK's default credential chain picks up the temporary credentials automatically; they rotate without code changes. Never put access keys in code, images or env vars.`,
    k:"Roles provide rotating temporary credentials — no static keys." },
  { l:"I", t:"IAM", q:"Write a least-privilege IAM policy for a service that reads one S3 prefix and sends to one SQS queue.",
    a:`~~~json
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::analytics-reports/exports/*" },
    { "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::analytics-reports",
      "Condition": { "StringLike": { "s3:prefix": ["exports/*"] } } },
    { "Effect": "Allow",
      "Action": ["sqs:SendMessage"],
      "Resource": "arn:aws:sqs:ap-south-1:123456789012:alarm-notifications" }
  ]
}
~~~

Specific actions, specific ARNs, conditions where possible; validate with IAM Access Analyzer.`,
    k:"Exact actions on exact resources, with conditions." },
  // ───────── Networking ─────────
  { l:"B", t:"VPC", q:"What is a VPC? Explain subnets, route tables, IGW and NAT Gateway.",
    a:`A **VPC** is your logically isolated private network in AWS (e.g. ‹10.0.0.0/16›).
- **Subnets** live in one AZ. **Public subnets** route ‹0.0.0.0/0› to an **Internet Gateway**; **private subnets** don't.
- **Route tables** decide where traffic goes.
- **NAT Gateway** (in a public subnet) lets private resources make outbound internet calls (patches, external APIs) without being reachable inbound.
- Typical 3-tier layout: ALB in public subnets; ECS tasks/EC2 in private app subnets; RDS in private data subnets — across 2–3 AZs.`,
    k:"Public subnets face the internet via IGW; private subnets egress via NAT." },
  { l:"I", t:"VPC", q:"Security groups vs network ACLs?",
    a:`- **Security groups** – instance/ENI-level virtual firewalls; **stateful** (return traffic automatically allowed); allow rules only; can reference other security groups (e.g. DB SG allows 5432 from the app SG).
- **NACLs** – subnet-level; **stateless** (must allow return ephemeral ports explicitly); allow and deny rules evaluated in order.

Use security groups as the primary control; NACLs for coarse subnet-wide denies.`,
    k:"SGs: stateful, per resource, allow-only. NACLs: stateless, per subnet, allow + deny." },
  { l:"I", t:"VPC", q:"How do private resources access AWS services without the internet (VPC endpoints)?",
    a:`- **Gateway endpoints** (free) for **S3** and **DynamoDB** — route table entries.
- **Interface endpoints (PrivateLink)** – ENIs in your subnets for services like ECR, Secrets Manager, SQS, CloudWatch Logs, STS.

Benefits: traffic stays on the AWS network, lower NAT Gateway data costs, and you can restrict access with endpoint policies. ECS tasks in private subnets without NAT need ECR (api + dkr), S3 and Logs endpoints to pull images and ship logs.`,
    k:"VPC endpoints keep AWS service traffic private and cut NAT costs." },
  { l:"A", t:"VPC", q:"VPC peering vs Transit Gateway vs PrivateLink?",
    a:`- **VPC peering** – one-to-one private connection; non-transitive; fine for a few VPCs; CIDRs must not overlap.
- **Transit Gateway** – hub-and-spoke router connecting many VPCs and on-prem (VPN/Direct Connect); transitive routing, central control.
- **PrivateLink** – expose a specific service (behind an NLB) to other VPCs/accounts without full network connectivity; overlapping CIDRs are OK.`,
    k:"Peering for few, Transit Gateway for many, PrivateLink for one service." },
  { l:"I", t:"Load Balancing", q:"ALB vs NLB vs CLB vs Gateway Load Balancer?",
    a:`- **ALB** (Layer 7) – HTTP/HTTPS/WebSocket/gRPC; path/host/header routing, target groups for ECS/EC2/Lambda/IP, auth (Cognito/OIDC), WAF integration. Default for web apps and microservices.
- **NLB** (Layer 4) – TCP/UDP/TLS; ultra-low latency, millions of requests/s, static IPs, preserves client IP; for non-HTTP protocols or PrivateLink.
- **GWLB** – inserts third-party virtual appliances (firewalls).
- **CLB** – legacy.

ALB health checks hit e.g. ‹/actuator/health/readiness›; configure deregistration delay for graceful draining. WebSockets work on ALB (stickiness/idle timeout settings).`,
    k:"ALB for HTTP microservices, NLB for raw TCP/static IPs." },
  { l:"I", t:"DNS & CDN", q:"What does Route 53 do? Explain routing policies.",
    a:`Route 53 is AWS's DNS service (domain registration, hosted zones, health checks).

Routing policies: **Simple**, **Weighted** (canary 90/10), **Latency-based** (nearest region), **Failover** (active-passive DR with health checks), **Geolocation/Geoproximity**, **Multivalue answer**, **IP-based**.

**Alias records** point to AWS resources (ALB, CloudFront, S3) at the zone apex for free.`,
    k:"DNS with health-aware routing: weighted, latency, failover, geo." },
  { l:"I", t:"DNS & CDN", q:"How do you host an Angular SPA on S3 + CloudFront?",
    a:`1. Build with ‹ng build›; upload ‹dist/› to a **private** S3 bucket.
2. CloudFront distribution with **Origin Access Control (OAC)** so only CloudFront can read the bucket.
3. Custom error responses: 403/404 → ‹/index.html› with 200 for SPA deep links (or a CloudFront Function).
4. Cache policy: long TTL + immutable for hashed JS/CSS; no-cache for ‹index.html›.
5. ACM certificate (us-east-1) + Route 53 alias; enable HTTP/2/3, Brotli, WAF.
6. Second origin/behaviour ‹/api/*› → ALB to avoid CORS.
7. CI: ‹aws s3 sync› then ‹aws cloudfront create-invalidation --paths /index.html›.`,
    k:"Private S3 + CloudFront OAC + SPA fallback + smart cache headers." },
  // ───────── Compute ─────────
  { l:"I", t:"EC2", q:"What are EC2 instance types and purchasing options?",
    a:`Families: **general purpose** (t, m), **compute optimised** (c), **memory optimised** (r, x), **storage optimised** (i, d), **accelerated** (p, g, inf). Graviton (‹m7g›, ‹c7g›) ARM instances give better price/performance for Java workloads.

Purchasing: **On-Demand** (flexible), **Savings Plans/Reserved** (1–3 year commitment, up to ~72% off), **Spot** (up to 90% off, can be interrupted — batch jobs, CI agents, stateless workers), **Dedicated Hosts** (licensing/compliance).`,
    k:"Right family + Graviton + Savings Plans for baseline + Spot for interruptible work." },
  { l:"I", t:"EC2", q:"How do Auto Scaling Groups work?",
    a:`An ASG maintains a desired number of EC2 instances across AZs using a **launch template**, replacing unhealthy ones automatically.

Scaling policies: **target tracking** (keep CPU at 50%, ALB requests per target), **step scaling**, **scheduled** scaling, **predictive** scaling. Integrates with ALB health checks; lifecycle hooks for graceful bootstrap/drain; instance refresh for rolling AMI updates; mixed instances with Spot.`,
    k:"ASG = self-healing, multi-AZ fleet that scales on metrics." },
  { l:"I", t:"EC2", q:"EBS vs EFS vs Instance Store vs S3?",
    a:`- **EBS** – block storage attached to one instance in one AZ (gp3 for most; io2 for high IOPS); snapshots to S3.
- **Instance store** – ephemeral local NVMe; lost on stop; caches/scratch.
- **EFS** – managed NFS shared across many instances/AZs; elastic; shared files for containers.
- **S3** – object storage via API; virtually unlimited; not a filesystem.`,
    k:"EBS = disk, EFS = shared filesystem, S3 = objects, instance store = scratch." },
  { l:"I", t:"Containers", q:"Explain ECS: clusters, task definitions, tasks and services.",
    a:`- **Cluster** – logical grouping of capacity (EC2 instances or Fargate).
- **Task definition** – versioned blueprint: image, CPU/memory, ports, env vars, secrets, IAM roles, logging, health check.
- **Task** – a running instance of a task definition (one or more containers).
- **Service** – keeps N tasks running, integrates with ALB target groups, performs rolling or blue/green (CodeDeploy) deployments, auto-scales, and registers in service discovery (Cloud Map / Service Connect).

Deploying a new version = register a new task definition revision with the new image tag and update the service.`,
    k:"Task definition describes, service maintains, tasks run." },
  { l:"I", t:"Containers", q:"ECS on EC2 vs Fargate vs EKS — how do you choose?",
    a:`- **Fargate** – no servers to patch or scale, per-task billing, strong isolation; slightly higher unit cost; ideal for most microservices and small teams.
- **ECS on EC2** – cheaper at steady high utilisation, GPU/special instances, daemon tasks; you manage the AMIs and capacity providers.
- **EKS** – when you need Kubernetes APIs, portability, Helm/operators ecosystem, or have K8s expertise; more operational overhead.

For a 5-person team running Spring Boot services, ECS Fargate is usually the pragmatic choice.`,
    k:"Fargate for simplicity, EC2 for cost at scale, EKS for Kubernetes needs." },
  { l:"I", t:"Containers", q:"What is ECR and how do you use it in a pipeline?",
    a:`Amazon Elastic Container Registry is a private Docker/OCI registry.
- Authenticate: ‹aws ecr get-login-password | docker login --username AWS --password-stdin <account>.dkr.ecr.<region>.amazonaws.com›.
- Push images tagged with version + git SHA; enable **tag immutability**.
- Enable **scan on push** / enhanced scanning (Inspector) for CVEs.
- **Lifecycle policies** to expire old/untagged images.
- Cross-account/region replication for multi-account setups.`,
    k:"Private registry with immutable tags, scanning and lifecycle cleanup." },
  { l:"I", t:"Serverless", q:"What is AWS Lambda and what are its limits and pitfalls?",
    a:`Lambda runs functions in response to events (API Gateway, S3, SQS, EventBridge, DynamoDB Streams, Kafka/MSK) and bills per request and GB-second.

Limits/pitfalls:
- Max 15-minute execution; memory 128 MB–10 GB (CPU scales with memory); ephemeral ‹/tmp› up to 10 GB.
- **Cold starts** — notable for Java; mitigate with **SnapStart**, provisioned concurrency, smaller packages, or GraalVM.
- Concurrency limits (account default 1,000) — reserve concurrency to protect downstreams like RDS (use RDS Proxy).
- Statelessness; idempotency for retried async events; DLQs/on-failure destinations.`,
    k:"Great for event glue and spiky loads; mind cold starts, timeouts and concurrency." },
  { l:"I", t:"Serverless", q:"What does API Gateway provide? REST vs HTTP APIs vs WebSocket APIs?",
    a:`API Gateway is a managed front door for APIs: routing to Lambda/HTTP/VPC links, authorizers (JWT, Cognito, Lambda), throttling, usage plans/API keys, request validation, caching, custom domains, WAF.

- **REST API** – most features (usage plans, caching, request transformation).
- **HTTP API** – cheaper, faster, simpler; JWT authorizers; good default.
- **WebSocket API** – managed persistent connections, routes messages to backends (alternative to running your own WebSocket servers).`,
    k:"HTTP API by default; REST API for advanced features; WebSocket API for managed sockets." },
  // ───────── Storage ─────────
  { l:"B", t:"S3", q:"What is S3 and what are its storage classes?",
    a:`S3 is durable (11 nines) object storage organised into buckets and keys.

Classes: **Standard**, **Intelligent-Tiering** (auto moves objects), **Standard-IA** and **One Zone-IA** (infrequent access), **Glacier Instant/Flexible/Deep Archive** (archival). Use **lifecycle rules** to transition and expire objects (e.g. raw alarm exports → IA after 30 days → Glacier after 180 days → delete after 7 years).`,
    k:"Durable objects; lifecycle rules move data to cheaper tiers." },
  { l:"I", t:"S3", q:"How do you secure S3 buckets and share files securely?",
    a:`- **Block Public Access** at account and bucket level.
- Bucket policies + IAM least privilege; enforce TLS (‹aws:SecureTransport›).
- Default encryption (SSE-S3 or SSE-KMS); versioning + MFA delete / Object Lock for critical data.
- Access logs / CloudTrail data events.
- Share with **pre-signed URLs** (time-limited GET/PUT) — e.g. Angular uploads a report directly to S3 via a pre-signed PUT generated by Spring Boot, avoiding streaming large files through the API.`,
    k:"Private by default, encrypted, versioned; share via pre-signed URLs." },
  { l:"I", t:"S3", q:"Explain S3 consistency, versioning, replication and event notifications.",
    a:`- **Consistency**: strong read-after-write for all operations (since 2020).
- **Versioning**: keeps all versions; protects against overwrites/deletes.
- **Replication**: CRR (cross-region) / SRR for DR and compliance; requires versioning.
- **Event notifications**: object created/deleted → Lambda, SQS, SNS or EventBridge — e.g. process an uploaded CSV of device inventory.
- Performance: thousands of requests/s per prefix; multipart upload for large files; Transfer Acceleration.`,
    k:"Strongly consistent, versionable, replicable, event-emitting object store." },
  // ───────── Databases ─────────
  { l:"I", t:"Databases", q:"RDS vs Aurora — and what does Multi-AZ vs Read Replica mean?",
    a:`- **RDS** – managed PostgreSQL/MySQL/SQL Server/Oracle/MariaDB: backups, patching, monitoring.
- **Aurora** – AWS-built MySQL/PostgreSQL-compatible engine with distributed storage (6 copies across 3 AZs), faster failover, up to 15 low-lag replicas, Serverless v2, Global Database.

- **Multi-AZ** – synchronous standby in another AZ for **high availability**; automatic failover (DNS endpoint stays the same). Not for read scaling (except Multi-AZ cluster deployments).
- **Read replicas** – asynchronous copies for **read scaling** and reporting; can be cross-region; can be promoted for DR.`,
    k:"Multi-AZ for availability, replicas for reads; Aurora improves both." },
  { l:"I", t:"Databases", q:"What is RDS Proxy and when do you need it?",
    a:`RDS Proxy is a managed connection pooler in front of RDS/Aurora. It multiplexes many client connections onto fewer DB connections, reduces failover time, and integrates with IAM auth and Secrets Manager.

Needed when many short-lived clients (Lambda functions, autoscaled ECS tasks) would otherwise exhaust ‹max_connections›.`,
    k:"Pool connections centrally for Lambda and autoscaled services." },
  { l:"I", t:"Databases", q:"When would you use DynamoDB and how do you design its keys?",
    a:`DynamoDB is a serverless key-value/document store with single-digit-ms latency at any scale — good for high-throughput access patterns known up front (sessions, device state, idempotency keys, IoT telemetry).

Design:
- **Partition key** with high cardinality for even distribution; **sort key** for range queries (‹PK=DEVICE#123, SK=EVENT#2026-10-14T10:00›).
- Single-table design with GSIs for alternate access patterns.
- On-demand vs provisioned capacity; TTL for expiry; Streams for change events; transactions for multi-item atomicity.

Avoid when you need ad-hoc queries, joins or complex reporting — use PostgreSQL/Athena.`,
    k:"Design keys from access patterns; DynamoDB rewards known queries." },
  { l:"I", t:"Caching", q:"What is ElastiCache and how do you use Redis in a Spring Boot app?",
    a:`ElastiCache provides managed Redis/Valkey/Memcached. With Spring Boot: ‹spring-boot-starter-data-redis› + ‹@Cacheable› with a ‹RedisCacheManager› (TTL per cache), distributed sessions, rate-limiting counters, distributed locks (Redisson), pub/sub, leaderboards.

Use cluster mode for scale, Multi-AZ with automatic failover, encryption in transit/at rest, and set eviction policies (‹allkeys-lru›).`,
    k:"Managed Redis for caching, sessions, rate limits and locks." },
  // ───────── Messaging ─────────
  { l:"I", t:"Messaging", q:"SQS vs SNS vs EventBridge vs Kinesis vs MSK?",
    a:`- **SQS** – queue for point-to-point work distribution; consumers pull; Standard (at-least-once, best-effort order) or FIFO (ordered, exactly-once processing within dedup window).
- **SNS** – pub/sub fan-out to SQS, Lambda, HTTP, email, SMS.
- **EventBridge** – event bus with content-based routing rules, SaaS integrations, schema registry, scheduler.
- **Kinesis Data Streams** – ordered, replayable shards for real-time streaming analytics.
- **MSK** – managed Apache Kafka for high-throughput event streaming with Kafka APIs (common for real-time event platforms).

Common pattern: SNS → multiple SQS queues for reliable fan-out.`,
    k:"SQS queues work, SNS fans out, EventBridge routes, Kinesis/MSK stream." },
  { l:"I", t:"Messaging", q:"Explain SQS visibility timeout, DLQs and long polling.",
    a:`- **Visibility timeout** – after a consumer receives a message, it's hidden for N seconds; if not deleted in time, it reappears for another consumer. Set it longer than processing time (or extend it).
- **Dead-letter queue** – after ‹maxReceiveCount› failed receives, the message moves to a DLQ for inspection and redrive.
- **Long polling** (‹WaitTimeSeconds=20›) reduces empty responses and cost.
- Batch receive/delete up to 10 messages; idempotent consumers because delivery is at-least-once.`,
    k:"Visibility timeout > processing time, DLQ for poison messages, long polling for efficiency." },
  // ───────── Observability ─────────
  { l:"I", t:"Observability", q:"How do you monitor applications on AWS with CloudWatch and X-Ray?",
    a:`- **CloudWatch Logs** – container logs via awslogs/FireLens; Logs Insights queries; metric filters; retention policies.
- **CloudWatch Metrics** – AWS service metrics plus custom app metrics (Micrometer CloudWatch registry or EMF).
- **Alarms** – on p99 latency, 5xx rate, queue age, consumer lag, CPU/memory → SNS → PagerDuty/Slack; composite alarms reduce noise.
- **Dashboards** per service; **Container Insights** for ECS/EKS.
- **X-Ray / ADOT (OpenTelemetry)** – distributed traces and service maps.
- **CloudTrail** – audit of API calls (who changed what).`,
    k:"Logs + metrics + alarms + traces + CloudTrail audit." },
  { l:"I", t:"Observability", q:"CloudWatch vs CloudTrail vs AWS Config?",
    a:`- **CloudWatch** – performance and operational monitoring (metrics, logs, alarms).
- **CloudTrail** – governance/audit: records API calls (who did what, when, from where).
- **AWS Config** – records resource configuration over time and evaluates compliance rules (e.g. "S3 buckets must be encrypted").`,
    k:"CloudWatch = how it runs; CloudTrail = who did what; Config = what it looks like." },
  // ───────── Security ─────────
  { l:"I", t:"Security", q:"Secrets Manager vs Systems Manager Parameter Store?",
    a:`- **Secrets Manager** – secrets with automatic **rotation** (built-in for RDS), cross-account sharing, versioning; per-secret cost.
- **Parameter Store** – hierarchical config and secrets (SecureString with KMS); free standard tier; no native rotation.

Use Secrets Manager for DB passwords and API keys; Parameter Store for configuration. ECS injects both into containers via the task definition ‹secrets› block; Spring Cloud AWS can load them as property sources.`,
    k:"Secrets Manager for rotating secrets, Parameter Store for config." },
  { l:"I", t:"Security", q:"What is KMS and how does envelope encryption work?",
    a:`AWS KMS manages encryption keys (AWS-managed or customer-managed CMKs) with IAM/key policies and audit via CloudTrail.

**Envelope encryption**: KMS generates a **data key**; data is encrypted locally with the plaintext data key; the data key itself is stored encrypted by the KMS key alongside the data. To decrypt, KMS decrypts the data key. This avoids sending large data to KMS and limits key exposure. S3, EBS, RDS use this under the hood.`,
    k:"KMS protects data keys; data keys protect data." },
  { l:"I", t:"Security", q:"How do you protect a public web application on AWS?",
    a:`- **CloudFront + AWS WAF** (managed rule groups for OWASP Top 10, rate-based rules, bot control) and **Shield** (DDoS; Advanced for larger risk).
- TLS everywhere with ACM certificates.
- ALB in public subnets only; apps and DBs in private subnets; tight security groups.
- Cognito/OIDC authentication; JWT validation in services.
- GuardDuty (threat detection), Security Hub, Inspector (vulnerabilities), Config rules.
- Secrets in Secrets Manager; encryption with KMS; CloudTrail enabled org-wide.`,
    k:"Edge protection + private networking + identity + continuous detection." },
  { l:"I", t:"Security", q:"What is Amazon Cognito?",
    a:`Cognito provides user authentication for apps:
- **User pools** – user directory, sign-up/sign-in, MFA, social/SAML/OIDC federation, hosted UI, issues JWTs (ID/access/refresh tokens).
- **Identity pools** – exchange identities for temporary AWS credentials to call AWS services directly.

Angular uses Authorization Code + PKCE against the user pool; Spring Boot validates tokens as an OAuth2 resource server using the pool's JWKS URL; ALB and API Gateway can also validate Cognito tokens.`,
    k:"User pools authenticate users (JWTs); identity pools grant AWS credentials." },
  // ───────── IaC & deployment ─────────
  { l:"I", t:"IaC", q:"CloudFormation vs CDK vs Terraform?",
    a:`- **CloudFormation** – AWS-native declarative YAML/JSON stacks; drift detection, change sets, StackSets.
- **CDK** – define infrastructure in TypeScript/Java/Python; synthesizes CloudFormation; reusable constructs.
- **Terraform** – multi-cloud HCL with state files (store remotely in S3 + DynamoDB locking), huge provider ecosystem.

Choose CDK for AWS-only teams who like real code; Terraform for multi-cloud/standardised orgs. Either way: modules, code review, pipelines, no click-ops.`,
    k:"All are IaC; CDK = code → CloudFormation; Terraform = multi-cloud state-based." },
  { l:"I", t:"Deployment", q:"How do you deploy a Spring Boot service to ECS Fargate end to end?",
    a:`1. Jenkins builds and tests; Docker image pushed to ECR with an immutable tag.
2. Register a new **task definition** revision (image tag, CPU/memory, env, ‹secrets› from Secrets Manager, task role, awslogs).
3. **ECS service** in private subnets behind an **ALB** target group (health check ‹/actuator/health/readiness›).
4. Update the service → rolling deployment with **deployment circuit breaker** and rollback, or blue/green via CodeDeploy.
5. Auto scaling on CPU/ALB request count/custom metrics.
6. Observe CloudWatch metrics/logs and alarms; automatic rollback on alarm.`,
    k:"ECR image → task definition → ECS service + ALB → rolling/blue-green with auto-rollback." },
  { l:"I", t:"Deployment", q:"What are the AWS developer tools (CodeCommit/Build/Deploy/Pipeline) and how do they compare with Jenkins?",
    a:`- **CodeBuild** – managed build containers.
- **CodeDeploy** – deployments to EC2, ECS (blue/green with traffic shifting) and Lambda (canary/linear).
- **CodePipeline** – orchestrates stages.
(CodeCommit is closed to new customers.)

Compared with Jenkins: fully managed, IAM-integrated and pay-per-use, but less flexible and fewer plugins. Common hybrid: Jenkins for CI, CodeDeploy for ECS blue/green traffic shifting.`,
    k:"Managed AWS-native CI/CD vs flexible self-managed Jenkins — often combined." },
  // ───────── Architecture ─────────
  { l:"I", t:"Architecture", q:"What are the six pillars of the AWS Well-Architected Framework?",
    a:`1. **Operational Excellence** – automate, observe, improve (IaC, runbooks, small changes).
2. **Security** – identity, detection, protection, encryption, incident response.
3. **Reliability** – multi-AZ, auto-recovery, backups, tested DR, quotas.
4. **Performance Efficiency** – right resources, serverless, caching, experiment.
5. **Cost Optimization** – right-sizing, pricing models, eliminate waste.
6. **Sustainability** – maximise utilisation, efficient hardware (Graviton), managed services.`,
    k:"Ops, Security, Reliability, Performance, Cost, Sustainability." },
  { l:"A", t:"Architecture", q:"Design a highly available architecture for a Spring Boot + Angular app on AWS.",
    a:`- **Edge**: Route 53 → CloudFront (+ WAF) serving Angular from S3 (OAC) and forwarding ‹/api/*› and ‹/ws/*› to an ALB.
- **Compute**: ECS Fargate services in private subnets across **3 AZs**, min 2 tasks each, autoscaling.
- **Data**: Aurora PostgreSQL Multi-AZ (writer + reader), RDS Proxy; ElastiCache Redis Multi-AZ.
- **Messaging**: Amazon MSK across 3 AZs (replication factor 3, ‹min.insync.replicas=2›) or SQS/SNS.
- **Secrets/config**: Secrets Manager, Parameter Store; KMS encryption.
- **Observability**: CloudWatch, Container Insights, X-Ray/OTel, alarms → SNS.
- **Resilience**: health checks, deployment circuit breakers, backups/PITR, DR plan (pilot light in a second region), tested failover.`,
    k:"Multi-AZ everything, managed data services, edge protection, automated recovery." },
  { l:"A", t:"Architecture", q:"Explain DR strategies: backup & restore, pilot light, warm standby, multi-site.",
    a:`Ordered by cost and recovery speed:
- **Backup & restore** – backups copied to another region; rebuild with IaC. RTO hours, RPO hours. Cheapest.
- **Pilot light** – core data replicated (Aurora Global DB, S3 CRR); minimal compute off; scale up on disaster. RTO tens of minutes.
- **Warm standby** – scaled-down full stack running in the DR region; scale up and switch DNS. RTO minutes.
- **Multi-site active/active** – full capacity in multiple regions; near-zero RTO/RPO; most expensive and complex (data conflicts).

Choose based on business RTO/RPO; rehearse failovers.`,
    k:"Spend more for faster recovery — match strategy to RTO/RPO." },
  { l:"A", t:"Architecture", q:"How would you build a real-time alerting pipeline on AWS?",
    a:`1. Devices/cameras → ingestion API (ALB + ECS Spring Boot) or IoT Core/Kinesis for massive device fleets.
2. Validated events → **Amazon MSK** topic keyed by deviceId.
3. Stream processing (Spring Kafka consumers, Kafka Streams or Managed Flink) for rules, deduplication and enrichment.
4. Alerts persisted in Aurora PostgreSQL (operational) and S3 (raw, for Athena analytics).
5. Notification service → SNS (SMS/email) / SES; WebSocket gateway service (or API Gateway WebSocket API) pushes to Angular dashboards.
6. CloudWatch alarms on consumer lag and end-to-end alert latency SLO.`,
    k:"Ingest → MSK → stream rules → store → notify/WebSocket push → monitor latency." },
  { l:"I", t:"Cost", q:"How do you optimise AWS costs?",
    a:`- **Visibility**: tagging strategy, Cost Explorer, budgets and anomaly detection.
- **Right-size** instances/tasks using Compute Optimizer; turn off non-prod at night (scheduled scaling).
- **Commitments**: Savings Plans/RIs for steady baseline; **Spot** for CI agents and batch.
- **Graviton** instances/Fargate ARM for ~20% better price/performance.
- **Storage**: S3 lifecycle/Intelligent-Tiering, gp3 instead of gp2, delete unattached EBS/old snapshots.
- **Networking**: VPC endpoints to reduce NAT costs, CloudFront to reduce origin egress.
- Serverless for spiky workloads; delete idle resources.`,
    k:"Tag and see, right-size, commit for baseline, Spot for interruptible, tier storage." },
  { l:"I", t:"Scaling", q:"Vertical vs horizontal scaling on AWS?",
    a:`- **Vertical** – bigger instance (more CPU/RAM); simple, limited, may need downtime; common for databases.
- **Horizontal** – more instances behind a load balancer; requires stateless apps; near-unlimited, fault tolerant; enabled by ASGs, ECS service autoscaling, DynamoDB/Lambda elasticity.

Design services stateless (sessions in Redis/JWT, files in S3) so they can scale out.`,
    k:"Scale up for quick relief, scale out for resilience and growth." },
  { l:"I", t:"Messaging", q:"What is Amazon MSK and what do you configure for production Kafka?",
    a:`Amazon MSK runs Apache Kafka (provisioned or Serverless) with AWS-managed brokers, patching and ZooKeeper/KRaft.

Production settings: brokers across 3 AZs, replication factor 3, ‹min.insync.replicas=2›, producers with ‹acks=all› and idempotence; IAM or SASL/SCRAM auth + TLS; storage autoscaling or tiered storage; monitoring with CloudWatch/Prometheus (under-replicated partitions, consumer lag); MSK Connect for connectors (Debezium CDC).`,
    k:"3 AZs, RF=3, min ISR 2, acks=all, TLS + IAM auth, watch lag." },
  { l:"I", t:"Serverless", q:"What are Step Functions and when would you use them?",
    a:`Step Functions orchestrate workflows as state machines (Task, Choice, Parallel, Map, Wait, Retry/Catch) calling Lambda, ECS tasks, SQS, DynamoDB and 200+ services directly.

Use for multi-step business processes with retries and compensation (saga orchestration), long-running workflows with human approval, ETL/report generation. Standard workflows for long-running/auditable flows; Express for high-volume short ones.`,
    k:"Managed state machines for orchestrating multi-step workflows and sagas." },
  { l:"I", t:"Analytics", q:"How would you analyse large volumes of historical event data on AWS cheaply?",
    a:`Store raw events in **S3** (partitioned by date/site, Parquet format) via Kinesis Data Firehose or a Kafka Connect S3 sink. Catalogue with **AWS Glue**, query ad hoc with **Athena** (pay per data scanned — partitioning + columnar formats cut cost), and visualise with QuickSight. Use Redshift for heavy, frequent BI workloads. Keep the operational PostgreSQL lean by archiving old data to this lake.`,
    k:"S3 data lake + Parquet + Glue catalog + Athena." },
  { l:"E", t:"Scenario", q:"Scenario: your ECS service has intermittent 502/503 errors from the ALB. How do you debug?",
    a:`- **502**: target returned an invalid response or closed the connection — app crashes, keep-alive timeout mismatch (app's idle timeout must exceed the ALB's 60 s), container killed mid-request (OOM), or deployments without draining.
- **503**: no healthy targets in the target group — failing health checks, tasks restarting, scaling to zero.

Steps: ALB access logs + CloudWatch metrics (‹HTTPCode_ELB_5XX›, ‹HealthyHostCount›, ‹TargetResponseTime›); ECS events and stopped task reasons; container logs; check deregistration delay vs graceful shutdown; health-check path/thresholds; memory limits; Tomcat keep-alive settings (‹server.tomcat.keep-alive-timeout›).`,
    k:"502 = bad target response/connection; 503 = no healthy targets — check logs, events and timeouts." },
  { l:"E", t:"Scenario", q:"Scenario: the AWS bill jumped 40% this month. How do you investigate?",
    a:`1. Cost Explorer grouped by service, then by usage type, region and tags; check Cost Anomaly Detection alerts.
2. Usual suspects: NAT Gateway data processing (chatty traffic to S3/ECR — fix with VPC endpoints), CloudWatch Logs ingestion (debug logging left on), data transfer (cross-AZ/region), forgotten resources (test environments, unattached volumes, old snapshots), autoscaling stuck at max, Lambda loops.
3. Fix root causes, add budgets/alerts, enforce tagging, and schedule non-prod shutdowns.`,
    k:"Break down by service and usage type; NAT, logs and forgotten resources are common culprits." },
  { l:"E", t:"Scenario", q:"Scenario: Lambda functions are exhausting RDS connections. How do you fix it?",
    a:`Each concurrent Lambda execution opens its own connection; a spike of 500 concurrent executions overwhelms ‹max_connections›.

Fixes:
- Put **RDS Proxy** in front of the database.
- Set **reserved concurrency** on the function to cap parallelism.
- Reuse connections across invocations (initialise outside the handler).
- Buffer writes through **SQS** with controlled batch size/concurrency.
- Consider DynamoDB for high-concurrency key-value access patterns.`,
    k:"RDS Proxy + reserved concurrency + queue buffering." },
  { l:"I", t:"Fundamentals", q:"What are AWS service quotas and why do they matter in design?",
    a:`Every account/region has quotas (formerly limits): e.g. Lambda concurrent executions, ECS tasks per service, VPCs per region, ENIs, API Gateway throttles, SES sending rates. Hitting them causes throttling or deployment failures during scale events.

Track them in Service Quotas, set CloudWatch alarms on usage, request increases ahead of launches/load tests, and design with exponential backoff for throttling errors.`,
    k:"Know and monitor quotas before your traffic does." },
  { l:"I", t:"Organizations", q:"How do you structure AWS accounts for a team or company?",
    a:`Use **AWS Organizations** with a multi-account strategy (often via Control Tower landing zone):
- Separate accounts for prod, staging, dev, shared services (CI/CD, ECR), security/logging.
- **SCPs** as guardrails (deny disabling CloudTrail, restrict regions).
- IAM Identity Center for SSO with permission sets.
- Centralised CloudTrail, Config and GuardDuty in the security account.
- Consolidated billing and tags for cost allocation.

Accounts are the strongest isolation boundary — a dev mistake can't touch prod.`,
    k:"Multiple accounts + Organizations SCPs + SSO + centralised logging." },
  { l:"B", t:"Fundamentals", q:"What is the difference between IaaS, PaaS, SaaS and serverless, with AWS examples?",
    a:`- **IaaS** – you manage OS and above: EC2, EBS, VPC.
- **PaaS** – you manage the app; platform handles runtime: Elastic Beanstalk, App Runner, RDS (DBaaS).
- **SaaS** – complete software: WorkMail, QuickSight, Chime.
- **Serverless/FaaS** – no servers to manage, pay per use, auto scale: Lambda, Fargate, DynamoDB, S3, SQS.`,
    k:"Moving up the stack trades control for less operational work." },
  { l:"I", t:"Containers", q:"How do ECS services discover and talk to each other?",
    a:`Options:
- **ECS Service Connect** (recommended) – managed Envoy-based service mesh with short names (‹http://device-service:8080›), retries, metrics.
- **AWS Cloud Map** DNS-based service discovery.
- **Internal ALB** per service or shared with path-based routing.
- **VPC Lattice** for cross-VPC/account service networking.

Use security groups to restrict which services can call which.`,
    k:"Service Connect or Cloud Map for discovery; security groups for allowed paths." },
  { l:"I", t:"Messaging", q:"How do you implement fan-out to multiple consumers on AWS?",
    a:`Publish to an **SNS topic** with multiple **SQS queues** subscribed (one per consuming service). Each service gets its own durable copy, processes at its own pace, has its own DLQ and retry policy. Use SNS message filtering so each queue receives only relevant events. Alternatively **EventBridge** rules route events to many targets, or Kafka/MSK consumer groups for streaming fan-out.`,
    k:"SNS → SQS per consumer = durable, independent fan-out." }
]);
