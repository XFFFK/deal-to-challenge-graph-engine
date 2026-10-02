# Source-to-canonical mapping

The prototype keeps the imported JSON object unchanged in `sourcePackage` and derives a separate canonical execution graph. The adapter is deliberately tolerant of the four Topcoder workspace-export shapes, including nested `id`/`*Id` references.

| Imported section or signal | Canonical field | Rule | Provenance |
| --- | --- | --- | --- |
| `id`, `dealId`, `*Id` values anywhere in the package | `node.sourceIds`, `edge.sourceIds` | Collect string or numeric identifiers shorter than 100 characters, coerce them to strings, deduplicate in encounter order, and preserve their value. | Imported |
| `name` or `title` at the root or under `deal`/`metadata` | `deal.title` / package title | Prefer the first non-empty title-like value, then the file name. | Imported |
| `requirements`, `capabilities`, `workstreams`, `architecture`, `integrations`, `aiUseCases` | `scope`, `functionalScope`, `architecture`, `strategy` | Retain the original package in `sourcePackage`; normalized nodes point back with `sourceIds`. | Imported / normalized |
| `gaps`, `questions`, `risks`, `assumptions`, quality findings | `maturity.blockers` and review-required nodes | Missing or unresolved information lowers readiness and remains visible as a blocker; the mock never invents a contract. | Imported / deterministic |
| delivery estimates or phase durations | node `duration` and `effort` | Use a numeric duration when present; the mock fixtures use person-days. | Imported / deterministic |
| dependency references | node `deps`, exported edge `source`/`target` | Preserve valid IDs; invalid, duplicate, self, and cyclic references are reported by the quality gate. | Imported / user-reviewed |
| operating-model recommendation | `operatingModel.primary`, `alternatives`, `rationale` | Exactly one primary model is stored per executable node. Overrides are appended to `overrideHistory` and marked `User-approved override`. | AI-recommended / user-approved |
| node scope, acceptance, skills, and access context | model-specific `executionPackage` | Generate the smallest model-appropriate package: Flexible Talent, Challenge, or Private Pod. | AI-recommended / deterministic template |

## Ignored or non-executable content

Unknown descriptive keys, UI layout metadata, timestamps, attachments that do not contain identifiers, and provider-specific fields are left in `sourcePackage` for auditability but do not become executable nodes. They are never silently treated as requirements. If a package has no recognizable executable structure, the importer creates review-required fallback nodes and a blocker.

## Compatibility assumptions

- The browser app accepts JSON files directly; no conversion step is required.
- In mock mode the four built-in scenarios stand in for the official sanitized packages until the challenge repository is available.
- Identifier collection is case-preserving but duplicate-insensitive.
- The original JSON is exported alongside the normalized graph, so a reviewer can inspect both layers.
- Model packages and human-readable plans are generated locally without network calls or a paid AI service.
