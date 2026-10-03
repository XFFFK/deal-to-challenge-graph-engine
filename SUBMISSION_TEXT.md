# Deal-to-Challenge Graph Engine

## Submission summary

Deal-to-Challenge Graph Engine turns a reviewed deal-scoping package into an execution-ready, source-traceable DAG. It preserves imported IDs, surfaces maturity and blockers, decomposes work into meaningful delivery nodes, recommends one of Topcoder's three operating models, and produces model-specific execution packages.

The browser workflow supports:

- four supplied package shapes through a shared normalization layer;
- Flexible Talent, Challenge, and Private Pod classifications with rationales and confidence;
- node editing, addition, removal, split, and merge controls with user-decision provenance;
- dependency editing with cycle rejection, execution waves, and critical-path analysis;
- change-impact analysis when a node, model, or dependency changes;
- deterministic quality gates for coverage, references, readiness, duplicates, orphans, cycles, and critical path;
- graph JSON and human-readable execution-plan exports.

## Demo and local run

Live demo: <https://xfffk.github.io/deal-to-challenge-graph-engine/>

The repository runs without a build step or paid AI service:

```powershell
python -m http.server 4173
node .\qa-smoke.cjs
```

The built-in fixtures are sanitized mock inputs. The importer is ready for the four official packages once Topcoder publishes them.

## Design decision

The prototype labels recommendations as deterministic mock recommendations and preserves provenance. It does not claim that a model generated facts, and it does not automatically recruit talent, launch challenges, approve funding, or submit work to Topcoder.

## Validation

`qa-smoke.cjs` covers normalization fallbacks, numeric and nested source IDs, mixed operating models, cycle rejection, impact propagation, quality-gate states, and export shape. The test is dependency-free and runs offline.
