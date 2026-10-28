# EdBridge Africa — Website & Staff Portal Build Plan

**Status:** Draft v1 · 26 Oct 2026
**Scope:** Public website (20 pages) + secure staff management portal, delivered in phases per the client specification.

---

## 0. Summary

**What we're building:** one Next.js application serving two hostnames:

- `edbridgeafrica.org`: a fast, accessible public website. Staff edit it through a CMS that has an approval workflow.
- `portal.edbridgeafrica.org`: the staff portal. It has per-person logins, MFA, role-, department- and region-based permissions, tasks, beneficiary registration, needs assessments, a safeguarding case system walled off from everything else, and audit logs.

**Key decisions**

| Decision | Choice | Why |
|---|---|---|
| Framework | Next.js 16 (App Router) + TypeScript + Tailwind v4 | Mainstream and well documented, so any future developer can maintain it. |
| Database | Supabase Postgres (London region) + Prisma | Relational data, row-level security, transactions. One vendor covers DB, storage and backups. ~$25/mo. |
| Auth | Better Auth (in our own DB) | TOTP + passkey MFA, session control, account suspension. EdBridge owns the user table, with no lock-in. |
| CMS | Payload CMS 3, embedded at `/cms` | Open source with no licence fees. Drafts, versions and access control. Runs in the same app with single sign-on from the portal. |
| Hosting | Vercel Pro | Global CDN, preview deployments, instant rollback. ~$20/mo. |
| Payments | Paystack | Supports Ghana Mobile Money (MTN, Telecel, AT) plus local and international cards. Stripe can't onboard Ghanaian entities. |
| Email | Resend | Free tier covers launch volume. |
| **Total running cost** | **≈ US$46–75 / month** + domain | See §14. |

**Phases at a glance** (assumes ~20 focused dev hours/week; scales linearly)

| Phase | Weeks | Ships |
|---|---|---|
| 0 Discovery & foundations | 1–2 | Accounts owned by EdBridge, wireframes, design system, repo + CI |
| **1A Public website** | 3–8 | All 20 pages live, CMS + approval workflow, public forms → secure inbox, Donate (Paystack) |
| **1B Portal core** | 9–20 | Logins + MFA, org structure, permissions, dashboards, tasks, beneficiary registration, needs assessment + approval, safeguarding, audit |
| 2 Program management | 21–30 | Full case tracking, scholarships, accommodations, staff/volunteer management, partnerships |
| 3 Finance & fundraising | 31–40 | Donor CRM, grants, budgets, procurement/inventory, financial reporting |
| 4 Advanced | 41–52+ | M&E dashboards, regional management, analytics, mobile API + offline field app |

### Recommendations for the initial launch

1. **Split Phase 1 into 1A and 1B.** The public site is low-risk and visible. It helps fundraising and grant credibility right away, and it can go live in about 8 weeks while the portal is built behind it.
2. **Configure the org chart; don't hard-code it.** The spec lists 18 departments and ~140 positions. A growing nonprofit will have far fewer people today, so positions can exist while vacant, one person can hold several positions, and the system flags conflicting combinations (e.g. preparing and approving payments).
3. **Pilot the portal with 3 units first:** Office of the ED, Education Access and Safeguarding. Fix what real users hit, then roll out department by department.
4. **Do the legal groundwork in parallel and make it a go-live gate.** Real children's data stays out of the system until three things are done:
   - EdBridge is registered with Ghana's Data Protection Commission.
   - A Data Protection Impact Assessment is complete.
   - Consent forms are approved.
5. **Don't build an accounting ledger.** The portal handles requests, approvals, evidence and audit trails. The books stay in Xero or QuickBooks (both have nonprofit pricing), and the portal exports to them.
6. **Start Donate with a Paystack hosted payment page in 1A.** Full donor management with webhooks and receipts comes in Phase 3.
7. **Make field registration online-first with autosave in Phase 1, and offline in Phase 4.** Storing children's data offline on phones is a safeguarding risk. It needs device encryption and remote-wipe policies first.
8. **Content is the critical path.** EdBridge should name a content owner now. We provide page templates and draft copy. Policy pages (Privacy, Safeguarding, Terms, Complaints) must be EdBridge's own policies, reviewed by its Legal Adviser.

---

## 1. Guiding principles

- **Safeguarding first.** Children's data is minimised, consented, restricted and audited. Safeguarding records are kept apart from everything else.
- **Least privilege by default.** Seniority doesn't grant access to restricted data. Access comes only from explicit permission.
- **Authorization lives on the server, in one place.** Every read and write passes through a single policy check, so changing a URL or replaying an API request can't bypass it.
- **Configure, don't hard-code.** Departments, positions, roles, approval thresholds, regions and retention periods are all data.
- **Built for Ghana.** Pages are light for mobile data, readable in bright sunlight, and handle flaky connections. Amounts are in GHS, dates are DD/MM/YYYY, phones are +233, and fonts support Ghanaian scripts.
- **Accessible by default.** WCAG 2.2 AA is the floor for both the website and the portal.
- **EdBridge owns everything:** domain, hosting, database, code and accounts, from day one.

---

## 2. Technology stack

| Layer | Choice | Notes | Cost |
|---|---|---|---|
| Framework | Next.js 16 App Router, React Server Components, TypeScript | Server components by default; very little JavaScript sent to public pages | Free |
| Styling/UI | Tailwind CSS v4, shadcn/ui on Radix primitives, Lucide icons | Radix provides accessible focus management, ARIA and keyboard support | Free |
| Database | Supabase Postgres (London `eu-west-2`) | RLS, `pg_trgm` for duplicate detection, full-text search, daily backups | $25/mo (Pro) |
| ORM | Prisma (multi-schema) | Separate schemas: `app`, `safeguarding`, `audit`, `intake`. Payload owns `cms` | Free |
| Auth | Better Auth + `twoFactor`, `passkey`, `admin`, `haveIBeenPwned` plugins | Sign-up disabled; admins invite staff | Free |
| CMS | Payload CMS 3 (Postgres adapter, `schemaName: "cms"`) | Admin at `/cms`; custom auth strategy trusts the portal session | Free |
| File storage | Supabase Storage, private buckets | Short-lived signed URLs, issued only after an authorization check | Included |
| Email | Resend + React Email | Generic notification emails; SPF, DKIM and DMARC on our domain | $0 → $20/mo |
| Payments | Paystack | MoMo + cards; hosted page in 1A, webhooks in Phase 3 | Per transaction |
| Bot protection | Cloudflare Turnstile + honeypot + rate limits | Turnstile is mostly invisible, so there's no image puzzle (helps accessibility) | Free |
| Rate limiting | Upstash Redis | Login, forms, exports | Free tier |
| Monitoring | Sentry (PII scrubbing on) + uptime monitor (Better Stack / UptimeRobot) | Alerts to the IT Manager | Free tiers |
| Off-site backups | Backblaze B2 with Object Lock | Immutable nightly encrypted dumps + storage sync | ~$1/mo |
| Jobs | Vercel Cron → secret-protected `/api/cron/*` | Overdue tasks, deadlines, retention, digests | Included |
| CI/CD | GitHub Actions + Vercel previews | Lint, typecheck, unit/integration/e2e, axe, gitleaks, Semgrep | Free |
| Hosting | Vercel Pro, functions pinned to `lhr1` (London, next to the DB) | Instant rollback; spend alerts on | $20/mo |

**Why not other options?**
- **MongoDB:** this data is deeply relational (people ↔ positions ↔ cases ↔ approvals ↔ budgets) and needs transactions and row-level security.
- **Supabase Auth:** works, but would split identity from our permission tables.
- **A hosted CMS such as Sanity or Contentful:** recurring cost, and approval workflows sit on paid tiers.

---

## 3. System architecture

```
            Public visitors                         Staff · Board · Volunteers (MFA)
                  │                                              │
         edbridgeafrica.org                          portal.edbridgeafrica.org
                  │                                              │
   ┌──────────────▼──────────────────────────────────────────────▼────────────┐
   │ Vercel — one Next.js app (functions in London lhr1)                      │
   │ proxy.ts: host routing + security headers ONLY (never auth decisions)    │
   │                                                                          │
   │  ┌──────────────┐    ┌───────────────────┐    ┌───────────────────────┐  │
   │  │ Public site  │    │ Staff portal      │    │ Payload CMS (/cms)    │  │
   │  │ SSG + ISR    │    │ RSC + Server      │    │ SSO from portal       │  │
   │  │ public forms │    │ Actions           │    │ session               │  │
   │  └──────┬───────┘    └─────────┬─────────┘    └──────────┬────────────┘  │
   │         │       ┌──────────────▼───────────────────┐     │               │
   │         └──────►│ Service layer (src/server/...)   │◄────┘               │
   │                 │ authorize() → SoD → write → audit│◄──── /api/v1 (P4)   │
   │                 └──────────────┬───────────────────┘      mobile/PWA     │
   └────────────────────────────────┼─────────────────────────────────────────┘
                                    │ app role: no BYPASSRLS, no DELETE on audit
   ┌────────────────────────────────▼─────────────────────────────────────────┐
   │ Supabase (London): Postgres + private Storage · Data API DISABLED        │
   │ schemas: app · intake · safeguarding (own key + RLS) · audit · cms       │
   └───────────────┬──────────────────────────────────────────────────────────┘
                   │ nightly encrypted pg_dump + storage sync
           Backblaze B2 (Object Lock, owned by EdBridge)

   Side services: Resend · Paystack · Turnstile · Upstash · Sentry · Uptime monitor
```

