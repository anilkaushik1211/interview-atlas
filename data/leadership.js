ATLAS.addTrack({
  id: "leadership", title: "Behavioral & HR", icon: "🧭", color: "#ec4899", accent: "#f9a8d4", extra: true,
  tagline: "STAR stories, teamwork, leadership, conflict, delivery & HR rounds",
  blurb: "Behavioral and HR rounds test judgement, ownership and communication as much as code. Each answer gives a structure plus a worked example you can adapt to your own experience."
}, [
  { l:"B", t:"Introduction", q:"Tell me about yourself.",
    a:`Keep it to 60–90 seconds and use **present → past → future**.

- **Present**: your current role, the product or domain, your main technologies and one thing you own or improved.
- **Past**: one or two earlier roles or projects that explain how you got here.
- **Future**: what you're looking for and why this role fits.

Example: "I'm a backend engineer with five years of Java experience. Right now I build Spring Boot microservices for an order-management platform, and I own our Kafka-based notification service. Before that I built REST APIs and Angular dashboards for a logistics company. I'm looking for a role where I can work on larger distributed systems and grow towards technical leadership — which is why this position caught my attention."

Avoid reciting your CV line by line or sharing personal life history.`,
    k:"Present → past → future, in about 90 seconds.",
    r:"A movie trailer, not the full film: the best scenes of your current role, a glimpse of the backstory, and why the sequel (this job) will be great." },
  { l:"B", t:"Introduction", q:"Walk me through a project you're proud of.",
    a:`Interviewers want to see that you understand the **why**, the **architecture** and **your contribution**.

1. **Context** – what the product does and who uses it (one sentence).
2. **Architecture** – draw it: clients → APIs/services → messaging → databases → infrastructure.
3. **Your role** – what you personally designed, built or owned.
4. **A hard problem** – one technical challenge and how you solved it (with trade-offs).
5. **Result** – measurable impact: faster, cheaper, more reliable, more users.
6. **Reflection** – what you'd improve with hindsight.

Prepare a 2-minute and a 10-minute version, and expect follow-ups on any technology you mention.`,
    k:"Context, architecture, your role, a hard problem, result, reflection.",
    r:"Giving a building tour: start at the entrance, walk through each floor, point out the room you designed, and finish with the view from the roof." },
  { l:"I", t:"STAR", q:"How do you structure behavioral answers (STAR)?",
    a:`- **S**ituation – brief context (project, team, constraint).
- **T**ask – your responsibility or goal.
- **A**ction – what *you* did. Use "I", be specific about decisions and trade-offs. This should be about 60% of the answer.
- **R**esult – the outcome, quantified where possible, and what you learned.

Prepare 6–8 stories you can adapt: a production incident, a conflict, a failure, helping or mentoring someone, a tight deadline, a design decision, influencing without authority, and improving a process.`,
    k:"Short context, detailed actions, measurable result, reflection.",
    r:"A news report: what happened, what was at stake, what you did, and how it ended." },
  { l:"I", t:"Incidents", q:"Tell me about a production incident you handled.",
    a:`Use STAR and show calm, structured thinking.

Example: "Users reported that order confirmations were arriving 10 minutes late (**S**). I was on call and owned restoring service (**T**). I checked dashboards first and saw consumer lag climbing on our notification queue. I mitigated by scaling consumers, then traced the slowdown to a new database query without an index that ran for every message. We added the index, batched the writes and ran a blameless post-mortem, adding a lag alert and a load test for that path (**A**). Latency went back to under 2 seconds, and the new alert caught a similar issue early a month later (**R**)."

Key signals: mitigate first, find the root cause with evidence, then prevent recurrence.`,
    k:"Mitigate first, then root cause, then prevent recurrence — and quantify.",
    r:"A firefighter's account: arrived, contained the fire, found the faulty wiring, and installed smoke detectors so it can't happen again." },
  { l:"I", t:"Incidents", q:"How do you perform root-cause analysis?",
    a:`1. **Stabilise** – reduce customer impact first (rollback, scale, feature flag).
2. **Gather evidence** – a timeline from logs, metrics, traces, deployments and config changes.
3. **Form and test hypotheses** – reproduce in a lower environment where possible.
4. **5 Whys / fishbone** – go past the trigger to the systemic causes (missing test, missing alert, unclear ownership).
5. **Fix** the immediate cause and the systemic gaps.
6. **Blameless post-mortem** – document, share and track action items to completion.`,
    k:"Mitigate, evidence, hypotheses, 5 whys, fix systemic gaps, share.",
    r:"A doctor treating the symptoms first, then running tests to find the underlying illness and recommending lifestyle changes." },
  { l:"I", t:"Teamwork", q:"How do you work effectively in a team?",
    a:`- **Communicate early**: share progress, blockers and risks in stand-ups and PRs, not at the deadline.
- **Make work visible**: small PRs, clear tickets, documentation.
- **Help others**: review code promptly, pair on tricky problems, share knowledge.
- **Respect agreements**: coding standards, definitions of done, on-call rotations.
- **Disagree constructively**: debate ideas with data, then commit to the team decision.

Example: "When a teammate was stuck on a flaky integration test, I paired with them for an hour, we found a shared-state bug, and we added a test-isolation guideline to the team wiki."`,
    k:"Visible work, early communication, generous help, constructive disagreement.",
    r:"A rowing crew: everyone pulls in rhythm, calls out problems early, and nobody rows in their own direction." },
  { l:"I", t:"Leadership", q:"How would you lead a small team of developers and testers?",
    a:`- **Clarity**: break goals into well-defined stories with acceptance criteria; agree on a definition of done that includes tests.
- **Ownership**: assign end-to-end features rather than isolated tasks, so people grow.
- **Quality**: code reviews with clear standards, CI/CD gates, testers involved from refinement (shift-left).
- **Communication**: stand-ups focused on blockers, regular 1:1s, transparent progress for stakeholders.
- **Growth**: mentoring, pairing on hard problems, rotating production support with runbooks.
- **Protection**: shield the team from churn and negotiate scope realistically.

A lead's job is to make the team effective, not to write all the code.`,
    k:"Clarity, ownership, quality gates, communication and growth.",
    r:"A football coach: sets the strategy, plays people to their strengths, reviews the match footage and develops young players." },
  { l:"I", t:"Leadership", q:"How do you mentor junior engineers?",
    a:`- Understand their level and goals; agree on a growth plan with concrete milestones.
- Pair program on real tasks, then gradually increase their autonomy.
- Use code reviews to teach: explain *why*, link to documentation, praise good patterns.
- Give them ownership of a small feature end to end, including the production release.
- Encourage early questions; hold regular 1:1s with honest feedback.
- Share knowledge through short tech talks and written guides.

Example: "A new graduate on my team started with small bug fixes; after three months of pairing and gradually larger features, they delivered a complete export feature on their own."`,
    k:"Pair, review with reasons, delegate ownership, give regular feedback.",
    r:"Teaching someone to ride a bike: hold the seat at first, gradually let go, and celebrate when they ride alone." },
  { l:"I", t:"Conflict", q:"How do you disagree with a technical decision from a senior colleague?",
    a:`- First understand their reasoning and constraints.
- Bring data: benchmarks, prototypes, incident history or cost estimates.
- Discuss trade-offs openly against shared criteria; suggest a time-boxed spike if the answer is unclear.
- If the decision stands, **disagree and commit** — support it fully and document the risks (an ADR).
- Revisit with evidence if the risks materialise.

Example: "I proposed asynchronous messaging instead of a chain of synchronous REST calls. I built a small load-test prototype showing the latency difference, we discussed it, and the team agreed to adopt it for the notification flow."`,
    k:"Understand, bring data, discuss trade-offs, then commit.",
    r:"Two doctors disagreeing on treatment: they discuss the evidence, maybe run a test, then fully support the agreed plan." },
  { l:"I", t:"Conflict", q:"How do you handle conflict between two team members?",
    a:`- Address it early and privately with each person to understand their perspective.
- Bring them together, focusing on the problem and shared goals rather than personalities.
- Agree on facts, options and decision criteria; if needed, the lead makes the call.
- Follow up to make sure the working relationship recovers.
- If the conflict is about process (for example, code review tone), set explicit team norms.`,
    k:"Early, private, problem-focused, with follow-up.",
    r:"A referee calming two players: listen to each, focus on the rules (shared goals), and get the game going again." },
  { l:"I", t:"Delivery", q:"How do you prioritise when several deadlines conflict?",
    a:`- Clarify business impact, urgency and dependencies with stakeholders.
- Make trade-offs explicit: "If we take this on, what moves?"
- Protect production stability and critical customer commitments first.
- Slice work into minimum valuable increments and deliver the most important part first.
- Communicate early when a timeline is at risk — no surprises.`,
    k:"Impact-driven, explicit trade-offs, early communication.",
    r:"Hospital triage: the most critical patients first, and everyone else told clearly how long they'll wait." },
  { l:"I", t:"Delivery", q:"Tell me about a time you delivered under a tight deadline.",
    a:`Structure:

**S**: "A client needed real-time status updates on their dashboard for a demo in two weeks."
**T**: "Deliver a production-quality slice without derailing the sprint."
**A**: "I scoped an MVP (live updates for new events plus an acknowledge action), agreed the API contract on day one so frontend and backend could work in parallel, used a feature flag, had testers write test cases from the start, and handled the riskiest integration myself."
**R**: "We delivered on time, the client signed off, and the remaining features shipped the next sprint without rework."`,
    k:"Scope an MVP, parallelise via contracts, test early, communicate.",
    r:"Cooking a dinner party in an hour: pick a simpler menu, prep in parallel, and serve the main course before perfecting dessert." },
  { l:"I", t:"Failure", q:"Tell me about a mistake or failure and what you learned.",
    a:`Choose a real, moderate mistake where you owned the fix.

Example: "I once shipped a new reporting query without load-testing it, and response times degraded at peak hours. I rolled back, fixed the query and added an index, then introduced a performance check for critical endpoints and a release checklist. I learned to treat non-functional requirements as acceptance criteria, not afterthoughts."

Show accountability, a quick response and a systemic improvement. Avoid fake weaknesses or blaming others.`,
    k:"Own it, fix it, and change the system so it can't repeat.",
    r:"A pilot reporting a near miss so the airline can improve its checklists — owning it is what builds trust." },
  { l:"I", t:"Quality", q:"How do you run effective code reviews?",
    a:`- Small PRs with clear descriptions and linked tickets.
- Automated checks first (build, tests, lint, static analysis) so humans can focus on design, correctness, readability, security and performance.
- Review for business logic, edge cases, transactions, error handling, logging, tests and API compatibility.
- Respectful, specific comments; separate "must fix" from "nit".
- Fast turnaround (within a day) to keep work flowing.
- AI-assisted code gets the same scrutiny as any other change.`,
    k:"Automate the trivial, review the important, be kind and fast.",
    r:"An editor reviewing a manuscript: spell-check is automated, so the editor focuses on story, clarity and correctness — and is kind to the author." },
  { l:"I", t:"Process", q:"How do you work in Agile/Scrum?",
    a:`- Refinement: break epics into stories with acceptance criteria and estimates; flag technical risks early.
- Sprint planning based on real capacity, including production support and tech debt.
- Daily stand-ups focused on blockers; demos to stakeholders; retrospectives with tracked action items.
- A healthy backlog where tech debt is visible.
- Metrics such as cycle time, escaped defects and deployment frequency — used to improve, never to punish.`,
    k:"Plan to capacity, make tech debt visible, improve through retros.",
    r:"A rowing coach: sets the rhythm (sprints), checks progress each lap (stand-ups) and reviews the race afterwards (retros)." },
  { l:"I", t:"Tech Debt", q:"How do you balance technical debt with feature delivery?",
    a:`- Make debt visible in the backlog with its business impact (incident risk, slower delivery).
- Reserve a fixed share of capacity (for example 15–20%) for debt and platform work.
- Fix debt opportunistically when touching code (the boy-scout rule), with tests.
- Prioritise debt that blocks upcoming features or causes incidents.
- Explain it to product owners in business terms.`,
    k:"Visible, budgeted, prioritised by impact.",
    r:"Servicing your car regularly: skip it for too long and the breakdown costs more than all the services combined." },
  { l:"I", t:"AI Tools", q:"How do you use AI coding tools responsibly?",
    a:`Tools like GitHub Copilot, Cursor or chat assistants speed up boilerplate, tests, refactoring and learning unfamiliar APIs. Use them responsibly:
- Review every suggestion for correctness, security (injection, secrets) and performance.
- Check generated tests actually assert meaningful behaviour.
- Follow your organisation's policy on which code may be shared with which tools.
- Treat AI output like a junior developer's PR: helpful, but you remain accountable.`,
    k:"AI accelerates; humans stay accountable for correctness and security.",
    r:"A sous-chef who preps quickly, but the head chef tastes every dish before it leaves the kitchen." },
  { l:"I", t:"Stakeholders", q:"How do you explain a technical issue to non-technical stakeholders?",
    a:`- Lead with impact and what's being done: "Some customers saw delayed notifications between 2 and 3 pm. It's fixed and no data was lost."
- Avoid jargon; use analogies.
- Give the timeline, the fix and the prevention plan.
- Be honest about uncertainty and say when the next update will come.`,
    k:"Impact, status, next steps — no jargon.",
    r:"A pilot's announcement: 'We'll be 20 minutes late due to weather; we're safe and will update you at 3 pm' — no talk of hydraulics." },
  { l:"I", t:"Career", q:"Why are you looking for a change?",
    a:`Keep it positive and forward-looking. Focus on what you're moving **towards**:

"I've learned a lot in my current role and delivered good results there. I'm now looking for a bigger scope — larger systems, a stronger engineering culture around distributed systems and cloud, and room to grow. This role offers exactly that."

Never criticise your current or previous employer.`,
    k:"Growth and scope, not escape.",
    r:"A footballer moving to a bigger league to test their skills, not because they dislike their current team." },
  { l:"B", t:"Career", q:"What are your strengths and weaknesses?",
    a:`**Strengths**: pick two or three relevant to the role and back each with evidence ("I'm strong at debugging production issues — last quarter I traced a memory leak that had puzzled the team for weeks").

**Weakness**: a real one, plus what you're doing about it. Example: "I used to take on too much critical work myself to protect deadlines. I've learned to delegate with clear context and pair on risky parts, which scales the team and helps others grow."

Avoid clichés like "I'm a perfectionist".`,
    k:"Strengths with proof; a real weakness with your mitigation.",
    r:"A product review: strong features with proof, plus an honest limitation and how the next version fixes it." },
  { l:"B", t:"Career", q:"Where do you see yourself in five years?",
    a:`Show ambition that aligns with the role's growth path:

"I'd like to grow into a senior or lead role — designing larger systems, mentoring engineers and influencing technical direction. I want to deepen my expertise in distributed systems and cloud along the way, ideally growing with a company like this one."`,
    k:"Ambition aligned with the role.",
    r:"A climber naming the next summit and the training plan to get there." },
  { l:"B", t:"HR", q:"What are your salary expectations and notice period?",
    a:`- Research market ranges for the role, location and experience level (salary surveys, job boards, peers).
- Give a range based on total compensation, not just base pay: "Based on my experience and the scope of this role, I'm looking for a range of X to Y. I'm flexible depending on the overall package and growth."
- Be truthful about your notice period and any options for early release.`,
    k:"Researched range, total compensation, honest notice period.",
    r:"Pricing a house: research comparable sales, name a fair range, and stay open to negotiation on the full package." },
  { l:"I", t:"Leadership", q:"How do you handle an underperforming team member?",
    a:`- Look for causes privately: unclear expectations, a skills gap, personal issues, or poor task fit.
- Give specific, timely feedback with examples; agree on clear goals and support (pairing, training).
- Check in regularly and recognise improvements.
- If there's no improvement, involve your manager or HR with a documented history.

Treat it with empathy and fairness — most issues are fixable with clarity and support.`,
    k:"Diagnose, clarify, support, follow up, escalate fairly.",
    r:"A coach noticing a player struggling: a private conversation, extra training, clear goals — and fairness if it doesn't improve." },
  { l:"A", t:"Leadership", q:"How do you make architectural decisions in a team?",
    a:`- Frame the problem and constraints; involve the people who will build and run it.
- Evaluate two or three options, with a quick spike if needed.
- Decide against agreed criteria (latency, cost, team skills, operability) and record an **ADR** (Architecture Decision Record).
- Prefer reversible decisions and incremental adoption.
- Review decisions after they've run in production.`,
    k:"Inclusive, criteria-based, documented, reversible where possible.",
    r:"A town planning committee: hear the experts, compare options against agreed criteria, and publish the decision with reasons." },
  { l:"I", t:"Questions", q:"What questions should you ask the interviewer?",
    a:`- "What does success look like in this role in the first 90 days?"
- "What are the biggest technical challenges the team faces right now?"
- "How are architecture decisions made and documented?"
- "What do deployment and on-call look like?"
- "How do you balance feature work with tech debt?"
- "How is the team structured, and who would I work with most?"`,
    k:"Ask about success criteria, challenges, decision-making and the team.",
    r:"Test-driving a car before buying it — you're evaluating them too." },
  { l:"I", t:"Ownership", q:"Describe a time you improved a process for the team.",
    a:`Example: "Our releases were slow and error-prone because builds and deployments were partly manual. I set up a CI/CD pipeline with automated tests, Docker images and scripted deployments, plus quality gates on pull requests. Deployment time dropped from hours to minutes, release-day defects fell noticeably, and testers got a stable build every day."

Structure: the problem → what you changed (and how you got buy-in) → the measurable improvement.`,
    k:"Problem → change → measurable improvement.",
    r:"Installing a dishwasher in a busy kitchen: measure the time saved, show the team, and soon nobody wants to go back." },
  { l:"I", t:"Learning", q:"How do you keep your skills up to date?",
    a:`- Follow release notes for your core stack (Java, Spring, Angular, cloud provider).
- Read engineering blogs and watch conference talks.
- Build small side projects to try new features (virtual threads, signals, new cloud services).
- Share what you learn with your team through short talks or write-ups.
- Use AI tools to explore unfamiliar APIs faster, always validating against official documentation.`,
    k:"Continuous, hands-on learning, shared with the team.",
    r:"A doctor attending conferences and reading journals — and teaching juniors what they learned." }
]);
