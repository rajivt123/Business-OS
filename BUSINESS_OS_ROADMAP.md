# RAJIV BUSINESS OS — MASTER ROADMAP

## 1. PURPOSE

RAJIV BUSINESS OS is being built as a complete Business Operating System for multi-company businesses.

The objective is NOT to create a collection of independent CRUD modules.

The objective is to create connected business workflows where:

**Operations → Approvals → Transactions → Inventory/HR → Accounting → Banking → Reconciliation → Reporting**

work as one controlled system.

The roadmap therefore prioritizes COMPLETE BUSINESS FLOWS over isolated modules.

---

# 2. CORE DEVELOPMENT RULE

## BUSINESS FLOW FIRST

Do not treat Procurement, Inventory, Sales, Payroll, Projects, HR, Accounts, Documents, Notifications, etc. as isolated projects.

Whenever possible, complete the connected business chain.

Example:

**Procurement → Inventory → AP → Payment → Bank → Reconciliation → Reporting**

rather than simply declaring "Procurement completed."

A module is considered complete only when its important business boundaries and integrations are complete.

---

# 3. EXISTING FOUNDATION

## 🔵 FROZEN / 🟢 SUBSTANTIALLY COMPLETE

### Platform / Authorization

* Multi-company architecture
* Tenant/company access
* Existing authorization model
* OWNER / ADMIN / MANAGER / TEAM / VIEWER roles
* Company-level access control
* SECURITY DEFINER authorization patterns
* Audit/history principles

### CRM

* 🔵 FROZEN
* CRM foundation and workspace implemented

### Employee Master

* 🔵 FROZEN
* Employee master
* Departments
* Designations
* Company assignments
* PF
* ESI
* Tax
* Bank accounts
* Custom employee fields
* Dependents
* Nominees
* Documents

### HR Policy Center

* 🔵 FROZEN
* Policy sets
* Employee categories
* Work locations
* Leave types
* Leave rules
* Attendance policies
* Weekly offs
* Holidays
* Overtime
* Comp-off
* Approval workflows

### Recruitment

* 🔵 FROZEN
* Positions
* Recruitment links
* Candidates
* Interviews
* Selection
* Onboarding
* Employee conversion

### Common Approval Engine

* 🔵 FROZEN
* Approval requests
* Approval steps
* Approval actions
* Maker-checker
* Workflow snapshotting
* Requester cannot approve own request

### Attendance Foundation

* 🟢 SUBSTANTIALLY COMPLETE
* Attendance
* Shifts
* Employee shifts
* Device binding
* Mobile PWA attendance
* Tablet/kiosk attendance
* Geofence foundation
* Face verification foundation
* Attendance correction workflow
* Daily attendance calculation

Real biometric provider integration is still separate work.

### Accounts Foundation

* 🟢 SUBSTANTIALLY COMPLETE
* Chart of Accounts
* Fiscal periods
* Journal entries
* Journal lines
* Bank accounts
* Bank transactions
* Posting controls
* Fiscal-period controls
* Payment accounting
* Reconciliation
* Reversal foundation
* Financial reporting
* AR/AP reconciliation integrity

IMPORTANT:
Vendor → AP party linkage is ALREADY IMPLEMENTED.
Do NOT treat Vendor AP party linkage as an unfinished item.

### Reporting Engine

* 🔵 FROZEN
* Operational reports
* Financial reports
* Trial balance
* P&L
* Balance sheet
* Cash flow
* AR aging
* AP aging
* Inventory reports
* Procurement reports
* Project reports
* Management summaries

### Payroll

* 🟡 IN PROGRESS
* Payroll calculation foundation exists
* Attendance integration exists
* Leave → Payroll integration exists
* Payroll accounting exists
* Payroll payment batch exists
* Bank payment/reconciliation foundation exists
* Payroll accounting E2E integrity RPC exists
* Frontend payroll integrity integration exists

Remaining payroll completion is listed below.

### Procurement

* 🟡 IN PROGRESS
* PR
* RFQ
* Vendor quotation
* PO
* PO approval
* GRN
* Purchase bills
* Purchase payments
* Procurement → Accounts integration
* Vendor → AP party linkage
* Stock purchase controls
* GRNI controls

Remaining E2E completion is listed below.

### Inventory

