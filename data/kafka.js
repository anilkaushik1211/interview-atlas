ATLAS.addTrack({
  id: "kafka", title: "Kafka & Real-time", icon: "⚡", color: "#eab308", accent: "#fde047", extra: true,
  tagline: "Topics, partitions, consumer groups, delivery semantics & WebSockets",
  blurb: "Event streaming and real-time delivery: Kafka internals, delivery semantics, consumer scaling, schemas and WebSocket push — essential for modern backend interviews."
}, [
  { l:"B", t:"Basics", q:"What is Apache Kafka and why use it?",
    a:`Kafka is a distributed, durable, append-only **commit log** used for event streaming. Producers write records to **topics**; consumers read them at their own pace; records are retained for a configured time regardless of consumption.

Why: high throughput, horizontal scalability via partitions, durability via replication, replayability, decoupling of producers and consumers, and a rich ecosystem (Kafka Connect, Streams, Schema Registry). In a monitoring platform, for example, it buffers and distributes alarm events to rule engines, storage and real-time UI services.`,
    k:"A replicated, partitioned, replayable log that decouples producers and consumers." },
  { l:"B", t:"Basics", q:"Explain topics, partitions, offsets, brokers and replicas.",
    a:`- **Topic** – named stream of records (‹alarms.raised›).
- **Partition** – an ordered, append-only log; topics are split into partitions for parallelism. Ordering is guaranteed **only within a partition**.
- **Offset** – sequential ID of a record within a partition; consumers track their position by offset.
- **Broker** – a Kafka server storing partitions.
- **Replica** – copies of a partition on other brokers; one **leader** handles reads/writes, **followers** replicate. The **ISR** (in-sync replicas) are followers caught up with the leader.
- **KRaft** – Kafka's built-in metadata quorum that replaced ZooKeeper.`,
    k:"Topics split into partitions; offsets track position; replicas give durability." },
  { l:"I", t:"Consumers", q:"How do consumer groups work and what is a rebalance?",
    a:`A **consumer group** is a set of consumers sharing the work of a topic: each partition is assigned to exactly one consumer in the group, so max parallelism = number of partitions. Different groups each get all messages (pub/sub).

A **rebalance** reassigns partitions when consumers join/leave/crash or partitions change. During eager rebalances consumption pauses. Reduce impact with **cooperative sticky assignor**, **static membership** (‹group.instance.id›), proper ‹max.poll.interval.ms› (processing must finish before it) and ‹session.timeout.ms›.`,
    k:"One partition → one consumer per group; rebalances redistribute partitions." },
  { l:"I", t:"Producers", q:"How does a producer choose a partition, and why do keys matter?",
    a:`- With a **key**, the default partitioner hashes it (murmur2) → same key always goes to the same partition → **ordering per key** (all events for ‹deviceId=42› in order).
- Without a key, records are spread with the sticky partitioner for batching efficiency.
- Custom partitioners are possible.

Pitfalls: **hot keys** (one noisy device overloading one partition) and changing partition counts, which remaps keys and breaks ordering for in-flight data.`,
    k:"Key = ordering unit; choose keys with good distribution." },
  { l:"A", t:"Delivery", q:"Explain at-most-once, at-least-once and exactly-once semantics.",
    a:`- **At-most-once** – commit offsets before processing; crashes lose messages.
- **At-least-once** (most common) – process then commit; crashes cause **duplicates** → consumers must be idempotent.
- **Exactly-once** – Kafka supports EOS for **Kafka-to-Kafka** flows: idempotent producers (‹enable.idempotence=true›) + transactions (‹transactional.id›) + consumers with ‹isolation.level=read_committed›, as used by Kafka Streams (‹processing.guarantee=exactly_once_v2›).

When the side effect is an external system (DB, email), achieve effectively-once with idempotent writes (upserts, processed-event table) or outbox patterns.`,
    k:"At-least-once + idempotent consumers is the practical default." },
  { l:"I", t:"Producers", q:"What do acks, retries, idempotence and min.insync.replicas do?",
    a:`- ‹acks=0› – fire and forget; ‹acks=1› – leader wrote it; ‹acks=all› – all in-sync replicas wrote it (durable).
- ‹min.insync.replicas=2› (topic/broker) + ‹acks=all› + replication factor 3 → survive one broker failure without data loss; if ISR < 2, producers get errors rather than silently losing data.
- ‹enable.idempotence=true› (default in modern clients) – no duplicates from producer retries and preserved ordering.
- ‹retries›, ‹delivery.timeout.ms›, ‹linger.ms› + ‹batch.size› (throughput), ‹compression.type=lz4/zstd›.`,
    k:"RF=3, min ISR=2, acks=all, idempotence on." },
  { l:"I", t:"Consumers", q:"How do offset commits work? Auto vs manual commit?",
    a:`Consumers commit the **next offset to read** to the internal ‹__consumer_offsets› topic.

- **Auto commit** (‹enable.auto.commit=true›) commits periodically — can commit before processing finishes (loss) or after a crash replay (duplicates).
- **Manual commit** – commit after successful processing (‹commitSync›/‹commitAsync›), or in Spring Kafka use ‹AckMode.RECORD/BATCH/MANUAL›.

Spring Kafka defaults to committing after the listener returns (BATCH ack mode) with auto-commit disabled.`,
    k:"Commit after processing for at-least-once." },
  { l:"I", t:"Spring Kafka", q:"How do you produce and consume messages with Spring Kafka?",
    a:`~~~java
@Service
class AlarmPublisher {
  private final KafkaTemplate<String, AlarmEvent> kafka;
  void publish(AlarmEvent e) {
    kafka.send("alarms.raised", e.deviceId(), e)
         .whenComplete((r, ex) -> { if (ex != null) log.error("publish failed", ex); });
  }
}

@Component
class AlarmListener {
  @KafkaListener(topics = "alarms.raised", groupId = "rule-engine", concurrency = "6")
  void onAlarm(AlarmEvent e, @Header(KafkaHeaders.RECEIVED_PARTITION) int partition) {
    ruleEngine.evaluate(e);
  }
}
~~~

Configure JSON/Avro serializers, ‹concurrency› ≤ partitions, error handlers and observation (tracing) in ‹application.yml›.`,
    k:"KafkaTemplate to send, @KafkaListener to consume, concurrency ≤ partitions." },
  { l:"A", t:"Error Handling", q:"How do you handle poison messages and retries in Spring Kafka?",
    a:`- Use ‹DefaultErrorHandler› with a ‹BackOff› (e.g. 3 attempts, exponential) and a ‹DeadLetterPublishingRecoverer› → ‹alarms.raised.DLT›.
- Classify exceptions: non-retryable (deserialization, validation) go straight to DLT.
- ‹ErrorHandlingDeserializer› prevents deserialization failures from blocking the partition forever.
- For long delays without blocking the partition use **non-blocking retries** (‹@RetryableTopic› with retry topics).
- Monitor DLT size; build a replay tool after fixes.`,
    k:"Bounded retries, DLT for poison pills, non-blocking retry topics for long delays." },
  { l:"A", t:"Ordering", q:"How do you guarantee ordering of events per entity?",
    a:`- Use the entity ID as the **message key** so its events land in one partition.
- Idempotent producer (keeps order across retries); ‹max.in.flight.requests.per.connection ≤ 5› with idempotence.
- Consumers process a partition sequentially (Spring Kafka's concurrency is per partition; avoid handing records to async thread pools without per-key sequencing).
- Retry topics break ordering — use blocking retries where order is critical.
- Include version/timestamp in events so consumers can ignore stale updates.`,
    k:"Same key → same partition → sequential processing; guard with versions." },
  { l:"I", t:"Operations", q:"What is consumer lag and how do you fix growing lag?",
    a:`Lag = latest offset in a partition − consumer group's committed offset. Growing lag means consumers can't keep up (delayed alerts!).

Fixes:
- Scale consumers (up to partition count); add partitions if needed (plan for key remapping).
- Optimise processing: batch DB writes, avoid synchronous remote calls per message, use async I/O.
- Check for rebalancing storms, slow poison messages, GC pauses, DB contention.
- Tune ‹max.poll.records›, ‹fetch.min.bytes›.
- Monitor lag (Burrow, Kafka exporter, MSK metrics) with alerts on lag/time-lag.`,
    k:"Lag = falling behind; scale, batch, remove per-message blocking calls." },
  { l:"I", t:"Design", q:"How many partitions should a topic have?",
    a:`Partitions = unit of parallelism. Estimate: target throughput ÷ per-consumer throughput (and per-partition producer throughput), plus headroom for growth. More partitions mean more parallelism but more open files, longer leader elections, more memory in clients and larger rebalances.

Typical: start with 6–12 for moderate topics, scale based on measurements. Increasing later is possible but remaps keys; decreasing isn't supported.`,
    k:"Size for peak consumer parallelism with headroom; avoid excessive counts." },
  { l:"A", t:"Design", q:"Kafka vs RabbitMQ vs SQS — when to use which?",
    a:`- **Kafka** – high-throughput event streaming, retention and replay, multiple independent consumer groups, ordering per key, stream processing.
- **RabbitMQ** – flexible routing (exchanges), per-message acknowledgement, priorities, request/reply, lower throughput; messages removed after consumption.
- **SQS** – fully managed queue, zero ops, at-least-once, scales automatically; FIFO for ordering; no replay.

Use Kafka for event backbones (alarm streams, analytics); RabbitMQ/SQS for task queues and simple work distribution.`,
    k:"Kafka = replayable stream; Rabbit/SQS = work queues." },
  { l:"A", t:"Design", q:"What are log compaction and retention policies?",
    a:`- **Delete retention** – remove segments older than ‹retention.ms› or beyond ‹retention.bytes›.
- **Compaction** (‹cleanup.policy=compact›) – keep at least the **latest value per key**; older values are removed; a null value (tombstone) deletes the key. Perfect for state/changelog topics (latest device status, config) and Kafka Streams state stores.

Can be combined: ‹compact,delete›.`,
    k:"Retention deletes by age/size; compaction keeps the latest per key." },
  { l:"A", t:"Schema", q:"How do you manage message schemas and evolution?",
    a:`Use a **Schema Registry** (Confluent, AWS Glue Schema Registry) with Avro/Protobuf/JSON Schema. Producers register schemas; messages carry a schema ID; consumers deserialize accordingly.

Compatibility modes: **BACKWARD** (new consumers read old data — add optional fields with defaults), **FORWARD**, **FULL**. Never rename/remove required fields without a migration. For JSON without a registry, version events (‹eventVersion›) and use tolerant readers.`,
    k:"Schema registry + compatibility rules = safe evolution." },
  { l:"A", t:"Streams", q:"What is Kafka Streams and when would you use it?",
    a:`A Java library for stateful stream processing directly on Kafka: ‹KStream›/‹KTable›, filtering, mapping, joins, **windowed aggregations** (alarm counts per site per minute), with local RocksDB state backed by changelog topics and exactly-once processing.

Use for real-time aggregations, enrichment joins, deduplication and alerting thresholds without running a separate cluster (alternatives: Apache Flink, ksqlDB).`,
    k:"Library-based stateful stream processing with exactly-once." },
  { l:"I", t:"Connect", q:"What is Kafka Connect and CDC with Debezium?",
    a:`**Kafka Connect** runs source/sink connectors that move data between Kafka and external systems (JDBC, S3, Elasticsearch) without custom code.

**Debezium** is a CDC source connector reading database transaction logs (PostgreSQL WAL, MySQL binlog) and emitting change events — ideal for implementing the **transactional outbox** (outbox event router) or syncing read models with low latency.`,
    k:"Connect moves data; Debezium turns DB changes into events." },
  { l:"B", t:"WebSockets", q:"What is WebSocket and how does it differ from HTTP polling and SSE?",
    a:`WebSocket upgrades an HTTP connection to a persistent, full-duplex TCP channel — server and client can push messages at any time with low overhead.

- **Short polling** – repeated requests; simple, wasteful, delayed.
- **Long polling** – server holds the request until data arrives.
- **Server-Sent Events (SSE)** – one-way server → client stream over HTTP, auto-reconnect; great for notifications.
- **WebSocket** – bidirectional; best for interactive real-time dashboards (alarms + acknowledgements).`,
    k:"WebSocket = persistent bidirectional channel; SSE for one-way pushes." },
  { l:"A", t:"WebSockets", q:"How do you scale WebSocket connections across multiple instances?",
    a:`Challenges: connections are sticky to one instance, but events may be produced anywhere.

Solutions:
- Each WebSocket instance consumes alarm events from Kafka with a **unique consumer group** (fan-out) and pushes to its own connected clients filtered by subscription.
- Or use a broker relay (STOMP over RabbitMQ/ActiveMQ) or Redis pub/sub so any instance can publish to any user.
- Load balancer with WebSocket support (ALB) and long idle timeouts; heartbeats/pings.
- Track connection counts and memory; limit per-user subscriptions; authenticate on handshake (JWT) and authorize topic subscriptions.
- Clients reconnect with backoff and backfill missed events via REST using the last event ID.`,
    k:"Fan-out events to every gateway instance; auth on handshake; reconnect + backfill." },
  { l:"A", t:"Design", q:"How would you deduplicate alarm events in a streaming pipeline?",
    a:`- Assign a deterministic **event ID** at the source (device + type + timestamp bucket).
- Consumers keep a **processed-ID store** (PostgreSQL unique constraint, Redis ‹SET NX› with TTL) and skip duplicates.
- For "flapping" alarms, apply **windowed suppression** (Kafka Streams: same device/type within 60 s → increment count instead of new alarm).
- Make downstream writes upserts.`,
    k:"Deterministic IDs + idempotent store + windowed suppression." },
  { l:"I", t:"Operations", q:"How do you secure a Kafka cluster?",
    a:`- **Encryption**: TLS in transit; encryption at rest (EBS/KMS on MSK).
- **Authentication**: SASL/SCRAM, mTLS, or IAM auth on MSK.
- **Authorization**: ACLs per topic/group (least privilege: alarm-service can write ‹alarms.*›, notification-service can only read).
- Private networking (no public brokers), audit logs, quotas to prevent noisy clients.`,
    k:"TLS + authenticated clients + topic ACLs + private network." },
  { l:"E", t:"Scenario", q:"Scenario: after a deploy, consumers rebalance every few minutes and lag explodes. Why?",
    a:`Likely causes:
- Processing a poll batch takes longer than ‹max.poll.interval.ms› (new slow code path, slow DB) → consumer is kicked out → rebalance loop.
- Heartbeat/session timeouts due to long GC pauses or CPU throttling in containers.
- Rolling deploy restarting consumers frequently without static membership.

Fix: reduce ‹max.poll.records›, speed up processing or hand off safely, raise ‹max.poll.interval.ms›, use cooperative-sticky assignor and static membership, right-size container CPU/memory, and alert on rebalance rate.`,
    k:"Rebalance storms usually mean poll loops are too slow for max.poll.interval.ms." },
  { l:"E", t:"Scenario", q:"Scenario: design the real-time alert flow from camera analytics to an operator's screen in under 2 seconds.",
    a:`1. Edge analytics detects an event → HTTPS/gRPC ingest (or MQTT/IoT Core) with device auth.
2. Ingest service validates, assigns event ID, publishes to Kafka ‹alarms.raised› keyed by camera ID (‹acks=all›, ‹linger.ms› small for latency).
3. Rule engine consumer enriches (site, zone, schedule from cache), deduplicates, assigns severity → ‹alarms.enriched›.
4. Persistence consumer upserts into PostgreSQL; notification service handles SMS/email.
5. WebSocket gateway consumes ‹alarms.enriched› and pushes to subscribed operators (STOMP topic per site) — Angular batches renders.
6. SLO: measure end-to-end latency with event timestamps at each hop; alert on p99 > 2 s and on consumer lag.`,
    k:"Ingest → Kafka → enrich/dedupe → fan-out to DB, notifications and WebSocket — measured per hop." },
  { l:"I", t:"Basics", q:"Why is Kafka so fast?",
    a:`- **Sequential disk I/O** on append-only logs (sequential writes are fast even on HDDs).
- Heavy use of the OS **page cache**.
- **Zero-copy** transfer (‹sendfile›) from page cache to network socket.
- **Batching** and **compression** of records end to end.
- Partitioning for parallelism across brokers and consumers.
- Simple broker design: consumers track their own offsets.`,
    k:"Sequential I/O, page cache, zero-copy, batching, partitions." }
]);
