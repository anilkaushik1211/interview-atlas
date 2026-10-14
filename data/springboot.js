ATLAS.addTrack({
  id: "springboot", title: "Spring Boot", icon: "🌱", color: "#22c55e", accent: "#86efac",
  tagline: "IoC, auto-config, REST, JPA/Hibernate, Security & testing",
  blurb: "Spring Core internals through production-grade Spring Boot 3: REST design, Data JPA performance, transactions, JWT security, WebSockets, actuator and testing."
}, [
  // ───────── Core ─────────
  { l:"B", t:"Core", q:"What is Inversion of Control and Dependency Injection in Spring?",
    a:`**IoC** means the framework, not your code, creates and wires objects. **DI** is how Spring does it: dependencies are supplied to a bean rather than the bean constructing them.

~~~java
@Service
public class AlarmService {
  private final AlarmRepository repo;
  private final KafkaTemplate<String, AlarmEvent> kafka;
  public AlarmService(AlarmRepository repo, KafkaTemplate<String, AlarmEvent> kafka) { // constructor injection
    this.repo = repo; this.kafka = kafka;
  }
}
~~~

Benefits: loose coupling, easy mocking in tests, centralised configuration and lifecycle management.`,
    k:"Spring builds and wires objects; classes just declare what they need." },
  { l:"B", t:"Core", q:"Constructor vs setter vs field injection — which and why?",
    a:`- **Constructor injection** (recommended): dependencies are mandatory, fields can be ‹final›, objects are immutable and testable without Spring, and circular dependencies fail fast.
- **Setter injection**: for optional dependencies or reconfiguration.
- **Field injection** (‹@Autowired› on fields): concise but hides dependencies, prevents ‹final›, needs reflection to test.

With a single constructor, ‹@Autowired› is optional. Lombok ‹@RequiredArgsConstructor› removes boilerplate.`,
    k:"Constructor injection: explicit, immutable, testable." },
  { l:"B", t:"Core", q:"What is Spring Boot and how does it differ from the Spring Framework?",
    a:`Spring Framework provides the core features (IoC container, AOP, MVC, transactions, data access). Spring Boot is an opinionated layer on top that makes it production-ready fast:

- **Auto-configuration** based on the classpath and properties.
- **Starters** (‹spring-boot-starter-web›, ‹-data-jpa›, ‹-security›) with curated, compatible dependency versions.
- **Embedded server** (Tomcat/Jetty/Undertow) → runnable fat JAR.
- **Externalized configuration** and profiles.
- **Actuator** for health, metrics and observability.

Spring is the engine; Boot is the pre-configured car.`,
    k:"Boot = Spring + auto-config + starters + embedded server + actuator." },
  { l:"B", t:"Core", q:"What does @SpringBootApplication do?",
    a:`It combines three annotations:
- ‹@SpringBootConfiguration› (a ‹@Configuration›),
- ‹@EnableAutoConfiguration› – loads auto-configuration classes listed in ‹META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports›,
- ‹@ComponentScan› – scans the package of the main class and sub-packages.

That's why the main class should sit in the root package.`,
    k:"Configuration + auto-configuration + component scan." },
  { l:"B", t:"Core", q:"What are stereotype annotations: @Component, @Service, @Repository, @Controller?",
    a:`All mark classes for component scanning.
- ‹@Component› – generic bean.
- ‹@Service› – business logic layer (semantic).
- ‹@Repository› – persistence layer; also enables **exception translation** to Spring's ‹DataAccessException› hierarchy.
- ‹@Controller› – MVC controller returning views; ‹@RestController› = ‹@Controller› + ‹@ResponseBody› (returns JSON).
- ‹@Configuration› – holds ‹@Bean› factory methods (proxied to keep singletons).`,
    k:"Same mechanism, different semantics — @Repository adds exception translation." },
  { l:"I", t:"Core", q:"What are bean scopes?",
    a:`- **singleton** (default) – one instance per ApplicationContext.
- **prototype** – a new instance each time it's requested.
- **request**, **session**, **application**, **websocket** – web-aware scopes.

Gotcha: injecting a prototype into a singleton gives you one prototype instance forever. Use ‹ObjectProvider<T>›, ‹@Lookup› method injection or a scoped proxy (‹proxyMode = TARGET_CLASS›).`,
    k:"Singleton by default; prototype-in-singleton needs ObjectProvider or a scoped proxy." },
  { l:"A", t:"Core", q:"Singleton scope does not mean a bean is thread-safe — explain.",
    a:`Spring creates one instance and shares it across all request threads. If the bean holds mutable instance fields (e.g. a ‹List› of current results, a ‹SimpleDateFormat›, a counter), concurrent requests corrupt each other.

Design beans to be **stateless**: keep request data in local variables/method parameters, use immutable config, thread-safe collaborators (‹DateTimeFormatter›), concurrent collections or atomic types when shared state is truly needed.`,
    k:"Singleton = shared; make beans stateless." },
  { l:"A", t:"Core", q:"Walk through the Spring bean lifecycle.",
    a:`1. Bean definitions are loaded (component scan, ‹@Bean›, auto-config).
2. ‹BeanFactoryPostProcessor›s may modify definitions (e.g. property placeholders).
3. **Instantiation** (constructor).
4. **Dependency injection** (fields/setters).
5. **Aware** callbacks (‹BeanNameAware›, ‹ApplicationContextAware›).
6. ‹BeanPostProcessor.postProcessBeforeInitialization›.
7. **Init**: ‹@PostConstruct› → ‹InitializingBean.afterPropertiesSet› → custom ‹initMethod›.
8. ‹BeanPostProcessor.postProcessAfterInitialization› — **AOP proxies are created here**.
9. Bean ready for use.
10. On shutdown: ‹@PreDestroy› → ‹DisposableBean.destroy› → ‹destroyMethod›.`,
    k:"Instantiate → inject → aware → pre-init BPP → init → post-init BPP (proxy) → use → destroy." },
  { l:"A", t:"Core", q:"What are BeanDefinition, BeanFactoryPostProcessor and BeanPostProcessor?",
    a:`- **BeanDefinition** – metadata recipe: class, scope, constructor args, dependencies, lazy flag.
- **BeanFactoryPostProcessor** – runs **before** beans are created and modifies definitions (e.g. ‹PropertySourcesPlaceholderConfigurer› resolving ‹\${...}›; ‹ConfigurationClassPostProcessor› processing ‹@Configuration›).
- **BeanPostProcessor** – runs around initialization of **each bean instance** and can wrap it (AOP proxies, ‹@Autowired› processing, ‹@Async›, validation).`,
    k:"BFPP edits recipes; BPP decorates instances." },
  { l:"I", t:"Core", q:"BeanFactory vs ApplicationContext?",
    a:`‹BeanFactory› is the basic container (lazy bean creation, DI). ‹ApplicationContext› extends it with enterprise features: eager singleton creation, event publishing (‹ApplicationEventPublisher›), internationalisation (‹MessageSource›), resource loading, environment/profiles, and automatic registration of post-processors. Spring Boot always uses an ApplicationContext.`,
    k:"ApplicationContext = BeanFactory + events, i18n, environment, eager init." },
  { l:"I", t:"Core", q:"How do you resolve 'multiple beans of the same type' errors?",
    a:`When two beans implement the same interface, Spring can't choose:
- ‹@Primary› on the default bean.
- ‹@Qualifier("kafkaPublisher")› at the injection point.
- Inject all: ‹List<Publisher>› or ‹Map<String, Publisher>› (key = bean name) and choose at runtime (strategy pattern).
- Conditional beans (‹@ConditionalOnProperty›, ‹@Profile›) so only one exists per environment.`,
    k:"@Primary, @Qualifier, or inject them all and choose." },
  { l:"A", t:"Core", q:"How does Spring handle circular dependencies?",
    a:`A → B → A. With constructor injection Spring cannot create either and fails at startup (and since Boot 2.6 circular references are prohibited by default). With field/setter injection Spring could use early references via a three-level singleton cache, but that hides design problems.

Fix the design: extract the shared logic into a third bean, use events (‹ApplicationEventPublisher›), or invert one dependency through an interface. ‹@Lazy› on one injection point is a last-resort workaround.`,
    k:"Circular dependencies signal a design smell — refactor rather than @Lazy." },
  // ───────── AOP ─────────
  { l:"I", t:"AOP", q:"What is AOP and how does Spring implement it?",
    a:`Aspect-Oriented Programming modularises cross-cutting concerns (logging, transactions, security, metrics, caching).

Terms: **Aspect** (the module), **Advice** (‹@Before›, ‹@After›, ‹@AfterReturning›, ‹@AfterThrowing›, ‹@Around›), **Pointcut** (where), **Join point** (method execution).

Spring AOP is **proxy-based**: JDK dynamic proxies for interfaces or CGLIB subclass proxies (Boot's default). Callers talk to the proxy, which runs advice and then delegates to the real bean.`,
    k:"Spring AOP = runtime proxies around beans." },
  { l:"A", t:"AOP", q:"Why does self-invocation bypass @Transactional, @Async and @Cacheable?",
    a:`These annotations work through a proxy. When a method inside the bean calls another method on ‹this›, the call goes directly to the target object, not through the proxy, so no advice runs.

~~~java
public void importAll(List<Row> rows) { rows.forEach(this::importOne); } // @Transactional on importOne is ignored!
@Transactional public void importOne(Row r) { ... }
~~~

Fixes: move the method to another bean, inject self lazily (‹@Lazy AlarmService self›), use ‹TransactionTemplate› programmatically, or AspectJ weaving. Also: private/final methods can't be proxied.`,
    k:"Proxy-based features only apply on calls that go through the proxy." },
  // ───────── Boot internals ─────────
  { l:"A", t:"Boot Internals", q:"How does Spring Boot auto-configuration decide what to create?",
    a:`Auto-configuration classes are conditional ‹@Configuration› classes. Conditions include:
- ‹@ConditionalOnClass› – a library is on the classpath (e.g. ‹DataSource› + HikariCP).
- ‹@ConditionalOnMissingBean› – only if you haven't defined your own (your beans win).
- ‹@ConditionalOnProperty› – feature flags in properties.
- ‹@ConditionalOnWebApplication›, ‹@ConditionalOnBean›, etc.

Debug with ‹--debug› or ‹/actuator/conditions› (condition evaluation report). Exclude with ‹@SpringBootApplication(exclude = ...)› or ‹spring.autoconfigure.exclude›.`,
    k:"Classpath + properties + missing beans → conditional configuration." },
  { l:"I", t:"Boot Internals", q:"Walk through what happens inside SpringApplication.run().",
    a:`1. Determine application type (servlet, reactive, none).
2. Load ‹SpringApplicationRunListener›s, initializers.
3. Prepare the **Environment** (properties, profiles, env vars, command-line args).
4. Print banner; create the ‹ApplicationContext›.
5. Load bean definitions (main class, component scan, auto-config).
6. **Refresh** context: run BFPPs, register BPPs, instantiate singletons, start embedded web server.
7. Publish ‹ApplicationStartedEvent›; run ‹CommandLineRunner›/‹ApplicationRunner›.
8. Publish ‹ApplicationReadyEvent› – app ready to serve traffic.`,
    k:"Environment → context → bean definitions → refresh → web server → runners → ready." },
  { l:"I", t:"Configuration", q:"How does externalized configuration and property precedence work?",
    a:`Boot merges many property sources; higher ones override lower ones. Roughly (high → low): command-line args → ‹SPRING_APPLICATION_JSON› → OS environment variables → ‹application-{profile}.yml› → ‹application.yml› → ‹@PropertySource› → defaults.

Bind with type-safe ‹@ConfigurationProperties›:

~~~java
@ConfigurationProperties(prefix = "alerts")
@Validated
public record AlertProps(@Min(1) int batchSize, Duration flushInterval, List<String> channels) {}
~~~

Environment variables use relaxed binding (‹ALERTS_BATCHSIZE›). Keep secrets in AWS Secrets Manager/Parameter Store, not in YAML.`,
    k:"Same JAR, different config per environment; @ConfigurationProperties over @Value." },
  { l:"I", t:"Configuration", q:"What are profiles and how do you use them?",
    a:`Profiles group configuration and beans for environments: ‹application-dev.yml›, ‹application-prod.yml›, ‹@Profile("prod")› beans. Activate with ‹spring.profiles.active=prod› or ‹SPRING_PROFILES_ACTIVE›.

Best practices: avoid profile-specific business logic, keep differences in configuration, use profile groups (‹spring.profiles.group.prod=aws,metrics›), and never bake environment into the Docker image.`,
    k:"Profiles switch configuration, not code paths." },
  { l:"I", t:"Configuration", q:"How do you create a custom auto-configuration / starter?",
    a:`1. Create a ‹@AutoConfiguration› class with conditional ‹@Bean›s (‹@ConditionalOnMissingBean›, ‹@ConditionalOnProperty("company.audit.enabled")›).
2. Bind settings with ‹@ConfigurationProperties›.
3. Register it in ‹META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports›.
4. Package as ‹company-audit-spring-boot-starter› with its dependencies.

Useful for shared concerns across microservices: logging/MDC filters, Kafka error handlers, security defaults.`,
    k:"Conditional config + properties + imports file = reusable starter." },
  // ───────── REST ─────────
  { l:"B", t:"REST", q:"@Controller vs @RestController, and what does @ResponseBody do?",
    a:`‹@Controller› returns view names resolved by a template engine. ‹@ResponseBody› writes the return value directly to the HTTP body via ‹HttpMessageConverter›s (Jackson → JSON). ‹@RestController› applies ‹@ResponseBody› to every method — the default for REST APIs.`,
    k:"@RestController = JSON APIs; @Controller = server-rendered views." },
  { l:"B", t:"REST", q:"Explain @RequestMapping, @PathVariable, @RequestParam, @RequestBody and ResponseEntity.",
    a:`~~~java
@RestController
@RequestMapping("/api/v1/alarms")
class AlarmController {
  @GetMapping("/{id}")
  AlarmDto get(@PathVariable long id) { ... }

  @GetMapping
  Page<AlarmDto> list(@RequestParam(defaultValue = "OPEN") Status status, Pageable pageable) { ... }

  @PostMapping
  ResponseEntity<AlarmDto> create(@Valid @RequestBody CreateAlarmRequest req) {
    AlarmDto saved = service.create(req);
    return ResponseEntity.created(URI.create("/api/v1/alarms/" + saved.id())).body(saved);
  }
}
~~~

‹ResponseEntity› controls status, headers and body explicitly.`,
    k:"Path for identity, params for filters, body for payloads, ResponseEntity for control." },
  { l:"I", t:"REST", q:"How do you validate request payloads?",
    a:`Use Bean Validation (Jakarta Validation) annotations on DTOs and ‹@Valid›/‹@Validated›.

~~~java
public record CreateAlarmRequest(
  @NotBlank @Size(max = 100) String name,
  @Min(1) @Max(10) int severity,
  @NotNull @Valid Threshold threshold) {}
~~~

- Invalid bodies throw ‹MethodArgumentNotValidException› → handle centrally and return 400 with field errors.
- ‹@Validated› on the class enables validation of ‹@PathVariable›/‹@RequestParam›.
- Custom constraints with ‹ConstraintValidator›; validation groups for create vs update.
- Business rules (uniqueness, state transitions) belong in the service layer.`,
    k:"Declarative validation on DTOs + centralised 400 responses." },
  { l:"I", t:"REST", q:"How do you design consistent exception handling in Spring REST APIs?",
    a:`Use ‹@RestControllerAdvice› and RFC 7807 ‹ProblemDetail› (built into Spring 6).

~~~java
@RestControllerAdvice
class ApiErrors {
  @ExceptionHandler(AlarmNotFoundException.class)
  ProblemDetail notFound(AlarmNotFoundException ex) {
    ProblemDetail pd = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
    pd.setProperty("code", "ALARM_NOT_FOUND");
    return pd;
  }
  @ExceptionHandler(MethodArgumentNotValidException.class)
  ProblemDetail invalid(MethodArgumentNotValidException ex) { ... field errors ... }
}
~~~

Map domain exceptions to statuses (404, 409 conflict, 422), include a correlation/trace ID, never leak stack traces, and log 5xx once with context.`,
    k:"One advice, one error schema (ProblemDetail), correct status codes." },
  { l:"I", t:"REST", q:"What makes a REST API well designed?",
    a:`- Resource-oriented nouns (‹/devices/{id}/alarms›), correct HTTP methods and status codes.
- Idempotency: GET/PUT/DELETE idempotent; POST with idempotency keys for retries.
- Pagination, filtering, sorting (‹?page=0&size=50&sort=createdAt,desc›), or cursor-based for large feeds.
- Versioning (‹/api/v1› or headers) and backward-compatible evolution.
- Consistent error schema, validation, rate limiting, auth.
- OpenAPI documentation (springdoc-openapi) and contract tests.
- HATEOAS optional; caching with ETags where useful.`,
    k:"Predictable resources, status codes, pagination, versioning, errors and docs." },
  { l:"I", t:"REST", q:"PUT vs PATCH vs POST — and idempotency?",
    a:`- **POST** – create or trigger a process; not idempotent (two calls create two resources) unless you use an idempotency key.
- **PUT** – replace the full resource at a known URI; idempotent.
- **PATCH** – partial update; may or may not be idempotent (JSON Merge Patch is; "increment" operations aren't).
- **DELETE** – idempotent (second call returns 404/204, state is the same).`,
    k:"PUT replaces, PATCH modifies, POST creates; idempotency matters for retries." },
  { l:"I", t:"REST", q:"RestTemplate vs WebClient vs RestClient vs OpenFeign?",
    a:`- **RestTemplate** – synchronous, maintenance mode.
- **RestClient** (Spring 6.1) – modern fluent synchronous client; great with virtual threads.
- **WebClient** – reactive, non-blocking (WebFlux); also usable in MVC apps for parallel calls.
- **OpenFeign / HTTP Interface** (‹@HttpExchange›) – declarative interfaces for service-to-service calls.

Whatever you use: configure connection and read **timeouts**, connection pooling, retries only for idempotent calls, circuit breakers (Resilience4j), and propagate trace headers.`,
    k:"RestClient/HTTP interfaces for sync, WebClient for reactive — always with timeouts." },
  { l:"A", t:"REST", q:"How do you implement API versioning and backward compatibility?",
    a:`Options: URI versioning (‹/api/v2/...›, most explicit), header/media-type versioning (‹Accept: application/vnd.company.v2+json›), or query param. Spring Framework 7 / Boot 4 adds first-class API versioning support.

Avoid breaking changes: add optional fields, never rename/remove without a deprecation period, tolerate unknown fields (‹FAIL_ON_UNKNOWN_PROPERTIES=false›), and use consumer-driven contract tests (Spring Cloud Contract/Pact) so clients aren't broken by deploys.`,
    k:"Evolve additively; version only for genuinely breaking changes." },
  // ───────── Data JPA ─────────
  { l:"B", t:"Data JPA", q:"What is the difference between JPA, Hibernate and Spring Data JPA?",
    a:`- **JPA** (Jakarta Persistence) – the specification: annotations (‹@Entity›), ‹EntityManager›, JPQL.
- **Hibernate** – the most popular JPA implementation (ORM engine, caching, dirty checking).
- **Spring Data JPA** – abstraction on top: repository interfaces with derived queries, paging, auditing — generates implementations at runtime.

~~~java
interface AlarmRepository extends JpaRepository<Alarm, Long> {
  List<Alarm> findBySiteIdAndStatusOrderByCreatedAtDesc(Long siteId, Status status);
  @Query("select a from Alarm a where a.severity >= :min") List<Alarm> severe(int min);
}
~~~`,
    k:"JPA = spec, Hibernate = implementation, Spring Data = repository convenience." },
  { l:"I", t:"Data JPA", q:"Explain the entity lifecycle and persistence context.",
    a:`Entity states: **Transient** (new, not managed) → **Managed** (in the persistence context after ‹persist›/‹find›) → **Detached** (context closed) → **Removed**.

The persistence context is a first-level cache + unit of work per transaction:
- Repeated ‹find› for the same ID returns the same instance.
- **Dirty checking**: changes to managed entities are flushed automatically at commit — no explicit ‹save()› needed.
- Flush order and batching are managed by Hibernate.

Gotcha: ‹LazyInitializationException› when accessing lazy associations on detached entities.`,
    k:"Managed entities are tracked and flushed automatically at commit." },
  { l:"I", t:"Data JPA", q:"Explain JPA relationships and owning side (OneToMany, ManyToOne, ManyToMany).",
    a:`- ‹@ManyToOne› (default EAGER — set ‹LAZY›!) is usually the **owning side** with the foreign key.
- ‹@OneToMany(mappedBy = "device")› is the inverse side.
- ‹@ManyToMany› uses a join table; often better modelled as an explicit entity (e.g. ‹UserRole› with extra columns).

~~~java
@Entity class Alarm {
  @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "device_id")
  private Device device;
}
@Entity class Device {
  @OneToMany(mappedBy = "device", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Alarm> alarms = new ArrayList<>();
  public void addAlarm(Alarm a) { alarms.add(a); a.setDevice(this); }   // sync both sides
}
~~~`,
    k:"Make everything LAZY, keep both sides in sync, owning side has the FK." },
  { l:"A", t:"Data JPA", q:"What is the N+1 query problem and how do you fix it?",
    a:`Loading N parents and then lazily touching each parent's association triggers 1 + N queries.

Detect: enable SQL logging / Hibernate statistics, or count queries in tests (datasource-proxy).

Fix:
- ‹JOIN FETCH› in JPQL: ‹select d from Device d join fetch d.alarms where ...›
- ‹@EntityGraph(attributePaths = "alarms")› on repository methods.
- ‹@BatchSize› / ‹hibernate.default_batch_fetch_size=50› to load associations in batches.
- DTO projections that select only needed columns.

Careful: fetching collections with pagination causes in-memory paging (HHH90003004 warning) — page IDs first, then fetch.`,
    k:"Detect by counting queries; fix with fetch joins, entity graphs, batch fetching or DTOs." },
  { l:"I", t:"Data JPA", q:"FetchType LAZY vs EAGER — and LazyInitializationException?",
    a:`EAGER loads associations immediately (often causing big joins or N+1); LAZY loads on first access via a proxy. Defaults: ‹@ManyToOne›/‹@OneToOne› EAGER, collections LAZY — change to LAZY everywhere and fetch explicitly per use case.

‹LazyInitializationException› occurs when a lazy proxy is accessed after the session closes (e.g. while Jackson serializes an entity). Fix by fetching what you need in the transactional service and returning **DTOs**, not by enabling Open-Session-In-View (disable ‹spring.jpa.open-in-view›).`,
    k:"LAZY by default, fetch per use case, return DTOs, turn off open-in-view." },
  { l:"I", t:"Transactions", q:"How does @Transactional work and what are common traps?",
    a:`‹@Transactional› creates a proxy that begins a transaction before the method and commits/rolls back after.

Traps:
- **Self-invocation** bypasses the proxy.
- Only **public** methods (proxy-based).
- By default rolls back only on **unchecked** exceptions — use ‹rollbackFor = Exception.class› if needed.
- Catching an exception inside the method prevents rollback.
- Long transactions that call remote APIs hold DB connections and locks.
- ‹readOnly = true› for queries helps Hibernate skip dirty checking.
- Putting it on controllers/repositories instead of the service layer.`,
    k:"Proxy-based, unchecked rollback by default, keep transactions short and in services." },
  { l:"A", t:"Transactions", q:"Explain transaction propagation and isolation levels.",
    a:`**Propagation** – what happens when a transactional method calls another:
- ‹REQUIRED› (default) – join existing or create new.
- ‹REQUIRES_NEW› – suspend current, run in a new transaction (audit logs that must persist even if the outer fails).
- ‹NESTED› – savepoint within the current transaction.
- ‹SUPPORTS›, ‹NOT_SUPPORTED›, ‹MANDATORY›, ‹NEVER›.

**Isolation** – visibility between concurrent transactions: ‹READ_UNCOMMITTED›, ‹READ_COMMITTED› (PostgreSQL default), ‹REPEATABLE_READ› (MySQL InnoDB default), ‹SERIALIZABLE›. Higher isolation prevents more anomalies (dirty, non-repeatable, phantom reads) at the cost of concurrency.`,
    k:"Propagation = how transactions nest; isolation = what concurrent transactions can see." },
  { l:"A", t:"Data JPA", q:"Optimistic vs pessimistic locking in JPA?",
    a:`- **Optimistic** – a ‹@Version› column; updates include ‹WHERE version = ?›. If someone else updated first, ‹OptimisticLockException› is thrown → retry or return 409. Best for low-contention, web-style edits.
- **Pessimistic** – ‹@Lock(LockModeType.PESSIMISTIC_WRITE)› issues ‹SELECT ... FOR UPDATE›, blocking others. Best for high-contention critical sections (inventory, counters), with lock timeouts.

~~~java
@Entity class AlarmRule { @Version private long version; ... }
~~~`,
    k:"Optimistic = detect conflicts at commit; pessimistic = prevent them with locks." },
  { l:"A", t:"Data JPA", q:"How do you optimise bulk inserts/updates with JPA?",
    a:`- Enable JDBC batching: ‹hibernate.jdbc.batch_size=50›, ‹order_inserts=true›, ‹order_updates=true›.
- Use ‹SEQUENCE› ID generation (with pooled optimizer); ‹IDENTITY› disables insert batching.
- Flush and clear the persistence context every N rows to avoid memory growth.
- For very large loads use JDBC ‹batchUpdate›, PostgreSQL ‹COPY›, or ‹INSERT ... ON CONFLICT›.
- Bulk JPQL ‹update/delete› bypasses the persistence context — clear it afterwards.`,
    k:"Batching + sequences + flush/clear, or drop to JDBC for massive loads." },
  { l:"I", t:"Data JPA", q:"What are projections and why use DTOs instead of entities in APIs?",
    a:`Projections fetch only needed columns:
- Interface-based: ‹interface AlarmSummary { Long getId(); String getName(); }›
- Class/record-based: ‹select new com.x.AlarmSummary(a.id, a.name) from Alarm a›
- Dynamic projections with generics.

Returning entities from controllers couples API to schema, risks lazy-loading errors and over-exposes data (passwords, internal fields). DTOs give a stable contract — map with MapStruct.`,
    k:"Fetch less, expose less: DTO projections." },
  { l:"I", t:"Data JPA", q:"How do pagination and sorting work in Spring Data?",
    a:`Accept a ‹Pageable› and return ‹Page<T>› (with total count query) or ‹Slice<T>› (no count — cheaper).

~~~java
Page<Alarm> page = repo.findByStatus(Status.OPEN, PageRequest.of(0, 50, Sort.by("createdAt").descending()));
~~~

Offset pagination gets slow on deep pages; for infinite scrolling/real-time feeds use **keyset (seek) pagination**: ‹where created_at < :lastSeen order by created_at desc limit 50› (Spring Data ‹ScrollPosition›/‹Window› support).`,
    k:"Pageable for UIs; keyset pagination for large, deep or live datasets." },
  { l:"A", t:"Data JPA", q:"Explain Hibernate first-level and second-level caches.",
    a:`- **First-level cache** – the persistence context; per transaction/session, always on.
- **Second-level cache** – shared across sessions (Ehcache, Hazelcast, Infinispan via JCache); good for read-mostly reference data (device types, sites). Needs a concurrency strategy and invalidation awareness across nodes.
- **Query cache** – caches query result IDs; rarely worth it.

For most microservices, application-level caching (‹@Cacheable› + Redis/Caffeine) is simpler and more explicit.`,
    k:"L1 is automatic; L2 is for read-mostly data and needs care in clusters." },
  { l:"I", t:"Data", q:"How do you manage database schema changes (Flyway/Liquibase)?",
    a:`Use versioned migrations checked into the repo (‹V12__add_alarm_ack_columns.sql›), applied automatically on startup or by a pipeline step. Set ‹spring.jpa.hibernate.ddl-auto=validate› (never ‹update› in prod).

For zero-downtime deploys use **expand–contract**: add new columns/tables (backward compatible) → deploy code writing both → backfill → switch reads → remove old columns in a later release.`,
    k:"Versioned migrations + expand/contract for zero downtime." },
  // ───────── Security ─────────
  { l:"I", t:"Security", q:"How does the Spring Security filter chain work?",
    a:`Spring Security is a chain of servlet filters registered through ‹DelegatingFilterProxy› → ‹FilterChainProxy› → one or more ‹SecurityFilterChain›s matched by request.

Key filters: CORS, CSRF, authentication filters (‹UsernamePasswordAuthenticationFilter›, ‹BearerTokenAuthenticationFilter›), ‹ExceptionTranslationFilter› (401/403), ‹AuthorizationFilter›.

Authentication flows: filter extracts credentials → ‹AuthenticationManager› → ‹AuthenticationProvider› → on success stores ‹Authentication› in the ‹SecurityContextHolder› (ThreadLocal).`,
    k:"Requests pass through ordered filters; the SecurityContext carries the authenticated principal." },
  { l:"A", t:"Security", q:"How do you implement JWT authentication and authorization in Spring Boot?",
    a:`Prefer the built-in OAuth2 Resource Server rather than a hand-written filter.

~~~java
@Bean
SecurityFilterChain api(HttpSecurity http) throws Exception {
  return http
    .csrf(csrf -> csrf.disable())                         // stateless API with bearer tokens
    .sessionManagement(s -> s.sessionCreationPolicy(STATELESS))
    .authorizeHttpRequests(a -> a
        .requestMatchers("/actuator/health", "/auth/**").permitAll()
        .requestMatchers(HttpMethod.DELETE, "/api/**").hasRole("ADMIN")
        .anyRequest().authenticated())
    .oauth2ResourceServer(o -> o.jwt(Customizer.withDefaults()))
    .build();
}
~~~

Validate signature (RS256 via JWKS), expiry, issuer and audience; map claims to authorities; keep access tokens short-lived with refresh tokens; never put sensitive data in the payload (it's only base64). Add method security for ownership checks.`,
    k:"Resource-server JWT validation + stateless sessions + role and ownership checks." },
  { l:"A", t:"Security", q:"How do method security and @PreAuthorize work?",
    a:`Enable with ‹@EnableMethodSecurity›. Then:

~~~java
@PreAuthorize("hasRole('OPERATOR') and @siteAccess.canView(authentication, #siteId)")
public List<AlarmDto> alarmsForSite(long siteId) { ... }
~~~

‹@PreAuthorize›, ‹@PostAuthorize›, ‹@PreFilter›, ‹@PostFilter› use SpEL and AOP proxies (so self-invocation bypasses them). URL rules handle coarse access; method security handles fine-grained, domain-level rules like tenant/site ownership.`,
    k:"URL rules for coarse access, @PreAuthorize for domain-level checks." },
  { l:"I", t:"Security", q:"How do you handle CORS and CSRF in a Spring Boot + Angular app?",
    a:`- **CORS** – browsers block cross-origin calls unless the server allows them. Configure ‹CorsConfigurationSource› with explicit origins (not ‹*› with credentials), methods and headers, and enable ‹http.cors()›. Or avoid CORS by serving Angular and API under one domain via Nginx/CloudFront path routing.
- **CSRF** – relevant when auth is cookie-based. Use ‹CookieCsrfTokenRepository.withHttpOnlyFalse()› so Angular's HttpClient sends the ‹X-XSRF-TOKEN› header. For pure bearer-token APIs, CSRF can be disabled.`,
    k:"CORS is browser access control; CSRF protection matters when cookies authenticate." },
  { l:"I", t:"Security", q:"How do you store passwords securely?",
    a:`Never store plaintext or reversible encryption. Use an adaptive one-way hash with salt: **BCrypt**, **Argon2** or **PBKDF2** via ‹PasswordEncoder›.

~~~java
@Bean PasswordEncoder encoder() { return PasswordEncoderFactories.createDelegatingPasswordEncoder(); }
~~~

The delegating encoder prefixes ‹{bcrypt}› so algorithms can be upgraded over time. Add rate limiting/lockouts and MFA for sensitive apps.`,
    k:"Adaptive salted hashing (BCrypt/Argon2) via PasswordEncoder." },
  // ───────── Real-time / async ─────────
  { l:"A", t:"WebSockets", q:"How do you push real-time alerts to the UI with Spring WebSockets?",
    a:`Use STOMP over WebSocket with a message broker.

~~~java
@Configuration @EnableWebSocketMessageBroker
class WsConfig implements WebSocketMessageBrokerConfigurer {
  public void registerStompEndpoints(StompEndpointRegistry r) { r.addEndpoint("/ws").setAllowedOrigins("https://app.example.com"); }
  public void configureMessageBroker(MessageBrokerRegistry r) {
    r.enableSimpleBroker("/topic", "/queue");          // or enableStompBrokerRelay for RabbitMQ/ActiveMQ
    r.setApplicationDestinationPrefixes("/app");
  }
}

@KafkaListener(topics = "alerts")
void onAlert(AlertEvent e) { messaging.convertAndSend("/topic/sites/" + e.siteId(), e); }
~~~

Scaling to multiple instances: each instance consumes Kafka (unique consumer group per instance for fan-out) or uses a broker relay so any instance can reach any client. Secure the handshake (JWT), authorize subscriptions per site, and handle reconnect + backfill on the client.`,
    k:"Kafka → Spring service → STOMP topic → Angular; scale with broker relay or per-instance fan-out." },
  { l:"I", t:"Async", q:"How do @Async and @Scheduled work, and what are pitfalls?",
    a:`- ‹@EnableAsync› + ‹@Async› runs a method on a ‹TaskExecutor› via a proxy (self-invocation doesn't work). Return ‹CompletableFuture› for results; configure a bounded ‹ThreadPoolTaskExecutor› and an ‹AsyncUncaughtExceptionHandler›.
- ‹@EnableScheduling› + ‹@Scheduled(fixedDelay/cron)› runs periodic jobs on a single-threaded scheduler by default.

Pitfalls: in multi-instance deployments every instance runs the schedule — use **ShedLock** or a DB lock, or move the job to a single scheduler (EventBridge/Quartz cluster). Long jobs block other schedules on the default single thread.`,
    k:"Bounded executors, proxy rules, and distributed locks for scheduled jobs." },
  { l:"I", t:"Events", q:"What are Spring application events and @TransactionalEventListener?",
    a:`‹ApplicationEventPublisher› publishes in-process events; ‹@EventListener› handles them (sync by default, ‹@Async› to decouple).

‹@TransactionalEventListener(phase = AFTER_COMMIT)› runs only after the transaction commits — e.g. send an email or WebSocket notification only when the alarm is really saved. For cross-service reliability, use the **transactional outbox** instead, because in-process events are lost if the app crashes after commit.`,
    k:"Use AFTER_COMMIT listeners for side effects; outbox for cross-service guarantees." },
  { l:"I", t:"Caching", q:"How does Spring caching (@Cacheable) work?",
    a:`‹@EnableCaching› + ‹@Cacheable("devices")› caches return values by key; ‹@CachePut› updates; ‹@CacheEvict› removes. Providers: Caffeine (local), Redis (distributed), ElastiCache on AWS.

~~~java
@Cacheable(value = "deviceTypes", key = "#id", unless = "#result == null")
public DeviceType get(long id) { ... }
~~~

Considerations: TTLs, cache stampede (‹sync = true›), invalidation across instances (Redis or pub/sub), serialization, and the proxy rules (self-invocation).`,
    k:"Declarative caching via proxies — design TTL and invalidation deliberately." },
  // ───────── Observability & ops ─────────
  { l:"I", t:"Actuator", q:"How do you build health checks and metrics with Actuator?",
    a:`Add ‹spring-boot-starter-actuator› and expose endpoints selectively: ‹management.endpoints.web.exposure.include=health,info,prometheus›.

- ‹/actuator/health› with **liveness** and **readiness** groups for Kubernetes/ECS/ALB checks; custom ‹HealthIndicator› for Kafka or downstream dependencies (careful: don't make liveness depend on external systems).
- **Micrometer** metrics (HTTP latency histograms, JVM, Hikari, Kafka) → Prometheus/Grafana or CloudWatch.
- **Tracing** with Micrometer Tracing + OpenTelemetry; trace IDs in logs.
- Secure actuator on a separate management port.`,
    k:"Readiness ≠ liveness; expose metrics; secure the endpoints." },
  { l:"I", t:"Logging", q:"How do you implement structured logging and correlation IDs?",
    a:`- Use SLF4J + Logback/Log4j2; Spring Boot 3.4+ supports structured JSON logging (‹logging.structured.format.console=ecs›).
- Generate or propagate a correlation/trace ID per request in a filter and put it in **MDC**; Micrometer Tracing does this automatically (‹traceId›, ‹spanId›).
- Propagate the ID in outgoing HTTP headers and Kafka headers.
- Log at the right level, never log secrets/PII, avoid logging in tight loops.
- Ship logs to ELK/CloudWatch and search by trace ID.`,
    k:"JSON logs + trace IDs in MDC across HTTP and Kafka hops." },
  // ───────── Testing ─────────
  { l:"I", t:"Testing", q:"How do you test Spring Boot applications (slices, mocks, Testcontainers)?",
    a:`- **Unit tests**: plain JUnit 5 + Mockito, no Spring context — fastest.
- **Slice tests**: ‹@WebMvcTest› (controllers + MockMvc, services mocked with ‹@MockitoBean›), ‹@DataJpaTest› (repositories), ‹@JsonTest›.
- **Integration tests**: ‹@SpringBootTest› with **Testcontainers** for real PostgreSQL/Kafka (‹@ServiceConnection›).
- **Contract tests**: Spring Cloud Contract / Pact.

~~~java
@WebMvcTest(AlarmController.class)
class AlarmControllerTest {
  @Autowired MockMvc mvc; @MockitoBean AlarmService service;
  @Test void returns404() throws Exception {
    when(service.get(1L)).thenThrow(new AlarmNotFoundException(1L));
    mvc.perform(get("/api/v1/alarms/1")).andExpect(status().isNotFound());
  }
}
~~~`,
    k:"Many fast unit tests, focused slices, a few Testcontainers integration tests." },
  { l:"B", t:"Build", q:"What is a Spring Boot fat JAR and how is it run?",
    a:`The Spring Boot Maven/Gradle plugin repackages the app into an executable JAR with ‹BOOT-INF/classes›, ‹BOOT-INF/lib› (dependencies) and a launcher (‹JarLauncher›). Run with ‹java -jar app.jar›.

For Docker, use **layered JARs** (‹java -Djarmode=tools -jar app.jar extract --layers›) so dependency layers are cached and only the small application layer changes per build — or Cloud Native Buildpacks (‹mvn spring-boot:build-image›).`,
    k:"Executable fat JAR; extract layers for efficient Docker images." },
  { l:"I", t:"Build", q:"What are Maven's lifecycle, scopes and dependency management?",
    a:`- **Lifecycle phases**: validate → compile → test → package → verify → install → deploy. Running a phase runs all previous ones.
- **Scopes**: ‹compile› (default), ‹provided›, ‹runtime›, ‹test›, ‹import› (BOMs).
- **Dependency management**: Spring Boot parent/BOM pins compatible versions; ‹mvn dependency:tree› finds conflicts; nearest-wins conflict resolution; ‹<exclusions>› to drop transitive deps.
- Multi-module builds for shared libraries; ‹mvn -pl service-a -am package› builds a module with its dependencies.`,
    k:"Phases run in order; BOMs keep versions consistent; dependency:tree for conflicts." },
  { l:"E", t:"Boot 3", q:"What changed in Spring Boot 3 and how did you migrate?",
    a:`- Java 17 baseline; **Jakarta EE** namespace (‹javax.*› → ‹jakarta.*›).
- Spring Framework 6: ‹ProblemDetail›, HTTP interface clients, observability with Micrometer Observation API.
- Native image support via Spring AOT/GraalVM.
- Spring Security 6: lambda DSL, ‹authorizeHttpRequests›, removal of ‹WebSecurityConfigurerAdapter›.
- Virtual threads support (3.2), ‹RestClient›, ‹JdbcClient› (3.2), SSL bundles, Docker Compose support.

Migration: upgrade to latest 2.7 first, fix deprecations, run OpenRewrite recipes for Jakarta, upgrade dependencies (Hibernate 6 changes in queries/ID generation), re-test security config.`,
    k:"Java 17 + Jakarta namespace + Security 6 DSL; migrate via 2.7 and OpenRewrite." },
  { l:"A", t:"Performance", q:"How do you tune a Spring Boot service for performance?",
    a:`1. Measure with load tests (Gatling/JMeter/k6) and APM traces to find the bottleneck.
2. **Database**: fix N+1, indexes, projections, batching, HikariCP pool sizing (‹maximumPoolSize› ≈ what the DB can handle, not threads).
3. **Threads**: tune Tomcat ‹server.tomcat.threads.max›, or enable virtual threads for I/O-bound loads.
4. **HTTP clients**: pooling, timeouts, parallel calls.
5. **Caching** for hot reads.
6. **JSON**: avoid huge payloads; pagination; compression.
7. **JVM**: right-size heap for containers, G1/ZGC, CDS for startup.
8. Async processing with Kafka for slow non-critical work.`,
    k:"Measure → fix DB first → pools and timeouts → caching → JVM." },
  { l:"A", t:"Data", q:"How do you configure HikariCP and diagnose connection pool exhaustion?",
    a:`Symptoms: ‹Connection is not available, request timed out after 30000ms›, rising latency, threads waiting.

Causes: long transactions, slow queries, remote calls inside ‹@Transactional›, connection leaks (unclosed connections in custom JDBC), pool too small for the concurrency, or DB max connections reached across many instances.

Diagnose with Hikari metrics (active, idle, pending), ‹leakDetectionThreshold›, DB views (‹pg_stat_activity›). Fix the cause; size pools so ‹instances × maxPoolSize› < DB max_connections (or use RDS Proxy/PgBouncer).`,
    k:"Pool exhaustion is usually long transactions or leaks, not a too-small pool." },
  { l:"E", t:"Scenario", q:"Scenario: design an alarm-ingestion REST + Kafka flow in Spring Boot for a real-time monitoring platform.",
    a:`1. **Ingest API** (‹POST /api/v1/alarms›) validates payloads, applies an idempotency key (device + timestamp + type) and responds 202 Accepted quickly.
2. Persist the alarm and an **outbox** row in one PostgreSQL transaction; a relay (or Debezium CDC) publishes to the Kafka topic ‹alarms.raised› keyed by ‹deviceId› for ordering.
3. **Consumers**: rule engine (enrichment, dedup, severity escalation), notification service (email/SMS), WebSocket gateway pushing to Angular dashboards.
4. Error handling: ‹DefaultErrorHandler› with backoff → dead-letter topic; idempotent consumers (processed-event table).
5. Observability: trace ID propagated in Kafka headers, consumer lag metrics, alerting.
6. Scale: partitions = parallelism; stateless services in ECS/EKS behind ALB; RDS with read replicas for analytics queries.`,
    k:"Validate → persist + outbox → Kafka keyed by device → idempotent consumers → WebSocket push." },
  { l:"I", t:"Data", q:"JdbcTemplate/JdbcClient vs JPA — when do you choose plain SQL?",
    a:`JPA excels at aggregate-oriented CRUD with relationships and dirty checking. Plain SQL (‹JdbcClient›, ‹JdbcTemplate›, jOOQ, MyBatis) is better for complex reporting/analytics queries, window functions, bulk operations, database-specific features (PostgreSQL JSONB, ‹COPY›, CTEs) and predictable performance.

Many services mix both: JPA for writes on the domain model, SQL for read-heavy analytics endpoints (a CQRS-lite approach).`,
    k:"JPA for domain writes, SQL for reporting and bulk work." },
  { l:"I", t:"Validation", q:"How do you handle global JSON serialization concerns (dates, nulls, unknown fields)?",
    a:`Configure Jackson via properties or a ‹Jackson2ObjectMapperBuilderCustomizer›:
- ‹spring.jackson.serialization.write-dates-as-timestamps=false› → ISO-8601 strings; use ‹Instant›/‹OffsetDateTime›.
- ‹spring.jackson.default-property-inclusion=non_null› to omit nulls.
- ‹spring.jackson.deserialization.fail-on-unknown-properties=false› for tolerant readers.
- Use ‹@JsonProperty›, ‹@JsonIgnore› sparingly; prefer dedicated DTOs.
- Protect against huge payloads with request size limits.`,
    k:"ISO dates, tolerant readers, explicit DTOs." },
  { l:"E", t:"Scenario", q:"Scenario: after a deploy, a Spring Boot service fails readiness checks in ECS. How do you debug?",
    a:`1. Check ECS task stopped reason and container logs in CloudWatch — startup exception? (missing property, bean creation failure, DB migration error).
2. Verify config: profiles, env vars, secrets from Secrets Manager mapped correctly, IAM role permissions.
3. Connectivity: security groups, DB endpoint, Kafka brokers reachable from the subnet.
4. Health endpoint path/port matches target group settings; startup takes longer than the health-check grace period (JVM warm-up, Flyway migrations) → increase grace period or use startup probes.
5. Memory: container OOM-killed because heap + metaspace exceed task memory.
6. Roll back via the previous task definition while fixing.`,
    k:"Logs → config/secrets → network → health-check timing → memory; roll back fast." }
]);
