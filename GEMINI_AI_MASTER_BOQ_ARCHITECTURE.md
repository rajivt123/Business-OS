# RAJIV BUSINESS OS
# Gemini / Multi-AI Master BOQ & Intelligent Transaction Architecture

Document Type:
Permanent Product Architecture / AI Workflow Reference

Purpose:
This document records the actual real-world product architecture and business workflow for Master BOQ, AI identification, purchasing, sales, inventory, vendor document processing, reconciliation and accounting intelligence.

This document is SEPARATE from the general RAJIV BUSINESS OS architecture plan.

============================================================
1. CORE PRODUCT VISION
============================================================

RAJIV BUSINESS OS is NOT intended to become another conventional ERP where users manually enter the same information repeatedly.

The real product objective is:

A company/project already has real-world documents such as:

- Quotation
- Final BOQ
- Purchase Order
- Work Order
- Vendor Purchase Invoice
- Delivery Challan
- GRN
- Sales Order
- Proforma Invoice
- Tax Invoice
- Credit Note
- Debit Note
- Other project/business documents

The system should understand those documents using AI and convert them into structured business data.

The FINAL BOQ is extremely important.

The system should create a structured MASTER BOQ from the final BOQ and use that Master BOQ as the common reference for the entire project/business workflow.

Core concept:

REAL DOCUMENTS
    ↓
AI DOCUMENT UNDERSTANDING
    ↓
MASTER BOQ
    ↓
MASTER ITEM IDENTITY
    ↓
PURCHASE / SALES / INVENTORY
    ↓
RECONCILIATION
    ↓
ACCOUNTING / AUDIT

The Master BOQ is therefore a central business object, not merely a PDF attachment.

============================================================
2. REAL-WORLD PROBLEM BEING SOLVED
============================================================

In the current market, users repeatedly enter the same material information.

Example:

Final BOQ:
"150 NB MS PIPE SCH 40"

Vendor A:
"150MM MS PIPE SCH-40"

Vendor B:
"6 INCH MS PIPE SCH 40"

Vendor C:
"MS PIPE 150NB"

A conventional ERP may treat these as different descriptions unless users manually map them.

RAJIV BUSINESS OS must identify that these descriptions can refer to the same canonical Master Item when the technical attributes support the match.

The objective is:

ONE CANONICAL ITEM IDENTITY

while preserving:

- Original description
- Vendor description
- Document description
- Specification
- Size
- UOM
- Make
- Model
- Other identity attributes
- Source document
- Source line

AI should identify and recommend the canonical item.

The canonical Master Item remains the source of truth.

============================================================
3. MASTER BOQ IS THE CENTRAL BUSINESS OBJECT
============================================================

The project structure should conceptually be:

WORK / PROJECT
    ↓
MASTER BOQ
    ↓
MASTER BOQ LINES
    ↓
MASTER ITEMS
    ↓
TRANSACTIONS

A Master BOQ line should eventually contain structured information such as:

- Project / Work
- BOQ line number
- Original description
- Normalized description
- Master Item ID
- Specification
- Size
- UOM
- Required quantity
- Make / Model where applicable
- Remarks
- Source document
- Source page / line where available
- Identification confidence
- Human verification status

The original source description MUST NOT be lost.

AI normalization must not destroy source information.

============================================================
4. MASTER BOQ CREATION WORKFLOW
============================================================

Real-world starting point:

The quotation/pre-sales team receives or prepares the final BOQ.

They also receive the final:

- BOQ
- PO
- WO
- supporting project documents

These documents are already stored against the Work/Project in RAJIV BUSINESS OS.

The system should use AI to read the final BOQ.

Example:

FINAL BOQ PDF
    ↓
Document ingestion
    ↓
Text/table extraction
    ↓
BOQ line extraction
    ↓
Normalization
    ↓
Master Item identification
    ↓
Duplicate/identity checks
    ↓
Confidence calculation
    ↓
Human verification
    ↓
MASTER BOQ

The Master BOQ becomes reusable for all future project transactions.

============================================================
5. MASTER ITEM IDENTIFICATION
============================================================

Master Item identification is one of the most important AI capabilities.

The system should NOT depend only on semantic AI.

Use multiple layers:

1. Exact matching
2. Existing alias matching
3. Normalized text matching
4. Specification matching
5. Size matching
6. UOM matching
7. Make/model matching where relevant
8. Context matching
9. Deterministic business rules
10. AI semantic matching
11. Confidence scoring
12. Human verification
13. Feedback/learning

Conceptually:

DOCUMENT ITEM
    ↓
