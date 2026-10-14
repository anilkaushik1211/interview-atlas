ATLAS.addTrack({
  id: "devops", title: "Docker + Jenkins", icon: "🐳", color: "#06b6d4", accent: "#67e8f9",
  tagline: "Containers, images, Compose, pipelines, CI/CD, Git & Linux",
  blurb: "Containerising Spring Boot and Angular apps, writing production Dockerfiles, Jenkins declarative pipelines, shared libraries, quality gates, deployment strategies, Git workflows, Nginx and Linux troubleshooting."
}, [
  // ───────── Docker basics ─────────
  { l:"B", t:"Docker Basics", q:"What is Docker and what problem does it solve?",
    a:`Docker packages an application with its runtime, libraries and configuration into a portable **image** that runs as an isolated **container** on any host with a container runtime.

It solves "works on my machine": identical artifacts across dev, CI and production, fast startup, efficient resource use, and easy horizontal scaling on ECS/Kubernetes.

Under the hood: Linux **namespaces** (isolation of PIDs, network, mounts), **cgroups** (CPU/memory limits) and a **union filesystem** (layers).`,
    k:"Build once, run anywhere — isolated by namespaces, limited by cgroups." },
  { l:"B", t:"Docker Basics", q:"What is the difference between a container and a virtual machine?",
    a:`- A **VM** virtualises hardware via a hypervisor and runs a full guest OS kernel — strong isolation, GB-sized, boots in minutes.
- A **container** shares the host kernel and isolates processes — MB-sized, starts in milliseconds/seconds, higher density.

Containers have weaker isolation than VMs (shared kernel), so for multi-tenant security, platforms run containers inside lightweight VMs (AWS Fargate uses Firecracker microVMs).`,
    k:"VMs virtualise hardware; containers virtualise the OS." },
  { l:"B", t:"Docker Basics", q:"Image vs container vs registry?",
    a:`- **Image** – an immutable, layered template (filesystem + metadata like entrypoint, env, exposed ports), identified by tag and digest.
- **Container** – a running (or stopped) instance of an image with a writable layer on top.
- **Registry** – stores and distributes images: Docker Hub, AWS ECR, Nexus, Harbor.

~~~bash
docker build -t alarm-service:1.4.2 .
docker run -d -p 8080:8080 --name alarm alarm-service:1.4.2
docker push 123456789.dkr.ecr.ap-south-1.amazonaws.com/alarm-service:1.4.2
~~~`,
    k:"Image = class, container = object, registry = package repository." },
  { l:"B", t:"Docker Basics", q:"Explain the most common Docker commands.",
    a:`~~~bash
docker build -t app:1.0 .           # build image
docker images / docker ps -a        # list images / containers
docker run -d -p 8080:8080 -e SPRING_PROFILES_ACTIVE=dev app:1.0
docker logs -f <container>          # follow logs
docker exec -it <container> sh      # shell into a running container
docker stop / start / rm <container>
docker rmi <image>                  # remove image
docker inspect <container>          # full JSON metadata
docker stats                        # live CPU/memory usage
docker system prune -a              # clean unused data
docker tag / push / pull
~~~`,
    k:"build, run, ps, logs, exec, inspect, stats, prune." },
  { l:"B", t:"Dockerfile", q:"Explain the main Dockerfile instructions.",
    a:`- ‹FROM› – base image.
- ‹WORKDIR› – working directory.
- ‹COPY› / ‹ADD› – copy files (ADD also extracts archives and fetches URLs — prefer COPY).
- ‹RUN› – execute at build time (creates a layer).
- ‹ENV› / ‹ARG› – runtime env vars vs build-time args.
- ‹EXPOSE› – documents the port (doesn't publish it).
- ‹USER› – run as non-root.
- ‹HEALTHCHECK› – container health command.
- ‹ENTRYPOINT› / ‹CMD› – what runs when the container starts.
- ‹LABEL› – metadata (version, git commit).`,
    k:"FROM, COPY, RUN build the image; ENTRYPOINT/CMD start the container." },
  { l:"I", t:"Dockerfile", q:"CMD vs ENTRYPOINT? Shell form vs exec form?",
    a:`- ‹ENTRYPOINT› defines the executable; ‹CMD› provides default arguments (overridable with ‹docker run image args›).
- **Exec form** ‹["java","-jar","app.jar"]› runs the process directly as PID 1, so it receives SIGTERM — required for graceful shutdown.
- **Shell form** ‹java -jar app.jar› wraps it in ‹/bin/sh -c›; signals go to the shell, and the JVM may be killed abruptly after the timeout.

~~~dockerfile
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75", "-jar", "/app/app.jar"]
CMD ["--spring.profiles.active=prod"]
~~~`,
    k:"Use exec-form ENTRYPOINT so the app gets signals; CMD for defaults." },
  { l:"I", t:"Dockerfile", q:"Write a production-grade multi-stage Dockerfile for a Spring Boot app.",
    a:`~~~dockerfile
# ---- build stage ----
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -B -q dependency:go-offline            # cached unless pom changes
COPY src ./src
RUN mvn -B -q package -DskipTests && \\
    java -Djarmode=tools -jar target/*.jar extract --layers --launcher --destination /extracted

# ---- runtime stage ----
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S app && adduser -S app -G app
WORKDIR /app
COPY --from=build /extracted/dependencies/ ./
COPY --from=build /extracted/spring-boot-loader/ ./
COPY --from=build /extracted/snapshot-dependencies/ ./
COPY --from=build /extracted/application/ ./
USER app
EXPOSE 8080
ENV JAVA_TOOL_OPTIONS="-XX:MaxRAMPercentage=75 -XX:+ExitOnOutOfMemoryError"
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:8080/actuator/health/liveness || exit 1
ENTRYPOINT ["java", "org.springframework.boot.loader.launch.JarLauncher"]
~~~

Why: small JRE-only runtime, layered caching (dependencies rarely change), non-root user, container-aware heap sizing, health check, exec form.`,
    k:"Multi-stage + layered JAR + JRE base + non-root + container-aware JVM flags." },
  { l:"I", t:"Dockerfile", q:"How do you containerise an Angular app with Nginx?",
    a:`~~~dockerfile
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/analytics-center/browser /usr/share/nginx/html
EXPOSE 80
~~~

nginx.conf essentials: ‹try_files $uri $uri/ /index.html;› for SPA deep links, long cache headers for hashed assets, no-cache for ‹index.html›, gzip/brotli, and optionally reverse-proxy ‹/api› and ‹/ws› (with Upgrade headers) to the backend.`,
    k:"Node builds, Nginx serves — with SPA fallback and correct caching." },
  { l:"I", t:"Images", q:"How do image layers and build cache work?",
    a:`Each instruction that changes the filesystem creates a layer; layers are content-addressed and cached. If an instruction and its inputs haven't changed, Docker reuses the cached layer; once one layer changes, **all following layers rebuild**.

Optimise by ordering from least to most frequently changing: base image → OS packages → dependency manifests (‹pom.xml›, ‹package.json›) → dependency download → source code. Use ‹.dockerignore› (target/, node_modules/, .git) and BuildKit cache mounts (‹RUN --mount=type=cache,target=/root/.m2 mvn package›).`,
    k:"Order instructions by change frequency; cache dependencies separately from code." },
  { l:"I", t:"Images", q:"How do you reduce Docker image size?",
    a:`- Multi-stage builds (no build tools in runtime image).
- Slim bases: ‹-jre›, ‹alpine›, distroless (‹gcr.io/distroless/java21›), or ‹jlink› custom runtimes.
- Combine RUN steps and clean package caches in the same layer.
- ‹.dockerignore› to keep the context small.
- Don't copy unnecessary files; remove dev dependencies (‹npm ci --omit=dev›).
- Inspect with ‹docker history› and ‹dive›.

Smaller images = faster pulls/deploys and smaller attack surface.`,
    k:"Multi-stage + slim/distroless base + clean layers + .dockerignore." },
  { l:"I", t:"Networking", q:"Explain Docker networking modes.",
    a:`- **bridge** (default) – private network on the host; containers on a user-defined bridge resolve each other by name (Compose uses this).
- **host** – shares the host network stack (no isolation, no port mapping).
- **none** – no networking.
- **overlay** – multi-host networking (Swarm).
- **macvlan** – containers get their own MAC/IP on the LAN.

Port publishing ‹-p 8080:8080› maps host → container. In ECS ‹awsvpc› mode each task gets its own ENI and private IP.`,
    k:"User-defined bridges give DNS by container name; -p publishes ports." },
  { l:"I", t:"Storage", q:"Volumes vs bind mounts vs tmpfs?",
    a:`- **Volumes** – managed by Docker (‹docker volume create pgdata›), portable, best for persistent data (databases in dev).
- **Bind mounts** – map a host path into the container (‹-v ./src:/app/src›); great for local development hot reload, host-dependent.
- **tmpfs** – in-memory, non-persistent (secrets, scratch).

Containers are ephemeral: anything written to the container's writable layer is lost when it's removed. In production on AWS, use managed services (RDS, S3, EFS) rather than container storage.`,
    k:"Volumes for persistent data, bind mounts for dev, containers stay stateless." },
  { l:"I", t:"Compose", q:"What is Docker Compose and how do you use it for local development?",
    a:`Compose defines multi-container apps in YAML and runs them with one command.

~~~yaml
services:
  postgres:
    image: postgres:16
    environment: { POSTGRES_PASSWORD: dev, POSTGRES_DB: analytics }
    volumes: [ pgdata:/var/lib/postgresql/data ]
    healthcheck: { test: ["CMD", "pg_isready"], interval: 5s }
  kafka:
    image: apache/kafka:3.8.0
    ports: [ "9092:9092" ]
  alarm-service:
    build: ./alarm-service
    ports: [ "8080:8080" ]
    environment: { SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/analytics }
    depends_on: { postgres: { condition: service_healthy }, kafka: { condition: service_started } }
volumes: { pgdata: {} }
~~~

‹docker compose up -d›, ‹logs -f›, ‹down -v›. Spring Boot 3.1+ can start Compose services automatically (‹spring-boot-docker-compose›).`,
    k:"One YAML spins up the whole local stack with health-ordered startup." },
  { l:"A", t:"Security", q:"What are Docker security best practices?",
    a:`- Run as **non-root** (‹USER app›), read-only root filesystem where possible, drop Linux capabilities.
- Use minimal, trusted, pinned base images (by digest); rebuild regularly for patches.
- **Scan** images (Trivy, Grype, ECR enhanced scanning) in CI and fail on critical CVEs.
- Never bake secrets into images (they persist in layers) — inject at runtime (Secrets Manager/ECS secrets) or use BuildKit ‹--secret› for build-time credentials.
- Sign images (Cosign) and verify on deploy.
- Limit resources (memory/CPU) to contain noisy neighbours.
- Keep the Docker socket away from containers.`,
    k:"Non-root, minimal, scanned, signed, secret-free images." },
  { l:"A", t:"Troubleshooting", q:"A container keeps restarting. How do you troubleshoot it?",
    a:`1. ‹docker ps -a› → exit code: 137 = killed (often **OOM**), 143 = SIGTERM, 1 = app error, 127 = command not found.
2. ‹docker logs <id>› (or CloudWatch logs on ECS) for stack traces / missing config.
3. ‹docker inspect› → ‹State.OOMKilled›, health-check status, env vars, entrypoint.
4. Run interactively with an overridden entrypoint (‹docker run -it --entrypoint sh image›) to inspect files/permissions.
5. Check health check command/timing — a failing HEALTHCHECK or ALB check causes restarts by the orchestrator.
6. Check dependencies (DB/Kafka reachability, DNS) and resource limits (JVM heap vs container memory).`,
    k:"Exit code → logs → inspect (OOMKilled/health) → reproduce interactively." },
  { l:"A", t:"JVM in Containers", q:"How do you run the JVM correctly inside containers?",
    a:`Modern JVMs (10+, backported to 8u191) are **container-aware**: they read cgroup limits for CPU and memory.

- Size heap relative to the container: ‹-XX:MaxRAMPercentage=70-75› (leave room for metaspace, threads, direct buffers, code cache).
- Set container memory limit explicitly; without it the JVM sees host memory.
- ‹-XX:+ExitOnOutOfMemoryError› so the orchestrator restarts a broken instance.
- CPU limits affect GC threads and ‹availableProcessors()›; very low CPU limits slow startup.
- Improve startup with CDS/AppCDS, Spring AOT, CRaC or GraalVM native images.`,
    k:"Container-aware JVM + MaxRAMPercentage + ExitOnOutOfMemoryError." },
  { l:"I", t:"Docker Basics", q:"What is the container lifecycle and restart policies?",
    a:`States: created → running → paused/unpaused → stopped (exited) → removed.

‹docker stop› sends SIGTERM, waits (default 10 s), then SIGKILL. ‹docker kill› sends SIGKILL immediately.

Restart policies: ‹no›, ‹on-failure[:max]›, ‹always›, ‹unless-stopped›. In production, orchestrators (ECS, Kubernetes) handle restarts and replacement instead.`,
    k:"SIGTERM, grace period, SIGKILL — design apps to shut down within the grace period." },
  { l:"A", t:"Docker Basics", q:"What are namespaces and cgroups?",
    a:`- **Namespaces** isolate what a process can see: PID (own process tree), NET (own interfaces/ports), MNT (own filesystem view), UTS (hostname), IPC, USER (UID mapping), cgroup.
- **cgroups** limit and account resources: CPU shares/quotas, memory limits (OOM kill when exceeded), block I/O, PIDs.

Together they make a process look like a separate machine while sharing the host kernel.`,
    k:"Namespaces = isolation, cgroups = resource limits." },
  { l:"I", t:"Registry", q:"How do you version and tag images?",
    a:`- Tag with immutable, traceable versions: semantic version + git SHA (‹alarm-service:1.4.2-a1b2c3d›) or build number.
- Avoid deploying ‹latest› — non-deterministic, breaks rollbacks.
- Enable **tag immutability** in ECR and lifecycle policies to expire old images.
- Promote the same image digest across environments (dev → staging → prod) instead of rebuilding.`,
    k:"Immutable tags (version + SHA), never deploy latest, promote by digest." },
  { l:"I", t:"Docker Basics", q:"COPY vs ADD, ARG vs ENV, EXPOSE vs -p?",
    a:`- ‹COPY› copies local files; ‹ADD› can also extract tarballs and download URLs — prefer COPY for clarity.
- ‹ARG› exists only at build time (‹--build-arg VERSION=1.2›); ‹ENV› persists into the running container.
- ‹EXPOSE› is documentation/metadata; ‹-p host:container› actually publishes the port.`,
    k:"COPY over ADD; ARG build-time, ENV runtime; EXPOSE documents, -p publishes." },
  // ───────── Kubernetes quick ─────────
  { l:"I", t:"Orchestration", q:"Docker vs Kubernetes vs ECS — how do they relate?",
    a:`Docker builds and runs containers on one host. **Orchestrators** run containers across a cluster: scheduling, scaling, self-healing, service discovery, rolling deploys, secrets.

- **Kubernetes** (EKS on AWS) – portable, rich ecosystem, more operational complexity. Key objects: Pod, Deployment, Service, Ingress, ConfigMap, Secret, HPA.
- **Amazon ECS** – AWS-native orchestrator (task definitions, services), simpler; with **Fargate** no servers to manage.

A common setup: services containerised with Docker, built by CI, and deployed to ECS or EKS on AWS.`,
    k:"Docker packages; Kubernetes/ECS orchestrate at scale." },
  { l:"I", t:"Orchestration", q:"What are the main Kubernetes objects an application engineer should know?",
    a:`- **Pod** – smallest unit (one or more containers).
- **Deployment** – desired replicas, rolling updates, rollback.
- **Service** – stable virtual IP/DNS and load balancing to pods.
- **Ingress / Gateway API** – HTTP routing from outside.
- **ConfigMap / Secret** – configuration and sensitive values.
- **HPA** – horizontal autoscaling.
- **Liveness/readiness/startup probes**, resource **requests/limits**.
- **StatefulSet**, **Job/CronJob**, **Namespace**, **PodDisruptionBudget**.`,
    k:"Deployment manages pods, Service exposes them, Ingress routes to them." },
  // ───────── Jenkins ─────────
  { l:"B", t:"CI/CD", q:"What is CI/CD and why is it important?",
    a:`- **Continuous Integration** – developers merge small changes frequently; every change is automatically built and tested.
- **Continuous Delivery** – every passing build produces a deployable artifact; release to production is a button press.
- **Continuous Deployment** – every passing change goes to production automatically.

Benefits: faster feedback, fewer integration problems, consistent and repeatable releases, smaller and safer deployments, higher quality. Teams with good CI/CD release small changes daily instead of risky big-bang releases.`,
    k:"Integrate often, keep main always releasable, automate deployment." },
  { l:"B", t:"Jenkins", q:"What is Jenkins and how does its architecture work?",
    a:`Jenkins is an open-source automation server for CI/CD, extensible through 1,800+ plugins.

Architecture: a **controller** (formerly master) schedules builds, stores configuration and serves the UI; **agents** (nodes) execute builds. Agents can be static VMs, Docker containers, Kubernetes pods or EC2 instances launched on demand. Executors define how many builds an agent runs in parallel.

Best practice: run no builds on the controller; use ephemeral containerised agents for clean, reproducible environments.`,
    k:"Controller orchestrates, agents execute — keep builds off the controller." },
  { l:"I", t:"Jenkins", q:"Declarative vs scripted pipelines?",
    a:`- **Declarative** – structured ‹pipeline { agent; stages; post }› syntax, validation, easier to read; recommended default.
- **Scripted** – Groovy ‹node { stage(...) { } }›, full programming flexibility; harder to maintain.

You can embed scripted logic inside declarative with ‹script { }› blocks, and move complex logic into **shared libraries**.`,
    k:"Declarative by default; scripted logic in script blocks or shared libraries." },
  { l:"I", t:"Jenkins", q:"Write a declarative Jenkinsfile for a Spring Boot microservice.",
    a:`~~~groovy
pipeline {
  agent { label 'docker' }
  options { timestamps(); timeout(time: 30, unit: 'MINUTES'); buildDiscarder(logRotator(numToKeepStr: '20')) }
  environment {
    REGISTRY = '123456789.dkr.ecr.ap-south-1.amazonaws.com'
    IMAGE    = "\${REGISTRY}/alarm-service"
    TAG      = "\${env.BUILD_NUMBER}-\${env.GIT_COMMIT.take(7)}"
  }
  stages {
    stage('Build & Unit Test') {
      steps { sh 'mvn -B clean verify' }
      post { always { junit 'target/surefire-reports/*.xml'; jacoco() } }
    }
    stage('Static Analysis') {
      steps { withSonarQubeEnv('sonar') { sh 'mvn -B sonar:sonar' } }
    }
    stage('Quality Gate') {
      steps { timeout(time: 5, unit: 'MINUTES') { waitForQualityGate abortPipeline: true } }
    }
    stage('Docker Build & Scan') {
      steps {
        sh "docker build -t \${IMAGE}:\${TAG} ."
        sh "trivy image --exit-code 1 --severity CRITICAL \${IMAGE}:\${TAG}"
      }
    }
    stage('Push') {
      steps {
        sh "aws ecr get-login-password | docker login --username AWS --password-stdin \${REGISTRY}"
        sh "docker push \${IMAGE}:\${TAG}"
      }
    }
    stage('Deploy to Dev') {
      when { branch 'develop' }
      steps { sh "./deploy.sh dev \${TAG}" }
    }
    stage('Deploy to Prod') {
      when { branch 'main' }
      steps {
        input message: 'Deploy to production?', ok: 'Deploy'
        sh "./deploy.sh prod \${TAG}"
      }
    }
  }
  post {
    failure { slackSend channel: '#builds', color: 'danger', message: "FAILED: \${env.JOB_NAME} #\${env.BUILD_NUMBER}" }
    always  { cleanWs() }
  }
}
~~~`,
    k:"Build → test → analyse → gate → image → scan → push → deploy, with notifications." },
  { l:"I", t:"Jenkins", q:"How are Jenkins builds triggered?",
    a:`- **Webhooks** from GitHub/GitLab/Bitbucket on push/PR (preferred — instant, no polling).
- **Poll SCM** (‹pollSCM('H/5 * * * *')›) — legacy.
- **Cron** (‹cron('H 2 * * *')›) for nightly builds/scans.
- **Upstream/downstream** job triggers.
- **Manual / parameterized** builds, remote API calls.
- **Multibranch pipelines** automatically discover branches and PRs with a Jenkinsfile.`,
    k:"Webhooks + multibranch pipelines for automatic, per-branch CI." },
  { l:"I", t:"Jenkins", q:"What is a multibranch pipeline?",
    a:`A multibranch pipeline scans a repository and creates a pipeline job for every branch and pull request that contains a Jenkinsfile. Branches build automatically on push; PRs report status checks back to GitHub; jobs are removed when branches are deleted.

Combined with ‹when { branch 'main' }› and ‹changeRequest()› conditions, one Jenkinsfile handles feature-branch CI, PR validation and main-branch deployments.`,
    k:"One Jenkinsfile, automatic jobs per branch and PR." },
  { l:"I", t:"Jenkins", q:"How do you manage credentials and secrets in Jenkins?",
    a:`- Store them in the **Jenkins Credentials** store (encrypted) or an external vault (HashiCorp Vault, AWS Secrets Manager plugin).
- Inject with ‹withCredentials› so values are masked in logs:

~~~groovy
withCredentials([usernamePassword(credentialsId: 'nexus', usernameVariable: 'U', passwordVariable: 'P')]) {
  sh 'mvn deploy -s settings.xml -Dnexus.user=$U -Dnexus.pass=$P'
}
~~~

- Use single-quoted ‹sh› strings so Groovy doesn't interpolate secrets into the command log.
- Prefer IAM roles on EC2/EKS agents over long-lived AWS keys.
- Scope credentials to folders; audit and rotate.`,
    k:"Credentials store/vault + withCredentials + IAM roles — never hardcode." },
  { l:"A", t:"Jenkins", q:"What are Jenkins shared libraries and why use them?",
    a:`Shared libraries hold reusable pipeline code in a separate Git repo (‹vars/›, ‹src/›, ‹resources/›) and are loaded with ‹@Library('company-pipeline@v2') _›.

~~~groovy
// vars/springServicePipeline.groovy
def call(Map cfg) {
  pipeline {
    agent { label 'docker' }
    stages {
      stage('Build') { steps { sh 'mvn -B verify' } }
      stage('Image') { steps { dockerBuildAndPush(cfg.name) } }
    }
  }
}
// Jenkinsfile in each service:
@Library('company-pipeline@v2') _
springServicePipeline(name: 'alarm-service')
~~~

Benefits: consistent pipelines across dozens of microservices, one place to fix/upgrade, versioned changes.`,
    k:"Standardise pipelines across services with versioned shared libraries." },
  { l:"I", t:"Jenkins", q:"How do you speed up a slow Jenkins pipeline?",
    a:`- Run independent stages in **parallel** (unit tests, lint, security scans).
- Cache dependencies (Maven ‹.m2›, npm cache) on agents or via volumes; Docker layer caching / BuildKit.
- Build only what changed in monorepos (‹changeset› conditions, Nx affected).
- Split slow test suites; fail fast on cheap checks first.
- Use more/larger ephemeral agents; avoid doing work on the controller.
- Skip redundant steps (don't rebuild the image per environment — promote it).

~~~groovy
stage('Checks') { parallel {
  stage('Unit')  { steps { sh 'mvn -B test' } }
  stage('Lint')  { steps { sh 'npm run lint' } }
  stage('Deps')  { steps { sh 'mvn -B org.owasp:dependency-check-maven:check' } }
} }
~~~`,
    k:"Parallelise, cache, build only what changed, fail fast." },
  { l:"I", t:"Jenkins", q:"What does the post section do and how do you handle failures?",
    a:`‹post› runs after stages based on build status: ‹always›, ‹success›, ‹failure›, ‹unstable›, ‹changed›, ‹fixed›, ‹aborted›, ‹cleanup›.

Use it to publish test reports (‹junit›), archive artifacts, send Slack/email notifications, clean workspaces and roll back failed deployments. Inside steps, use ‹catchError›, ‹retry(3)› for flaky infrastructure calls, and ‹timeout› to avoid hung builds.`,
    k:"post handles reporting, notifications, cleanup and rollback." },
  { l:"I", t:"Jenkins", q:"How do you use Docker agents in Jenkins pipelines?",
    a:`Run each stage inside a container image so build tools are versioned and isolated:

~~~groovy
pipeline {
  agent none
  stages {
    stage('Backend') { agent { docker { image 'maven:3.9-eclipse-temurin-21'; args '-v $HOME/.m2:/root/.m2' } }
                       steps { sh 'mvn -B verify' } }
    stage('Frontend') { agent { docker { image 'node:22-alpine' } }
                        steps { sh 'npm ci && npm run build' } }
  }
}
~~~

On Kubernetes, the Kubernetes plugin launches pod agents per build — clean, scalable and cheap.`,
    k:"Containerised agents = reproducible toolchains per stage." },
  { l:"I", t:"Jenkins", q:"How do you implement manual approvals and environment promotion?",
    a:`- ‹input› step for human approval (restrict with ‹submitter: 'release-managers'›), wrapped in a ‹timeout› so pipelines don't hang forever. Don't hold an agent while waiting (‹agent none› at that stage).
- Promote the **same image tag** from dev → staging → prod; only config differs.
- Gate promotions on automated checks: smoke tests, SLO metrics, security scan results.
- Record deployments (Jenkins build description, Git tags, release notes).`,
    k:"Promote one immutable artifact through gated environments." },
  { l:"I", t:"Jenkins", q:"What is a quality gate and which checks belong in a CI pipeline?",
    a:`A quality gate blocks the pipeline when quality criteria fail.

Typical checks:
- Compile and unit tests (with coverage thresholds on new code).
- Static analysis (SonarQube: bugs, code smells, duplication).
- Dependency vulnerabilities (OWASP Dependency-Check, Snyk) and secret scanning (gitleaks).
- Container image scanning (Trivy).
- Integration tests (Testcontainers), contract tests.
- Linting/formatting for Angular (ESLint, Prettier), bundle budgets.`,
    k:"Automated gates for tests, coverage, code quality and security." },
  { l:"A", t:"Jenkins", q:"How do you secure and maintain a Jenkins installation?",
    a:`- Enable authentication (SSO/LDAP) and role-based authorization (Matrix/Role Strategy plugin).
- Keep Jenkins core and plugins updated; minimise plugins.
- No builds on the controller; ephemeral agents; restrict script approvals.
- Credentials in vaults, masked; CSRF protection on; HTTPS only.
- Back up ‹JENKINS_HOME› (or manage config as code with **JCasC** and job DSL).
- Monitor queue length, executor usage, disk space.`,
    k:"SSO + RBAC, patched plugins, config as code, controller does no builds." },
  { l:"I", t:"Jenkins", q:"How do you pass data between stages and archive artifacts?",
    a:`- Stages in the same pipeline share the workspace on the same agent; across agents use ‹stash›/‹unstash› for small files.
- ‹archiveArtifacts artifacts: 'target/*.jar', fingerprint: true› keeps build outputs.
- Store real release artifacts in a repository (Nexus/Artifactory/ECR/S3), not Jenkins.
- Use ‹env.VAR = value› inside ‹script› blocks to pass values like the image tag.`,
    k:"stash for small hand-offs, artifact repos for real outputs." },
  { l:"A", t:"CI/CD", q:"Design an end-to-end CI/CD pipeline for Spring Boot + Angular on AWS.",
    a:`1. **Commit** → GitHub webhook → Jenkins multibranch pipeline.
2. **CI**: backend ‹mvn verify› (unit + Testcontainers), frontend ‹npm ci && npm test && ng build›, SonarQube gate, dependency + secret scanning.
3. **Package**: multi-stage Docker images tagged with version + SHA; Trivy scan; push to **ECR**. Angular static build → **S3** + CloudFront invalidation (or Nginx image).
4. **Deploy dev** automatically: update ECS task definition / Helm chart; run DB migrations (Flyway) first; smoke tests.
5. **Staging**: same image, integration + performance tests.
6. **Prod**: manual approval, blue/green or canary (CodeDeploy for ECS), automated rollback on CloudWatch alarms.
7. **Observe**: dashboards, alerts, release annotations; Slack notifications.

Infrastructure via Terraform/CloudFormation in its own pipeline.`,
    k:"Test → scan → immutable image → ECR → gated environments → blue/green → observe." },
  { l:"A", t:"CI/CD", q:"How do you handle database migrations in CI/CD?",
    a:`- Versioned migrations (Flyway/Liquibase) in the same repo as the code.
- Run migrations as a separate pipeline step or init task before the new version rolls out — not concurrently from many instances (Flyway uses a lock table, but separate steps are clearer).
- Make migrations **backward compatible** with the currently running version (expand/contract) so rollbacks don't require schema rollbacks.
- Test migrations against a production-like copy; time them for big tables.`,
    k:"Backward-compatible migrations, run once, before the rollout." },
  { l:"I", t:"CI/CD", q:"What deployment strategies have you used and how do rollbacks work?",
    a:`- **Rolling update** – gradual replacement (ECS minimumHealthyPercent/maximumPercent).
- **Blue/green** – new stack beside old, switch the load balancer target group, rollback = switch back.
- **Canary** – small percentage first (CodeDeploy canary configs, ALB weighted target groups).
- **Feature flags** – decouple deployment from release.

Rollback should be fast and boring: redeploy the previous immutable image tag/task definition; keep DB changes backward compatible.`,
    k:"Rollback = redeploy the previous immutable version." },
  // ───────── Git ─────────
  { l:"B", t:"Git", q:"Explain common Git workflows (GitFlow vs trunk-based).",
    a:`- **GitFlow** – ‹main›, ‹develop›, ‹feature/*›, ‹release/*›, ‹hotfix/*› branches; good for scheduled releases, heavier process.
- **GitHub Flow** – short-lived feature branches + PRs into ‹main›, deploy from main.
- **Trunk-based** – very short-lived branches (or direct commits) to trunk, feature flags for unfinished work; best for continuous delivery.

As a lead I enforce PR reviews, branch protection, required CI checks and conventional commit messages.`,
    k:"Short-lived branches + PR checks; trunk-based for fastest delivery." },
  { l:"I", t:"Git", q:"merge vs rebase vs squash vs cherry-pick?",
    a:`- **merge** – combines histories with a merge commit; preserves context.
- **rebase** – replays commits on top of another branch for a linear history; never rebase shared/public branches.
- **squash** – combines a branch's commits into one when merging a PR.
- **cherry-pick** – applies a specific commit onto another branch (hotfix backports).
- ‹git revert› creates an inverse commit (safe on shared branches); ‹git reset› moves the branch pointer (rewrites local history).`,
    k:"Rebase local work, merge/squash shared work, revert on shared branches." },
  { l:"I", t:"Git", q:"How do you resolve merge conflicts and recover lost work?",
    a:`Conflicts: ‹git status› to list files, edit conflict markers, run tests, ‹git add› and continue (‹git merge --continue› / ‹git rebase --continue›). Use ‹git mergetool› or IDE tools; communicate with the other author for logic conflicts.

Recovery: ‹git reflog› shows where HEAD has been — ‹git reset --hard HEAD@{2}› or create a branch from a lost commit. ‹git stash› saves work in progress; ‹git bisect› finds the commit that introduced a bug.`,
    k:"reflog rescues 'lost' commits; bisect finds bad ones." },
  // ───────── Linux & Nginx ─────────
  { l:"I", t:"Linux", q:"Which Linux commands do you use for production troubleshooting?",
    a:`~~~bash
top / htop / top -H -p <pid>     # CPU per process / thread
free -m ; df -h ; du -sh *       # memory, disk
ps aux | grep java               # processes
ss -tulpn  (or netstat)          # listening ports
curl -v http://localhost:8080/actuator/health
tail -f app.log ; grep -i error app.log | tail -50
journalctl -u myservice -f       # systemd logs
lsof -p <pid> | wc -l            # open file descriptors
dig / nslookup host              # DNS
traceroute / telnet host 5432    # connectivity
jcmd <pid> Thread.print ; jstat -gc <pid> 1000
~~~`,
    k:"top, df, ss, curl, tail/grep, journalctl, jcmd." },
  { l:"I", t:"Nginx", q:"How do you use Nginx as a reverse proxy for Spring Boot and WebSockets?",
    a:`~~~nginx
upstream api { server alarm-service:8080; keepalive 32; }
server {
  listen 443 ssl http2;
  location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; }
  location /api/ {
    proxy_pass http://api;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_read_timeout 30s;
  }
  location /ws/ {
    proxy_pass http://api;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 3600s;               # long-lived WebSocket
  }
}
~~~

Also configure ‹server.forward-headers-strategy=framework› in Spring so redirects and links use the original scheme/host.`,
    k:"Proxy /api, upgrade /ws, SPA fallback for the Angular app." },
  { l:"A", t:"CI/CD", q:"What is GitOps and infrastructure as code?",
    a:`**IaC** – infrastructure defined in version-controlled code (Terraform, CloudFormation, CDK), reviewed via PRs, applied by pipelines; reproducible environments, drift detection.

**GitOps** – Git is the source of truth for desired deployment state; an in-cluster agent (Argo CD, Flux) continuously reconciles the cluster to match Git. Deploy = merge a PR changing the image tag. Benefits: audit trail, easy rollback (git revert), no cluster credentials in CI.`,
    k:"Everything as code, Git as the source of truth, automated reconciliation." },
  { l:"E", t:"Scenario", q:"Scenario: builds pass in Jenkins but the app fails in production. How do you prevent this?",
    a:`Root causes are usually environment differences:
- Config/secrets differ → validate config at startup, keep config in versioned parameter stores, staging mirrors prod.
- Different artifact → build once, promote the same image digest.
- Missing integration coverage → Testcontainers and contract tests in CI; smoke tests after each deploy.
- Data/scale differences → performance tests with realistic data; migrations tested on prod-sized copies.
- Observability → canary deployments with automated rollback on error-rate/latency alarms.`,
    k:"Same artifact, prod-like staging, smoke tests, canaries with auto-rollback." },
  { l:"E", t:"Scenario", q:"Scenario: Jenkins agents run out of disk space frequently. What do you do?",
    a:`Immediate: clean workspaces (‹cleanWs()› in post), prune Docker (‹docker system prune -af --filter until=24h›), discard old builds (‹buildDiscarder›).

Long term: ephemeral containerised/Kubernetes agents that are destroyed after each build, shared dependency caches instead of per-workspace copies, artifact storage in Nexus/S3 rather than Jenkins, disk-usage monitoring with alerts, and scheduled cleanup jobs.`,
    k:"Ephemeral agents + cleanup in post + external artifact storage + monitoring." },
  { l:"I", t:"Docker Basics", q:"What is a .dockerignore file and why does it matter?",
    a:`It excludes files from the build context sent to the Docker daemon (like ‹.gitignore›). Without it, ‹target/›, ‹node_modules/›, ‹.git›, IDE files and local secrets (‹.env›) may be sent and even copied into images — slowing builds, invalidating cache and leaking secrets.`,
    k:"Smaller context, faster builds, no accidental secrets." },
  { l:"A", t:"Images", q:"What are distroless images and jlink custom runtimes?",
    a:`- **Distroless** images contain only the app and its runtime dependencies — no shell or package manager — reducing size and attack surface (harder to debug; use ephemeral debug containers).
- **jlink** builds a minimal Java runtime with only the modules your app needs (‹jdeps --print-module-deps› → ‹jlink --add-modules ...›), producing ~50–80 MB runtimes.

Both shrink CVE counts and pull times.`,
    k:"Ship only what runs: distroless or jlink runtimes." },
  { l:"I", t:"Docker Basics", q:"How do you debug networking between containers?",
    a:`- Ensure they're on the same user-defined network (‹docker network inspect›).
- Use service/container names, not ‹localhost› (localhost inside a container is the container itself).
- ‹docker exec -it app sh› then ‹nc -zv postgres 5432›, ‹nslookup kafka›, ‹curl›.
- Use a debug image (‹nicolaka/netshoot›) attached to the same network.
- Check published ports vs internal ports and Kafka's ‹advertised.listeners› (a classic Docker issue).`,
    k:"Same network, use service names, test from inside with nc/curl." },
  { l:"I", t:"Jenkins", q:"How do you parameterize Jenkins builds?",
    a:`~~~groovy
parameters {
  choice(name: 'ENV', choices: ['dev', 'staging', 'prod'], description: 'Target environment')
  string(name: 'IMAGE_TAG', defaultValue: '', description: 'Tag to deploy')
  booleanParam(name: 'RUN_E2E', defaultValue: true)
}
// use: params.ENV, params.IMAGE_TAG
~~~

Validate inputs in the pipeline and restrict who can trigger production deploys.`,
    k:"parameters block + params.X; validate and restrict." }
]);
