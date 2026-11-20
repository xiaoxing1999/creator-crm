# 隔离构建与启动实录

实际仓库基线 `f525ce7`，在其完整 Git worktree `/tmp/hub-acceptance` 应用本轮源码与锁文件变更后验证；不是用审核 ZIP 拼装。Node v24.16.0，npm 11.13.0，Next.js 16.2.4。主预览的 `.env.development.local` 保持原状，不读取或列出其值。验收工作树既无 `.env.local` 也无 `.env.development.local`；执行进程用 `env -i` 白名单传入 HOME、PATH、NEXT_TELEMETRY_DISABLED=1（dev 另指定 PORT=3117），无 DB、密码或 API 密钥。

## npm ci

`npm ci --no-audit --no-fund --loglevel=error`，退出 0。输出：
```
added 135 packages in 5s
```

## npm run build（最终代码）
```
> creator-crm@0.1.0 build
> next build

▲ Next.js 16.2.4 (Turbopack)
  Creating an optimized production build ...
✓ Compiled successfully in 1989ms
  Running TypeScript ...
  Finished TypeScript in 3.7s ...
  Collecting page data using 3 workers ...
✓ Generating static pages using 3 workers (4/4) in 153ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
└ ○ /_not-found
○  (Static)  prerendered as static content
```
构建退出 0。产物未包含旧业务 API；HTTP 层另有端到端回归。

## npm run dev（隔离工作树，日志节选）
```
> creator-crm@0.1.0 dev
> next dev
▲ Next.js 16.2.4 (Turbopack)
- Local:         http://localhost:3117
✓ Ready in 256ms
 GET / 200 in 1882ms (next.js: 1680ms, application-code: 202ms)
```

## 回归过程
基线反例先红：`跨类目得分 94`，2 failed。修复后使用 Node 原生 TypeScript 支持执行 `node --test tests/hub.test.mjs`。另试 `node --import tsx --test` 时该仓库的 CJS/ESM 导出解析不兼容，不能作为测试命令；未为测试修改全项目模块模式。Playwright 首轮 4 过 2 败，定位并修复 Esc 与初始焦点；最终结果见 [E2E-RESULTS.md](E2E-RESULTS.md)。
