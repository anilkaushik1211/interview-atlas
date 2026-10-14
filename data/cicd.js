ATLAS.addTrack({
  id: "cicd", title: "CI/CD & DevOps", icon: "🔁", color: "#0ea5e9", accent: "#7dd3fc",
  tagline: "Pipelines, release strategies, Kubernetes, IaC, observability & SRE",
  blurb: "The practices behind shipping safely and often: CI/CD design, branching, artifact management, testing in pipelines, deployment strategies, Kubernetes, infrastructure as code, monitoring, incident response and DevSecOps."
}, [
  // ───────── Culture ─────────
  { l:"B", t:"DevOps Culture", q:"What is DevOps and what problems does it solve?",
    a:`DevOps is a culture and set of practices that unite development and operations so teams can deliver software **faster and more reliably**. Instead of devs "throwing code over the wall" to ops, one team owns build, deploy and run.

Core practices: CI/CD, infrastructure as code, automated testing, monitoring/observability, small frequent releases, blameless post-mortems, and shared on-call.

It solves slow, risky, manual releases; "works on my machine" problems; finger-pointing during incidents; and long feedback loops.`,
    k:"You build it, you ship it, you run it — with automation.",
    r:"An old restaurant where chefs cook and a separate team serves, blaming each other for cold food, vs an open kitchen where the same team cooks, plates and watches diners' reactions." },
  { l:"B", t:"DevOps Culture", q:"What are the DORA metrics?",
    a:`Four research-backed measures of software delivery performance:
1. **Deployment frequency** – how often you release to production.
2. **Lead time for changes** – commit to production time.
3. **Change failure rate** – % of deployments causing incidents/rollbacks.
4. **Time to restore service (MTTR)** – how fast you recover.

(Recent reports add reliability.) Elite teams deploy on demand with low failure rates and recover in under an hour. Use them to improve the system, never to rank individuals.`,
    k:"Speed (frequency, lead time) + stability (failure rate, MTTR).",
    r:"Like measuring a delivery service: how often trucks leave, how long from order to doorstep, how many parcels arrive broken, and how fast broken ones get replaced." },
  { l:"B", t:"CI", q:"What is Continuous Integration and what makes it effective?",
    a:`CI means every developer merges small changes into the main branch frequently (at least daily), and every merge triggers an automated build and test run.

Effective CI needs: a fast pipeline (< 10 min feedback), reliable tests (no flakiness), a rule that a broken main is fixed immediately, short-lived branches, trunk always releasable, and visible results (PR status checks).`,
    k:"Integrate small, integrate often, keep main green.",
    r:"Assembling a jigsaw with friends: if everyone adds a piece and checks the fit right away, mistakes are tiny. If everyone builds a corner for a week alone, nothing fits at the end." },
  { l:"B", t:"CD", q:"Continuous Delivery vs Continuous Deployment?",
    a:`- **Continuous Delivery** – every change that passes the pipeline is *deployable*; a human decides when to release to production (often one click).
- **Continuous Deployment** – every passing change goes to production automatically, no human gate.

Continuous deployment requires very strong automated testing, feature flags, monitoring and automatic rollback. Many regulated or B2B teams practise continuous delivery with an approval step.`,
    k:"Delivery = always ready; Deployment = always shipped.",
    r:"Delivery: the pizza is always boxed and ready at the counter — you choose when to send the driver. Deployment: the driver leaves the moment it's boxed." },
  // ───────── Pipeline design ─────────
  { l:"I", t:"Pipeline Design", q:"What stages should a production CI/CD pipeline include?",
    a:`1. **Source** – trigger on PR/merge (webhook).
2. **Build** – compile, resolve dependencies (cached).
3. **Unit tests + coverage**.
4. **Static analysis** – lint, SonarQube quality gate.
5. **Security** – dependency scan (SCA), secret scan, SAST.
6. **Package** – versioned artifact / Docker image; image scan.
7. **Publish** – push to registry (ECR/Nexus).
8. **Deploy to dev/test** – automatic; run DB migrations.
9. **Integration / contract / E2E / performance tests**.
10. **Approval** (if continuous delivery).
11. **Production deploy** – blue/green or canary.
12. **Post-deploy verification** – smoke tests, SLO checks, auto-rollback.
13. **Notify** – Slack/Teams, release notes.`,
    k:"Fast checks first, one immutable artifact, progressive environments, verify after deploy.",
    r:"An airport: check-in (build), security scan (tests & scans), boarding gate (approval), take-off (deploy), and air traffic control watching the flight (monitoring)." },
  { l:"I", t:"Pipeline Design", q:"What does 'build once, deploy many' mean and why is it important?",
    a:`Build the artifact (JAR/Docker image) **once**, tag it immutably (version + git SHA), and promote that exact artifact through dev → QA → staging → prod. Only configuration differs per environment (env vars, Parameter Store, ConfigMaps).

Why: what you tested is exactly what you ship; no "it was rebuilt with a newer dependency" surprises; fast promotions and easy rollbacks (redeploy the previous tag).`,
    k:"Same artifact everywhere; only config changes.",
    r:"A sealed medicine batch goes through quality checks and then to pharmacies unchanged. You'd never re-manufacture it separately for each city." },
  { l:"I", t:"Pipeline Design", q:"How do you keep pipelines fast?",
    a:`- Run cheap checks first (lint, compile, unit tests) and fail fast.
- **Parallelise** independent stages (unit tests, scans, frontend/backend builds).
- **Cache** dependencies (~/.m2, node_modules, Docker layers/BuildKit).
- Build only what changed (monorepo affected detection).
- Split test suites and shard across agents.
- Use ephemeral, right-sized agents.
- Move slow suites (full E2E, performance) to nightly or post-merge pipelines.

Target: PR feedback in under ~10 minutes.`,
    k:"Fail fast, parallelise, cache, build only what changed.",
    r:"A car wash with multiple bays and a quick pre-rinse: dirty cars don't wait behind one slow full detail." },
  { l:"I", t:"Pipeline Design", q:"What is pipeline as code and why use it?",
    a:`The pipeline definition lives in the repository (Jenkinsfile, ‹.github/workflows/*.yml›, ‹.gitlab-ci.yml›, ‹buildspec.yml›) and is versioned with the application.

Benefits: code review for pipeline changes, history and rollback, branch-specific pipelines, reproducibility, and reuse via shared libraries/reusable workflows/templates.`,
    k:"Pipelines are code: reviewed, versioned, reusable.",
    r:"A recipe written in the cookbook (versioned, shareable) instead of living only in the head chef's memory." },
  { l:"I", t:"Pipeline Design", q:"Write a GitHub Actions workflow for a Spring Boot service.",
    a:`~~~yaml
name: ci
on:
  pull_request:
  push: { branches: [main] }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-java@v4
        with: { distribution: temurin, java-version: 21, cache: maven }
      - run: mvn -B verify
      - uses: actions/upload-artifact@v4
        with: { name: test-reports, path: target/surefire-reports }
  image:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    permissions: { id-token: write, contents: read }
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v4
        with: { role-to-assume: arn:aws:iam::123456789012:role/ci-deploy, aws-region: ap-south-1 }
      - uses: aws-actions/amazon-ecr-login@v2
      - run: |
          docker build -t $ECR/alarm-service:\${{ github.sha }} .
          docker push $ECR/alarm-service:\${{ github.sha }}
~~~

Note the **OIDC role** (no stored AWS keys), dependency caching and a separate image job gated on ‹main›.`,
    k:"Jobs, needs, caching, OIDC to AWS — no long-lived secrets.",
    r:"A relay race: the build runner must finish cleanly before the image runner takes the baton, and the image runner only runs on the main track." },
  { l:"I", t:"Pipeline Design", q:"Jenkins vs GitHub Actions vs GitLab CI — how do you choose?",
    a:`- **Jenkins** – self-hosted, extremely flexible, huge plugin ecosystem, needs maintenance (upgrades, security, agents).
- **GitHub Actions** – hosted, tightly integrated with GitHub PRs, marketplace actions, OIDC to clouds; minutes cost at scale; self-hosted runners possible.
- **GitLab CI** – integrated with GitLab, strong built-in DevSecOps features.
- **AWS CodePipeline/CodeBuild** – managed, IAM-native.

Choose based on where code lives, compliance (self-hosted?), team skills and maintenance budget.`,
    k:"Hosted for low maintenance; Jenkins for maximum control.",
    r:"Owning a car (Jenkins: freedom, but you service it) vs a ride service (Actions: just get in, pay per trip)." },
  // ───────── Branching & versioning ─────────
  { l:"I", t:"Branching", q:"Trunk-based development vs GitFlow?",
    a:`- **GitFlow** – long-lived ‹develop› and ‹main›, plus feature/release/hotfix branches. Suits scheduled releases and multiple supported versions; slower, more merge pain.
- **Trunk-based** – everyone integrates into ‹main› at least daily via short-lived branches; unfinished work hidden behind **feature flags**; releases from main. Best for CI/CD and high deployment frequency.

DORA research associates trunk-based development with higher performance.`,
    k:"Short-lived branches + feature flags = faster, safer delivery.",
    r:"GitFlow is like several teams writing separate drafts of a book and merging them before publication. Trunk-based is everyone editing one shared document, with unfinished chapters hidden." },
  { l:"I", t:"Branching", q:"What are feature flags and what are their risks?",
    a:`Feature flags (toggles) turn functionality on/off at runtime without redeploying (LaunchDarkly, Unleash, AWS AppConfig, a DB table).

Uses: dark launches, gradual rollouts (5% → 100%), A/B tests, kill switches, trunk-based development.

Risks: flag debt (old flags never removed), combinatorial testing complexity, configuration errors in production. Mitigate with ownership, expiry dates and cleanup tickets.`,
    k:"Decouple deploy from release — and clean up old flags.",
    r:"Light switches in a new house: the wiring (code) is installed everywhere, but you switch on rooms when ready — and you shouldn't leave 200 unlabeled switches forever." },
  { l:"B", t:"Versioning", q:"What is semantic versioning?",
    a:`‹MAJOR.MINOR.PATCH› (e.g. ‹2.4.1›):
- **MAJOR** – breaking changes.
- **MINOR** – backward-compatible features.
- **PATCH** – backward-compatible bug fixes.
Pre-release/build metadata: ‹2.5.0-rc.1+sha.a1b2c3›.

Automate with conventional commits (‹feat:›, ‹fix:›, ‹feat!:›) and tools like semantic-release; tag releases in Git and publish release notes.`,
    k:"Breaking.Feature.Fix.",
    r:"Like phone OS updates: a big new version may change how apps work (major), a feature drop adds things (minor), a security patch fixes bugs (patch)." },
  // ───────── Testing in CI ─────────
  { l:"I", t:"Testing", q:"Explain the test pyramid and where each test runs in CI/CD.",
    a:`- **Unit tests** (many, ms each) – every commit.
- **Integration / component tests** (Testcontainers, slices) – every PR.
- **Contract tests** – every PR for providers/consumers.
- **E2E/UI tests** (few, slow) – post-merge or before prod.
- **Performance, security (DAST), chaos** – nightly or before major releases.
- **Smoke tests / synthetic monitoring** – after every deployment and continuously in prod.

Push tests down the pyramid where possible: cheaper, faster, less flaky.`,
    k:"Many fast tests at the bottom, few slow ones at the top.",
    r:"Building a car: test each bolt (unit) constantly, test the engine assembly (integration) often, and take a full test drive (E2E) only before delivery." },
  { l:"A", t:"Testing", q:"How do you deal with flaky tests?",
    a:`Flaky tests erode trust ("just re-run it") and hide real failures.
1. Detect: track test pass rates over time; tools flag tests that pass on retry.
2. Quarantine: move them to a non-blocking suite with an owner and a deadline.
3. Fix root causes: shared state between tests, time/timezone dependence, ordering assumptions, sleeps instead of awaiting conditions (use Awaitility), external network calls (use WireMock/Testcontainers), insufficient resources on agents.
4. Prevent: run tests in random order, isolate data per test.`,
    k:"Measure, quarantine, fix the root cause — never normalise retries.",
    r:"A smoke alarm that goes off randomly: soon everyone ignores it — including the day there's real smoke." },
  // ───────── Deployment ─────────
  { l:"I", t:"Deployment Strategies", q:"Compare rolling, blue-green, canary and A/B deployments.",
    a:`- **Rolling** – replace instances gradually. Cheap; old and new run together briefly; rollback = roll forward/back gradually.
- **Blue-green** – a full new environment (green) next to the current (blue); switch traffic at once; instant rollback; needs double capacity briefly.
- **Canary** – route a small % of traffic (1% → 10% → 50% → 100%) to the new version while watching metrics; limits blast radius.
- **A/B testing** – route by user segment to compare business outcomes (not primarily a safety mechanism).
- **Shadow** – mirror traffic to the new version without returning its responses.

All require backward-compatible DB changes and APIs.`,
    k:"Rolling = gradual, blue-green = instant switch, canary = small blast radius.",
    r:"Renovating a restaurant: rolling = redo one table at a time; blue-green = open a fully ready second dining hall and move everyone; canary = seat a few regulars at the new menu first and watch their faces." },
  { l:"A", t:"Deployment Strategies", q:"How do you implement automated rollback?",
    a:`- Define health signals: error rate, p99 latency, saturation, business KPIs (alarms delivered per minute).
- Deploy progressively (canary/blue-green) with **analysis steps**: Argo Rollouts/Flagger analysis, AWS CodeDeploy with CloudWatch alarms, ECS deployment circuit breaker.
- If thresholds breach, traffic shifts back automatically to the previous version.
- Keep the previous artifact and configuration available; make DB migrations backward compatible so code rollback is safe.
- Alert the team and capture the failed release for analysis.`,
    k:"Progressive rollout + metric analysis + automatic traffic reversal.",
    r:"A car's lane-assist: as soon as sensors detect drifting out of the lane (bad metrics), it steers back automatically before you crash." },
  { l:"A", t:"Deployment Strategies", q:"How do you achieve zero-downtime deployments?",
    a:`- Multiple instances behind a load balancer with **readiness probes** — new instances take traffic only when ready.
- **Graceful shutdown** — stop accepting new requests, finish in-flight ones, connection draining/deregistration delay.
- Rolling/blue-green/canary strategies with enough spare capacity (maxSurge).
- **Backward-compatible** APIs, events and DB migrations (expand → migrate → contract).
- Sticky sessions avoided (stateless services, sessions in Redis/JWT).
- WebSocket clients reconnect with backoff.`,
    k:"Ready before serving, drain before stopping, compatible across versions.",
    r:"Changing a train's engine while it keeps running would be impossible — so you add a second engine, let it take over smoothly, then detach the old one." },
  { l:"I", t:"Deployment Strategies", q:"What is GitOps?",
    a:`GitOps uses Git as the single source of truth for the **desired state** of infrastructure and deployments. An agent in the cluster (Argo CD, Flux) continuously compares the live state to Git and reconciles differences.

- Deploy = merge a PR that bumps an image tag in a Helm values file.
- Rollback = git revert.
- Audit trail = Git history.
- CI never needs cluster credentials (pull-based).
- Drift (manual kubectl changes) is detected and corrected.`,
    k:"Desired state in Git, reconciled automatically.",
    r:"A thermostat: you set the desired temperature (Git); it constantly measures the room (cluster) and adjusts until they match." },
  // ───────── Artifacts & config ─────────
  { l:"I", t:"Artifacts", q:"How do you manage artifacts and dependencies in CI/CD?",
    a:`- Store build outputs in an artifact repository (Nexus, Artifactory, GitHub Packages, ECR/ECR Public) — not on build agents.
- Use immutable versions; never overwrite a release.
- Proxy public repositories (Maven Central, npm) to cache dependencies and protect against outages/supply-chain issues.
- Lock dependency versions (lockfiles, BOMs); update regularly with Dependabot/Renovate.
- Generate **SBOMs** (CycloneDX) and sign artifacts (Sigstore/Cosign).
- Retention policies to control storage.`,
    k:"Immutable, signed, traceable artifacts in a central repository.",
    r:"A warehouse with labelled, sealed boxes and a logbook, rather than parts lying around on workbenches." },
  { l:"I", t:"Configuration", q:"How do you handle configuration and secrets across environments?",
    a:`- Separate config from code (12-factor): environment variables, Spring profiles, ConfigMaps.
- Secrets in a vault: AWS Secrets Manager/Parameter Store, HashiCorp Vault, Kubernetes Secrets (encrypted, ideally via External Secrets Operator).
- Inject at runtime; never bake into images or commit to Git (use pre-commit secret scanning like gitleaks).
- CI uses short-lived credentials (OIDC federation) instead of stored keys.
- Rotate secrets automatically; audit access.`,
    k:"Config via environment, secrets via vault, credentials short-lived.",
    r:"The same hotel key-card system (code) everywhere, but each guest's card is programmed at check-in (runtime) — the codes are never printed on the room door." },
  // ───────── IaC ─────────
  { l:"I", t:"Infrastructure as Code", q:"What is Infrastructure as Code and what are its benefits?",
    a:`IaC defines infrastructure (networks, clusters, databases, IAM) in code — Terraform, CloudFormation, CDK, Pulumi — applied by pipelines.

Benefits: reproducible environments (dev mirrors prod), code review for infra changes, history/rollback, drift detection, faster disaster recovery, self-documentation, reuse via modules.

Practices: remote state with locking, small modules, plan reviewed in PRs, policy as code (OPA/Checkov), no manual console changes.`,
    k:"Infrastructure you can review, version, test and recreate.",
    r:"A building blueprint vs memory: with a blueprint you can rebuild the same house anywhere; without it, every rebuild is guesswork." },
  { l:"A", t:"Infrastructure as Code", q:"How does Terraform work (state, plan, apply)?",
    a:`- You declare resources in HCL; providers (aws, kubernetes) know how to create them.
- **State** records what Terraform manages and maps it to real resource IDs — store remotely (S3 + DynamoDB lock, or Terraform Cloud) and never edit by hand.
- ‹terraform plan› computes the diff between code, state and reality; ‹apply› executes it.
- **Modules** package reusable components; **workspaces/separate state per environment** isolate envs.
- Import existing resources; ‹-target› sparingly; handle drift via plan in CI on a schedule.

~~~bash
terraform init && terraform plan -out=tfplan && terraform apply tfplan
~~~`,
    k:"Code + state → plan (diff) → apply.",
    r:"A shopping list (code), your pantry inventory (state), and a diff of what to buy (plan) before going to the store (apply)." },
  { l:"I", t:"Infrastructure as Code", q:"What is configuration drift and how do you prevent it?",
    a:`Drift is when real infrastructure differs from what code declares — usually from manual console changes or hotfixes.

Prevent/detect: restrict console write access (read-only by default, break-glass roles), scheduled ‹terraform plan›/CloudFormation drift detection with alerts, GitOps reconciliation for Kubernetes, AWS Config rules, immutable infrastructure (replace rather than patch servers).`,
    k:"Lock down manual changes and detect drift continuously.",
    r:"Someone quietly moving furniture in a shared office: soon the floor plan is wrong and evacuations go badly. Regular walk-throughs (drift checks) catch it." },
  { l:"I", t:"Infrastructure as Code", q:"Mutable vs immutable infrastructure?",
    a:`- **Mutable** – servers are updated in place (SSH, patch, configure). Leads to snowflake servers that differ subtly.
- **Immutable** – never modify running servers; build a new image (AMI/container), deploy it, destroy the old one.

Containers and auto-scaling groups make immutable infrastructure natural: every deploy is a fresh, identical instance, rollback is redeploying the previous image.`,
    k:"Replace, don't repair.",
    r:"Disposable paper cups vs a shared mug everyone 'fixes': each new cup is identical and clean; the mug collects mysterious stains over time." },
  // ───────── Kubernetes ─────────
  { l:"I", t:"Kubernetes", q:"Explain Kubernetes architecture.",
    a:`- **Control plane**: API server (front door), etcd (cluster state store), scheduler (places pods on nodes), controller manager (reconciliation loops: deployments, replicas, nodes).
- **Worker nodes**: kubelet (runs pods), container runtime (containerd), kube-proxy/CNI (networking).
- You submit desired state (YAML) to the API server; controllers continuously make reality match it.

On AWS, **EKS** manages the control plane; you manage node groups or use Fargate.`,
    k:"Declarative desired state + controllers that reconcile it.",
    r:"An airport: the control tower (control plane) assigns gates and runways; ground crews at each gate (kubelets) handle the actual planes (pods)." },
  { l:"I", t:"Kubernetes", q:"Pod, Deployment, ReplicaSet, Service and Ingress — how do they relate?",
    a:`- **Pod** – one or more containers sharing network/storage; ephemeral.
- **ReplicaSet** – keeps N identical pods running.
- **Deployment** – manages ReplicaSets for rolling updates and rollbacks (what you usually create).
- **Service** – stable DNS name + virtual IP load-balancing across matching pods (ClusterIP, NodePort, LoadBalancer).
- **Ingress / Gateway API** – HTTP routing from outside into Services (host/path rules, TLS), implemented by an ingress controller (NGINX, AWS Load Balancer Controller → ALB).`,
    k:"Deployment → ReplicaSet → Pods, exposed by Service, routed by Ingress.",
    r:"A franchise: the Deployment is head office deciding '5 stores', the ReplicaSet is the regional manager keeping 5 open, Pods are stores, the Service is the single phone number, and Ingress is the mall directory." },
  { l:"I", t:"Kubernetes", q:"What are liveness, readiness and startup probes?",
    a:`- **Readiness** – is the pod ready for traffic? If failing, it's removed from Service endpoints (not restarted).
- **Liveness** – is the process healthy? If failing, kubelet restarts the container. Don't check external dependencies here.
- **Startup** – for slow-starting apps (JVM warm-up, migrations); disables liveness until startup succeeds.

~~~yaml
readinessProbe: { httpGet: { path: /actuator/health/readiness, port: 8080 }, periodSeconds: 5 }
livenessProbe:  { httpGet: { path: /actuator/health/liveness,  port: 8080 }, periodSeconds: 10, failureThreshold: 3 }
startupProbe:   { httpGet: { path: /actuator/health/liveness,  port: 8080 }, failureThreshold: 30, periodSeconds: 5 }
~~~`,
    k:"Readiness gates traffic, liveness restarts, startup gives time to boot.",
    r:"A shop: 'Open' sign on the door (readiness), the manager checking the cashier isn't passed out (liveness), and a grace period while the shop sets up in the morning (startup)." },
  { l:"I", t:"Kubernetes", q:"What are resource requests and limits?",
    a:`- **Requests** – guaranteed CPU/memory used by the scheduler to place pods.
- **Limits** – the maximum; exceeding memory → OOMKilled; exceeding CPU → throttled.

For JVMs: set memory request = limit, size heap with ‹-XX:MaxRAMPercentage›; be careful with low CPU limits (throttling slows GC and startup). Quality of Service classes: Guaranteed, Burstable, BestEffort.`,
    k:"Requests for scheduling, limits for protection — size the JVM inside them.",
    r:"Booking a hotel room (request: you're guaranteed it) with a mini-bar limit (limit: exceed it and you're cut off)." },
  { l:"I", t:"Kubernetes", q:"How does autoscaling work in Kubernetes (HPA, VPA, Cluster Autoscaler, KEDA)?",
    a:`- **HPA** – scales pod replicas on CPU/memory or custom metrics (requests/s).
- **KEDA** – event-driven scaling on external metrics: Kafka consumer lag, SQS queue length; can scale to zero.
- **VPA** – recommends/adjusts pod requests.
- **Cluster Autoscaler / Karpenter** – adds/removes nodes when pods can't be scheduled or nodes are idle.

For Kafka consumers, scale on **lag** (KEDA), capped at the partition count.`,
    k:"HPA/KEDA scale pods; Cluster Autoscaler/Karpenter scale nodes.",
    r:"A supermarket opening more checkout lanes when queues grow (HPA), calling in staff based on deliveries waiting outside (KEDA), and renting extra space when the store is full (cluster autoscaler)." },
  { l:"A", t:"Kubernetes", q:"What is Helm and why use it?",
    a:`Helm is the package manager for Kubernetes. A **chart** templates Kubernetes manifests; **values.yaml** parameterises them per environment; **releases** track installed versions with upgrade/rollback.

~~~bash
helm upgrade --install alarm-service ./charts/service -f values-prod.yaml --set image.tag=1.4.2-a1b2c3d
helm rollback alarm-service 7
~~~

Alternatives: Kustomize (overlay-based, no templating). Often combined with Argo CD for GitOps.`,
    k:"Templated, versioned Kubernetes packages with rollback.",
    r:"A cake recipe template where you just change 'flavour' and 'size' per order, and keep a record of every cake you've baked." },
  { l:"A", t:"Kubernetes", q:"A pod is in CrashLoopBackOff. How do you debug it?",
    a:`~~~bash
kubectl describe pod alarm-service-7c9f   # events: OOMKilled? probe failures? image pull errors?
kubectl logs alarm-service-7c9f --previous # logs from the crashed container
kubectl get events --sort-by=.lastTimestamp
~~~

Common causes: application exception on startup (missing config/secret, DB unreachable), OOMKilled (limits too low / heap too large), liveness probe killing a slow-starting app (add startup probe), wrong command/entrypoint, permission issues (read-only FS, non-root user). Reproduce locally with the same image and env.`,
    k:"describe → logs --previous → events → fix config, memory or probes.",
    r:"A car that stalls every time it starts: check the dashboard warnings (describe), the trip log from the last attempt (logs --previous), and the service history (events)." },
  // ───────── Observability & SRE ─────────
  { l:"I", t:"Observability", q:"What is the difference between monitoring and observability?",
    a:`- **Monitoring** – watching known metrics and alerting on known failure modes (CPU > 90%, 5xx > 1%).
- **Observability** – the ability to understand *unknown* problems from the system's outputs (high-cardinality logs, metrics and traces), answering new questions without shipping new code.

The three pillars — metrics, logs, traces — plus profiles and events, correlated by trace IDs (OpenTelemetry).`,
    k:"Monitoring tells you something is wrong; observability helps you find out why.",
    r:"A car's warning lights (monitoring) vs a mechanic's diagnostic computer that can read any sensor (observability)." },
  { l:"I", t:"Observability", q:"What are the golden signals and RED/USE methods?",
    a:`- **Four golden signals** (Google SRE): latency, traffic, errors, saturation.
- **RED** (for services): Rate, Errors, Duration.
- **USE** (for resources): Utilisation, Saturation, Errors — CPU, memory, disks, connection pools, thread pools.

Build a dashboard per service with RED, plus USE for its key resources (Hikari pool, JVM heap, Kafka consumer lag).`,
    k:"RED for services, USE for resources.",
    r:"A doctor's vital signs: pulse, blood pressure, temperature, oxygen — a few numbers that reveal most problems fast." },
  { l:"I", t:"Observability", q:"How do you design good alerts and avoid alert fatigue?",
    a:`- Alert on **symptoms users feel** (SLO burn rate, error rate, latency) rather than every cause (CPU spikes).
- Every alert must be **actionable** with a runbook link.
- Severity levels: page only for urgent user impact; tickets/Slack for the rest.
- Use multi-window burn-rate alerts to avoid flapping.
- Review alerts after incidents; delete noisy ones.`,
    k:"Few, actionable, symptom-based alerts with runbooks.",
    r:"A car alarm that goes off for every passing truck gets ignored; one that only sounds when the door is forced gets attention." },
  { l:"A", t:"SRE", q:"What is SRE and how do SLOs and error budgets guide releases?",
    a:`Site Reliability Engineering applies software engineering to operations: automate toil, measure reliability with **SLIs/SLOs**, and manage risk with **error budgets**.

Example: SLO 99.9% of alarm deliveries within 2 s per 30 days → error budget ≈ 43 minutes of "bad" time. While budget remains, ship features fast; when it's exhausted, freeze risky releases and prioritise reliability work. This turns "dev vs ops" arguments into data-driven decisions.`,
    k:"SLOs define 'reliable enough'; error budgets decide release pace.",
    r:"A monthly fun budget: spend it on risky adventures (new features) while you have it; once it's gone, it's quiet nights in (stability work) until next month." },
  { l:"I", t:"Incident Management", q:"Walk through how you handle a production incident.",
    a:`1. **Detect** – alert or user report; acknowledge.
2. **Triage** – severity, impact, scope; declare an incident; assign incident commander, comms lead.
3. **Mitigate first** – rollback, feature flag off, scale, failover — restore service before root cause.
4. **Communicate** – status page/stakeholder updates at regular intervals.
5. **Resolve** – confirm metrics are healthy.
6. **Post-mortem** (blameless) – timeline, root causes, contributing factors, action items with owners and dates.
7. **Follow through** – track actions to completion; update runbooks and alerts.`,
    k:"Mitigate fast, communicate often, learn blamelessly.",
    r:"A fire brigade: put out the fire first (mitigate), keep residents informed, then investigate the cause and install better smoke detectors." },
  { l:"I", t:"Incident Management", q:"What is a blameless post-mortem?",
    a:`A review after an incident focusing on **how the system allowed the failure**, not who to blame. People share honestly when they're safe from punishment.

Template: summary, impact, timeline, detection, root cause(s) and contributing factors (5 whys), what went well, what went badly, action items (owner + due date), lessons learned. Share widely so other teams learn.`,
    k:"Fix the system, not the person.",
    r:"Aviation safety culture: pilots report near-misses without fear, which is why flying keeps getting safer." },
  { l:"I", t:"Incident Management", q:"What are MTTD, MTTR and MTBF?",
    a:`- **MTTD** – mean time to detect a problem.
- **MTTR** – mean time to recover/restore service.
- **MTBF** – mean time between failures.

Improve MTTD with better alerts and synthetic monitoring; MTTR with runbooks, fast rollback, feature flags and good observability; MTBF with testing, resilience patterns and capacity planning.`,
    k:"Detect fast, recover fast, fail rarely.",
    r:"For a home's plumbing: how quickly you notice a leak (MTTD), how quickly it's fixed (MTTR), and how many months between leaks (MTBF)." },
  // ───────── DevSecOps ─────────
  { l:"I", t:"DevSecOps", q:"What is DevSecOps / shift-left security?",
    a:`Integrating security into every pipeline stage rather than a final audit:
- **Pre-commit**: secret scanning (gitleaks), IDE linters.
- **CI**: SAST (Sonar, Semgrep, CodeQL), SCA/dependency scanning (OWASP Dependency-Check, Snyk, Dependabot), IaC scanning (Checkov, tfsec), container scanning (Trivy).
- **CD**: image signing/verification, policy as code (OPA/Kyverno), DAST against staging (OWASP ZAP).
- **Runtime**: WAF, GuardDuty, runtime security (Falco), least-privilege IAM.`,
    k:"Automated security checks at every stage, as early as possible.",
    r:"Checking ingredients when they're delivered rather than tasting the finished wedding cake for problems." },
  { l:"A", t:"DevSecOps", q:"What is software supply-chain security (SBOM, signing, SLSA)?",
    a:`Attackers target dependencies and build systems (e.g. compromised packages, tampered build servers).

Defences:
- **SBOM** (CycloneDX/SPDX) listing every component and version — answer "are we affected by CVE-X?" in minutes.
- **Pin and verify** dependencies (lockfiles, checksums, private proxies).
- **Sign** artifacts and images (Sigstore/Cosign) and verify signatures at deploy time.
- **Provenance** attestations and **SLSA** levels for hardened, reproducible builds.
- Least-privilege, ephemeral CI runners; protected branches and required reviews.`,
    k:"Know what you ship (SBOM), prove where it came from (signing/provenance).",
    r:"Food packaging with an ingredients list (SBOM), a tamper-evident seal (signature) and a farm-to-shelf traceability record (provenance)." },
  { l:"I", t:"DevSecOps", q:"How do you handle a critical CVE (like Log4Shell) across many services?",
    a:`1. **Identify exposure** quickly with SBOMs/dependency graphs and image scans.
2. **Mitigate** immediately where possible (WAF rules, config flags, disable features).
3. **Patch**: bump the dependency (BOM/parent POM in shared libraries), rebuild, rescan, redeploy via pipelines — automated PRs (Renovate/Dependabot) across repos.
4. **Verify** in production (scanner + runtime checks).
5. **Communicate** status to stakeholders; post-mortem to speed up next time.`,
    k:"SBOM → mitigate → patch via pipelines → verify.",
    r:"A car manufacturer's recall: find every car with the faulty part (SBOM), issue a temporary safety notice (mitigate), replace the part at service centres (patch), confirm each car is fixed." },
  // ───────── Linux & scripting ─────────
  { l:"B", t:"Linux", q:"Which Linux skills does a DevOps-minded developer need?",
    a:`- Processes and services: ‹ps›, ‹top/htop›, ‹systemctl›, ‹journalctl›, signals (‹kill -TERM›).
- Files and permissions: ‹chmod›, ‹chown›, ‹find›, ‹tar›, ‹df/du›.
- Networking: ‹curl›, ‹ss/netstat›, ‹dig›, ‹nc›, ‹traceroute›, ‹iptables› basics.
- Text processing: ‹grep›, ‹awk›, ‹sed›, ‹jq›, pipes, redirection.
- Shell scripting: variables, loops, exit codes, ‹set -euo pipefail›.
- SSH, cron, environment variables, package managers.`,
    k:"Processes, files, networks, text — and safe shell scripts.",
    r:"Knowing your way around a car's engine bay: you may not be a mechanic, but you should check the oil, read the dashboard and change a tyre." },
  { l:"I", t:"Linux", q:"Write a safe bash deploy script skeleton.",
    a:`~~~bash
#!/usr/bin/env bash
set -euo pipefail                      # stop on errors, unset vars, pipe failures
ENV="\${1:?usage: deploy.sh <env> <tag>}"
TAG="\${2:?missing tag}"
log() { echo "[$(date -u +%FT%TZ)] $*"; }

trap 'log "deploy failed for $ENV $TAG"' ERR

log "Deploying alarm-service:$TAG to $ENV"
aws ecs update-service --cluster "analytics-$ENV" --service alarm-service \\
  --force-new-deployment --task-definition "alarm-service-$ENV:$TAG"
aws ecs wait services-stable --cluster "analytics-$ENV" --services alarm-service
log "Deployment stable"
~~~

Key points: strict mode, validated arguments, quoted variables, logging, ‹trap› on errors, waiting for stability before declaring success.`,
    k:"set -euo pipefail, validate inputs, quote everything, wait for stable.",
    r:"A pilot's pre-flight checklist: you don't take off if any check fails, and you confirm you're airborne before announcing success." },
  { l:"I", t:"Pipeline Design", q:"How do you run database integration tests in CI reliably?",
    a:`Use **Testcontainers** to start a real PostgreSQL/Kafka in Docker per test run, so tests match production behaviour without shared, polluted environments.

~~~java
@Testcontainers @SpringBootTest
class AlarmRepositoryIT {
  @Container @ServiceConnection
  static PostgreSQLContainer<?> pg = new PostgreSQLContainer<>("postgres:16");
  @Autowired AlarmRepository repo;
  @Test void savesAndFindsOpenAlarms() { ... }
}
~~~

CI needs Docker on the agent (or Testcontainers Cloud). Run Flyway migrations in the test so schema changes are verified too; reuse containers across tests for speed.`,
    k:"Real dependencies in disposable containers per run.",
    r:"Practising a recipe in a real kitchen with fresh ingredients each time, instead of a shared kitchen where someone else left a mess." },
  { l:"I", t:"Pipeline Design", q:"What are environments and promotion gates?",
    a:`Typical environments: **dev** (auto-deploy on merge), **QA/test** (automated + exploratory testing), **staging/pre-prod** (production-like, performance and smoke tests), **production**.

Promotion gates decide when an artifact may move forward: all tests green, quality gate passed, security scan clean, change approval (if required), staging smoke tests and SLO checks after deploy. Gates should be automated wherever possible; human approval only where it adds real value (regulated releases).`,
    k:"Same artifact moves through environments only when gates pass.",
    r:"Airport security checkpoints: you can't board until you've passed check-in, baggage screening and passport control — each gate verifies something different." },
  { l:"A", t:"Observability", q:"What is OpenTelemetry and why is it important?",
    a:`OpenTelemetry (OTel) is a vendor-neutral standard and set of SDKs/agents for generating and exporting **traces, metrics and logs**. You instrument once (Java agent auto-instruments Spring, JDBC, Kafka, HTTP clients) and export via OTLP to any backend: Jaeger, Tempo, Prometheus, Datadog, AWS X-Ray/CloudWatch.

Benefits: no vendor lock-in, consistent context propagation (W3C ‹traceparent›) across services and languages (Spring Boot + NestJS), and a collector pipeline for sampling, enrichment and routing.`,
    k:"Instrument once with OTel, send telemetry anywhere.",
    r:"A universal power adapter: plug any device (service) into any country's socket (monitoring backend) without rewiring." },
  // ───────── Scenarios ─────────
  { l:"E", t:"Scenario", q:"Scenario: your team deploys once a month and releases are painful. How do you improve?",
    a:`1. Measure DORA metrics to establish a baseline.
2. Automate the build/test/deploy pipeline end to end; remove manual steps one by one.
3. Shrink batch size: trunk-based development, small PRs, feature flags.
4. Strengthen automated tests (unit + Testcontainers + contract) so confidence doesn't depend on manual QA cycles.
5. Make deployments boring: immutable images, blue-green/canary, automated rollback.
6. Improve observability so issues are caught quickly after release.
7. Increase cadence gradually (bi-weekly → weekly → on demand), celebrating wins.`,
    k:"Measure, automate, shrink batches, build confidence, deploy more often.",
    r:"Going to the gym once a month hurts every time; going daily in small sessions makes it routine and painless." },
  { l:"E", t:"Scenario", q:"Scenario: a deployment caused a 30% error spike. Walk through your response.",
    a:`1. **Detect & confirm**: alerts fire; correlate with the deployment marker on dashboards.
2. **Mitigate**: roll back immediately (previous image/task definition or Helm revision) or disable the feature flag — don't debug in production while users suffer.
3. **Verify** error rates return to baseline.
4. **Communicate** to stakeholders.
5. **Investigate** in staging with logs/traces from the failed release: a missing config, incompatible API change, DB migration issue?
6. **Prevent**: add the missing test, add canary analysis on error rate, contract tests, deployment checklist update. Blameless post-mortem.`,
    k:"Roll back first, investigate second, prevent third.",
    r:"If a new recipe makes customers sick, you stop serving it immediately — you don't keep serving it while analysing ingredients." },
  { l:"E", t:"Scenario", q:"Scenario: design CI/CD for 20 microservices owned by 4 teams.",
    a:`- **Standardise** with shared pipeline templates (Jenkins shared library / reusable GitHub workflows) versioned centrally; each service has a tiny pipeline file.
- **Repo strategy**: polyrepo with templates or monorepo with affected-only builds.
- **Artifacts**: one image per service in ECR, immutable tags, SBOM + signing.
- **Environments**: dev auto-deploy on merge; staging with contract + E2E smoke; prod with canary + auto-rollback.
- **GitOps** (Argo CD) per environment repo, or CodeDeploy for ECS.
- **Contract tests** prevent cross-team breakage; consumer-driven contracts checked with ‹can-i-deploy›.
- **Observability** built into templates (tracing, dashboards, alerts per service).
- **Self-service**: teams own their pipelines within guardrails (policies, required checks).`,
    k:"Golden-path templates + independent deploys + contracts + GitOps.",
    r:"A franchise restaurant chain: every branch follows the same kitchen playbook and safety checks, but each manager opens and runs their own branch independently." },
  { l:"I", t:"Scenario", q:"How would you introduce Docker and CI/CD to a team that deploys manually?",
    a:`Start small and show value:
1. Containerise one service with a clean multi-stage Dockerfile; run it locally via Docker Compose with its database.
2. Add a basic CI job: build + unit tests on every PR.
3. Add image build + push to a registry.
4. Script deployment to a dev environment; then add staging and production with approvals.
5. Document, pair with teammates, and run a short workshop.
6. Measure before/after (deployment time, failed releases) to win support.

A common path: Jenkins- or Actions-automated builds first, then Docker images, then automated cloud deployments.`,
    k:"Pilot one service, automate step by step, prove the value.",
    r:"Introducing a dishwasher to a kitchen that hand-washes: start with one rack, show the time saved, then everyone wants it." }
]);
