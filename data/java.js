ATLAS.addTrack({
  id: "java", title: "Core Java", icon: "☕", color: "#f59e0b", accent: "#fcd34d",
  tagline: "OOP, collections, Java 8–21, concurrency, JVM & GC",
  blurb: "Everything a lead Java engineer is grilled on: language fundamentals, collections internals, streams, modern Java (records, sealed types, virtual threads), concurrency and JVM tuning."
}, [
  // ───────── Basics ─────────
  { l:"B", t:"Basics", q:"What is the difference between JDK, JRE and JVM?",
    a:`The **JVM** executes bytecode; the **JRE** is the JVM plus core libraries needed to run apps; the **JDK** is the JRE plus development tools (javac, jar, jdb, jshell, jlink, jcmd).

- Write code → ‹javac› (JDK) → ‹.class› bytecode → run on the JVM.
- Since Java 11, Oracle no longer ships a separate JRE; you build trimmed runtimes with ‹jlink›, which is useful for small Docker images.`,
    k:"JVM runs, JRE = JVM + libraries, JDK = JRE + tools." },
  { l:"B", t:"Basics", q:"Why is Java platform independent but the JVM platform dependent?",
    a:`Java source compiles to platform-neutral bytecode ("write once, run anywhere"). Each OS/CPU has its own JVM implementation that translates that bytecode into native instructions through interpretation and JIT compilation. So the bytecode is portable, while the JVM is native to each platform.`,
    k:"Portable bytecode, native JVMs." },
  { l:"B", t:"Basics", q:"What is the difference between == and equals()?",
    a:`‹==› compares primitive values or **object references** (same object in memory). ‹equals()› compares **logical equality** as defined by the class.

~~~java
String a = new String("hi"), b = new String("hi");
a == b;        // false – different objects
a.equals(b);   // true  – same characters
Integer x = 127, y = 127;  x == y;  // true  (Integer cache -128..127)
Integer p = 128, q = 128;  p == q;  // false – always use equals for wrappers
~~~`,
    k:"== is identity; equals() is meaning. Never use == for wrappers or strings." },
  { l:"B", t:"Basics", q:"Why must equals() and hashCode() follow a contract?",
    a:`Hash-based collections use ‹hashCode()› to find the bucket and ‹equals()› to find the exact key. The contract: if ‹a.equals(b)› then ‹a.hashCode() == b.hashCode()›; unequal objects may share a hash.

If you override ‹equals› without ‹hashCode›, two equal objects can land in different buckets — ‹set.contains(x)› returns false and HashMap lookups fail. Also, never use mutable fields in hashCode for objects stored as keys: mutating them "loses" the entry.

Records generate a correct equals/hashCode automatically.`,
    k:"Equal objects must have equal hash codes, and key fields should be immutable." },
  { l:"B", t:"Strings", q:"Why is String immutable, and what is the String pool?",
    a:`String is immutable (final class, private final value array) for:
- **Security** – class names, file paths, URLs, DB credentials can't be altered after validation.
- **Thread safety** – safe sharing without synchronization.
- **Hash caching** – hashCode computed once; great as HashMap keys.
- **String pool** – literals are interned in a heap pool so identical literals share one object.

‹new String("x")› creates a new heap object; ‹intern()› returns the pooled instance.`,
    k:"Immutability enables pooling, caching, thread safety and security." },
  { l:"B", t:"Strings", q:"String vs StringBuilder vs StringBuffer?",
    a:`- **String** – immutable; each concatenation in a loop creates new objects.
- **StringBuilder** – mutable, not synchronized, fastest for single-threaded building.
- **StringBuffer** – mutable and synchronized (legacy); rarely needed.

The compiler optimises simple ‹a + b + c› (invokedynamic since Java 9), but use StringBuilder in loops.`,
    k:"Use StringBuilder in loops; String for values; StringBuffer almost never." },
  { l:"B", t:"Basics", q:"Is Java pass-by-value or pass-by-reference?",
    a:`Java is **always pass-by-value**. For objects, the value passed is a copy of the reference. So a method can mutate the object the reference points to, but reassigning the parameter doesn't affect the caller's variable.

~~~java
void change(List<String> list) {
  list.add("x");          // visible to caller
  list = new ArrayList<>(); // not visible to caller
}
~~~`,
    k:"Copies of references are passed — mutation is visible, reassignment is not." },
  { l:"B", t:"Basics", q:"What do final, finally and finalize mean?",
    a:`- **final** – variable can't be reassigned, method can't be overridden, class can't be extended.
- **finally** – block that runs after try/catch regardless of outcome (except ‹System.exit› or JVM crash); use for cleanup, though try-with-resources is better.
- **finalize()** – deprecated (Java 9) and removed for removal; unpredictable GC callback. Use ‹AutoCloseable› or ‹Cleaner› instead.`,
    k:"final restricts, finally cleans up, finalize is deprecated." },
  { l:"B", t:"Basics", q:"What is the static keyword used for?",
    a:`‹static› members belong to the class, not instances.
- **Static variables** – one copy shared by all instances (counters, constants with ‹static final›).
- **Static methods** – called without an instance; can't use ‹this›; can't be overridden (they are hidden).
- **Static blocks** – run once when the class is initialized.
- **Static nested classes** – don't hold a reference to the outer instance (avoids memory leaks vs inner classes).`,
    k:"static = class-level, shared, initialized once." },
  // ───────── OOP ─────────
  { l:"B", t:"OOP", q:"Explain the four pillars of OOP with practical examples.",
    a:`- **Encapsulation** – hide state behind methods: ‹Account› exposes ‹deposit()› rather than a public ‹balance› field, protecting invariants.
- **Abstraction** – expose what, hide how: a ‹NotificationSender› interface with ‹send()›, hiding SMTP/SMS details.
- **Inheritance** – reuse and specialise: ‹SavingsAccount extends Account›.
- **Polymorphism** – one interface, many behaviours: ‹List<NotificationSender>› iterating email, SMS and WebSocket senders calling ‹send()›.

In real systems, polymorphism via interfaces + composition is used far more than deep inheritance.`,
    k:"Encapsulate state, abstract behaviour, inherit sparingly, polymorph through interfaces." },
  { l:"I", t:"OOP", q:"Interface vs abstract class — when do you use which?",
    a:`- **Interface** – a contract/capability; multiple inheritance of type; can have default, static and private methods (Java 8/9); no instance state.
- **Abstract class** – a partial implementation with shared state and constructors; single inheritance.

Use an interface to define a role (‹PaymentGateway›, ‹Comparable›). Use an abstract class when subclasses share significant code and state (template method pattern, e.g. ‹AbstractAlarmProcessor› with common validation and an abstract ‹process()› step).`,
    k:"Interface = what it can do; abstract class = shared partial implementation." },
  { l:"I", t:"OOP", q:"Overloading vs overriding — how does method dispatch work?",
    a:`- **Overloading** – same name, different parameter lists in the same class; resolved at **compile time** by static types.
- **Overriding** – subclass redefines a superclass instance method with the same signature; resolved at **runtime** by the actual object type (dynamic dispatch via vtables).

Rules for overriding: same or covariant return type, can't reduce visibility, can't throw broader checked exceptions; ‹static›, ‹private› and ‹final› methods aren't overridden. Use ‹@Override› to let the compiler check.`,
    k:"Overloading = compile-time choice; overriding = runtime polymorphism." },
  { l:"I", t:"OOP", q:"Why favour composition over inheritance?",
    a:`Inheritance creates tight coupling: subclasses depend on parent internals (fragile base class problem) and hierarchies become rigid. Composition assembles behaviour from small collaborators behind interfaces, which can be swapped and tested independently.

Example: instead of ‹EmailAlertNotifier extends AlertNotifier extends Notifier›, compose ‹AlertService› with a ‹List<NotificationChannel>› injected by Spring. Adding Slack is a new class, no hierarchy change. Use inheritance only for true "is-a" relationships with stable base behaviour.`,
    k:"Compose behaviours via interfaces; inherit only for genuine is-a with stable parents." },
  { l:"A", t:"OOP", q:"Explain the SOLID principles with examples.",
    a:`- **S – Single Responsibility**: ‹AlarmService› handles business rules; ‹AlarmRepository› handles persistence; ‹AlarmPublisher› sends Kafka events.
- **O – Open/Closed**: add a new notification channel by implementing ‹NotificationChannel›, not by editing a switch.
- **L – Liskov Substitution**: a ‹ReadOnlyList› that throws on ‹add()› breaks code expecting ‹List› behaviour.
- **I – Interface Segregation**: split a fat ‹DeviceManager› into ‹DeviceReader› and ‹DeviceWriter›.
- **D – Dependency Inversion**: services depend on interfaces; Spring injects implementations.`,
    k:"SOLID keeps classes focused, extensible and swappable." },
  { l:"A", t:"OOP", q:"How do you make a class immutable?",
    a:`1. Declare the class ‹final› (or use a ‹record›).
2. Make all fields ‹private final›.
3. No setters; initialise everything in the constructor.
4. **Defensive copies** of mutable inputs and outputs (‹List.copyOf(list)›, copy ‹Date›s or use ‹Instant›).
5. Don't leak ‹this› during construction.

~~~java
public record AlarmRule(String name, int threshold, List<String> channels) {
  public AlarmRule { channels = List.copyOf(channels); }   // compact constructor
}
~~~

Immutable objects are thread-safe, cache-friendly and safe as map keys.`,
    k:"final class, final fields, no setters, defensive copies — or just use a record." },
  // ───────── Exceptions ─────────
  { l:"B", t:"Exceptions", q:"Checked vs unchecked exceptions — and the exception hierarchy?",
    a:`‹Throwable› → ‹Error› (JVM problems: OutOfMemoryError, StackOverflowError — don't catch) and ‹Exception›.
- **Checked** (‹IOException›, ‹SQLException›) – must be declared or handled; for recoverable conditions outside the program's control.
- **Unchecked** (‹RuntimeException› subclasses: NPE, IllegalArgumentException) – programming errors or business rule violations.

Spring favours unchecked exceptions (e.g. ‹DataAccessException›) so business code isn't cluttered, and handles them centrally with ‹@ControllerAdvice›.`,
    k:"Checked = recoverable external failures; unchecked = programming/business errors." },
  { l:"I", t:"Exceptions", q:"What is try-with-resources and why is it better than finally?",
    a:`Try-with-resources automatically closes any ‹AutoCloseable› in reverse order, even when exceptions occur, and keeps the original exception with closing failures attached as **suppressed** exceptions.

~~~java
try (Connection c = ds.getConnection();
     PreparedStatement ps = c.prepareStatement(SQL)) {
  ps.setLong(1, id);
  try (ResultSet rs = ps.executeQuery()) { ... }
}
~~~

Manual ‹finally› blocks are verbose and often mask the original exception or leak resources when close() throws.`,
    k:"try-with-resources = guaranteed cleanup + no masked exceptions." },
  { l:"I", t:"Exceptions", q:"What are best practices for exception handling in a service?",
    a:`- Throw specific, meaningful exceptions (‹DeviceNotFoundException›), not generic ‹Exception›.
- Don't swallow exceptions; log once at the boundary with context (IDs, correlation ID), not at every layer.
- Wrap low-level exceptions while preserving the cause: ‹throw new AlarmProcessingException("...", e)›.
- Don't use exceptions for normal control flow.
- Translate to HTTP responses centrally (‹@RestControllerAdvice› + Problem Details).
- Clean up with try-with-resources; never ‹catch (Throwable)› except at top-level handlers.`,
    k:"Specific exceptions, preserve causes, log once, translate centrally." },
  // ───────── Collections ─────────
  { l:"B", t:"Collections", q:"Explain the Collections Framework hierarchy.",
    a:`- ‹Collection› → ‹List› (ordered, duplicates: ArrayList, LinkedList), ‹Set› (unique: HashSet, LinkedHashSet, TreeSet), ‹Queue/Deque› (ArrayDeque, PriorityQueue).
- ‹Map› is separate (key → value: HashMap, LinkedHashMap, TreeMap, ConcurrentHashMap).
- Java 21 added ‹SequencedCollection›/‹SequencedMap› with ‹getFirst()›, ‹getLast()›, ‹reversed()›.

Choose by access pattern: index access → ArrayList; uniqueness → HashSet; sorted → TreeSet/TreeMap; FIFO/LIFO → ArrayDeque; priority → PriorityQueue.`,
    k:"Pick the collection by access pattern, ordering and uniqueness needs." },
  { l:"B", t:"Collections", q:"ArrayList vs LinkedList?",
    a:`- **ArrayList** – backed by a resizable array: O(1) random access, amortised O(1) append, O(n) insert/remove in the middle; excellent CPU cache locality.
- **LinkedList** – doubly linked nodes: O(1) insert/remove at known node, O(n) access by index, high memory overhead per element.

In practice ArrayList (or ArrayDeque for queues) wins almost always; LinkedList is rarely the right choice.`,
    k:"Default to ArrayList; LinkedList is almost never faster in practice." },
  { l:"I", t:"Collections", q:"How does HashMap work internally?",
    a:`HashMap stores entries in an array of buckets.

1. ‹hash = key.hashCode() ^ (h >>> 16)› spreads high bits.
2. Index = ‹hash & (n - 1)› (n is a power of two).
3. Empty bucket → insert node. Otherwise walk the bucket comparing hash then ‹equals()›; replace value if key matches, else append.
4. When a bucket exceeds 8 nodes and capacity ≥ 64, it becomes a **red-black tree** (O(log n) instead of O(n)).
5. When size > capacity × load factor (0.75), the table **doubles** and entries are split between index ‹i› and ‹i + oldCap›.

Average O(1) get/put; one null key allowed; not thread-safe.`,
    k:"hash → bucket → equals; treeify at 8; resize at 75% load." },
  { l:"A", t:"Collections", q:"What happens during HashMap resize and why can it be expensive?",
    a:`When the threshold is crossed, HashMap allocates a new array twice as large and redistributes every entry. Java 8 avoids recomputing hashes: each node either stays at index ‹i› or moves to ‹i + oldCapacity› based on one bit.

It's O(n) and allocates memory, which can cause latency spikes and GC pressure for large maps. Pre-size when you know the count: ‹new HashMap<>(expected / 0.75f + 1)› or ‹HashMap.newHashMap(expected)› (Java 19+). In Java 7, concurrent resize could even create cyclic lists — another reason to use ConcurrentHashMap for shared maps.`,
    k:"Resizes are O(n) — pre-size large maps." },
  { l:"A", t:"Collections", q:"HashMap vs ConcurrentHashMap vs Hashtable vs synchronizedMap?",
    a:`- **HashMap** – not thread-safe; allows one null key and null values.
- **Hashtable** – legacy; every method synchronized on one lock; no nulls.
- **Collections.synchronizedMap** – wrapper with one lock; iteration needs manual synchronization.
- **ConcurrentHashMap** – lock-free reads, CAS + per-bin locking for writes (Java 8+), weakly consistent iterators (no ConcurrentModificationException), no nulls; atomic ops like ‹computeIfAbsent›, ‹merge›.

~~~java
counts.merge(deviceId, 1, Integer::sum);   // atomic increment per key
~~~

Note: ‹if (!map.containsKey(k)) map.put(k, v)› is still a race — use atomic methods.`,
    k:"ConcurrentHashMap + its atomic compound methods for shared maps." },
  { l:"I", t:"Collections", q:"What is fail-fast vs fail-safe iteration?",
    a:`- **Fail-fast** iterators (ArrayList, HashMap) track a ‹modCount›; structural modification during iteration (other than via ‹iterator.remove()›) throws ‹ConcurrentModificationException›. It's best-effort bug detection, not a thread-safety guarantee.
- **Fail-safe / weakly consistent** iterators (ConcurrentHashMap, CopyOnWriteArrayList) work on a snapshot or tolerate concurrent changes without throwing.

Remove while iterating with ‹list.removeIf(predicate)›.`,
    k:"Use removeIf or iterator.remove; concurrent collections don't throw CME." },
  { l:"I", t:"Collections", q:"Comparable vs Comparator?",
    a:`- ‹Comparable<T>› defines the **natural order** inside the class (‹compareTo›) — one ordering.
- ‹Comparator<T>› defines external orderings — many possible, composable.

~~~java
alarms.sort(Comparator.comparing(Alarm::severity).reversed()
                      .thenComparing(Alarm::createdAt));
~~~

Keep ‹compareTo› consistent with ‹equals› when used in TreeSet/TreeMap, otherwise "equal" elements may be dropped.`,
    k:"Comparable = natural order; Comparator = pluggable orders." },
  { l:"I", t:"Collections", q:"How do TreeMap, LinkedHashMap and an LRU cache work?",
    a:`- **TreeMap** – red-black tree, keys sorted, O(log n), navigation methods (‹floorKey›, ‹headMap›).
- **LinkedHashMap** – HashMap + doubly linked list preserving insertion or **access order**.

LRU cache in a few lines:
~~~java
class Lru<K,V> extends LinkedHashMap<K,V> {
  private final int max;
  Lru(int max) { super(16, 0.75f, true); this.max = max; }   // accessOrder = true
  protected boolean removeEldestEntry(Map.Entry<K,V> e) { return size() > max; }
}
~~~
For concurrent production caches use Caffeine.`,
    k:"LinkedHashMap(accessOrder=true) + removeEldestEntry = LRU." },
  { l:"I", t:"Collections", q:"What are immutable collections (List.of) vs unmodifiable views?",
    a:`- ‹List.of / Set.of / Map.of› (Java 9) create truly immutable collections; null elements are rejected.
- ‹Collections.unmodifiableList(list)› is a **view** — changes to the underlying list are still visible.
- ‹List.copyOf(list)› makes an immutable copy (defensive copy).
- ‹stream.toList()› (Java 16) returns an unmodifiable list.`,
    k:"of/copyOf are immutable; unmodifiable* are read-only views." },
  // ───────── Generics ─────────
  { l:"I", t:"Generics", q:"What are generics, type erasure and wildcards (PECS)?",
    a:`Generics give compile-time type safety (‹List<Alarm>›). At runtime, types are **erased** to bounds (Object), so you can't do ‹new T()› or ‹instanceof List<String>›.

Wildcards:
- ‹? extends T› – producer you read from (covariant).
- ‹? super T› – consumer you write to (contravariant).
- **PECS**: Producer Extends, Consumer Super.

~~~java
static <T> void copy(List<? super T> dest, List<? extends T> src) { dest.addAll(src); }
~~~`,
    k:"Generics are compile-time only; PECS decides extends vs super." },
  // ───────── Java 8+ ─────────
  { l:"B", t:"Java 8", q:"What are the key Java 8 features?",
    a:`- **Lambdas** and **functional interfaces** (‹Function›, ‹Predicate›, ‹Supplier›, ‹Consumer›).
- **Stream API** for declarative collection processing.
- **Method references** (‹Alarm::severity›).
- **Default and static methods** in interfaces.
- **Optional** to model absence.
- **java.time** (‹Instant›, ‹LocalDateTime›, ‹ZonedDateTime›, ‹Duration›).
- **CompletableFuture** for async composition.
- ConcurrentHashMap improvements, Nashorn (removed later), Metaspace replacing PermGen.`,
    k:"Lambdas, streams, Optional, java.time, CompletableFuture, default methods." },
  { l:"B", t:"Java 8", q:"What is a functional interface? Explain Predicate, Function, Consumer and Supplier.",
    a:`A functional interface has exactly one abstract method, so it can be implemented by a lambda; ‹@FunctionalInterface› enforces it.

- ‹Predicate<T>› – ‹T → boolean› (filter critical alarms).
- ‹Function<T,R>› – ‹T → R› (map entity to DTO).
- ‹Consumer<T>› – ‹T → void› (send notification).
- ‹Supplier<T>› – ‹() → T› (lazy default, ‹orElseGet›).
- Also ‹BiFunction›, ‹UnaryOperator›, ‹BinaryOperator›, primitive versions like ‹IntPredicate›.`,
    k:"One abstract method = lambda target." },
  { l:"I", t:"Streams", q:"How do Java streams work (lazy evaluation, intermediate vs terminal ops)?",
    a:`A stream is a pipeline: **source → intermediate ops → terminal op**. Intermediate ops (‹filter›, ‹map›, ‹sorted›) are lazy and only build the pipeline; the terminal op (‹collect›, ‹forEach›, ‹reduce›, ‹findFirst›) triggers processing element by element. Short-circuit ops (‹findFirst›, ‹anyMatch›, ‹limit›) stop early.

~~~java
Map<String, Long> criticalBySite = alarms.stream()
    .filter(a -> a.severity() == Severity.CRITICAL)
    .collect(Collectors.groupingBy(Alarm::siteId, Collectors.counting()));
~~~

Streams are single-use and don't modify the source.`,
    k:"Lazy pipeline executed by a terminal operation." },
  { l:"I", t:"Streams", q:"map vs flatMap? And common Collectors?",
    a:`- ‹map› transforms each element 1→1.
- ‹flatMap› transforms each element into a stream and flattens (1→many): ‹orders.stream().flatMap(o -> o.items().stream())›.

Collectors: ‹toList()›, ‹toSet()›, ‹toMap(k, v, merge)›, ‹groupingBy(classifier, downstream)›, ‹partitioningBy(pred)›, ‹joining(", ")›, ‹counting()›, ‹summingInt›, ‹averagingDouble›, ‹mapping›, ‹teeing› (Java 12).

Gotcha: ‹toMap› throws on duplicate keys unless you pass a merge function.`,
    k:"flatMap flattens nested streams; toMap needs a merge function for duplicates." },
  { l:"A", t:"Streams", q:"When should you avoid streams or parallel streams?",
    a:`Avoid streams when a simple loop is clearer, when you need checked exceptions, early returns with complex state, or when debugging is critical.

Avoid **parallel streams** in server code by default:
- They use the shared ‹ForkJoinPool.commonPool()›, competing with other work.
- Overhead outweighs benefit for small collections or I/O-bound tasks.
- Side effects/shared mutable state cause races.
- Ordering constraints (‹forEachOrdered›, ‹sorted›) reduce gains.

Use them for large, CPU-bound, independent, splittable workloads (ArrayList/arrays), and measure with JMH.`,
    k:"Readable loops beat clever streams; parallel only for big CPU-bound work, measured." },
  { l:"I", t:"Java 8", q:"How should Optional be used — and misused?",
    a:`‹Optional<T>› expresses "maybe absent" in **return types**.

~~~java
return repo.findById(id).map(DeviceDto::from)
           .orElseThrow(() -> new DeviceNotFoundException(id));
~~~

Don'ts: don't use for fields, parameters or collections (return empty list instead); don't call ‹get()› without checking (use ‹orElseThrow›); prefer ‹orElseGet(supplier)› over ‹orElse(expensiveCall())› because ‹orElse› evaluates eagerly.`,
    k:"Optional for return values; chain map/orElseThrow, avoid get()." },
  { l:"I", t:"Java 8", q:"Why use java.time instead of Date and Calendar?",
    a:`‹java.util.Date›/‹Calendar› are mutable, not thread-safe, have confusing APIs (months from 0) and poor time-zone handling. ‹java.time› is immutable and thread-safe.

- ‹Instant› – a point on the UTC timeline (store/transmit timestamps, e.g. alarm times).
- ‹LocalDate/LocalDateTime› – no zone (birthdays, schedules).
- ‹ZonedDateTime/OffsetDateTime› – with zone/offset (display in user's zone).
- ‹Duration› / ‹Period› – time amounts.
- ‹DateTimeFormatter› – thread-safe formatting.

Store UTC (‹timestamptz› in PostgreSQL) and convert at the edges.`,
    k:"Store Instants in UTC; convert to zones only for display." },
  // ───────── Modern Java ─────────
  { l:"I", t:"Modern Java", q:"What are the important features from Java 11 to Java 21 (LTS)?",
    a:`- **Java 11**: ‹var› in lambdas, new ‹HttpClient›, ‹String.isBlank/strip/lines/repeat›, ‹Files.readString›, single-file source launch.
- **Java 14–16**: switch expressions, helpful NullPointerExceptions, **records**, pattern matching ‹instanceof›, text blocks (15), ‹Stream.toList()›.
- **Java 17 (LTS)**: **sealed classes**, strong encapsulation of JDK internals, new macOS rendering, pseudo-random API.
- **Java 21 (LTS)**: **virtual threads**, **record patterns**, **pattern matching for switch**, sequenced collections, generational ZGC.
- **Java 25 (LTS, 2025)**: scoped values, flexible constructor bodies, compact source files, structured concurrency progress.`,
    k:"11: HttpClient; 17: records + sealed; 21: virtual threads + pattern matching." },
  { l:"I", t:"Modern Java", q:"What are records and when should you use them?",
    a:`A record is a transparent, immutable data carrier: ‹record AlarmDto(long id, String name, Severity severity) {}›. The compiler generates the constructor, accessors (‹id()›), ‹equals›, ‹hashCode› and ‹toString›.

Use for DTOs, API responses, Kafka event payloads, value objects and composite map keys. You can add validation in a compact constructor and static factory methods.

Not for JPA entities (they need mutability, no-arg constructors and proxies).`,
    k:"Records = immutable data carriers; great for DTOs and events, not JPA entities." },
  { l:"A", t:"Modern Java", q:"What are sealed classes and pattern matching for switch?",
    a:`Sealed types restrict which classes may implement them; combined with pattern matching, the compiler can verify exhaustiveness.

~~~java
sealed interface Event permits AlarmRaised, AlarmCleared, DeviceOffline {}
record AlarmRaised(String id, int severity) implements Event {}
record AlarmCleared(String id) implements Event {}
record DeviceOffline(String deviceId) implements Event {}

String describe(Event e) {
  return switch (e) {                       // no default needed – exhaustive
    case AlarmRaised(var id, var sev) when sev > 7 -> "CRITICAL " + id;
    case AlarmRaised r   -> "Raised " + r.id();
    case AlarmCleared c  -> "Cleared " + c.id();
    case DeviceOffline d -> "Offline " + d.deviceId();
  };
}
~~~

Adding a new event type causes compile errors wherever handling is missing — safer domain modelling.`,
    k:"Sealed hierarchies + switch patterns = compiler-checked exhaustive handling." },
  { l:"A", t:"Modern Java", q:"What are virtual threads (Project Loom) and when do they help?",
    a:`Virtual threads (Java 21) are lightweight threads scheduled by the JVM onto a small pool of OS "carrier" threads. Blocking I/O unmounts the virtual thread instead of blocking an OS thread, so you can have millions of them.

- Great for **I/O-bound** request-per-thread servers (REST calls, JDBC, Kafka producers) — simple blocking code with async-like scalability.
- Spring Boot 3.2+: ‹spring.threads.virtual.enabled=true›.
- Not faster for CPU-bound work.
- Pitfalls: **pinning** inside ‹synchronized› blocks during blocking calls (largely fixed in Java 24), ThreadLocal-heavy code, and downstream limits — a DB pool of 20 connections still allows only 20 queries; use semaphores/bulkheads.`,
    k:"Virtual threads make blocking I/O cheap — but don't remove downstream limits." },
  { l:"B", t:"Modern Java", q:"What is var (local variable type inference) and when should you avoid it?",
    a:`‹var› (Java 10) lets the compiler infer a local variable's type: ‹var alarms = new ArrayList<Alarm>();›. It's still statically typed.

Use when the type is obvious from the right side. Avoid when it hides important types (‹var result = service.process();›), with diamond ‹new ArrayList<>()› (infers ‹ArrayList<Object>›), or for numeric literals where precision matters.`,
    k:"var reduces noise when the type is obvious — never at the cost of readability." },
  // ───────── Concurrency ─────────
  { l:"I", t:"Concurrency", q:"Thread vs Runnable vs Callable, and how do you create threads?",
    a:`- Extend ‹Thread› (couples task and thread — avoid).
- Implement ‹Runnable› – no result, no checked exceptions.
- Implement ‹Callable<V>› – returns a result and can throw; submitted to an ExecutorService returning a ‹Future<V>›.

In production, don't create raw threads; submit tasks to a managed ‹ExecutorService›, Spring ‹@Async› executor, or virtual-thread executor (‹Executors.newVirtualThreadPerTaskExecutor()›).`,
    k:"Model work as Runnable/Callable tasks; let executors manage threads." },
  { l:"I", t:"Concurrency", q:"What is a race condition and how do you prevent it?",
    a:`A race condition occurs when correctness depends on the timing of threads accessing shared mutable state, e.g. ‹count++› (read-modify-write) losing updates.

Prevention:
- Avoid shared mutable state (immutability, confinement, message passing).
- ‹synchronized› / ‹ReentrantLock› around invariants.
- Atomic classes (‹AtomicInteger›, ‹LongAdder›) for counters.
- Concurrent collections with atomic compound operations.
- In databases: transactions, unique constraints, optimistic locking — in-memory locks don't work across multiple service instances.`,
    k:"Races come from unsynchronized read-modify-write on shared state." },
  { l:"I", t:"Concurrency", q:"What does synchronized guarantee?",
    a:`‹synchronized› acquires an object's intrinsic monitor:
- **Mutual exclusion** – only one thread executes the block for that monitor.
- **Visibility/ordering** – releasing a monitor happens-before the next acquisition, so writes become visible.
- **Reentrancy** – the same thread can re-acquire.

Instance methods lock ‹this›; static methods lock the ‹Class›. Keep critical sections small, lock on private final objects, and avoid calling external code while holding a lock (deadlock risk).`,
    k:"synchronized = atomicity + visibility for code guarded by the same lock." },
  { l:"A", t:"Concurrency", q:"What does volatile guarantee — and not guarantee?",
    a:`‹volatile› guarantees **visibility** (reads see the latest write) and **ordering** (no reordering across the volatile access; writes before a volatile write are visible after a volatile read).

It does **not** make compound actions atomic: ‹volatileCount++› still races.

Good for flags (‹volatile boolean running›), and safe publication of immutable objects; also needed in double-checked locking singletons.`,
    k:"volatile = visibility, not atomicity." },
  { l:"A", t:"Concurrency", q:"Explain the Java Memory Model and happens-before.",
    a:`The JMM defines when writes by one thread are guaranteed visible to another. Without a **happens-before** relation, the CPU/compiler may reorder or cache values.

Happens-before edges: program order in a thread, monitor unlock → lock, volatile write → read, ‹Thread.start()› → actions in the started thread, thread actions → ‹join()› returns, final field freeze at end of constructor, executor submit → task execution, ‹CompletableFuture› completion → dependent stages.

**Safe publication**: publish objects via final fields, volatile, locks, or concurrent collections so other threads see fully constructed state.`,
    k:"No happens-before edge = no visibility guarantee." },
  { l:"A", t:"Concurrency", q:"AtomicInteger vs synchronized vs LongAdder?",
    a:`- **AtomicInteger** – lock-free CAS for single-variable updates; great under low/moderate contention.
- **LongAdder** – stripes the counter across cells; much faster under high contention for counters/metrics; ‹sum()› is not an atomic snapshot.
- **synchronized/Lock** – needed when an invariant spans multiple variables or operations.

Example: count incoming alerts per second → LongAdder; update balance and audit log together → lock or DB transaction.`,
    k:"Atomics for one variable, LongAdder for hot counters, locks for multi-variable invariants." },
  { l:"A", t:"Concurrency", q:"How does ExecutorService work and how do thread pools fail?",
    a:`A ThreadPoolExecutor has core/max threads, a work queue and a rejection policy. Tasks go to core threads, then the queue, then extra threads up to max, then rejection.

Failure modes:
- **Unbounded queue** (‹Executors.newFixedThreadPool›) hides overload → memory growth and huge latency.
- **Unbounded threads** (‹newCachedThreadPool›) → thread explosion.
- **Blocking tasks** without timeouts exhaust the pool.
- **Pool-induced deadlock** – tasks waiting on other tasks in the same full pool.
- Lost exceptions in ‹execute()› tasks.

Configure explicitly: bounded queue, named threads, rejection policy (‹CallerRunsPolicy› for backpressure), metrics, and graceful ‹shutdown()› + ‹awaitTermination›.`,
    k:"Bound queues and threads, set timeouts, monitor, shut down gracefully." },
  { l:"A", t:"Concurrency", q:"How do you use CompletableFuture to call multiple services in parallel?",
    a:`~~~java
var exec = Executors.newVirtualThreadPerTaskExecutor();
CompletableFuture<Device> device = CompletableFuture.supplyAsync(() -> deviceClient.get(id), exec);
CompletableFuture<List<Alarm>> alarms = CompletableFuture.supplyAsync(() -> alarmClient.recent(id), exec);

DeviceView view = device.thenCombine(alarms, DeviceView::new)
    .orTimeout(2, TimeUnit.SECONDS)
    .exceptionally(ex -> DeviceView.degraded(id))
    .join();
~~~

Key points: pass a dedicated executor (not the common pool) for blocking calls; add timeouts (‹orTimeout›, ‹completeOnTimeout›); handle errors (‹exceptionally›, ‹handle›); use ‹allOf› for many futures; ‹thenCompose› for dependent calls.`,
    k:"supplyAsync with your own executor, combine, timeout, handle errors." },
  { l:"A", t:"Concurrency", q:"What are deadlock, livelock and starvation? How do you detect deadlock?",
    a:`- **Deadlock** – threads wait forever for each other's locks (A holds L1 wants L2; B holds L2 wants L1).
- **Livelock** – threads keep reacting to each other and make no progress.
- **Starvation** – a thread never gets CPU/lock because others dominate.

Prevent deadlock with a global lock ordering, ‹tryLock(timeout)›, smaller lock scopes, and avoiding nested locks. Detect with a thread dump (‹jstack <pid>›, ‹jcmd <pid> Thread.print›) — the JVM reports "Found one Java-level deadlock" — or ‹ThreadMXBean.findDeadlockedThreads()›.`,
    k:"Consistent lock ordering + timeouts; thread dumps reveal deadlocks." },
  { l:"I", t:"Concurrency", q:"What are CountDownLatch, CyclicBarrier, Semaphore and ReentrantLock?",
    a:`- **CountDownLatch** – one-shot gate: wait until N events happen (start a test after N services are ready).
- **CyclicBarrier** – N threads wait for each other, reusable per phase.
- **Semaphore** – limits concurrent access to N permits (cap parallel calls to a fragile downstream API).
- **ReentrantLock** – explicit lock with ‹tryLock›, timeouts, interruptibility, fairness and multiple ‹Condition›s.
- **ReadWriteLock / StampedLock** – many readers, one writer.`,
    k:"Latch = wait for events, Semaphore = limit concurrency, Lock = flexible mutex." },
  { l:"A", t:"Concurrency", q:"What is ThreadLocal and what are its risks?",
    a:`‹ThreadLocal› gives each thread its own copy of a variable — used for request context (user, correlation ID in MDC), transaction context in Spring, ‹SimpleDateFormat› instances.

Risks: in thread pools, values **leak across requests** if not removed (security bug!) and can cause class-loader memory leaks in app servers. Always ‹remove()› in a finally block or filter. With virtual threads, prefer ‹ScopedValue› (Java 25) for immutable, bounded context.`,
    k:"Always remove ThreadLocals in pooled threads." },
  // ───────── JVM ─────────
  { l:"I", t:"JVM", q:"Explain JVM memory areas: heap, stack, metaspace, code cache, direct memory.",
    a:`- **Heap** – objects and arrays, shared by threads, managed by GC (young: Eden + survivors; old gen).
- **Stack** – per thread: frames with local variables, operand stack; ‹StackOverflowError› on deep recursion.
- **Metaspace** – class metadata in native memory (replaced PermGen in Java 8); grows unless capped.
- **Code cache** – JIT-compiled native code.
- **Direct/off-heap memory** – NIO buffers (Netty, Kafka clients).
- **PC register** and native method stacks.

In containers, total RSS = heap + metaspace + threads × stack size + direct memory + code cache, so size ‹-XX:MaxRAMPercentage› with headroom.`,
    k:"Heap for objects, stacks for frames, metaspace for classes — and container memory counts all." },
  { l:"I", t:"JVM", q:"Walk through JVM execution from .java to native instructions.",
    a:`1. ‹javac› compiles ‹.java› to platform-neutral ‹.class› bytecode.
2. **Class loading** – bootstrap → platform → application class loaders (parent delegation).
3. **Linking** – verification, preparation (static defaults), resolution.
4. **Initialization** – static initialisers run.
5. **Execution** – the interpreter runs bytecode while profiling; hot methods are compiled by **C1** then **C2** JIT (tiered) into optimised native code (inlining, escape analysis, loop unrolling).
6. **GC** reclaims unreachable objects.`,
    k:"javac → class loading → linking → init → interpret → JIT hot paths → GC." },
  { l:"A", t:"JVM", q:"How does garbage collection work and how do you choose a collector?",
    a:`GC finds objects unreachable from GC roots (stack locals, static fields, JNI refs) and reclaims them. The **generational hypothesis** (most objects die young) drives Young GCs (copying survivors) and less frequent Old GCs.

Collectors:
- **G1** (default) – region-based, balances throughput and pause targets (‹-XX:MaxGCPauseMillis=200›). Good default for services.
- **ZGC / Shenandoah** – concurrent, sub-millisecond pauses even with large heaps; generational ZGC in Java 21.
- **Parallel** – max throughput for batch jobs.
- **Serial** – tiny heaps/single CPU containers.

Tune with evidence from GC logs (‹-Xlog:gc*›), not guesses.`,
    k:"G1 by default, ZGC for low latency, Parallel for batch throughput." },
  { l:"A", t:"JVM", q:"How do you investigate high memory usage or OutOfMemoryError in a Java service?",
    a:`1. Identify the type: ‹Java heap space›, ‹Metaspace›, ‹GC overhead limit›, ‹Direct buffer memory›, or the container's OOMKilled (native/RSS).
2. Look at trends in heap-after-GC (Micrometer/Prometheus/CloudWatch) — a rising floor suggests a leak.
3. Capture a heap dump: ‹-XX:+HeapDumpOnOutOfMemoryError› or ‹jcmd <pid> GC.heap_dump›.
4. Analyse with Eclipse MAT / VisualVM: dominator tree, leak suspects, retained size.
5. Typical culprits: unbounded caches/maps, listeners not removed, ThreadLocals, huge result sets loaded into memory, long-lived sessions, Kafka consumer buffering.
6. For native memory: ‹-XX:NativeMemoryTracking=summary› + ‹jcmd VM.native_memory›.`,
    k:"Classify the OOM, watch heap-after-GC trends, take and analyse a heap dump." },
  { l:"A", t:"JVM", q:"How do you troubleshoot high CPU in a Java process?",
    a:`1. ‹top -H -p <pid>› to find the hot native thread ID; convert to hex.
2. ‹jstack <pid>› / ‹jcmd Thread.print›; find the matching ‹nid›; take 3–5 dumps a few seconds apart.
3. Look for tight loops, regex backtracking, heavy JSON serialization, logging in hot paths, or GC threads (then it's a memory problem).
4. Use async-profiler or Java Flight Recorder (‹jcmd <pid> JFR.start duration=60s›) for flame graphs.
5. Fix, then verify with load tests.`,
    k:"Hot thread → thread dump → profiler flame graph." },
  { l:"I", t:"JVM", q:"What are class loaders and the parent delegation model?",
    a:`Class loaders load classes on demand. Hierarchy: **Bootstrap** (java.base) → **Platform** (Java SE modules) → **Application** (classpath) → custom loaders (app servers, Spring Boot's ‹LaunchedClassLoader› for fat JARs).

**Parent delegation**: a loader first asks its parent; only if the parent can't find the class does it load it. This prevents user code from overriding core classes like ‹java.lang.String›. A class is identified by its name **plus** its loader, which explains ‹ClassCastException: X cannot be cast to X›.`,
    k:"Delegate to parent first; identity = class name + loader." },
  { l:"A", t:"JVM", q:"How does the JIT compiler optimise Java code?",
    a:`The HotSpot JVM profiles running code and compiles hot methods: **C1** (quick, light optimisation) then **C2** (aggressive) — tiered compilation.

Optimisations: method **inlining**, **escape analysis** (allocate on stack/scalar replacement), loop unrolling, dead-code elimination, lock elision/coarsening, and speculative devirtualisation with deoptimisation if assumptions break.

Consequence: Java services need **warm-up**; benchmark with JMH, not ‹System.nanoTime› loops. GraalVM Native Image and CDS/CRaC improve startup for containers/Lambda.`,
    k:"JIT optimises hot paths using runtime profiles — benchmark after warm-up." },
  { l:"I", t:"JVM", q:"What are strong, soft, weak and phantom references?",
    a:`- **Strong** – normal references; never collected while reachable.
- **Soft** – collected only under memory pressure (memory-sensitive caches).
- **Weak** – collected at the next GC if only weakly reachable (‹WeakHashMap› keys, canonicalising maps).
- **Phantom** – for post-mortem cleanup with a ReferenceQueue (‹Cleaner›).`,
    k:"Reference strength controls how eagerly GC can reclaim objects." },
  // ───────── Design patterns ─────────
  { l:"I", t:"Design Patterns", q:"How do you implement a thread-safe singleton?",
    a:`Prefer simple, safe options:

~~~java
public enum ConfigRegistry { INSTANCE; ... }          // serialization- and reflection-safe

public class Holder {                                 // lazy, thread-safe via class init
  private Holder() {}
  private static class Lazy { static final Holder I = new Holder(); }
  public static Holder get() { return Lazy.I; }
}
~~~

Double-checked locking needs a ‹volatile› field. In Spring apps, a singleton-scoped bean is usually what you want — but remember singleton ≠ thread-safe state.`,
    k:"Enum or holder idiom; in Spring, singleton beans with stateless design." },
  { l:"I", t:"Design Patterns", q:"Which design patterns do you use most in Spring/Java projects?",
    a:`- **Factory / Abstract Factory** – ‹BeanFactory›, creating parsers per device type.
- **Strategy** – pluggable alert-routing or pricing rules injected as ‹Map<String, Strategy>›.
- **Template Method** – ‹JdbcTemplate›, ‹RestTemplate›, abstract processors.
- **Proxy** – Spring AOP for ‹@Transactional›, ‹@Cacheable›.
- **Observer / Pub-Sub** – Spring events, Kafka.
- **Builder** – Lombok ‹@Builder›, ‹HttpRequest.newBuilder()›.
- **Adapter** – wrapping third-party APIs behind our interfaces.
- **Decorator** – ‹BufferedInputStream›, adding retry/metrics around clients.
- **Chain of Responsibility** – servlet filters, Spring Security filter chain.`,
    k:"Strategy, Template, Proxy, Observer, Builder — all over Spring." },
  { l:"I", t:"Design Patterns", q:"Explain the Strategy pattern with a Spring example.",
    a:`Strategy encapsulates interchangeable algorithms behind one interface.

~~~java
public interface NotificationChannel { String type(); void send(Alert a); }

@Component class EmailChannel implements NotificationChannel { ... }
@Component class WebSocketChannel implements NotificationChannel { ... }

@Service
class Notifier {
  private final Map<String, NotificationChannel> channels;
  Notifier(List<NotificationChannel> list) {
    channels = list.stream().collect(toMap(NotificationChannel::type, c -> c));
  }
  void notify(Alert a, String type) { channels.get(type).send(a); }
}
~~~

Adding SMS means adding one class — open/closed principle, no if-else chains.`,
    k:"Inject all implementations, pick by key — no switch statements." },
  // ───────── Misc / Coding ─────────
  { l:"I", t:"Serialization", q:"What is serialization, serialVersionUID and transient?",
    a:`Java serialization converts objects to bytes (‹Serializable›). ‹serialVersionUID› versions the class; a mismatch throws ‹InvalidClassException›. ‹transient› fields are skipped (passwords, caches).

Native Java serialization is a known security risk (deserialization gadget chains) — prefer JSON (Jackson), Avro or Protobuf for APIs and Kafka messages, with schema evolution rules.`,
    k:"Avoid native serialization for external data; use JSON/Avro/Protobuf." },
  { l:"I", t:"Basics", q:"What are inner, static nested, local and anonymous classes?",
    a:`- **Static nested** – no outer instance reference; use for builders and helpers.
- **Inner (non-static)** – holds an implicit reference to the outer instance (can cause memory leaks if it outlives it).
- **Local** – declared inside a method.
- **Anonymous** – one-off implementation inline; mostly replaced by lambdas for functional interfaces.`,
    k:"Prefer static nested classes unless you truly need the outer instance." },
  { l:"I", t:"Reflection", q:"What is reflection and where is it used?",
    a:`Reflection inspects and manipulates classes, methods and fields at runtime (‹Class.forName›, ‹getDeclaredMethods›, ‹setAccessible›). Frameworks rely on it: Spring DI and annotations, Hibernate entity mapping, Jackson, JUnit.

Downsides: slower than direct calls, breaks encapsulation, bypasses compile-time checks, and is restricted by the module system (Java 17 strong encapsulation). Spring AOT/GraalVM native images replace runtime reflection with build-time metadata.`,
    k:"Reflection powers frameworks but costs safety and performance." },
  { l:"I", t:"Annotations", q:"How do custom annotations work?",
    a:`Define with ‹@interface›, specify ‹@Retention› (SOURCE, CLASS, RUNTIME) and ‹@Target›. Runtime annotations are read via reflection or Spring AOP.

~~~java
@Retention(RUNTIME) @Target(METHOD)
public @interface Audited { String action(); }

@Aspect @Component
class AuditAspect {
  @AfterReturning("@annotation(audited)")
  void log(JoinPoint jp, Audited audited) { auditRepo.save(audited.action(), jp.getArgs()); }
}
~~~`,
    k:"Annotation = metadata; an aspect or processor gives it behaviour." },
  { l:"I", t:"Coding", q:"Write a method to find the first non-repeating character in a string.",
    a:`Use an insertion-ordered count map — O(n) time.

~~~java
static Optional<Character> firstUnique(String s) {
  Map<Character, Long> counts = s.chars().mapToObj(c -> (char) c)
      .collect(Collectors.groupingBy(Function.identity(), LinkedHashMap::new, Collectors.counting()));
  return counts.entrySet().stream().filter(e -> e.getValue() == 1)
      .map(Map.Entry::getKey).findFirst();
}
// "swiss" -> 'w'
~~~

A classic loop with an ‹int[256]› array is faster for ASCII. Mention complexity and edge cases (empty string, all repeated).`,
    k:"LinkedHashMap preserves order; two passes, O(n)." },
  { l:"I", t:"Coding", q:"Stream puzzles: group employees by department, find the 2nd highest salary, count words.",
    a:`~~~java
// group by department with average salary
Map<String, Double> avg = emps.stream()
    .collect(groupingBy(Employee::dept, averagingDouble(Employee::salary)));

// second highest distinct salary
Optional<Double> second = emps.stream().map(Employee::salary).distinct()
    .sorted(Comparator.reverseOrder()).skip(1).findFirst();

// highest paid per department
Map<String, Optional<Employee>> top = emps.stream()
    .collect(groupingBy(Employee::dept, maxBy(comparingDouble(Employee::salary))));

// word frequency
Map<String, Long> freq = Arrays.stream(text.toLowerCase().split("\\\\W+"))
    .filter(w -> !w.isBlank()).collect(groupingBy(w -> w, counting()));
~~~`,
    k:"groupingBy + downstream collectors solve most stream puzzles." },
  { l:"A", t:"Coding", q:"Implement a thread-safe rate limiter (token bucket).",
    a:`~~~java
public final class TokenBucket {
  private final long capacity; private final double refillPerNano;
  private double tokens; private long last = System.nanoTime();
  public TokenBucket(long capacity, long perSecond) {
    this.capacity = capacity; this.tokens = capacity; this.refillPerNano = perSecond / 1e9;
  }
  public synchronized boolean tryAcquire() {
    long now = System.nanoTime();
    tokens = Math.min(capacity, tokens + (now - last) * refillPerNano);
    last = now;
    if (tokens >= 1) { tokens -= 1; return true; }
    return false;
  }
}
~~~

Discuss: per-client buckets in a ConcurrentHashMap, distributed limiting with Redis (Lua script) for multiple instances, or using API Gateway / Resilience4j RateLimiter instead of hand-rolled code.`,
    k:"Refill by elapsed time, consume a token, synchronize the critical section." },
  { l:"I", t:"Coding", q:"How do you reverse a string, check a palindrome and detect anagrams?",
    a:`~~~java
String rev = new StringBuilder(s).reverse().toString();

boolean isPalindrome(String s) {
  int i = 0, j = s.length() - 1;
  while (i < j) if (s.charAt(i++) != s.charAt(j--)) return false;
  return true;
}

boolean isAnagram(String a, String b) {
  if (a.length() != b.length()) return false;
  int[] c = new int[26];
  for (int i = 0; i < a.length(); i++) { c[a.charAt(i) - 'a']++; c[b.charAt(i) - 'a']--; }
  for (int x : c) if (x != 0) return false;
  return true;
}
~~~

Talk through time/space complexity and Unicode caveats (surrogate pairs, normalisation).`,
    k:"Two pointers for palindromes, counting array for anagrams." },
  { l:"E", t:"Scenario", q:"Scenario: a Java service's p99 latency spikes every few minutes. How do you diagnose it?",
    a:`Periodic spikes suggest something scheduled or cyclical.

1. Correlate spike timestamps with **GC logs** (long old-gen/full GCs), **scheduled jobs** (‹@Scheduled› batches, cache refresh), log rotation, Kafka consumer rebalances, connection pool max-lifetime recycling, or cron jobs on the host.
2. Check **JFR** recordings around the spikes: safepoints, lock contention, allocation pressure.
3. Inspect thread pools and DB pool metrics (pending threads) for saturation.
4. Check downstream latency via distributed traces.
5. Fix accordingly: tune heap/GC (G1 → ZGC), spread scheduled work, increase pool or reduce batch size, warm caches asynchronously.`,
    k:"Periodic = correlate with GC, schedulers, rebalances and pool recycling." }
]);