NORMALIZATION
    ↓
EXACT / ALIAS MATCH
    ↓
SPECIFICATION / ATTRIBUTE MATCH
    ↓
CANDIDATE GENERATION
    ↓
AI SEMANTIC MATCH
    ↓
CONFIDENCE
    ↓
HUMAN VERIFICATION
    ↓
MASTER ITEM ID

AI must NOT blindly create a new inventory item whenever it sees an unfamiliar description.

It must first determine whether an existing Master Item is applicable.

============================================================
6. MULTI-AI ARCHITECTURE
============================================================

CRITICAL ARCHITECTURAL RULE:

Gemini is the CURRENT AI provider.

Gemini is NOT the permanent AI architecture.

The application must NOT become dependent on a single AI provider.

Current:
- Gemini API is being used through the user's API key.

Future:
- Multiple AI providers may be used.
- Different AI models may be selected for different workflows.
- Providers may be added, replaced or combined.

Potential future providers may include:
- Gemini
- OpenAI
- Anthropic/Claude
- Local/self-hosted models
- OCR/document AI providers
- Specialized extraction/classification models
- Future providers

Do not hard-code business logic directly to Gemini.

Use a provider abstraction / AI orchestration layer.

Conceptually:

BUSINESS WORKFLOW
       ↓
AI ORCHESTRATOR
       ↓
┌──────────────┬──────────────┬──────────────┐
│ Gemini       │ OpenAI       │ Other AI     │
│ Provider     │ Provider     │ Provider     │
└──────────────┴──────────────┴──────────────┘
       ↓
Normalized AI Result
       ↓
Deterministic Business Logic
       ↓
Human Verification
       ↓
Database Transaction

The business layer must not care whether Gemini, OpenAI, Claude or another model produced the recommendation.

The provider should return a normalized structured contract.

============================================================
7. AI IS NOT THE SOURCE OF TRUTH
============================================================

This is a permanent architectural rule.

AI is:

- Identification
- Extraction
- Recommendation
- Classification
- Matching
- Draft preparation
- Anomaly detection
- Reconciliation assistance

AI is NOT:

- Final inventory authority
- Final accounting authority
- Final stock authority
- Final transaction authority
- Final tax authority

The source of truth remains the deterministic application/database model.

Correct pattern:

AI
 ↓
Recommendation / Draft
 ↓
Human verification
 ↓
Deterministic transaction
 ↓
Database

Never allow an AI hallucination to directly corrupt:

- Inventory
- Accounts
- Stock
- Purchase
- Sales
- Tax
- Financial records

============================================================
8. PURCHASE WORKFLOW
============================================================

Purchase team should use the Master BOQ.

Example:

MASTER BOQ

Required:
1,250 M

Already ordered:
1,050 M

Remaining:
200 M

Purchase team selects:

Vendor
Master Item
Required quantity

System prepares:

PURCHASE ORDER

The system should prevent accidental duplicate/over-ordering.

Example:

Required quantity = 1,250 M
Already PO = 1,050 M
Available PO balance = 200 M

If user tries to create PO for 500 M:

System should warn:

Requested quantity exceeds current Master BOQ balance.

Human may have permission to override according to business rules, but the system must make the situation visible and auditable.

============================================================
9. PURCHASE DOCUMENT AI
============================================================

Vendor invoices may arrive as:

- PDF
- JPG
- PNG
- Scanned document
- Other supported document formats

AI should extract:

Vendor:
- Vendor name
- GSTIN
- Address
- Contact information where available

Invoice:
- Invoice number
- Invoice date
- PO number where available
- DC number where available
- Taxable amount
- CGST
- SGST
- IGST
- Other taxes
- Grand total

Invoice lines:
- Vendor description
- Quantity
- UOM
- Rate
- Discount
- Tax
- Amount
- Other available attributes

Then:

VENDOR DESCRIPTION
    ↓
MASTER ITEM IDENTIFICATION
    ↓
MASTER BOQ MATCH
    ↓
PO MATCH
    ↓
QUANTITY / RATE / TAX VALIDATION
    ↓
DRAFT PURCHASE BILL
    ↓
HUMAN VERIFICATION
    ↓
SUBMIT

The system should not require users to manually re-enter the complete vendor invoice.

============================================================
10. NEW VENDOR AI WORKFLOW
============================================================

If AI identifies a vendor that does not exist:

NEW VENDOR DETECTED

AI should extract:

- Vendor name
- GSTIN
- Address
- Other available vendor information

The system prepares a vendor creation draft.

Human verifies.

Then the vendor can be used for:

