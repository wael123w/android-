# AI Pipeline & Requirement Analyzer

AppForge AI employs a deterministic multi-stage synthesis pipeline:

1. **Requirement Analysis:** Natural language input is parsed by Gemini 3.8 Flash into a normalized `app-spec.json`.
2. **Schema Synthesis:** Automatic entity relational derivation generates third normal form (3NF) relational tables with appropriate data types and index keys.
3. **API Contract Generation:** REST endpoints are aligned with user permission tiers (Admin, Moderator, Customer).
4. **Dart / Flutter Generation:** Native widgets, state controllers, and network models are produced matching the spec.
5. **Auto Error Repair:** Build output logs are fed into the AI error analyzer. Identified faults are repaired in-place and re-compiled up to 5 attempts automatically.
