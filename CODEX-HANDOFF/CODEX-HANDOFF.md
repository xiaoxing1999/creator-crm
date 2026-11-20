# Amazon US Creator Hub — Codex 离线交接

- 源码版本：`8c1f690a2475aaad96b7c8ef421606846103e830`（分支 `fix/hub-564b96b-p0-seal`）
- 生成日期：2026-11-20（UTC）
- 交付方式：ZIP 离线交接，不依赖 GitHub
- 校验：包根目录 `MANIFEST.txt`（文件清单）与 `SHA256SUMS.txt`（逐文件 SHA-256）

## 阅读顺序

1. `FRONTEND-ARCHITECTURE.md` — 运行形态、目录、状态管理、目标架构
2. `OPEN-ISSUES.md` — 哪些是已完成 Mock、哪些要做真实后端
3. `DATA-MODEL.md`、`API-CONTRACT.md` — 后端设计起点
4. `COMPONENT-INVENTORY.md`、`DESIGN-SYSTEM.md` — 前端复用
5. `TEST-RESULTS.md`、`SECURITY-AUDIT.md` — 验收证据（原始日志在 `TEST-LOGS/`）
6. `SCREENSHOTS/` — 1440 / 1024 / 768 / 390 与三张深色模式截图

## 本地启动（解压后）

```bash
cd Amazon-US-Creator-Hub-Final-Handoff
sha256sum -c SHA256SUMS.txt          # macOS：shasum -a 256 -c SHA256SUMS.txt
npm ci                               # 需要 Node 20+（基线实测版本见 TEST-LOGS/build.log）
npm run dev                          # 打开 http://localhost:3000
```

不需要任何环境变量；原型不读 `.env`。

## 本地验证

```bash
npx tsc --noEmit
node --test tests/hub.test.mjs tests/glyphs.test.mjs   # 11 个
npx playwright install chromium      # 首次
npm run dev &                        # 另开终端亦可
npx playwright test tests/hub.spec.mjs
npx next build
```

## 下一阶段

开发独立 React + Vite、FastAPI、PostgreSQL、达人数据源与合作管理功能。
建议先把 `lib/hub.ts` 的规则翻译为后端领域服务并保留对应测试，再接前端。

## 禁止事项

不连接生产 API、不发送真实邮件、不部署生产环境、不整合 LibreChat，不把任何密钥写进代码或前端。

## 历史说明

仓库根目录的 `CODEX-HANDOFF.md`、`E2E-RESULTS.md`、`SCREENSHOTS/`、`TEST-LOGS/` 是上一轮
GPT 审核的材料，保留供追溯；以本目录内容为准。