- Purchase Order
- Purchase Bill
- Vendor history
- Pricing history
- Other purchasing workflows

Never silently create critical master data from AI without appropriate verification.

============================================================
11. SALES WORKFLOW
============================================================

Sales team should also use the Master BOQ.

The Master BOQ should be usable to prepare:

- Sales Order
- Proforma Invoice
- Tax Invoice
- Delivery Challan

The user should not repeatedly type the same item information.

Conceptually:

MASTER BOQ
    ↓
SALES ORDER
    ↓
PROFORMA
    ↓
TAX INVOICE
    ↓
DELIVERY CHALLAN

All lines should retain the canonical Master Item identity.

============================================================
12. INVENTORY WORKFLOW
============================================================

The Master Item ID is critical for inventory integrity.

Material lifecycle:

MASTER BOQ
    ↓
PURCHASE ORDER
    ↓
PURCHASE BILL
    ↓
GRN
    ↓
INVENTORY
    ↓
ISSUE
    ↓
CONSUMPTION
    ↓
RETURN / TRANSFER / SALE

Every stage should reference the canonical inventory/master item.

This allows the system to answer:

- How much was required?
- How much was ordered?
- How much was billed?
- How much was received?
- How much is available?
- How much was issued?
- How much was consumed?
- How much was returned?
- How much remains?
- How much was sold?

============================================================
13. MATERIAL RECONCILIATION
============================================================

The system should automatically reconcile:

BOQ vs PO

PO vs Purchase Bill

Purchase Bill vs GRN

GRN vs Inventory

Inventory vs Issue

BOQ vs final project requirement

Example:

Required:
1,250 M

PO:
1,050 M

Vendor Bill:
900 M

GRN:
850 M

Issued:
500 M

Available:
350 M

The system should identify differences and exceptions.

Examples:

- Under-ordering
- Over-ordering
- Duplicate PO
- Duplicate vendor bill
- Bill quantity different from PO
- GRN quantity different from bill
- Wrong Master Item
- UOM mismatch
- Rate mismatch
- Tax mismatch
- Unexpected material
- Missing material

============================================================
14. ACCOUNTING INTELLIGENCE
============================================================

AI can assist accounting workflows, but accounting must remain deterministic.

AI can:

- Read documents
- Identify transaction type
- Identify vendor/customer
- Identify item
- Suggest accounts
- Suggest tax classification
- Prepare drafts
- Identify discrepancies
- Reconcile documents

But:

AI recommendation
    ↓
Human verification
    ↓
Deterministic accounting transaction

The database/accounting engine remains authoritative.

============================================================
15. COMPLETE MATERIAL TRACEABILITY
============================================================

Every material should eventually be traceable across the entire business lifecycle.

Example:

WORK
 ↓
MASTER BOQ
 ↓
MASTER BOQ LINE
 ↓
MASTER ITEM
 ↓
PURCHASE ORDER
 ↓
VENDOR
 ↓
PURCHASE BILL
 ↓
GRN
 ↓
INVENTORY MOVEMENT
 ↓
ISSUE
 ↓
CONSUMPTION
 ↓
SALES / RETURN / OTHER MOVEMENT

This traceability is a major product objective.

============================================================
16. CURRENT SYSTEM FOUNDATION
============================================================

The current RAJIV BUSINESS OS already contains important foundations.

Known canonical item-related tables/relationships include:

inventory_items

inventory_item_aliases

inventory_item_match_feedback

purchase_order_items.inventory_item_id

purchase_bill_items.inventory_item_id

sales_order_items.inventory_item_id

goods_received_note_items.inventory_item_id

Existing MEP intelligence foundations include:

mep_item_match_candidates

mep_item_specifications

mep_normalization_rules

mep_ai_corrections

mep_document_extractions

mep_extraction_lines

Other MEP knowledge foundations include:

mep_attribute_definitions
mep_item_categories
mep_units
mep_domains
mep_document_examples

These existing foundations must be reused where appropriate.

Do NOT create duplicate parallel systems unnecessarily.

============================================================
17. CURRENT AI / MEP STATUS
============================================================

At the current architecture checkpoint:

inventory_items = 0

inventory_item_aliases = 0

inventory_item_match_feedback = 0

mep_item_match_candidates = 0

mep_item_specifications = 0

mep_normalization_rules = 0

mep_ai_corrections = 0

mep_document_extractions = 0

mep_extraction_lines = 0

Knowledge/foundation data already exists for:

mep_attribute_definitions = 15
mep_item_categories = 31
mep_units = 11
mep_domains = 8
mep_document_examples = 5

