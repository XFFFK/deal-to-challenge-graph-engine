/* Deal-to-Challenge Graph Engine — local deterministic mock.
 * No network requests are made. Imported packages are kept in state.sourcePackage
 * and only the derived execution graph is exported by the button.
 */
const MODEL_META = {
  "flexible-talent": {label:"Flexible Talent", short:"talent", color:"cyan"},
  challenge: {label:"Challenge", short:"challenge", color:"orange"},
  "private-pod": {label:"Private Pod", short:"pod", color:"purple"}
};

const SAMPLE_DEALS = {
  clinical: {
    title: "Clinical Intake & Patient Support Assistant",
    maturity: "Review Required", score: 68,
    maturityDescription: "关键边界已出现，但仍有安全与数据处理决策。",
    blockers: [
      ["B-01", "External API contract 未确认", "需要在实现前冻结患者资料与身份服务接口。"],
      ["B-02", "PHI access boundary 待审批", "受监管数据必须先完成访问、审计和脱敏决策。"],
      ["B-03", "Human review policy 未落地", "AI 提取结果的人工确认阈值仍是开放问题。"]
    ],
    nodes: [
      {id:"N1", title:"确认 API 与数据边界", category:"Discovery", model:"flexible-talent", confidence:"high", wave:1, duration:3, deps:[], sourceIds:["REQ-01","ARC-01"], readiness:"blocked", provenance:"AI-recommended", objective:"冻结身份、患者资料与事件接口，记录 PHI 数据边界。", rationale:["范围明确，适合一名资深集成工程师快速完成。","需要直接与现有交付团队对接，不需要竞赛探索。"], acceptance:"接口字段、错误码、访问角色和审计事件均有版本化契约。"},
      {id:"N2", title:"文档摄取与字段提取", category:"AI implementation", model:"challenge", confidence:"medium", wave:2, duration:4, deps:["N1"], sourceIds:["CAP-01","AI-01"], readiness:"ready", provenance:"AI-recommended", objective:"构建可评估的文档解析与信息提取组件。", rationale:["多个解析策略可并行探索，结果能用固定数据集评估。","输入和验收指标可独立打包，适合开放参与。"], acceptance:"在提供的匿名样本上达到约定字段覆盖率，并输出可复现评测报告。"},
      {id:"N3", title:"知识库与检索评估", category:"AI / data", model:"challenge", confidence:"medium", wave:2, duration:3, deps:["N1"], sourceIds:["AI-02","DATA-01"], readiness:"review-required", provenance:"AI-recommended", objective:"比较检索、切分和引用策略，产出可审阅的评测包。", rationale:["多种方法与模型对比有明显价值。","可以隔离敏感生产数据，只开放脱敏资料。"], acceptance:"至少两种策略在固定问题集上可比较，并保留引用证据。"},
      {id:"N4", title:"安全与人工复核控制", category:"Security", model:"private-pod", confidence:"high", wave:3, duration:3, deps:["N2","N3"], sourceIds:["NFR-02","RISK-01"], readiness:"review-required", provenance:"AI-recommended", objective:"实现 PHI 访问控制、人工复核队列和审计闭环。", rationale:["安全、AI 和业务流程强耦合，需要持续技术领导。","受监管数据要求受控团队与限制访问。"], acceptance:"高风险结果阻断自动回复；复核、审计和告警可端到端演示。"},
      {id:"N5", title:"对话体验与可用性验证", category:"UX / testing", model:"challenge", confidence:"high", wave:3, duration:2, deps:["N2"], sourceIds:["REQ-03","NFR-03"], readiness:"ready", provenance:"AI-recommended", objective:"验证 intake 对话流程、错误恢复和可访问性。", rationale:["体验方案可独立评审，多种交互探索会增加价值。","验收可由脚本和可用性量表客观判断。"], acceptance:"完成关键旅程走查，达到可访问性清单和人工评审门槛。"},
      {id:"N6", title:"受控试点交付", category:"Deployment", model:"private-pod", confidence:"high", wave:4, duration:3, deps:["N4","N5"], sourceIds:["ARC-02","REL-01"], readiness:"review-required", provenance:"AI-recommended", objective:"将组件集成至受控环境，完成试点、监控与回滚演练。", rationale:["涉及前后端、AI、安全和发布协作，需持续协调。","试点环境有受限数据与发布责任，不适合公开竞赛。"], acceptance:"试点指标、回滚路径、监控告警和交接文档经责任人签字。"}
    ]
  },
  claims: {title:"ClaimsDesk Modernization", maturity:"Execution Candidate", score:84, maturityDescription:"范围、架构和分阶段交付已经足够清晰，可进入执行编排。", blockers:[["B-01","Legacy release window 未确认","需在排期前确认停机窗口。"]], nodes:[]},
  member: {title:"Member Experience · Early Discovery", maturity:"Discovery Required", score:34, maturityDescription:"方向性需求较多，但关键系统、AI 功能和验收输入尚未确定。", blockers:[["B-01","Systems unknown","现有系统与数据源尚未盘点。"],["B-02","Acceptance missing","缺少可验证的业务指标。"],["B-03","Estimate low confidence","时间、规模和合规假设均待确认。"]], nodes:[]},
  supply: {title:"Unified Supply Chain Analytics", maturity:"Review Required", score:59, maturityDescription:"数据和集成范围较大，接口事件覆盖与迁移范围需要复核。", blockers:[["B-01","Event coverage unconfirmed","ERP、CRM 与承运商事件清单未冻结。"],["B-02","Migration scope open","历史数据迁移窗口和保留策略需确认。"]], nodes:[]}
};

