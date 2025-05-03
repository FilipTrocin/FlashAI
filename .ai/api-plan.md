---
description: 
globs: 
alwaysApply: false
---


# REST API Plan

## 1. Resources
| Resource name | Backing table                   | Description                                                           |
| ------------- | ------------------------------- | --------------------------------------------------------------------- |
| User Profile  | users                           | Current user’s profile (read/update only for self)                    |
| Flashcard     | flashcards                      | Individual learning card                                              |
| Review        | flashcards                      | Flashcards selected by spaced‑repetition algorithm (virtual resource) |
| AI Metrics    | ai_metrics                      | Per‑user counters of generated / accepted cards                       |

## 2. Endpoints

---

### 2.2 User Profile
| Method | Path      | Description                                                                    |
| ------ | --------- | ------------------------------------------------------------------------------ |
| GET    | /users/me | Return own profile                                                             |
| PATCH  | /users/me | Update own profile (currently only last_login_at via system, so sparsely used) |

Response example  
```json
{ "id":"<uuid>","email":"john@example.com","created_at":"…","last_login_at":"…" }
```

---

### 2.3 Flashcards

| Method | Path                          | Description                              |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | /flashcards                   | List (pagination, filters)               |
| POST   | /flashcards/generate/manual   | Create manual card                       |
| POST   | /flashcards/generate/ai       | Generate cards via AI                    |
| GET    | /flashcards/{id}              | Retrieve single card                     |
| PATCH  | /flashcards/{id}              | Update question/answer/difficulty        |
| DELETE | /flashcards?ids={id1,id2,...} | Delete one or multiple flashcards        |
| POST   | /flashcards/{id}/accept       | Mark AI card as accepted (ai_status = 0) |
| POST   | /flashcards/{id}/reject       | Mark AI card as rejected (ai_status = 2) |

#### 2.3.1 GET /flashcards
Query parameters  
- limit (default 20, max 100)  
- offset (default 0)  
- search – full‑text over question/answer  
- ai_generated=true/false  
- ai_status=0|1|2|null  
- difficulty=1…5|0  
- due=true → only cards with next_review_at ≤ now()  
- sort=created_at|next_review_at (default created_at)  
- order=asc|desc (default desc)
- ids – a comma-separated list of flashcard IDs; if provided, return only flashcards with these IDs (overrides other listing filters if specified)

Success `200 OK`  
```json
{
  "data":[
    {
      "id":"…",
      "question":"…",
      "answer":"…",
      "difficulty":3,
      "ai_generated":true,
      "ai_status":null,
      "next_review_at":"2024‑05‑10T11:00:00Z",
      "created_at":"…",
      "updated_at":"…"
    }
  ],
  "pagination":{"limit":20,"offset":0,"total":148}
}
```

#### 2.3.2 POST /flashcards/generate/manual
Manual create  
```json
{
  "question":"What is photosynthesis?",
  "answer":"Photosynthesis is the process by which green plants …",
  "difficulty":1           // optional, default 0 (unreviewed)
}
```  
Validation  
• question 4‑50 words 
• answer 4‑200 words 
• difficulty 0 or 1‑5  

Success `201 Created` → returns card JSON.

#### 2.3.3 POST /flashcards/generate/ai
Generate via AI  
```json
{
  "source_text":"<user supplied text>",
  "desired_count":10             // optional
}
```  
Flow  
1. Server calls Openrouter.ai, receives Q/A pairs.  
2. Each pair inserted into flashcards with `ai_generated=true`, `ai_status=null`.  
3. Update `ai_metrics.generated_cnt`.  

Success `201 Created`  
```json
{ "generated":[ { "id":"…","question":"…","answer":"…" }, … ] }
```  
Errors  
422 Text too short • 429 AI quota exceeded • 500 Upstream AI failure

#### 2.3.4 PATCH /flashcards/{id}
```json
{
  "question": "Updated question?",
  "answer": "Updated answer details.",
  "difficulty": 4
}
```  
If the card is AI‑generated and fields are changed, server sets `ai_status=1` (edited).  

Success `200 OK` → updated card.

#### 2.3.5 DELETE /flashcards?ids={id1,id2,...}
Supports deletion of one or more flashcards in a single request using a comma-separated list of flashcard IDs. Example Request: `DELETE /flashcards?ids=abc123,def456,ghi789` 
```json
{
  "deleted_ids": ["abc123", "def456", "ghi789"],
  "message": "Flashcards deleted successfully."
}
```

Success `(200 OK)`
`404` if any provided ID is not found

#### 2.3.6 POST /flashcards/{id}/accept
No body. Preconditions: card.ai_generated=true & ai_status IS NULL.  
Sets ai_status=0; increments ai_metrics.accepted_cnt.  

`200 OK` → `{ "id":"…","ai_status":0 }`  

Errors: 
- `409 Already reviewed`
- `404 Not found/forbidden`

#### 2.3.7 POST /flashcards/{id}/reject
Same pattern as in ` POST /flashcards/{id}/accept`; sets ai_status=2.

---

### 2.5 AI Metrics

| Method | Path | Description |
|--------|------|-------------|
| GET | /ai/metrics | Return generated_cnt, accepted_cnt, acceptance_rate |

Response  
```json
{
  "generated_cnt":120,
  "accepted_cnt":95,
  "acceptance_rate":79.17
}
```

## 3. Authentication & Authorisation
• JWT issued by Supabase on `/auth/signin` or `/auth/signup`  
• Each request must carry `Authorization: Bearer <jwt>`  
• RLS policies (`auth.uid() = user_id`) enforce row‑level access; API additionally verifies ownership before mutating a card.  
• Rate limiting (e.g., 60 req/min/user) applied at load balancer.  
• Password quality, hashing and brute‑force lockout configured in Supabase.

## 4. Validation & Business Logic

### 4.1 Validation Rules
| Field | Rule (enforced in API & DB) |
|-------|-----------------------------|
| users.email | Regex `^[^@]+@[^@]+\.[^@]+$`; unique |
| flashcards.question | 4‑50 words |
| flashcards.answer | 4‑200 words |
| flashcards.difficulty | 0, or 1‑5 inclusive |
| flashcards.ai_status | null or 0‑2 |
| password_resets.token | unique, expires_at in future |

### 4.2 Business Logic Implementation
1. AI generation inserts cards with `ai_generated=true`, `ai_status=null`; triggers increment `ai_metrics.generated_cnt`.  
2. Accept / reject endpoints set ai_status and update counters.  
3. PATCH causing edits sets `ai_status=1` automatically.  
4. Review grade endpoint applies simplified SM‑2: maps grade to interval, updates difficulty & next_review_at.  
5. Metrics endpoint computes acceptance_rate on the fly: `(accepted_cnt / generated_cnt) * 100`.  
6. RLS + explicit `user_id = auth.uid()` checks guarantee user isolation.  
7. Index `flashcards_next_review_idx` powers /reviews/next query; others power filters.

---

_Assumptions_:  
• Supabase auth endpoints are proxied but mostly handled client‑side; minimal duplication here. 
• AI call costs & rate limits enforced via env var budgets; 429 returned when quota hit.  
• Review algorithm kept simple for MVP (intervals: hard → +1 day, medium → +3 days, easy → +7 days).  
• All timestamps ISO‑8601 UTC.