Five authoritative MEP documents are registered:

1. Dr. Reddy's FTO-12 Fire Hydrant & Sprinkler Supply PO
   Document No: 4100135680

2. Dr. Reddy's FTO-12 Fire Hydrant Erection Work Order
   Document No: 4400254121

3. ADRIN Internal & External Fire Fighting Tender BOQ
   Document No: ADRIN/CMD/C-02/03/26-27

4. Microlabs Greenfield Fire Pump Room & Piping BOQ

5. Matrix Pharma U9 Design Basis Report

These documents are intended to become real-world validation inputs for the MEP intelligence architecture.

============================================================
18. WHAT HAS ALREADY BEEN COMPLETED
============================================================

PHASE 4A IS COMPLETE.

Do NOT reopen Phase 4A unless explicitly requested.

The R2 upload/preview problem was a separate infrastructure issue and has been resolved.

Current backend Edge Function status at the architecture checkpoint:

business-file-storage v19
company-document-storage v5
mep-document-ingestion v1
mep-extraction-worker v1

Important:
R2 upload/preview is a separate infrastructure track.
It must NOT be mixed into the Master BOQ / AI roadmap.

The current repository also contains the MEP extraction architecture including:

src/lib/mep/extraction/mepExtractionWorker.js
src/lib/mep/extraction/constants.js
src/lib/mep/extraction/dryRunProvider.js
src/lib/mep/extraction/providerContract.js
src/lib/mep/extraction/extractionEnvelope.js
src/lib/mep/extraction/documentStrategyRouter.js
src/lib/mepExtractionService.js
src/components/mep/MepDocumentIngestionWorkspace.jsx
src/components/mep/MepKnowledgeWorkspace.jsx
supabase/functions/mep-extraction-worker/index.ts

============================================================
19. CURRENT GIT / PROJECT CHECKPOINT
============================================================

Repository:

rajivt123/Business-OS

Main branch latest verified frontend commit:

59a5c65eac5383184897c7bf32defa149135a755

Commit:
fix: prevent work save error object render crash

Important architectural note:

Some backend Edge Function changes were deployed directly to Supabase and are not necessarily represented in the latest GitHub frontend commit.

Do not assume GitHub contains every live Supabase backend change.

Always inspect the actual live backend/database before making claims about current backend state.

============================================================
20. WHAT IS LEFT TO BUILD
============================================================

The main unfinished product work is NOT R2.

The main unfinished work is the intelligent Master BOQ workflow.

NEXT MAJOR WORK:

AI-1
MASTER BOQ INTELLIGENCE

Steps:

1. Define final Master BOQ data model.
2. Define Master BOQ line lifecycle.
3. Define canonical Master Item contract.
4. Build document ingestion flow.
5. Extract BOQ lines.
6. Normalize descriptions.
7. Generate deterministic candidates.
8. Match existing Master Items.
9. AI semantic matching.
10. Confidence scoring.
11. Human verification.
12. Create/update Master BOQ.
13. Store aliases.
14. Store corrections/feedback.
15. Validate against real MEP documents.

============================================================
21. FUTURE PHASES
============================================================

AI-1
Master BOQ Intelligence

AI-2
Master Item Identification Engine

AI-3
Purchase Intelligence

AI-4
Vendor Invoice / Purchase Bill Intelligence

AI-5
GRN + Inventory Intelligence

AI-6
Sales Intelligence

AI-7
Reconciliation Intelligence

AI-8
Accounting Intelligence

AI-9
Audit / Exception Intelligence

AI-10
Multi-tenant AI Safety and Isolation

AI-11
Multi-provider AI Orchestration

AI-12
AI Evaluation / Feedback / Continuous Improvement

These phases may overlap during implementation, but the Master BOQ and Master Item identity must remain foundational.

============================================================
22. MULTI-TENANT AI SAFETY
============================================================

AI must never cross tenant/company/project boundaries.

AI retrieval and matching must respect:

tenant
company
work/project
permissions
data ownership

A Master Item from Company A must not accidentally become a recommendation for Company B unless the architecture explicitly supports shared/global master data and the user has permission.

AI context must be tenant-safe.

============================================================
23. HUMAN-IN-THE-LOOP RULE
============================================================

Human verification is mandatory for important operations.

AI can prepare:

- Master BOQ draft
- Master Item recommendation
- Vendor draft
- Purchase Bill draft
- Sales document draft
- Reconciliation exception
- Accounting recommendation

Human verifies.

Then the deterministic system commits the transaction.