function clone(value){return JSON.parse(JSON.stringify(value));}
function makeFallbackNodes(kind){
  const base = SAMPLE_DEALS.clinical.nodes;
  const prefix = kind === "claims" ? "Claims" : kind === "member" ? "Discovery" : "Supply";
  return base.map((n,i)=>({...clone(n), title:`${prefix} · ${n.title}`, sourceIds:n.sourceIds.map(x=>`${prefix.toUpperCase()}-${x}`), id:`N${i+1}`}));
}
let state = {deal: null, sourcePackage: null, selectedNode: null, modelFilter:"all", overrideHistory:[]};

function itemText(item, keys, fallback){
  if(typeof item === "string" || typeof item === "number") return String(item);
  if(!item || typeof item !== "object") return fallback;
  for(const key of keys){
    const value=item[key];
    if(typeof value === "string" && value.trim()) return value.trim();
  }
  return fallback;
}
function importedBlockers(input){
  const blockers=[];
  const scope=input.scope && typeof input.scope === "object" ? input.scope : {};
  const add=(items,prefix)=>{
    if(!Array.isArray(items)) return;
    items.forEach((item,index)=>{
      const id=itemText(item,["id","itemId","questionId","gapId","riskId","dependencyId"],`${prefix}-${String(index+1).padStart(2,"0")}`);
      const title=itemText(item,["title","name","summary","question","type"],`${prefix} requires review`);
      const description=itemText(item,["description","detail","reason","value","answer"],"Imported item is unresolved and should be reviewed before handoff.");
      blockers.push([id,title,description]);
    });
  };
  add(input.quality?.findings || input.qualityFindings || scope.quality?.findings,"QUALITY");
  add(input.questions || scope.questions,"QUESTION");
  add(input.gaps || scope.gaps,"GAP");
  add(input.dependencies || scope.dependencies,"DEPENDENCY");
  add(input.risks || scope.risks,"RISK");
  return blockers;
}
function importedMaturity(input,fallback,blockers){
  const scope=input.scope && typeof input.scope === "object" ? input.scope : {};
  const status=String(input.quality?.status || input.qualityStatus || scope.quality?.status || "").toLowerCase();
  if(status.includes("blocked")) return "Blocked";
  if(status.includes("review")) return "Review Required";
  if(status.includes("execution") || status === "ready" || status === "approved") return "Execution Candidate";
  if((Array.isArray(input.questions) && input.questions.length) || (Array.isArray(input.gaps) && input.gaps.length) || (Array.isArray(scope.questions) && scope.questions.length) || (Array.isArray(scope.gaps) && scope.gaps.length)) return "Discovery Required";
  return blockers.length ? "Review Required" : fallback;
}
function normaliseDeal(input, filename="Imported JSON"){
  input = input && typeof input === "object" ? input : {};
  const text = JSON.stringify(input).toLowerCase();
  const kind = text.includes("claimsdesk") ? "claims" : text.includes("member experience") || text.includes("early discovery") ? "member" : text.includes("supply chain") ? "supply" : "clinical";
  const template = clone(SAMPLE_DEALS[kind]);
  const ids = collectIds(input);
  if (ids.length) template.nodes.forEach((n,i)=>{n.sourceIds = ids.slice(i, i+Math.max(1,n.sourceIds.length)).map(x=>String(x));});
  const titleCandidates = [input.name, input.title, input.deal?.name, input.deal?.title, input.metadata?.name, input.metadata?.title];
  template.title = titleCandidates.find(value=>typeof value === "string" && value.trim())?.trim() || filename.replace(/\.json$/i,"") || template.title;
  template.nodes = template.nodes.length ? template.nodes : makeFallbackNodes(kind);
  const blockers=importedBlockers(input);
  template.blockers = blockers.length ? blockers : (template.blockers.length ? template.blockers : [["B-01","Needs review","Imported package has no deterministic blocker summary; review source fields before handoff."]]);
  template.maturity = importedMaturity(input,template.maturity,blockers);
  template.maturityDescription = template.maturity === "Execution Candidate" ? "Imported quality signals support execution planning." : "Imported questions, gaps, risks, or findings require review before handoff.";
  template.score = Math.max(22, Math.min(92, template.score - Math.max(0, template.blockers.length-2)*4));
  attachExecutionPackages(template.nodes);
  template.sourceCount = Math.max(ids.length, template.nodes.reduce((sum,n)=>sum+n.sourceIds.length,0));
  return template;
}
function collectIds(value, out=[]){
  if(Array.isArray(value)){value.forEach(v=>collectIds(v,out)); return out;}
  if(value && typeof value === "object"){
    Object.entries(value).forEach(([k,v])=>{const key=k.toLowerCase();const isId=key==="id" || key.endsWith("id");if(isId && (typeof v === "string" || typeof v === "number") && String(v).length < 100) out.push(String(v)); collectIds(v,out);});
  }
  return [...new Set(out)];
}
function getEdges(){return state.deal.nodes.flatMap(target=>(target.deps||[]).map(source=>({source,target:target.id})))}
function uniqueSources(){return [...new Set(state.deal.nodes.flatMap(n=>n.sourceIds||[]))];}
function modelClass(model){return MODEL_META[model]?.short || "pod";}
function modelMeta(model){return MODEL_META[model] || {label:String(model || "未指定"),short:"pod",color:"purple"};}
function el(id){return document.getElementById(id);}

