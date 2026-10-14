ATLAS.addTrack({
  id: "database", title: "Database & SQL", icon: "🗄", color: "#3b82f6", accent: "#93c5fd",
  tagline: "SQL, indexing, transactions, PostgreSQL, MySQL & MongoDB",
  blurb: "SQL fundamentals and query-writing rounds, indexes and execution plans, isolation and locking, PostgreSQL internals (MVCC, VACUUM, JSONB, partitioning), MySQL, SQL Server and MongoDB."
}, [
  // ───────── Fundamentals ─────────
  { l:"B", t:"Fundamentals", q:"What is the difference between SQL and NoSQL databases?",
    a:`**SQL (relational)** databases store data in tables with fixed schemas, enforce relationships with foreign keys, support joins and ACID transactions (PostgreSQL, MySQL, SQL Server).

**NoSQL** databases use flexible models — document (MongoDB), key-value (Redis, DynamoDB), wide-column (Cassandra), graph (Neo4j) — and often scale horizontally with tunable consistency.

Choose relational for strong consistency, complex queries and relationships (financial data, configuration). Choose NoSQL for flexible schemas, massive scale or specific access patterns (sessions, events, time series). Many systems use both (polyglot persistence).`,
    k:"Relational for integrity and joins; NoSQL for flexible schema and specific scale patterns." },
  { l:"B", t:"Fundamentals", q:"Explain primary key, foreign key, unique key and candidate key.",
    a:`- **Primary key** – uniquely identifies a row; not null; one per table (can be composite).
- **Candidate key** – any column set that could be a primary key.
- **Unique key** – enforces uniqueness; can allow NULLs (database-dependent rules).
- **Foreign key** – references a primary/unique key in another table; enforces referential integrity with ‹ON DELETE CASCADE / SET NULL / RESTRICT›.
- **Surrogate vs natural key** – generated IDs (bigint/UUID) vs business values (email). Surrogates are stable; keep natural keys unique with constraints.`,
    k:"PK identifies, FK relates, unique constraints protect business rules." },
  { l:"B", t:"Fundamentals", q:"Explain DDL, DML, DCL and TCL commands.",
    a:`- **DDL** (definition): ‹CREATE›, ‹ALTER›, ‹DROP›, ‹TRUNCATE›.
- **DML** (manipulation): ‹SELECT›, ‹INSERT›, ‹UPDATE›, ‹DELETE›, ‹MERGE›.
- **DCL** (control): ‹GRANT›, ‹REVOKE›.
- **TCL** (transactions): ‹BEGIN›, ‹COMMIT›, ‹ROLLBACK›, ‹SAVEPOINT›.

Note: in PostgreSQL, DDL is transactional (can be rolled back); in MySQL, DDL causes an implicit commit.`,
    k:"Define, manipulate, control access, control transactions." },
  { l:"B", t:"Fundamentals", q:"DELETE vs TRUNCATE vs DROP?",
    a:`- **DELETE** – removes selected rows (WHERE), logs each row, fires triggers, can be rolled back, keeps the table.
- **TRUNCATE** – removes all rows quickly by deallocating pages, resets identity (DB-dependent), minimal logging, no row triggers.
- **DROP** – removes the table structure and data entirely.`,
    k:"DELETE rows, TRUNCATE all rows fast, DROP the table." },
  { l:"B", t:"Joins", q:"Explain INNER, LEFT, RIGHT, FULL OUTER, CROSS and SELF joins.",
    a:`- **INNER JOIN** – rows with matches in both tables.
- **LEFT JOIN** – all rows from the left, matching right rows or NULLs (devices with or without alarms).
- **RIGHT JOIN** – mirror of LEFT.
- **FULL OUTER JOIN** – all rows from both sides.
- **CROSS JOIN** – Cartesian product.
- **SELF JOIN** – a table joined to itself (employee → manager).

~~~sql
SELECT d.name, COUNT(a.id) AS open_alarms
FROM device d
LEFT JOIN alarm a ON a.device_id = d.id AND a.status = 'OPEN'
GROUP BY d.name;
~~~

Note the filter on the right table goes into the ‹ON› clause — putting it in ‹WHERE› turns the LEFT JOIN into an INNER JOIN.`,
    k:"Filters on the optional side of a LEFT JOIN belong in ON, not WHERE." },
  { l:"B", t:"Querying", q:"WHERE vs HAVING, and the logical order of SQL execution?",
    a:`Logical order: ‹FROM/JOIN› → ‹WHERE› → ‹GROUP BY› → ‹HAVING› → ‹SELECT› → ‹DISTINCT› → ‹ORDER BY› → ‹LIMIT/OFFSET›.

‹WHERE› filters rows before grouping; ‹HAVING› filters groups after aggregation.

~~~sql
SELECT site_id, COUNT(*) AS critical
FROM alarm
WHERE severity = 'CRITICAL'
GROUP BY site_id
HAVING COUNT(*) > 10;
~~~

That's also why you can't use a SELECT alias in WHERE in most databases.`,
    k:"WHERE filters rows, HAVING filters groups." },
  { l:"B", t:"Querying", q:"UNION vs UNION ALL? And what are subqueries vs correlated subqueries?",
    a:`- ‹UNION› removes duplicates (sort/hash cost); ‹UNION ALL› keeps all rows — faster; use it when duplicates are impossible or acceptable.
- A **subquery** runs independently (‹WHERE device_id IN (SELECT id FROM device WHERE site_id = 5)›).
- A **correlated subquery** references the outer query and conceptually runs per outer row:

~~~sql
SELECT d.* FROM device d
WHERE EXISTS (SELECT 1 FROM alarm a WHERE a.device_id = d.id AND a.status = 'OPEN');
~~~

‹EXISTS› stops at the first match and handles NULLs better than ‹NOT IN› (‹NOT IN› with a NULL in the subquery returns no rows!).`,
    k:"UNION ALL unless you need dedup; prefer EXISTS/NOT EXISTS over NOT IN." },
  { l:"B", t:"Design", q:"What is normalization? Explain 1NF, 2NF, 3NF and BCNF.",
    a:`Normalization organises data to reduce redundancy and update anomalies.
- **1NF** – atomic values, no repeating groups.
- **2NF** – 1NF + no partial dependency on part of a composite key.
- **3NF** – 2NF + no transitive dependency (non-key → non-key), e.g. don't store ‹site_name› in ‹alarm› when it depends on ‹site_id›.
- **BCNF** – every determinant is a candidate key.

**Denormalization** deliberately duplicates data for read performance (reporting tables, materialized views, read models) — accept it when you control how duplicates stay in sync.`,
    k:"Normalize for integrity; denormalize deliberately for reads." },
  // ───────── SQL writing ─────────
  { l:"I", t:"SQL Practice", q:"Write a query for the 2nd (or Nth) highest salary.",
    a:`~~~sql
-- Using DENSE_RANK (handles ties, works for any N)
SELECT salary FROM (
  SELECT salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS rnk
  FROM employee
) t WHERE rnk = 2;

-- Using OFFSET
SELECT DISTINCT salary FROM employee ORDER BY salary DESC OFFSET 1 LIMIT 1;

-- Classic subquery
SELECT MAX(salary) FROM employee WHERE salary < (SELECT MAX(salary) FROM employee);
~~~

Mention ties (DENSE_RANK vs RANK vs ROW_NUMBER) and what to return when no Nth value exists.`,
    k:"DENSE_RANK solves Nth-highest with ties." },
  { l:"I", t:"SQL Practice", q:"Find duplicate rows and delete duplicates keeping one.",
    a:`~~~sql
-- find duplicates
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- delete duplicates, keep lowest id (PostgreSQL)
DELETE FROM users u
USING users d
WHERE u.email = d.email AND u.id > d.id;

-- portable with ROW_NUMBER
DELETE FROM users WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY email ORDER BY id) rn FROM users
  ) x WHERE rn > 1
);
~~~

Then add a unique constraint so it can't happen again.`,
    k:"GROUP BY HAVING finds them; ROW_NUMBER deletes them; a constraint prevents them." },
  { l:"I", t:"SQL Practice", q:"Get the top N rows per group (e.g. latest 3 alarms per device).",
    a:`~~~sql
SELECT * FROM (
  SELECT a.*, ROW_NUMBER() OVER (PARTITION BY device_id ORDER BY created_at DESC) AS rn
  FROM alarm a
) t
WHERE rn <= 3;

-- PostgreSQL alternative with LATERAL (efficient with an index on (device_id, created_at))
SELECT d.id, a.*
FROM device d
CROSS JOIN LATERAL (
  SELECT * FROM alarm WHERE device_id = d.id ORDER BY created_at DESC LIMIT 3
) a;
~~~`,
    k:"ROW_NUMBER() OVER (PARTITION BY ...) or LATERAL for top-N per group." },
  { l:"I", t:"Window Functions", q:"What are window functions? Show running totals and moving averages.",
    a:`Window functions compute values across related rows **without collapsing them** like GROUP BY.

~~~sql
SELECT day, alarms,
  SUM(alarms) OVER (ORDER BY day) AS running_total,
  AVG(alarms) OVER (ORDER BY day ROWS BETWEEN 6 PRECEDING AND CURRENT ROW) AS avg_7d,
  alarms - LAG(alarms) OVER (ORDER BY day) AS change_vs_yesterday,
  RANK() OVER (PARTITION BY site_id ORDER BY alarms DESC) AS rank_in_site
FROM daily_alarm_stats;
~~~

Common functions: ‹ROW_NUMBER›, ‹RANK›, ‹DENSE_RANK›, ‹NTILE›, ‹LAG/LEAD›, ‹FIRST_VALUE›, aggregates with ‹OVER›. Perfect for dashboards and analytics.`,
    k:"Window functions = per-row analytics over a partition without losing rows." },
  { l:"I", t:"SQL Practice", q:"Find employees who earn more than their manager / departments with no employees.",
    a:`~~~sql
-- self join
SELECT e.name
FROM employee e
JOIN employee m ON e.manager_id = m.id
WHERE e.salary > m.salary;

-- anti-join
SELECT d.name
FROM department d
LEFT JOIN employee e ON e.dept_id = d.id
WHERE e.id IS NULL;
-- or: WHERE NOT EXISTS (SELECT 1 FROM employee e WHERE e.dept_id = d.id)
~~~`,
    k:"Self joins for hierarchies; LEFT JOIN ... IS NULL or NOT EXISTS for anti-joins." },
  { l:"I", t:"SQL Practice", q:"What are CTEs and recursive CTEs?",
    a:`A Common Table Expression (‹WITH›) names a subquery for readability and reuse within a statement.

~~~sql
-- recursive: full reporting chain under a manager
WITH RECURSIVE chain AS (
  SELECT id, name, manager_id, 1 AS depth FROM employee WHERE id = 42
  UNION ALL
  SELECT e.id, e.name, e.manager_id, c.depth + 1
  FROM employee e JOIN chain c ON e.manager_id = c.id
)
SELECT * FROM chain;
~~~

Uses: hierarchies (org charts, site → zone → device trees), graph walks, generating date series. In PostgreSQL 12+ CTEs are inlined unless marked ‹MATERIALIZED›.`,
    k:"CTEs for readability; recursive CTEs for trees and hierarchies." },
  { l:"I", t:"SQL Practice", q:"How do you pivot rows into columns (e.g. alarm counts by severity per site)?",
    a:`~~~sql
SELECT site_id,
  COUNT(*) FILTER (WHERE severity = 'CRITICAL') AS critical,
  COUNT(*) FILTER (WHERE severity = 'MAJOR')    AS major,
  COUNT(*) FILTER (WHERE severity = 'MINOR')    AS minor
FROM alarm
GROUP BY site_id;

-- portable form
SUM(CASE WHEN severity = 'CRITICAL' THEN 1 ELSE 0 END) AS critical
~~~

SQL Server also has ‹PIVOT›; PostgreSQL has ‹crosstab› in tablefunc.`,
    k:"Conditional aggregation pivots portably." },
  { l:"I", t:"SQL Practice", q:"How do you write an upsert (insert or update)?",
    a:`~~~sql
-- PostgreSQL
INSERT INTO device_status (device_id, status, updated_at)
VALUES (:id, :status, now())
ON CONFLICT (device_id) DO UPDATE
SET status = EXCLUDED.status, updated_at = EXCLUDED.updated_at
WHERE device_status.updated_at < EXCLUDED.updated_at;   -- ignore stale events

-- MySQL
INSERT ... ON DUPLICATE KEY UPDATE status = VALUES(status);

-- SQL Server / standard
MERGE INTO device_status t USING (...) s ON ... WHEN MATCHED THEN UPDATE ... WHEN NOT MATCHED THEN INSERT ...;
~~~

Upserts make Kafka consumers **idempotent** — reprocessing the same event leaves the same state.`,
    k:"ON CONFLICT DO UPDATE = atomic, idempotent writes." },
  // ───────── Indexes ─────────
  { l:"B", t:"Indexes", q:"What is an index and when can it hurt?",
    a:`An index is an extra data structure (usually a B-tree) that lets the database find rows without scanning the whole table — speeding up WHERE, JOIN, ORDER BY and uniqueness checks.

Costs: extra storage, slower INSERT/UPDATE/DELETE (every index must be maintained), more vacuum/maintenance work, and unused indexes waste memory. Low-selectivity columns (boolean flags) rarely benefit unless partial indexes are used. Choose indexes based on actual query patterns and execution plans.`,
    k:"Indexes trade write cost and storage for read speed." },
  { l:"I", t:"Indexes", q:"Clustered vs non-clustered indexes?",
    a:`- **Clustered index** – table rows are physically stored in index order; one per table. MySQL InnoDB clusters by primary key; SQL Server lets you choose.
- **Non-clustered (secondary)** – separate structure pointing to rows (InnoDB stores the PK in secondary indexes, so a lookup may need a second "bookmark" lookup).
- PostgreSQL tables are **heaps**; all indexes are secondary (‹CLUSTER› reorders once but isn't maintained).

Implication for MySQL: keep primary keys short and monotonic (bigint), random UUIDv4 PKs cause page splits — prefer UUIDv7/ULID if you need UUIDs.`,
    k:"Clustered = data order; InnoDB clusters by PK, PostgreSQL uses heaps." },
  { l:"I", t:"Indexes", q:"How do composite indexes work (leftmost prefix rule)?",
    a:`A composite index on ‹(site_id, status, created_at)› is sorted by site_id, then status, then created_at. It can serve queries filtering on:
- ‹site_id›
- ‹site_id, status›
- ‹site_id, status› + ORDER BY ‹created_at›
but **not** efficiently on ‹status› alone or ‹created_at› alone.

Guideline: equality columns first, then range/sort columns; put the most commonly filtered columns leftmost. A range condition stops later columns from being used for seeking.`,
    k:"Equality columns first, range/sort last; leftmost prefix must be used." },
  { l:"A", t:"Indexes", q:"What are covering, partial, expression and GIN/BRIN indexes in PostgreSQL?",
    a:`- **Covering** – ‹CREATE INDEX ON alarm (device_id) INCLUDE (status, severity)› enables index-only scans.
- **Partial** – ‹CREATE INDEX ON alarm (created_at) WHERE status = 'OPEN'› — tiny index for hot subsets.
- **Expression** – ‹CREATE INDEX ON users (lower(email))› for case-insensitive lookups.
- **GIN** – inverted index for JSONB (‹@>›), arrays and full-text search.
- **BRIN** – tiny block-range index for huge append-only, naturally ordered tables (time-series events).
- **Hash**, **GiST** (geo/ranges), **SP-GiST** for special cases.
- Build in production with ‹CREATE INDEX CONCURRENTLY› to avoid blocking writes.`,
    k:"Pick the index type for the query shape — and create it CONCURRENTLY." },
  { l:"A", t:"Indexes", q:"Why might the database not use your index?",
    a:`- Function or cast on the column (‹WHERE DATE(created_at) = ...›, implicit type conversion).
- Leading wildcard (‹LIKE '%abc'›).
- Low selectivity — scanning is cheaper than random I/O.
- Composite index not matching the leftmost prefix.
- ‹OR› conditions across different columns.
- Outdated statistics → bad estimates (run ‹ANALYZE›).
- Small tables where a seq scan is faster.
- Parameter-sniffing/generic plans with skewed data.

Rewrite as sargable predicates: ‹created_at >= '2026-01-01' AND created_at < '2026-01-02'›.`,
    k:"Keep predicates sargable and statistics fresh." },
  { l:"A", t:"Performance", q:"How do you read an execution plan and tune a slow query?",
    a:`1. Reproduce with real parameters; run ‹EXPLAIN (ANALYZE, BUFFERS)› (PostgreSQL) or ‹EXPLAIN ANALYZE› (MySQL 8).
2. Read bottom-up: find the nodes with the highest actual time and rows.
3. Compare **estimated vs actual rows** — big mismatches mean bad statistics.
4. Look for Seq Scans on large tables, Nested Loops over many rows, Sorts spilling to disk, Hash joins with huge batches.
5. Fix: add/adjust indexes, rewrite predicates, reduce selected columns, paginate with keyset, update stats, increase ‹work_mem› for sorts, denormalize or pre-aggregate.
6. Verify the new plan and measure under load; use ‹pg_stat_statements› to find the top offenders in the first place.`,
    k:"EXPLAIN ANALYZE, find the expensive node, compare estimates vs actuals, fix, re-measure." },
  { l:"A", t:"Performance", q:"How do you design pagination for a very large table?",
    a:`**Offset pagination** (‹LIMIT 50 OFFSET 100000›) must read and discard all skipped rows — slow on deep pages and inconsistent while data changes.

**Keyset (seek) pagination** uses the last seen sort key:
~~~sql
SELECT * FROM alarm
WHERE (created_at, id) < (:lastCreatedAt, :lastId)
ORDER BY created_at DESC, id DESC
LIMIT 50;
~~~
With an index on ‹(created_at DESC, id DESC)› every page is equally fast and stable under inserts. Trade-off: no "jump to page 500" — return an opaque cursor instead.`,
    k:"Keyset pagination: constant-time pages using a unique sort key." },
  // ───────── Transactions ─────────
  { l:"I", t:"Transactions", q:"Explain ACID properties.",
    a:`- **Atomicity** – all statements in a transaction succeed or none do (rollback).
- **Consistency** – constraints and invariants hold before and after.
- **Isolation** – concurrent transactions don't see each other's intermediate state (to a configurable degree).
- **Durability** – once committed, data survives crashes (WAL/redo logs, fsync).

Example: acknowledging an alarm and writing its audit record must be atomic.`,
    k:"All-or-nothing, valid, isolated, durable." },
  { l:"A", t:"Transactions", q:"Explain isolation levels and the anomalies they prevent.",
    a:`Isolation levels define which concurrency anomalies (dirty, non-repeatable and phantom reads) a transaction can observe.

- **Read Uncommitted** – allows all anomalies (PostgreSQL treats it as Read Committed).
- **Read Committed** – no dirty reads; each statement sees committed data at its start. PostgreSQL & SQL Server default.
- **Repeatable Read** – same rows re-read return the same values; MySQL InnoDB default (gap locks prevent most phantoms); PostgreSQL's snapshot isolation also prevents phantoms.
- **Serializable** – as if transactions ran one at a time; PostgreSQL uses SSI and may abort with serialization failures that must be retried.

Other anomalies: **lost update** and **write skew** — handle with ‹SELECT ... FOR UPDATE›, optimistic version columns, constraints or Serializable.`,
    k:"Higher isolation = fewer anomalies, more blocking or retries." },
  { l:"A", t:"Concurrency", q:"What is MVCC and how does PostgreSQL implement it?",
    a:`Multi-Version Concurrency Control lets readers and writers not block each other: each transaction sees a **snapshot** of data.

In PostgreSQL, an UPDATE writes a **new row version** (tuple) with ‹xmin›/‹xmax› transaction IDs; old versions stay until no transaction needs them. Visibility rules use these IDs and the snapshot.

Consequences: dead tuples accumulate → **VACUUM** reclaims them and updates the visibility map; long-running transactions prevent cleanup and cause **bloat**; transaction ID wraparound must be prevented by autovacuum freezing. MySQL InnoDB uses undo logs for older versions instead.`,
    k:"Writers create new versions; VACUUM cleans old ones; long transactions cause bloat." },
  { l:"A", t:"Concurrency", q:"What causes deadlocks in a database and how do you handle them?",
    a:`Two transactions lock resources in opposite order and wait for each other. The database detects the cycle and aborts one (PostgreSQL ‹deadlock detected›, MySQL error 1213).

Prevention:
- Access tables/rows in a **consistent order** (e.g. sort IDs before updating).
- Keep transactions short; don't wait for user input or remote calls while holding locks.
- Use appropriate indexes so updates lock fewer rows.
- Use ‹SELECT ... FOR UPDATE SKIP LOCKED› for job queues.

Handling: retry the aborted transaction with backoff (idempotently), and log deadlock details (‹log_lock_waits›, ‹SHOW ENGINE INNODB STATUS›).`,
    k:"Consistent lock order, short transactions, retry on deadlock." },
  { l:"A", t:"Concurrency", q:"Optimistic vs pessimistic locking at the database level?",
    a:`- **Pessimistic** – lock before modifying: ‹SELECT ... FOR UPDATE› (others wait) or ‹NOWAIT›/‹SKIP LOCKED›. Good for high contention.
- **Optimistic** – read freely; on update check a version: ‹UPDATE rule SET ..., version = version + 1 WHERE id = ? AND version = ?›. If 0 rows updated, someone else changed it → retry/409. Good for low contention and web flows.

Also: **advisory locks** in PostgreSQL (‹pg_try_advisory_lock›) for app-level mutual exclusion such as one scheduler instance running a job.`,
    k:"Pessimistic blocks; optimistic detects; advisory locks coordinate apps." },
  { l:"I", t:"Transactions", q:"How does SELECT ... FOR UPDATE SKIP LOCKED help build a job queue?",
    a:`Multiple workers can claim different rows without blocking each other:

~~~sql
WITH next AS (
  SELECT id FROM outbox
  WHERE published = false
  ORDER BY id
  LIMIT 100
  FOR UPDATE SKIP LOCKED
)
UPDATE outbox o SET published = true, published_at = now()
FROM next WHERE o.id = next.id
RETURNING o.*;
~~~

Each worker locks a batch; rows locked by others are skipped. Great for transactional outbox relays and background jobs in PostgreSQL/MySQL 8.`,
    k:"SKIP LOCKED = concurrent workers without double-processing." },
  // ───────── PostgreSQL ─────────
  { l:"I", t:"PostgreSQL", q:"What PostgreSQL features do you use beyond standard SQL?",
    a:`- **JSONB** with GIN indexes for flexible attributes (device metadata).
- **Arrays**, **enums**, **ranges**, **generated columns**.
- **CTEs**, **LATERAL**, window functions, ‹FILTER›.
- ‹ON CONFLICT› upserts, ‹RETURNING›.
- **Partitioning** (range/list/hash) for time-series alarm data.
- **Materialized views** for dashboards (‹REFRESH MATERIALIZED VIEW CONCURRENTLY›).
- **LISTEN/NOTIFY** for lightweight pub/sub.
- Extensions: ‹pg_stat_statements›, ‹pg_trgm› (fuzzy search), PostGIS, TimescaleDB.`,
    k:"JSONB, partitioning, upserts, materialized views and extensions." },
  { l:"A", t:"PostgreSQL", q:"When would you use JSONB and how do you index it?",
    a:`Use JSONB for semi-structured, sparse or evolving attributes (per-device vendor metadata, rule configuration) while keeping core, frequently queried fields as normal columns.

~~~sql
CREATE INDEX idx_device_meta ON device USING GIN (metadata jsonb_path_ops);
SELECT * FROM device WHERE metadata @> '{"vendor":"Axis","firmware":"10.2"}';
CREATE INDEX ON device ((metadata->>'vendor'));           -- expression index for one key
~~~

Avoid JSONB for data needing constraints, foreign keys or frequent partial updates of large documents (rewrites the whole value).`,
    k:"JSONB for flexible attributes; columns for core fields; GIN for containment queries." },
  { l:"A", t:"PostgreSQL", q:"What is table partitioning and how is it different from sharding?",
    a:`**Partitioning** splits one logical table into child tables **within one database** (e.g. ‹alarm› partitioned by month on ‹created_at›).

~~~sql
CREATE TABLE alarm (...) PARTITION BY RANGE (created_at);
CREATE TABLE alarm_2026_10 PARTITION OF alarm FOR VALUES FROM ('2026-10-01') TO ('2026-11-01');
~~~

Benefits: partition pruning speeds queries, cheap retention (‹DROP›/‹DETACH› old partitions instead of huge DELETEs), smaller indexes, maintenance per partition.

**Sharding** spreads data across **multiple database servers** by a shard key (tenant, region) to scale writes and storage — at the cost of cross-shard queries, transactions and rebalancing (Citus, Vitess, application-level routing).`,
    k:"Partitioning = one server, many tables; sharding = many servers." },
  { l:"A", t:"PostgreSQL", q:"What are VACUUM, autovacuum and table bloat?",
    a:`Due to MVCC, updates/deletes leave dead tuples. **VACUUM** marks their space reusable, updates the visibility map (for index-only scans) and freezes old transaction IDs to prevent wraparound. **VACUUM FULL** rewrites the table to shrink it but takes an exclusive lock (use ‹pg_repack› online instead).

Autovacuum runs automatically; tune per hot table (‹autovacuum_vacuum_scale_factor› lower for big, frequently updated tables). Watch for long-running/idle-in-transaction sessions that block cleanup and cause bloat.`,
    k:"VACUUM reclaims dead tuples; long transactions defeat it." },
  { l:"I", t:"PostgreSQL", q:"What are views and materialized views?",
    a:`- A **view** is a stored query; no data stored; always current; simplifies access and security.
- A **materialized view** stores query results physically; fast reads but stale until refreshed (‹REFRESH MATERIALIZED VIEW CONCURRENTLY› requires a unique index).

Use materialized views for expensive dashboard aggregates refreshed on a schedule (e.g. hourly alarm statistics per site), or maintain summary tables incrementally via Kafka consumers for near-real-time needs.`,
    k:"Views are virtual; materialized views trade freshness for speed." },
  { l:"I", t:"Programmability", q:"Stored procedures, functions and triggers — pros and cons?",
    a:`Pros: logic close to data (less network round trips), reuse across apps, enforce invariants (audit triggers), bulk processing.

Cons: harder to version, test, debug and deploy; vendor lock-in; hidden side effects (triggers); scaling the DB CPU is costlier than scaling app servers.

Rule of thumb: keep business logic in services; use DB functions/triggers for data integrity, auditing (‹updated_at› timestamps, history tables) and performance-critical set-based operations.`,
    k:"Use database code for integrity and set-based work, not core business logic." },
  // ───────── MySQL / SQL Server ─────────
  { l:"I", t:"MySQL", q:"InnoDB vs MyISAM, and important InnoDB concepts?",
    a:`InnoDB (default) supports transactions, row-level locking, foreign keys, crash recovery and MVCC; MyISAM is legacy (table locks, no transactions).

InnoDB essentials: clustered primary key, buffer pool (‹innodb_buffer_pool_size› ≈ 60–75% of RAM on dedicated servers), redo/undo logs, gap and next-key locks under Repeatable Read, doublewrite buffer, ‹innodb_flush_log_at_trx_commit› trade-offs between durability and speed.`,
    k:"Always InnoDB; size the buffer pool; mind gap locks." },
  { l:"I", t:"SQL Server", q:"What SQL Server concepts matter for application developers?",
    a:`- Clustered vs non-clustered indexes, included columns, filtered indexes.
- Isolation: Read Committed by default; enable **RCSI** (‹READ_COMMITTED_SNAPSHOT›) to reduce reader/writer blocking.
- ‹TOP›, ‹OFFSET FETCH›, ‹MERGE›, ‹OUTPUT› clause, ‹PIVOT›, temp tables vs table variables.
- Parameter sniffing issues with cached plans (‹OPTION (RECOMPILE)›, ‹OPTIMIZE FOR›).
- Query Store, Execution plans in SSMS.
- Typical use: stored procedures computing reporting aggregates consumed by REST APIs.`,
    k:"RCSI, plan caching and indexing strategy dominate SQL Server performance." },
  // ───────── MongoDB ─────────
  { l:"B", t:"MongoDB", q:"What is MongoDB and how do you model data in it?",
    a:`MongoDB is a document database storing BSON documents in collections with flexible schemas.

Modelling is driven by **access patterns**:
- **Embed** data that is read together and bounded (an employee with addresses).
- **Reference** data that is large, unbounded or shared (claims referencing a policy).
- Avoid unbounded arrays (16 MB document limit) — use the bucket pattern for time series.

Typical fits: case-management systems, product catalogues, user profiles and content platforms (Spring Data MongoDB makes it easy from Java).`,
    k:"Model for queries: embed what's read together, reference what grows or is shared." },
  { l:"I", t:"MongoDB", q:"How do indexes, aggregation pipelines and transactions work in MongoDB?",
    a:`- **Indexes**: single-field, compound (ESR rule: Equality, Sort, Range), multikey (arrays), text, TTL (auto-expire sessions), partial and wildcard indexes.
- **Aggregation pipeline**: ‹$match› → ‹$group› → ‹$sort› → ‹$project› → ‹$lookup› (join) → ‹$facet›, put ‹$match› early to use indexes.
- **Transactions**: multi-document ACID transactions since 4.0 (replica sets), but single-document operations are atomic by default — good schema design minimises the need.
- Read/write concerns tune consistency vs latency (‹w: "majority"›).`,
    k:"ESR index rule, early $match, design for single-document atomicity." },
  { l:"A", t:"MongoDB", q:"Replica sets vs sharding in MongoDB?",
    a:`- **Replica set** – one primary + secondaries with automatic failover; provides high availability and read scaling (read preference).
- **Sharding** – distributes data across shards by a shard key with ‹mongos› routers and config servers; provides horizontal write/storage scaling.

Choosing a shard key: high cardinality, even distribution, matches common queries (avoid monotonically increasing keys like timestamps — use hashed sharding or compound keys).`,
    k:"Replica sets for availability; sharding for scale — the shard key is everything." },
  // ───────── Distributed data ─────────
  { l:"A", t:"Distributed Data", q:"Explain the CAP theorem and PACELC.",
    a:`**CAP**: during a network **P**artition, a distributed system must choose between **C**onsistency (every read sees the latest write or errors) and **A**vailability (every request gets a non-error response).

**PACELC** extends it: if Partitioned choose A or C; **E**lse, choose between **L**atency and **C**onsistency.

Examples: a single-primary PostgreSQL with synchronous replication favours consistency; DynamoDB/Cassandra favour availability with eventual consistency and tunable reads; MongoDB with majority concerns leans towards consistency.`,
    k:"Partitions force C vs A; normal operation trades latency vs consistency." },
  { l:"A", t:"Distributed Data", q:"How does database replication work and what is replication lag?",
    a:`The primary writes changes to its log (PostgreSQL WAL, MySQL binlog); replicas replay it.
- **Synchronous** – commit waits for replica ack: no data loss, higher latency.
- **Asynchronous** – faster, but replicas lag and a failover can lose recent commits.

Read replicas scale reads but introduce **read-your-writes** issues: a user saves and immediately reads stale data from a replica. Mitigate by routing reads after writes to the primary for that session, waiting for an LSN, or tolerating staleness for analytics. Monitor lag (‹pg_stat_replication›, ‹ReplicaLag› in CloudWatch).`,
    k:"Async replicas scale reads but lag; route read-after-write to the primary." },
  { l:"A", t:"Distributed Data", q:"How do you scale a database that has become a bottleneck?",
    a:`In rough order of effort:
1. **Fix queries & indexes** (pg_stat_statements, EXPLAIN).
2. **Connection pooling** (HikariCP sizing, PgBouncer/RDS Proxy).
3. **Caching** hot reads (Redis/ElastiCache).
4. **Vertical scaling** (bigger instance, faster storage/IOPS).
5. **Read replicas** for read-heavy workloads and reporting.
6. **Partitioning** and archiving cold data.
7. **CQRS/read models** — separate stores optimised for queries (Elasticsearch, materialized views).
8. **Sharding** or a distributed SQL database (Aurora, Citus, CockroachDB) for write scale.`,
    k:"Optimise first, cache and replicate next, shard last." },
  { l:"I", t:"Operations", q:"How do you approach backups, point-in-time recovery, RPO and RTO?",
    a:`- **RPO** – max acceptable data loss (time). **RTO** – max acceptable downtime.
- Full backups + continuous WAL/binlog archiving enable **point-in-time recovery**; on AWS RDS, automated backups provide PITR within the retention window, plus manual snapshots and cross-region copies.
- Logical dumps (‹pg_dump›) for portability; physical backups for speed.
- **Test restores regularly** — an untested backup is a hope, not a plan.
- Multi-AZ for HA (low RTO), cross-region replicas for disaster recovery.`,
    k:"Define RPO/RTO, enable PITR, and rehearse restores." },
  { l:"I", t:"Security", q:"How do you prevent SQL injection?",
    a:`Never concatenate user input into SQL. Use **parameterized queries / prepared statements** so input is sent as data, not code.

~~~java
jdbc.sql("SELECT * FROM alarm WHERE site_id = :site AND status = :status")
    .param("site", siteId).param("status", status).query(Alarm.class).list();
~~~

JPA named parameters and Spring Data derived queries are safe; dynamic ORDER BY columns must be whitelisted. Add least-privilege DB users, input validation, and avoid exposing DB errors to clients.`,
    k:"Parameterize everything; whitelist identifiers." },
  { l:"I", t:"Design", q:"How do you design a schema for time-series alarm/event data?",
    a:`- Narrow append-only table: ‹(id, device_id, type, severity, payload jsonb, created_at timestamptz)›.
- Partition by time (daily/monthly) for retention and pruning; consider TimescaleDB hypertables.
- Indexes on ‹(device_id, created_at DESC)›; BRIN on ‹created_at› for large scans.
- Pre-aggregated rollup tables (per minute/hour per site) for dashboards.
- Retention policies: drop old partitions or move to S3/Athena for cold analytics.
- Use ‹timestamptz› in UTC.`,
    k:"Append-only, partition by time, index by device+time, roll up for dashboards." },
  { l:"I", t:"Fundamentals", q:"What are constraints and why enforce rules in the database?",
    a:`Constraints: ‹NOT NULL›, ‹UNIQUE›, ‹PRIMARY KEY›, ‹FOREIGN KEY›, ‹CHECK (severity BETWEEN 1 AND 10)›, PostgreSQL ‹EXCLUDE› constraints (no overlapping bookings).

The application can have bugs, multiple writers, scripts and race conditions; the database is the last line of defence. A unique constraint is the only reliable way to prevent duplicates under concurrency — check-then-insert in code is a race.`,
    k:"Constraints enforce invariants that application code cannot guarantee under concurrency." },
  { l:"I", t:"Fundamentals", q:"What are NULL semantics pitfalls in SQL?",
    a:`- ‹NULL = NULL› is unknown, not true — use ‹IS NULL›/‹IS DISTINCT FROM›.
- ‹NOT IN (subquery)› returns nothing if the subquery contains NULL.
- Aggregates ignore NULLs (‹COUNT(col)› vs ‹COUNT(*)›).
- ‹COALESCE(col, 0)› for defaults; ‹NULLIF(a, 0)› to avoid divide-by-zero.
- Unique constraints allow multiple NULLs in PostgreSQL (unless ‹NULLS NOT DISTINCT›, PG15).`,
    k:"NULL is 'unknown' — three-valued logic bites in comparisons and NOT IN." },
  { l:"I", t:"Fundamentals", q:"CHAR vs VARCHAR vs TEXT, and choosing numeric/time types?",
    a:`- PostgreSQL: ‹text› and ‹varchar(n)› perform the same; use ‹varchar(n)› only when the limit is a business rule. ‹char(n)› pads — rarely useful.
- Money: ‹numeric(19,4)›/‹DECIMAL› — never float/double.
- IDs: ‹bigint› identity or UUID (v7 for index locality).
- Time: ‹timestamptz› (stored as UTC), ‹date› for calendar dates, ‹interval› for durations.
- Booleans and enums for states; consider lookup tables when states change often.`,
    k:"Exact decimals for money, timestamptz for time, bigint/UUIDv7 for IDs." },
  { l:"A", t:"Performance", q:"What is the difference between a nested loop, hash join and merge join?",
    a:`- **Nested loop** – for each outer row, look up inner rows (ideally via index). Best when the outer side is small.
- **Hash join** – build a hash table on the smaller input, probe with the larger. Best for large unsorted equi-joins; needs memory (‹work_mem›).
- **Merge join** – both inputs sorted on the join key, then merged. Best when inputs are already sorted/indexed.

When a plan picks a nested loop over millions of rows, the estimates are usually wrong — check statistics and data skew.`,
    k:"Small outer → nested loop; big unsorted → hash; pre-sorted → merge." },
  { l:"E", t:"Scenario", q:"Scenario: a dashboard query that took 200 ms now takes 12 s after data grew. Walk through your fix.",
    a:`1. Capture the exact query and parameters; run ‹EXPLAIN (ANALYZE, BUFFERS)›.
2. Typical findings: sequential scan over a now-huge table; sort spilling to disk; estimates off due to stale stats; OFFSET pagination deep pages.
3. Fixes: composite index matching filter + sort (‹(site_id, created_at DESC)›), partial index on open alarms, keyset pagination, ‹ANALYZE›, select fewer columns.
4. Structural: partition by month and prune; pre-aggregate into a rollup table updated by a Kafka consumer; cache results for 30 s in Redis.
5. Verify under production-like data; add a regression check (query timing in CI or monitoring alert on pg_stat_statements mean time).`,
    k:"EXPLAIN, index for filter+sort, paginate by key, pre-aggregate, monitor." },
  { l:"E", t:"Scenario", q:"Scenario: two operators acknowledge the same alarm simultaneously and both succeed. How do you prevent it?",
    a:`It's a lost-update/race. Options:
- **Conditional update** (atomic, simplest):
~~~sql
UPDATE alarm SET status = 'ACKED', acked_by = :user, acked_at = now()
WHERE id = :id AND status = 'OPEN';
-- 0 rows updated → someone else already acknowledged → return 409 Conflict
~~~
- **Optimistic locking** with a ‹@Version› column in JPA.
- **Pessimistic** ‹SELECT ... FOR UPDATE› if more complex logic must run under the lock.

Then push the state change to all dashboards over WebSocket so the second operator's UI updates.`,
    k:"Make the state transition conditional and atomic; return 409 to the loser." },
  { l:"I", t:"Fundamentals", q:"What is a database cursor, and what are temp tables?",
    a:`A **cursor** iterates over a result set row by row — useful for streaming huge results (JDBC fetch size / PostgreSQL server-side cursors) without loading everything into memory. Row-by-row processing in procedural code is slow compared with set-based SQL.

**Temporary tables** hold intermediate results for a session/transaction — useful for complex multi-step reports or bulk staging before an upsert.`,
    k:"Stream big results with cursors/fetch size; think in sets, not loops." },
  { l:"A", t:"Distributed Data", q:"How do you keep data consistent across microservices that each own a database?",
    a:`Distributed ACID transactions (2PC/XA) are fragile and slow, so prefer:
- **Saga** pattern — local transactions plus compensating actions, orchestrated or choreographed via events.
- **Transactional outbox** to atomically save state and the event to publish.
- **Idempotent consumers** and **upserts** so redelivery is safe.
- **Eventual consistency** in the UX (pending states).
- Reconciliation jobs to detect and repair drift.`,
    k:"Local transactions + outbox + sagas + idempotency = eventual consistency done right." },
  { l:"I", t:"Operations", q:"How do you perform a zero-downtime schema migration on a large table?",
    a:`- Add columns as nullable (PostgreSQL 11+ adds columns with constant defaults instantly).
- Create indexes ‹CONCURRENTLY›.
- Add constraints as ‹NOT VALID› then ‹VALIDATE CONSTRAINT› separately.
- Backfill in small batches with throttling.
- Follow **expand → migrate → contract**: deploy code compatible with both schemas, switch, then remove old columns later.
- Set ‹lock_timeout› so migrations fail fast instead of queueing behind long transactions.
- For MySQL, use online DDL or gh-ost/pt-online-schema-change.`,
    k:"Expand, backfill in batches, contract — with lock timeouts." },
  { l:"I", t:"Querying", q:"What are aggregate functions and GROUP BY ROLLUP / CUBE / GROUPING SETS?",
    a:`Aggregates: ‹COUNT›, ‹SUM›, ‹AVG›, ‹MIN›, ‹MAX›, ‹STRING_AGG›/‹GROUP_CONCAT›, ‹ARRAY_AGG›, ‹PERCENTILE_CONT›.

‹ROLLUP(site, device)› produces subtotals per site and a grand total; ‹CUBE› produces all combinations; ‹GROUPING SETS› lets you choose exact groupings — great for report totals in one query.`,
    k:"ROLLUP/CUBE produce subtotals in a single pass." },
  { l:"B", t:"Fundamentals", q:"What is the difference between a view, a table and a synonym/alias?",
    a:`A **table** stores data. A **view** is a saved SELECT presenting data from tables (can restrict columns/rows for security and simplify joins). A **synonym** (Oracle/SQL Server) is an alternate name for an object. Updatable views exist for simple cases; complex views usually aren't updatable without INSTEAD OF triggers.`,
    k:"Tables store, views present." }
]);
