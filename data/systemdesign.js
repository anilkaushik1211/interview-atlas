ATLAS.addTrack({
  id: "systemdesign", title: "System Design", icon: "🏗", color: "#14b8a6", accent: "#5eead4", extra: true,
  tagline: "Frameworks, scalability building blocks & classic design rounds",
  blurb: "Lead-level design rounds: a repeatable approach, the building blocks (caching, queues, sharding, rate limiting) and full designs relevant to your domain."
}, [
  { l:"B", t:"Approach", q:"How do you approach a system design interview?",
    a:`Use a repeatable structure and talk through trade-offs.

1. **Clarify requirements** – functional (what users do) and non-functional (scale, latency, availability, consistency, security, cost).
2. **Estimate** – users, QPS (avg/peak), read/write ratio, data size growth, bandwidth.
3. **API design** – key endpoints/events.
4. **Data model** – entities, access patterns, storage choice.
5. **High-level architecture** – clients, gateway, services, data stores, messaging, caches.
6. **Deep dives** – the 1–2 hardest parts (hot partitions, consistency, fan-out).
7. **Scale & reliability** – bottlenecks, replication, partitioning, failure modes.
8. **Operations** – observability, deployment, security, cost.
9. **Summarise trade-offs** and what you'd do next.`,
    k:"Requirements → estimates → API → data → architecture → deep dive → trade-offs." },
  { l:"B", t:"Approach", q:"How do you do back-of-the-envelope estimation?",
    a:`Example: 10,000 cameras each emit 1 event/min on average, 10× peak.
- Average: 10,000 / 60 ≈ **167 events/s**; peak ≈ **1,700/s**.
- Event size 1 KB → 167 KB/s avg ≈ **14 GB/day** ≈ 5 TB/year raw.
- Kafka: 1,700 msg/s is small — 6 partitions is plenty; size for consumers' processing time.
- Reads: 200 operators × dashboard refresh every 5 s ≈ 40 req/s + WebSocket pushes.

Useful numbers: 1 day ≈ 86,400 s (≈ 10^5), memory access ~100 ns, SSD read ~100 µs, same-region network round trip ~0.5–1 ms, cross-region ~50–150 ms.`,
    k:"Round aggressively; the goal is order of magnitude." },
  { l:"I", t:"Building Blocks", q:"When should you use a cache, and what can go wrong?",
    a:`Use caching for read-heavy, expensive or slow-changing data (device metadata, user permissions, dashboard aggregates).

Problems:
- **Stale data** – choose TTLs; evict on change events.
- **Cache stampede** – many misses at once → request coalescing, locks, jittered TTL, early refresh.
- **Cache penetration** – requests for non-existent keys → cache negative results, bloom filters.
- **Hot keys** – replicate or local cache.
- **Consistency** – cache-aside writes: update DB then delete cache.
- Cache as SPOF – graceful fallback to DB with limits.`,
    k:"Cache what's hot and slow; plan invalidation and stampede protection." },
  { l:"I", t:"Building Blocks", q:"Explain consistent hashing.",
    a:`Keys and nodes are mapped onto a hash ring; each key belongs to the next node clockwise. Adding/removing a node only moves the keys in its segment (~1/N), unlike ‹hash % N› where almost everything moves. **Virtual nodes** spread load evenly. Used in distributed caches, Cassandra/DynamoDB partitioning and load balancers with sticky routing.`,
    k:"Minimal key movement when nodes change." },
  { l:"I", t:"Building Blocks", q:"How do you design a rate limiter?",
    a:`Algorithms: **token bucket** (allows bursts), leaky bucket (smooth output), fixed window (simple, edge bursts), **sliding window log/counter** (accurate).

Distributed implementation: Redis with atomic Lua scripts or ‹INCR› + ‹EXPIRE› per key (user/API key/IP), enforced at the API gateway. Return **429** with ‹Retry-After›; expose limits in headers; different tiers per client; fail-open vs fail-closed decision if Redis is down.`,
    k:"Token bucket in Redis at the gateway; 429 + Retry-After." },
  { l:"I", t:"Building Blocks", q:"How do load balancers distribute traffic, and L4 vs L7?",
    a:`- **L4** (TCP/UDP) routes by IP/port — very fast, protocol-agnostic (NLB).
- **L7** (HTTP) routes by path, host, headers, cookies — enables canary routing, auth, WAF (ALB, Nginx, Envoy).

Algorithms: round robin, least connections, least response time, weighted, IP/consistent hash (stickiness). Health checks remove unhealthy targets; connection draining enables graceful deploys.`,
    k:"L4 for speed, L7 for smart routing; health checks keep it honest." },
  { l:"A", t:"Building Blocks", q:"How do you design idempotent APIs for payments or critical operations?",
    a:`- Client sends an **Idempotency-Key** header per logical operation.
- Server stores ‹(key, request hash, status, response)› with a unique constraint **in the same transaction** as the state change.
- Same key + same payload → return the stored response; same key + different payload → 422/409.
- In-progress requests return 409/202 to avoid double processing.
- Expire keys after a retention window.
- Combine with bounded retries and reconciliation with external providers.`,
    k:"Persist the idempotency key atomically with the state change." },
  { l:"A", t:"Building Blocks", q:"How do you design a notification system?",
    a:`Components: Notification API → validation & preference lookup → queue/topic per channel (push, email, SMS, in-app/WebSocket) → channel workers calling providers (SES, SNS, FCM) → delivery status store.

Concerns: user preferences and quiet hours, templating/localisation, deduplication, rate limiting per user/provider, retries with backoff and DLQs, provider failover, priority lanes for critical alerts, analytics on delivery/open rates, and audit trails.`,
    k:"Queue per channel, preferences, dedupe, retries, provider failover." },
  { l:"A", t:"Designs", q:"Design a real-time monitoring and alarm platform (CCTV, IoT or server monitoring).",
    a:`**Requirements**: ingest events from thousands of devices/cameras; rules for alarm creation and escalation; real-time dashboard updates (<2 s); acknowledgement workflow; history and analytics; multi-tenant site access.

**Architecture**:
- Ingest API (Spring Boot on ECS) → **Kafka** (‹events.raw› keyed by deviceId).
- Rule engine consumers / Kafka Streams → dedupe, enrich, threshold windows → ‹alarms.*› topics.
- Alarm service: PostgreSQL (partitioned by month) with outbox; REST APIs for queries/acks with optimistic locking.
- WebSocket gateway (STOMP) fans out per site to Angular dashboards; REST backfill on reconnect.
- Notification service (SMS/email/escalation timers).
- Analytics: rollup tables / materialized views for dashboards; S3 + Athena for long-term history.
- Cross-cutting: Keycloak/Cognito auth with site-level authorization, Redis cache, observability with traces across Kafka hops, autoscaling on consumer lag.

**Deep dives**: hot devices (rate limiting/suppression), ordering per device, exactly-once-ish via idempotent upserts, back-pressure when the UI can't keep up.`,
    k:"Kafka backbone + rules + Postgres with outbox + WebSocket fan-out + rollups." },
  { l:"A", t:"Designs", q:"Design a URL shortener.",
    a:`- **API**: ‹POST /urls› → short code; ‹GET /{code}› → 301/302 redirect.
- **Code generation**: base62 of a unique ID (DB sequence or Snowflake-style IDs per node, or pre-generated key ranges per instance) — avoids collisions; 7 chars of base62 ≈ 3.5 trillion codes.
- **Storage**: key-value (DynamoDB/Cassandra) or PostgreSQL with ‹code› primary key.
- **Reads dominate** (100:1) → cache hot codes in Redis/CDN; 302 if you need click analytics.
- **Analytics** asynchronously via Kafka.
- Abuse protection: rate limiting, malicious URL scanning, expiration.`,
    k:"Unique ID → base62, KV store, heavy caching, async analytics." },
  { l:"A", t:"Designs", q:"Design a chat / messaging system.",
    a:`- Clients hold **WebSocket** connections to gateway servers; a session registry (Redis) maps user → gateway.
- Message flow: sender → gateway → chat service → persist (Cassandra/DynamoDB partitioned by conversation ID, sorted by time) → publish to Kafka → recipient's gateway pushes to the device; offline users get push notifications.
- Ordering per conversation (server-assigned sequence numbers), delivery/read receipts, idempotent client message IDs.
- Group chats: fan-out on write for small groups, on read for huge channels.
- Presence via heartbeats with TTL keys.`,
    k:"WebSocket gateways + session registry + per-conversation ordered storage + Kafka fan-out." },
  { l:"A", t:"Designs", q:"Design a reporting/analytics dashboard for financial metrics (portfolio performance, KPIs).",
    a:`- **Data ingestion**: nightly/batch feeds and near-real-time updates into a staging area; validation and reconciliation.
- **Storage**: OLTP store for reference data; analytical store (columnar warehouse, SQL Server/Redshift, or pre-aggregated tables) for metrics; precomputed aggregates by portfolio/period.
- **API layer**: NestJS/Spring services exposing paginated, filterable endpoints with caching (Redis) and ETags; heavy exports generated asynchronously to S3 with pre-signed download links.
- **Frontend**: Angular with lazy-loaded modules, OnPush charts, virtual scrolling tables, server-side sorting/filtering.
- **Correctness**: data lineage, audit logs, consistent "as-of" dates, decimal precision, role-based access.`,
    k:"Pre-aggregate, cache, paginate, export async, and guarantee data accuracy." },
  { l:"A", t:"Designs", q:"Design a file upload and processing service (e.g. bulk device import).",
    a:`1. Client requests an upload → API returns an S3 **pre-signed PUT URL** (size/type constraints).
2. Browser uploads directly to S3 (multipart for large files).
3. S3 event → SQS → worker validates and processes rows in chunks; idempotent upserts; progress stored in DB.
4. Errors collected into a downloadable report; status pushed via WebSocket/polling.
5. Virus scanning, schema validation, quotas, and encryption at rest.`,
    k:"Pre-signed upload → event → queued workers → progress + error report." },
  { l:"A", t:"Designs", q:"Design a distributed job scheduler.",
    a:`- Job definitions stored in a DB (cron, payload, owner, timeout, retry policy).
- Scheduler instances use leader election or row-level locking (‹FOR UPDATE SKIP LOCKED›) to claim due jobs — avoiding duplicates across instances.
- Due jobs pushed to a queue; workers execute idempotently with heartbeats and timeouts; retries with backoff; DLQ.
- History and metrics; manual re-run; alert on failures.
Tools: Quartz clustered, ShedLock for simple cases, EventBridge Scheduler + SQS/Lambda/ECS on AWS, Temporal for workflows.`,
    k:"Durable definitions, safe claiming, queue + idempotent workers, observability." },
  { l:"I", t:"Building Blocks", q:"What is the difference between latency and throughput, and how do you improve each?",
    a:`- **Latency** – time for one request (measure percentiles: p50, p95, p99).
- **Throughput** – requests processed per unit time.

Improve latency: caching, fewer network hops, parallel calls, efficient queries, CDN, connection reuse, async non-critical work.
Improve throughput: horizontal scaling, batching, partitioning, non-blocking I/O, removing contention (locks, pools).

They interact: queueing at high utilisation (>70–80%) makes latency spike (Little's Law: L = λ × W).`,
    k:"Optimise tail latency and remove contention; watch utilisation." },
  { l:"A", t:"Building Blocks", q:"How do you handle back-pressure in a system?",
    a:`Back-pressure signals producers to slow down when consumers are overwhelmed.

- Bounded queues/buffers and rejecting/429 when full.
- Pull-based consumption (Kafka consumers poll at their own pace; lag absorbs bursts).
- Reactive Streams (Project Reactor) ‹request(n)›.
- Rate limiting at the edge, load shedding of low-priority work.
- UI: batch and drop intermediate updates (only the latest state matters for a gauge).`,
    k:"Bound every buffer; let consumers pull; shed low-priority load." },
  { l:"A", t:"Building Blocks", q:"How do you generate unique IDs in a distributed system?",
    a:`- **DB sequences / identity** – simple, central bottleneck at extreme scale.
- **UUIDv4** – random, no coordination, poor index locality.
- **UUIDv7 / ULID** – time-ordered + random → good index locality, sortable.
- **Snowflake** – 64-bit: timestamp + machine ID + sequence; sortable, compact; requires unique machine IDs and clock care.
- **Segment/range allocation** – each instance reserves blocks of IDs from the DB.`,
    k:"UUIDv7/Snowflake for sortable, coordination-free IDs." },
  { l:"I", t:"Building Blocks", q:"Strong vs eventual consistency — how do you decide per feature?",
    a:`Ask: what is the cost of reading stale data?
- Strong consistency for money movement, inventory decrements, permission revocations, alarm acknowledgements (avoid double handling).
- Eventual consistency for dashboards, analytics counts, search indexes, notifications, recommendations.

Design each feature explicitly and communicate staleness in the UI.`,
    k:"Strong where staleness causes harm, eventual everywhere else." },
  { l:"E", t:"Approach", q:"How do you present trade-offs convincingly as a lead engineer?",
    a:`- State the options (at least two), the criteria (latency, consistency, cost, team skills, time to market, operability) and how each option scores.
- Make the decision reversible where possible; note what would change your mind.
- Quantify with estimates or benchmarks.
- Write an **ADR** (Architecture Decision Record): context, decision, consequences.
- Acknowledge risks and mitigations (e.g. "Kafka adds ops overhead; we use MSK and the team already knows it").`,
    k:"Criteria-driven comparison, quantified, documented as an ADR." },
  { l:"A", t:"Designs", q:"Design an API rate-limited public data API with tiers.",
    a:`- Gateway (API Gateway usage plans or Spring Cloud Gateway + Redis) authenticates API keys/OAuth clients and enforces per-tier quotas (requests/min, daily caps).
- Responses include ‹X-RateLimit-Remaining›/‹Retry-After›.
- Caching of popular resources at CDN and service levels.
- Async export endpoints for bulk data.
- Usage metering pipeline (Kafka → aggregation → billing).
- Versioned, documented (OpenAPI), with SLAs per tier.`,
    k:"Authenticate, meter, limit per tier, cache, export async." },
  // ───────── More building blocks ─────────
  { l:"B", t:"Building Blocks", q:"What is a reverse proxy and how is it different from a forward proxy?",
    a:`- A **forward proxy** sits in front of **clients** and makes requests on their behalf (corporate internet proxy, anonymity, filtering).
- A **reverse proxy** sits in front of **servers** and receives requests on their behalf (Nginx, Envoy, ALB, API gateway): TLS termination, load balancing, caching, compression, routing, rate limiting, hiding internal topology.`,
    k:"Forward proxy represents clients; reverse proxy represents servers.",
    r:"A forward proxy is your personal assistant making calls for you. A reverse proxy is a company receptionist who answers every incoming call and routes it to the right department." },
  { l:"B", t:"Building Blocks", q:"Explain CDN, caching layers and where to cache in a request path.",
    a:`Cache as close to the user as correctness allows:
1. **Browser cache** (Cache-Control, ETag).
2. **CDN/edge** (static assets, public GET responses).
3. **API gateway / reverse proxy** cache.
4. **Application cache** – local (Caffeine) and distributed (Redis).
5. **Database caches** – buffer pool, materialised views.

Each layer cuts latency and load further down. Decide TTLs, invalidation and personalisation (never cache user-specific data in shared caches without the right keys).`,
    k:"Cache from browser to DB — the closer to the user, the bigger the win.",
    r:"Keeping snacks in your bag (browser), in the office kitchen (CDN), in the building's shop (app cache), and only going to the supermarket (database) when needed." },
  { l:"I", t:"Building Blocks", q:"Cache-aside vs read-through vs write-through vs write-behind?",
    a:`- **Cache-aside (lazy loading)** – app reads cache; on miss reads DB and populates cache; on write updates DB then **evicts** cache. Most common.
- **Read-through** – the cache library loads from DB on miss.
- **Write-through** – writes go to cache and DB synchronously; cache always fresh, slower writes.
- **Write-behind (write-back)** – write to cache, flush to DB asynchronously; fast writes, risk of data loss.
- **Refresh-ahead** – refresh hot keys before expiry.`,
    k:"Cache-aside by default; write-through for freshness; write-behind for speed with risk.",
    r:"Cache-aside is checking your notebook first and looking things up in the encyclopedia only when needed, then jotting the answer down." },
  { l:"I", t:"Building Blocks", q:"What are message queues and when do you use them in system design?",
    a:`Queues (SQS, RabbitMQ) and logs (Kafka) decouple producers from consumers:
- **Absorb spikes** – buffer bursts so consumers process at their own rate.
- **Asynchronous work** – emails, reports, image processing, notifications.
- **Reliability** – retries, DLQs, durable storage.
- **Fan-out** – one event, many consumers (pub/sub).
- **Scale** – add consumers independently.

Trade-offs: eventual consistency, duplicate delivery (idempotency needed), ordering only per partition/group, more moving parts.`,
    k:"Queues decouple time, rate and failure between services.",
    r:"A restaurant's order rail: waiters pin tickets, cooks take them when ready. A rush of orders doesn't make cooks drop pans; it just lengthens the rail." },
  { l:"I", t:"Building Blocks", q:"SQL vs NoSQL — how do you decide in a design interview?",
    a:`Ask about the data and access patterns:
- Strong consistency, transactions, complex queries/joins, evolving reporting needs → **SQL** (PostgreSQL).
- Massive scale with simple key-based access, flexible schema, very high write throughput → **NoSQL** (DynamoDB/Cassandra/MongoDB).
- Many designs use both: PostgreSQL for core entities, Redis for caching, Elasticsearch for search, S3 for blobs, a wide-column store for time-series events.

State the trade-off explicitly rather than picking by fashion.`,
    k:"Choose by consistency, query flexibility and scale profile.",
    r:"A spreadsheet with strict columns and formulas (SQL) vs a filing cabinet of flexible folders you can find instantly by label (NoSQL)." },
  { l:"I", t:"Building Blocks", q:"What is database sharding and what are sharding strategies?",
    a:`Sharding splits data across multiple database servers so each holds a subset.

Strategies:
- **Range-based** (by date or ID range) – simple, but hotspots on recent ranges.
- **Hash-based** (hash of user/tenant ID) – even distribution, range queries harder.
- **Directory/lookup-based** – a mapping service decides placement; flexible, extra hop.
- **Geo-based** – data near users / residency laws.

Challenges: cross-shard queries and transactions, rebalancing (consistent hashing helps), hot keys, operational complexity.`,
    k:"Shard by a key that spreads load and keeps common queries on one shard.",
    r:"A big school splitting students into classrooms by surname letter: easy lookups, but a class with many 'S' surnames gets crowded." },
  { l:"A", t:"Building Blocks", q:"What is a bloom filter and where is it used?",
    a:`A space-efficient probabilistic structure answering "definitely not in the set" or "possibly in the set" (false positives possible, no false negatives).

Uses: avoid DB lookups for non-existent keys (cache penetration), check if a username might be taken, Cassandra/HBase SSTable lookups, web crawlers checking visited URLs, malicious URL lists.`,
    k:"Cheap 'definitely not' answers save expensive lookups.",
    r:"A bouncer with a quick list of banned faces: if you're not on it, you're definitely allowed in; if you look similar to someone on it, they check your ID more carefully." },
  { l:"A", t:"Building Blocks", q:"Leader election and consensus — why do distributed systems need them?",
    a:`Some tasks must be done by exactly one node (a scheduler, a partition leader, a primary database). Nodes must agree on who leads, even with failures and network partitions.

Consensus algorithms (**Raft**, Paxos) let a majority (quorum) agree on values/leaders; used by etcd (Kubernetes), ZooKeeper, Kafka KRaft, Consul. Application-level options: lease-based locks in a DB/Redis, Kubernetes Lease objects. Use **fencing tokens** so an old leader paused by GC can't make stale writes.`,
    k:"Quorums decide leaders; fencing tokens stop zombie leaders.",
    r:"A club electing a captain by majority vote; if the old captain wakes up from a nap and gives orders, the team checks the latest captain's badge number (fencing token)." },
  { l:"A", t:"Building Blocks", q:"What is a quorum (N, R, W) in replicated databases?",
    a:`With N replicas, a write waits for W acknowledgements and a read queries R replicas. If **R + W > N**, every read overlaps with at least one replica that saw the latest write → strong consistency (Dynamo-style systems like Cassandra).

Examples (N=3): W=2, R=2 balanced; W=3, R=1 fast reads/slow writes; W=1, R=1 fast but eventually consistent. Tune per use case.`,
    k:"R + W > N gives read-your-latest-write consistency.",
    r:"Three friends each keep a copy of the party plan. If at least two confirm every change, and you always ask two of them, at least one will know the latest plan." },
  { l:"I", t:"Building Blocks", q:"Long polling vs WebSockets vs Server-Sent Events vs webhooks?",
    a:`- **Short polling** – client asks repeatedly; simple, wasteful.
- **Long polling** – server holds the request until data or timeout.
- **SSE** – server → client stream over HTTP; auto-reconnect; one-way (notifications, live feeds).
- **WebSockets** – full-duplex persistent connection; chat, live dashboards, collaborative apps.
- **Webhooks** – server-to-server HTTP callbacks when events occur (payment succeeded).

A live monitoring dashboard pushes alarms via WebSockets because operators also send acknowledgements back.`,
    k:"Pick by direction, frequency and who the client is.",
    r:"Polling: asking 'are we there yet?' every minute. Long polling: asking once and the driver answers when you arrive. WebSocket: an open phone line. Webhook: the restaurant calls you when the table is ready." },
  { l:"A", t:"Building Blocks", q:"What is the difference between push and pull models for fan-out (e.g. news feeds)?",
    a:`- **Fan-out on write (push)** – when a user posts, write it into every follower's feed. Fast reads, expensive writes for celebrities with millions of followers.
- **Fan-out on read (pull)** – build the feed at read time by merging followees' posts. Cheap writes, slower reads.
- **Hybrid** – push for normal users, pull for celebrities; cache feeds.`,
    k:"Push for fast reads, pull for heavy writers, hybrid in practice.",
    r:"A teacher handing a printed copy of the notice to every student (push) vs pinning it on the board for students to check (pull)." },
  { l:"A", t:"Building Blocks", q:"How do you handle hot keys / hot partitions?",
    a:`Symptoms: one partition, shard or cache key receives disproportionate traffic (a celebrity, a noisy device, today's date).

Mitigations:
- **Caching** hot reads (local + distributed) with request coalescing.
- **Key salting** – split a hot key into N sub-keys (‹device42#0..#9›) and aggregate.
- Better partition keys (composite keys, hashing).
- Rate-limit or throttle noisy producers.
- Dedicated capacity for known hot entities.`,
    k:"Cache, salt, re-key or throttle the hot spot.",
    r:"One checkout lane mobbed because it's closest to the door: open more lanes for the same queue (salting) or move popular items near other lanes." },
  { l:"I", t:"Building Blocks", q:"What is API pagination and which style should you use?",
    a:`- **Offset/limit** – simple, supports page jumps; slow on deep pages and unstable when data changes.
- **Cursor/keyset** – opaque cursor from the last item's sort key; constant performance and stable; no random page jumps. Best for feeds and large tables.
- **Page tokens** – server-defined tokens (Google APIs).

Return metadata (next cursor, has-more) and cap page sizes.`,
    k:"Offset for small admin tables; cursors for feeds and big data.",
    r:"Reading a book by page number (offset) vs using a bookmark where you stopped (cursor) — the bookmark still works even if pages were inserted earlier." },
  { l:"A", t:"Building Blocks", q:"Explain the CAP theorem with a practical design decision.",
    a:`During a network partition, a distributed data store must choose:
- **CP** – refuse/err on some requests to stay consistent (e.g. a banking balance, inventory reservation, alarm acknowledgement).
- **AP** – keep answering with possibly stale data and reconcile later (e.g. product view counts, social likes, dashboards).

Practical decision: in a monitoring platform, acknowledging an alarm must be consistent (CP — conditional update in PostgreSQL), while dashboard counters can be eventually consistent (AP — cached aggregates).`,
    k:"Choose per feature: correctness-critical = CP, availability-critical = AP.",
    r:"Two bank branches lose their phone line: either they stop withdrawals until reconnected (CP) or allow them and risk overdrafts to reconcile later (AP)." },
  { l:"I", t:"Building Blocks", q:"What is object storage + metadata DB pattern for files?",
    a:`Store large binaries (images, videos, reports) in object storage (S3) and keep metadata (owner, size, type, S3 key, status, permissions) in a database. Clients upload/download directly with pre-signed URLs; a CDN serves public content. Event notifications trigger processing (thumbnails, virus scans).

Never store large blobs in relational tables — it bloats backups and hurts performance.`,
    k:"Blobs in object storage, metadata in the DB, transfer via pre-signed URLs.",
    r:"A library catalogue (DB) tells you where the book is; the books themselves live on warehouse shelves (object storage)." },
  // ───────── More designs ─────────
  { l:"A", t:"Designs", q:"Design a rate-limited, real-time leaderboard.",
    a:`- Use **Redis sorted sets** (‹ZINCRBY›, ‹ZREVRANGE›, ‹ZREVRANK›) for O(log n) score updates and top-N queries.
- Score events flow through Kafka to an updater service (idempotent by event ID).
- Shard by game/region; periodic snapshots to a durable DB.
- Cache top-100 and push updates via WebSockets/SSE.
- Anti-cheat validation server-side; rate-limit score submissions.`,
    k:"Redis sorted sets + event-driven updates + snapshots.",
    r:"A live scoreboard at a stadium updated by official referees (validated events), not by fans shouting scores." },
  { l:"A", t:"Designs", q:"Design a parking-lot or booking system that prevents double booking.",
    a:`- Entities: lots/rooms, slots, bookings with time ranges.
- **Prevent double booking** at the database level: unique constraint on (slot, time bucket) or PostgreSQL **exclusion constraint** on overlapping ranges (‹EXCLUDE USING gist (slot_id WITH =, period WITH &&)›).
- Hold/reserve with expiry (pending → confirmed) to handle payment windows; release via scheduled job or TTL.
- Idempotent booking API with idempotency keys.
- Optimistic concurrency for updates; notifications via events.`,
    k:"Let the database enforce no-overlap; holds with expiry for checkout flows.",
    r:"A cinema seat map: once a seat is selected, it's held for 5 minutes for you; the box office system physically can't sell it twice." },
  { l:"A", t:"Designs", q:"Design a typeahead / autocomplete service.",
    a:`- Data: popular queries/terms with frequencies, updated from search logs (batch + streaming).
- Structure: **trie** with top-k suggestions cached per prefix, or search engine prefix queries (Elasticsearch completion suggester).
- Serve from memory/Redis; shard by prefix; CDN-cache popular prefixes.
- Client: debounce (~200 ms), cancel stale requests (‹switchMap› in Angular), min 2 characters.
- Personalisation and filtering of offensive terms as layers.`,
    k:"Precomputed top-k per prefix, served from memory, with client-side debouncing.",
    r:"A barista who knows regulars' orders: after 'Large cappuccino with…', they already suggest 'oat milk'." },
  { l:"A", t:"Designs", q:"Design a web crawler.",
    a:`- **URL frontier**: prioritised queues per host (politeness, robots.txt, crawl delays).
- **Fetchers**: distributed workers with timeouts and retries; DNS caching.
- **Dedup**: URL normalisation + bloom filter/seen set; content hash for duplicate pages.
- **Parser/extractor**: links back into the frontier, content to storage (object store) and indexers.
- **Scale**: partition by host hash; checkpoint state; monitor throughput.
- Handle traps (infinite calendars), redirects, and freshness (recrawl schedules).`,
    k:"Polite, prioritised frontier + distributed fetchers + dedup.",
    r:"A team of librarians visiting every bookshop in the country, never visiting the same shop twice in a day, and noting which books are new." },
  { l:"A", t:"Designs", q:"Design a payment system.",
    a:`- **Idempotency keys** on all payment APIs; persist intent before calling the provider.
- **State machine**: CREATED → AUTHORISED → CAPTURED → SETTLED / FAILED / REFUNDED; transitions audited.
- **Double-entry ledger** (immutable entries, balanced debits/credits) as the source of truth.
- Provider integration via adapters; webhooks for async results; **reconciliation jobs** comparing provider reports to the ledger.
- Exactly-once effects via outbox + idempotent consumers.
- Security: PCI DSS scope reduction with tokenisation; encryption; fraud checks.
- Strong consistency (CP) for balances.`,
    k:"Idempotency, state machine, ledger, reconciliation.",
    r:"An old-fashioned accountant's ledger: every movement of money is written twice (debit and credit), never erased, and checked against the bank statement each night." },
  { l:"A", t:"Designs", q:"Design a video streaming platform (high level).",
    a:`- **Upload**: resumable multipart uploads to object storage; metadata in DB.
- **Processing pipeline**: queue → transcoding workers into multiple bitrates/resolutions (HLS/DASH segments); thumbnails; DRM.
- **Delivery**: CDN-heavy; adaptive bitrate streaming chooses quality per network.
- **Metadata & search**: DB + search index; recommendations offline/online.
- **Analytics**: playback events → stream → data lake.
- Scale: storage tiers, regional CDNs, cost of egress.`,
    k:"Transcode once into many renditions, deliver via CDN with adaptive bitrate.",
    r:"Printing a book in several sizes (pocket, standard, large print) once, then stocking local shops so readers pick the size that suits them." },
  { l:"A", t:"Designs", q:"Design a metrics/monitoring system like Prometheus/CloudWatch.",
    a:`- **Collection**: pull (Prometheus scraping) or push (agents/OTLP) of time-series samples (name + labels + value + timestamp).
- **Ingestion**: write-ahead log, in-memory head blocks, compressed chunks (delta-of-delta, XOR encoding).
- **Storage**: time-partitioned blocks; downsampling for older data; long-term storage in object storage (Thanos/Mimir).
- **Query**: PromQL-like aggregation over label selectors.
- **Alerting**: rule evaluation → alert manager (dedupe, grouping, routing).
- Watch **cardinality** (labels like user IDs explode series counts).`,
    k:"Labelled time series, compressed by time, queried by aggregation, alert on rules.",
    r:"A weather station network: thousands of sensors report readings every minute, old readings are summarised daily, and storm warnings fire on thresholds." },
  { l:"A", t:"Designs", q:"Design an e-commerce checkout across microservices.",
    a:`Services: Cart, Inventory, Order, Payment, Shipping, Notification.

Flow (orchestrated saga):
1. Order service creates order PENDING (outbox event).
2. Inventory reserves stock (with expiry).
3. Payment authorises (idempotent).
4. Order CONFIRMED → shipping created → notifications.
Compensations: payment fails → release stock → order CANCELLED.

Concerns: idempotency everywhere, timeouts for reservations, consistent read models for the UI (order status page), observability across the saga, and handling of duplicate/late events.`,
    k:"Saga with reservations, idempotent steps and compensations.",
    r:"Booking a holiday package: reserve the flight, then the hotel, then pay; if the hotel is full, the flight hold is cancelled automatically." },
  { l:"A", t:"Designs", q:"Design a multi-tenant SaaS platform.",
    a:`Tenancy models:
- **Silo** – separate DB/stack per tenant (strong isolation, costly).
- **Pool** – shared DB with ‹tenant_id› on every row (efficient, needs strict isolation via row-level security, query scoping).
- **Bridge/hybrid** – shared app tier, separate schemas or DBs for large tenants.

Cross-cutting: tenant context propagated from JWT claims, per-tenant rate limits and quotas, noisy-neighbour protection, per-tenant encryption keys for sensitive customers, tenant-aware observability and billing metering.`,
    k:"Choose silo/pool/bridge per isolation and cost needs; enforce tenant context everywhere.",
    r:"An apartment building: shared walls and plumbing (pool) with private locked units — or a gated community of separate houses for VIP tenants (silo)." },
  { l:"A", t:"Designs", q:"Design a dashboard that shows live counts of open alarms per site to 500 operators.",
    a:`- Alarm state changes are events in Kafka (‹alarms.state›).
- A **stream aggregator** (Kafka Streams KTable or a consumer with Redis ‹HINCRBY›) maintains counts per site and severity — idempotent by event ID and version.
- Snapshot endpoint: ‹GET /sites/counts› served from Redis (fast initial load).
- Live updates: WebSocket gateway pushes **deltas** per site topic, throttled/batched to ~1 update/sec per site.
- Reconciliation job periodically recomputes from PostgreSQL to correct drift.
- Angular: signals store, OnPush widgets, animate count changes.`,
    k:"Stream-maintained aggregates + snapshot API + throttled delta pushes + periodic reconciliation.",
    r:"An airport departures board: it doesn't recount every flight each second; it updates only the rows that change, and staff double-check it periodically." },
  { l:"A", t:"Designs", q:"Design a distributed cache like Redis Cluster at a high level.",
    a:`- Keys mapped to **hash slots** (16,384 in Redis Cluster) distributed across primary nodes; replicas for each primary.
- Clients route by slot (smart clients) and follow MOVED/ASK redirects during resharding.
- Eviction policies (LRU/LFU), TTLs.
- Replication async → possible data loss on failover; persistence via RDB/AOF if needed.
- Failure detection via gossip; replica promotion by majority of primaries.`,
    k:"Hash slots across primaries with replicas and client-side routing.",
    r:"A coat check with numbered racks split among several attendants; each attendant has an assistant who can take over if they leave." },
  { l:"I", t:"Approach", q:"What non-functional requirements should you always ask about?",
    a:`- **Scale**: users, requests/sec (peak), data volume and growth.
- **Latency**: p50/p99 targets for key operations.
- **Availability**: SLA/SLO, tolerance for downtime.
- **Consistency**: where staleness is acceptable.
- **Durability**: can we ever lose data?
- **Security & compliance**: auth, PII, data residency, audit.
- **Cost** constraints.
- **Operability**: observability, deployment frequency, team size/skills.
- **Geography**: single region vs global users.`,
    k:"Scale, latency, availability, consistency, durability, security, cost, ops.",
    r:"Before building a house you ask not just 'how many rooms?' but also budget, climate, earthquake rules and how many people will live there." },
  { l:"I", t:"Approach", q:"How do you draw a clear architecture diagram in an interview?",
    a:`- Start with **clients** on the left and **data stores** on the right; requests flow left to right.
- Draw the **happy path** first, then add async flows (queues) and caches.
- Label arrows with protocols and key data (REST, gRPC, Kafka topic name).
- Mark sync vs async and where state lives.
- Add numbers from estimates (QPS, data size) next to components.
- Keep it to 6–10 boxes at first; zoom into one area for deep dives.
- Use the C4 model mentally: context → containers → components.`,
    k:"Left-to-right flow, labelled arrows, happy path first, then zoom in.",
    r:"Like giving directions on a napkin map: main road first, landmarks labelled, side streets only when someone asks." },
  { l:"E", t:"Approach", q:"How do you evolve a design from 1,000 to 10 million users?",
    a:`1. **Single server** – app + DB together.
2. **Separate DB**, add a load balancer and multiple stateless app servers.
3. **Caching** (Redis) and **CDN** for static content.
4. **Read replicas**; move sessions out of app memory.
5. **Async processing** with queues; split heavy features into services.
6. **Partition/shard** data; multi-AZ everywhere.
7. **Multi-region** for latency/DR; global load balancing.
8. Mature **observability**, autoscaling, chaos testing and cost management.

Emphasise: scale the bottleneck you have, measured — not the one you imagine.`,
    k:"Evolve step by step, driven by measured bottlenecks.",
    r:"A street food stall becoming a restaurant chain: first a bigger kitchen, then more cooks, then a central prep kitchen, then branches in other cities." },
  { l:"A", t:"Building Blocks", q:"What is the difference between horizontal partitioning, vertical partitioning and functional decomposition?",
    a:`- **Horizontal partitioning (sharding)** – split rows across tables/servers (users A–M vs N–Z).
- **Vertical partitioning** – split columns: frequently accessed columns in one table, large/rarely used columns (blobs, JSON) in another.
- **Functional decomposition** – split by business capability into separate services/databases (orders vs inventory).

Systems often use all three as they grow.`,
    k:"Split rows, split columns, or split responsibilities.",
    r:"Organising a wardrobe: by person (horizontal), by everyday vs occasional clothes (vertical), or separate cupboards for clothes, shoes and sports gear (functional)." }
]);
