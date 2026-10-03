# Submission checklist

## Before registration opens

- [ ] Public demo: https://xfffk.github.io/deal-to-challenge-graph-engine/
- [ ] Source repository: https://github.com/XFFFK/deal-to-challenge-graph-engine
- [ ] Latest package release: https://github.com/XFFFK/deal-to-challenge-graph-engine/releases/tag/v0.2.2
- [ ] Create or verify one personal Topcoder account with accurate profile information.
- [ ] Keep the account email available for payment setup; do not share passwords or verification codes.
- [ ] Open the challenge page and confirm the four official JSON packages and final deliverable instructions after registration.

## After the challenge opens

- [ ] Register for **Deal-to-Challenge Graph Engine**.
- [ ] Replace the built-in mock inputs with the four official JSON packages.
- [ ] Run `node .\\validate-official-packages.cjs <official-package-directory>` before importing them.
- [ ] Run the import, maturity/blocker, three-model, DAG, dependency-edit, change-impact, quality-gate, override, and export flows.
- [ ] Record a short screen demo showing the above flow and the exported JSON.
- [ ] Use `DEMO_SCRIPT.md` to keep the English recording under three minutes.
- [ ] Review README, architecture diagram, tests, and the exported sample output.

The repository already contains `samples/` mock fixtures, `sample-outputs/` graph JSON and human-readable plans for all four scenarios, `SOURCE_MAPPING.md`, and `qa-smoke.cjs`. Replace only the mock fixtures with the official challenge files once Topcoder makes them available.

## Final submission

- [ ] Zip the runnable app and supporting files.
- [ ] Personally review and click Topcoder's final Submit control before the deadline.

The assistant can prepare and validate the package, but the account holder must complete registration, any agreement acceptance, and final submission from their own account.
