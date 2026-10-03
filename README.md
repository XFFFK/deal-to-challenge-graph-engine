# Deal → Challenge Graph Engine（本地 mock 原型）

这是一个无依赖的浏览器原型，用于演示 Topcoder **Flexible Talent / Challenge / Private Pod** 三种 operating model 的执行图编排。它不调用网络、不需要 API key，也不会向 Topcoder 自动注册、发起 Challenge 或提交任务。

公开演示：<https://xfffk.github.io/deal-to-challenge-graph-engine/>

## 运行

在本目录启动静态文件服务器（直接双击 `index.html` 也能运行基础功能）：

```powershell
cd C:\Users\Administrator\Documents\Codex\2026-10-02\new-chat\work\topcoder-graph-prototype
python -m http.server 4173
```

然后打开 <http://localhost:4173>。默认加载 Clinical Intake 样例；“样例 Deal”可以切换其它三种情境，也可以通过文件选择器或粘贴框导入任意 JSON 包。

最小自动化回归检查（无需依赖或联网）：

```powershell
node .\qa-smoke.cjs
```

拿到官方四个 JSON 后，可先运行 `node .\validate-official-packages.cjs <目录>` 做一次离线文件和结构检查。

## 已实现的演示流程

1. **导入与成熟度**：保留导入的 source package，显示成熟度、分数、阻塞项和基于实际 JSON 的结构校验结果。校验覆盖对象结构、包标识符、标题、可执行来源证据和重复标识符；导入未知结构时，原始 `id` 字段会被用作 traceability refs。
2. **节点与三模型**：每个节点有工作类别、来源 ID、readiness、验收条件、分类置信度和分类理由。Inspector 支持编辑、增加、删除、拆分和合并节点，也可把节点标为 ready、review-required 或 blocked；用户编辑与 operating-model 覆盖都会保留在变更影响和导出 JSON 中。
3. **模型执行包**：每个节点都会生成对应的 Flexible Talent、Challenge 或 Private Pod package 预览，包含角色/技能、输入、交付物、验收、访问与评审信息；Inspector 中可以直接审阅。
4. **DAG / 波次 / 关键路径**：依赖关系生成可视化 DAG；Inspector 可以添加或移除前置依赖，环路会被拒绝；变更会显示受影响节点、波次、关键路径和需要复核的执行包。
5. **质量门**：检查来源覆盖、模型完整性、模型包、依赖引用、重复/自依赖、孤立节点、环路、阻塞项和关键路径计算，状态明确显示为 `READY`、`REVIEW REQUIRED` 或 `BLOCKED`。
6. **导出**：导出 `execution-graph.mock.json`（原始包、规范化节点、带理由的边、模型包、覆盖历史、变更影响和质量发现）以及 `execution-plan.md` 人类可读执行计划。

## 规格对照文件

- `SOURCE_MAPPING.md`：source-to-canonical mapping、忽略字段和兼容性假设。
- `ARCHITECTURE.md`：输入验证、规范化、分类器、DAG、变更影响、质量门和导出层。
- `SUBMISSION_CHECKLIST.md`：四包导入、样例输出、测试和演示检查项。
- `DEMO_SCRIPT.md`：三分钟英文演示顺序和旁白。
- `SUBMISSION_TEXT.md`：可直接用于提交表单的英文项目说明、运行方式和验证范围。
- `validate-official-packages.cjs`：官方四包的文件名、JSON 和根结构检查器。
- `LICENSE`：可随提交包一起分发的 MIT 许可证。
- `sample-outputs/`：四个内置情境的可审阅 graph JSON、模型包和质量门结果；这些是 mock 输出，不冒充官方输入包。

## 设计边界

- 这是 deterministic mock mode，不声称 AI 生成了事实；节点的 `provenance` 明确标记为 `AI-recommended`、`User-approved edit/add/split/merge/override` 或 `Imported`。
- UI 不执行真实招聘、资金批准、Challenge 发布、账号登录或外部通信。
- 当前 SVG 箭头为轻量演示布局；真实生产版应接入布局引擎并将 dependency 编辑持久化。