### 3.1 Request lifecycle (how URL/API tampering is defeated)

1. `proxy.ts` sends each hostname to its route group. It never makes authorization decisions. (CVE-2025-29927 showed Next.js middleware can be bypassed, so authorization never depends on it.)
2. Every Server Action, route handler and API endpoint calls a **service function**. Each service function starts with `authorize(actor, action, resource)`.
3. `authorize` resolves the actor's active assignments → roles → permissions → **scope** (own / assigned / department / district / region / org). It then checks the resource's **sensitivity** and the **separation-of-duties** rules.
4. Queries run in a transaction that sets `app.user_id` and `app.grants`. Postgres RLS on restricted tables enforces the same rules again, as defence in depth.
5. Records the actor isn't allowed to see return **404, not 403**, so their existence doesn't leak. Search results and counts go through the same filter.
6. Sensitive reads and every write produce audit events.

### 3.2 Data classification

| Class | Examples | Controls |
|---|---|---|
| Public | Published pages, approved media | CDN cached |
| Internal | Tasks, announcements, general documents | Login + department scope |
| Confidential | Beneficiary profiles, donor PII, staff records, finance | Scoped permissions, access logging, exports need approval |
| Restricted | Safeguarding cases, disability/medical details, salary, national ID numbers | Explicit grant only, field-level encryption (AES-256-GCM, separate keys), RLS, step-up MFA, every read logged |

### 3.3 Environments

| Env | Data | Purpose |
|---|---|---|
| Local | Supabase CLI (Docker) + synthetic seed | Development |
| Staging | Separate Supabase project, **synthetic data only** (never real child data) | Vercel previews, UAT, staff training sandbox |
| Production | Real data | Live; deployed only from `main` after CI passes |

### 3.4 Repository structure

```
edbridge-africa/
├─ src/
│  ├─ app/
│  │  ├─ (site)/                 # public pages
│  │  ├─ (portal)/portal/        # staff portal
│  │  ├─ (payload)/cms/          # Payload admin
│  │  └─ api/  v1/ · cron/ · webhooks/
│  ├─ server/
│  │  ├─ auth/                   # Better Auth config, MFA, session policy
│  │  ├─ authz/                  # permission registry, scopes, SoD, authorize()
│  │  ├─ db/                     # Prisma client + per-request RLS context
│  │  ├─ services/               # domain logic — every function authorizes first
│  │  ├─ audit/                  # append-only audit + access logs (hash-chained)
│  │  ├─ crypto/                 # field encryption, blind indexes, key versions
│  │  ├─ files/                  # upload pipeline, EXIF strip, signed URLs
│  │  └─ notify/                 # in-app + generic email
│  ├─ components/                # accessible UI primitives
│  └─ cms/                       # Payload collections + access rules
├─ prisma/  schema.prisma · migrations/ · seed/ (departments, positions, roles, regions)
├─ db/      rls/*.sql · triggers/*.sql
├─ tests/   unit/ · integration/ (RLS + authz matrix) · e2e/ · a11y/
└─ docs/    architecture · runbooks · user guides · permission matrix (generated)
```

### 3.5 Mobile-readiness

- Domain logic lives in `server/services`, not in pages. Server Actions now, and `/api/v1` REST later, call the same functions.
- Zod schemas are shared between validation and a generated OpenAPI spec.
- In Phase 4, bearer-token auth for the PWA/mobile app reuses the same permission engine.

---

## 4. Access-control model

This is the core of the system. It's designed so new departments and positions can be added without touching code.

### 4.1 Concepts

| Concept | Meaning |
|---|---|
| **Department** | A–R from the spec, plus any added later |
| **Position** | Job title in a department, with `reportsTo`, a level and default roles |
| **Assignment** | Member ↔ Position, with start/end date, supervisor and geographic areas. **Access comes only from active assignments.** End the assignment and access ends automatically. |
| **Role** | Named bundle of permissions (templates below) |
| **Permission** | `module.action:scope`, e.g. `beneficiary.view:assigned`, `assessment.approve:department` |
| **Grant** | An extra, time-boxed permission for one person, with approver, reason and expiry. Used for break-glass access and board case reviews. |
| **SoD rule** | Separation-of-duties rule: pairs of actions one person may not do on the same record |

**Actions:** `view`, `create`, `edit`, `submit`, `approve`, `publish`, `export`, `delete`, plus the system-level `manage_users`, `manage_roles`, `system_admin`.

**Scopes:** `own` → `assigned` → `district` → `region` → `department` → `org`. Restricted modules also need an explicit grant, whatever the scope.

**Modules:** org, users, roles, tasks, announcements, documents, beneficiaries, intake, assessments, approvals, cases, disability, learning, ict_training, youth, community, safeguarding, volunteers, hr_records, hr_sensitive, recruitment, leave, training_records, donors, grants, projects, budgets, finance_txn, procurement, inventory, assets, partners, meal_data, reports, cms_content, media, audit_logs, system.

### 4.2 Role templates (so ~140 positions don't each need custom setup)

A position = **level template** + **department bundle** + optional extras.

| Template | Typical grants |
|---|---|
| Board Member | Governance docs, minutes, approved budgets, financial summaries, aggregate reports. No identifiable beneficiary or staff data. |
| Board Officer (Chair, Treasurer, Secretary) | The above, plus approving policies and budgets. Chair receives complaints about the ED. |
| Executive (ED, Deputy) | Org dashboards, assigning tasks to anyone, delegated approvals. Restricted data only by grant. |
| Director / Department Head | `department` scope for their modules; approvals within thresholds |
| Manager / Coordinator | `department` or `region` scope; reviews team work |
| Program Officer | `assigned` scope: own cases, projects and participants |
| Field Officer | `assigned` + own districts; field registration |
| Specialist / Support | Assigned activities only (e.g. Sign Language Interpreter, Technical Support) |
| Volunteer / Intern / Mentor | Assigned activities; child contact only after a safeguarding check |

### 4.3 Spec access rules → implementation

| Spec rule | Implementation |
|---|---|
| Board → governance and oversight | Board template; beneficiary and staff records need a time-boxed grant with a reason |
| ED → org management within limits | `org` scope on management modules; Restricted classes excluded unless granted |
| Department heads → their departments | `department` scope on that department's modules and reports |
| Program officers → assigned cases | `assigned` scope via `CaseAssignment` / `ProjectAssignment` |
| Field officers → assigned beneficiaries only | `assigned` ∩ assignment districts |
| Finance → authorized financial modules | Separate permissions for prepare, review, approve, pay and reconcile |
| HR → authorized personnel records | `hr_records` vs `hr_sensitive` (salary, medical, ID) granted separately |
| Comms → public content and approved media | CMS roles; publishing needs approval |
| IT → systems without beneficiary access | `system_admin` and `manage_users` carry **no data permissions**. Restricted data is encrypted at field level, so a DB admin sees ciphertext. |
| Safeguarding → restricted protection cases | Separate `safeguarding` schema, own encryption key, own RLS; Lead sees all, officers see assigned cases |
| Volunteers → assigned activities | Volunteer template |
| Public → published info and forms | Anonymous users never touch the DB except intake inserts |

### 4.4 Separation of duties (enforced in code and DB constraints)

- The assessor of a case can't approve that assessment's recommendation.
- Finance transactions need a different person at each step: initiated → reviewed → approved → paid. Reconciliation is done by someone who didn't pay.
- Nobody approves their own leave, tasks, expenses or access grants.
- **Two-person rule for privilege:** granting any role with Restricted permissions needs approval from the data owner (Safeguarding Lead, HR Manager or Finance Manager). IT can't grant itself safeguarding access.
- Internal Audit can view audited records but can't edit them.
- The system warns about conflicting combined positions (e.g. Accountant + Grants Finance approver) and requires an ED override with a recorded reason.

### 4.5 Break-glass access

For emergencies, e.g. the Safeguarding Lead is unreachable and a child is at risk:

- An authorized person requests time-boxed access (≤ 4 h) and gives a reason.
- Access is granted immediately.
- The Safeguarding Lead, ED and DPO are alerted, and the access is reviewed afterwards.

### 4.6 Joiners, movers, leavers

- **Joiner:** HR creates the member and assignment → invite email → the person sets a password and enrols MFA (mandatory for privileged roles) → access begins on the start date.
- **Mover:** the old assignment is end-dated and the new one created. Permissions recalculate instantly and old sessions are revoked.
- **Leaver:** the HR "leaver" action suspends the account, revokes all sessions, reassigns open tasks and cases to the supervisor, and logs everything.
- **Dormant accounts:** no login for 60 days → flagged, then suspended after 14 more days.
- **Quarterly access review:** each department head gets a list of their people's access and certifies or revokes it. Results are logged.

### 4.7 Department configuration (seed data)

