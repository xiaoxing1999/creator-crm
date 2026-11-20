# 设计系统

来源：`app/hub.css`（约 1360 行，作用域为 `.hub`）。

## 颜色变量

| 变量 | 浅色 `.hub` | 深色 `.hub.night` | 用途 |
| --- | --- | --- | --- |
| `--paper` | `#fff` | `#192538` | 卡片 / 面板 |
| `--bg` | `#f6f8fb` | `#101a2a` | 页面背景 |
| `--ink` | `#18253a` | `#e5ecf7` | 主文字 |
| `--sub` | `#64748b` | `#a8b7cc` | 次要文字 |
| `--line` | `#dfe5ec` | `#334155` | 边框 / 分隔线 |
| `--blue` | `#265ee6` | `#8cb2ff` | 主色（按钮、选中、链接） |
| `--tint` | `#edf3ff` | `#263753` | 主色浅底（选中行、导航高亮） |
| `--mint` | `#127452` | `#7dd9b4` | 正向状态（已核验） |

警示色（逾期、已发现证据）使用橙色，仅用于状态徽标。深色主题由 `<div class="hub night">`
切换，入口在“工作区设置 → 显示主题”，只在本次会话有效，不写 localStorage。

## 字体

`--font-sans: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", HubCJK, "Microsoft YaHei", sans-serif`

- `HubCJK`：`public/hub/hub-cjk.ttf` 与 `hub-cjk-bold.ttf`，由 Noto Sans SC 按 UI 实际用字子集化
  （`scripts/hub-font-subset.py`，许可证 `public/hub/OFL.txt`）。
- 新增中文文案后必须重新子集化，单元测试 `glyph` 用例会检查缺字。
- 正文 14px / 行高 1.5；页面标题加粗大号；英文眉题全大写加字距（如 `CREATOR INTELLIGENCE`）。

## 布局与断点

- 桌面：左侧固定导航栏 + 顶栏 + 内容区；档案以右侧抽屉打开。
- 验收宽度：1440、1024、768、390（见 `SCREENSHOTS/`）。窄屏侧栏折叠为菜单按钮，
  表格保留关键列。
- 卡片圆角约 8–12px，细边框 `--line`，阴影极弱。

## 交互规范

- 所有可点击元素可键盘操作，焦点环可见；`⌘K` 与 `/` 打开全局搜索。
- 看板卡片支持拖放，也提供阶段下拉选择器作为无障碍替代。
- 表单有未保存修改时离开需确认；toast 使用 `role="status"`，2.6 秒消失。
- 所有虚构数据显式标注“模拟 / 虚构演示数据”。
