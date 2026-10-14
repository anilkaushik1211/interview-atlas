# Interview Atlas

A free, public, animated interview-prep atlas for **Java full-stack, backend, frontend and cloud** roles — 700 curated questions with model answers, from fundamentals to lead-level scenarios. It is plain **HTML, CSS and JavaScript**: no framework, no build step, no backend. It deploys to GitHub Pages as static files.

**Live site:** https://anilkaushik1211.github.io/interview-atlas/

## What's inside

| Track | Questions | Focus |
| --- | ---: | --- |
| 🅰 Angular | 64 | Components, RxJS, signals, change detection, performance, SSR |
| ☕ Core Java | 71 | OOP, collections internals, Java 8–21, JVM and GC, coding |
| 🧵 Multithreading | 58 | Threads, locks, JMM, executors, CompletableFuture, virtual threads |
| 🌱 Spring Boot | 61 | IoC, auto-config, REST, JPA/Hibernate, transactions, Security, testing |
| 🗄 Database & SQL | 57 | SQL practice, indexing, isolation, PostgreSQL, MySQL, MongoDB |
| 🧩 Microservices | 55 | DDD, resilience, sagas, outbox, gateways, observability |
| 🐳 Docker + Jenkins | 52 | Dockerfiles, Compose, Jenkins pipelines, Git, Linux, Nginx |
| 🔁 CI/CD & DevOps | 51 | Pipelines, deployment strategies, Kubernetes, IaC, SRE, DevSecOps |
| ☁ AWS Cloud | 57 | IAM, VPC, ECS, Lambda, S3, RDS, messaging, architecture |
| 🌐 Cloud Architecture | 40 | Cloud-native, HA/DR, serverless, security, migration, FinOps |
| ⚡ Kafka & Real-time | 24 | Partitions, consumer groups, delivery semantics, WebSockets |
| 🏗 System Design | 50 | Building blocks and full design rounds |
| 🧭 Behavioral & HR | 27 | STAR stories, teamwork, leadership, conflict, HR round |
| 📂 Project Deep-Dive | 20 | Follow-ups interviewers ask about any project on your CV |
| 🟩 NestJS & Node | 15 | Event loop, NestJS lifecycle, guards, gateways |

Every question has a level (Beginner → Expert), a model answer (with code where useful), a one-line takeaway and a **real-life example**.

## Features

- **Track pages**: topic, level and status filters; search; expand all; personal notes; "Missed / Partial / Nailed" self-rating; deep links to any question.
- **Animated answers**: answer parts animate in when a card opens, and **▶ Walkthrough** steps through each point with a spotlight (optionally narrated).
- **Practice**: a quick-fire quiz, 3D flip-card flashcards, and a timed **mock interview** where you answer aloud and grade yourself.
- **Your story**: a pitch builder that turns your role and stack into a 90-second introduction (with listen, copy and a practice timer), a skill-to-questions map, and a 4-week plan checklist. Nothing you type leaves your browser.
- **Request Journey** simulator (Angular → AWS edge → Spring Boot → PostgreSQL) with failure scenarios.
- **Runtime Lab**: 12 animated mechanisms (JVM, HashMap, threads, bean lifecycle, @Transactional, Kafka, circuit breaker, CI/CD, AWS, SQL).
- **Command palette** search (`Ctrl/⌘ + K`) across all questions, plus a daily question, streaks, light/dark themes and text-to-speech.
- Progress, notes and custom questions are stored in `localStorage`. Use export/import to back them up.

## Project structure

```
index.html              page shell
styles.css              all styles (tokens, components, animations)
js/app.js               application logic (routing, rendering, practice modes)
data/_registry.js       ATLAS.addTrack / ATLAS.addExamples helpers
data/<track>.js         one file per track (questions + answers)
data/examples-*.js      real-life examples attached to questions
data/_labs.js           journey simulator and runtime-lab data
.github/workflows/      GitHub Pages deployment
```

## Adding or editing questions

Append an object to the array in any `data/<track>.js` file:

```js
{ l: "I",                       // B Beginner, I Intermediate, A Advanced, E Expert
  t: "Topic",                   // filter chip on the track page
  q: "Your question?",
  a: `First paragraph = crisp summary.

- bullets with "- "
- ‹inline code› with guillemets, **bold** with double asterisks

~~~java
// fenced code blocks with ~~~lang
~~~`,
  k: "One-line takeaway",
  r: "A real-life example or analogy" }
```

Answers live inside JavaScript template literals, so write `\${` instead of `${` inside them.

To add a whole new track, create `data/mytrack.js` that calls `ATLAS.addTrack({ id, title, icon, color, tagline, blurb }, [...])`, then add a `<script>` tag for it in `index.html` before `js/app.js`.

## Run locally

Open `index.html` directly in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

## Deploy to GitHub Pages

The included workflow (`.github/workflows/deploy.yml`) publishes the site on every push to `main`. One-time setup: **Settings → Pages → Build and deployment → Source: GitHub Actions**.

## Keyboard shortcuts

`Ctrl/⌘ K` search · `/` focus search · `J`/`K` move between questions · `Enter`/`O` open · `M` mark mastered · `S` save · `Space` flip flashcard · `←`/`→` flashcard again/got it · `Esc` back to tracks.