| Code | Department | Data domains | Default officer scope | Restricted / notes |
|---|---|---|---|---|
| BRD | A. Board & Governance | Governance docs, minutes, approved budgets, financial summaries, org reports | Org (aggregates) | No identifiable records without a grant |
| EXO | B. Office of the ED | Org dashboards, tasks, department reports, delegated approvals | Org | Restricted classes by grant only |
| EDU | C. Education Access & Scholarship | Beneficiaries, assessments, scholarships, school records, follow-ups | Assigned / district | Sees accommodation *summaries*, not disability detail |
| DIS | D. Disability Inclusion | Disability assessments, accommodation plans, assistive tech requests | Assigned | Disability profiles are Restricted |
| ACD | E. Literacy, Numeracy & Academic | Learner profiles, learning assessments, attendance, progress | Assigned | — |
| DIG | F. Digital, ICT, STEM | Training records, participant lists, equipment inventory, program reports | Assigned / program | — |
| YTH | G. Youth, Career & Entrepreneurship | Youth profiles, training, mentorship, placements | Assigned | — |
| COM | H. Community, Family & School Partnerships | Community records, referrals, caregiver contacts, outreach | Assigned + district | Volunteer Coordinator here also gets `volunteers` |
| SFG | I. Child Protection & Safeguarding | Concerns, cases, incidents, restricted referrals | Case-assigned (Lead: all) | Separate schema and key |
| FUN | J. Fundraising & Donor Relations | Donors, campaigns, grant applications, approved budgets, donor reports | Department | Donor PII is Confidential |
| FIN | K. Finance | Transactions, budgets, invoices, payment evidence, payroll | By step (prepare/approve/pay/reconcile) | Payroll is Restricted |
| HRD | L. Human Resources | Employee records, recruitment, training, performance | Department | Salary, medical and ID in `hr_sensitive` |
| ADM | M. Administration & Procurement | Procurement, suppliers, inventory, assets, deliveries | Department | — |
| MEL | N. MEAL | De-identified datasets, assessments, feedback, dashboards | Org (de-identified) | Identifiable data only by grant |
| CPR | O. Communications & Advocacy | CMS, approved media, public materials | Department | Publishing goes through the approval workflow |
| ICT | P. IT & Data Protection | System config, logs, backups, user lifecycle | None (data) | The DPO approves identifiable exports, data subject requests and retention; the DPO should report independently of IT |
| LGL | Q. Legal, Risk & Compliance | Compliance docs, contracts, risk register, audit records | Department | Audit records are append-only |
| PTN | R. Strategic Partnerships | Partner contacts, agreements, correspondence, approved reports | Department | — |

All positions listed in the spec are seeded under their departments with a level template. Admins can add, rename or retire departments and positions from the portal.

The permission matrix (every role × module × action) is generated from the seed config into `docs/permission-matrix.md` and tested automatically (§15).

---

## 5. Data model (Prisma, grouped)

**Conventions:**
- IDs are UUIDv7.
- Money is stored as integer minor units with a currency and an FX rate to GHS.
- Timestamps are UTC and displayed in Africa/Accra time.
- Soft delete only where retention rules allow it.
- Every table has `createdBy` and `updatedBy`.

**Identity & organisation**
- Better Auth tables: `User`, `Session`, `Account`, `TwoFactor`, `Passkey`, `Verification`.
- `Member`: type (employee, volunteer, intern, mentor, board), status, contact, qualifications, experience.
- `MemberSensitive` (Restricted, encrypted): salary, medical notes, Ghana Card number, bank details.
- `Department`, `Position`, `PositionResponsibility`.
- `Assignment`: member, position, supervisor, start/end, isPrimary, districts[].
- `Role`, `RolePermission`, `PositionRole`, `Grant` (time-boxed, approver, reason).
- `Region` (16), `District`, `Community`.

**Work management**
- `Task`, `TaskAttachment`, `TaskSubmission` (versioned), `TaskFeedback`.
- `Target`, `PerformanceReview`.
- `Announcement` with audience rules, `PolicyAcknowledgement`.
- `Folder`, `Document`, `DocumentVersion`: classification, retention category, owning department.
- `TrainingRecord` (incl. safeguarding training expiry), `LeaveRequest`, `LeaveBalance`.
- `Notification`, `NotificationPreference`.

**Beneficiaries & assessment**
- `IntakeApplication`: online, school referral, field or office channel; held in the `intake` schema until verified.
- `Beneficiary`:
  - Human-readable ID `EBA-{REGION}-{YY}-{NNNNN}`, e.g. `EBA-AS-26-00042`. It contains no name or date of birth.
  - Names, date of birth or estimated age with an `isEstimated` flag, community/district/region.
  - School, education status, reason for support, barriers[], assistance requested[], referral source.
  - Assigned case officer, registration date and channel, case status.
- `Guardian`, `BeneficiaryGuardian` (relationship, primary contact), `School`.
- `ConsentRecord`:
  - Type: data processing / media / sharing with partners.
  - Who gave it: guardian, plus the child's own assent where age-appropriate.
  - Method: signed form scan / witnessed verbal / digital.
  - Date, expiry, withdrawal.
- `DisabilityProfile` (Restricted): functional difficulties recorded with the Washington Group / UNICEF Child Functioning questions rather than diagnoses. Also assistive devices, accessible materials needed, `Accommodation[]`.
- `AssessmentFormVersion`, `Assessment` (typed core fields + versioned JSON answers), `Recommendation`, `RecommendedItem`.
- `ApprovalDecision`: reviewer, decision, approved items, budget allocation, reasons, review date.
- `CaseEvent` (every state transition), `CaseAssignment`, `FollowUp`.

**Safeguarding** (`safeguarding` schema)
- `Concern`: public or staff source, anonymous flag, reference code.
- `SafeguardingCase`, `CaseNote` (encrypted), `ProtectionReferral` (Social Welfare, DOVVSU, health, police).
- `CaseAccessGrant`, `ReporterFollowUpToken`.

