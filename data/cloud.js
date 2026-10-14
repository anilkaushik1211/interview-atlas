ATLAS.addTrack({
  id: "cloud", title: "Cloud Architecture", icon: "🌐", color: "#6366f1", accent: "#a5b4fc",
  tagline: "Cloud-native concepts, scalability, HA/DR, serverless, security & cost",
  blurb: "Vendor-neutral cloud concepts every lead is expected to reason about — service models, cloud-native design, scaling, availability, disaster recovery, serverless, networking, security, migration and cost — with AWS, Azure and GCP equivalents."
}, [
  { l:"B", t:"Fundamentals", q:"What is cloud computing and what are its key characteristics?",
    a:`Cloud computing is on-demand delivery of compute, storage, databases, networking and software over the internet with pay-as-you-go pricing.

NIST's five characteristics:
- **On-demand self-service** – provision without human interaction.
- **Broad network access**.
- **Resource pooling** – multi-tenant infrastructure.
- **Rapid elasticity** – scale out/in quickly.
- **Measured service** – pay for what you use.

Benefits: no upfront hardware, global reach in minutes, managed services, elasticity for spikes, and faster experimentation.`,
    k:"Rent computing like electricity: on demand, elastic, metered.",
    r:"Using a ride-hailing app instead of owning a car: no purchase, no maintenance, pay per ride, and you can order a bigger car when friends join." },
  { l:"B", t:"Fundamentals", q:"Explain IaaS, PaaS, SaaS and FaaS with examples.",
    a:`- **IaaS** – virtual machines, networks, disks; you manage OS upward. AWS EC2, Azure VMs, GCP Compute Engine.
- **PaaS** – platform runs your code; you manage the app and data. Elastic Beanstalk, Azure App Service, Google App Engine, managed databases.
- **SaaS** – complete applications. Gmail, Salesforce, Jira.
- **FaaS / Serverless** – functions triggered by events, billed per execution. Lambda, Azure Functions, Cloud Functions.

Moving up the stack = less control, less operational work.`,
    k:"The higher the abstraction, the less you manage.",
    r:"Pizza as a service: make it at home (on-prem), take-and-bake (IaaS), delivery (PaaS), dining out (SaaS)." },
  { l:"B", t:"Fundamentals", q:"Public vs private vs hybrid vs multi-cloud?",
    a:`- **Public cloud** – shared provider infrastructure (AWS, Azure, GCP).
- **Private cloud** – dedicated infrastructure for one organisation (on-prem OpenStack/VMware or dedicated hosting).
- **Hybrid** – on-prem + public cloud connected (VPN/Direct Connect), e.g. sensitive data on-prem, burst compute in cloud.
- **Multi-cloud** – using multiple public clouds, for best-of-breed services, regulation or negotiating power — at the cost of complexity and lowest-common-denominator designs.`,
    k:"Choose deployment models for compliance, latency and cost — not fashion.",
    r:"Living in your own house (private), renting an apartment (public), owning a house plus renting a holiday flat (hybrid), or renting in several cities (multi-cloud)." },
  { l:"B", t:"Fundamentals", q:"Map common AWS services to Azure and GCP equivalents.",
    a:`- Compute VMs: EC2 ↔ Azure Virtual Machines ↔ Compute Engine.
- Containers: ECS/EKS ↔ AKS/Container Apps ↔ GKE/Cloud Run.
- Serverless: Lambda ↔ Azure Functions ↔ Cloud Functions.
- Object storage: S3 ↔ Blob Storage ↔ Cloud Storage.
- Relational DB: RDS/Aurora ↔ Azure SQL/Database for PostgreSQL ↔ Cloud SQL/AlloyDB.
- NoSQL: DynamoDB ↔ Cosmos DB ↔ Firestore/Bigtable.
- Messaging: SQS/SNS/MSK ↔ Service Bus/Event Hubs ↔ Pub/Sub.
- CDN: CloudFront ↔ Front Door/CDN ↔ Cloud CDN.
- Identity: IAM ↔ Entra ID/RBAC ↔ Cloud IAM.
- Monitoring: CloudWatch ↔ Azure Monitor ↔ Cloud Monitoring.`,
    k:"Concepts transfer; names differ.",
    r:"Like coffee chains: a 'latte' exists at every chain — the cup sizes and names differ, but you know what you're ordering." },
  { l:"I", t:"Cloud-Native", q:"What does 'cloud-native' mean?",
    a:`Cloud-native applications are designed to exploit cloud elasticity and resilience:
- **Microservices** or well-modularised services.
- **Containers** and orchestration (Kubernetes/ECS) or serverless.
- **Stateless** compute; state in managed services.
- **Declarative infrastructure** (IaC) and CI/CD.
- **Observability** built in.
- **Resilience** patterns: health checks, retries, circuit breakers, graceful degradation.
- Designed for **horizontal scaling** and failure as normal.

Lift-and-shift VMs run *in* the cloud; cloud-native apps are built *for* it.`,
    k:"Built for elasticity, automation and failure — not just hosted in the cloud.",
    r:"Moving your old furniture into a smart home (lift-and-shift) vs designing the home around smart lights, sensors and automation from day one (cloud-native)." },
  { l:"I", t:"Cloud-Native", q:"Why should services be stateless in the cloud?",
    a:`Stateless services keep no client-specific data in memory between requests — sessions live in Redis/JWT, files in object storage, data in databases.

Benefits: any instance can serve any request, so you can autoscale, replace failed instances, deploy with rolling updates and use spot capacity without losing user state. Stateful components are concentrated in managed services designed for durability.`,
    k:"Stateless compute = disposable, scalable instances.",
    r:"Call centre agents who look up your case in a shared system (stateless) vs one agent who keeps your case in their personal notebook — if they go home, your case is gone." },
  // ───────── Scalability ─────────
  { l:"B", t:"Scalability", q:"Vertical vs horizontal scaling — trade-offs?",
    a:`- **Vertical (scale up)**: bigger machine. Simple, no code changes; limited by the largest instance, often requires downtime, single point of failure.
- **Horizontal (scale out)**: more machines behind a load balancer. Near-unlimited and fault tolerant; requires stateless design, distributed data and coordination.

Typical: scale app tiers horizontally, databases vertically first, then read replicas/sharding.`,
    k:"Up is simple but capped; out is resilient but needs design.",
    r:"Hiring one super-chef vs hiring more chefs: one star chef has limits and can get sick; a team scales, but needs a shared kitchen system." },
  { l:"I", t:"Scalability", q:"What is elasticity and how does autoscaling work?",
    a:`Elasticity is automatically matching capacity to demand — scale out on load, scale in when idle to save money.

Autoscaling policies:
- **Target tracking** – keep a metric near a target (CPU 50%, 1,000 req/target).
- **Step scaling** – add N instances when thresholds are crossed.
- **Scheduled** – known patterns (business hours).
- **Predictive** – ML forecasts based on history.
- **Event-driven** – queue depth or consumer lag (KEDA, Lambda).

Tune cooldowns, warm-up time (JVM!) and min/max bounds; scale on metrics that reflect user experience.`,
    k:"Capacity follows demand automatically, within bounds.",
    r:"A smart supermarket opening checkout lanes as queues grow and closing them in quiet hours." },
  { l:"I", t:"Scalability", q:"How do you scale the data tier in the cloud?",
    a:`- Read replicas for read-heavy traffic.
- Caching (Redis/ElastiCache, CDN for public content).
- Vertical scaling and storage autoscaling for managed DBs.
- Partitioning/sharding (or distributed databases: Aurora Limitless, Spanner, Cosmos DB, DynamoDB).
- CQRS: separate read models (search indexes, materialised views).
- Archive cold data to object storage and query with serverless engines (Athena/BigQuery).
- Connection pooling proxies (RDS Proxy, PgBouncer).`,
    k:"Cache, replicate, partition, archive.",
    r:"A busy library: photocopy popular books (replicas), keep bestsellers at the front desk (cache), split collections across branches (sharding), move old newspapers to the archive (cold storage)." },
  // ───────── Availability ─────────
  { l:"I", t:"High Availability", q:"How do you design for high availability in the cloud?",
    a:`- **Eliminate single points of failure**: multiple instances across ≥2 Availability Zones.
- **Load balancers** with health checks.
- **Managed multi-AZ data stores** (RDS Multi-AZ, Aurora, DynamoDB).
- **Stateless compute** with autoscaling and self-healing.
- **Resilience patterns**: timeouts, retries with jitter, circuit breakers, bulkheads.
- **Decoupling** via queues/streams.
- **Graceful degradation** of non-critical features.
- **Test failures**: chaos engineering, game days.

Availability math: 99.9% ≈ 43 min downtime/month; 99.99% ≈ 4.3 min.`,
    k:"Redundancy across AZs + health-based routing + tested failure handling.",
    r:"A hospital with backup generators, two power lines from different substations and regular blackout drills." },
  { l:"I", t:"High Availability", q:"How do you calculate composite availability?",
    a:`- **Serial dependencies multiply**: app (99.95%) → DB (99.95%) → cache (99.9%) = 0.9995 × 0.9995 × 0.999 ≈ **99.8%**. More hard dependencies = lower availability.
- **Redundant (parallel) components**: 1 − (1 − A)ⁿ. Two independent 99% instances = 1 − 0.01² = **99.99%**.

Lessons: minimise hard synchronous dependencies, add redundancy, and make non-critical dependencies optional (fallbacks).`,
    k:"Chains multiply down; redundancy multiplies up.",
    r:"Christmas lights in series: one bulb fails and the whole string goes dark. Two parallel strings: one can fail and the tree still shines." },
  { l:"A", t:"Disaster Recovery", q:"What are RTO and RPO, and how do they drive DR design?",
    a:`- **RPO (Recovery Point Objective)** – maximum acceptable data loss (time since last good copy). Drives backup frequency and replication mode.
- **RTO (Recovery Time Objective)** – maximum acceptable downtime. Drives standby strategy and automation.

Strategies by cost: backup & restore (hours) → pilot light (tens of minutes) → warm standby (minutes) → active-active multi-region (near zero). Business owners set RTO/RPO per system; engineers design and **test** to meet them.`,
    k:"RPO = how much data you can lose; RTO = how long you can be down.",
    r:"Writing a thesis: RPO is how much text you'd lose since your last save; RTO is how long until you're typing again on a new laptop." },
  { l:"A", t:"Disaster Recovery", q:"Active-active vs active-passive multi-region?",
    a:`- **Active-passive** – one region serves traffic; another is on standby (pilot light/warm). Failover via DNS (Route 53 failover). Simpler data consistency, some downtime and possible data loss on failover.
- **Active-active** – multiple regions serve traffic simultaneously (latency-based routing). Near-zero RTO and better latency for global users, but hard problems: multi-region data replication, conflict resolution, global uniqueness, cost.

Choose active-active only when the business truly needs it.`,
    k:"Passive = simpler, slower recovery; active = fast, complex, costly.",
    r:"A spare tyre in the boot (passive) vs a truck with dual rear wheels that keeps rolling if one bursts (active)." },
  { l:"A", t:"Resilience", q:"What is chaos engineering?",
    a:`Deliberately injecting failures in a controlled way to verify a system withstands them: kill instances, add latency, drop network packets, fail an AZ, exhaust CPU.

Process: define steady state (SLIs) → hypothesis ("losing one AZ keeps p99 < 500 ms") → run a small, controlled experiment (AWS Fault Injection Service, Chaos Monkey, Litmus) → observe → fix weaknesses → expand blast radius gradually. Start in staging; run game days with the team.`,
    k:"Break things on purpose, safely, to learn before customers do.",
    r:"Fire drills: you trigger the alarm on a calm Tuesday so that a real fire doesn't become chaos." },
  // ───────── Serverless ─────────
  { l:"I", t:"Serverless", q:"What are the benefits and drawbacks of serverless?",
    a:`Benefits: no servers to manage, automatic scaling (including to zero), pay per use, built-in HA, fast to build event-driven glue.

Drawbacks: cold starts (notably Java — mitigate with SnapStart/provisioned concurrency), execution time limits, harder local testing/debugging, vendor lock-in, concurrency limits that can overwhelm downstream databases, and potentially higher cost at sustained high load.

Great fits: file processing, webhooks, scheduled tasks, event handlers, low/spiky traffic APIs.`,
    k:"Zero ops and pay-per-use, at the cost of limits and lock-in.",
    r:"Taxis vs owning a fleet: perfect for occasional or unpredictable trips; for constant all-day driving, owning becomes cheaper." },
  { l:"I", t:"Serverless", q:"What is event-driven serverless architecture? Give an example.",
    a:`Services emit events (object uploaded, message queued, record changed) and functions react.

Example — bulk device import:
1. User uploads CSV to S3 via pre-signed URL.
2. S3 event → Lambda validates the file and splits it into chunks → SQS.
3. Worker Lambdas process chunks (batch size + reserved concurrency to protect the DB), upsert devices.
4. Results → DynamoDB/RDS; summary event → EventBridge → notification Lambda emails the user.
5. Failures → DLQ with alarms.`,
    k:"Events trigger small functions; queues smooth the flow.",
    r:"Dominoes: one event tips the next, and queues are the spacers that keep the chain from collapsing all at once." },
  // ───────── Networking ─────────
  { l:"I", t:"Networking", q:"Explain a typical cloud network layout (VPC, subnets, gateways).",
    a:`- A **VPC/VNet** with a private CIDR (10.0.0.0/16).
- **Public subnets** (per AZ) hosting load balancers and NAT gateways; route to an Internet Gateway.
- **Private app subnets** for containers/VMs; outbound via NAT.
- **Private data subnets** for databases with no internet route.
- **Security groups/NSGs** allowing only required flows (ALB → app :8080, app → DB :5432).
- **VPC endpoints/Private Link** for cloud services.
- **VPN/Direct Connect/ExpressRoute** for on-prem.`,
    k:"Public edge, private apps, isolated data — least-privilege flows between.",
    r:"A corporate campus: reception in the lobby (public subnet), offices behind badge doors (private app), and a vault in the basement only reachable from the offices (data subnet)." },
  { l:"I", t:"Networking", q:"How does a CDN improve performance and resilience?",
    a:`A CDN caches content at edge locations close to users:
- Lower latency and faster page loads (static assets, images, cached API responses).
- Offloads traffic from origins (cost and scale).
- Absorbs traffic spikes and DDoS attacks; integrates with WAF.
- TLS termination at the edge, HTTP/2/3, compression.

Design cache keys, TTLs and invalidation carefully; use hashed file names for immutable assets.`,
    k:"Serve from near the user; protect the origin.",
    r:"Opening local warehouses so packages arrive in hours instead of shipping everything from one central factory." },
  { l:"I", t:"Networking", q:"How do DNS-based routing and global load balancing work?",
    a:`DNS services (Route 53, Azure Traffic Manager, Cloud DNS) answer queries with different endpoints based on policy: latency, geography, weights, or health (failover). Global load balancers (AWS Global Accelerator, Azure Front Door, GCP global LB) use anycast IPs and route over the provider backbone with fast health-based failover — avoiding DNS TTL caching delays.`,
    k:"DNS routing for simplicity; anycast global LBs for fast failover.",
    r:"A national helpline number that connects you to the nearest open call centre, and reroutes instantly if one centre loses power." },
  // ───────── Security ─────────
  { l:"I", t:"Security", q:"What is the shared responsibility model?",
    a:`The provider secures the **cloud itself** (data centres, hardware, hypervisor, managed service infrastructure). The customer secures **what they put in the cloud**: identities and access, data and encryption, network configuration, OS patching on VMs, application security.

The split shifts with the service model: more managed (serverless, SaaS) = fewer customer responsibilities — but identity, data and configuration always remain yours.`,
    k:"Provider secures the building; you lock your own doors.",
    r:"Renting an apartment: the landlord maintains the building's structure and main door; you lock your apartment and decide who gets a key." },
  { l:"I", t:"Security", q:"What are the core cloud security best practices?",
    a:`- **Identity first**: SSO + MFA for humans, roles with short-lived credentials for workloads, least privilege, no root usage.
- **Network**: private subnets, security groups, WAF, no public databases.
- **Data**: encryption at rest (KMS) and in transit (TLS), backups, classification.
- **Secrets**: vaults with rotation.
- **Detection**: audit logs (CloudTrail), threat detection (GuardDuty), config compliance, alerting.
- **Posture**: CSPM/Security Hub, IaC scanning, patching.
- **Isolation**: separate accounts/subscriptions per environment.`,
    k:"Identity, network, data, secrets, detection, isolation.",
    r:"Home security in layers: locks (identity), fences (network), a safe for valuables (encryption), cameras (logging) and separate keys for each room (least privilege)." },
  { l:"A", t:"Security", q:"What is Zero Trust architecture?",
    a:`"Never trust, always verify." No implicit trust based on network location: every request is authenticated, authorised and encrypted, wherever it comes from.

Principles: strong identity for users and workloads (mTLS, OIDC), least-privilege access per request, micro-segmentation, continuous verification (device posture, context), assume breach and monitor everything. Replaces the "hard shell, soft centre" VPN model.`,
    k:"Every request proves who it is, every time.",
    r:"An office where you badge into every room, not just the front door — getting past reception doesn't open the server room." },
  { l:"I", t:"Security", q:"How do you protect data at rest and in transit?",
    a:`- **In transit**: TLS 1.2+ everywhere (edge, service-to-service, DB connections), HSTS, mTLS for internal zero trust.
- **At rest**: provider-managed or customer-managed keys (KMS/Key Vault), encrypted volumes, buckets, snapshots and backups; envelope encryption for app-level secrets.
- **Key management**: rotation, separation of duties, audit logs.
- **Data minimisation**: tokenise/mask PII, avoid logging sensitive data.`,
    k:"TLS for motion, KMS for storage, minimise what you keep.",
    r:"An armoured truck for transporting cash (in transit) and a bank vault for storing it (at rest), with keys held by different people." },
  // ───────── Storage & data ─────────
  { l:"B", t:"Storage", q:"Block vs file vs object storage?",
    a:`- **Block** (EBS, Azure Disk) – raw volumes attached to one VM; low latency; databases and boot disks.
- **File** (EFS, Azure Files, Filestore) – shared POSIX file systems mounted by many machines.
- **Object** (S3, Blob, GCS) – HTTP API, flat namespace, virtually unlimited, very durable; media, backups, data lakes, static websites.`,
    k:"Block for disks, file for shared folders, object for everything at scale.",
    r:"Block = your laptop's hard drive, file = the shared network drive at the office, object = a self-storage warehouse where each box has a label and you request it by name." },
  { l:"I", t:"Data", q:"How do you choose a database in the cloud?",
    a:`Ask about access patterns and requirements:
- Relational with transactions and joins → managed PostgreSQL/MySQL (RDS/Aurora, Cloud SQL).
- Massive scale key-value with predictable queries → DynamoDB/Cosmos DB/Bigtable.
- Flexible documents → MongoDB Atlas/DocumentDB/Firestore.
- Caching/sessions → Redis.
- Search → OpenSearch/Elasticsearch.
- Time series → Timestream/TimescaleDB/InfluxDB.
- Analytics → Redshift/BigQuery/Snowflake, or S3 + Athena.
- Graph → Neptune/Neo4j.

Polyglot persistence is fine — but every extra datastore adds operational and consistency cost.`,
    k:"Pick by access pattern, consistency and scale — not by trend.",
    r:"A kitchen has a fridge, freezer, pantry and spice rack — each for different storage needs. You wouldn't keep ice cream in the spice rack." },
  // ───────── Migration ─────────
  { l:"I", t:"Migration", q:"What are the 7 Rs of cloud migration?",
    a:`1. **Retire** – switch off unused apps.
2. **Retain** – keep on-prem for now.
3. **Rehost** (lift and shift) – move VMs as-is.
4. **Relocate** – move hypervisor-level (e.g. VMware Cloud).
5. **Replatform** (lift, tinker, shift) – small optimisations, e.g. move DB to RDS, app to containers.
6. **Repurchase** – switch to SaaS.
7. **Refactor/Re-architect** – redesign for cloud-native benefits.

Most portfolios use a mix; start with discovery and dependency mapping.`,
    k:"Different apps deserve different migration paths.",
    r:"Moving house: throw some things away (retire), leave some at your parents' (retain), move furniture as-is (rehost), reupholster the sofa (replatform), buy new (repurchase), or redesign the room (refactor)." },
  { l:"A", t:"Migration", q:"How would you migrate a monolithic Java app with a database to the cloud with minimal downtime?",
    a:`1. **Assess**: dependencies, data size, compliance, target architecture.
2. **Replatform first**: containerise the app; provision infrastructure via IaC; managed PostgreSQL.
3. **Data migration**: initial bulk load + continuous replication (AWS DMS / logical replication / Debezium) to keep the cloud DB in sync.
4. **Test** in the cloud with production-like data; performance test.
5. **Cutover**: short write freeze, final sync, switch DNS/connection strings, monitor; keep rollback path (reverse replication) for a period.
6. **Optimise later**: autoscaling, caching, then strangle the monolith into services where valuable.`,
    k:"Replatform, replicate data continuously, short cutover, keep a rollback path.",
    r:"Moving a shop to a new building while it stays open: stock the new shop gradually, then close the old one for one evening to move the last items and change the sign." },
  // ───────── Cost ─────────
  { l:"I", t:"Cost", q:"What is FinOps and how do you optimise cloud cost?",
    a:`FinOps brings financial accountability to cloud spending: engineering, finance and product share visibility and decisions.

Levers:
- **Visibility**: tagging, cost allocation per team/service, budgets and anomaly alerts.
- **Right-sizing** instances, containers and databases.
- **Pricing models**: savings plans/reservations for baseline, spot/preemptible for interruptible work.
- **Elasticity**: autoscaling, schedule non-prod off-hours, serverless for spiky loads.
- **Storage tiers** and lifecycle rules; delete orphaned resources.
- **Architecture**: caching/CDN to cut egress, VPC endpoints to cut NAT costs, ARM (Graviton) instances.
- Unit economics: cost per alarm processed / per customer.`,
    k:"See it, own it, optimise it continuously.",
    r:"A household budget: track who spends what, cancel unused subscriptions, buy staples in bulk (reservations), and turn off lights in empty rooms (non-prod shutdown)." },
  { l:"I", t:"Cost", q:"What causes surprise cloud bills?",
    a:`- Data transfer/egress (cross-region, internet, cross-AZ chatty services).
- NAT gateway processing charges.
- Logs and metrics ingestion (debug logging in production, high-cardinality metrics).
- Forgotten resources: test environments, unattached volumes, idle load balancers, old snapshots.
- Autoscaling loops or misconfigured min capacity.
- Runaway serverless (recursive triggers).
- Over-provisioned databases and storage IOPS.

Prevent with budgets, anomaly detection, tagging policies and cleanup automation.`,
    k:"Egress, NAT, logs and forgotten resources are the usual suspects.",
    r:"A phone bill shock from roaming data you didn't know was on — the dangerous costs are the quiet, background ones." },
  // ───────── Containers & orchestration ─────────
  { l:"I", t:"Containers", q:"When would you choose containers vs VMs vs serverless?",
    a:`- **VMs**: legacy apps, special OS/kernel needs, licensed software, full control.
- **Containers (Kubernetes/ECS/Cloud Run)**: microservices, consistent packaging, long-running services, portability, steady traffic.
- **Serverless functions**: event-driven tasks, spiky or low traffic, glue code, minimal ops.

Many systems combine them: containers for core APIs and Kafka consumers, functions for file processing and scheduled jobs, managed services for data.`,
    k:"Match the compute model to the workload's shape.",
    r:"Owning a car (VM), leasing standard cars from a fleet (containers), or taking taxis for occasional trips (serverless)." },
  { l:"A", t:"Containers", q:"Managed Kubernetes vs simpler container services — trade-offs?",
    a:`- **Managed Kubernetes (EKS/AKS/GKE)**: powerful, portable, rich ecosystem (Helm, operators, service mesh, GitOps). Still requires upgrades, node management (unless Fargate/Autopilot), networking/security expertise.
- **Simpler services (ECS Fargate, Cloud Run, Azure Container Apps)**: far less to operate, opinionated, quick to adopt; fewer knobs, more provider lock-in.

For a small team, simplicity usually wins; Kubernetes pays off with many services, platform teams and multi-cloud/portability needs.`,
    k:"Kubernetes for flexibility at scale; managed container services for simplicity.",
    r:"Running your own restaurant kitchen (Kubernetes) vs using a cloud kitchen service that handles equipment and staff (Cloud Run/Fargate)." },
  // ───────── Observability & governance ─────────
  { l:"I", t:"Observability", q:"How do you monitor a cloud-native system end to end?",
    a:`- **Metrics**: service RED metrics, resource USE metrics, business KPIs; dashboards per service.
- **Logs**: structured JSON, centralised (CloudWatch Logs/ELK/Loki), correlated by trace ID, retention policies.
- **Traces**: OpenTelemetry instrumentation across HTTP and messaging, service maps.
- **Synthetic monitoring**: canary scripts hitting critical journeys.
- **Real user monitoring** for frontends.
- **Alerts** on SLO burn rates with runbooks.
- **Audit**: cloud API logs for security.`,
    k:"Metrics + logs + traces + synthetics, tied together by trace IDs and SLOs.",
    r:"A smart building with temperature sensors (metrics), a visitor logbook (logs), CCTV following a person between rooms (traces) and a guard doing regular rounds (synthetics)." },
  { l:"I", t:"Governance", q:"How do you govern many cloud accounts/projects?",
    a:`- Organisation structure (AWS Organizations, Azure Management Groups, GCP folders) with separate accounts/subscriptions per environment and team.
- Guardrails: service control policies/Azure Policy/Org Policies (deny unapproved regions, require encryption, block public buckets).
- Landing zones (Control Tower) with baseline networking, logging and security.
- Central identity (SSO), central logging and security tooling.
- Tagging standards, budgets, and IaC-only changes in production.`,
    k:"Isolated accounts + preventive guardrails + central visibility.",
    r:"A city with zoning laws: you can build freely within your plot, but you can't put a factory in a residential area." },
  // ───────── Design scenarios ─────────
  { l:"A", t:"Design", q:"Design a scalable, highly available web application in the cloud.",
    a:`1. **DNS + CDN + WAF** in front (Route 53 → CloudFront + WAF).
2. **Static frontend** (Angular) on object storage via CDN.
3. **API tier**: containers behind an L7 load balancer across 3 AZs, autoscaling on request rate.
4. **Async processing**: queues/streams for slow or spiky work, workers autoscaled on backlog.
5. **Data**: managed relational DB Multi-AZ + read replicas; Redis cache; object storage for files.
6. **Security**: private subnets, least-privilege roles, secrets manager, encryption.
7. **Observability**: metrics, logs, traces, SLO alerts.
8. **Delivery**: IaC + CI/CD with blue/green.
9. **DR**: automated backups, cross-region copies, documented and tested runbook.`,
    k:"Edge → stateless multi-AZ compute → managed data → async workers, all observable and automated.",
    r:"A well-run theme park: ticket gates spread the crowd (load balancer), many identical rides (instances), queues with fast-pass (async), and a control room watching everything (observability)." },
  { l:"A", t:"Design", q:"Design an IoT/telemetry ingestion platform in the cloud.",
    a:`- **Device connectivity**: MQTT/HTTPS via IoT Core/IoT Hub with per-device certificates.
- **Ingestion**: rules route messages to a stream (Kinesis/MSK/Event Hubs) partitioned by device ID.
- **Stream processing**: Flink/Kafka Streams/Lambda for validation, enrichment, anomaly detection, alerting.
- **Hot path**: alerts → notification service and WebSocket dashboards.
- **Storage**: time-series DB for recent data; raw data to object storage (Parquet) for analytics (Athena/BigQuery).
- **Device management**: shadows/twins, OTA updates.
- **Scale & cost**: batch writes, compression, tiered retention.
The same shape fits camera analytics, smart meters, fleet tracking and industrial sensors.`,
    k:"Secure device ingest → partitioned stream → hot alert path + cold analytics path.",
    r:"A city traffic system: thousands of sensors report to a central hub, urgent accidents trigger instant alerts, and all data is archived for planning new roads." },
  { l:"E", t:"Scenario", q:"Scenario: an entire Availability Zone fails. What happens to your system?",
    a:`If designed well:
- Load balancers stop routing to unhealthy targets in the failed AZ.
- Autoscaling launches replacement capacity in healthy AZs (ensure headroom: run at ≤ 66% with 3 AZs).
- Multi-AZ databases fail over automatically (~1–2 min for RDS); apps reconnect (connection pool validation, DNS TTL, retries).
- Kafka/MSK with replication factor 3 across AZs keeps partitions available.
- Monitoring alerts on elevated errors during failover; status page update.

Validate with AZ-failure game days (AWS FIS) — untested HA is hope, not design.`,
    k:"Multi-AZ everything + headroom + automatic failover + practised game days.",
    r:"A three-lane highway losing one lane: traffic slows briefly but keeps moving because the other lanes were built with enough capacity." },
  { l:"E", t:"Scenario", q:"Scenario: leadership asks you to move from on-prem to the cloud. How do you plan it?",
    a:`1. **Business case**: goals (agility, cost, resilience), constraints (compliance, data residency, skills).
2. **Discovery**: inventory apps, dependencies, data volumes, SLAs.
3. **Landing zone**: accounts, networking, identity, security baseline, IaC, CI/CD.
4. **Wave plan**: start with low-risk apps; choose an R per app (rehost/replatform/refactor).
5. **Skills**: training, pairing, cloud centre of excellence.
6. **Migrate in waves** with data replication, tested cutovers and rollbacks.
7. **Optimise**: right-size, autoscale, adopt managed services, FinOps.
8. **Measure**: DORA metrics, availability, cost per unit.`,
    k:"Foundation first, migrate in waves, then optimise.",
    r:"Relocating an office: set up the new building's power, security and IT first, move department by department, and only then redecorate." },
  { l:"I", t:"Cloud-Native", q:"What are managed services and why prefer them?",
    a:`Managed services (RDS, MSK, ElastiCache, SQS, Cognito, CloudWatch) offload undifferentiated operational work — provisioning, patching, backups, scaling, HA — to the provider.

Benefits: faster delivery, built-in reliability and security, smaller ops burden. Trade-offs: cost premium, less tuning control, provider limits and lock-in. For a small team, managed services let engineers focus on product features.`,
    k:"Let the provider run commodity infrastructure; you build differentiating features.",
    r:"Hiring a professional laundry service instead of buying industrial washing machines for your hotel — you focus on guests, not machines." },
  { l:"A", t:"Resilience", q:"How do you handle cloud provider throttling and service limits?",
    a:`- Know quotas (API rate limits, concurrency, IOPS) and request increases ahead of launches.
- Implement **exponential backoff with jitter** on throttling errors (AWS SDKs do this; tune retry modes).
- Batch API calls; cache responses (e.g. secrets, configuration).
- Use queues to smooth bursts.
- Monitor throttle metrics and quota utilisation with alerts.`,
    k:"Know limits, back off with jitter, batch and cache.",
    r:"A popular restaurant's booking system limiting reservations per minute — the polite approach is to wait a bit longer each time you're told 'busy', not to spam refresh." },
  { l:"I", t:"Fundamentals", q:"What are Regions and Availability Zones and how do they affect design?",
    a:`- **Region**: a geographic area with multiple isolated zones; choose for user latency, data residency laws, service availability and pricing.
- **Availability Zone**: physically separate data centres within a region, with independent power and networking, connected by low-latency links.

Design: spread instances and replicas across AZs for HA; use multiple regions for DR or global latency; be aware of cross-AZ/cross-region data transfer costs and latency.`,
    k:"AZs for high availability, regions for disaster recovery and locality.",
    r:"A bank with several branches in one city (AZs) so one flood doesn't close banking, plus a head office in another city (second region) for true disasters." }
]);
