ATLAS.addTrack({
  id: "microservices", title: "Microservices", icon: "🧩", color: "#a855f7", accent: "#d8b4fe",
  tagline: "Decomposition, resilience, sagas, gateways & observability",
  blurb: "Designing, splitting, connecting and operating distributed services: DDD boundaries, sync vs async, Spring Cloud, resilience patterns, data consistency, security and observability."
}, [
  // ───────── Basics ─────────
  { l:"B", t:"Basics", q:"What are microservices and how do they differ from a monolith?",
    a:`Microservices structure an application as a set of small, independently deployable services, each owning a business capability and its own data, communicating over the network (REST, gRPC, events).

A **monolith** is one deployable unit with a shared codebase and usually one database.

- Microservices: independent deploy/scale, team autonomy, tech flexibility, fault isolation — but network latency, partial failures, distributed data and operational complexity.
- Monolith: simpler development, testing, transactions and debugging — but coupled releases and scaling as a whole.

A **modular monolith** is a strong middle ground for small teams.`,
    k:"Microservices trade in-process simplicity for independent deployability and scaling." },
  { l:"B", t:"Basics", q:"What are the main characteristics of a good microservice?",
    a:`- **Single business capability** with a clear bounded context.
- **Owns its data** (database per service), exposing it only via APIs/events.
- **Independently deployable** and versioned.
- **Loosely coupled, highly cohesive**.
- **Stateless** compute (state in DB/cache) so it scales horizontally.
- **Observable**: logs, metrics, traces, health checks.
- **Resilient**: timeouts, retries, circuit breakers, graceful degradation.
- **Automated**: CI/CD, containerised, infrastructure as code.`,
    k:"One capability, own data, deploy alone, fail gracefully, observable." },
  { l:"I", t:"Basics", q:"When would you choose a monolith over microservices?",
    a:`Choose a (modular) monolith when:
- The team is small (one or two teams) and the domain boundaries are still unclear.
- You need fast iteration and simple transactions.
- There's no need for independent scaling or release cadence.
- Operational maturity (CI/CD, monitoring, on-call) is limited.

Move to microservices when independent deployability, scaling hotspots, fault isolation or team ownership justify the overhead. "Microservices first" often produces a distributed monolith.`,
    k:"Start modular; split when the organisation or scaling need justifies it." },
  { l:"I", t:"Basics", q:"What is a distributed monolith and how do you avoid it?",
    a:`A distributed monolith has many services but they must be deployed together, share a database, or call each other synchronously in long chains — all the costs of microservices with none of the benefits.

Signs: lock-step releases, shared DB schemas, cascading failures, chatty APIs, shared domain libraries that change constantly.

Avoid with bounded contexts, database per service, async events for cross-domain workflows, backward-compatible contracts, and consumer-driven contract tests.`,
    k:"If services must deploy together, they're not really independent." },
  // ───────── Design ─────────
  { l:"I", t:"Design", q:"How do you identify service boundaries (DDD, bounded contexts)?",
    a:`Use Domain-Driven Design:
- Run **event storming** with domain experts to find domain events, commands and aggregates.
- Group them into **bounded contexts** where a term has one meaning (e.g. "Device" in Inventory vs "Device" in Monitoring).
- Align services with business capabilities (Alarm Management, Device Registry, Notification, Reporting, User/Access).
- Check coupling: things that change together and need transactional consistency stay together.
- Use a context map to define relationships (customer-supplier, anti-corruption layer).`,
    k:"Boundaries follow business capabilities and consistency needs, not technical layers." },
  { l:"I", t:"Design", q:"How would you split a monolith into microservices?",
    a:`Use the **Strangler Fig** pattern incrementally:
1. Map domains and dependencies; modularise inside the monolith first.
2. Put an API gateway/proxy in front so routes can be redirected.
3. Extract a low-risk, high-value capability with clear boundaries (e.g. Notifications).
4. Give it its own database; sync data via events or CDC during transition; use an anti-corruption layer.
5. Route traffic gradually (feature flags/canary), monitor, then remove the old code.
6. Repeat. Avoid big-bang rewrites.`,
    k:"Strangle incrementally: route, extract, migrate data, retire." },
  { l:"A", t:"Design", q:"What is the Database-per-service pattern and its challenges?",
    a:`Each service owns its schema; other services can't query it directly. This enables independent evolution and scaling.

Challenges and solutions:
- **Cross-service queries** → API composition, CQRS read models, or a reporting data lake.
- **Transactions** → Sagas + outbox.
- **Referential integrity** → event-driven consistency, validation via APIs.
- **Data duplication** → accept denormalized copies updated by events.

"Database per service" can mean separate schemas on one cluster initially; the key is no shared tables.`,
    k:"Own your data; share it via APIs and events, never via tables." },
  { l:"A", t:"Design", q:"What is an anti-corruption layer?",
    a:`An ACL is a translation layer between your domain model and an external/legacy system's model, so foreign concepts and quirks don't leak into your service.

Example: integrating camera vendors with different alarm formats — adapters translate vendor payloads into a canonical ‹AlarmEvent›. Implement with adapters/facades, mappers and dedicated client modules.`,
    k:"Translate foreign models at the boundary to protect your domain." },
  // ───────── Communication ─────────
  { l:"I", t:"Communication", q:"Synchronous REST vs asynchronous messaging — how do you choose?",
    a:`- **Synchronous (REST/gRPC)**: the caller needs an immediate answer (query data, validate). Simple, but couples availability and latency — if B is down, A fails.
- **Asynchronous (Kafka/RabbitMQ/SQS)**: fire events or commands; consumers process later. Decouples availability, absorbs spikes, enables fan-out — but eventual consistency, ordering and duplicate handling.

Rule: queries sync; state changes that others react to → events. Avoid long synchronous chains (A → B → C → D).`,
    k:"Sync when you need the answer now; async when others just need to know." },
  { l:"I", t:"Communication", q:"REST vs gRPC vs GraphQL for service communication?",
    a:`- **REST/JSON** – universal, human-readable, cacheable; ideal for public/browser APIs.
- **gRPC** – HTTP/2 + Protobuf, strongly typed contracts, streaming, low latency; ideal for internal service-to-service calls with high throughput.
- **GraphQL** – client-specified queries aggregating many sources; ideal as a BFF for complex UIs; harder caching and rate limiting.`,
    k:"REST for public, gRPC for internal speed, GraphQL for flexible UI aggregation." },
  { l:"I", t:"Communication", q:"What is an API Gateway and what does it do?",
    a:`A single entry point in front of services that handles cross-cutting concerns:
- Routing and path rewriting, load balancing.
- Authentication (JWT validation), rate limiting, quotas.
- TLS termination, CORS, request/response transformation.
- Aggregation, caching, canary routing, observability.

Options: Spring Cloud Gateway, AWS API Gateway, Kong, NGINX, Envoy. Keep business logic out of the gateway.`,
    k:"Gateway = edge concerns in one place; no business logic." },
  { l:"I", t:"Communication", q:"What is the Backend-for-Frontend (BFF) pattern?",
    a:`A BFF is a backend tailored to one client type (web dashboard, mobile app). It aggregates calls to several services, shapes responses for that UI, and handles client-specific auth/session concerns.

Benefits: fewer round trips, UI-specific payloads, independent evolution. Cost: another service to maintain — avoid duplicating business logic across BFFs.`,
    k:"One backend per frontend type to aggregate and shape data." },
  { l:"I", t:"Discovery", q:"What is service discovery? Client-side vs server-side?",
    a:`Services need to find each other's dynamic network locations.
- **Client-side discovery**: clients query a registry (Eureka, Consul) and load-balance themselves (Spring Cloud LoadBalancer).
- **Server-side discovery**: clients call a stable endpoint (load balancer, Kubernetes Service DNS, AWS Cloud Map / ECS Service Connect) which routes to healthy instances.

On Kubernetes/ECS, platform DNS-based discovery usually replaces Eureka.`,
    k:"Registry + client LB, or platform DNS + server LB." },
  { l:"I", t:"Configuration", q:"How do you manage configuration across many services?",
    a:`- Externalize config (12-factor): environment variables, Spring profiles.
- Centralized config: Spring Cloud Config Server (Git-backed), AWS AppConfig, Parameter Store, Kubernetes ConfigMaps.
- Secrets in Secrets Manager / Vault, never in Git.
- Support refresh without redeploy where needed (‹@RefreshScope›, AppConfig feature flags).
- Version and audit changes; validate config at startup (‹@Validated @ConfigurationProperties›).`,
    k:"Centralize, version and validate config; keep secrets in a vault." },
  // ───────── Resilience ─────────
  { l:"I", t:"Resilience", q:"Why are timeouts and retries dangerous when configured poorly?",
    a:`Without timeouts, slow dependencies hold threads and connections until pools exhaust → cascading failure. Poor retries amplify load: if each of 3 layers retries 3 times, one request becomes 27 calls (**retry storm**).

Good practice:
- Timeouts at every remote call, shorter than the caller's own deadline (deadline propagation).
- Retry only transient failures and only **idempotent** operations.
- Exponential backoff **with jitter**, capped attempts, retry budgets.
- Combine with circuit breakers.`,
    k:"Every call needs a timeout; retries need idempotency, backoff, jitter and limits." },
  { l:"I", t:"Resilience", q:"Explain the circuit breaker pattern.",
    a:`A circuit breaker wraps calls to a dependency and tracks failures/slow calls.
- **Closed** – calls pass; failures counted in a sliding window.
- **Open** – after the failure-rate threshold, calls fail fast (fallback) for a wait duration, giving the dependency time to recover.
- **Half-open** – a few trial calls; success closes, failure re-opens.

~~~java
@CircuitBreaker(name = "deviceService", fallbackMethod = "cachedDevice")
@Retry(name = "deviceService")
@TimeLimiter(name = "deviceService")
public CompletableFuture<Device> get(String id) { ... }
~~~

Resilience4j is the standard library in Spring Boot.`,
    k:"Fail fast when a dependency is unhealthy, probe to recover." },
  { l:"A", t:"Resilience", q:"What are bulkheads, rate limiters and fallbacks?",
    a:`- **Bulkhead** – isolate resources per dependency (separate thread pools or semaphore limits) so one slow dependency can't consume all threads.
- **Rate limiter** – cap calls per time window to protect yourself or a downstream (or enforce client quotas at the gateway).
- **Fallback** – degraded response: cached data, default values, "try later", or queueing the work.
- **Load shedding** – reject excess requests early (429/503) to keep the system healthy.`,
    k:"Isolate, limit, degrade gracefully, shed load." },
  { l:"A", t:"Resilience", q:"How do you design for graceful degradation in a real-time monitoring platform?",
    a:`Decide what's critical: alarm ingestion and operator notifications must keep working; analytics charts and reports can degrade.

- Ingestion writes to Kafka first (durable buffer) so downstream outages don't drop alarms.
- Dashboards show cached aggregates with "data delayed" banners if analytics is slow.
- Notification service falls back from SMS to email/WebSocket.
- Circuit breakers around enrichment services; process alarms without enrichment and backfill later.
- Priority queues/topics for critical alarms; rate-limit noisy devices.`,
    k:"Protect the critical path; degrade the nice-to-haves visibly." },
  { l:"I", t:"Resilience", q:"What is idempotency and why does it matter in microservices?",
    a:`An operation is idempotent if doing it multiple times has the same effect as once. In distributed systems, retries and at-least-once delivery make duplicates inevitable.

Techniques:
- **Idempotency keys** on POST requests stored with the result (unique constraint).
- **Processed-message table** for consumers (event ID).
- **Upserts** and conditional updates (‹WHERE status = 'OPEN'›).
- Natural idempotent operations (PUT, set state rather than increment).`,
    k:"Assume duplicates; make handlers idempotent." },
  // ───────── Data consistency ─────────
  { l:"A", t:"Data Consistency", q:"What is the Saga pattern? Orchestration vs choreography?",
    a:`A saga breaks a cross-service business transaction into local transactions, each publishing an event or triggering the next step, with **compensating actions** to undo on failure.

- **Choreography** – services react to each other's events (OrderCreated → PaymentReserved → StockReserved). Simple for few steps; harder to see the whole flow.
- **Orchestration** – a central orchestrator (state machine, e.g. Temporal, Camunda, AWS Step Functions) tells services what to do and handles compensation. Clearer for complex flows.

Design compensations carefully (refund, release reservation) and make steps idempotent.`,
    k:"Sagas = local transactions + compensations, coordinated by events or an orchestrator." },
  { l:"A", t:"Data Consistency", q:"What is the transactional outbox pattern?",
    a:`Problem: saving to the DB and publishing to Kafka are two systems — if the app crashes between them, you get lost or phantom events (**dual-write problem**).

Outbox: in the **same DB transaction**, write the business change and an ‹outbox› row containing the event. A separate relay publishes outbox rows to Kafka and marks them sent:
- Polling publisher (‹SELECT ... FOR UPDATE SKIP LOCKED›), or
- **CDC** (Debezium reading the WAL) — low latency, no polling.

Delivery is at-least-once, so consumers must be idempotent.`,
    k:"Write state and event atomically in one DB transaction, publish asynchronously." },
  { l:"A", t:"Data Consistency", q:"What is CQRS and when should you use it?",
    a:`Command Query Responsibility Segregation separates the **write model** (commands, validation, domain rules) from **read models** optimised for queries (denormalized tables, Elasticsearch, Redis).

Read models are updated from events, so they're eventually consistent.

Use when read and write workloads/shapes differ a lot (complex dashboards over high-volume writes — e.g. alarm analytics), or to compose data across services. Avoid for simple CRUD — it adds complexity.`,
    k:"Separate write and read models when their needs diverge." },
  { l:"A", t:"Data Consistency", q:"What is event sourcing?",
    a:`Instead of storing current state, store an append-only log of domain events (AlarmRaised, AlarmAcknowledged, AlarmEscalated). Current state is derived by replaying events (with snapshots for speed).

Benefits: full audit trail, temporal queries, rebuild read models, natural fit with CQRS.
Costs: event schema evolution, eventual consistency, complex queries, learning curve.

Use for domains where history is the truth (finance ledgers, audit-heavy workflows); not as a default.`,
    k:"Store what happened, derive what is." },
  { l:"A", t:"Data Consistency", q:"Explain eventual consistency and how to handle it in UX.",
    a:`After a write, different services/read models converge to the same state after some delay.

UX strategies:
- Show **pending/processing** states ("Acknowledgement sent…").
- Optimistic UI updates with rollback on failure.
- Read-your-writes by returning the updated resource from the command or reading from the write store.
- Push updates via WebSocket when processing completes.
- Communicate staleness ("updated 10 s ago").`,
    k:"Make the delay visible and recoverable, not mysterious." },
  { l:"A", t:"Data Consistency", q:"Why avoid two-phase commit (2PC) in microservices?",
    a:`2PC (XA) coordinates a prepare and commit phase across resources. Problems: blocking if the coordinator fails, held locks across network calls, reduced availability, poor support in modern brokers/cloud databases, and tight coupling. Sagas + outbox + idempotency provide consistency without global locks.`,
    k:"2PC trades availability and scale for atomicity — rarely worth it." },
  // ───────── Event-driven ─────────
  { l:"I", t:"Event-Driven", q:"What is event-driven architecture? Events vs commands?",
    a:`Services communicate by publishing **events** (facts that happened: ‹AlarmRaised›) to a broker; interested services subscribe. The producer doesn't know consumers.

**Commands** are requests to do something (‹SendNotification›) directed at a specific handler and may be rejected.

Benefits: loose coupling, scalability, extensibility (new consumers without touching producers). Challenges: ordering, duplicates, schema evolution, debugging flows (use tracing and event catalogs).`,
    k:"Events state facts to anyone; commands ask someone to act." },
  { l:"A", t:"Event-Driven", q:"How do you design an event-driven workflow spanning services?",
    a:`1. Define events and their schemas (Avro/JSON Schema with a Schema Registry), versioned and backward compatible.
2. Choose keys for ordering (e.g. ‹deviceId›) and topics per domain.
3. Publish via outbox; consumers idempotent; DLQ for poison messages.
4. Model the workflow: choreography for simple flows, orchestration for complex ones with timeouts and compensation.
5. Correlate with IDs in headers; trace end-to-end.
6. Monitor consumer lag and DLQ size; provide replay tooling.`,
    k:"Schemas, keys, outbox, idempotency, DLQs and tracing." },
  // ───────── Observability ─────────
  { l:"I", t:"Observability", q:"How do logs, metrics and distributed traces complement each other?",
    a:`- **Metrics** – cheap numeric time series: tell you *that* something is wrong (error rate, p99 latency, consumer lag). Drive alerts and SLOs.
- **Traces** – follow one request across services: tell you *where* time or errors happen.
- **Logs** – detailed events: tell you *why* (exception, input values).

Link them with a shared trace ID (OpenTelemetry/Micrometer Tracing) so you jump from an alert → slow trace → relevant logs.`,
    k:"Metrics detect, traces locate, logs explain." },
  { l:"I", t:"Observability", q:"How does distributed tracing work?",
    a:`Each request gets a **trace ID**; each unit of work is a **span** with timing, parent span ID and attributes. Context propagates via headers (W3C ‹traceparent›) over HTTP and Kafka.

In Spring Boot 3: Micrometer Tracing + OpenTelemetry bridge auto-instruments RestClient, WebClient, Kafka and JDBC; spans export to Jaeger/Zipkin/Tempo/AWS X-Ray. Use sampling to control volume; always sample errors.`,
    k:"Trace ID across hops; spans show the timeline." },
  { l:"A", t:"Observability", q:"What are SLI, SLO, SLA and error budgets?",
    a:`- **SLI** – a measured indicator (99th percentile latency of alarm delivery, success rate of API calls).
- **SLO** – target for the SLI (99.9% of alarms delivered to the UI within 2 s over 30 days).
- **SLA** – contractual commitment with penalties (usually looser than the SLO).
- **Error budget** – 100% − SLO; when spent, prioritise reliability work over features.

Alert on symptoms (SLO burn rate), not every CPU spike.`,
    k:"Measure SLIs, target SLOs, promise SLAs, spend error budgets wisely." },
  { l:"I", t:"Observability", q:"What should a health check endpoint report?",
    a:`- **Liveness** – is the process alive and not deadlocked? Should not depend on external systems (or a DB blip restarts every pod).
- **Readiness** – can it serve traffic now (warmed up, DB pool ready, not shutting down)? Failing readiness removes the instance from the load balancer without restarting it.
- **Startup** – for slow starters, gives extra time before liveness kicks in.

Spring Boot Actuator exposes ‹/actuator/health/liveness› and ‹/readiness›.`,
    k:"Liveness = restart me; readiness = don't send me traffic yet." },
  // ───────── Security ─────────
  { l:"A", t:"Security", q:"How would you secure service-to-service communication?",
    a:`- **Transport**: mTLS between services (service mesh like Istio/App Mesh or ALB/NLB TLS).
- **Identity**: OAuth2 client-credentials tokens or workload identities (IAM roles, SPIFFE) — not shared static API keys.
- **Authorization**: scopes/audiences per service, least privilege.
- **Propagate user context** (token exchange or signed headers) when downstream needs to know the end user.
- **Network**: private subnets, security groups, network policies.
- Rotate secrets automatically; audit access.`,
    k:"mTLS + short-lived workload tokens + least privilege + private networking." },
  { l:"I", t:"Security", q:"Where should authentication and authorization happen in a microservice system?",
    a:`- **Authentication** at the edge: the API gateway or each service validates JWTs from the identity provider (Keycloak, Cognito, Okta).
- **Coarse authorization** (route/role) at the gateway.
- **Fine-grained authorization** (ownership, tenant/site access) inside each service — it knows the domain data.
- Never trust headers from clients; services re-validate tokens (zero trust).`,
    k:"Authenticate at the edge, authorize in the domain." },
  { l:"I", t:"Security", q:"What is OAuth2 and OpenID Connect? Explain common flows.",
    a:`- **OAuth2** – delegated authorization: a client gets an access token to call APIs on behalf of a user or itself.
- **OIDC** – identity layer on OAuth2: adds an ID token (JWT) describing the user.

Flows:
- **Authorization Code + PKCE** – SPAs (Angular) and mobile apps.
- **Client Credentials** – service-to-service.
- **Refresh token** – renew access tokens.
- Implicit and password grants are deprecated.`,
    k:"OAuth2 authorizes, OIDC authenticates; SPAs use Code + PKCE." },
  // ───────── Deployment ─────────
  { l:"I", t:"Deployment", q:"How do you deploy microservices safely (blue-green, canary, rolling)?",
    a:`- **Rolling** – replace instances gradually; default in ECS/Kubernetes.
- **Blue-green** – run new version alongside old, switch traffic at once, instant rollback.
- **Canary** – send a small % of traffic to the new version, watch metrics, then increase.
- **Feature flags** – deploy dark, release by toggle.

Requirements: backward-compatible APIs and DB migrations (expand/contract), health checks, automated rollback on SLO breach.`,
    k:"Small blast radius, observable rollout, quick rollback." },
  { l:"I", t:"Deployment", q:"What are the 12-factor app principles?",
    a:`1. One codebase, many deploys. 2. Explicit dependencies. 3. Config in the environment. 4. Backing services as attached resources. 5. Separate build, release, run. 6. Stateless processes. 7. Port binding. 8. Scale out via processes. 9. Disposability (fast start, graceful shutdown). 10. Dev/prod parity. 11. Logs as event streams. 12. Admin processes as one-off tasks.

Spring Boot + Docker + ECS/K8s naturally follow most of them.`,
    k:"Stateless, config via env, disposable, logs to stdout." },
  { l:"A", t:"Deployment", q:"What is a service mesh and when do you need one?",
    a:`A service mesh (Istio, Linkerd, AWS App Mesh/VPC Lattice) adds a sidecar or node proxy to every service to provide mTLS, retries, timeouts, traffic splitting, and telemetry **without application code changes**.

Worth it with many services, polyglot stacks, strict zero-trust requirements or advanced traffic management. Overhead: operational complexity, latency, resource cost. For a handful of Spring services, libraries (Resilience4j, Micrometer) are often enough.`,
    k:"Mesh moves networking concerns out of code — at an operational cost." },
  { l:"I", t:"Deployment", q:"How do you handle graceful shutdown in a microservice?",
    a:`When a container receives SIGTERM:
1. Fail readiness so the load balancer stops sending new requests.
2. Finish in-flight HTTP requests (‹server.shutdown=graceful›, ‹spring.lifecycle.timeout-per-shutdown-phase=30s›).
3. Stop Kafka consumers after committing offsets for processed records.
4. Flush producers/outbox relays, close pools.
5. Exit before the platform's kill timeout (ECS ‹stopTimeout›, K8s ‹terminationGracePeriodSeconds›).

Also ensure the JVM is PID 1 or uses an init (tini) so signals are delivered.`,
    k:"Stop taking work, finish work, commit offsets, exit cleanly." },
  // ───────── Testing ─────────
  { l:"I", t:"Testing", q:"How do you test microservices?",
    a:`- **Unit tests** for domain logic.
- **Component tests** – one service with real infrastructure (Testcontainers: PostgreSQL, Kafka) and mocked neighbours (WireMock).
- **Contract tests** – consumer-driven (Pact, Spring Cloud Contract) to catch breaking API/event changes without full environments.
- **End-to-end tests** – few, critical journeys only.
- **Non-functional**: load (Gatling/k6), chaos experiments (kill instances, inject latency), security scans.
- Test in production safely: canaries, synthetic monitoring.`,
    k:"Lots of unit/component tests, contracts between services, few E2E." },
  { l:"A", t:"Testing", q:"What is consumer-driven contract testing?",
    a:`Consumers define the interactions they rely on (request → expected response or event shape). These contracts are verified against the provider in its CI pipeline. If the provider breaks a contract, its build fails before deployment.

Tools: Pact (with a Pact Broker and ‹can-i-deploy›), Spring Cloud Contract. It replaces many brittle end-to-end tests with fast, targeted checks.`,
    k:"Consumers publish expectations; providers verify them in CI." },
  // ───────── Spring Cloud ─────────
  { l:"I", t:"Spring Cloud", q:"Which Spring Cloud components have you used and what do they do?",
    a:`- **Spring Cloud Gateway** – reactive API gateway (routes, filters, rate limiting).
- **Spring Cloud Config** – centralized Git-backed configuration.
- **Eureka/Consul** – service registry and discovery.
- **Spring Cloud LoadBalancer** – client-side load balancing.
- **OpenFeign** – declarative HTTP clients.
- **Resilience4j (Circuit Breaker)** – fault tolerance.
- **Spring Cloud Stream** – binder abstraction for Kafka/RabbitMQ.
- **Spring Cloud AWS** – SQS, SNS, Parameter Store, Secrets Manager integration.
- **Micrometer Tracing** (successor to Sleuth) – distributed tracing.`,
    k:"Gateway, config, discovery, resilience, messaging and tracing building blocks." },
  { l:"I", t:"Spring Cloud", q:"How does Spring Cloud Gateway work?",
    a:`Built on Spring WebFlux/Netty (and now also an MVC variant). Requests are matched by **predicates** (path, host, header, method) to **routes**, and pass through **filters** (pre/post) for auth, header manipulation, rate limiting (Redis), retries, circuit breakers, and path rewriting.

~~~yaml
spring.cloud.gateway.routes:
  - id: alarms
    uri: lb://alarm-service
    predicates: [ Path=/api/alarms/** ]
    filters:
      - StripPrefix=1
      - name: CircuitBreaker
        args: { name: alarms, fallbackUri: "forward:/fallback/alarms" }
~~~`,
    k:"Predicates match routes; filters handle cross-cutting edge logic." },
  // ───────── Operations & scaling ─────────
  { l:"I", t:"Scaling", q:"How do you scale microservices horizontally?",
    a:`- Keep services **stateless** (sessions in Redis/JWT, files in S3).
- Run multiple instances behind a load balancer; autoscale on CPU, request count or custom metrics (Kafka consumer lag, queue depth).
- Scale Kafka consumers up to the number of partitions.
- Make sure dependencies scale too: DB connections (pool × instances), downstream rate limits.
- Use caching and async processing to flatten spikes.`,
    k:"Stateless instances + autoscaling on the right signal + scalable dependencies." },
  { l:"A", t:"Scaling", q:"How would you handle a sudden 10× traffic spike?",
    a:`Short term: autoscaling (pre-warmed capacity if predictable), CDN caching, rate limiting/load shedding at the gateway, queue-based buffering, degrade non-critical features.

Design-time: identify the bottleneck (usually the database), cache hot reads, async writes via Kafka, read replicas, partition hot keys, and load test regularly to know your limits. Have runbooks and dashboards ready.`,
    k:"Buffer, cache, shed, scale — and know your limits from load tests." },
  { l:"A", t:"Patterns", q:"Explain the Sidecar, Ambassador and Adapter patterns.",
    a:`- **Sidecar** – a helper container deployed alongside the main one sharing its lifecycle (log shippers, Envoy proxy, secret refreshers).
- **Ambassador** – a proxy sidecar handling outbound connectivity (retries, TLS, routing) for the app.
- **Adapter** – standardizes output of the main container (e.g. exposing metrics in Prometheus format).

These keep cross-cutting concerns out of business code — common in ECS task definitions and Kubernetes pods.`,
    k:"Co-located helper containers for cross-cutting concerns." },
  { l:"A", t:"Patterns", q:"What is the API Composition pattern and its limitations?",
    a:`A composer (gateway, BFF or service) calls multiple services and joins results in memory to answer a query (e.g. device + latest alarms + site info).

Limitations: latency of the slowest call, partial failures, no large joins/filters across services, inconsistent snapshots. For heavy cross-service queries, use CQRS read models instead. Use parallel calls with timeouts and partial responses.`,
    k:"Compose for simple cross-service reads; CQRS for heavy ones." },
  { l:"A", t:"Patterns", q:"How do you handle API versioning and backward compatibility between services?",
    a:`- Follow the **tolerant reader** principle: ignore unknown fields, don't rely on field order.
- Make changes **additive**; never remove/rename fields without deprecation.
- Version breaking changes (‹/v2›, new event types/topics), run versions side by side, migrate consumers, then retire.
- For events, use a Schema Registry with compatibility rules (BACKWARD/FULL).
- Contract tests ensure compatibility automatically.`,
    k:"Additive changes, tolerant readers, versioned breaks, enforced by contracts." },
  { l:"I", t:"Patterns", q:"What is the Strangler Fig pattern?",
    a:`Named after a vine that gradually envelops a tree. You place a facade/proxy in front of a legacy system and incrementally route features to new services until the legacy system can be removed. It reduces risk compared with a big-bang rewrite, allows continuous delivery during migration, and lets you validate each extracted piece in production.`,
    k:"Replace a legacy system piece by piece behind a facade." },
  { l:"E", t:"Scenario", q:"Scenario: one slow downstream service is bringing down your whole platform. What do you do?",
    a:`Immediate mitigation:
1. Identify via traces/metrics which dependency is slow and which callers are saturated (thread/connection pools).
2. Reduce timeouts, open circuit breakers / enable fallbacks, rate-limit callers, scale the slow service if it's capacity-bound.
3. Shed non-critical traffic.

Permanent fixes:
- Timeouts + circuit breakers + bulkheads on every outbound call.
- Async decoupling via Kafka where possible.
- Caching of slow-changing data.
- Capacity tests and SLO-based alerts on dependency latency.
- Post-incident review with action items.`,
    k:"Contain with timeouts/breakers/bulkheads, then decouple and capacity-plan." },
  { l:"E", t:"Scenario", q:"Scenario: design notification delivery (email, SMS, WebSocket) for critical alarms.",
    a:`1. Alarm service publishes ‹AlarmRaised› (via outbox) to Kafka.
2. **Notification service** consumes, applies routing rules (site, severity, on-call schedule, quiet hours), deduplicates (alarm ID + channel) and throttles noisy devices.
3. Per-channel workers/topics: WebSocket gateway (instant UI push), Email (SES), SMS (SNS/third party) — isolated so one provider outage doesn't block others.
4. Retries with backoff, DLQ per channel, fallback channel escalation if not acknowledged within N minutes.
5. Store delivery status for audit; expose metrics (delivery latency, failures).
6. Templates and localization stored centrally.`,
    k:"Event-driven, rule-based routing, per-channel isolation, retries + escalation + audit." },
  { l:"E", t:"Scenario", q:"Scenario: how do you trace a request that fails intermittently across 6 services?",
    a:`1. Ensure trace context propagates over HTTP and Kafka (‹traceparent› headers) and logs include trace IDs.
2. Search traces for errors in the time window; compare failed vs successful traces.
3. Look at span timings for timeouts, retries, and which hop returns errors.
4. Correlate with deployments, infrastructure events, specific instances/AZs, or particular inputs (tenant, device type).
5. Reproduce with the same inputs in a lower environment; add targeted logging if needed.
6. Fix and add an alert/regression test.`,
    k:"Trace IDs everywhere; compare failed vs healthy traces; correlate with changes." },
  { l:"A", t:"Patterns", q:"What is the Competing Consumers pattern?",
    a:`Multiple consumer instances read from the same queue/topic partition set so messages are processed in parallel and the load is balanced (SQS consumers, Kafka consumer group members). It provides scalability and resilience. Ordering is only preserved per partition (Kafka) or FIFO group (SQS FIFO), so keys must be chosen accordingly.`,
    k:"Scale consumers horizontally; ordering only within a key/partition." },
  { l:"I", t:"Basics", q:"What are the biggest challenges of running microservices in production?",
    a:`- Distributed debugging and observability.
- Data consistency across services.
- Network failures, latency and cascading failures.
- Versioning and contract management.
- Deployment and infrastructure automation for many services.
- Security across many endpoints.
- Testing integrated behaviour.
- Organisational alignment (Conway's law) and on-call ownership.`,
    k:"The hard parts are operations, data and people, not writing the services." },
  { l:"I", t:"Patterns", q:"What is Conway's Law and how does it affect architecture?",
    a:`"Organizations design systems that mirror their communication structure." If three teams build a system, you'll likely get three major components. The **Inverse Conway Maneuver** shapes teams around desired service boundaries. As a lead, align ownership (one team owns a service end to end, including on-call) to reduce cross-team coordination.`,
    k:"Team structure and architecture shape each other — design both." },
  { l:"A", t:"Caching", q:"How do you use caching in a microservices architecture?",
    a:`Layers: CDN/edge (static assets, public GETs), gateway response cache, service-level distributed cache (Redis/ElastiCache), local in-process caches (Caffeine) for tiny hot reference data.

Patterns: cache-aside (most common), read-through, write-through, write-behind. Handle invalidation with TTLs plus event-driven eviction (consume ‹DeviceUpdated› events). Beware stampedes (request coalescing, jittered TTLs), stale data, and cache becoming a hidden single point of failure.`,
    k:"Cache-aside with TTL + event-based invalidation; protect against stampedes." }
]);