function inferSkills(node){
  const category=String(node.category||"").toLowerCase();
  if(category.includes("security")) return ["Security engineering","Access control","Audit logging"];
  if(category.includes("data")) return ["Data integration","Data quality","JSON/API"];
  if(category.includes("ux")) return ["UX/UI design","Accessibility testing","Usability evaluation"];
  if(category.includes("ai")) return ["AI implementation","Evaluation design","Python/JSON"];
  if(category.includes("deploy")) return ["Cloud infrastructure","Release engineering","Observability"];
  if(category.includes("test")) return ["Test automation","Quality engineering","Acceptance testing"];
  if(category.includes("discovery")) return ["Requirements analysis","Systems design","Technical writing"];
  return ["Software engineering","Requirements traceability","Automated testing"];
}
function inferRole(node){
  const category=String(node.category||"").toLowerCase();
  if(category.includes("security")) return "Security engineer";
  if(category.includes("data")) return "Data engineer";
  if(category.includes("ux")) return "UX engineer";
  if(category.includes("ai")) return "AI engineer";
  if(category.includes("deploy")) return "Cloud engineer";
  if(category.includes("test")) return "QA engineer";
  if(category.includes("discovery")) return "Solution analyst";
  return "Full-stack engineer";
}
function buildExecutionPackage(node){
  const model=node.model;
  const skills=inferSkills(node);
  const deps=[...(node.deps||[])];
  const common={nodeId:node.id,operatingModel:model,readiness:node.readiness,sourceIds:[...(node.sourceIds||[])],dependencies:deps,provenance:node.provenance||"AI-recommended"};
  if(model==="flexible-talent") return {...common,kind:"flexible-talent",requiredRoles:[{role:inferRole(node),seniority:"Senior",skills}],duration:{value:Number(node.duration)||0,unit:"person-days"},responsibilities:[node.objective,node.acceptance],startDependencies:deps,requiredAccessAndEnvironment:["Approved repository and test environment","Least-privilege source access"]};
  if(model==="challenge") return {...common,kind:"challenge",challengeObjective:node.objective,businessAndTechnicalContext:`${node.title} is grounded in ${node.sourceIds?.join(", ")||"the imported package"}.`,deliverables:[`${node.title} implementation or evaluation artifact`,"Reproducible result package"],evaluationCriteria:[node.acceptance,"Traceable evidence for each source reference","Automated checks pass"],acceptanceConditions:[node.acceptance],inputAssets:[...(node.sourceIds||[])],requiredTechnologiesOrSkills:skills,confidentialityLimitations:["Use sanitized input assets only","No production credentials"],expectedReviewProcess:["Automated quality checks","Human review against acceptance criteria"]};
  return {...common,kind:"private-pod",podObjective:node.objective,requiredRoles:[{role:"Technical lead",seniority:"Lead",skills:["Systems design","Delivery coordination"]},{role:inferRole(node),seniority:"Senior",skills}],technicalLeadershipNeeds:["Own interfaces and sequencing","Resolve cross-component risks"],componentOwnership:[node.title],deliveryResponsibilities:[node.objective,node.acceptance],securityAndAccessRequirements:["Vetted team access","Least-privilege environment","Audit trail for sensitive work"],coordinationDependencies:deps,expectedDuration:{value:Number(node.duration)||0,unit:"person-days"},definitionOfCompletion:node.acceptance};
}
function attachExecutionPackages(nodes){
  nodes.forEach(node=>{node.alternatives=Array.isArray(node.alternatives)?node.alternatives:(node.model==="challenge"?["flexible-talent"]:node.model==="private-pod"?["flexible-talent"]:["challenge"]);node.executionPackage=buildExecutionPackage(node);});
  return nodes;
}