* 🟡 IN PROGRESS
* Inventory items
* Locations
* Stock balances
* Inventory transactions
* Reservations
* Allocation
* Fulfilment
* Stock issue
* Adjustments
* Approval foundation

Remaining accounting/valuation/E2E completion is listed below.

### Sales

* 🟡 IN PROGRESS
* Quotations
* Sales orders
* Invoices
* Payments
* Inventory reservation/fulfilment integration
* Revenue accounting integration

Remaining E2E completion is listed below.

---

# 4. MASTER BUSINESS FLOW ROADMAP

## PHASE 1 — PROCUREMENT + INVENTORY + AP + BANK

### 🟡 IN PROGRESS

Target complete flow:

**Purchase Request**
→ **RFQ**
→ **Vendor Quotation**
→ **Purchase Order**
→ **Approval**
→ **Goods Receipt**
→ **Inventory Receipt**
→ **Stock Valuation**
→ **Purchase Bill**
→ **3-Way Match**
→ **Accounts Payable**
→ **Payment**
→ **Bank**
→ **Bank Reconciliation**
→ **Reporting**

### Required completion

* Full PR → RFQ → Quote → PO lifecycle
* Approval controls
* PO status integrity
* GRN lifecycle integrity
* GRN → Inventory integration
* Inventory valuation
* PO ↔ GRN ↔ Bill three-way matching
* Partial receipt handling
* Partial billing handling
* Excess quantity prevention
* Duplicate bill prevention
* GRNI integrity
* PPV handling where applicable
* AP posting integrity
* Payment posting
* Bank transaction creation
* Bank reconciliation
* Cancellation controls
* Reversal controls
* Fiscal-period controls
* Idempotency
* Complete E2E integrity verification
* Reporting verification

---

# 5. PHASE 2 — SALES + INVENTORY + AR + BANK

### 🟡 IN PROGRESS

Target complete flow:

**Quotation**
→ **Sales Order**
→ **Approval**
→ **Inventory Reservation**
→ **Issue/Fulfilment**
→ **Invoice**
→ **Revenue**
→ **COGS**
→ **Accounts Receivable**
→ **Customer Payment**
→ **Bank**
→ **Reconciliation**
→ **Reporting**

### Required completion

* Full quotation → SO lifecycle
* Approval controls
* Reservation integrity
* Stock issue integrity
* Invoice accounting
* Revenue recognition/posting
* COGS integration
* AR integrity
* Payment posting
* Bank integration
* Customer-level reconciliation when customer identity model supports it
* Credit notes
* Cancellation
* Reversal
* GST edge cases
* Duplicate prevention
* Fiscal-period controls
* Idempotency
* Complete E2E verification
* Reporting verification

---

# 6. PHASE 3 — PAYROLL + HR + ACCOUNTING + BANK

### 🟡 IN PROGRESS

Target complete flow:

**Employee**
→ **Attendance**
→ **Leave**
→ **Overtime**
→ **Comp-off**
→ **Payroll Calculation**
→ **Approval**
→ **Finalization**
→ **Statutory Calculation**
→ **Accounting**
→ **Payslip**
→ **Bank File**
→ **Payment**
→ **Bank Reconciliation**
→ **Statutory Outputs**
→ **Reporting**

### Required completion

* PF output
* ESI output
* PT output
* TDS output
* Statutory payment flow
* Bank file generation
* Bank-file submission/result recording
* Payment reconciliation
* Payroll reversal
* Reprocessing
* F&F payroll
* Exit payroll
* Employee transfer handling
* Company transfer handling
* Overtime → payroll
* Comp-off → payroll
* Full payroll E2E QA
* Real test transactions in controlled test context
* Reporting verification

---

# 7. PHASE 4 — PROJECT / WORK FINANCE

### 🔴 NOT STARTED / PARTIALLY IMPLEMENTED

Target:

**Project**
→ **Work / Stage / Task**
→ **Resource**
→ **Procurement**
→ **Inventory Consumption**
→ **Employee Cost**
→ **Other Expenses**
→ **Revenue**
→ **Billing**
→ **Collections**
→ **Project Profitability**

### Required completion

