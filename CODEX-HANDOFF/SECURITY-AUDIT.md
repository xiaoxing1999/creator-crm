# 安全审计

## 1. 交付包清理

| 项目 | 结果 |
| --- | --- |
| `.env`、`.env.local`、`.env.development.local` | 未打包（git 忽略，打包只取 `git ls-files` + 交接目录） |
| `.env.example` | 已打包，仅含空值与占位符（`postgres://USER:PASSWORD@HOST/...`、`outreach@example.com`） |
| 密钥 / Token 正则扫描 | 对已跟踪文件扫描 `sk-…`、`sk-ant-`、`re_…`、`apify_api_…`、带密码的 Postgres URL、`AKIA…`、`ghp_…`、`Bearer …`：**无命中**（占位符除外） |
| Cookie / 会话 | 原型无登录、无 Cookie；打包不含浏览器配置或 storageState |
| 真实用户数据 | 无。28 名创作者、3 个 ASIN（`B0MOCK…`）、操作员均为虚构；头像为生成图 |
| 构建缓存 | 未打包 `node_modules/`、`.next/`、`test-results/`、`playwright-report/`、`.vercel/` |

## 2. 运行时

- 只有 `/` 可路由，旧版 API 全部 404（`TEST-LOGS/routes.log`）。
- 无网络请求、无第三方脚本；`next.config.ts` 下发 `X-Content-Type-Options: nosniff` 与
  `Referrer-Policy: strict-origin-when-cross-origin`。
- 预算输入严格解析，拒绝科学计数、负数、超过两位小数和超过上限的值。

## 3. 依赖审计（`npm audit`，14 项）

| 包 | 级别 | 直接依赖 | 来源 / 修复 |
| --- | --- | --- | --- |
| `next` 16.2.4 | **critical** | 是 | 多项 Server Components / Proxy 漏洞；升级到 16.4.6（非破坏性） |
| `postcss`、`sharp` | high | 否 | 随 `next` 升级修复 |
| `nanoid`、`source-map-js` | high | 否 | `npm audit fix` |
| `drizzle-kit` / `@esbuild-kit/*` / `esbuild` | moderate | 是（旧版） | 仅 dev server 风险；旧版代码专用 |
| `csv-parse` | moderate | 是（旧版） | 升级到 7.x（破坏性） |
| `resend` / `svix` / `uuid` | moderate | 是（旧版） | `npm audit fix` |
| `baseline-browser-mapping` | moderate | 否 | `npm audit fix` |

**本包未升级依赖**，以保证与审核基线 8c1f690 完全一致。原型实际只用到 `next`、`react`、
`react-dom`、`lucide-react`。下一阶段改为 React + Vite + FastAPI 后，旧版依赖
（drizzle、resend、anthropic、csv-parse 等）应一并移除。

## 4. 下一阶段要求

- 凭据只放服务端环境变量；前端不得出现任何密钥。
- 按工作区授权每一次查询；写操作带版本号与幂等键。
- 达人数据源只用沙箱 / 测试账号；不发送真实邮件；不部署生产。
