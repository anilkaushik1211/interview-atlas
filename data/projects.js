ATLAS.addTrack({
  id: "projects", title: "Project Deep-Dive", icon: "📂", color: "#8b5cf6", accent: "#c4b5fd", extra: true,
  tagline: "The follow-ups interviewers ask about any project on your CV",
  blurb: "Every technology you list invites a 'why' and a 'how'. These questions show how to talk about your own projects with depth: architecture, decisions, scale, security, failures and impact."
}, [
  { l:"B", t:"Overview", q:"Explain your current project's architecture end to end.",
    a:`Draw while you talk and follow the data:
1. **Users and clients** – web/mobile apps, partners, devices.
2. **Entry points** – CDN, API gateway, load balancer.
3. **Services** – what each does and how they communicate (REST, gRPC, events).
4. **Data** – which databases/caches/queues and why.
5. **Infrastructure** – containers, cloud services, CI/CD.
6. **Cross-cutting** – authentication, observability, error handling.

Then pick one interesting part to go deeper on, and mention one thing you'd improve.`,
    k:"Follow the data from client to storage, then zoom into one area.",
    r:"Giving a building tour: entrance, each floor, the room you designed, and the view from the roof." },
  { l:"I", t:"Decisions", q:"Why did your team choose this technology stack?",
    a:`Show you understand trade-offs, not just preferences:
- **Requirements** that drove it (latency, team skills, ecosystem, licensing, cloud provider).
- **Alternatives** considered and why they lost.
- **Costs** you accepted (learning curve, operational load, vendor lock-in).
- **Hindsight**: what worked and what you'd reconsider.

Example: "We chose Spring Boot because the team knew Java well and needed mature libraries for security, JPA and Kafka. We considered Node.js for the gateway, but kept one stack to simplify hiring and on-call."`,
    k:"Requirements → alternatives → trade-offs → hindsight.",
    r:"Choosing a car for a family: you compare seats, safety and running costs — and you can explain why you didn't buy the sports car." },
  { l:"I", t:"Decisions", q:"Your project uses WebSockets (or real-time updates). Why, and how does it work?",
    a:`**Why**: users need updates within a second (live dashboards, chat, notifications); polling wastes requests and still adds delay. If updates are one-way only, Server-Sent Events may be simpler.

**How** (typical):
- Backend exposes a WebSocket/STOMP endpoint; clients subscribe to topics (per user, room or site).
- Events from a message broker (Kafka/RabbitMQ) are pushed to the relevant topics.
- Authentication on the handshake (JWT) and authorisation per subscription.
- Client reconnects with exponential backoff and fetches missed events via REST.
- Scaling: sticky sessions, a broker relay or per-instance fan-out so any server can reach any client.`,
    k:"Latency and bidirectional needs justify WebSockets; secure, reconnect and backfill.",
    r:"A newsroom ticker that pushes breaking news instantly, instead of journalists phoning every reader to ask if they want an update." },
  { l:"I", t:"Decisions", q:"Your project uses a message broker such as Kafka. How are topics, partitions and consumers designed?",
    a:`Explain the event flow and the design choices:
- **Topics** per event type or domain (‹orders.created›, ‹payments.completed›).
- **Keys** chosen for ordering (order ID, user ID, device ID).
- **Partitions** sized for consumer parallelism.
- **Consumer groups** per responsibility (billing, notifications, analytics) so each gets every event.
- **Reliability**: ‹acks=all›, idempotent producers, retries with a dead-letter topic, idempotent consumers.
- **Monitoring**: consumer lag alerts.

Expect: "What happens if a consumer crashes mid-processing?" → at-least-once redelivery from the last committed offset; idempotent handling prevents duplicates.`,
    k:"Topics by domain, keys for ordering, groups per responsibility, idempotent processing.",
    r:"A central dispatch board: every event is posted once, and the billing, shipping and email teams each read it independently." },
  { l:"I", t:"Decisions", q:"Why did you choose this database (SQL vs NoSQL) for your project?",
    a:`Tie the choice to data shape and access patterns:
- **Relational** (PostgreSQL/MySQL): relationships, transactions, complex queries and reporting.
- **Document** (MongoDB): flexible, nested records read as a unit (profiles, case files, catalogues).
- **Key-value/wide-column** (DynamoDB/Cassandra): huge scale with known access patterns.

Then explain modelling (tables/collections, key indexes), how you handled migrations or schema evolution, and any performance work (indexes, query tuning, caching).`,
    k:"Data shape and access patterns drive the database choice.",
    r:"A kitchen has a fridge, freezer and pantry — each for different storage needs. You choose by what you're storing and how often you grab it." },
  { l:"A", t:"Scale", q:"How did you make your services scalable?",
    a:`Typical levers to talk about:
- **Stateless** services behind a load balancer; horizontal autoscaling.
- **Asynchronous** processing with queues/streams for slow or spiky work.
- **Database** tuning: indexes, query optimisation, connection pooling, partitioning, read replicas.
- **Caching** of hot reads.
- **Frontend** efficiency: pagination, lazy loading, virtual scrolling.

Back it with numbers if you can ("handles about 2,000 requests per second at peak with p99 under 200 ms"). If you don't know the numbers, explain how you would measure them.`,
    k:"Stateless + async + tuned data + caching, with numbers.",
    r:"A food court where more stalls open at peak hours, all supplied from one central delivery line." },
  { l:"A", t:"Scale", q:"What would you change if your system had to handle 10× the load?",
    a:`1. Load-test to find the first bottleneck (usually the database or a downstream API).
2. Scale stateless tiers horizontally; autoscale on the right signal (CPU, requests, queue depth, consumer lag).
3. Reduce database load: caching, read replicas, batch writes, partitioning, pre-aggregation.
4. Move non-critical work to async queues.
5. Strengthen resilience: timeouts, circuit breakers, rate limits.
6. Improve observability and define SLOs for the critical path.`,
    k:"Measure first, then scale the real bottleneck.",
    r:"Expanding a restaurant tenfold: more kitchens, a central prep line and a host managing the queues." },
  { l:"I", t:"Security", q:"How is authentication and authorization implemented in your project?",
    a:`Describe the flow clearly:
- **Login**: identity provider (Keycloak, Cognito, Okta) or your own service with hashed passwords (BCrypt).
- **Tokens**: JWT access tokens (short-lived) + refresh tokens, or server sessions.
- **Backend**: Spring Security / guards validate tokens on every request; roles map to permissions.
- **Fine-grained checks**: ownership/tenant rules in the service layer.
- **Frontend**: interceptor adds the token; route guards improve UX (not security).
- **Hardening**: HTTPS, CORS rules, rate limiting on login, audit logs.`,
    k:"Identity provider → tokens → validation on every request → ownership checks.",
    r:"A hospital wristband: verifies who you are at admission and decides which wards and records you can access." },
  { l:"I", t:"Quality", q:"How do you ensure quality in your project (testing, reviews, CI)?",
    a:`- **Testing**: unit tests for logic, integration tests with real dependencies (Testcontainers), contract tests between services, a few E2E journeys.
- **Reviews**: every change reviewed; clear standards.
- **CI/CD**: automated build, tests, static analysis and security scans on every PR; deployment gates.
- **Production**: monitoring, alerts and post-incident reviews feeding back into tests.

Mention coverage of critical paths rather than a coverage percentage alone.`,
    k:"Tests at the right levels, reviews, automated gates, production feedback.",
    r:"A car factory: each part tested on the bench, the assembled engine on a dyno, and a test drive before delivery." },
  { l:"I", t:"DevOps", q:"Walk me through how your code gets from a commit to production.",
    a:`Example answer: "A pull request triggers the CI pipeline: build, unit tests, static analysis and a security scan. After review and merge, the pipeline builds a Docker image tagged with the commit SHA, pushes it to a registry, and deploys automatically to a dev environment. Promotion to staging and production uses the same image, with approval for production and a rolling or canary rollout. Configuration and secrets come from the cloud provider's parameter store. We monitor dashboards after release and roll back by redeploying the previous image."

Be ready to discuss database migrations, secrets and rollback.`,
    k:"PR → CI → immutable image → environments → monitored rollout → rollback.",
    r:"A bakery production line: bake, quality check, seal the box, deliver to shops — and recall a batch if needed." },
  { l:"A", t:"Incidents", q:"Describe the hardest production issue you debugged on your project.",
    a:`Prepare one detailed, technical story. Common shapes:
- Queue/consumer lag caused by slow database writes → batching and an index.
- Memory growth from an unbounded cache → bounded cache and heap-dump analysis.
- Random disconnects behind a proxy → idle-timeout and heartbeat settings.
- Connection-pool exhaustion from long transactions → shorter transactions and timeouts.

Structure: symptom → impact → mitigation → investigation (logs, metrics, traces, thread/heap dumps, EXPLAIN) → root cause → fix → prevention.`,
    k:"One deep, evidence-driven debugging story with prevention.",
    r:"A detective story: the crime (symptom), the clues (logs and metrics), the culprit (root cause) and the new lock on the door (prevention)." },
  { l:"I", t:"Performance", q:"What performance improvement did you make, and how did you measure it?",
    a:`Interviewers want a before/after with method:
1. **Baseline** – what was slow, measured how (APM, Lighthouse, load tests, query timings).
2. **Diagnosis** – profiler, EXPLAIN plan, bundle analysis, traces.
3. **Change** – e.g. an index, caching, batching, lazy loading, pagination.
4. **Result** – "p95 dropped from 1.8 s to 300 ms" or "initial bundle shrank by 40%".
5. **Guardrail** – performance budget, alert or regression test so it stays fixed.`,
    k:"Baseline → diagnose → change → measured result → guardrail.",
    r:"A personal trainer recording your times before and after a programme — 'feeling faster' isn't evidence." },
  { l:"I", t:"Frontend", q:"How did you keep the frontend fast and maintainable?",
    a:`- Feature modules/routes loaded lazily; small initial bundle.
- Reusable, presentational components with clear inputs/outputs.
- OnPush/signals to limit re-rendering; virtual scrolling for big lists.
- Server-side pagination, filtering and caching of reference data.
- Consistent state management and API clients generated from OpenAPI.
- Linting, formatting, bundle budgets and component tests in CI.`,
    k:"Lazy loading, reusable components, efficient rendering, enforced standards.",
    r:"A restaurant that brings the menu instantly and cooks only what you order, instead of preparing every dish before you sit down." },
  { l:"I", t:"APIs", q:"How do you ensure API integration quality between services and the frontend?",
    a:`- Contract-first design with OpenAPI; generate typed clients for the frontend.
- Consistent validation and error format (ProblemDetail).
- Contract or integration tests per endpoint; Postman/Newman collections in CI.
- Backward-compatible changes and explicit versioning.
- Mock servers so frontend and backend can work in parallel.`,
    k:"Contract-first APIs with generated clients and automated checks.",
    r:"A supplier and a shop signing the same specification, with deliveries checked against it automatically." },
  { l:"I", t:"Skills", q:"You list design patterns on your CV. Which ones did you actually use, and where?",
    a:`Pick real examples and explain the benefit:
- **Strategy** – pluggable pricing, notification or validation rules chosen at runtime.
- **Observer / Pub-Sub** – domain events, Kafka topics, WebSocket subscriptions.
- **Factory** – creating handlers or parsers per message type.
- **Builder** – complex DTOs or queries.
- **Repository** – data access with Spring Data.
- **Adapter / anti-corruption layer** – wrapping third-party APIs.
- **Circuit breaker / retry** – calls to external services.`,
    k:"Name the pattern, where you used it, and why it helped.",
    r:"A chef naming the techniques they actually used in a dish, rather than reciting a cookbook." },
  { l:"E", t:"Skills", q:"You list a cloud provider on your CV — which services exactly have you used?",
    a:`Be precise and honest. List the services you've used hands-on and what you did with them (deploying, configuring, troubleshooting): for example EC2/ECS, S3, RDS, IAM, CloudWatch.

Then show depth of thinking: "With more time I'd move all infrastructure to Terraform/CDK, use managed Kafka, rotate secrets automatically, and add distributed tracing."

Interviewers value honesty about scope plus a clear improvement roadmap far more than a long list of buzzwords.`,
    k:"Be exact about what you used; show you know the next steps.",
    r:"Saying which instruments you actually play in the band, rather than claiming the whole orchestra." },
  { l:"I", t:"Reflection", q:"If you could rebuild your project from scratch, what would you do differently?",
    a:`Shows maturity and learning. Good themes:
- Clearer service boundaries (or fewer services).
- Earlier investment in observability and automated tests.
- Infrastructure as code from day one.
- Better API/event contracts and versioning.
- Simpler technology choices where complexity didn't pay off.

Balance: acknowledge the constraints the team had at the time — don't trash past decisions.`,
    k:"Honest hindsight, respecting the original constraints.",
    r:"An architect revisiting their first house: proud of it, but now they'd put the kitchen nearer the garden." },
  { l:"I", t:"Impact", q:"What business impact did your project have?",
    a:`Translate technical work into outcomes: revenue, cost savings, time saved, reliability, user growth, risk reduced.

Examples: "Real-time alerts cut incident response time from minutes to seconds", "Automation reduced deployment time from two hours to fifteen minutes", "Report caching saved analysts an hour per day."

If you don't have exact numbers, estimate honestly and explain how you'd measure.`,
    k:"Connect your work to measurable business outcomes.",
    r:"A builder describing not just the bricks laid but that the family now has a warm, safe home." },
  { l:"I", t:"Data", q:"How do your dashboards or reports stay fast with large data volumes?",
    a:`- Pre-aggregate data (rollup tables, materialised views) rather than scanning raw rows per request.
- Keyset pagination and the right composite indexes.
- Partition historical data by time and archive cold data.
- Short-lived caching for popular widgets.
- Efficient rendering on the frontend: OnPush, virtual scrolling, incremental chart updates.`,
    k:"Aggregate ahead, paginate by key, partition, cache, render efficiently.",
    r:"A sports channel showing season statistics from pre-computed tables instead of rewatching every match live." },
  { l:"I", t:"Teamwork", q:"What was your specific contribution versus the team's?",
    a:`Interviewers want to separate "we" from "I". Be specific and honest:
- What you designed or decided.
- What you built and owned end to end.
- What you improved for others (tooling, reviews, mentoring).
- Where you collaborated and credited others.

Example: "The team built the platform; I designed and implemented the notification service, wrote its integration tests and set up its dashboards and alerts."`,
    k:"Use 'I' for your work, 'we' for the team — both honestly.",
    r:"In a band, everyone plays the song, but you can say clearly that you wrote the bass line and arranged the bridge." }
]);