function graphMetrics(nodes=state.deal.nodes){
  const ids=new Set(nodes.map(n=>String(n.id)));
  const edges=nodes.flatMap(target=>(Array.isArray(target.deps)?target.deps:[]).map(source=>({source:String(source),target:String(target.id)})));
  const validEdges=edges.filter(edge=>ids.has(edge.source)&&ids.has(edge.target));
  const dangling=edges.filter(edge=>!ids.has(edge.source)||!ids.has(edge.target));
  const edgeKeys=edges.map(edge=>`${edge.source}->${edge.target}`);
  const duplicateEdges=[...new Set(edgeKeys.filter((key,i)=>edgeKeys.indexOf(key)!==i))];
  const selfDependencies=edges.filter(edge=>edge.source===edge.target);
  const orderIndex=new Map(nodes.map((n,i)=>[String(n.id),i]));
  const indegree=new Map(nodes.map(n=>[String(n.id),0]));
  const outgoing=new Map(nodes.map(n=>[String(n.id),[]]));
  validEdges.forEach(edge=>{indegree.set(edge.target,indegree.get(edge.target)+1);outgoing.get(edge.source).push(edge.target);});
  const queue=nodes.filter(n=>indegree.get(String(n.id))===0).map(n=>String(n.id));
  const levels=new Map(nodes.map(n=>[String(n.id),1]));
  const topo=[];
  while(queue.length){
    queue.sort((a,b)=>orderIndex.get(a)-orderIndex.get(b));
    const id=queue.shift(); topo.push(id);
    outgoing.get(id).forEach(target=>{
      levels.set(target,Math.max(levels.get(target),levels.get(id)+1));
      indegree.set(target,indegree.get(target)-1);
      if(indegree.get(target)===0) queue.push(target);
    });
  }
  const hasCycle=topo.length!==nodes.length;
  nodes.forEach(n=>{n.wave=levels.get(String(n.id)) || 1;});
  const distance=new Map(), previous=new Map();
  topo.forEach(id=>{
    const node=nodes.find(n=>String(n.id)===id);
    const duration=Math.max(0,Number(node?.duration)||0);
    if(!distance.has(id)) distance.set(id,duration);
    outgoing.get(id).forEach(target=>{
      const targetNode=nodes.find(n=>String(n.id)===target);
      const candidate=distance.get(id)+Math.max(0,Number(targetNode?.duration)||0);
      if(candidate>(distance.get(target)||0)){distance.set(target,candidate);previous.set(target,id);}
    });
  });
  let endId=null;
  if(!hasCycle) topo.forEach(id=>{if(endId===null || (distance.get(id)||0)>(distance.get(endId)||0)) endId=id;});
  const criticalIds=[];
  while(endId!==null){criticalIds.unshift(endId);endId=previous.get(endId) ?? null;}
  const criticalEdges=new Set(criticalIds.slice(1).map((id,i)=>`${criticalIds[i]}->${id}`));
  const entryNodes=nodes.filter(n=>!validEdges.some(edge=>edge.target===String(n.id))).map(n=>String(n.id));
  const terminalNodes=nodes.filter(n=>!validEdges.some(edge=>edge.source===String(n.id))).map(n=>String(n.id));
  const orphanNodes=nodes.length>1?nodes.filter(n=>!validEdges.some(edge=>edge.source===String(n.id)||edge.target===String(n.id))).map(n=>String(n.id)):[];
  return {edges,validEdges,dangling,duplicateEdges,selfDependencies,orphanNodes,entryNodes,terminalNodes,hasCycle,criticalIds,criticalEdges,criticalDuration:criticalIds.reduce((sum,id)=>sum+Math.max(0,Number(nodes.find(n=>String(n.id)===id)?.duration)||0),0),waveCount:Math.max(...nodes.map(n=>n.wave),1)};
}

function qualityHasIssues(metrics=graphMetrics()){
  return state.deal.blockers.length>0 || metrics.dangling.length>0 || metrics.duplicateEdges.length>0 || metrics.selfDependencies.length>0 || metrics.orphanNodes.length>0 || metrics.hasCycle || state.deal.nodes.some(n=>!MODEL_META[n.model] || !n.executionPackage);
}
function qualityStatus(metrics=graphMetrics()){
  if(metrics.hasCycle||metrics.dangling.length||metrics.duplicateEdges.length||metrics.selfDependencies.length||metrics.orphanNodes.length)return "blocked";
  return qualityHasIssues(metrics)?"review-required":"ready";
}

