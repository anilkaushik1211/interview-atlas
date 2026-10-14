ATLAS.addTrack({
  id: "nestjs", title: "NestJS & Node", icon: "🟩", color: "#e11d48", accent: "#fda4af", extra: true,
  tagline: "Event loop, NestJS modules, DI, guards, pipes & interceptors",
  blurb: "Node.js and NestJS fundamentals that come up in full-stack and TypeScript backend rounds."
}, [
  { l:"B", t:"Node.js", q:"How does the Node.js event loop work?",
    a:`Node runs JavaScript on a single thread with an event loop; I/O is delegated to the OS/libuv thread pool and callbacks are queued when complete.

Phases: timers → pending callbacks → poll (I/O) → check (‹setImmediate›) → close callbacks. Between phases, **microtasks** run (‹process.nextTick› first, then resolved Promises).

Implication: Node excels at I/O-bound concurrency; CPU-heavy work blocks the loop — offload to worker threads or another service.`,
    k:"Single-threaded JS + async I/O; never block the event loop." },
  { l:"B", t:"NestJS", q:"What is NestJS and how is it structured?",
    a:`NestJS is a TypeScript framework for Node.js inspired by Angular: **modules**, **controllers**, **providers** (services) and **dependency injection**, running on Express or Fastify.

~~~ts
@Module({ imports: [TypeOrmModule.forFeature([Alarm])], controllers: [AlarmController], providers: [AlarmService] })
export class AlarmModule {}

@Controller('alarms')
export class AlarmController {
  constructor(private readonly service: AlarmService) {}
  @Get(':id') get(@Param('id', ParseIntPipe) id: number) { return this.service.get(id); }
}
~~~

It gives Spring-like structure to Node backends, which helps Angular/Java developers move between stacks.`,
    k:"Angular-style modules + DI for Node backends." },
  { l:"I", t:"NestJS", q:"Explain the NestJS request lifecycle: middleware, guards, interceptors, pipes, filters.",
    a:`Order for an incoming request:
1. **Middleware** – Express-style (logging, correlation IDs).
2. **Guards** – authorization: ‹canActivate› (JWT/roles).
3. **Interceptors (before)** – logging, caching, transforming, timeouts.
4. **Pipes** – validation and transformation of params/body (‹ValidationPipe› with class-validator DTOs).
5. **Route handler**.
6. **Interceptors (after)** – map responses.
7. **Exception filters** – translate errors into HTTP responses.

Compare with Spring: filters ≈ middleware, Spring Security ≈ guards, AOP/HandlerInterceptor ≈ interceptors, ‹@Valid› ≈ pipes, ‹@ControllerAdvice› ≈ exception filters.`,
    k:"Middleware → guards → interceptors → pipes → handler → interceptors → filters." },
  { l:"I", t:"NestJS", q:"How do you validate DTOs in NestJS?",
    a:`~~~ts
export class CreateAlarmDto {
  @IsString() @MaxLength(100) name: string;
  @IsInt() @Min(1) @Max(10) severity: number;
  @IsOptional() @IsArray() @IsString({ each: true }) channels?: string[];
}
// main.ts
app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }));
~~~

‹whitelist› strips unknown properties (mass-assignment protection); ‹transform› converts payloads to DTO instances and primitive types.`,
    k:"class-validator DTOs + global ValidationPipe with whitelist." },
  { l:"I", t:"NestJS", q:"How do you implement JWT authentication with guards in NestJS?",
    a:`Use ‹@nestjs/passport› + ‹passport-jwt› (or ‹@nestjs/jwt› directly):
- A ‹JwtStrategy› validates signature/expiry and returns the user payload.
- ‹@UseGuards(AuthGuard('jwt'))› protects routes; a global guard with a ‹@Public()› decorator for exceptions.
- A ‹RolesGuard› reads ‹@Roles('admin')› metadata via ‹Reflector›.
- Ownership checks in services.

Use the same issuer/JWKS as the Spring services so tokens work across the platform.`,
    k:"Passport JWT strategy + global guard + roles metadata." },
  { l:"I", t:"NestJS", q:"How do you build WebSocket gateways in NestJS?",
    a:`~~~ts
@WebSocketGateway({ namespace: '/alerts', cors: { origin: 'https://app.example.com' } })
export class AlertGateway implements OnGatewayConnection {
  @WebSocketServer() server: Server;
  handleConnection(client: Socket) { /* verify JWT from handshake, join site rooms */ }
  broadcast(siteId: string, alert: AlertDto) { this.server.to('site:' + siteId).emit('alert', alert); }
}
~~~

Scale across instances with the Redis adapter (‹@socket.io/redis-adapter›) so emits reach clients connected to other pods.`,
    k:"Gateways + rooms per site + Redis adapter for multi-instance." },
  { l:"I", t:"NestJS", q:"How do you consume Kafka in NestJS?",
    a:`Use ‹@nestjs/microservices› with the Kafka transport (or kafkajs directly):

~~~ts
@Controller()
export class AlarmConsumer {
  @EventPattern('alarms.raised')
  async handle(@Payload() event: AlarmEvent, @Ctx() ctx: KafkaContext) {
    await this.service.process(event);   // idempotent
  }
}
~~~

Configure client ID, consumer group, retries and dead-letter handling; commit offsets after processing; keep handlers idempotent.`,
    k:"@EventPattern handlers on the Kafka transport, idempotent processing." },
  { l:"I", t:"Node.js", q:"How do you handle errors in async Node code?",
    a:`- ‹async/await› with ‹try/catch› or let framework exception filters handle thrown errors.
- Always return/await promises — unhandled rejections crash modern Node.
- Global handlers (‹process.on('unhandledRejection')›) for logging and graceful shutdown.
- Domain-specific error classes mapped to HTTP status codes.
- Timeouts on outbound calls (AbortController).`,
    k:"Await everything, catch at boundaries, map to HTTP errors." },
  { l:"I", t:"Node.js", q:"Node.js vs Spring Boot — when would you choose each?",
    a:`- **Node/NestJS**: I/O-heavy APIs, BFFs, real-time gateways, teams strong in TypeScript, shared types with Angular, fast startup.
- **Spring Boot**: complex domain logic, heavy transactions, CPU-intensive processing, mature enterprise integrations (JPA, Kafka, Security), strong typing and tooling, virtual threads for high concurrency.

Both containerise and run on AWS equally well; choose by workload and team expertise.`,
    k:"Node for I/O and BFFs, Spring for complex domains and enterprise integrations." },
  { l:"I", t:"NestJS", q:"How do you access databases in NestJS (TypeORM/Prisma)?",
    a:`- **TypeORM** – decorators for entities, repositories, migrations; similar to JPA.
- **Prisma** – schema-first, generated type-safe client, migrations.
- **Raw SQL** via ‹pg›/‹mssql› for complex reporting.

Same concerns as Java: connection pooling, transactions, N+1 avoidance, migrations, parameterised queries.`,
    k:"TypeORM ≈ JPA, Prisma for type-safe queries, raw SQL for reports." },
  { l:"A", t:"Node.js", q:"How do you scale a Node.js service on multi-core machines?",
    a:`One Node process uses one core for JS. Scale with multiple processes: the cluster module/PM2 or, in containers, **more replicas** with small CPU allocations behind a load balancer (preferred). Use worker threads for CPU-heavy tasks, and keep services stateless (sessions in Redis).`,
    k:"More processes/containers, not more threads; worker threads for CPU work." },
  { l:"I", t:"Testing", q:"How do you test NestJS applications?",
    a:`- Unit tests with Jest and ‹Test.createTestingModule› overriding providers with mocks.
- E2E tests with Supertest against the Nest app (‹app.getHttpServer()›).
- Testcontainers for real databases/Kafka.
- Contract tests with Pact for consumers/providers.`,
    k:"TestingModule for units, Supertest for E2E, Testcontainers for integration." },
  { l:"I", t:"Node.js", q:"What is the difference between process.nextTick, setImmediate and setTimeout?",
    a:`- ‹process.nextTick› – runs before other microtasks, right after the current operation (can starve I/O if abused).
- Promise callbacks – microtasks after nextTick queue.
- ‹setImmediate› – runs in the check phase after I/O polling.
- ‹setTimeout(fn, 0)› – timers phase; order relative to setImmediate depends on context (inside an I/O callback, setImmediate runs first).`,
    k:"nextTick > promises > (timers vs immediate depends on phase)." },
  { l:"I", t:"NestJS", q:"How do configuration and environment management work in NestJS?",
    a:`‹@nestjs/config› loads ‹.env› files and environment variables into a ‹ConfigService›; validate with Joi or class-validator at startup; use namespaced config factories (‹registerAs('db', ...)›). In containers, inject secrets as env vars from AWS Secrets Manager/Parameter Store; never commit ‹.env› with secrets.`,
    k:"ConfigModule + validation at startup + secrets from a vault." },
  { l:"I", t:"Node.js", q:"What are streams in Node.js and why use them?",
    a:`Streams process data in chunks (Readable, Writable, Duplex, Transform) instead of loading everything into memory — essential for large file exports, CSV processing and proxying uploads to S3. Use ‹pipeline()› for proper error handling and back-pressure.`,
    k:"Chunked processing with back-pressure for large data." }
]);
