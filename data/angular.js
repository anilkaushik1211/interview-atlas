ATLAS.addTrack({
  id: "angular", title: "Angular", icon: "🅰", color: "#ff4d6d", accent: "#ff8fa3",
  tagline: "Components, RxJS, signals, change detection & performance",
  blurb: "From components and bindings to signals, zoneless change detection, SSR and large-app architecture. Everything you need for Angular and TypeScript interviews at any level."
}, [
  // ───────── Fundamentals ─────────
  { l:"B", t:"Fundamentals", q:"What is Angular and what problems does it solve?",
    a:`Angular is a TypeScript-based, opinionated front-end platform from Google for building single-page applications with components, dependency injection, routing, forms, HTTP and tooling included out of the box.

- **Consistency**: one official way to do routing, forms, HTTP and testing, which helps large teams.
- **Type safety**: TypeScript plus strict template type-checking catches errors at build time.
- **Tooling**: the Angular CLI scaffolds, builds (esbuild/Vite), tests and updates projects (‹ng update›).
- **Scalability**: DI, lazy loading and clear module/standalone boundaries keep big codebases maintainable.

Compared with React (a UI library), Angular is a full framework — more structure up front, less "assemble your own stack".`,
    k:"Angular = batteries-included, TypeScript-first framework for large, maintainable SPAs." },
  { l:"B", t:"Fundamentals", q:"What is the difference between AngularJS and Angular?",
    a:`AngularJS (1.x) is the original JavaScript MVC framework based on scopes, controllers and digest cycles; Angular (2+) is a complete rewrite built on TypeScript, components and a compiled template engine.

- AngularJS: ‹$scope›, two-way binding everywhere, dirty-checking digest loop, no official CLI. End-of-life since 2022.
- Angular: component tree, unidirectional data flow by default, AOT compilation, RxJS, DI hierarchy, Ivy renderer, signals.
- Angular is much faster, mobile-friendly and tree-shakable.`,
    k:"AngularJS is legacy JS + scopes; Angular is a TypeScript, component-based rewrite." },
  { l:"B", t:"Components", q:"What is a component and how do selector, template, styles and class work together?",
    a:`A component is the basic UI building block: a TypeScript class decorated with ‹@Component› that pairs state and behaviour with a template and scoped styles.

~~~ts
@Component({
  selector: 'app-alert-card',        // tag used in parent templates
  standalone: true,
  imports: [DatePipe],
  template: '<h3>{{ alert.title }}</h3><small>{{ alert.time | date }}</small>',
  styles: [':host { display:block }']
})
export class AlertCardComponent {
  @Input({ required: true }) alert!: Alert;
}
~~~

- **selector** – where it appears in the DOM.
- **template** – the view, compiled into instructions.
- **styles** – encapsulated by default (emulated shadow DOM).
- **class** – inputs, outputs, state and methods used by the template.`,
    k:"Component = class (logic) + template (view) + styles, mounted via its selector." },
  { l:"B", t:"Templates", q:"Explain the four kinds of data binding in Angular.",
    a:`Angular binding moves data between the component class and the DOM in four ways.

- **Interpolation** ‹{{ value }}› – class → text.
- **Property binding** ‹[disabled]="isSaving"› – class → element/directive property.
- **Event binding** ‹(click)="save()"› – DOM event → class method.
- **Two-way binding** ‹[(ngModel)]="name"› – property + event combined ("banana in a box"). With signals you can use ‹model()› inputs for two-way binding between components.

Prefer one-way data flow; use two-way binding mainly for form controls.`,
    k:"{{ }} and [ ] push data down, ( ) sends events up, [( )] does both." },
  { l:"B", t:"Directives", q:"What are directives? Compare structural and attribute directives.",
    a:`Directives add behaviour to elements. Components are directives with a template.

- **Structural directives** change DOM layout by adding/removing elements: ‹*ngIf›, ‹*ngFor›, ‹*ngSwitch› — now largely replaced by built-in control flow ‹@if›, ‹@for›, ‹@switch›.
- **Attribute directives** change appearance or behaviour of an existing element: ‹ngClass›, ‹ngStyle›, or a custom ‹appHighlight›.

~~~ts
@Directive({ selector: '[appHighlight]', standalone: true })
export class HighlightDirective {
  @Input() appHighlight = 'yellow';
  @HostListener('mouseenter') on() { this.el.nativeElement.style.background = this.appHighlight; }
  @HostListener('mouseleave') off() { this.el.nativeElement.style.background = ''; }
  constructor(private el: ElementRef) {}
}
~~~`,
    k:"Structural = shape the DOM; attribute = decorate an existing element." },
  { l:"B", t:"Templates", q:"What is the new built-in control flow (@if, @for, @switch) and why use it?",
    a:`Since Angular 17, templates support built-in blocks that replace ‹*ngIf/*ngFor/*ngSwitch› without importing CommonModule.

~~~html
@if (alerts().length) {
  @for (a of alerts(); track a.id) {
    <app-alert-card [alert]="a" />
  } @empty { <p>No alerts</p> }
} @else { <app-spinner /> }
~~~

Benefits: better type narrowing, mandatory ‹track› for efficient list diffing, faster runtime, less boilerplate, and it works naturally with zoneless/signals. Migrate with ‹ng generate @angular/core:control-flow›.`,
    k:"@for requires track — that alone fixes many list-rendering performance bugs." },
  { l:"B", t:"Pipes", q:"What is a pipe? Explain pure vs impure pipes.",
    a:`A pipe transforms a value for display in a template: ‹{{ amount | currency:'INR' }}›.

- **Pure pipe** (default) re-runs only when the input reference or primitive value changes — cheap and cacheable.
- **Impure pipe** (‹pure: false›) runs on every change-detection cycle — useful for mutable inputs but expensive. ‹async› is impure by necessity.

~~~ts
@Pipe({ name: 'severity', standalone: true })
export class SeverityPipe implements PipeTransform {
  transform(level: number): string { return level > 7 ? 'Critical' : level > 4 ? 'Major' : 'Minor'; }
}
~~~

Prefer pure pipes over calling methods in templates, because methods run on every cycle.`,
    k:"Pure pipes are memoised by input; impure pipes run every change-detection pass." },
  { l:"B", t:"Lifecycle", q:"Explain the component lifecycle hooks in order.",
    a:`Angular calls lifecycle hooks as it creates, updates and destroys a component.

1. ‹constructor› – DI only; no inputs yet.
2. ‹ngOnChanges› – whenever an ‹@Input› reference changes (gets ‹SimpleChanges›).
3. ‹ngOnInit› – once, after first inputs; start data loading here.
4. ‹ngDoCheck› – every CD cycle; custom change detection (use sparingly).
5. ‹ngAfterContentInit› / ‹ngAfterContentChecked› – projected content (‹ng-content›) ready/checked.
6. ‹ngAfterViewInit› / ‹ngAfterViewChecked› – own view and children ready/checked; ‹@ViewChild› available.
7. ‹ngOnDestroy› – cleanup subscriptions, timers, sockets.

Modern alternatives: ‹DestroyRef›/‹takeUntilDestroyed()›, ‹afterNextRender()› and ‹effect()›.`,
    k:"Constructor for DI, ngOnInit for init logic, ngOnDestroy for cleanup." },
  { l:"B", t:"DI & Services", q:"What is a service and how does dependency injection provide it?",
    a:`A service is a class holding reusable logic or state (API calls, caching, business rules) that components ask for instead of creating themselves.

~~~ts
@Injectable({ providedIn: 'root' })        // app-wide singleton, tree-shakable
export class AlertService {
  private http = inject(HttpClient);
  list() { return this.http.get<Alert[]>('/api/alerts'); }
}

export class DashboardComponent {
  private alerts = inject(AlertService);    // or constructor injection
}
~~~

The injector looks up a provider for the token, creates the instance once per injector and shares it. This decouples components from construction details and makes them easy to test with mocks.`,
    k:"Components declare what they need; the injector decides how and where it is created." },
  { l:"B", t:"Components", q:"What is the difference between a component, a directive and a pipe?",
    a:`All three are declarables, but they have different jobs.

- **Component** – a directive with its own template; owns a piece of UI.
- **Directive** – adds behaviour to an existing element (attribute) or changes DOM structure (structural); no template.
- **Pipe** – a pure transformation of a value for display.

Rule of thumb: need new UI → component; need behaviour on existing elements → directive; need formatting → pipe.`,
    k:"Component = UI, directive = behaviour, pipe = formatting." },
  { l:"B", t:"Fundamentals", q:"What are standalone components and how do they differ from NgModules?",
    a:`Standalone components (default since Angular 19) declare their own dependencies via ‹imports› instead of being declared inside an NgModule.

- No ‹declarations› array; each component imports exactly what its template uses.
- Bootstrapping: ‹bootstrapApplication(AppComponent, { providers: [provideRouter(routes), provideHttpClient()] })›.
- Lazy loading a single component: ‹loadComponent: () => import('./x.component').then(m => m.X)›.
- Better tree-shaking, simpler mental model, easier testing.

NgModules still work and can be mixed during migration (‹ng g @angular/core:standalone›).`,
    k:"Standalone = each component owns its imports; NgModules become optional." },
  { l:"B", t:"Communication", q:"How do you pass data between components?",
    a:`Choose the mechanism based on the relationship between components.

- **Parent → child**: ‹@Input()› or signal ‹input()›.
- **Child → parent**: ‹@Output() EventEmitter› or ‹output()›.
- **Parent accessing child**: ‹@ViewChild› / ‹viewChild()› or template reference variable.
- **Siblings / unrelated**: a shared service holding a ‹BehaviorSubject› or ‹signal›.
- **Across routes**: route params, query params, resolvers or a store (NgRx / signal store).
- **Two-way**: ‹model()› signal input.

Keep data flowing down and events flowing up; avoid deep "prop drilling" by moving shared state into a service.`,
    k:"Inputs down, outputs up, services sideways." },
  { l:"B", t:"Templates", q:"What is content projection (ng-content) and when do you use it?",
    a:`Content projection lets a parent pass markup into a child's template, making reusable "shell" components like cards, dialogs and layouts.

~~~html
<!-- card.component.html -->
<div class="card">
  <header><ng-content select="[card-title]" /></header>
  <ng-content />                       <!-- default slot -->
</div>

<!-- usage -->
<app-card><h3 card-title>CPU alarm</h3><p>Threshold exceeded</p></app-card>
~~~

Use ‹@ContentChild› to access projected content, and ‹ng-template› + ‹ngTemplateOutlet› when the child must render content conditionally or repeatedly.`,
    k:"ng-content = slots; ngTemplateOutlet when the child controls when/how often to render." },
  { l:"B", t:"Templates", q:"What are ng-template, ng-container and ngTemplateOutlet?",
    a:`They are structural helpers that don't add extra DOM.

- **ng-container** – a grouping element that renders nothing; useful to apply control flow without a wrapper ‹div›.
- **ng-template** – a lazily rendered template fragment; nothing appears until something instantiates it.
- **ngTemplateOutlet** – renders an ‹ng-template›, optionally with a context object.

~~~html
<ng-template #row let-item>
  <td>{{ item.name }}</td>
</ng-template>
<ng-container *ngTemplateOutlet="row; context: { $implicit: device }" />
~~~

This is how flexible table/list components accept custom cell templates.`,
    k:"ng-container groups, ng-template defers, ngTemplateOutlet renders." },
  // ───────── Routing ─────────
  { l:"I", t:"Routing", q:"How does Angular routing work, including params and nested routes?",
    a:`The Router maps URL paths to components and renders them into ‹<router-outlet>›.

~~~ts
export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'alarms/:id', component: AlarmDetailComponent },
  { path: 'admin', canActivate: [authGuard], children: [
      { path: 'users', loadComponent: () => import('./users.component').then(m => m.UsersComponent) }
  ]},
  { path: '**', component: NotFoundComponent }
];
~~~

Read params via ‹ActivatedRoute.paramMap› (observable) or with ‹withComponentInputBinding()› directly as ‹@Input() id›. Navigate with ‹routerLink› or ‹router.navigate(['/alarms', id])›.`,
    k:"Routes map URLs to components; children nest outlets; ** catches unknown paths." },
  { l:"I", t:"Routing", q:"How do lazy loading and route guards work?",
    a:`Lazy loading splits a feature into its own JS chunk that downloads only when its route is visited; guards decide whether navigation may proceed.

- ‹loadComponent› / ‹loadChildren› create separate bundles.
- **Functional guards**: ‹canActivate›, ‹canActivateChild›, ‹canDeactivate› (unsaved changes), ‹canMatch› (choose between route configs, prevents loading the chunk).
- **Resolvers** pre-fetch data before activation.

~~~ts
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.isLoggedIn() ? true : inject(Router).createUrlTree(['/login']);
};
~~~

Guards are UX, not security — the API must still authorize every request.`,
    k:"Lazy load to shrink the initial bundle; guards improve UX but the server enforces security." },
  { l:"I", t:"Routing", q:"What are route resolvers and when would you avoid them?",
    a:`A resolver fetches data before a route activates so the component receives ready data.

~~~ts
export const alarmResolver: ResolveFn<Alarm> = (route) =>
  inject(AlarmService).get(route.paramMap.get('id')!);
// { path: 'alarms/:id', component: AlarmDetail, resolve: { alarm: alarmResolver } }
~~~

Avoid them for slow calls: navigation appears frozen until data arrives. Often a better UX is to navigate immediately and show skeleton loaders, streaming data in via signals/observables.`,
    k:"Resolvers guarantee data on arrival but can make navigation feel slow." },
  { l:"I", t:"Routing", q:"What preloading strategies exist for lazy-loaded routes?",
    a:`Preloading downloads lazy chunks in the background after the initial load so later navigation is instant.

- ‹NoPreloading› (default) – load on demand.
- ‹PreloadAllModules› – preload everything after bootstrap.
- **Custom strategy** – preload only routes flagged ‹data: { preload: true }› or based on network conditions / user role.
- **Quicklink-style** – preload routes whose links are visible in the viewport.

Configure with ‹provideRouter(routes, withPreloading(PreloadAllModules))›.`,
    k:"Lazy loading keeps first paint fast; preloading keeps later navigation fast." },
  // ───────── Forms ─────────
  { l:"I", t:"Forms", q:"How do reactive forms differ from template-driven forms?",
    a:`Both bind inputs to a model, but they differ in where the form model lives.

- **Template-driven**: model inferred from the template with ‹ngModel›; quick for small forms; asynchronous and harder to unit test.
- **Reactive**: model defined in the class with ‹FormGroup/FormControl/FormArray›; synchronous, explicit, strongly typed (Angular 14+), easy to test and to build dynamically.

~~~ts
form = this.fb.nonNullable.group({
  name: ['', [Validators.required, Validators.maxLength(50)]],
  threshold: [80, [Validators.min(1), Validators.max(100)]],
  channels: this.fb.array<string>([])
});
~~~

Use reactive forms for complex, dynamic or validation-heavy forms (my default in enterprise apps).`,
    k:"Template-driven = convenience; reactive = control, typing and testability." },
  { l:"I", t:"Forms", q:"How do you write custom sync, async and cross-field validators?",
    a:`Validators are functions returning ‹null› (valid) or an error object.

~~~ts
// sync
export const noSpaces: ValidatorFn = c =>
  /\\s/.test(c.value ?? '') ? { noSpaces: true } : null;

// async – debounce in the caller; return Observable<ValidationErrors | null>
export function uniqueName(api: DeviceApi): AsyncValidatorFn {
  return c => api.exists(c.value).pipe(map(e => e ? { taken: true } : null), catchError(() => of(null)));
}

// cross-field – attach to the FormGroup
export const rangeValid: ValidatorFn = g =>
  g.get('min')!.value < g.get('max')!.value ? null : { range: true };
~~~

Use ‹updateOn: 'blur'› for expensive async validators and show errors only when the control is touched or dirty.`,
    k:"Group-level validators handle cross-field rules; async validators should be debounced and cancel-safe." },
  { l:"I", t:"Forms", q:"What is ControlValueAccessor and when do you implement it?",
    a:`‹ControlValueAccessor› is the bridge between Angular forms and a custom input component, letting it work with ‹formControlName› or ‹ngModel›.

Implement four methods: ‹writeValue› (model → view), ‹registerOnChange› (view → model), ‹registerOnTouched›, and optionally ‹setDisabledState›, then provide ‹NG_VALUE_ACCESSOR›.

Use it for custom controls like a severity slider, a date-range picker or a rich multi-select, so they integrate with validation, dirty/touched state and reactive forms exactly like native inputs.`,
    k:"CVA makes a custom component behave like a native form control." },
  // ───────── HTTP ─────────
  { l:"I", t:"HTTP", q:"How do HttpClient interceptors work? Give real use cases.",
    a:`Interceptors sit in the HTTP pipeline and can modify requests/responses globally. Modern Angular uses functional interceptors.

~~~ts
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = inject(AuthStore).token();
  const authReq = token ? req.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : req;
  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) inject(Router).navigate(['/login']);
      return throwError(() => err);
    })
  );
};
// provideHttpClient(withInterceptors([authInterceptor, loadingInterceptor]))
~~~

Use cases: attaching JWTs, correlation IDs, global error toasts, loading spinners, retry with backoff, caching GETs, refresh-token flow. Order matters: requests flow in listed order, responses in reverse.`,
    k:"Interceptors centralise cross-cutting HTTP concerns: auth, errors, logging, retries." },
  { l:"I", t:"HTTP", q:"How do you implement a JWT refresh-token flow without duplicate refresh calls?",
    a:`When a request fails with 401, refresh the token once, queue the other failed requests until the new token arrives, then replay them.

1. Interceptor catches 401 (excluding the refresh endpoint itself).
2. If no refresh is in progress, set a flag and call ‹/auth/refresh›; store the result in a ‹BehaviorSubject›/signal.
3. Concurrent 401s wait on that subject (‹filter(t => !!t), take(1)›) instead of triggering their own refresh.
4. Retry the original request with the new token; if refresh fails, clear session and redirect to login.

Prefer storing refresh tokens in HttpOnly, Secure, SameSite cookies rather than localStorage to reduce XSS exposure.`,
    k:"Single-flight the refresh; queue and replay the rest." },
  { l:"I", t:"HTTP", q:"How do you handle HTTP errors consistently across an Angular app?",
    a:`Combine a global interceptor with local handling where the UI needs context.

- **Interceptor**: map status codes to user messages (401 → login, 403 → access denied, 5xx → "try again"), log with correlation ID, avoid duplicating toasts.
- **Service layer**: translate backend error schemas (e.g. RFC 7807 Problem Details) into typed domain errors.
- **Component**: show inline field errors for 400 validation responses; keep the form state.
- **Retries**: only for idempotent GETs, with backoff (‹retry({ count: 2, delay: ... })›).
- **Global ErrorHandler**: catch uncaught client errors and send them to monitoring (Sentry, CloudWatch RUM).`,
    k:"Global for generic errors, local for contextual UX, never swallow errors silently." },
  // ───────── RxJS ─────────
  { l:"I", t:"RxJS", q:"What is an Observable, and how is it different from a Promise?",
    a:`An Observable is a lazy stream that can emit zero, one or many values over time; a Promise is eager and resolves exactly once.

- **Lazy**: nothing runs until ‹subscribe()›; a Promise starts immediately.
- **Multiple values**: ideal for WebSocket messages, input events, polling.
- **Cancellable**: unsubscribing aborts the HTTP request; Promises can't be cancelled natively.
- **Operators**: ‹map›, ‹filter›, ‹switchMap›, ‹debounceTime›, ‹retry› compose async logic declaratively.

Use ‹firstValueFrom()› to bridge to async/await when a single value is enough.`,
    k:"Promise = one future value; Observable = cancellable stream of values." },
  { l:"I", t:"RxJS", q:"Compare switchMap, mergeMap, concatMap and exhaustMap.",
    a:`All four map each source value to an inner observable; they differ in how they handle overlap.

- **switchMap** – cancels the previous inner stream. Use for typeahead search or route-param loading (latest wins).
- **mergeMap** – runs all in parallel. Use for independent fire-and-forget work (optionally limit concurrency).
- **concatMap** – queues and runs one after another in order. Use for ordered saves.
- **exhaustMap** – ignores new values while one is running. Use for "submit" or "login" buttons to prevent double submits.

~~~ts
this.search.valueChanges.pipe(
  debounceTime(300), distinctUntilChanged(),
  switchMap(term => this.api.search(term).pipe(catchError(() => of([]))))
).subscribe(r => this.results.set(r));
~~~`,
    k:"switch = latest wins, merge = all parallel, concat = in order, exhaust = ignore while busy." },
  { l:"I", t:"RxJS", q:"Explain Subject, BehaviorSubject, ReplaySubject and AsyncSubject.",
    a:`Subjects are both Observable and Observer, so they multicast values to many subscribers.

- **Subject** – no initial value; late subscribers miss past emissions (events).
- **BehaviorSubject** – requires an initial value and replays the latest to new subscribers (current state, e.g. logged-in user).
- **ReplaySubject(n)** – replays the last n values (recent alert history).
- **AsyncSubject** – emits only the final value on completion.

Expose them as read-only: ‹readonly user$ = this.userSubject.asObservable()›. In new code, signals often replace BehaviorSubject for synchronous state.`,
    k:"BehaviorSubject = state with a current value; Subject = events." },
  { l:"A", t:"RxJS", q:"How do you prevent memory leaks from subscriptions?",
    a:`Leaks happen when long-lived subscriptions (intervals, WebSockets, store selects, ‹valueChanges›) outlive the component.

- Prefer the ‹async› pipe or ‹toSignal()› — both unsubscribe automatically.
- Use ‹takeUntilDestroyed()› (Angular 16+) inside an injection context or with an injected ‹DestroyRef›.
- Finite streams (HTTP) complete on their own, but cancel them if the user navigates away during long calls.
- Remove manual DOM listeners, timers and third-party chart instances in ‹ngOnDestroy›.

~~~ts
constructor() {
  this.socket.alerts$.pipe(takeUntilDestroyed()).subscribe(a => this.add(a));
}
~~~

Verify with Chrome DevTools heap snapshots: navigate in and out and check detached components aren't retained.`,
    k:"async pipe / toSignal / takeUntilDestroyed — never leave long-lived subscriptions dangling." },
  { l:"I", t:"RxJS", q:"Hot vs cold observables — and what do share() and shareReplay() do?",
    a:`A **cold** observable starts a new producer per subscriber (each ‹http.get› subscription sends a new request). A **hot** observable shares one producer (DOM events, WebSocket).

- ‹share()› multicasts one execution to current subscribers; resets when all unsubscribe.
- ‹shareReplay({ bufferSize: 1, refCount: true })› also replays the last value to late subscribers — handy to cache config/reference data.

Pitfall: ‹shareReplay(1)› without ‹refCount: true› keeps the source subscribed forever, which can leak for infinite streams.`,
    k:"Use shareReplay to avoid duplicate HTTP calls; set refCount for infinite sources." },
  { l:"I", t:"RxJS", q:"How do combineLatest, forkJoin, zip and withLatestFrom differ?",
    a:`They combine multiple observables with different emission rules.

- **forkJoin** – waits for all to complete, emits once with last values. Parallel HTTP calls for a page.
- **combineLatest** – emits whenever any source emits (after all emitted once). Filters + data.
- **zip** – pairs values by index.
- **withLatestFrom** – the main stream drives emission and samples the others' latest value (e.g. on save click, take current form state).

Gotcha: forkJoin never emits if one source never completes (like a WebSocket stream).`,
    k:"forkJoin = parallel one-shot; combineLatest = continuously derived state." },
  { l:"A", t:"RxJS", q:"How would you consume a real-time WebSocket alert stream in Angular robustly?",
    a:`Wrap the socket in a service that exposes an observable, handles reconnects and lets components subscribe safely.

~~~ts
@Injectable({ providedIn: 'root' })
export class AlertStream {
  private socket$ = webSocket<AlertEvent>({ url: environment.wsUrl });
  readonly alerts$ = this.socket$.pipe(
    retry({ delay: (_, i) => timer(Math.min(1000 * 2 ** i, 30000)) }),  // exponential backoff
    share()
  );
}
~~~

- Buffer bursts (‹bufferTime(250)›) and update the UI in batches to avoid jank.
- Keep a bounded list (latest 500) to cap memory; virtual-scroll the list.
- Run high-frequency handlers outside the Angular zone or use signals/OnPush.
- On reconnect, fetch missed alerts via REST using the last seen timestamp/sequence.
- Use STOMP/SockJS if the Spring backend uses a message broker.`,
    k:"Reconnect with backoff, batch updates, cap memory, and backfill gaps after reconnect." },
  // ───────── Change detection & signals ─────────
  { l:"I", t:"Change Detection", q:"How does Angular change detection work?",
    a:`Change detection (CD) checks component templates for changed bindings and updates the DOM.

- Traditionally **Zone.js** patches async APIs (events, timers, XHR) and tells Angular "something may have changed"; Angular then checks the component tree top-down.
- **Default strategy**: every component is checked each cycle.
- **OnPush**: a component is checked only when an input reference changes, an event fires inside it, an ‹async› pipe emits, a signal it reads changes, or it is marked dirty (‹markForCheck›).
- In dev mode a second pass verifies nothing changed ("ExpressionChangedAfterItHasBeenChecked" error).

Performance rule: OnPush + immutable data + signals/async pipe.`,
    k:"Zone.js triggers checks; OnPush and signals limit what gets checked." },
  { l:"A", t:"Change Detection", q:"What is OnPush and what are its common pitfalls?",
    a:`‹ChangeDetectionStrategy.OnPush› skips a component subtree unless something relevant to it changed.

Pitfalls:
- **Mutating inputs** (‹array.push›) doesn't change the reference, so the child isn't refreshed — use immutable updates (‹[...arr, item]›).
- Values set inside ‹setTimeout› or a manual subscription won't render unless you call ‹markForCheck()› or use signals.
- Third-party callbacks running outside zone need ‹NgZone.run› or signals.

OnPush is a big win for dashboards with many widgets; combine with ‹trackBy›/‹track›.`,
    k:"OnPush needs immutable inputs or signals; mutation silently breaks rendering." },
  { l:"A", t:"Signals", q:"What are signals, computed and effect? How do they change Angular?",
    a:`Signals are reactive primitives that hold a value and notify consumers precisely when it changes.

~~~ts
count = signal(0);                         // writable
double = computed(() => this.count() * 2); // derived, memoised, lazy
constructor() {
  effect(() => console.log('count is', this.count())); // side-effects
}
inc() { this.count.update(c => c + 1); }
~~~

Why they matter:
- **Fine-grained reactivity** – Angular knows exactly which views read a signal, enabling local and **zoneless** change detection.
- Synchronous, glitch-free derived state without manual subscriptions.
- Signal APIs: ‹input()›, ‹output()›, ‹model()›, ‹viewChild()›, ‹linkedSignal()›, ‹resource()/httpResource()›.

Use ‹effect› sparingly (logging, syncing to localStorage, imperative APIs) — derive state with ‹computed› instead.`,
    k:"signal = state, computed = derived state, effect = side effects only." },
  { l:"A", t:"Signals", q:"When would you use signals versus RxJS observables?",
    a:`They solve different problems and interoperate well.

- **Signals**: synchronous UI state — selected tab, filters, form-derived values, component state. Always have a current value.
- **RxJS**: asynchronous event streams with time/cancellation — HTTP orchestration, WebSockets, debounce, retry, race, polling.
- Bridge with ‹toSignal(obs$, { initialValue })› and ‹toObservable(signal)›.

My rule: streams in services (RxJS), state at the edges (signals). Don't rewrite well-working RxJS pipelines just to use signals.`,
    k:"RxJS for events over time, signals for state you read in templates." },
  { l:"E", t:"Change Detection", q:"What is zoneless Angular and how do you migrate to it?",
    a:`Zoneless Angular removes Zone.js; change detection is triggered by signals, the async pipe, template events, and explicit ‹markForCheck›.

Benefits: smaller bundle, no monkey-patching, cleaner stack traces, fewer unnecessary CD cycles, better interop with other libraries.

Migration path:
1. Make components OnPush-compatible (no reliance on zone to catch mutations).
2. Move state to signals / async pipe.
3. Replace ‹NgZone.onStable› usage with ‹afterNextRender›.
4. Enable ‹provideZonelessChangeDetection()› and remove ‹zone.js› from polyfills.
5. Test third-party libs that relied on zones.`,
    k:"Zoneless = CD driven by signals and events, not patched async APIs." },
  { l:"A", t:"Signals", q:"What are resource() / httpResource() and linkedSignal()?",
    a:`They are newer signal APIs for async data and dependent state.

- **resource / httpResource** – declaratively loads async data when signal parameters change; exposes ‹value()›, ‹isLoading()›, ‹error()› and ‹reload()›, cancelling stale requests.

~~~ts
deviceId = input.required<string>();
device = httpResource<Device>(() => '/api/devices/' + this.deviceId());
~~~

- **linkedSignal** – a writable signal whose value resets when a source signal changes (e.g. selected item resets when the list changes) while still allowing manual writes.

Use them to remove boilerplate subscribe/loading/error flags in components.`,
    k:"httpResource turns 'load data when params change' into one declaration." },
  // ───────── Performance ─────────
  { l:"A", t:"Performance", q:"How do you improve Angular initial load performance?",
    a:`Measure first (Lighthouse, Web Vitals, ‹ng build --stats-json› + source-map-explorer), then shrink and defer.

- Lazy-load routes and use ‹@defer› blocks for heavy below-the-fold widgets (charts, maps).
- Standalone components + tree-shaking; remove unused libraries (moment → date-fns, lodash-es per-function imports).
- AOT + production build (default), budgets in ‹angular.json›.
- Optimise images with ‹NgOptimizedImage› (priority, lazy, srcset).
- Preload critical fonts, compress with Brotli/gzip, long-term caching with hashed file names via CDN (CloudFront).
- SSR/SSG + hydration for content pages to improve LCP.

In a typical reporting app, lazy-loaded feature routes, cached reference data and reusable OnPush components give the biggest wins.`,
    k:"Measure, split, defer, compress, cache." },
  { l:"A", t:"Performance", q:"How do you improve runtime performance of a data-heavy dashboard?",
    a:`Most runtime jank comes from too many change-detection checks and too many DOM nodes.

- OnPush everywhere; signals for widget state; avoid function calls in templates (use pure pipes/computed).
- ‹@for ... track id› so lists patch instead of re-rendering.
- Virtual scrolling (CDK ‹cdk-virtual-scroll-viewport›) for long alarm lists.
- Batch WebSocket updates (e.g. every 250 ms) instead of rendering each message.
- Run chart libraries outside Angular zone; update charts incrementally.
- Debounce filters; move heavy computations to Web Workers.
- Profile with Angular DevTools profiler and Chrome Performance tab.`,
    k:"Fewer checks (OnPush/signals), fewer nodes (virtual scroll), fewer updates (batching)." },
  { l:"A", t:"Performance", q:"What are @defer blocks and how do triggers work?",
    a:`‹@defer› lazily loads a part of a template — its components, directives and pipes become a separate chunk.

~~~html
@defer (on viewport; prefetch on idle) {
  <app-heatmap [data]="metrics()" />
} @placeholder (minimum 300ms) { <div class="skeleton"></div> }
  @loading (after 100ms) { <app-spinner /> }
  @error { <p>Could not load chart</p> }
~~~

Triggers: ‹on idle› (default), ‹viewport›, ‹interaction›, ‹hover›, ‹immediate›, ‹timer(2s)›, or ‹when condition›. Prefetch triggers download early without rendering. Great for heavy chart widgets on dashboards.`,
    k:"@defer = component-level lazy loading declared in the template." },
  { l:"I", t:"Performance", q:"Why should you avoid calling methods in templates?",
    a:`A method in a binding (‹{{ total() }}› where total is a normal method) runs on every change-detection cycle for that component — potentially hundreds of times per second during scrolling or socket updates.

Alternatives: compute once when data changes, use a pure pipe (memoised by input), or a ‹computed()› signal (memoised by dependencies). Calling a **signal** getter in templates is fine because it just reads a cached value.`,
    k:"Methods re-run every cycle; pure pipes and computed signals are memoised." },
  { l:"I", t:"Compilation", q:"What is the difference between JIT and AOT compilation?",
    a:`Both compile Angular templates into JavaScript instructions; they differ in **when**.

- **JIT** compiles in the browser at runtime — larger bundles (includes compiler), slower startup, template errors appear at runtime.
- **AOT** (default) compiles during the build — smaller bundles, faster rendering, template type-checking and security checks at build time.

Ivy (the renderer since v9) made AOT fast enough to be used everywhere, including tests.`,
    k:"AOT moves template compilation to build time: faster, smaller, safer." },
  { l:"I", t:"Compilation", q:"What is the difference between a compiler, a transpiler and a bundler?",
    a:`- **Compiler** – translates from one language level to another (Angular compiler turns templates into JS instructions; javac turns Java into bytecode).
- **Transpiler** – a source-to-source compiler at a similar abstraction level (TypeScript → JavaScript, modern JS → older JS).
- **Bundler** – combines many modules into optimised files, tree-shakes unused code, splits chunks and processes assets (esbuild/Vite in Angular 17+, previously webpack).`,
    k:"Compile templates, transpile TS, bundle modules." },
  // ───────── Testing ─────────
  { l:"I", t:"Testing", q:"How do you test components and services?",
    a:`Use ‹TestBed› to configure a testing module, mock dependencies and assert behaviour through the DOM.

~~~ts
beforeEach(() => TestBed.configureTestingModule({
  imports: [AlertListComponent],
  providers: [{ provide: AlertService, useValue: { list: () => of([mockAlert]) } }]
}));

it('renders alerts', () => {
  const f = TestBed.createComponent(AlertListComponent);
  f.detectChanges();
  expect(f.nativeElement.querySelectorAll('li').length).toBe(1);
});
~~~

- Services: test with ‹provideHttpClientTesting()› and ‹HttpTestingController› to assert requests.
- Async: ‹fakeAsync› + ‹tick›, or ‹waitForAsync›.
- Prefer testing behaviour (DOM, outputs), not private methods. Jest or Vitest are popular runners; Playwright/Cypress for E2E.`,
    k:"Test behaviour through the DOM with mocked dependencies." },
  { l:"I", t:"Testing", q:"How do you test an HTTP service with HttpTestingController?",
    a:`‹HttpTestingController› intercepts requests so you can assert the URL/method and flush fake responses.

~~~ts
TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
const svc = TestBed.inject(AlertService);
const http = TestBed.inject(HttpTestingController);

svc.list().subscribe(r => expect(r.length).toBe(2));
const req = http.expectOne('/api/alerts');
expect(req.request.method).toBe('GET');
req.flush([a1, a2]);
http.verify();   // no unexpected requests
~~~

Also test error branches with ‹req.flush('err', { status: 500, statusText: 'Server Error' })›.`,
    k:"expectOne + flush + verify." },
  // ───────── DI deep dive ─────────
  { l:"A", t:"DI & Services", q:"Explain the hierarchical injector and providedIn options.",
    a:`Angular has a tree of injectors: **Environment injectors** (root, lazy routes) and **Element injectors** (components/directives). Resolution walks up the element tree, then the environment tree.

- ‹providedIn: 'root'› – one singleton app-wide, tree-shakable.
- Route ‹providers: [...]› – a new instance scoped to a lazy route.
- Component ‹providers› – a new instance per component instance (e.g. a per-widget store).
- ‹viewProviders› – visible to the view but not projected content.

Resolution modifiers: ‹@Optional›, ‹@Self›, ‹@SkipSelf›, ‹@Host› (or ‹inject(X, { optional: true })›).`,
    k:"Where you provide determines lifetime and sharing." },
  { l:"A", t:"DI & Services", q:"What are InjectionToken, useValue, useClass, useFactory and useExisting?",
    a:`Providers tell the injector how to create a value for a token.

~~~ts
export const API_URL = new InjectionToken<string>('API_URL');
providers: [
  { provide: API_URL, useValue: environment.apiUrl },
  { provide: Logger, useClass: environment.production ? RemoteLogger : ConsoleLogger },
  { provide: WsClient, useFactory: (url: string) => new WsClient(url), deps: [API_URL] },
  { provide: AbstractStore, useExisting: AlertStore },   // alias
  { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
]
~~~

‹InjectionToken› is used for non-class values (strings, config objects, functions); ‹multi: true› collects multiple providers into an array.`,
    k:"Tokens identify dependencies; providers define how to build them." },
  { l:"I", t:"DI & Services", q:"What is the inject() function and why is it preferred now?",
    a:`‹inject(Token)› retrieves a dependency inside an injection context (field initialisers, constructor, factory functions, guards, interceptors).

Advantages: works in functional guards/interceptors/resolvers, avoids long constructors, plays well with inheritance and composition helpers (e.g. ‹injectAlertFilters()› utility functions).

It throws outside an injection context — use ‹runInInjectionContext› if needed.`,
    k:"inject() enables functional APIs and reusable injection helpers." },
  // ───────── State & Architecture ─────────
  { l:"A", t:"State Management", q:"How would you manage state in a large Angular application?",
    a:`Keep state as local as possible and escalate only when sharing is needed.

- **Component state** – signals inside the component.
- **Feature state** – a service with signals or ‹BehaviorSubject› ("service-with-a-subject"), or NgRx SignalStore / ComponentStore.
- **Global state** – NgRx Store when many features read/write shared data and you need devtools, effects, time travel.
- **Server state** – cache with invalidation (httpResource, TanStack Query for Angular).
- **URL state** – filters and pagination in query params for shareable links.

Avoid putting everything into a global store "just in case" — it adds ceremony.`,
    k:"Local first, shared via services, global store only when complexity demands." },
  { l:"A", t:"State Management", q:"Explain NgRx: actions, reducers, selectors and effects.",
    a:`NgRx implements a Redux pattern with RxJS.

- **Action** – a description of an event (‹[Alarms Page] Acknowledge›).
- **Reducer** – a pure function ‹(state, action) => newState›.
- **Selector** – memoised query of state (‹selectCriticalAlarms›).
- **Effect** – side-effects (HTTP, WebSocket) listening to actions and dispatching new ones.

Benefits: predictable, traceable state with Redux DevTools; costs: boilerplate and learning curve. NgRx SignalStore offers a lighter signal-based alternative for feature state.`,
    k:"Actions describe, reducers update, selectors read, effects talk to the outside world." },
  { l:"E", t:"Architecture", q:"How would you structure a large enterprise Angular application?",
    a:`Organise by feature/domain, not by file type, and enforce boundaries.

- ‹core/› – singletons: auth, interceptors, error handler, layout shell.
- ‹shared/› – dumb UI components, pipes, directives (no business services).
- ‹features/alarms›, ‹features/analytics›, ‹features/admin› – lazy-loaded, each with routes, smart containers, presentational components, services/store.
- Smart vs presentational components: containers talk to services, presentational components use inputs/outputs only.
- Nx monorepo with module boundary lint rules for multiple apps/libs; design system library (Angular Material + tokens).
- Strict TypeScript, ESLint, Prettier, Husky, CI with unit + E2E, bundle budgets.
- Micro-frontends (Module Federation / Native Federation) only when independent teams need independent deployments.`,
    k:"Feature-first folders, lazy boundaries, smart/dumb split, enforced lint boundaries." },
  { l:"E", t:"Architecture", q:"What are micro-frontends and when would you use them with Angular?",
    a:`Micro-frontends split a UI into independently built and deployed applications composed at runtime (Module Federation, Native Federation, Web Components, or iframe/route-level composition).

Use when multiple teams own distinct domains and need independent release cycles. Costs: duplicated dependencies, shared-state complexity, version alignment, consistent UX and harder E2E testing.

For a single team (like my 5-dev team), a well-modularised monolith frontend with lazy-loaded features is usually better.`,
    k:"Micro-frontends solve team-scaling problems, not code problems." },
  // ───────── Security & SSR ─────────
  { l:"A", t:"Security", q:"How does Angular protect against XSS, and what can still go wrong?",
    a:`Angular treats all template values as untrusted and sanitises them by context (HTML, style, URL, resource URL). Interpolation escapes HTML automatically.

Risks remain when developers:
- use ‹bypassSecurityTrustHtml› on user content,
- manipulate DOM directly via ‹ElementRef.nativeElement.innerHTML›,
- build templates dynamically or use ‹eval›,
- store tokens in localStorage (stealable via XSS).

Add a strict Content-Security-Policy, Trusted Types, and HttpOnly cookies. For CSRF with cookies, Angular's ‹HttpClient› supports XSRF-TOKEN headers; Spring Security validates them.`,
    k:"Angular escapes by default; the bypass APIs and raw DOM access are where XSS creeps back in." },
  { l:"A", t:"SSR", q:"What is server-side rendering and hydration in Angular?",
    a:`SSR renders the page HTML on the server (Node) so users and crawlers get content immediately; **hydration** then reuses that DOM in the browser and attaches listeners instead of re-rendering.

- Enable with ‹ng add @angular/ssr›; use ‹provideClientHydration(withEventReplay())›.
- **Incremental hydration** hydrates ‹@defer› blocks on demand.
- Guard browser-only APIs (‹window›, ‹localStorage›) with ‹isPlatformBrowser› or ‹afterNextRender›.
- Use ‹TransferState›/HTTP transfer cache to avoid fetching the same data twice.

Great for public, SEO-sensitive pages; less needed for authenticated internal dashboards.`,
    k:"SSR improves first paint/SEO; hydration avoids throwing that HTML away." },
  { l:"I", t:"UI", q:"How do you build accessible and themeable UIs with Angular Material and SCSS?",
    a:`Use the component library's accessibility features and keep design decisions in tokens.

- Angular Material/CDK provides ARIA roles, focus trapping (‹cdkTrapFocus›), keyboard navigation (ListKeyManager), live announcer.
- Theme with Material 3 tokens / CSS variables; dark mode via a class or ‹prefers-color-scheme›.
- SCSS: partials, mixins, BEM or component-scoped styles; avoid deep ‹::ng-deep› overrides.
- Verify with axe/Lighthouse, keyboard-only testing and contrast checks.`,
    k:"Lean on CDK accessibility primitives and token-based theming." },
  { l:"I", t:"TypeScript", q:"Which TypeScript features matter most in Angular code?",
    a:`- **Strict mode** (‹strict: true›, ‹strictTemplates›) to catch null/undefined bugs.
- **Interfaces & types** for API DTOs; **union types** and **discriminated unions** for state (‹{ status: 'loading' } | { status: 'ok', data }›).
- **Generics** for reusable services (‹ApiClient<T>›).
- **Utility types**: ‹Partial›, ‹Pick›, ‹Omit›, ‹Record›, ‹Readonly›.
- **Type guards** and ‹satisfies› for safe narrowing.
- **Decorators** power Angular metadata.
- ‹unknown› over ‹any›.`,
    k:"Strict types + discriminated unions make UI states impossible to misuse." },
  { l:"I", t:"TypeScript", q:"What is the difference between interface and type, and between any and unknown?",
    a:`- ‹interface› describes object shapes, supports declaration merging and ‹extends›; ‹type› can alias any type including unions, intersections, tuples and mapped types. For DTOs either works; teams usually standardise.
- ‹any› disables type checking entirely; ‹unknown› is type-safe — you must narrow it before use (great for parsed JSON or error objects in ‹catch›).`,
    k:"Prefer unknown to any; use type for unions, interface for extensible shapes." },
  { l:"E", t:"Scenario", q:"Scenario: the dashboard freezes when 1,000 alerts per minute arrive over WebSocket. How do you fix it?",
    a:`Treat it as a rendering-throughput problem: measure, then reduce work per message.

1. **Profile** with Angular DevTools and Chrome Performance — confirm long tasks come from CD and DOM updates.
2. **Batch**: ‹bufferTime(250)› and apply one state update per batch.
3. **OnPush + signals** so only the alert list and counters re-render.
4. **Virtual scroll** the list and cap retained alerts (e.g. 500 newest, rest via paginated API).
5. **track by id** to avoid recreating rows.
6. Move aggregation (counts by severity/site) to a Web Worker or to the backend (pre-aggregated topics).
7. Throttle chart redraws to 1–2 fps.
8. Backend: send deltas, not full snapshots; allow server-side filtering per subscription.`,
    k:"Batch, OnPush, virtualise, cap, aggregate server-side." },
  { l:"E", t:"Scenario", q:"Scenario: production bundle grew from 1.2 MB to 3 MB after a release. How do you investigate?",
    a:`1. Build with ‹--stats-json› and compare with the previous release using source-map-explorer or esbuild analyzer.
2. Look for: a new heavy library (charts, moment, lodash full import), an eagerly imported lazy feature, duplicated packages, or a large JSON/asset inlined.
3. Fix with lazy loading / ‹@defer›, per-function imports, lighter alternatives, moving assets to CDN.
4. Prevent recurrence with ‹budgets› in ‹angular.json› that fail CI when thresholds are exceeded.`,
    k:"Compare bundle stats, find the culprit, add budgets to CI." },
  { l:"A", t:"Communication", q:"What is the difference between ViewChild and ContentChild?",
    a:`- ‹@ViewChild› / ‹viewChild()› queries elements declared in the component's **own template**; available in ‹ngAfterViewInit›.
- ‹@ContentChild› / ‹contentChild()› queries elements **projected** into the component via ‹ng-content›; available in ‹ngAfterContentInit›.

Plural forms (‹ViewChildren›, ‹ContentChildren›) return a ‹QueryList› that updates as items change. Signal-based queries remove timing issues because they are reactive.`,
    k:"View = my template; content = what the parent projected into me." },
  { l:"A", t:"DOM", q:"Why use Renderer2 or host bindings instead of direct DOM manipulation?",
    a:`Direct ‹nativeElement› manipulation bypasses Angular's abstraction, breaks in SSR/web workers and risks XSS. ‹Renderer2› (‹setStyle›, ‹addClass›, ‹listen›) and ‹host› bindings in the decorator (‹host: { '[class.active]': 'isActive()', '(click)': 'toggle()' }›) are platform-agnostic, sanitised and automatically cleaned up.`,
    k:"Let Angular own the DOM; use Renderer2/host bindings for platform safety." },
  { l:"I", t:"Fundamentals", q:"What happens when an Angular application bootstraps?",
    a:`1. Browser loads ‹index.html›, then the main bundle and polyfills.
2. ‹main.ts› calls ‹bootstrapApplication(AppComponent, appConfig)›.
3. Angular creates the root environment injector with providers (router, HttpClient, animations).
4. The root component is created and attached to its selector in ‹index.html›.
5. The router reads the URL and renders the matching component into ‹router-outlet›.
6. Change detection runs, then the app reacts to events, timers, HTTP and signals.`,
    k:"index.html → main.ts → root injector → root component → router → CD." },
  { l:"I", t:"Build", q:"How do environments and build configurations work in the Angular CLI?",
    a:`‹angular.json› defines build configurations (development, production, staging) with options like optimisation, source maps, budgets and ‹fileReplacements› (e.g. swap ‹environment.ts› with ‹environment.prod.ts›).

Better practice for containers: build once and inject runtime config (load ‹/assets/config.json› via ‹APP_INITIALIZER›/‹provideAppInitializer›), so the same Docker image runs in every environment — consistent with "build once, deploy many" in Jenkins pipelines.`,
    k:"Build once; inject environment-specific config at runtime." },
  { l:"E", t:"Upgrade", q:"How do you plan an Angular major-version upgrade for a large app?",
    a:`1. Read the update guide (update.angular.dev) for source/target versions; upgrade one major at a time.
2. Upgrade Node/TypeScript as required; update Angular core + CLI with ‹ng update›, then Material, NgRx and other libs.
3. Run automatic migrations (standalone, control flow, inject, signal inputs) in separate PRs.
4. Fix deprecations, run unit and E2E suites, compare bundle sizes and performance.
5. Release behind a canary or to a staging environment first.
Keeping close to the latest version is cheaper than big-bang upgrades.`,
    k:"One major at a time, automate migrations, verify with tests and budgets." }
]);