function render(){
  const d=state.deal;
  const metrics=graphMetrics();
  el("readinessLabel").textContent=d.maturity; el("readinessScore").textContent=`${d.score}%`;
  el("maturityBadge").textContent=d.maturity; el("maturityBadge").className=`status-badge ${d.maturity === "Execution Candidate" ? "pass" : "review"}`;
  el("maturityTitle").textContent=d.maturity; el("maturityDescription").textContent=d.maturityDescription;
  el("meterFill").style.width=`${d.score}%`; el("meterFill").style.background=d.score>75?"linear-gradient(90deg,#67dfaa,#a5f3cd)":"linear-gradient(90deg,#ffbd70,#ffdd8d)";
  el("sourceCount").textContent=d.sourceCount || uniqueSources().length; el("nodeCount").textContent=d.nodes.length;
  const ready=d.nodes.filter(n=>n.readiness === "ready").length; el("nodeReadyText").textContent=`${ready} ready · ${d.nodes.length-ready} review`;
  el("blockerCount").textContent=d.blockers.length; el("waveCount").textContent=metrics.waveCount;
  el("validationResult").textContent=`${Math.max(3,10-d.blockers.length)} / 10 checks passed`;
  el("blockerList").innerHTML=d.blockers.map(([id,title,desc])=>`<div class="blocker"><i>!</i><div><b>${esc(title)}</b><span>${esc(desc)}</span></div></div>`).join("");
  renderModels(); renderGraph(); renderNodes(); renderQuality();
  if(state.selectedNode) inspect(state.selectedNode); else inspect(null);
}
function renderModels(){
  const counts={"flexible-talent":0,challenge:0,"private-pod":0}; state.deal.nodes.forEach(n=>counts[n.model] = (counts[n.model]||0)+1);
  const total=state.deal.nodes.length||1;
  el("modelBreakdown").innerHTML=Object.entries(MODEL_META).map(([key,meta])=>`<div class="model-row"><span class="model-name">${meta.label}</span><div class="model-track"><i class="${meta.short}" style="width:${counts[key]/total*100}%"></i></div><span class="model-num">${counts[key]}</span></div>`).join("");
}
function renderGraph(){
  const metrics=graphMetrics();
  const waves={}; state.deal.nodes.forEach(n=>(waves[n.wave] ||= []).push(n));
  const maxWave=Math.max(...Object.keys(waves).map(Number),1); const critical=new Set(metrics.criticalIds);
  let html=`<div class="graph-grid">`;
  for(let wave=1;wave<=maxWave;wave++) html+=`<div class="wave-col"><div class="wave-label">WAVE ${String(wave).padStart(2,"0")}</div>${(waves[wave]||[]).map(n=>`<div class="g-node ${critical.has(String(n.id))?"critical":""} ${state.selectedNode===n.id?"selected":""}" data-node="${n.id}"><span class="g-model ${modelClass(n.model)}"></span><span class="g-id">${n.id} · ${n.duration}d</span><b>${esc(n.title)}</b><small>${esc(modelMeta(n.model).label)}</small></div>`).join("")}</div>`;
  html+=`</div><svg class="graph-svg" viewBox="0 0 ${Math.max(760,maxWave*190)} 270" preserveAspectRatio="none" aria-hidden="true"><defs><marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#65709a"/></marker><marker id="arrowCritical" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#9d8cff"/></marker></defs>`;
  const pos={}; Object.entries(waves).forEach(([wave,ns])=>ns.forEach((n,i)=>pos[n.id]={x:(Number(wave)-1)*190+163,y:35+i*96}));
  metrics.edges.forEach(edge=>{const a=pos[edge.source],b=pos[edge.target];if(!a||!b)return; const isCritical=metrics.criticalEdges.has(`${edge.source}->${edge.target}`); html+=`<line class="${isCritical?"critical":""}" x1="${a.x}" y1="${a.y}" x2="${b.x-25}" y2="${b.y}" marker-end="url(#${isCritical?"arrowCritical":"arrow"})"/>`;});
  html+=`</svg>`; el("graphCanvas").innerHTML=html;
  el("graphCanvas").querySelectorAll("[data-node]").forEach(n=>n.addEventListener("click",()=>inspect(n.dataset.node)));
  el("criticalPathText").textContent=metrics.hasCycle?"关键路径：无法计算（存在依赖环路）":`关键路径：${metrics.criticalIds.join(" → ")} · ${metrics.criticalDuration}d`;
}
function renderNodes(){
  const list=state.deal.nodes.filter(n=>state.modelFilter==="all"||n.model===state.modelFilter);
  el("nodeList").innerHTML=list.map((n,i)=>`<div class="node-item ${state.selectedNode===n.id?"active":""}" data-node="${n.id}"><span class="node-number">${n.id}</span><div><b>${esc(n.title)}</b><small>${esc(n.category)} · ${n.sourceIds.length} source refs</small></div><span class="model-tag ${modelClass(n.model)}">${esc(modelMeta(n.model).label)}</span></div>`).join("") || `<div class="empty-inspector">当前筛选无节点。</div>`;
  el("nodeList").querySelectorAll("[data-node]").forEach(n=>n.addEventListener("click",()=>inspect(n.dataset.node)));
}
function renderExecutionPackage(node){
  const target=el("executionPackage");
  if(!target)return;
  target.textContent=node?JSON.stringify(node.executionPackage||buildExecutionPackage(node),null,2):"";
}
function renderDependencyEditor(node){
  const list=el("dependencyList"), select=el("dependencySelect");
  if(!list||!select)return;
  const deps=node?.deps||[];
  list.innerHTML=deps.length?deps.map(dep=>`<span class="dependency-chip">${esc(dep)}<button type="button" data-remove-dep="${esc(dep)}" aria-label="移除 ${esc(dep)}">×</button></span>`).join(""):"<span class=\"muted\">无前置依赖</span>";
  select.innerHTML=`<option value="">选择前置节点</option>`+state.deal.nodes.filter(candidate=>candidate.id!==node.id&&!deps.includes(candidate.id)).map(candidate=>`<option value="${esc(candidate.id)}">${esc(candidate.id)} · ${esc(candidate.title)}</option>`).join("");
  list.querySelectorAll("[data-remove-dep]").forEach(button=>button.addEventListener("click",()=>removeDependency(node.id,button.dataset.removeDep)));
}
function graphSnapshot(){
  return {nodes:clone(state.deal.nodes),metrics:graphMetrics(clone(state.deal.nodes))};
}
function descendants(startId,nodes=state.deal.nodes){
  const seen=new Set([String(startId)]), queue=[String(startId)];
  while(queue.length){const id=queue.shift();nodes.forEach(node=>{if((node.deps||[]).map(String).includes(id)&&!seen.has(String(node.id))){seen.add(String(node.id));queue.push(String(node.id));}});}
  return [...seen];
}
function buildChangeImpact(before,changedIds){
  const after=graphSnapshot(); const changed=new Set(changedIds.map(String));
  changedIds.forEach(id=>descendants(id).forEach(x=>changed.add(String(x))));
  const beforeDeps=new Map(before.nodes.map(n=>[String(n.id),JSON.stringify((n.deps||[]).map(String).sort())]));
  const changedDependencies=after.nodes.filter(n=>beforeDeps.get(String(n.id))!==JSON.stringify((n.deps||[]).map(String).sort())).map(n=>String(n.id));
  return {affectedNodeIds:[...changed],unaffectedNodeIds:after.nodes.map(n=>String(n.id)).filter(id=>!changed.has(id)),changedDependencies,previousWaves:before.metrics.waveCount,currentWaves:after.metrics.waveCount,previousCriticalPath:before.metrics.criticalIds,currentCriticalPath:after.metrics.criticalIds,invalidatedExecutionPackages:[...changed],qualityGate:qualityHasIssues(after.metrics)?"pass-with-review":"ready-for-review"};
}
function formatImpact(impact){
  const waves=impact.previousWaves===impact.currentWaves?`波次未变（${impact.currentWaves}）`:`波次 ${impact.previousWaves} → ${impact.currentWaves}`;
  const path=JSON.stringify(impact.previousCriticalPath)===JSON.stringify(impact.currentCriticalPath)?"关键路径未变":`关键路径 ${impact.previousCriticalPath.join(" → ")||"—"} → ${impact.currentCriticalPath.join(" → ")||"—"}`;
  return `影响：${impact.affectedNodeIds.length} 个节点；${waves}；${path}。已使受影响节点的执行包进入复核。`;
}
function canonicalNode(node){
  return {...node,operatingModel:{primary:node.model,alternatives:[...(node.alternatives||[])],confidence:node.confidence||"medium",rationale:[...(node.rationale||[])]},inputs:[...(node.inputs||[])],deliverables:[...(node.deliverables||[])],risks:[...(node.risks||[])],assumptions:[...(node.assumptions||[])],effort:{minimum:Number(node.duration)||0,maximum:Number(node.duration)||0,unit:"person-days"},executionPackage:node.executionPackage||buildExecutionPackage(node)};
}
function buildExportEdges(metrics){
  return metrics.edges.map((edge,index)=>{const target=state.deal.nodes.find(node=>String(node.id)===String(edge.target));return {id:`EDGE_${String(index+1).padStart(3,"0")}`,source:edge.source,target:edge.target,type:"blocking-dependency",rationale:`${edge.target} requires the output from ${edge.source}.`,sourceIds:[...(target?.sourceIds||[])],blocking:true,requiredInput:target?.objective||"Approved predecessor output"};});
}
function buildHumanPlan(){
  const metrics=graphMetrics();
  const lines=[`# ${state.deal.title} — Execution Plan`,``,`- Maturity: **${state.deal.maturity}** (${state.deal.score}%)`,`- Quality gate: **${qualityStatus(metrics).toUpperCase()}**`,`- Waves: ${metrics.waveCount}`,`- Critical path: ${metrics.hasCycle?"Unavailable (cycle detected)":metrics.criticalIds.join(" → ")||"—"}`,``,`## Blockers`];
  if(state.deal.blockers.length) state.deal.blockers.forEach(([id,title,description])=>lines.push(`- **${id} ${title}** — ${description}`)); else lines.push("- None recorded.");
  lines.push("","## Execution nodes");
  const waves={}; state.deal.nodes.forEach(node=>(waves[node.wave] ||= []).push(node));
  Object.keys(waves).sort((a,b)=>a-b).forEach(wave=>{
    lines.push(`### Wave ${wave}`);
    waves[wave].forEach(node=>{
      const pack=node.executionPackage||buildExecutionPackage(node);
      const deliverables=pack.deliverables||pack.responsibilities||pack.deliveryResponsibilities||[];
      lines.push(`#### ${node.id} · ${node.title}`,`- Model: **${modelMeta(node.model).label}** · readiness: **${node.readiness}**`,`- Objective: ${node.objective}`,`- Sources: ${(node.sourceIds||[]).join(", ")||"—"}`,`- Dependencies: ${(node.deps||[]).join(", ")||"—"}`,`- Deliverables: ${deliverables.join("; ")||"—"}`,`- Acceptance: ${node.acceptance}`,`- Package: \`${pack.kind}\``);
    });
  });
  lines.push("","## Dependency validation",`- Entry nodes: ${metrics.entryNodes.join(", ")||"—"}`,`- Terminal nodes: ${metrics.terminalNodes.join(", ")||"—"}`,`- Cycles: ${metrics.hasCycle?"detected":"none"}`,`- Dangling edges: ${metrics.dangling.length}`,`- Orphan nodes: ${metrics.orphanNodes.join(", ")||"none"}`,"","Generated in deterministic mock mode; review blockers before operational handoff.");
  return lines.join("\n");
}
function downloadText(filename,text,type){const blob=new Blob([text],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;a.click();URL.revokeObjectURL(a.href);}
function removeDependency(nodeId,dependencyId){
  const node=state.deal.nodes.find(item=>item.id===nodeId);if(!node)return;
  const before=graphSnapshot();node.deps=(node.deps||[]).filter(dep=>String(dep)!==String(dependencyId));node.executionPackage=buildExecutionPackage(node);const impact=buildChangeImpact(before,[nodeId]);state.lastImpact=impact;render();inspect(nodeId);el("impactNote").textContent=formatImpact(impact);el("impactNote").classList.remove("hidden");
}
function addDependency(){
  const node=state.deal.nodes.find(item=>item.id===state.selectedNode), select=el("dependencySelect");if(!node||!select||!select.value)return;
  const dependencyId=select.value;if(dependencyId===node.id||(node.deps||[]).includes(dependencyId))return;
  const before=graphSnapshot();node.deps=[...(node.deps||[]),dependencyId];const proposed=graphMetrics(clone(state.deal.nodes));
  if(proposed.hasCycle){node.deps=node.deps.filter(dep=>dep!==dependencyId);el("impactNote").textContent="未添加：该依赖会形成环路。";el("impactNote").classList.remove("hidden");renderDependencyEditor(node);return;}
  node.executionPackage=buildExecutionPackage(node);const impact=buildChangeImpact(before,[node.id]);state.lastImpact=impact;render();inspect(node.id);el("impactNote").textContent=formatImpact(impact);el("impactNote").classList.remove("hidden");
}
function inspect(id){
  state.selectedNode=id; const n=state.deal.nodes.find(x=>x.id===id);
  if(!n){el("inspectorTitle").textContent="选择一个节点";el("provenanceBadge").textContent="—";el("inspectorEmpty").classList.remove("hidden");el("inspectorBody").classList.add("hidden");return;}
  el("inspectorTitle").textContent=n.title; el("provenanceBadge").textContent=n.provenance; el("inspectorEmpty").classList.add("hidden");el("inspectorBody").classList.remove("hidden");
  el("inspectorModel").className=`model-tag ${modelClass(n.model)}`;el("inspectorModel").textContent=modelMeta(n.model).label;el("inspectorReady").textContent=n.readiness;
  el("inspectorObjective").textContent=n.objective; el("inspectorRationale").innerHTML=n.rationale.map(x=>`<li>${esc(x)}</li>`).join("");el("inspectorSources").innerHTML=n.sourceIds.map(x=>`<span class="source-chip">${esc(x)}</span>`).join("");el("inspectorAcceptance").textContent=n.acceptance;el("overrideModel").value=n.model;
  renderExecutionPackage(n);renderDependencyEditor(n);if(state.lastImpact)el("impactNote").classList.remove("hidden");else el("impactNote").classList.add("hidden"); renderGraph(); renderNodes();
}
function renderQuality(){
  const metrics=graphMetrics();
  const modelCount=state.deal.nodes.filter(n=>MODEL_META[n.model]).length;
  const checks=[
    ["✓","Source traceability",`${uniqueSources().length} source IDs preserved across ${state.deal.nodes.length} nodes.`,true],
    [modelCount===state.deal.nodes.length?"✓":"!","Model completeness",`${modelCount}/${state.deal.nodes.length} executable nodes have one primary model.`,modelCount===state.deal.nodes.length],
    [state.deal.nodes.every(n=>n.executionPackage)?"✓":"!","Model packages",state.deal.nodes.every(n=>n.executionPackage)?"Every node has a model-specific execution package.":"One or more nodes have no execution package.",state.deal.nodes.every(n=>n.executionPackage)],
    [metrics.dangling.length?"!":"✓","Dependency references",metrics.dangling.length?`${metrics.dangling.length} dangling edge(s) need review.`:"All dependency references resolve.",!metrics.dangling.length],
    [metrics.duplicateEdges.length||metrics.selfDependencies.length?"!":"✓","Edge integrity",metrics.duplicateEdges.length||metrics.selfDependencies.length?"Duplicate or self dependency detected.":"No duplicate or self dependency.",!metrics.duplicateEdges.length&&!metrics.selfDependencies.length],
    [metrics.orphanNodes.length?"!":"✓","Orphan nodes",metrics.orphanNodes.length?`${metrics.orphanNodes.join(", ")} has no connected dependency.`:"All nodes connect to the graph or are valid entry/terminal nodes.",!metrics.orphanNodes.length],
    [metrics.hasCycle?"!":"✓","Cycle detection",metrics.hasCycle?"A dependency cycle prevents deterministic wave and critical-path calculation.":"Deterministic DAG check found no cycles in the current graph.",!metrics.hasCycle],
    [state.deal.blockers.length?"!":"✓","Readiness gate",state.deal.blockers.length?`${state.deal.blockers.length} blocker(s) keep the package out of handoff-ready state.`:"No blocking findings.",!state.deal.blockers.length],
    [metrics.hasCycle?"!":"✓","Critical path",metrics.hasCycle?"Resolve the dependency cycle before handoff.":`Calculated from dependencies: ${metrics.criticalDuration}d.`,!metrics.hasCycle]
  ];
  el("qualityChecks").innerHTML=checks.map(c=>`<div class="quality-check"><span class="check-icon" style="color:${c[3]?"var(--green)":"var(--orange)"}">${c[0]}</span><strong>${c[1]}</strong><p>${c[2]}</p></div>`).join("");
  const status=qualityStatus(metrics); const labels={blocked:"BLOCKED", "review-required":"REVIEW REQUIRED", ready:"READY"}; el("qualityGateBadge").textContent=labels[status];el("qualityGateBadge").className=`status-badge ${status==="ready"?"pass":"review"}`;
}
function esc(value){return String(value ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;", "'":"&#39;"}[c]));}
function exportGraph(){
  const metrics=graphMetrics();
  const nodes=state.deal.nodes.map(canonicalNode);
  const out={schemaVersion:"1.0-mock",generatedAt:new Date().toISOString(),mode:"mock",sourcePackage:state.sourcePackage||{name:state.deal.title},maturity:{label:state.deal.maturity,score:state.deal.score,blockers:state.deal.blockers},nodes,edges:buildExportEdges(metrics),waves:[...new Set(state.deal.nodes.map(n=>n.wave))].sort((a,b)=>a-b),operatingModelSummary:state.deal.nodes.reduce((acc,n)=>(acc[n.model]=(acc[n.model]||0)+1,acc),{}),executionPackages:nodes.map(n=>n.executionPackage),changeImpact:state.lastImpact||null,overrideHistory:state.overrideHistory,qualityFindings:{dangling:metrics.dangling,duplicates:metrics.duplicateEdges,selfDependencies:metrics.selfDependencies,orphans:metrics.orphanNodes},qualityStatus:qualityStatus(metrics),qualityGate:qualityHasIssues(metrics)?"pass-with-review":"ready-for-review"};
  downloadText("execution-graph.mock.json",JSON.stringify(out,null,2),"application/json");
}
function exportPlan(){downloadText("execution-plan.md",buildHumanPlan(),"text/markdown");}

el("loadSampleBtn").addEventListener("click",()=>{const key=el("sampleSelect").value;state={deal:clone(SAMPLE_DEALS[key]),sourcePackage:{name:SAMPLE_DEALS[key].title,mode:"built-in-sample"},selectedNode:null,modelFilter:"all",overrideHistory:[]}; if(!state.deal.nodes.length)state.deal.nodes=makeFallbackNodes(key);attachExecutionPackages(state.deal.nodes);state.deal.sourceCount=uniqueSources().length;el("importStatus").textContent="已加载内置 mock 数据";render();});
el("jsonFile").addEventListener("change",async event=>{const file=event.target.files[0];if(!file)return;try{const parsed=JSON.parse(await file.text());state={deal:normaliseDeal(parsed,file.name),sourcePackage:parsed,selectedNode:null,modelFilter:"all",overrideHistory:[]};el("importStatus").textContent=`已导入 ${file.name}`;render();}catch(err){el("importStatus").textContent=`导入失败：${err.message}`;}});
el("modelFilter").addEventListener("change",event=>{state.modelFilter=event.target.value;renderNodes();});
el("runQualityBtn").addEventListener("click",()=>{renderQuality();const btn=el("runQualityBtn");btn.textContent="已完成 ✓";setTimeout(()=>btn.textContent="运行质量门",1200);});
el("applyOverrideBtn").addEventListener("click",()=>{const n=state.deal.nodes.find(x=>x.id===state.selectedNode);if(!n)return;const next=el("overrideModel").value;if(next===n.model)return;const before=graphSnapshot();const previous=n.model;n.model=next;n.provenance="User-approved override";n.executionPackage=buildExecutionPackage(n);state.overrideHistory.push({nodeId:n.id,from:previous,to:next,at:new Date().toISOString()});const impact=buildChangeImpact(before,[n.id]);state.lastImpact=impact;render();inspect(n.id);el("impactNote").textContent=`已记录覆盖：${modelMeta(previous).label} → ${modelMeta(next).label}。${formatImpact(impact)}`;el("impactNote").classList.remove("hidden");});
el("addDependencyBtn")?.addEventListener("click",addDependency);
el("exportPlanBtn")?.addEventListener("click",exportPlan);
el("exportBtn").addEventListener("click",exportGraph);
state.deal=clone(SAMPLE_DEALS.clinical);attachExecutionPackages(state.deal.nodes);state.sourcePackage={name:state.deal.title,mode:"built-in-sample"};state.deal.sourceCount=uniqueSources().length;render();
