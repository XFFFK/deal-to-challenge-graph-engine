const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const appPath = __dirname + "/app.js";
const ids = [
  "readinessLabel", "readinessScore", "maturityBadge", "maturityTitle", "maturityDescription",
  "meterFill", "sourceCount", "nodeCount", "nodeReadyText", "blockerCount", "waveCount",
  "validationResult", "blockerList", "modelBreakdown", "graphCanvas", "criticalPathText",
  "nodeList", "inspectorTitle", "provenanceBadge", "inspectorEmpty", "inspectorBody",
  "inspectorModel", "inspectorReady", "inspectorObjective", "inspectorRationale", "inspectorSources",
  "inspectorAcceptance", "overrideModel", "impactNote", "qualityChecks", "qualityGateBadge",
  "executionPackage", "dependencyList", "dependencySelect", "addDependencyBtn", "exportPlanBtn",
  "sampleSelect", "loadSampleBtn", "jsonFile", "importStatus", "modelFilter", "runQualityBtn",
  "applyOverrideBtn", "exportBtn", "addNodeBtn", "saveNodeBtn", "removeNodeBtn", "splitNodeBtn",
  "mergeNodeSelect", "mergeNodeBtn", "editTitle", "editDuration", "editObjective", "editAcceptance",
  "jsonPaste", "loadPasteBtn"
];

function makeElement(id) {
  const listeners = {};
  return {
    id, value: id === "sampleSelect" ? "clinical" : "all", textContent: "", innerHTML: "",
    className: "", style: {}, listeners,
    classList: { add() {}, remove() {} },
    addEventListener(type, fn) { listeners[type] = fn; },
    querySelectorAll() { return []; }
  };
}

const elements = new Map(ids.map(id => [id, makeElement(id)]));
const anchors = [];
const document = {
  getElementById(id) { if (!elements.has(id)) elements.set(id, makeElement(id)); return elements.get(id); },
  createElement(tag) {
    const anchor = { tagName: tag, href: "", download: "", click() { anchor.clicked = true; } };
    anchors.push(anchor);
    return anchor;
  }
};

class CaptureBlob {
  constructor(parts, options) { this.data = parts.join(""); this.type = options?.type; CaptureBlob.last = this; }
  async text() { return this.data; }
}
const URLShim = { createObjectURL() { return "blob:qa"; }, revokeObjectURL() {} };
const context = { document, Blob: CaptureBlob, URL: URLShim, setTimeout, clearTimeout, console };
vm.createContext(context);
const source = fs.readFileSync(appPath, "utf8") +
  "\nthis.__app = { getState: () => state, graphMetrics, inspect, exportGraph, buildHumanPlan };";
vm.runInContext(source, context, { filename: appPath });

async function fire(id, type, event = {}) {
  const handler = elements.get(id).listeners[type];
  assert.equal(typeof handler, "function", `${id} should register ${type}`);
  await handler(event);
}

