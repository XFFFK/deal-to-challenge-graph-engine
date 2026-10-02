# Architecture

```mermaid
flowchart LR
  A[Four JSON source packages] --> B[Normalizer + source ID collector]
  B --> C[Canonical execution model]
  C --> D[Maturity and blocker gate]
  D --> E[Mock AI orchestration + deterministic classifier]
  E --> F[Grounded execution nodes]
  F --> G[DAG + dependency validation]
  G --> H[Wave / critical path view]
  F --> I[Model-specific package generator]
  F --> J[Inspector + user edits]
  J --> K[Change-impact engine]
  K --> G
  K --> I
  G --> L[Quality gate]
  I --> M[Graph JSON + human plan export]
  L --> M
```

The browser prototype is intentionally dependency-free and runs in mock mode. `app.js` keeps the imported package in `sourcePackage`, normalizes IDs into `sourceIds`, derives an execution graph, validates and edits dependencies, computes change impact, generates a model-specific execution package for every node, and exports both graph JSON and a human-readable plan with provenance. No network call, account login, paid model, recruitment action, or challenge submission is performed by the prototype.

The production handoff would replace the normalizer input adapter with the four official challenge packages, preserve the same graph schema, and add a backend for persistent package storage and authenticated export. The current mock keeps the behavior reviewable offline while still exercising the required user flow.