**Phase 2–3**
- `VolunteerApplication`, `BackgroundCheck`, `Availability`, `Schedule`.
- `ServiceDelivery`, `Scholarship`, `Partner`, `PartnerAgreement`.
- `Donor`, `Donation`, `Receipt`, `Sponsorship`.
- `Grant`, `GrantMilestone`, `GrantReport`.
- `Project`, `ProjectIndicator`, `ProjectAssignment`.
- `Budget`, `BudgetLine`, `FinancialTransaction` + `TransactionStep`: who initiated, reviewed, approved, paid and reconciled, with timestamps.
- `PurchaseRequest`, `Quotation`, `PurchaseOrder`, `Supplier`.
- `InventoryItem`, `StockMovement`, `Distribution`, `DistributionAcknowledgement` (signature or thumbprint image, or OTP to the guardian's phone), `Asset`.

**System**
- `AuditLog` (append-only, hash-chained), `AccessLog` (Restricted reads), `SecurityEvent`.
- `ExportRequest`, `RetentionPolicy`, `DataSubjectRequest`.
- `ApprovalThreshold`, `Setting`.

### 5.1 Case lifecycle

```
Intake: online application · school referral · field · office
   │  duplicate check (fuzzy name + DOB + community + guardian phone)
   │  consent recorded (required to continue)
   ▼
REGISTERED → VERIFICATION → ASSESSMENT → REVIEW ─┬─► APPROVED → SERVICE DELIVERY → FOLLOW-UP → CLOSED
                                                  ├─► DEFERRED ──(on review date)──► REVIEW
                                                  └─► REJECTED ──(reason recorded)──► CLOSED
Any state → CLOSED with reason: duplicate · withdrawn · ineligible · relocated · aged out
Guards: transition permission · assessor ≠ approver · approval tier by cost · budget check · audited
```

Phase 1 delivers the lifecycle through REVIEW → decision. Phase 2 adds service delivery, follow-up and closure tooling.

---

## 6. Public website

### 6.1 Information architecture

The 20 required pages are grouped into 5 menus so the navigation stays usable on a phone.

| Menu | Pages |
|---|---|
| **About** | About Us · Mission, Vision & Objectives · Board of Directors & Leadership |
| **Our Work** | Programs & Core Activities (+ one detail page per program) · Disability Inclusion & Accessibility · Projects & Impact · Grants & Projects |
| **Get Involved** | Get Involved (hub) · Volunteer Registration · Careers & Jobs · Corporate & Institutional Partnerships |
| **News** | News, Events & Publications |
| **Contact** | Contact Us |
| Header buttons | **Donate** (Donate & Sponsor a Child's Education) · **Report a concern** · Search |
| Footer | Privacy Policy · Child Safeguarding Policy · Accessibility Statement · Complaints & Reporting · Terms of Use · Staff login |

**Extra pages needed by the spec's forms:** Apply for Support (online applications), School Referral, Search results, 404/500.

### 6.2 Page plan

| # | Page | Key content | CMS-managed | Form |
|---|---|---|---|---|
| 1 | Home | Mission hero, Donate / Get involved / Apply for support CTAs, impact stats, programs, consented story, sponsor CTA, partners, latest news | Yes (blocks) | Newsletter |
| 2 | About Us | Story, who we serve, where we work (region/district map), values, registration details, annual reports | Yes | — |
| 3 | Mission, Vision & Objectives | Statements, strategic objectives, theory of change | Yes | — |
| 4 | Programs & Core Activities | Hub + detail pages: Education Access, Disability Inclusion, Literacy & Numeracy, Digital/STEM, Youth & Careers, Community & Family, Child Protection | `Programs` collection | — |
| 5 | Disability Inclusion & Accessibility | Approach, accommodations, assistive tech, inclusive education, Ghanaian Sign Language (GSL) video, how to request support, disability partners | Yes | Link to Apply |
| 6 | Projects & Impact | Projects filterable by region, program and status; impact indicators; stories; reports | `Projects`, `Stories` | — |
| 7 | Board & Leadership | Profiles (photo, role, bio), committees, governance documents | `People` | — |
| 8 | Get Involved | Hub: volunteer, careers, donate, sponsor, partner, fundraise, advocate | Yes | — |
| 9 | Volunteer Registration | Roles, safeguarding requirements (police check, training), international volunteers | Yes | Multi-step application |
| 10 | Careers | Vacancies, safer-recruitment statement | `Jobs` | Application + CV upload |
| 11 | Donate & Sponsor | One-time/monthly, amounts with what each pays for, MoMo/card, transparency, sponsorship explained, giving from abroad | Yes | Paystack |
| 12 | Corporate & Institutional Partnerships | Partnership models, CSR, partner logos, case studies | `Partners` | Enquiry |
| 13 | Grants & Projects | For funders: funded projects, funder acknowledgements, due-diligence pack (registration, audited accounts, policies) | Yes | Enquiry |
| 14 | News, Events & Publications | Posts, events (date, venue, accessibility info), publications (HTML + accessible PDF), filters | `Posts`, `Events`, `Publications` | Event RSVP link |
| 15 | Contact Us | Form, phone, WhatsApp, GhanaPostGPS address, office hours, office accessibility, static map + directions link | Yes | Contact |
| 16 | Privacy Policy | Aligned to Act 843; cookie-less analytics statement | Yes | — |
| 17 | Child Safeguarding Policy | Full policy, summary, child-friendly Easy Read version, how to report | Yes | Link to report |
| 18 | Accessibility Statement | WCAG 2.2 AA target, known issues, last audit date, feedback route | Yes | Feedback |
| 19 | Complaints & Reporting | Choose a path (below), anonymous option, reference code, what happens next | Yes | Routed forms |
| 20 | Terms of Use | Terms | Yes | — |

### 6.3 Public forms and where they go

| Form | Stored in | Who is alerted (generic email) |
|---|---|---|
| Volunteer application | `intake.volunteer_applications` | Volunteer Coordinator, Volunteer Recruitment Officer |
| Job application (CV ≤ 5 MB, PDF/DOCX) | `intake.job_applications` | Recruitment Officer for that vacancy |
| Contact / partnership / grant enquiry | `intake.enquiries` | Routed by topic: Comms, Partnerships or Fundraising |
| Apply for support | `intake.support_applications` | Education Access intake officer |
| School referral | `intake.school_referrals` | School Partnership Officer |
| General complaint | `intake.complaints` | Governance & Compliance Officer |
| Fraud / misconduct (whistleblowing) | `intake.complaints` (restricted) | Legal & Compliance + Internal Audit. **If about the ED → Board Chair.** |
| **Safeguarding concern** | `safeguarding.concerns` | Safeguarding Lead + Safeguarding Complaints Officer. **If about the Lead → ED + Board.** |
| Newsletter | Resend audience, double opt-in | — |

**Rules for all public forms:**
- Turnstile + honeypot + rate limits.
- Minimal fields, and accessible errors.
- Under-18s can't self-register; they're directed to a guardian, their school or a community referral.
- Anonymous reporters get a reference code + passphrase to check status or add information later.
- **Phase 1A includes a minimal secure inbox** (login + MFA, restricted roles), so these submissions never sit in the CMS or in email.
- *As built in 1A:* intake forms share one `intake.submission` table (an `inbox` column does the routing and the answers are encrypted as a whole), and safeguarding concerns use `safeguarding.concern`. The per-form tables above arrive with their Phase 1B–2 workflows. CVs are limited to 4 MB (Vercel's request size limit) and stored encrypted in `intake.attachment` rather than in Storage. School referrals use the Apply for support form, which has a "teacher or school leader" option.

### 6.4 CMS & publishing workflow

```
Draft ──submit──► In review ──approve──► Approved ──publish/schedule──► Published ──► Archived
  ▲                  │                                                     │
  └──── returned ◄───┘                                    version history + one-click rollback
```

- **Content Writer, Graphic Designer, Photo/Video Officer:** create drafts and submit them.
- **Communications Director, PR Officer:** approve and publish.
- **Any content tagged "features a child"** also needs the **Safeguarding Lead's approval** before it can publish.
- **Website Administrator (IT):** technical settings only. Can't publish.
- **Media library:** every image has a consent record link, consent scope (web/social/print/donor reports), consent expiry, and an "identifiable child" flag. Publishing is blocked when consent is missing or expired. EXIF/GPS data is stripped on upload.
- **Ethical storytelling rules, checked in the CMS:**
  - A child's full name never appears together with their location or school.
  - Pseudonyms are used by default.
  - Imagery is strength-based (learning, achieving), never distress.
- On publish, the affected pages revalidate immediately (on-demand ISR).

### 6.5 Performance budget (Ghana mobile data)

- No autoplay video hero; GSL and other videos load on tap, with captions and a transcript.
- ≤ 150 KB of compressed JavaScript per public page, and under 1 MB total weight for Home.
- LCP < 2.5 s on throttled 4G on a mid-range Android phone.
- Images in AVIF/WebP with responsive `srcset`, lazy-loaded below the fold.
- Fonts self-hosted via `next/font`, `latin` + `latin-ext` subsets, `display: swap`.
- Pages are static + ISR on the CDN; the server does no work per visit.
- Cookie-less analytics (Vercel Web Analytics or Umami), so no cookie banner is needed.

### 6.6 SEO & sharing

Per-page metadata from the CMS, Open Graph images, `sitemap.xml`, `robots.txt` (the portal is `noindex`), and JSON-LD for `NGO`, `Event` and `NewsArticle`.

---

## 7. Design system & wireframes

### 7.1 Direction

**Warm, dignified, hopeful.**
- A light warm-paper background, deep green, gold accents and a terracotta Donate button.
- Kente-inspired geometry is used sparingly as subtle section dividers, not as a costume.
- Photography is real, consented and strength-based.
- shadcn/Radix components are restyled to these tokens, with Lucide icons (no emoji icons).

**Theme decision:** the public site is light-first and also offers dark mode following the system setting. The portal ships both themes with a user toggle; light is the default.

Why light-first:
- Field officers often work outdoors in bright sunlight, where light themes with high contrast read far better.
- Donors expect a light site.

### 7.2 Colour tokens (contrast verified)

| Token | Light | Use | Contrast |
|---|---|---|---|
| `paper` | `#FBF8F1` | Background | — |
| `sand` | `#F1E7D3` | Alternate sections | green on sand 6.5:1 |
| `ink` | `#1A1A17` | Body text | 16.4:1 on paper |
| `muted` | `#57534A` | Secondary text | 7.2:1 |
| `green` | `#1F5C3A` | Primary, links, primary buttons (paper text) | 7.5:1 |
| `gold` | `#E8B33A` | Accent fills with ink text | ink on gold 9.1:1 · **never text on paper (1.8:1)** |
| `terracotta` | `#A63D17` | Donate button (white text) | 6.4:1 |

| Token | Dark | Contrast on `#121512` |
|---|---|---|
| text | `#F3EFE6` | 16.0:1 |
| muted | `#B8B2A5` | 8.7:1 |
| green | `#7FC79A` | 9.2:1 |
| gold | `#E8B33A` | 9.6:1 |
| Donate | `#F08A5D` bg + `#121512` text | 7.4:1 |

**Focus indicator:** 2 px ink outline + 4 px gold outer ring. The two-tone ring passes 3:1 on every background; gold alone would fail on paper.

**Status colours** (success/warning/danger) always come with an icon and a text label, never colour alone.

### 7.3 Typography (glyph coverage tested)

The site needs to support Ghanaian languages later (Twi, Ewe, Ga, Dagbani). That means letters like **ɛ ɔ ŋ ƒ ʋ ɖ ɣ Ɛ Ɔ Ŋ Ʋ Ɖ Ɣ ʒ**.

I checked the actual font files:

| Font | Result |
|---|---|
| Atkinson Hyperlegible (+ Next) | Missing ɛ, ɔ and most others |
| Lexend, Inter, Open Sans, Roboto, Public Sans | Missing ɛ, ɔ and most others |
| Source Sans 3 | Missing Ʋ and Ɖ |
| **Noto Sans, Noto Serif, Merriweather, Andika, Gentium Book Plus** | **Full coverage** |

**Recommendation:**
- **Headings:** Merriweather — a warm, sturdy serif.
- **Body and UI:** Noto Sans.
- **Easy Read and children's materials:** Andika, SIL's literacy font with single-storey a/g, designed for beginning readers.

**Sizes:**
- Public body text 18 px, line-height 1.6, max 70ch.
- Portal body text 16 px, with dense tables at 15 px minimum.
- All text sizes in `rem`, so browser text scaling works.

### 7.4 Low-fidelity wireframes

Placeholder text is shown in [brackets]. In Phase 0 these become high-fidelity mockups as a coded prototype on staging.

**Home — mobile (375 px), mobile-first**
```
┌─────────────────────────────────┐
│ [Skip to content]               │
│ ◉ EdBridge Africa  [Donate] [☰] │
├─────────────────────────────────┤
│ Every child in school,          │
│ learning, and included.         │
│ [consented photo: classroom]    │
│ [ Donate ]   [ Get involved ]   │
│ Need support for a child?       │
│ Apply here →                    │
├─────────────────────────────────┤
│ [#]        [#]        [#]       │
│ children   stayed in  districts │
│ supported  school     reached   │
├─────────────────────────────────┤
│ Our programs                    │
│ ▸ Education access              │
│ ▸ Disability inclusion          │
│ ▸ Literacy & numeracy           │
│ ▸ Digital & STEM                │
│ ▸ Youth & careers               │
│ ▸ Families & communities        │
├─────────────────────────────────┤
│ Story: [pseudonym]'s return     │
│ to school →                     │
├─────────────────────────────────┤
│ Sponsor a child's education     │
│ GHS [x] = a term of books       │
│ [ Sponsor a child ]             │
├─────────────────────────────────┤
│ Partners [logo] [logo] [logo]   │
│ Latest news ▸ ▸ ▸               │
├─────────────────────────────────┤
│ About · Contact · Policies ·    │
│ Accessibility · Report a        │
│ concern · Staff login           │
└─────────────────────────────────┘
```

**Desktop header**
```
┌───────────────────────────────────────────────────────────────────────────┐
│ ◉ EdBridge Africa    About ▾   Our Work ▾   Get Involved ▾   News  Contact│
│                                   [Search]  Report a concern  [ Donate ]  │
└───────────────────────────────────────────────────────────────────────────┘
```

**Donate — mobile**
```
┌─────────────────────────────────┐
│ Donate or sponsor a child       │
│ ( One-time | Monthly )          │
│ [GHS 50] [GHS 150] [GHS 500]    │
│ [Other amount ____ ]            │
│ GHS 150 pays for [a term of     │
│ books & stationery]             │
│ Currency [GHS ▾]                │
│ Pay with Mobile Money or card   │
│ [ Continue to secure payment ]  │
├─────────────────────────────────┤
│ How sponsorship works           │
│ What sponsors receive           │
│ How we protect children         │
│ Where your money goes           │
│ [chart + data table]            │
│ Giving from abroad / bank       │
│ transfer                        │
└─────────────────────────────────┘
```

**Complaints & Reporting**
```
┌─────────────────────────────────────────────────────────────┐
│ If a child is in immediate danger, call [numbers confirmed  │
│ by the Safeguarding Lead].                                  │
│                                                             │
│ What would you like to report?                              │
│ ( ) A concern about a child's safety or wellbeing           │
│ ( ) A complaint about our services                          │
│ ( ) Fraud, corruption or staff misconduct                   │
│ ( ) Feedback or a suggestion                                │
│ [ Continue ]                                                │
│                                                             │
│ You can report anonymously. You will get a reference code   │
│ to check progress. Easy Read version · Sign language video  │
│ Already reported? [Check progress with your code]           │
└─────────────────────────────────────────────────────────────┘
```

**Portal dashboard — desktop.** Widgets appear based on the person's permissions; no dashboard is hard-coded per position.
```
┌────────────────┬──────────────────────────────────────────────────────────────┐
│ EdBridge Portal│ Good morning, [Name] · Scholarship & Financial Aid Officer   │
│                │ Education Access · Supervisor: [Education Program Manager]   │
│ Dashboard      ├────────────────────┬────────────────────┬────────────────────┤
│ My tasks       │ My tasks (5)       │ My caseload (18)   │ Announcements      │
│ Beneficiaries  │ ! Verify docs      │ Assessment     6   │ • Policy           │
│ Assessments    │   Overdue          │ Review         4   │   acknowledgement  │
│ Approvals (3)  │ • Q3 report, 2 days│ Service        8   │   required         │
│ Documents      │ • School visit Fri │ Follow-ups due: 3  │ • Staff meeting    │
│ Training       │ [View all]         │ [Open caseload]    │   Thu              │
│ Leave          ├────────────────────┼────────────────────┼────────────────────┤
│ Help           │ Awaiting my review │ Training           │ Leave              │
│ ────────────── │ 2 submissions      │ Safeguarding       │ 12 days left       │
│ Report a       │ [Review]           │ refresher due      │ [Request leave]    │
│ concern        │                    │ in 14 days         │                    │
└────────────────┴────────────────────┴────────────────────┴────────────────────┘
```

**Beneficiary registration — field officer, mobile**
```
┌─────────────────────────────────┐
│ ← New beneficiary    Step 2 of 7│
│ Progress ▓▓▓░░░░░  Saved 10:42  │
├─────────────────────────────────┤
│ 1 Consent ✓ · 2 Child ·         │
│ 3 Family · 4 Location & school ·│
│ 5 Needs · 6 Accessibility ·     │
│ 7 Review                        │
│                                 │
│ First name (required)           │
│ [                         ]     │
│ Family name (required)          │
│ [                         ]     │
│ Date of birth                   │
│ [DD] / [MM] / [YYYY]            │
│ [ ] Date not known              │
│     Estimated age: [  ] years   │
│                                 │
│ ⚠ Possible match:               │
│   EBA-AS-26-00142 (Ashanti)     │
│   [Review match]                │
│                                 │
│ [ Back ]              [ Next ]  │
└─────────────────────────────────┘
```

---

## 8. Staff portal — Phase 1B modules

### 8.1 Personal dashboard

Widgets are driven by permissions, so new positions get sensible dashboards automatically.

| Who | Widgets |
|---|---|
| Everyone | Profile card (job title, department, supervisor), my responsibilities, my tasks & deadlines, my projects & cases, my progress report, announcements, notifications, my documents & reporting templates, training, leave, help, report a concern |
| Supervisors | Team tasks, awaiting my review, overdue in my team |
| Case officers | Caseload by status, follow-ups due, missing documents |
| Approvers | Approval queue with tier and amount |
| Department heads | Department KPIs, department activity report |
| ED / Deputy | Org overview (aggregates), department reports, delegated approvals |
| Board | Board documents, meeting packs, approved budgets, financial summaries, org reports |
| Safeguarding | Open concern counts by urgency; details only after step-up MFA |
| IT / Cybersecurity | System health, security alerts, failed logins, access review status, backup status |

### 8.2 Tasks & performance

**Task model and workflow**
- Fields: title, description, assignee, assigner, department, optional project/case link, priority, due date, attachments, progress %.
- Statuses: Not started → In progress → **Submitted** → Approved, or **Returned for correction** → back to In progress. Tasks can also be Cancelled.
- Each submission is versioned, and the supervisor's feedback is attached to that version. Staff can reply to feedback.

**Views**
- My work, Team, and Department.
- A Kanban board, with an equivalent list and table view and keyboard "Move to…" controls (WCAG 2.5.7 requires an alternative to dragging).

**Deadlines and reports**
- Overdue tasks are flagged by a daily job; supervisors get a digest.
- Performance report per person and period: responsibilities (from the position), agreed targets, tasks completed, on-time rate, returned-for-correction rate, and supervisor comments.
- The same reports roll up by department and can be exported (with the `export` permission).

### 8.3 Beneficiary registration

**Channels**
- **Staff-assisted (office):** the full 7-step wizard.
- **Field:** the same wizard, mobile-optimised. Every step autosaves to the server and resumes after a dropped connection. The consent form photo or scan is uploaded in step 1.
- **School referral:** a public form for schools, which lands in the intake queue.
- **Online application:** guardians or young people aged 18+; minimal fields; lands in the intake queue.

**From intake to registered**
- Staff verify the intake → duplicate check (`pg_trgm` fuzzy match + a blind index on guardian phone) → convert to a beneficiary → the system issues an ID and assigns a case officer.

**Rules**
- Consent is required before any other data is saved.
- Disability details go to the Restricted `DisabilityProfile`; other teams see only an "accommodations needed" summary.

### 8.4 Needs assessment & approval

**The form** (versioned, so it can change without breaking old records)

| Section | Contents |
|---|---|
| Education | Enrolment, attendance %, grade/class, learning needs, dropout risk |
| Financial | Household challenges, school-related costs, existing support |
| Disability inclusion | Barriers, devices, accessible materials, accommodations (stored as Restricted) |
| Requested assistance | Fees, uniforms, shoes, books, stationery, transport, meals, tutoring, devices, other |
| Recommendation | Needs, intervention, estimated cost (GHS), priority, evidence uploads |
| Approval | Reviewer, decision, approved items, budget allocation, reasons for rejection/deferral, review date |

**Dropout risk score**
- A transparent, rule-based score built from attendance, age-for-grade gap, cost barriers and accessibility barriers.
- It shows its reasons and does not decide by itself.

**Approval routing** is configurable by estimated cost. Placeholder tiers, to be set by EdBridge:

| Tier | Estimated cost | Approver |
|---|---|---|
| 1 | ≤ GHS [x] | Education Program Manager |
| 2 | ≤ GHS [y] | Department Director |
| 3 | > GHS [y] | ED or Deputy ED |

**Guards:** approver ≠ assessor (enforced). A budget allocation is required for approval: a simple program envelope in Phase 1, full budget lines in Phase 3. Deferred cases come back automatically on their review date.

### 8.5 Safeguarding module (Phase 1 essentials)

**Separation**
- Stored in its own `safeguarding` schema, with its own encryption key and its own RLS policies.
- Excluded from general search, general exports and MEAL datasets.

**Intake and case management**
- Concerns come from the public form or from staff ("Report a concern" is on every portal page).
- Each concern gets an urgency triage, then a case with an assigned officer.
- The case holds encrypted notes and referral records (Department of Social Welfare, DOVVSU, health services, police) with outcomes.

**Conflict routing**
- Concerns about the ED go to the Board Chair.
- Concerns about the Safeguarding Lead go to the ED + Board.

**Flag on other records**
- Other teams see only a neutral flag on the beneficiary record: "Speak to the Safeguarding Lead before contact". It is shown only to the assigned case officer.

**Access controls**
- Every view of a case is logged.
- Viewing needs step-up MFA within the last 10 minutes.
- Break-glass access per §4.5.

### 8.6 Also in Phase 1B

- **Announcements:** audience by org, department, position or region. "Requires acknowledgement" turns an announcement into a tracked sign-off, e.g. the annual safeguarding policy.
- **Documents:** folders per department and board, classification levels, versioning, signed-URL downloads, retention category.
- **Training records:** course, date, certificate, expiry, with reminders before expiry. **Child-contact assignments are blocked if safeguarding training or the police check is missing or expired.**
- **Leave requests:** request → supervisor approval → HR record. Balance tracking.
- **Projects (basic):** name, objectives, activities, target communities, staff assignments and deadlines, so tasks, cases and dashboards can link to projects from day one. Funding and budgets come in Phase 3; indicators in Phase 4.
- **Notifications:** see §12.

---

## 9. Phases 2–4

**Phase 2: Program management**
- Full case tracking: service delivery records, follow-up schedules, closure reasons, case transfer between officers.
- Scholarship applications and assistance approvals (scholarship rounds, eligibility criteria, award letters, school fee evidence).
- Disability accommodation records: accommodation plans, assistive device requests and lifecycle, accessible materials (Braille, large print, GSL).
- Staff & volunteer management:
  - Recruitment pipeline from the Careers page through interview and offer.
  - Background checks (police report, references) and onboarding checklist.
  - Schedules and availability, participation records, activation and suspension.
- School & community partnerships: school registry, MoUs, partner contacts, referral tracking.
- Follow-up reporting: retention and attendance follow-ups, outcome tracking.

**Phase 3: Finance & fundraising**
- Donations:
  - Paystack integration with webhooks: one-time and recurring, MoMo + cards, automatic receipts.
  - Donor portal for downloading receipts.
- Donor CRM: profiles, contact preferences (GDPR-aware for EU/UK donors), donation history, communications log, reporting obligations with deadlines.
- Sponsorships: curated updates that pass through safeguarding approval. **Sponsors never get a child's contact details or location.**
- Grant management: opportunities pipeline, deadlines, proposal documents, budgets, agreements, reporting schedule, milestones, expenditure vs budget.
- Project management (full): budget and funding source, target beneficiaries, implementation deadlines, progress reports, and outcome/impact indicators linked to grants.
- Budget management: budgets per project or grant, budget lines, commitments vs actuals, utilisation alerts.
- Procurement & inventory:
  - Purchase request → quotations (three-quote rule above a threshold) → approval → PO → delivery → stock receipt.
  - Allocation → distribution → beneficiary or caregiver acknowledgement → reconciliation.
- Financial transactions: maker-checker steps with an immutable `TransactionStep` trail. Export to Xero or QuickBooks.

**Phase 4: Advanced**
- M&E dashboards: indicator framework (baseline, target, actual), data quality checks, beneficiary feedback loop.
- Regional/district management: regional managers, district-level dashboards and scoping.
- Advanced analytics: cohort retention, cost per outcome, program comparisons — all de-identified.
- Mobile:
  - Public REST API `/api/v1` with OpenAPI docs and token auth.
  - An **offline-capable field PWA**: encrypted local queue, sync with conflict handling, remote session revoke. A native app (Expo) can follow on the same API.
- Integrations: SMS reminders to caregivers (e.g. Hubtel or Arkesel), WhatsApp notifications, Google Workspace SSO, accounting sync, automated donor reports.

---

## 10. Security, privacy & child safeguarding

| Requirement | Implementation |
|---|---|
| Secure login & recovery | Email + password (≥ 12 chars, breached-password check, paste allowed); reset link expires after 15 min and is single-use; the user is emailed after a reset |
| MFA | TOTP or passkey, **mandatory** for admins, approvers, finance, HR, safeguarding, ED and IT; backup codes; passkeys recommended (easiest and most accessible) |
| Role-based access | §4 permission engine + RLS |
| Encryption in transit | TLS everywhere, HSTS preload, SSL Labs A+ |
| Encryption at rest | Supabase AES-256 disk encryption. **Plus** field-level AES-256-GCM for Restricted fields: separate keys for safeguarding / HR / disability, key versioning and rotation, key backup in EdBridge's password manager |
| Session expiry | 30 min idle, 12 h absolute. A warning 2 min before expiry with "Stay signed in" (WCAG 2.2.1). Step-up MFA for exports, payment approvals and Restricted views. Sessions revoked instantly on suspension or role change. |
| Login protection | Per-IP and per-account rate limits, progressive delay, temporary lock + email alert, new-device sign-in alerts |
| Suspicious activity | Rules: failed-login bursts, bulk record viewing (e.g. > 50 profiles in 10 min), export spikes, off-hours Restricted access, privilege changes. Alerts go to the Cybersecurity Officer, who has a security dashboard. |
| Secure uploads | Type allowlist + magic-byte check, size limits, randomised names, private buckets, 60 s signed URLs. Images are re-encoded and stripped of EXIF/GPS. PDFs and DOCX are malware-scanned (ClamAV worker on a small VPS, optional ~$6/mo). |
| Audit logs | Append-only `audit` schema: the app role has INSERT only, and triggers block UPDATE/DELETE. Entries are hash-chained, and the daily chain head is anchored to immutable B2 storage, so tampering is detectable. Searchable by authorized auditors; nobody can erase it. |
| Backups & recovery | Supabase daily backups (7 days). **Plus** nightly encrypted `pg_dump` and a Storage sync to Backblaze B2 with Object Lock (30 daily + 12 monthly), needed because Supabase's DB backups don't include storage files. Target RPO 24 h, RTO 1 business day. **Quarterly restore drill** into an isolated, temporary project. |
| Secure updates | Dependabot weekly, CI must pass, staging first, Vercel instant rollback, lockfile pinned |
| Controlled exports | `export` permission + step-up MFA + reason. De-identified by default; identifiable exports need DPO approval. Watermarked (user + time), link expires after 15 min, logged. |
| Retention & deletion | Configurable `RetentionPolicy` per record type, with periods set by Legal/DPO. A monthly job lists records due → DPO approves → anonymise or delete → tombstone log with no personal data |
| Access reviews | Quarterly certification by department heads; dormant-account suspension (§4.6) |
| Children's data | Data minimisation; consent before collection; no child self-registration under 18; IDs that don't reveal identity; Restricted classes for sensitive details; staging never holds real data |
| Consent & authorization | `ConsentRecord` with scope, expiry and withdrawal; the media publish block (§6.4); partner-sharing consent checked before referrals |
| Restricted safeguarding records | §8.5 |
| Secure complaint reporting | Anonymous option, reference code + passphrase, conflict routing, generic notifications |
| Supabase hardening | **Data API (PostgREST) disabled** (we never query from the browser); no grants to `anon` or `authenticated`; DB passwords rotated; dashboard access limited to 2 named EdBridge people with MFA |
| Headers | Strict CSP with nonces, `frame-ancestors 'none'`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, `X-Content-Type-Options` |
| Logging hygiene | Sentry PII scrubbing; no personal data in URLs or query strings; no sensitive data in logs |

*As built in 1A:* the CSP has no nonces, because nonces would force every public page to render per request instead of being served from the CDN, so it allows inline scripts. Form rate limits live in Postgres instead of Upstash, which saves running a separate service.

### 10.1 Ghana compliance

These items should be confirmed with EdBridge's Legal Adviser; I'm not giving legal advice.

**Data Protection Act, 2012 (Act 843)**
- Register with the **Data Protection Commission** as a data controller before processing personal data, and renew as required.
- Appoint a data protection supervisor (the spec's Data Protection & Privacy Officer).
- The system is built around the Act's principles: accountability, lawful processing, purpose specification, compatibility of further processing, data quality, openness, security safeguards, and data subject participation.
- Includes a data subject request workflow (access and correction).
- Data on children and on health/disability is treated as special personal data, with guardian consent and the strictest controls.

**Other laws and standards**
- Children's Act, 1998 (Act 560).
- Persons with Disability Act, 2006 (Act 715).
- Cybersecurity Act, 2020 (Act 1038): check whether it applies.
- Keeping Children Safe standards, which many institutional donors expect.

**Hosting region**
- Hosting is in London, the lowest practical latency from Accra, since Supabase has no West Africa region.
- Confirm with the DPC or Legal that cross-border hosting is acceptable.

**Breach response**
- A written incident response plan covers who decides, how affected people are notified, and DPC notification.
- It gets a tabletop exercise with the ED, IT Manager, DPO and Safeguarding Lead before 1B go-live.

---

## 11. Accessibility (WCAG 2.2 AA)

**Built in**
- Semantic HTML, landmarks, skip link and a logical heading order.
- Every interaction works by keyboard, focus is visible (two-tone ring), and focus isn't hidden by the sticky header (2.4.11).
- Forms:
  - Visible labels, help text and the `autocomplete` attribute.
  - Errors are shown inline and in a summary that receives focus, written in plain language.
  - Required fields are marked in text, not just with `*`.
- **Accessible authentication (3.3.8):** paste and password managers allowed, passkeys offered, no cognitive puzzles.
- **Redundant entry (3.3.7):** multi-step forms never ask for the same thing twice.
- **Target size (2.5.8):** at least 24×24 px everywhere; 44×44 px for primary touch targets.
- **Dragging (2.5.7):** every drag action has a button alternative.
- **Consistent help (3.2.6):** Help and Report a concern are always in the same place.
- Reflow at 320 px and 400% zoom; text resizing to 200%; respects `prefers-reduced-motion` and forced-colors mode.
- Alt text is required on CMS uploads (decorative images are explicitly marked). Captions and transcripts on all video.
- Charts always come with a data table alternative.
- Session-timeout warnings with extend (2.2.1).

**Beyond compliance (fits EdBridge's mission)**
- Ghanaian Sign Language video on Home, Disability Inclusion, Contact and Complaints, produced with EdBridge's own interpreters.
- Easy Read versions of the Safeguarding Policy and the Complaints process.
- Publications as HTML first. PDFs are tagged and checked with PAC.
- **No accessibility overlay widgets.** Disabled users' organisations widely reject them.

---

## 12. Notifications

**Channels:** an in-app notification centre, plus email. Each user can choose instant or a daily digest for each notification type.

| Event | Default recipients |
|---|---|
| New registration / intake | Intake officers for that district |
| Assessment awaiting completion | Assigned assessor |
| Application awaiting approval | Approver at the right tier |
| Missing documents | Case officer |
| Overdue task | Assignee + supervisor (daily digest) |
| Follow-up date due | Case officer |
| Grant deadline / donor reporting deadline | Fundraising owner + Director (14/7/1 days before) |
| Volunteer application | Volunteer Coordinator |
| Staff training due/expired | Staff member + HR |
| Security alert | Cybersecurity Officer + IT Manager (**can't be turned off**) |
| Safeguarding concern | Safeguarding Lead + Complaints Officer (**can't be turned off**) |

**Privacy rule:** emails and push previews never contain names, case details or safeguarding information. Example: *"You have 1 new item that needs your attention in the EdBridge portal. [Open portal]"*. Details appear only after login.

---

## 13. Dashboards & reporting

**Dashboards** (Phase 1 starts the core; the full set lands by Phase 4):
- Beneficiary registration and case status
- Out-of-school children and young people
- Enrolment and retention
- Scholarships and assistance
- Disability inclusion and accommodations
- Digital and vocational training
- Volunteer activity
- Project implementation
- Donations and grants
- Budget utilisation
- Procurement and inventory
- Staff tasks and department performance
- Outcomes and impact

**How they work**
- **Filters on every report:** program, project, date range, district, region.
- **De-identified by default:**
  - Reports show aggregates only.
  - **Small-cell suppression:** counts under 5 show as "<5", so a child can't be identified (e.g. one deaf girl in one district).
  - Drilling down to named records needs the matching record permission and is logged.
- **Performance:** aggregate views (materialised views refreshed nightly) keep dashboards fast and cheap.
- **Search:** Postgres full-text search plus trigram matching, always filtered by permissions.
- **Exports:** CSV, XLSX and PDF, under the export controls in §10.

---

## 14. Timeline, effort & costs

### 14.1 Milestones

| Phase | Weeks | Milestones & exit criteria |
|---|---|---|
| **0 Discovery & foundations** | 1–2 | Kickoff workshop; accounts created **under EdBridge ownership** (§16); sitemap + wireframes approved; design system; content plan with owner; threat model; DPIA started; Paystack KYC started; repo, CI, staging + prod environments |
| **1A Public website** | 3–8 | **W4:** templates + design system in code (staging). **W6:** all 20 pages with real content, CMS approval workflow. **W7:** forms + secure intake inbox (auth + MFA), Donate via Paystack. **W8:** accessibility + performance audit passed, CMS editors trained → **public launch** |
| **1B Portal core** | 9–20 | **W12 M1:** auth hardening, org structure admin, permission engine + matrix tests, audit log. **W15 M2:** dashboards, tasks + review workflow, announcements, documents, training, leave. **W18 M3:** beneficiary registration (4 channels), needs assessment + approvals, safeguarding module, notifications. **W20 M4:** security review + external pen test, disability user testing, restore drill, legal gate passed → **pilot launch** (ED office, Education Access, Safeguarding) |
| **Rollout** | 21–24 (overlaps Phase 2) | Onboard the remaining departments in waves; feedback fixes |
| **2 Program management** | 21–30 | Case tracking → scholarships → accommodations → staff/volunteer management → partnerships → follow-up reports |
| **3 Finance & fundraising** | 31–40 | Donations + donor CRM → grants → budgets → procurement/inventory/distribution → financial reports + accounting export |
| **4 Advanced** | 41–52+ | M&E dashboards → regional management → analytics → API v1 + offline field PWA → integrations |

### 14.2 Itemised development effort

Cost = hours × agreed rate. The rate is to be agreed; it may be pro bono or discounted for a nonprofit. Hours include testing and documentation.

| Item | Hours |
|---|---|
| **Phase 0:** discovery workshops 8 · accounts & ownership setup 4 · IA + wireframes 12 · design system 10 · repo/CI/environments 6 | **40** |
| **Phase 1A:** layout, navigation, accessible primitives 12 · Payload CMS + collections + approval workflow + media consent 24 · 20 pages on ~8 templates 40 · public forms (9) + routing 20 · secure intake inbox + auth foundation 16 · Donate/Sponsor + Paystack 4 · SEO, analytics, performance 6 · accessibility/QA 10 · content loading + CMS training 8 | **140** |
| **Phase 1B:** auth hardening 20 · org structure admin 24 · permission engine, roles UI, RLS, matrix tests 40 · audit + access logs 14 · dashboards & widgets 20 · tasks, review, performance reports 32 · announcements + acknowledgements 8 · documents & upload pipeline 20 · training + leave 14 · basic projects 6 · beneficiary registration (4 channels, dedupe, consent, IDs) 36 · needs assessment + approvals + SoD 30 · safeguarding module 30 · notifications 14 · privacy controls (exports, retention, data subject requests) 12 · security/accessibility testing, pilot, training 26 | **346** |
| **Phase 2:** case tracking 40 · scholarships & assistance 36 · disability accommodations 28 · staff & volunteer management 44 · school & community partnerships 24 · follow-up reporting 16 · testing & training 16 | **204** |
| **Phase 3:** donations + Paystack webhooks + receipts 36 · donor CRM 30 · sponsorships 20 · grants 30 · project management 16 · budgets 30 · procurement, inventory, distribution 44 · financial reports + accounting export 20 · testing 14 | **240** |
| **Phase 4:** M&E dashboards 50 · regional management 24 · analytics 30 · API v1 + mobile auth 40 · offline field PWA 60 · integrations (SMS, WhatsApp, SSO) 36 | **240** |
| **Total** | **≈ 1,210 h** |

A native mobile app is quoted separately once the Phase 4 API exists.

### 14.3 Hosting, domain & recurring costs (USD, estimates as of Oct 2026 — confirm at signing)

| Service | Plan | Monthly |
|---|---|---|
| Vercel | Pro, 1 seat (Hobby is limited to personal, non-commercial use) | $20 |
| Supabase (production) | Pro | $25 |
| Supabase (staging) | Free (synthetic data; pausing is fine) | $0 |
| Resend | Free (3k emails/mo) → Pro when needed | $0–20 |
| Backblaze B2 | Off-site immutable backups | ~$1 |
| Sentry · uptime monitor · Turnstile · Upstash · GitHub org | Free tiers | $0 |
| ClamAV scanning VPS | Optional | ~$6 |
| Password manager for handover (e.g. Bitwarden Teams) | Optional, per user | ~$4/user |
| **Total** | | **≈ $46–75 / month** |
| Domain | `.org` ~$15–20/yr; optionally also `.org.gh` via a Ghanaian registrar | yearly |
| Paystack | No monthly fee; percentage per transaction (confirm current Ghana rates) | variable |
| Google Workspace for Nonprofits | Free if eligible; gives every staff member an org email, which makes offboarding clean | $0 |

**One-time and optional costs**
- Independent penetration test before 1B go-live (seek pro bono or nonprofit pricing).
- Honoraria for disabled user testers (6–8 people per major release).
- GSL video production.
- DPC registration fee (per the DPC's current schedule).
- Consented professional photography.

**Maintenance:** monthly dependency and security updates, backup verification and uptime review. Estimated 4–8 h/month, under the support terms in §17.

---

## 15. Testing plan

### 15.1 Functional & authorization

- **Unit (Vitest):** permission resolution, scopes, SoD rules, state machines, approval-tier routing, risk score.
- **Authorization matrix tests:** generated from the seed config; every role × module × action is asserted allowed or denied. CI fails on any unexpected change.
- **Database tests:** RLS policies tested as different DB roles; audit-table UPDATE/DELETE attempts must fail.
- **IDOR tests (Playwright):** swap IDs in URLs and API payloads across officers, departments and districts → always 404, and logged.
- **E2E (Playwright):** registration → assessment → approval; task assign → submit → return → approve; leaver offboarding; CMS draft → approve → publish; each public form.

### 15.2 Security

Acceptance checklist: **OWASP ASVS v5, Level 2**.

| Check | Cadence |
|---|---|
| ESLint security rules, Semgrep (SAST), gitleaks (secrets), `npm audit` + Dependabot | Every commit |
| OWASP ZAP baseline scan against staging | Weekly |
| Security headers check · SSL Labs | Each release |
| Threat model (STRIDE) for beneficiary, safeguarding and finance flows | Phase 0, updated each phase |
| Independent penetration test | Before 1B go-live, then yearly |
| Restore drill · incident-response tabletop | Quarterly · before go-live |

### 15.3 Accessibility

- **Automated:** `eslint-plugin-jsx-a11y`; axe-core on every route in CI (fails on serious or critical issues); Lighthouse CI accessibility = 100 on templates.
- **Manual, each release:**
  - Keyboard-only run through the key flows.
  - Screen readers: NVDA + Chrome/Firefox, VoiceOver on iOS/macOS, and **TalkBack on Android** (the most common setup in Ghana).
  - 200% text, 400% zoom / 320 px reflow, forced colours, reduced motion, colour-blindness simulation.
- **With users:** 6–8 participants recruited through Ghanaian disability organisations (e.g. the Ghana Federation of Disability Organisations, Ghana Blind Union, Ghana National Association of the Deaf), covering blind/low-vision, Deaf GSL users, motor and cognitive disabilities. Before 1A launch and before 1B pilot.
- **Documents:** PAC check on every published PDF.

### 15.4 Performance

- Lighthouse CI budgets on throttled 4G, plus a real mid-range Android device test.
- Vercel Speed Insights in production.

---

## 16. Documentation, training, handover & ownership

### 16.1 Ownership from day one

Every account is created **by EdBridge, under an EdBridge address** (e.g. `it@edbridgeafrica.org`), with EdBridge as owner and the developer as a member only:

| Account | Owner | Developer access |
|---|---|---|
| Domain registrar, Cloudflare DNS | EdBridge | Member / DNS edit |
| GitHub organisation (`edbridge-africa`) | EdBridge | Maintainer |
| Vercel team | EdBridge | Member |
| Supabase organisation | EdBridge | Developer |
| Resend, Paystack, Sentry, Backblaze, Turnstile | EdBridge | Member |
| Google Workspace | EdBridge | — |
| Password manager vault (incl. encryption key backups) | EdBridge (IT Manager + ED) | Shared items only |

MFA is enabled on every account. The contract assigns code copyright to EdBridge (or licenses it under MIT), subject to third-party open-source licences.

### 16.2 Documentation (in `docs/`, kept current every phase)

- **Architecture:** overview, data-flow diagrams, environment setup.
- **Database:** generated ERD + schema reference, RLS policy reference, data dictionary.
- **Access:** permission matrix (generated) and how to add departments, positions and roles.
- **API:** OpenAPI reference (Phase 4).
- **Runbooks:** deploy & rollback, backup & restore, key rotation, incident & data-breach response, dependency updates, access review, offboarding.
- **Data export:** full export (pg_dump + storage) and per-module CSV/JSON, so EdBridge is never locked in.

### 16.3 Training

- **Role-based quick-start guides** (1–2 pages each): Staff basics, Supervisor, Case Officer, Approver, Safeguarding, Finance, HR, CMS Editor, Admin/IT, Board.
- **Captioned 3–5 min screen recordings** for each guide.
- **Live remote sessions.** Ghana (GMT) is 5 h ahead of Orlando from Nov 1, so 2 pm in Accra is 9 am in Orlando.
- **Train-the-trainer:** the IT Manager + one champion per pilot department.
- **Practice:** a staging sandbox with realistic fake data.
- **In-app help links** on every portal screen.

### 16.4 Handover checklist (end of each phase)

- Code merged to `main` and tagged.
- Docs updated and the permission matrix regenerated.
- Credentials rotated if the developer's access changes.
- Restore drill passed.
- Admin walkthrough recorded.
- Sign-off from the ED and IT Manager.

---

## 17. Bug-fixing & support terms (proposal — to agree)

- **Warranty:** defects in delivered features are fixed at no cost for **60 days** after each phase launch.

**Severity and response**

| Severity | Example | Response target |
|---|---|---|
| P1 Critical | Site or portal down, data exposure, security incident | Acknowledge within 4 h (during waking hours), work immediately |
| P2 High | Core workflow broken (registration, approvals, login for a department) | 2 business days |
| P3 Normal | Minor bugs, cosmetic issues | Next monthly maintenance |
| Change request | New features or changed requirements | Estimated and scheduled |

**Monthly maintenance (optional retainer, ~4–8 h):** dependency and security updates, backup verification, uptime and error review, small content-model tweaks.

**Continuity:** documentation, tests and a mainstream stack mean any competent Next.js developer can take over, and the IT Manager is trained to run day-to-day administration.

---

## 18. Risks & mitigations

| Risk | Mitigation |
|---|---|
| Very large scope for one developer | Phased delivery, pilot first, configuration over code, mainstream stack, full docs and tests |
| Content not ready | Named content owner in Phase 0, templates and drafts provided, launch core pages first |
| Real child data before legal readiness | Hard go-live gate: DPC registration + DPIA + approved consent forms |
| Poor connectivity in the field | Per-step autosave and low-data UI now; offline PWA in Phase 4 |
| Shared devices or accounts | Per-person logins only, short idle timeout, "sign out on close" on shared tablets, recommend device management |
| Over-permissioning over time | Time-boxed grants, quarterly access reviews, dormant-account suspension |
| Developer continuity | EdBridge owns all accounts; docs, runbooks and trained IT Manager |
| Payload ↔ Next.js version coupling | Pin compatible versions; upgrade on staging first |
| Paystack onboarding delay (KYC documents) | Start in Phase 0; fall back to bank-transfer details on the Donate page |
| Hosting cost creep | Vercel spend limits and alerts; static-first public site |

---

## 19. Open questions for EdBridge

1. Do you already have a domain, logo, brand colours or photography? Who owns the domain today?
2. Who currently fills which positions, and how many staff, volunteers and board members will use the portal at launch? Do any people hold more than one role?
3. Do existing beneficiary, donor or volunteer records exist (spreadsheets, paper) that need importing?
4. What is your registration status (Registrar-General, Department of Social Welfare NGO registration, Data Protection Commission)? Do you have a bank account ready for Paystack?
5. Do you use Google Workspace or Microsoft 365? Which accounting software, if any?
6. Should the site launch in English only? Are Twi, Ewe, Ga or Dagbani planned later?
7. Which regions and districts do you operate in today?
8. What are the approval thresholds (GHS) and delegated authority limits?
9. Who owns website content and publishing approval? Do written Safeguarding, Privacy and Complaints policies already exist?
10. What devices do staff use (Android phones, laptops, shared tablets), and what is connectivity like in field areas?
11. Do you receive international donations? Do you need US/UK tax-deductible giving (e.g. via a fiscal sponsor)?
12. What is the development budget, and what payment terms do you prefer?

---

## 20. Deliverables checklist (spec §17)

| # | Deliverable | Where / when |
|---|---|---|
| 1 | Recommended technology stack | §2 — confirmed in Phase 0 |
| 2 | Website design & wireframes | §7 (low-fi); hi-fi coded prototype in Phase 0 |
| 3 | System architecture & database structure | §3, §5; generated ERD + schema docs in 1B |
| 4 | Department, position & permissions configuration | §4; seed files + generated matrix in 1B |
| 5 | Timeline & milestones | §14.1 |
| 6 | Itemised development cost | §14.2 (hours × agreed rate) |
| 7 | Hosting, domain & maintenance costs | §14.3 |
| 8 | Security & accessibility testing plan | §15 |
| 9 | Staff training & user documentation | §16.3; delivered per phase |
| 10 | Source code & repository access | EdBridge-owned GitHub organisation from day one |
| 11 | Database documentation & data export | §16.2 |
| 12 | Backup & recovery documentation | §10, runbook in `docs/` before 1B go-live |
| 13 | Administrative ownership & account handover | §16.1, §16.4 |
| 14 | Bug-fixing & support terms | §17 |
| 15 | Third-party services & recurring charges | §14.3 |

---

## 21. Immediate next steps

1. Send §19's open questions and this plan to EdBridge; book the kickoff call.
2. EdBridge creates the core accounts (domain, GitHub organisation, Vercel, Supabase); the developer is invited as a member.
3. Scaffold the repo:
   - Next.js 16 + TypeScript + Tailwind v4.
   - Prisma + local Supabase, Better Auth, Payload at `/cms`.
   - CI with lint, typecheck, Vitest, Playwright + axe and gitleaks.
4. Build design tokens, typography, focus styles, header/footer, and the first page templates on staging.
5. Build Home, About and Donate first, as the visual sign-off pages for the client.