* Project financial dimensions
* Procurement cost → Project
* Inventory cost → Project
* Employee cost → Project
* Expense → Project
* Revenue → Project
* Billing → Project
* Collection → Project
* Project contribution
* Cost drill-down
* Revenue drill-down
* Project profitability
* Management reporting
* Project financial E2E

Important:
Do not invent budget-vs-actual functionality until a real budget model exists.

---

# 8. PHASE 5 — HR OPERATIONAL COMPLETION

### 🟡 IN PROGRESS

Required:

* Employee lifecycle
* Employee transfer
* Company transfer
* Department transfer
* Designation changes
* Overtime → Payroll
* Comp-off → Payroll
* Exit workflow
* Full & Final Settlement
* Final payroll
* Employee statutory lifecycle
* Employee document lifecycle
* HR approvals
* HR → Payroll integrity

---

# 9. PHASE 6 — DOCUMENTS

### 🟡 IN PROGRESS

Documents must become a business-wide capability.

Required:

* Business-record attachments
* Employee documents
* PO documents
* GRN documents
* Bills
* Invoices
* Contracts
* Versioning
* Access control
* Expiry tracking
* Document history
* Record linkage
* Security

---

# 10. PHASE 7 — NOTIFICATIONS + REMINDERS

### 🟡 IN PROGRESS

Frozen distinction:

**Task = work**

**Request = action/decision**

**Approval = authorized decision**

**Reminder = remind me**

**Notification = tell me**

Required:

* Event-driven notifications
* Reminder execution
* Notification preferences
* Retry/failure handling
* Approval notifications
* Payment reminders
* Document expiry reminders
* HR notifications
* Task notifications
* Procurement notifications
* Payroll notifications
* Escalation
* Audit/history

---

# 11. PHASE 8 — REAL FACE BIOMETRIC

### 🟡 FOUNDATION EXISTS / PROVIDER PENDING

Current face enrollment is an administrative secure profile-binding foundation.

Remaining:

* Real biometric provider
* Server-side provider adapter
* Liveness detection
* 1:1 verification
* Enrollment integration
* Revocation
* Failure handling
* Provider health handling
* Production security

Do NOT store raw biometric images in Business OS unless explicitly designed and approved.

Preferred architecture:

**HR Camera**
→ **Biometric Provider**
→ **Liveness**
→ **Provider Subject Reference**
→ **Business OS**

Attendance verification:

**Employee Identity**
→ **Liveness**
→ **1:1 Verification**
→ **Existing Company/Device Authorization**
→ **Attendance Punch**

Provider failure/mismatch/liveness failure must NEVER result in a successful punch.

---

# 12. PHASE 9 — AI

### 🔴 NOT STARTED / ARCHITECTURE TO BE BUILT

Potential capabilities:

* Business assistant
* Natural-language reporting
* Operational insights
* Financial insights
* Anomaly detection
* Document intelligence
* Workflow assistance
* Management summaries
* Business recommendations

AI must respect the existing tenant/company authorization model.

AI must not bypass authorization or expose data outside the user's authorized scope.

---

# 13. PHASE 10 — SECURITY HARDENING

### 🟡 IN PROGRESS

Required:

* Complete RLS review
* No-policy table classification
* SECURITY DEFINER audit
* Search-path hardening
* Cross-tenant isolation testing
* Cross-company isolation testing
* Role/action authorization testing
* Idempotency testing
* Concurrency testing
* Fiscal-period security
* Approval security
* Sensitive data protection
* Auth security review
* Error leakage review

Do not blindly add policies to intentionally internal sequence/idempotency tables without understanding their access model.

---

# 14. PHASE 11 — FULL E2E QA

### 🔴 NOT STARTED

Test complete business scenarios.

## Procurement

PR
→ RFQ
→ Quote
→ PO
→ Approval
→ GRN
→ Stock
→ Bill
→ AP
→ Payment
→ Bank
→ Reconciliation
→ Reports

Test:

* partial GRN
* partial bill
* excess bill
* duplicate bill
* rejected approval
* cancelled PO
* failed payment
* duplicate payment
* reversal
* closed period

## Sales

Quotation
→ SO
→ Reservation
→ Issue
→ Invoice
→ Revenue
→ COGS
→ AR
→ Payment
→ Bank
→ Reconciliation
→ Reports

Test:

* partial fulfilment
* cancelled order
* invoice cancellation
* credit note
* duplicate payment
* reversal
* GST edge cases

