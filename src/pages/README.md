# 页面模块

页面主体写在 `pages/<name>/index.tsx`，不要再套一层 `*-page.tsx`。局部块拆到 `components/`，文件名用 `<page>-xxx.tsx`（如 `dashboard-stagnant-table.tsx`、`orders-search.tsx`）。类型放 `model/`，复杂逻辑放 `hooks/`。

- `src/components/Layout/`：顶栏、侧栏、标签栏、页面壳
- `src/components/Form/`：全局表格等表单控件，页面只填列和数据
- `src/components/Waybill/`：跨页运单详情弹窗
- `src/api/`：业务接口
- `src/lib/`：通用工具（HTTP、存储、声音、跨页计算）