(async () => {
  const app = context.__app;
  let state = app.getState();
  assert.equal(state.deal.nodes.every(node => node.executionPackage), true);
  assert.deepEqual([...new Set(state.deal.nodes.map(node => node.executionPackage.kind))].sort(), ["challenge", "flexible-talent", "private-pod"]);
  let metrics = app.graphMetrics();
  assert.equal(metrics.hasCycle, false);
  assert.equal(JSON.stringify(metrics.criticalIds), JSON.stringify(["N1", "N2", "N4", "N6"]));
  assert.equal(metrics.criticalDuration, 13);
  assert.equal(metrics.waveCount, 4);

  const cycle = app.graphMetrics([
    { id: "A", duration: 1, deps: ["B"] },
    { id: "B", duration: 1, deps: ["A"] }
  ]);
  assert.equal(cycle.hasCycle, true);
  assert.equal(cycle.criticalIds.length, 0);

  app.inspect("N2");
  elements.get("overrideModel").value = "private-pod";
  await fire("applyOverrideBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.find(n => n.id === "N2").model, "private-pod");
  assert.equal(state.overrideHistory.length, 1);

  app.inspect("N6");
  elements.get("dependencySelect").value = "N3";
  await fire("addDependencyBtn", "click");
  state = app.getState();
  assert.ok(state.deal.nodes.find(n => n.id === "N6").deps.includes("N3"));
  assert.ok(state.lastImpact.affectedNodeIds.includes("N6"));

  elements.get("editTitle").value = "受控试点交付（修订）";
  elements.get("editObjective").value = "补充试点监控与回滚演练。";
  elements.get("editAcceptance").value = "监控告警与回滚路径可复现。";
  elements.get("editDuration").value = "4";
  await fire("saveNodeBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.find(n => n.id === "N6").title, "受控试点交付（修订）");
  assert.equal(state.deal.nodes.find(n => n.id === "N6").provenance, "User-approved edit");

  await fire("addNodeBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.length, 7);
  const addedId = state.selectedNode;
  assert.ok(state.deal.nodes.find(n => n.id === addedId).sourceIds.includes(`USER-${addedId}`));
  await fire("splitNodeBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.length, 8);
  assert.ok(state.deal.nodes.find(n => n.id === `${addedId}-B`).deps.includes(`${addedId}-A`));
  elements.get("mergeNodeSelect").value = `${addedId}-A`;
  await fire("mergeNodeBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.length, 7);
  assert.equal(state.deal.nodes.some(n => n.id === `${addedId}-A`), false);
  await fire("removeNodeBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.length, 6);
  assert.equal(state.deal.nodes.some(n => n.id === `${addedId}-B`), false);

  elements.get("sampleSelect").value = "claims";
  await fire("loadSampleBtn", "click");
  state = app.getState();
  assert.equal(state.deal.nodes.length, 6);
  assert.equal(app.graphMetrics().waveCount, 4);

  const imported = { title: "Imported QA", source: { id: "SRC-1" } };
  const file = { name: "qa.json", text: async () => JSON.stringify(imported) };
  await fire("jsonFile", "change", { target: { files: [file] } });
  state = app.getState();
  assert.equal(state.deal.title, "Imported QA");
  assert.equal(elements.get("importStatus").textContent, "已导入 qa.json");
  assert.equal(state.deal.validation.passed, 4);
  assert.ok(state.deal.validation.issues.includes("Executable source evidence"));

  const nested = { deal: { title: "Nested QA" }, source: { itemId: 42 } };
  const nestedFile = { name: "nested.json", text: async () => JSON.stringify(nested) };
  await fire("jsonFile", "change", { target: { files: [nestedFile] } });
  state = app.getState();
  assert.equal(state.deal.title, "Nested QA");
  assert.ok(state.deal.nodes.some(node => node.sourceIds.includes("42")));

  elements.get("jsonPaste").value = JSON.stringify({ title: "Pasted QA", requirements: [{ id: "REQ-P-1", title: "Paste path" }] });
  await fire("loadPasteBtn", "click");
  state = app.getState();
  assert.equal(state.deal.title, "Pasted QA");
  assert.equal(elements.get("importStatus").textContent, "已导入 pasted-package.json");

  const scoped = { title: "Scoped QA", scope: { questions: [{ id: "Q-1", question: "API contract?" }], gaps: [{ id: "G-1", summary: "Missing volume" }], assumptions: [{ id: "A-1", summary: "Region is fixed" }] }, quality: { status: "review-required" } };
  const scopedFile = { name: "scoped.json", text: async () => JSON.stringify(scoped) };
  await fire("jsonFile", "change", { target: { files: [scopedFile] } });
  state = app.getState();
  assert.equal(state.deal.maturity, "Review Required");
  assert.equal(state.deal.validation.issues.length, 1);
  assert.ok(state.deal.blockers.some(blocker => blocker[0] === "Q-1"));
  assert.ok(state.deal.blockers.some(blocker => blocker[0] === "G-1"));
  assert.ok(state.deal.blockers.some(blocker => blocker[0] === "A-1"));

  await fire("exportBtn", "click");
  const exported = JSON.parse(await CaptureBlob.last.text());
  assert.equal(exported.edges.length, 7);
  assert.equal(JSON.stringify(exported.waves), JSON.stringify([1, 2, 3, 4]));
  assert.equal(exported.qualityGate, "pass-with-review");
  assert.equal(exported.executionPackages.length, 6);
  assert.ok(exported.executionPackages.some(pack => pack.kind === "challenge"));
  assert.equal(exported.nodes[0].operatingModel.primary, exported.nodes[0].model);
  assert.ok(app.buildHumanPlan().includes("## Execution nodes"));
  assert.ok(anchors.at(-1).clicked);

  for (const sampleName of [
    "claimsdesk-modernization.json",
    "clinical-intake-and-patient-support-assistant.json",
    "member-experience-modernisation-early-discovery.json",
    "unified-supply-chain-analytics.json"
  ]) {
    const samplePath = __dirname + "/samples/" + sampleName;
    const sampleFile = { name: sampleName, text: async () => fs.readFileSync(samplePath, "utf8") };
    await fire("jsonFile", "change", { target: { files: [sampleFile] } });
    state = app.getState();
    assert.equal(state.sourcePackage.id.startsWith("DEAL_"), true);
    assert.equal(state.deal.validation.issues.length, 0);
    assert.equal(state.deal.nodes.every(node => node.sourceIds.length > 0 && node.executionPackage), true);
    assert.ok(state.deal.nodes.every(node => node.importedEvidence));
  }
  console.log("qa-smoke: PASS");
})().catch(error => { console.error(error); process.exitCode = 1; });
