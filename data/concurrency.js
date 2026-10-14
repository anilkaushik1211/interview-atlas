ATLAS.addTrack({
  id: "concurrency", title: "Multithreading", icon: "🧵", color: "#10b981", accent: "#6ee7b7",
  tagline: "Threads, locks, JMM, executors, CompletableFuture & virtual threads",
  blurb: "Everything about concurrent Java: thread basics, synchronization, the memory model, concurrent collections, executors, async composition, virtual threads, classic coding problems and production debugging."
}, [
  // ───────── Basics ─────────
  { l:"B", t:"Basics", q:"What is the difference between a process and a thread?",
    a:`A **process** is an independent program with its own memory space (heap, code, file handles). A **thread** is a unit of execution *inside* a process; all threads of a process share the same heap but each has its own stack and program counter.

- Creating/switching threads is cheaper than processes.
- Threads communicate through shared memory (fast but needs synchronization); processes communicate via IPC (sockets, pipes).
- A crash in one process doesn't kill another; an uncaught error can affect the whole JVM process.

A Spring Boot app is one JVM **process** running hundreds of **threads**: Tomcat request threads, Kafka consumer threads, GC threads, scheduler threads.`,
    k:"Processes isolate memory; threads share it.",
    r:"A restaurant is a process: one kitchen (shared memory). The cooks are threads — they share the fridge and stove, so they must coordinate, but each has their own order ticket (stack)." },
  { l:"B", t:"Basics", q:"What is the difference between concurrency and parallelism?",
    a:`- **Concurrency** – dealing with many tasks at once by interleaving them (structure). Possible on a single CPU core.
- **Parallelism** – doing many tasks at the same instant on multiple cores (execution).

A web server handling 1,000 requests with 200 threads on 8 cores is concurrent; at any instant, up to 8 threads run in parallel. Concurrency is about *correct coordination*; parallelism is about *speed*.`,
    k:"Concurrency = juggling; parallelism = many hands.",
    r:"One barista taking orders, steaming milk and pulling shots by switching between them is concurrency. Three baristas each making a drink at the same time is parallelism." },
  { l:"B", t:"Basics", q:"Explain the thread lifecycle (states) in Java.",
    a:`‹Thread.State› has six states:
1. **NEW** – created, ‹start()› not called.
2. **RUNNABLE** – running or ready to run (waiting for CPU).
3. **BLOCKED** – waiting to acquire a monitor lock (‹synchronized›).
4. **WAITING** – waiting indefinitely (‹wait()›, ‹join()›, ‹LockSupport.park()›).
5. **TIMED_WAITING** – waiting with a timeout (‹sleep(ms)›, ‹wait(ms)›, ‹join(ms)›).
6. **TERMINATED** – run() finished or threw.

Thread dumps show these states — many BLOCKED threads on the same lock = contention; many WAITING on a pool's queue = idle workers.`,
    k:"NEW → RUNNABLE ⇄ BLOCKED/WAITING/TIMED_WAITING → TERMINATED.",
    r:"A taxi driver: hired (NEW), driving or at the rank (RUNNABLE), stuck at a closed toll gate (BLOCKED), waiting for a call with no time limit (WAITING), on a 10-minute break (TIMED_WAITING), shift over (TERMINATED)." },
  { l:"B", t:"Basics", q:"start() vs run() — what happens if you call run() directly?",
    a:`‹start()› asks the JVM to create a new OS thread which then calls ‹run()›. Calling ‹run()› directly just executes the method **on the current thread** like any normal method — no concurrency at all. Calling ‹start()› twice throws ‹IllegalThreadStateException›.`,
    k:"start() creates a thread; run() is just a method call.",
    r:"start() is hiring a courier to deliver your parcel; run() is walking the parcel there yourself." },
  { l:"B", t:"Basics", q:"What are the ways to create a thread in Java?",
    a:`~~~java
// 1. Extend Thread (couples task and thread — avoid)
new Thread() { public void run() { work(); } }.start();

// 2. Runnable (no result)
new Thread(() -> work()).start();

// 3. Callable via ExecutorService (returns a result, can throw)
Future<Integer> f = executor.submit(() -> compute());

// 4. CompletableFuture
CompletableFuture.supplyAsync(this::compute, executor);

// 5. Virtual threads (Java 21)
Thread.ofVirtual().start(() -> work());
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) { ex.submit(() -> work()); }
~~~

In production code, prefer executors (or Spring's ‹@Async›) over raw threads so threads are pooled, named, bounded and monitored.`,
    k:"Model work as tasks; let executors own the threads.",
    r:"Instead of hiring a new employee for every delivery (new Thread), you call a courier company (executor) that has a fleet of drivers and assigns them for you." },
  { l:"B", t:"Basics", q:"sleep() vs wait() vs yield() vs join()?",
    a:`- ‹Thread.sleep(ms)› – pauses the current thread; **keeps** any locks it holds.
- ‹obj.wait()› – must hold ‹obj›'s monitor; **releases** it and waits until ‹notify/notifyAll› (or timeout/spurious wakeup).
- ‹Thread.yield()› – a hint that the thread is willing to give up the CPU; rarely useful.
- ‹t.join()› – the current thread waits until thread ‹t› finishes.

Always call ‹wait()› in a loop checking the condition, because of spurious wakeups.`,
    k:"sleep keeps the lock, wait releases it, join waits for another thread.",
    r:"sleep: napping at your desk while still holding the meeting-room key. wait: handing back the key and asking to be called when the room is free. join: waiting at the door until your colleague finishes their call." },
  { l:"B", t:"Basics", q:"What are daemon threads?",
    a:`Daemon threads are background threads that don't prevent the JVM from exiting. When only daemon threads remain, the JVM shuts down and abandons them (no finally blocks guaranteed). GC and JIT threads are daemons.

Set with ‹t.setDaemon(true)› before ‹start()›. Don't use daemon threads for work that must complete (writing files, committing offsets) — use proper shutdown hooks and executor shutdown instead.`,
    k:"Daemons die with the JVM; never trust them with must-finish work.",
    r:"Daemon threads are like the office cleaning crew: when the last employee leaves and the building closes, they're sent home mid-task." },
  { l:"B", t:"Basics", q:"How do you stop a thread correctly? What is interruption?",
    a:`Never use ‹Thread.stop()› (deprecated, unsafe — releases locks mid-operation). Use **cooperative cancellation**:
- Call ‹t.interrupt()› (or ‹future.cancel(true)›, ‹executor.shutdownNow()›).
- Blocking methods (‹sleep›, ‹wait›, ‹BlockingQueue.take›) throw ‹InterruptedException›.
- Loops check ‹Thread.currentThread().isInterrupted()›.

~~~java
while (!Thread.currentThread().isInterrupted()) {
  try { process(queue.take()); }
  catch (InterruptedException e) { Thread.currentThread().interrupt(); break; } // restore flag
}
~~~

Never swallow ‹InterruptedException› silently — restore the flag or propagate.`,
    k:"Interrupt politely; the thread decides when to stop safely.",
    r:"Like tapping a surgeon on the shoulder: you don't yank them away mid-incision (stop()); you signal, and they finish the stitch and step away (interrupt)." },
  { l:"I", t:"Basics", q:"What is a context switch and why is it expensive?",
    a:`A context switch happens when the CPU stops running one thread and starts another: saving registers, program counter and stack pointer, updating scheduler data, and often losing CPU cache warmth (cache/TLB misses).

Thousands of threads competing for few cores spend significant time switching instead of working. That's why thread pools are sized to the workload, why non-blocking I/O exists, and why virtual threads (which switch in user space on blocking I/O) are cheaper.`,
    k:"Too many runnable threads = time wasted switching.",
    r:"Like a student switching between five subjects every two minutes — each switch means re-opening books and remembering where they were, so little real study happens." },
  // ───────── Synchronization ─────────
  { l:"I", t:"Synchronization", q:"What is a race condition? Show a real example.",
    a:`A race condition happens when the result depends on the unpredictable timing of threads accessing shared mutable state.

~~~java
class Counter {
  private int count = 0;
  void increment() { count++; }   // read → add → write: NOT atomic
}
// 2 threads × 10_000 increments → often ends below 20_000
~~~

Both threads read 5, both write 6 — one update is lost. Fixes: ‹synchronized›, ‹AtomicInteger›/‹LongAdder›, or avoid sharing (confinement, immutability). In distributed systems the same bug appears across instances — fix with DB constraints or conditional updates.`,
    k:"Unsynchronized read-modify-write loses updates.",
    r:"Two cashiers update the same stock sheet: both see '5 left', both sell one and write '4'. Two items sold, but the sheet says only one was." },
  { l:"I", t:"Synchronization", q:"What is a critical section and how does synchronized protect it?",
    a:`A **critical section** is code that accesses shared state and must not run concurrently. ‹synchronized› acquires the object's **intrinsic lock (monitor)**: only one thread at a time can hold it; others go BLOCKED.

~~~java
private final Object lock = new Object();
void transfer(Account to, long amount) {
  synchronized (lock) { this.balance -= amount; to.balance += amount; }
}
~~~

It also gives **visibility**: changes made before releasing the lock are visible to the next thread acquiring it. Prefer locking on private final objects (not ‹this› or strings) and keep the critical section short.`,
    k:"One thread inside the section at a time + visibility on release.",
    r:"A single-occupancy restroom with a key: only one person inside, and whoever gets the key next finds it exactly as the last person left it." },
  { l:"I", t:"Synchronization", q:"Synchronized method vs synchronized block vs static synchronized?",
    a:`- **Synchronized instance method** – locks ‹this›; whole method is the critical section.
- **Synchronized block** – locks any chosen object for only the necessary lines → less contention, finer control.
- **Static synchronized method** – locks the ‹Class› object, shared across all instances.

Note: an instance-synchronized method and a static-synchronized method use **different** locks, so they don't exclude each other.`,
    k:"Blocks give finer control; static methods lock the Class object.",
    r:"Locking the whole house (method) vs locking only the safe (block). Static synchronized is locking the building's main gate — shared by every apartment." },
  { l:"I", t:"Synchronization", q:"What is reentrancy in Java locks?",
    a:`A reentrant lock can be acquired again by the thread that already holds it without deadlocking itself. ‹synchronized› and ‹ReentrantLock› are reentrant: a hold count increments on each acquire and the lock is released when it drops to zero.

This allows a synchronized method to call another synchronized method on the same object, and subclasses to call ‹super› synchronized methods.`,
    k:"The owner can re-enter its own lock.",
    r:"You've badged into the office; walking into an inner room on the same badge doesn't lock you out — the system knows you're already in." },
  { l:"I", t:"Synchronization", q:"How do wait(), notify() and notifyAll() work?",
    a:`They implement condition waiting on an object's monitor:
- ‹wait()› – releases the monitor and suspends until notified.
- ‹notify()› – wakes one waiting thread (arbitrary).
- ‹notifyAll()› – wakes all waiters; each re-checks its condition.

~~~java
synchronized (queue) {
  while (queue.isEmpty()) queue.wait();     // always a loop
  item = queue.poll();
  queue.notifyAll();
}
~~~

Must be called while holding the monitor (else ‹IllegalMonitorStateException›). Modern code prefers ‹BlockingQueue›, ‹Condition› or ‹CountDownLatch›.`,
    k:"wait in a loop, notifyAll when state changes — or use higher-level utilities.",
    r:"Waiting at a doctor's clinic: you give up your seat at the counter (release the lock) and sit in the lounge until a nurse calls names (notify). When called, you check it's really your turn (the while loop)." },
  { l:"A", t:"Locks", q:"ReentrantLock vs synchronized — when would you use ReentrantLock?",
    a:`‹ReentrantLock› offers features ‹synchronized› doesn't:
- ‹tryLock()› / ‹tryLock(timeout)› – avoid waiting forever (deadlock avoidance).
- ‹lockInterruptibly()› – respond to interruption while waiting.
- **Fairness** option (FIFO handoff).
- Multiple ‹Condition› objects (e.g. notFull / notEmpty).

~~~java
private final ReentrantLock lock = new ReentrantLock();
if (lock.tryLock(200, TimeUnit.MILLISECONDS)) {
  try { updateCache(); } finally { lock.unlock(); }   // ALWAYS unlock in finally
} else { metrics.lockTimeout(); }
~~~

Otherwise use ‹synchronized› — simpler and can't forget to unlock.`,
    k:"ReentrantLock for timeouts, interruptibility, fairness, conditions.",
    r:"synchronized is a simple door handle. ReentrantLock is a smart lock: you can try the door and leave if it's busy, set a time limit, or form an orderly queue." },
  { l:"A", t:"Locks", q:"What are ReadWriteLock and StampedLock?",
    a:`- **ReentrantReadWriteLock** – many readers OR one writer. Great for read-heavy shared data (configuration, reference caches).
- **StampedLock** (Java 8) – adds **optimistic reads**: read without locking, then ‹validate(stamp)›; if a write happened meanwhile, retry with a real read lock. Faster for very read-heavy data but not reentrant and more complex.

~~~java
long stamp = sl.tryOptimisticRead();
double x = this.x, y = this.y;
if (!sl.validate(stamp)) { stamp = sl.readLock(); try { x = this.x; y = this.y; } finally { sl.unlockRead(stamp); } }
~~~`,
    k:"Read locks share; write locks exclude; optimistic reads skip locking.",
    r:"A museum: many visitors can view a painting at once (readers), but the restorer closes the room to work on it (writer). StampedLock lets visitors peek and only queue properly if a restorer showed up meanwhile." },
  { l:"A", t:"Locks", q:"What is lock contention and how do you reduce it?",
    a:`Contention happens when many threads want the same lock simultaneously, so they queue (BLOCKED) and throughput collapses.

Reduce it by:
- Shrinking critical sections (do I/O and computation outside the lock).
- **Lock striping** – multiple locks for different partitions (ConcurrentHashMap's per-bin locking).
- Lock-free structures (atomics, ‹LongAdder›, ConcurrentLinkedQueue).
- Read/write locks for read-heavy access.
- Thread confinement / per-thread buffers merged later.
- Immutable snapshots (copy-on-write).

Detect via thread dumps (many threads "waiting to lock <0x...>"), JFR lock profiling, async-profiler lock mode.`,
    k:"Shorter, finer-grained or no locks.",
    r:"One billing counter in a supermarket causes a long queue. Open more counters (striping), use self-checkout (lock-free), and don't let customers chat at the counter (short critical sections)." },
  // ───────── Memory model ─────────
  { l:"A", t:"Memory Model", q:"What is the visibility problem and how does volatile solve it?",
    a:`Each core may cache values or the JIT may hoist reads out of loops, so a thread might never see another thread's update.

~~~java
private volatile boolean running = true;     // without volatile this loop may never stop
void runLoop() { while (running) { poll(); } }
void stop() { running = false; }
~~~

‹volatile› guarantees every read sees the latest write and prevents reordering around it. It does **not** make ‹count++› atomic. Use it for status flags, published references and double-checked locking.`,
    k:"volatile = always read the latest value; not atomic for compound ops.",
    r:"Two people sharing a plan written on personal notepads vs a shared whiteboard. volatile forces everyone to read the whiteboard instead of their outdated notepad copy." },
  { l:"A", t:"Memory Model", q:"What is instruction reordering and the happens-before relationship?",
    a:`Compilers and CPUs reorder instructions for speed as long as single-thread results stay the same. Other threads may observe the reordered effects. The **Java Memory Model** defines **happens-before** rules that guarantee ordering/visibility:
- Unlock of a monitor → later lock of the same monitor.
- Write to a volatile → later read of it.
- ‹Thread.start()› → everything in the started thread.
- Everything in a thread → another thread's ‹join()› returning.
- Task submission to an executor → task execution; future completion → ‹get()›.
- Final fields set in a constructor → visible after construction (if ‹this› didn't escape).`,
    k:"Without a happens-before edge, you have no guarantees.",
    r:"A chef may prep ingredients in any order to save time — fine for them. But if a waiter takes the plate before the chef 'publishes' it at the pass (happens-before), the waiter might grab a half-finished dish." },
  { l:"A", t:"Memory Model", q:"Explain double-checked locking and why volatile is required.",
    a:`~~~java
class Config {
  private static volatile Config instance;
  static Config get() {
    Config c = instance;
    if (c == null) {
      synchronized (Config.class) {
        c = instance;
        if (c == null) instance = c = new Config();
      }
    }
    return c;
  }
}
~~~

Without ‹volatile›, ‹instance = new Config()› can be reordered so the reference is published **before** the constructor finishes — another thread sees a non-null but half-initialised object. ‹volatile› forbids that reordering. Simpler alternatives: holder-class idiom or an enum singleton.`,
    k:"volatile prevents publishing a half-built object.",
    r:"Announcing 'the new office is open!' before the furniture arrives — visitors walk into an empty room. volatile makes sure the announcement happens only after the setup is complete." },
  { l:"A", t:"Memory Model", q:"What is safe publication and why are immutable objects thread-safe?",
    a:`Safe publication makes an object and its state visible to other threads correctly. Ways: initialise in a static initializer, store in a volatile/final field or AtomicReference, guard with a lock, or put it into a concurrent collection.

Immutable objects (all fields final, no mutation, ‹this› doesn't escape) are thread-safe without synchronization because the JMM guarantees final fields are visible once construction completes. Records and ‹List.copyOf› make this easy.`,
    k:"Immutable + final fields = share freely.",
    r:"A printed train timetable can be handed to anyone at the same time — nobody can change it, so nobody needs to coordinate. A whiteboard schedule needs a rule for who edits when." },
  // ───────── Atomics & concurrent collections ─────────
  { l:"I", t:"Atomics", q:"What is CAS (compare-and-swap) and how do atomic classes use it?",
    a:`CAS is a CPU instruction: "set the value to NEW only if it is still EXPECTED; tell me whether it worked". ‹AtomicInteger.incrementAndGet()› loops: read current → compute next → CAS → retry on failure. No locks, no blocking.

~~~java
AtomicInteger active = new AtomicInteger();
active.incrementAndGet();
active.updateAndGet(v -> Math.max(v, 10));
AtomicReference<Config> cfg = new AtomicReference<>(initial);
cfg.compareAndSet(old, updated);
~~~

Under very heavy contention, CAS retries spin; ‹LongAdder› spreads updates across cells instead.`,
    k:"CAS = optimistic, lock-free single-variable update with retry.",
    r:"Editing a shared Google Doc cell: you change '5' to '6' only if it still says '5'; if someone changed it meanwhile, you re-read and try again." },
  { l:"I", t:"Atomics", q:"What is the ABA problem?",
    a:`With CAS, a value changes A → B → A between your read and your CAS; the CAS succeeds even though the state changed underneath. This matters for lock-free data structures (e.g. a node removed and re-added).

Solutions: ‹AtomicStampedReference› (value + version stamp) or ‹AtomicMarkableReference›, or garbage-collected languages avoid many cases because nodes aren't reused while referenced.`,
    k:"Same value ≠ unchanged state; add a version stamp.",
    r:"You leave your coffee on the desk. Someone drinks it and refills it with the same coffee. It 'looks' unchanged, but it isn't your original cup — a version sticker would reveal it." },
  { l:"I", t:"Concurrent Collections", q:"Which concurrent collections do you know and when do you use them?",
    a:`- ‹ConcurrentHashMap› – high-throughput shared maps; atomic ‹compute/merge›.
- ‹CopyOnWriteArrayList› – read-mostly lists (listener registries); writes copy the array.
- ‹ConcurrentLinkedQueue/Deque› – lock-free unbounded queues.
- ‹BlockingQueue› family: ‹ArrayBlockingQueue› (bounded), ‹LinkedBlockingQueue›, ‹PriorityBlockingQueue›, ‹DelayQueue› (scheduled items), ‹SynchronousQueue› (direct handoff), ‹LinkedTransferQueue›.
- ‹ConcurrentSkipListMap/Set› – sorted, concurrent navigable collections.

Choose by access pattern: read-heavy vs write-heavy, ordering, bounded back-pressure.`,
    k:"Pick the structure by read/write ratio, ordering and boundedness.",
    r:"Different checkout systems: a self-checkout with many lanes (ConcurrentHashMap), a notice board people mostly read (CopyOnWrite), a conveyor belt with limited space (bounded BlockingQueue)." },
  { l:"A", t:"Concurrent Collections", q:"How does ConcurrentHashMap achieve thread safety in Java 8+?",
    a:`- Reads are lock-free using volatile reads of bins.
- Inserting into an **empty bin** uses CAS.
- Updating a non-empty bin locks **only that bin's first node** (fine-grained).
- Resizing is done cooperatively by multiple threads transferring bins.
- Long bins become red-black trees.
- ‹size()› uses counter cells like LongAdder.
- Iterators are weakly consistent (no ConcurrentModificationException).

Atomic compound ops (‹computeIfAbsent›, ‹merge›) make "check-then-act" safe. Note: the mapping function in ‹computeIfAbsent› should be short and must not modify the same map.`,
    k:"CAS for empty bins, per-bin locks otherwise, lock-free reads.",
    r:"A huge library where each shelf has its own small lock instead of locking the whole building — readers browse freely, and two librarians can restock different shelves simultaneously." },
  { l:"I", t:"Concurrent Collections", q:"How does CopyOnWriteArrayList work and when is it a bad choice?",
    a:`Every write (add/set/remove) copies the entire underlying array and swaps a volatile reference; reads and iterators work on a snapshot without locks.

Great for small, read-mostly lists such as event listeners or configuration subscribers. Terrible for large or frequently updated lists — each write is O(n) memory and time.`,
    k:"Snapshot reads, expensive writes — for read-mostly data only.",
    r:"A restaurant menu: printing a new edition for every change is fine if it changes monthly and is read thousands of times a day — not if prices change every minute." },
  // ───────── Executors ─────────
  { l:"I", t:"Executors", q:"Why use thread pools? Explain the ExecutorService types.",
    a:`Creating a thread per task is costly (memory for stacks, OS scheduling) and unbounded. A pool reuses a fixed set of threads and queues tasks.

- ‹newFixedThreadPool(n)› – n threads, **unbounded** queue (danger under overload).
- ‹newCachedThreadPool()› – unbounded threads (danger: thread explosion).
- ‹newSingleThreadExecutor()› – sequential execution.
- ‹newScheduledThreadPool(n)› – delayed/periodic tasks.
- ‹newWorkStealingPool()› / ‹ForkJoinPool› – parallel divide-and-conquer.
- ‹newVirtualThreadPerTaskExecutor()› – a virtual thread per task (Java 21).

For servers, build a ‹ThreadPoolExecutor› explicitly with bounded queues and a rejection policy.`,
    k:"Reuse threads, bound everything, choose the pool by workload.",
    r:"A call centre with 20 agents (pool) and a hold queue (work queue). Hiring a new agent for each call would be absurd; so is a hold queue with no limit." },
  { l:"A", t:"Executors", q:"Explain ThreadPoolExecutor parameters and how tasks are scheduled.",
    a:`~~~java
new ThreadPoolExecutor(
  8,                          // corePoolSize
  32,                         // maximumPoolSize
  60, TimeUnit.SECONDS,       // keepAlive for extra threads
  new ArrayBlockingQueue<>(500),             // bounded queue
  new ThreadFactoryBuilder().setNameFormat("report-%d").build(),
  new ThreadPoolExecutor.CallerRunsPolicy()  // back-pressure when saturated
);
~~~

Order of decisions: (1) fewer than core threads → start a new thread; (2) else enqueue; (3) queue full → start threads up to max; (4) still full → **rejection policy**: ‹AbortPolicy› (throw), ‹CallerRunsPolicy› (caller does it — natural back-pressure), ‹DiscardPolicy›, ‹DiscardOldestPolicy›.

Gotcha: with an unbounded queue, max threads are never used.`,
    k:"core → queue → max → reject.",
    r:"A clinic: permanent doctors see patients first (core), then the waiting room fills (queue), then temporary doctors are called in (max), and if the room is full, new patients are turned away or the receptionist treats them herself (CallerRuns)." },
  { l:"A", t:"Executors", q:"How do you size a thread pool?",
    a:`It depends on the workload:
- **CPU-bound**: ≈ number of cores (‹Runtime.getRuntime().availableProcessors()›), maybe +1.
- **I/O-bound**: threads ≈ cores × (1 + wait time / compute time). If a task waits 90 ms on a DB call and computes 10 ms, on 8 cores ≈ 8 × 10 = 80 threads.
- But respect **downstream limits** — 80 threads calling a DB with a 20-connection pool just queue on the pool.

Validate with load tests and metrics (queue size, active threads, task latency). With virtual threads you stop sizing thread pools and instead limit concurrency with semaphores per resource.`,
    k:"CPU-bound ≈ cores; I/O-bound scales with wait ratio — capped by downstreams.",
    r:"A pizza shop with 4 ovens (cores). If pizzas just need baking, 4 cooks are enough. If cooks spend most time waiting for deliveries of dough, you need more cooks per oven — but not more than the delivery van can supply." },
  { l:"I", t:"Executors", q:"How do you shut down an ExecutorService gracefully?",
    a:`~~~java
executor.shutdown();                                  // stop accepting new tasks
if (!executor.awaitTermination(30, TimeUnit.SECONDS)) {
  executor.shutdownNow();                             // interrupt running tasks
  if (!executor.awaitTermination(10, TimeUnit.SECONDS)) log.error("pool did not terminate");
}
~~~

In Spring, ‹ThreadPoolTaskExecutor› handles this with ‹setWaitForTasksToCompleteOnShutdown(true)› and ‹setAwaitTerminationSeconds›. Java 19+: ‹ExecutorService› is ‹AutoCloseable› (try-with-resources waits for tasks).`,
    k:"shutdown → await → shutdownNow → await.",
    r:"Closing a shop: lock the front door to new customers, let those inside finish shopping, and only after closing time gently ask stragglers to leave." },
  { l:"I", t:"Executors", q:"Future vs CompletableFuture?",
    a:`‹Future› represents a pending result but is limited: blocking ‹get()›, no callbacks, no composition, can't complete it manually.

‹CompletableFuture› adds non-blocking composition: ‹thenApply›, ‹thenCompose› (dependent async), ‹thenCombine› (join two), ‹allOf/anyOf›, ‹exceptionally/handle›, ‹orTimeout›, ‹completeOnTimeout›, and manual ‹complete()›.

~~~java
CompletableFuture<Report> report = fetchDevices()
    .thenCompose(devices -> fetchAlarms(devices))
    .thenApply(Report::build)
    .orTimeout(3, TimeUnit.SECONDS)
    .exceptionally(ex -> Report.empty());
~~~`,
    k:"Future waits; CompletableFuture composes.",
    r:"Future is a receipt you must keep checking at the counter. CompletableFuture is a buzzer that triggers the next step automatically — 'when the pizza is ready, box it and send it out'." },
  { l:"A", t:"Executors", q:"thenApply vs thenCompose vs thenCombine vs allOf?",
    a:`- ‹thenApply(fn)› – transform the result synchronously (map).
- ‹thenCompose(fn)› – fn returns another CompletableFuture; flattens (flatMap) — for dependent async calls.
- ‹thenCombine(other, fn)› – wait for two independent futures and merge results.
- ‹allOf(f1, f2, ...)› – completes when all complete (then read each with ‹join()›).
- ‹anyOf(...)› – first to complete wins.
- ‹*Async› variants run the stage on another executor.`,
    k:"map, flatMap, zip, wait-for-all.",
    r:"Wedding planning: thenApply = turn the guest list into name cards; thenCompose = after booking the venue, book catering at that venue; thenCombine = once both the DJ and venue are confirmed, print the schedule; allOf = wait for all RSVPs." },
  { l:"A", t:"Executors", q:"What is the ForkJoinPool and work stealing?",
    a:`ForkJoinPool runs divide-and-conquer tasks (‹RecursiveTask›/‹RecursiveAction›): split a big task into subtasks (fork), process, and merge results (join). Each worker has its own deque; idle workers **steal** tasks from the tail of busy workers' deques, keeping all cores busy.

It backs parallel streams and the default async executor of CompletableFuture (‹commonPool›). Don't run blocking I/O on the common pool — it starves everything else that shares it.`,
    k:"Split, process in parallel, idle workers steal work.",
    r:"Sorting a mountain of exam papers: split the pile among teachers; when one finishes early, they grab papers from the bottom of a busy colleague's pile." },
  { l:"A", t:"Virtual Threads", q:"How do virtual threads work internally, and what is pinning?",
    a:`A virtual thread is a Java object scheduled by the JVM onto a small ForkJoinPool of **carrier** (platform) threads. When it blocks on I/O, its stack is saved to the heap and it **unmounts**, freeing the carrier to run another virtual thread. When I/O completes, it's remounted on any carrier.

**Pinning**: the virtual thread can't unmount — e.g. blocking inside ‹synchronized› (before JDK 24) or in native code — so it holds the carrier, reducing scalability. Detect with ‹-Djdk.tracePinnedThreads› / JFR events; prefer ‹ReentrantLock› in hot blocking paths on older JDKs.

Use virtual threads for I/O-heavy request handling; keep using bounded resources (semaphores, connection pools).`,
    k:"Cheap threads that unmount on blocking I/O; avoid pinning.",
    r:"Restaurant tables vs waiters: virtual threads are customers; carriers are waiters. While a customer waits for food (I/O), the waiter serves other tables. Pinning is a customer who insists the waiter stand beside them the whole time." },
  { l:"A", t:"Virtual Threads", q:"What is structured concurrency?",
    a:`Structured concurrency (‹StructuredTaskScope›, preview in Java 21–25) treats a group of concurrent subtasks as one unit with a clear lifetime, like a block of code:

~~~java
try (var scope = new StructuredTaskScope.ShutdownOnFailure()) {
  Subtask<Device> device = scope.fork(() -> deviceClient.get(id));
  Subtask<List<Alarm>> alarms = scope.fork(() -> alarmClient.recent(id));
  scope.join().throwIfFailed();          // if one fails, the other is cancelled
  return new DeviceView(device.get(), alarms.get());
}
~~~

Benefits: no leaked threads, automatic cancellation on failure, clear error propagation, readable thread dumps.`,
    k:"Subtasks live and die within one scope.",
    r:"A team lead sends two people to fetch supplies; if one reports the shop is closed, the lead calls the other back immediately — nobody is left wandering." },
  // ───────── Coordination ─────────
  { l:"I", t:"Coordination", q:"CountDownLatch vs CyclicBarrier vs Phaser?",
    a:`- **CountDownLatch(n)** – threads wait until ‹countDown()› is called n times; one-shot. E.g. wait for 3 caches to warm before serving.
- **CyclicBarrier(n)** – n threads wait for each other at a barrier, then all proceed; reusable per round; optional barrier action.
- **Phaser** – flexible, reusable barrier with dynamic registration of parties and multiple phases.`,
    k:"Latch = wait for events; barrier = wait for each other.",
    r:"Latch: a rocket launch waits for 5 'go' checks — once all say go, it launches, never again. Barrier: friends hiking agree to regroup at every checkpoint before continuing." },
  { l:"I", t:"Coordination", q:"How does a Semaphore work? Give a practical use.",
    a:`A Semaphore holds N permits. ‹acquire()› takes one (blocking if none), ‹release()› returns it — limiting how many threads use a resource concurrently.

~~~java
private final Semaphore vendorApi = new Semaphore(10);   // vendor allows 10 concurrent calls
Response call(Request r) throws InterruptedException {
  if (!vendorApi.tryAcquire(2, TimeUnit.SECONDS)) throw new BusyException();
  try { return client.send(r); } finally { vendorApi.release(); }
}
~~~

Especially useful with virtual threads, where the thread count is no longer the limit.`,
    k:"Semaphore = N permits = max N concurrent users.",
    r:"A parking lot with 50 spaces and a display board: cars enter only when a space is free; leaving frees a space for the next car." },
  { l:"I", t:"Coordination", q:"What is the producer-consumer problem? Implement it with BlockingQueue.",
    a:`Producers create work, consumers process it, and a bounded buffer between them absorbs speed differences and applies back-pressure.

~~~java
BlockingQueue<AlarmEvent> queue = new ArrayBlockingQueue<>(1_000);

// producer (e.g. WebSocket/HTTP ingest)
queue.put(event);                 // blocks when full → back-pressure

// consumers
Runnable worker = () -> {
  while (!Thread.currentThread().isInterrupted()) {
    try { process(queue.take()); }   // blocks when empty
    catch (InterruptedException e) { Thread.currentThread().interrupt(); }
  }
};
for (int i = 0; i < 4; i++) executor.submit(worker);
~~~

At system scale, Kafka or SQS play the same role between services.`,
    k:"Bounded queue in the middle = decoupling + back-pressure.",
    r:"A sushi conveyor belt: chefs (producers) place plates, diners (consumers) take them. If the belt is full, chefs pause; if empty, diners wait." },
  { l:"A", t:"Coordination", q:"What is Exchanger and what is a CompletionService?",
    a:`- **Exchanger** – two threads swap objects at a rendezvous point (e.g. a filler swaps a full buffer for an empty one with a drainer).
- **ExecutorCompletionService** – submit many tasks and take results **in completion order** rather than submission order:

~~~java
CompletionService<Result> cs = new ExecutorCompletionService<>(executor);
devices.forEach(d -> cs.submit(() -> probe(d)));
for (int i = 0; i < devices.size(); i++) handle(cs.take().get());   // fastest first
~~~`,
    k:"Exchanger swaps; CompletionService yields results as they finish.",
    r:"CompletionService is like a teacher grading exams in the order students hand them in, instead of waiting for roll-number order." },
  // ───────── Problems ─────────
  { l:"I", t:"Problems", q:"What is a deadlock? What are the four Coffman conditions?",
    a:`Deadlock: threads wait forever for each other's resources. It requires all four:
1. **Mutual exclusion** – resources can't be shared.
2. **Hold and wait** – a thread holds one resource while waiting for another.
3. **No preemption** – resources can't be forcibly taken.
4. **Circular wait** – A waits for B, B waits for A.

~~~java
// Thread 1: lock(accountA) → lock(accountB)
// Thread 2: lock(accountB) → lock(accountA)   → deadlock
~~~

Break any condition: a global **lock ordering** (e.g. lock lower account ID first) breaks circular wait; ‹tryLock› with timeout breaks hold-and-wait.`,
    k:"Break circular wait with consistent lock ordering.",
    r:"Two cars meet on a one-lane bridge from opposite ends; each waits for the other to reverse. A rule like 'northbound always yields' (ordering) prevents it." },
  { l:"I", t:"Problems", q:"How do you detect and debug a deadlock in production?",
    a:`1. Take a thread dump: ‹jcmd <pid> Thread.print› or ‹jstack <pid>›, or from Spring Boot Actuator ‹/actuator/threaddump›.
2. The JVM reports "Found one Java-level deadlock" with the threads and locks involved.
3. Programmatically: ‹ThreadMXBean.findDeadlockedThreads()› in a health check.
4. Fix the lock ordering, reduce nested locks, use ‹tryLock› with timeouts.

Symptoms before diagnosis: requests hang, thread pool fully busy, CPU near zero.`,
    k:"Thread dump → 'Found one Java-level deadlock'.",
    r:"Like traffic police taking an aerial photo of a gridlocked junction: the snapshot shows exactly which cars block which." },
  { l:"I", t:"Problems", q:"What are livelock and starvation?",
    a:`- **Livelock** – threads are active but keep reacting to each other without progress (two threads repeatedly backing off and retrying at the same moments). Fix with randomised backoff (jitter).
- **Starvation** – a thread never gets the resource because others always win (unfair locks, high-priority threads, a long-running task hogging a single-threaded scheduler). Fix with fair locks, bounded work per task, separate pools.`,
    k:"Livelock = busy but stuck; starvation = never gets a turn.",
    r:"Livelock: two people in a corridor both step aside in the same direction again and again. Starvation: a shy person at a buffet who never reaches the food because others keep cutting in." },
  { l:"A", t:"Problems", q:"What is false sharing?",
    a:`CPUs cache memory in 64-byte **cache lines**. If two threads write to different variables that sit on the same cache line, each write invalidates the other core's cache line, causing heavy cache traffic though there's no logical sharing.

Fixes: padding or ‹@jdk.internal.vm.annotation.Contended› (used inside LongAdder and ConcurrentHashMap counter cells), or keeping per-thread data apart. Usually only matters in very hot, low-latency code.`,
    k:"Different variables, same cache line → hidden contention.",
    r:"Two roommates writing in different corners of the same small whiteboard — each time one writes, the other must wipe their glasses and re-read the whole board." },
  { l:"A", t:"Problems", q:"How do you troubleshoot thread pool exhaustion?",
    a:`Symptoms: rising latency, request timeouts, growing queues, rejected tasks, "all threads busy" in Tomcat metrics.

Steps:
1. Metrics: active threads, queue size, task wait time (Micrometer executor metrics).
2. Thread dumps: what are the busy threads doing? Usually waiting on a slow DB/HTTP call, a lock, or a connection pool.
3. Fix the cause: timeouts on outbound calls, circuit breakers, bulkheads (separate pools per dependency), faster queries.
4. Bound queues and add rejection/back-pressure so overload fails fast instead of collapsing.
5. Consider virtual threads for I/O-bound workloads.`,
    k:"Exhaustion is a symptom — find what the busy threads wait on.",
    r:"All the bank tellers are stuck on hold with head office (slow downstream). Hiring more tellers won't help; fix the phone line or put a time limit on calls." },
  { l:"A", t:"Problems", q:"Is SimpleDateFormat thread-safe? What other common classes aren't?",
    a:`No — ‹SimpleDateFormat› keeps internal mutable state (a Calendar), so sharing one instance across threads produces wrong dates or exceptions. Use ‹DateTimeFormatter› (immutable, thread-safe) or a ThreadLocal.

Other non-thread-safe classics: ‹HashMap›, ‹ArrayList›, ‹StringBuilder›, ‹java.util.Random› (thread-safe but contended — use ‹ThreadLocalRandom›), JDBC ‹Connection› objects, JPA ‹EntityManager› (inject the shared proxy, don't share raw instances).`,
    k:"Shared mutable helpers break under concurrency — use immutable alternatives.",
    r:"One shared calculator passed around a classroom where everyone types at once — the display shows a mix of everyone's sums." },
  // ───────── Patterns & practice ─────────
  { l:"I", t:"Patterns", q:"What is thread confinement and ThreadLocal?",
    a:`**Thread confinement** means data is only accessed by one thread, so no synchronization is needed: local variables (stack confinement), objects handed off via queues, or ‹ThreadLocal› values.

‹ThreadLocal› gives each thread its own instance — used for request context (user, correlation ID in SLF4J MDC), Spring's transaction and security context.

Always ‹remove()› in a finally block in pooled threads, otherwise data leaks into the next request handled by that thread.`,
    k:"Don't share = don't synchronize; always clean ThreadLocals.",
    r:"Each employee has a personal locker (ThreadLocal). Fine — unless you forget to empty it at the end of a shift and the next person on that locker finds your wallet." },
  { l:"A", t:"Patterns", q:"How does Spring @Async work and how do you configure it safely?",
    a:`‹@EnableAsync› + ‹@Async› makes a proxy submit the method to a ‹TaskExecutor›; it returns immediately (‹void› or ‹CompletableFuture<T>›).

~~~java
@Bean(name = "reportExecutor")
ThreadPoolTaskExecutor reportExecutor() {
  var ex = new ThreadPoolTaskExecutor();
  ex.setCorePoolSize(4); ex.setMaxPoolSize(8); ex.setQueueCapacity(200);
  ex.setThreadNamePrefix("report-");
  ex.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
  ex.setWaitForTasksToCompleteOnShutdown(true);
  return ex;
}
@Async("reportExecutor") public CompletableFuture<Report> build(...) { ... }
~~~

Pitfalls: self-invocation bypasses the proxy; exceptions in ‹void› methods are lost without an ‹AsyncUncaughtExceptionHandler›; transactions and security context don't propagate automatically (use ‹DelegatingSecurityContextAsyncTaskExecutor›/TaskDecorator for MDC).`,
    k:"Named, bounded executors; mind proxies and context propagation.",
    r:"Handing a task to an assistant: they work in parallel, but they don't automatically know your login, your meeting notes (context) or how to reach you if something fails — you must pass that along." },
  { l:"A", t:"Patterns", q:"How do you make a Kafka consumer process messages in parallel without breaking ordering?",
    a:`- Parallelism comes from **partitions**: Spring Kafka ‹concurrency = N› runs N consumer threads, each owning partitions — ordering per partition is preserved.
- Need more parallelism than partitions? Process in parallel **per key**: hash the key to one of N single-threaded workers so the same device always goes to the same worker (Confluent Parallel Consumer does this), then commit offsets only when all earlier records are done.
- Never hand records to a random thread pool and commit immediately — you lose ordering and risk data loss.`,
    k:"Partition-level threads, or per-key workers with careful offset commits.",
    r:"A bank with numbered counters: every customer with the same account number always goes to the same counter, so their transactions stay in order, while different accounts are served in parallel." },
  { l:"E", t:"Patterns", q:"How do you handle concurrency across multiple service instances (distributed locking)?",
    a:`JVM locks only protect one process. With 3 instances behind a load balancer you need:
- **Database guarantees**: unique constraints, conditional updates (‹UPDATE ... WHERE status='OPEN'›), optimistic versioning, ‹SELECT ... FOR UPDATE SKIP LOCKED›.
- **Distributed locks**: PostgreSQL advisory locks, Redis (Redisson with lease time and fencing tokens), ZooKeeper/etcd. ShedLock for "run this scheduled job on one instance".
- **Partitioning work**: Kafka keys so one consumer owns each entity.
- **Idempotency** to make duplicates harmless.

Prefer designs that avoid locks (partitioning, idempotency) — distributed locks are hard to get right under network partitions and GC pauses.`,
    k:"Use the DB or partitioning first; distributed locks last, with leases and fencing.",
    r:"Three receptionists in different buildings booking the same meeting room: they need one shared booking system (the database), not each their own paper diary (JVM locks)." },
  { l:"I", t:"Parallel Streams", q:"When do parallel streams help, and when do they hurt?",
    a:`They split work across the common ForkJoinPool. They help for large, CPU-bound, independent, easily splittable data (arrays, ArrayList) with cheap merges. They hurt for small collections, I/O work (blocks shared pool threads), ordered/stateful ops, LinkedList sources, or code with side effects on shared state.

In a server, the common pool is shared by every request — one heavy parallel stream can slow everything. Measure with JMH before using.`,
    k:"Big, CPU-bound, stateless — and measured.",
    r:"Splitting a 1,000-page book among 8 readers to count words is faster. Splitting a 3-page note among 8 readers just wastes time explaining the split." },
  // ───────── Coding ─────────
  { l:"I", t:"Coding", q:"Print odd and even numbers alternately using two threads.",
    a:`~~~java
class OddEven {
  private int n = 1; private final int max = 20;
  private final Object lock = new Object();

  void print(boolean odd) {
    synchronized (lock) {
      while (n <= max) {
        if ((n % 2 == 1) == odd) { System.out.println(Thread.currentThread().getName() + " " + n++); lock.notifyAll(); }
        else { try { lock.wait(); } catch (InterruptedException e) { Thread.currentThread().interrupt(); return; } }
      }
      lock.notifyAll();
    }
  }
  public static void main(String[] a) {
    OddEven p = new OddEven();
    new Thread(() -> p.print(true), "odd").start();
    new Thread(() -> p.print(false), "even").start();
  }
}
~~~

Explain: shared lock, condition checked in a loop, ‹notifyAll› after each turn. Alternatives: two Semaphores handing permits back and forth, or ‹ReentrantLock› with two Conditions.`,
    k:"Shared monitor + turn condition + wait/notifyAll in a loop.",
    r:"Two people sharing one microphone, taking turns: whoever's turn it isn't waits; after speaking, you hand the mic over and nudge the other person." },
  { l:"I", t:"Coding", q:"Implement a simple thread-safe bounded blocking queue.",
    a:`~~~java
class BoundedQueue<T> {
  private final Deque<T> items = new ArrayDeque<>();
  private final int capacity;
  private final ReentrantLock lock = new ReentrantLock();
  private final Condition notFull = lock.newCondition(), notEmpty = lock.newCondition();
  BoundedQueue(int capacity) { this.capacity = capacity; }

  void put(T t) throws InterruptedException {
    lock.lock();
    try { while (items.size() == capacity) notFull.await(); items.addLast(t); notEmpty.signal(); }
    finally { lock.unlock(); }
  }
  T take() throws InterruptedException {
    lock.lock();
    try { while (items.isEmpty()) notEmpty.await(); T t = items.removeFirst(); notFull.signal(); return t; }
    finally { lock.unlock(); }
  }
}
~~~`,
    k:"One lock, two conditions, await in loops, unlock in finally.",
    r:"A coat check with 50 hooks: when full, new guests wait at the 'not full' line; when empty, attendants wait at the 'not empty' line; each hand-off wakes the other line." },
  { l:"I", t:"Coding", q:"Run N tasks in parallel and wait for all results with a timeout.",
    a:`~~~java
ExecutorService ex = Executors.newFixedThreadPool(8);
List<Callable<Health>> checks = devices.stream().<Callable<Health>>map(d -> () -> probe(d)).toList();
List<Future<Health>> futures = ex.invokeAll(checks, 5, TimeUnit.SECONDS);   // cancels unfinished ones
for (Future<Health> f : futures) {
  if (f.isCancelled()) record(Health.timeout());
  else try { record(f.get()); } catch (ExecutionException e) { record(Health.error(e.getCause())); }
}

// CompletableFuture version
var all = devices.stream().map(d -> CompletableFuture.supplyAsync(() -> probe(d), ex)
        .completeOnTimeout(Health.timeout(), 5, TimeUnit.SECONDS)).toList();
CompletableFuture.allOf(all.toArray(CompletableFuture[]::new)).join();
~~~`,
    k:"invokeAll with timeout, or allOf + completeOnTimeout.",
    r:"Pinging 100 cameras at once and giving each 5 seconds to answer — those that don't reply are marked offline instead of holding up the report." },
  { l:"A", t:"Coding", q:"Implement a thread-safe LRU cache.",
    a:`~~~java
class LruCache<K, V> {
  private final LinkedHashMap<K, V> map;
  private final ReentrantLock lock = new ReentrantLock();
  LruCache(int max) {
    map = new LinkedHashMap<>(16, 0.75f, true) {
      protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > max; }
    };
  }
  V get(K k) { lock.lock(); try { return map.get(k); } finally { lock.unlock(); } }  // get mutates access order!
  void put(K k, V v) { lock.lock(); try { map.put(k, v); } finally { lock.unlock(); } }
}
~~~

Note: even ‹get› modifies access order, so a read-write lock doesn't help. In production use **Caffeine** (‹Caffeine.newBuilder().maximumSize(10_000).expireAfterWrite(...)›), which is highly concurrent and uses better eviction (W-TinyLFU).`,
    k:"Lock around LinkedHashMap(accessOrder) — or just use Caffeine.",
    r:"A small fridge where the least recently used item gets thrown out when it's full — only one person may rearrange it at a time." },
  { l:"I", t:"Testing", q:"How do you test concurrent code?",
    a:`- Design for testability: inject executors/clocks; make logic pure where possible.
- Stress tests with many threads and ‹CountDownLatch› to start them simultaneously; repeat many iterations.
- **jcstress** for JMM-level correctness; **Awaitility** to assert async outcomes without sleeps.
- Run with thread-safety tools and static analysis (SpotBugs, Error Prone ‹@GuardedBy›).
- Load tests (Gatling/k6) for real contention; JFR to inspect locks.

~~~java
await().atMost(5, SECONDS).until(() -> repo.countByStatus(ACKED) == 100);
~~~`,
    k:"Start threads together, repeat a lot, assert with Awaitility, use jcstress for JMM.",
    r:"Testing a revolving door with one person tells you nothing; you need a crowd pushing at the same moment, again and again." },
  { l:"E", t:"Scenario", q:"Scenario: a scheduled job that aggregates alarms runs twice when you scale to 3 instances. Fix it.",
    a:`Each instance runs its own ‹@Scheduled› trigger. Options:
1. **ShedLock** with a DB/Redis lock: ‹@SchedulerLock(name = "aggregateAlarms", lockAtMostFor = "PT5M")› — only one instance runs each tick.
2. Move scheduling out of the app: EventBridge Scheduler/Kubernetes CronJob triggers one task.
3. Make the job **idempotent** anyway (upserts per time bucket) so an accidental double-run is harmless.
4. Or partition work: each instance aggregates only its Kafka partitions.`,
    k:"Distributed lock or external scheduler — plus idempotency.",
    r:"Three night guards each set an alarm to lock the gate at 10 pm — someone needs to own the task, or the gate gets locked three times (and once while someone's still inside)." },
  { l:"E", t:"Scenario", q:"Scenario: CPU is 100% and response times spiked after a release. How do you find the hot thread?",
    a:`1. ‹top -H -p <pid>› → find the thread using CPU; convert its ID to hex.
2. ‹jcmd <pid> Thread.print› (several dumps 5 s apart) → find ‹nid=0x...› and its stack trace.
3. Typical culprits: infinite/tight loops, catastrophic regex backtracking, a busy-spin waiting for a flag, huge JSON serialisation, logging inside a hot loop, or GC threads (memory pressure).
4. Confirm with async-profiler/JFR flame graphs.
5. Roll back or hot-fix, then add a regression test and an alert on CPU + latency.`,
    k:"top -H → thread ID → thread dump → profiler.",
    r:"A factory's electricity bill spikes: you walk the floor with a meter (top -H) to find which machine is running non-stop, then inspect what it's actually doing (thread dump)." },
  { l:"I", t:"Basics", q:"What are thread priorities and why shouldn't you rely on them?",
    a:`Java threads have priorities 1–10 (‹setPriority›), but they're only hints to the OS scheduler; behaviour varies across platforms and many OSes ignore them. Relying on priorities for correctness causes starvation and non-portable bugs. Use proper coordination (queues, separate pools, rate limits) to prioritise work instead — e.g. a dedicated executor or Kafka topic for critical alarms.`,
    k:"Priorities are hints, not guarantees — design priority explicitly.",
    r:"Telling the airport you're 'important' is a hint; having a priority-boarding lane (separate queue) is a guarantee." }
]);
