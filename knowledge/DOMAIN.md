# Domain Model

## Core Entities

### CandidateProfile
Root aggregate. Owns all candidate data. Contains `PersonalInfo`, collections of WorkExperience, ProjectEntry, Skill, EducationEntry, Certification, and SourceDocument. Maps 1:1 to a User.

### CandidateFact
Atomic unit of truth about a candidate's career. Has `claim` (statement), `context` (surrounding text), `confidence` (0-1), `status` (USER_PROVIDED | EXTRACTED | VERIFIED | NEEDS_REVIEW | REJECTED), and `category` (WORK | SKILL | PROJECT | EDUCATION | CERTIFICATION | ACHIEVEMENT). Immutable provenance via FactProvenance.

### FactProvenance
1:1 with CandidateFact. Records `extractionMethod` (PDF_PARSER | DOCX_PARSER | OCR | USER_INPUT), `humanVerified` flag, and `confidenceAtExtraction`. Write-once.

### SourceDocument
Uploaded PDF/DOCX. Status lifecycle: PENDING_PROCESSING → PROCESSED | FAILED. Stores checksum for deduplication.

### Job
Job description entered by user. Contains raw text, title, company. Source can be TEXT_INPUT | JOB_URL | API_IMPORT.

### JobRequirement
Extracted from Job. Has `type` (HARD | SOFT | NICE_TO_HAVE), `weight` (0-1), and `matchedFactIds` linking to CandidateFacts that satisfy it.

### ResumeVersion
Generated resume. Contains `structuredData` (JSON with sections/items), references `templateId`, `jobId`, and `generationRunId`. Status lifecycle: DRAFT → GENERATED → FINALIZED → ARCHIVED.

### GenerationRun
Tracks all AI decisions. Contains `stages` array of `GenerationStageLog` with model version, prompt version, token usage, and cost.

## Source-of-Truth Rules
1. **CandidateProfile is primary source** — all facts derive from it
2. **Fact provenance is immutable** — modifications create new provenance entry
3. **Every ResumeItem claims must reference CandidateFact** via `sourceFactIds`
4. **GenerationRun tracks all AI decisions** — model/prompt version, token usage, cost
5. **JobRequirement evidence linking** — `matchedFactIds` shows coverage; absence means gap

## Fact Status Transitions
```
USER_PROVIDED → VERIFIED
EXTRACTED → NEEDS_REVIEW → VERIFIED | REJECTED
REJECTED → NEEDS_REVIEW (only after user review)
```

## Resume Version Lifecycle
```
DRAFT → GENERATED → FINALIZED → ARCHIVED
```
DRAFT can be edited. GENERATED is immutable. FINALIZED is locked and PDF-stored. ARCHIVED is soft-delete.