## Payroll

Employee
→ Attendance
→ Leave
→ Payroll
→ Approval
→ Finalization
→ Statutory
→ Accounting
→ Payment
→ Bank
→ Reconciliation
→ Reports

Test:

* leave
* LOP
* half day
* overtime
* comp-off
* reversal
* reprocessing
* employee transfer
* exit/F&F

## Projects

Project
→ Procurement
→ Inventory
→ Employee cost
→ Expense
→ Revenue
→ Billing
→ Collection
→ Profitability

Test complete cost/revenue traceability.

---

# 15. PHASE 12 — PRODUCTION READINESS

### 🔴 NOT STARTED

Required:

* Error handling
* Retry handling
* Idempotency
* Concurrency
* Audit verification
* Performance review
* Index review
* Backup/recovery review
* Deployment verification
* Vercel verification
* Supabase verification
* GitHub verification
* Security review
* Production data protection
* Monitoring/observability

---

# 16. COMPLETION STANDARD

A feature must NOT be marked COMPLETE merely because:

* UI exists
* Table exists
* RPC exists
* basic create/update works

A feature can be marked COMPLETE only when:

1. Backend exists
2. Database integrity is enforced
3. Authorization is enforced
4. Company/tenant isolation is verified
5. Business status transitions are correct
6. Idempotency is handled where required
7. Accounting/inventory/HR integrations are correct
8. Error/failure paths are handled
9. Reversal/cancellation behavior is defined
10. Reporting impact is verified
11. Frontend contract matches backend
12. GitHub code is verified
13. Live Supabase is verified where applicable
14. E2E QA is completed

---

# 17. DEVELOPMENT CONTROL RULE

For EVERY future Business OS change:

### BEFORE CHANGE

Check:

1. GitHub current `main`
2. This roadmap
3. Existing frontend implementation
4. Existing Supabase schema
5. Existing RPCs/functions
6. RLS/policies
7. Existing migrations
8. Existing integrations

Do not assume something is missing.

### AFTER CHANGE

Verify:

1. Supabase migration/function
2. Database behavior
3. Security
4. Frontend contract
5. Git diff
6. Build/lint
7. GitHub commit
8. Deployment status where applicable
9. Update this roadmap

---

# 18. CURRENT EXECUTION ORDER

The project must progress in this order unless a dependency requires otherwise:

## CURRENT

### 🔥 Procurement + Inventory + AP + Bank E2E

↓

## NEXT

### Sales + Inventory + AR + Bank E2E

↓

## NEXT

### Payroll + HR + Accounting + Bank E2E

↓

## NEXT

### Project / Work Finance

↓

## NEXT

### HR Operational Completion

↓

## NEXT

### Documents + Notifications + Reminders Integration

↓

## NEXT

### Real Biometric

↓

## NEXT

### AI

↓

## FINAL

### Security Hardening + Full E2E QA + Production Readiness

This is NOT a restriction against fixing dependencies discovered during implementation. If a dependency or security issue is discovered, fix it before continuing.

---

# 19. CURRENT STATUS SNAPSHOT

As of the initial creation of this roadmap:

### 🟢 Strong foundation

* Platform
* Authorization
* CRM
* Employee Master
* HR Policy
* Recruitment
* Approval Engine
* Accounts foundation
* Reporting foundation

### 🟡 Substantially built / integration finishing

* Attendance
* Payroll
* Procurement
* Inventory
* Sales
* HR operations
* Documents
* Notifications/Reminders

### 🔴 Major work remaining

* Project Finance
* AI
* Full E2E QA
* Production readiness
* Real biometric provider integration

---

# 20. NON-NEGOTIABLE PROJECT PRINCIPLES

* Never destroy production data.
* Never reset frozen modules.
* Prefer additive database migrations.
* Never fake production data or E2E results.
* Never claim a feature is complete without verification.
* Never invent unavailable metrics.
* Never bypass tenant/company authorization.
* Never duplicate an already implemented capability.
* Never change architecture merely for cosmetic reasons.
* Always inspect GitHub before implementation.
* Always inspect live Supabase for backend-dependent work.
* Always update this roadmap after meaningful changes.
* Keep this roadmap as the single source of truth for project direction.

END OF MASTER ROADMAP.