Never make AI silently execute critical financial/inventory transactions.

============================================================
24. AI PROVIDER ABSTRACTION
============================================================

Do not build:

Gemini-specific business logic.

Build:

AI provider interface.

Conceptually:

extractDocument()
identifyItem()
normalizeDescription()
classifyDocument()
matchCandidates()
analyzeInvoice()
reconcileDocuments()

The workflow calls the capability.

The provider implementation can be:

GeminiProvider
OpenAIProvider
ClaudeProvider
LocalModelProvider
OCRProvider
etc.

The business workflow should not need to know which provider is being used.

Future routing can be based on:

- Cost
- Accuracy
- Document type
- Language
- Image capability
- Context window
- Speed
- Availability
- Privacy
- Tenant configuration
- Task complexity

============================================================
25. IMPORTANT PRODUCT PRINCIPLE
============================================================

DO NOT BUILD AI FOR THE SAKE OF SAYING "AI ERP".

Every AI capability must solve a real business problem.

Examples:

BAD:

"AI chatbot inside ERP"

GOOD:

"Upload vendor invoice and prepare Purchase Bill automatically."

GOOD:

"Read final BOQ and create Master BOQ."

GOOD:

"Understand vendor-specific descriptions and map them to the same Master Item."

GOOD:

"Prevent duplicate purchase orders against the same project requirement."

GOOD:

"Automatically reconcile BOQ → PO → Bill → GRN → Inventory."

GOOD:

"Show exactly how much material is required, ordered, received, available, issued and remaining."

The product differentiation comes from solving these real-world workflows.

============================================================
26. MASTER ARCHITECTURE
============================================================

Final conceptual architecture:

                    REAL BUSINESS DOCUMENTS
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
         BOQ                 PO              Vendor Bill
          │                  │                  │
          └──────────────────┼──────────────────┘
                             ↓
                  AI DOCUMENT UNDERSTANDING
                             ↓
                    NORMALIZATION ENGINE
                             ↓
                MASTER ITEM IDENTIFICATION
                             ↓
                   CONFIDENCE + REVIEW
                             ↓
                       MASTER BOQ
                             │
                             ↓
                    CANONICAL MASTER ITEM
                             │
            ┌────────────────┼────────────────┐
            ↓                ↓                ↓
        PURCHASE           SALES          INVENTORY
            │                │                │
            └────────────────┼────────────────┘
                             ↓
                     RECONCILIATION
                             ↓
                      ACCOUNTING
                             ↓
                         AUDIT

AI PROVIDERS sit underneath the AI orchestration layer:

                    AI ORCHESTRATOR
                           │
          ┌────────────────┼────────────────┐
          ↓                ↓                ↓
       Gemini           OpenAI          Future AI
                           │
                     Normalized Output
                           ↓
                 Deterministic Business Logic
                           ↓
                   Human Verification
                           ↓
                       Transaction

============================================================
27. WHAT NOT TO DO
============================================================

Do NOT:

- Make Gemini the permanent architecture.
- Hard-code Gemini into business workflows.
- Allow AI to directly mutate financial records.
- Create duplicate inventory items because descriptions differ.
- Treat vendor descriptions as canonical item identities.
- Re-enter BOQ information manually at every stage.
- Build separate item identities for Purchase and Sales.
- Mix R2 infrastructure work into the AI roadmap.
- Replace the existing architecture plan with this document.
- Create unnecessary duplicate database systems.
- Treat AI confidence as absolute truth.

============================================================
28. FUTURE CHATGPT / AI INSTRUCTION
============================================================

When this document is provided in a future AI session:

1. Read this entire document before proposing architecture changes.
2. Understand that Master BOQ is the central business object.
3. Understand that Master Item identity is canonical.
4. Understand that Gemini is only the current AI provider.
5. Preserve multi-AI provider capability.
6. Understand that AI is recommendation/intelligence, not the source of truth.
7. Preserve human verification for important transactions.
8. Do not mix R2 infrastructure issues with the AI roadmap.
9. Inspect the current GitHub and Supabase state before claiming implementation status.
10. Continue from the "WHAT IS LEFT TO BUILD" section instead of redesigning the product from zero.

============================================================
29. ONE-SENTENCE PRODUCT MEMORY
============================================================

RAJIV BUSINESS OS uses the final project BOQ to create a canonical Master BOQ and Master Item identity, then uses provider-independent AI to understand real-world documents and prepare, match and reconcile Purchase, Sales, Inventory and Accounting workflows while keeping deterministic data and human verification as the source of truth.

============================================================
END OF DOCUMENT
============================================================
