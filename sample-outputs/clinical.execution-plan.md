# Clinical Intake & Patient Support Assistant — Execution Plan

- Maturity: **Review Required** (68%)
- Quality gate: **REVIEW-REQUIRED**
- Waves: 4
- Critical path: N1 → N2 → N4 → N6

## Blockers
- **B-01 External API contract 未确认** — 需要在实现前冻结患者资料与身份服务接口。
- **B-02 PHI access boundary 待审批** — 受监管数据必须先完成访问、审计和脱敏决策。
- **B-03 Human review policy 未落地** — AI 提取结果的人工确认阈值仍是开放问题。

## Execution nodes
### Wave 1
#### N1 · 确认 API 与数据边界
- Model: **Flexible Talent** · readiness: **blocked**
- Objective: 冻结身份、患者资料与事件接口，记录 PHI 数据边界。
- Sources: REQ-01, ARC-01
- Dependencies: —
- Deliverables: 冻结身份、患者资料与事件接口，记录 PHI 数据边界。; 接口字段、错误码、访问角色和审计事件均有版本化契约。
- Acceptance: 接口字段、错误码、访问角色和审计事件均有版本化契约。
- Package: `flexible-talent`
### Wave 2
#### N2 · 文档摄取与字段提取
- Model: **Challenge** · readiness: **ready**
- Objective: 构建可评估的文档解析与信息提取组件。
- Sources: CAP-01, AI-01
- Dependencies: N1
- Deliverables: 文档摄取与字段提取 implementation or evaluation artifact; Reproducible result package
- Acceptance: 在提供的匿名样本上达到约定字段覆盖率，并输出可复现评测报告。
- Package: `challenge`
#### N3 · 知识库与检索评估
- Model: **Challenge** · readiness: **review-required**
- Objective: 比较检索、切分和引用策略，产出可审阅的评测包。
- Sources: AI-02, DATA-01
- Dependencies: N1
- Deliverables: 知识库与检索评估 implementation or evaluation artifact; Reproducible result package
- Acceptance: 至少两种策略在固定问题集上可比较，并保留引用证据。
- Package: `challenge`
### Wave 3
#### N4 · 安全与人工复核控制
- Model: **Private Pod** · readiness: **review-required**
- Objective: 实现 PHI 访问控制、人工复核队列和审计闭环。
- Sources: NFR-02, RISK-01
- Dependencies: N2, N3
- Deliverables: 实现 PHI 访问控制、人工复核队列和审计闭环。; 高风险结果阻断自动回复；复核、审计和告警可端到端演示。
- Acceptance: 高风险结果阻断自动回复；复核、审计和告警可端到端演示。
- Package: `private-pod`
#### N5 · 对话体验与可用性验证
- Model: **Challenge** · readiness: **ready**
- Objective: 验证 intake 对话流程、错误恢复和可访问性。
- Sources: REQ-03, NFR-03
- Dependencies: N2
- Deliverables: 对话体验与可用性验证 implementation or evaluation artifact; Reproducible result package
- Acceptance: 完成关键旅程走查，达到可访问性清单和人工评审门槛。
- Package: `challenge`
### Wave 4
#### N6 · 受控试点交付
- Model: **Private Pod** · readiness: **review-required**
- Objective: 将组件集成至受控环境，完成试点、监控与回滚演练。
- Sources: ARC-02, REL-01
- Dependencies: N4, N5
- Deliverables: 将组件集成至受控环境，完成试点、监控与回滚演练。; 试点指标、回滚路径、监控告警和交接文档经责任人签字。
- Acceptance: 试点指标、回滚路径、监控告警和交接文档经责任人签字。
- Package: `private-pod`

## Dependency validation
- Entry nodes: N1
- Terminal nodes: N6
- Cycles: none
- Dangling edges: 0
- Orphan nodes: none

Generated in deterministic mock mode; review blockers before operational handoff.