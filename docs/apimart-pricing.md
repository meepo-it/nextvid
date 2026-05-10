# ApiMart 视频模型定价文档

> 数据采集时间：2026-05-07  
> 采集方式：通过 Chrome DevTools MCP 访问已登录的 https://apimart.ai/zh/model 页面，执行 `document.body.innerText` 提取文本，共 2 页 19 条记录。

---

## 一、ApiMart 视频模型原始报价（含 20% 折扣后价格）

所有价格均已包含 ApiMart 会员 20% 折扣。

### 第 1 页（共 12 条）

| 模型名称 | 单价 | 计费单位 | 备注 |
|----------|------|----------|------|
| `kling-v3-motion-control` | $0.103 | /秒 | Kling v3 运动控制版 |
| `happyhorse-1.0` | $0.230 | /秒 | 最贵，支持 I2V/V2V/R2V/T2V |
| `skyreels-v4-fast` | $0.064 | /秒 | SkyReels v4 快速版 |
| `wan2.7` | $0.066 | /秒 | Wan 2.7，基础主力模型 |
| `viduq3` | $0.080 | /秒 | Vidu Q3 |
| `doubao-seedance-2.0` | $0.073 | /秒 | 豆包 Seedance 2.0 |
| `wan2.5-preview` | $0.034 | /秒 | Wan 2.5 预览版（较便宜） |
| `kling-video-o1` | $0.067 | /秒 | Kling Video O1 |
| `kling-v3-omni` | $0.067 | /秒 | Kling v3 Omni |
| `grok-imagine-1.0-video-apimart` | $0.007 | /秒 | 最便宜，Grok 视频 |
| `MiniMax-Hailuo-2.3` | $0.049 | /秒 | MiniMax Hailuo 2.3 |
| `kling-v2-6` | $0.037 | /秒 | Kling v2.6 |

### 第 2 页（共 7 条）

| 模型名称 | 单价 | 计费单位 | 备注 |
|----------|------|----------|------|
| `sora-2-preview` | $0.080 | /秒 | Sora 2 预览版 |
| `doubao-seedance-1-5-pro` | $0.020 | /秒 | 豆包 Seedance 1.5 Pro |
| `wan2.6` | $0.050 | /秒 | Wan 2.6 |
| `MiniMax-Hailuo-02` | $0.080 | /秒 | MiniMax Hailuo 02 |
| `doubao-seedance-1-0-pro-quality` | $0.020 | /秒 | 豆包 Seedance 1.0 Pro |
| `sora-2-pro` | $0.600 | /次 | 按次计费，最高 25 秒 |
| `Veo 3.1 Fast` | $0.080 | /次 | **按次计费**，固定 8 秒 |

---

## 二、nextvid 已集成模型的成本核算

nextvid 当前集成的模型与 ApiMart 定价对照：

| nextvid 模型 Key | ApiMart providerModelName | 费率 | 计费 |
|-----------------|--------------------------|------|------|
| `wan-2.7` | `wan2.7` | $0.066 | /秒 |
| `wan-2.7-r2v` | `wan2.7-r2v` | $0.066 | /秒（同底模）|
| `wan-2.7-video-edit` | `wan2.7-videoedit` | $0.066 | /秒（同底模）|
| `kling-v3` | `kling-v3` | ~$0.067 | /秒（参考 kling-v3-omni）|
| `seedance-2.0` | `doubao-seedance-2.0` | $0.073 | /秒 |
| `seedance-2.0-fast` | `doubao-seedance-2.0-fast` | ~$0.040 | /秒（估算，未在列表）|
| `seedance-2.0-face` | `doubao-seedance-2.0-face` | ~$0.073 | /秒（估算）|
| `seedance-2.0-fast-face` | `doubao-seedance-2.0-fast-face` | ~$0.040 | /秒（估算）|
| `happyhorse-1.0` | `happyhorse-1.0` | $0.230 | /秒 |
| `hailuo-2.3` | `MiniMax-Hailuo-2.3` | $0.049 | /秒 |
| `hailuo-2.3-fast` | `MiniMax-Hailuo-2.3-Fast` | ~$0.030 | /秒（估算）|
| `veo3-fast` | `veo3.1-fast` | $0.080 | **/次**（固定 8s）|
| `veo3-quality` | `veo3.1-quality` | ~$0.160 | /次（估算，未在列表）|
| `veo3-lite` | `veo3.1-lite` | ~$0.050 | /次（估算，未在列表）|
| `veo3-remix-fast` | `veo3.1-fast-remix` | $0.080 | /次（估算，同 fast）|
| `veo3-remix-quality` | `veo3.1-quality-remix` | ~$0.160 | /次（估算）|
| `skyreels-v4-fast` | `skyreels-v4-fast` | $0.064 | /秒 |
| `skyreels-v4-std` | `skyreels-v4-std` | ~$0.080 | /秒（估算）|
| `vidu-q3-pro` | `viduq3-pro` | ~$0.100 | /秒（估算）|
| `vidu-q3-turbo` | `viduq3-turbo` | ~$0.080 | /秒（参考 viduq3）|
| `vidu-q3` | `viduq3` | $0.080 | /秒 |
| `vidu-q3-mix` | `viduq3-mix` | ~$0.080 | /秒（估算）|

> 带"估算"标注的价格未在 ApiMart 模型列表中直接出现，基于同系列已知价格推断。**建议通过 ApiMart API 实际调用确认计费后再定价。**

### 典型成本示例

| 场景 | 模型 | 规格 | 时长 | ApiMart 成本 |
|------|------|------|------|-------------|
| 最便宜入门 | wan2.7 | 480p | 5s | $0.330 |
| 标准 720p | wan2.7 | 720p | 5s | $0.330 |
| 高质量 1080p | skyreels-v4-fast | 1080p | 10s | $0.640 |
| 旗舰生成 | happyhorse-1.0 | 1080p | 5s | $1.150 |
| Veo 3 单次 | veo3.1-fast | 720p | 8s（固定）| $0.080 |

---

## 三、积分定价建议

### 3.1 定价基准

**建议：1 积分 = ¥0.01 人民币（约 $0.0014 USD）**

或对标美元市场：**1 credit = $0.01 USD**

以下按 **1 credit = $0.01 USD** 为基准进行计算。

### 3.2 各模型每秒积分消耗推荐

目标利润率约 **35-50%**（覆盖服务器、带宽、运营及 ApiMart 以外的其他成本）。

| 模型 | API成本/s | 480p c/s | 720p c/s | 1080p c/s | 单次示例（5s 720p）| 利润率 |
|------|----------|----------|----------|-----------|-----------------|--------|
| wan2.7 系列 | $0.066 | 7 | 10 | 15 | 50 credits = $0.50 | ~35% |
| skyreels-v4-fast | $0.064 | 7 | 10 | 15 | 50 credits | ~35% |
| hailuo-2.3 | $0.049 | 5 | 8 | 12 | 40 credits | ~38% |
| kling-v3 | ~$0.067 | 7 | 10 | 16 | 50 credits | ~33% |
| seedance-2.0 | $0.073 | 8 | 11 | 17 | 55 credits | ~33% |
| vidu-q3 | $0.080 | 8 | 12 | 18 | 60 credits | ~33% |
| happyhorse-1.0 | $0.230 | — | 35 | 52 | 175 credits | ~33% |
| **veo3.1-fast** | **$0.080/次** | — | **12/call** | — | **12 credits = $0.12** | ~33% |

> Veo 3.1 系列按次计费，duration 固定 8 秒，对应 `creditCost720p` 填入每秒等效值：  
> $0.080 ÷ 8s = $0.010/s → 建议设为 **2 credits/s**，系统自动 × 8s = 16 credits/call

### 3.3 套餐档位建议

| 套餐 | 价格 | 积分数 | 单价 | 适合人群 |
|------|------|--------|------|----------|
| 免费试用 | ¥0 | 100 credits | — | 新用户体验 |
| 入门包 | ¥29 | 3,000 credits | ¥0.0097/c | 轻度使用，约 60 条 5s 视频 |
| 标准包 | ¥99 | 12,000 credits | ¥0.00825/c | 创作者，约 240 条 5s 视频 |
| 专业包 | ¥299 | 40,000 credits | ¥0.00748/c | 重度用户 |
| 企业定制 | 面议 | 不限 | — | B 端按需 |

> 以上为人民币定价参考，如面向海外市场可换算为 USD（¥7.1 ≈ $1）。

### 3.4 DB 中 creditCost 字段建议值（直接用于 video_model_config 表）

| 模型 | creditCost480p | creditCost720p | creditCost1080p |
|------|---------------|---------------|-----------------|
| wan2.7 | 7 | 10 | 15 |
| wan2.7-r2v | 7 | 10 | 15 |
| wan2.7-videoedit | 7 | 10 | 15 |
| kling-v3 | 7 | 10 | 16 |
| doubao-seedance-2.0 | 8 | 11 | 17 |
| doubao-seedance-2.0-fast | 5 | 7 | 11 |
| doubao-seedance-2.0-face | 8 | 11 | 17 |
| doubao-seedance-2.0-fast-face | 5 | 7 | 11 |
| happyhorse-1.0 | 0 | 35 | 52 |
| MiniMax-Hailuo-2.3 | 0 | 8 | 12 |
| MiniMax-Hailuo-2.3-Fast | 0 | 5 | 8 |
| veo3.1-fast | 0 | 2 | 3 |
| veo3.1-quality | 0 | 4 | 6 |
| veo3.1-lite | 0 | 1 | 2 |
| veo3.1-fast-remix | 0 | 2 | 3 |
| veo3.1-quality-remix | 0 | 4 | 6 |
| skyreels-v4-fast | 7 | 10 | 15 |
| skyreels-v4-std | 0 | 12 | 18 |
| viduq3-pro | 0 | 14 | 22 |
| viduq3-turbo | 0 | 12 | 18 |
| viduq3 | 8 | 12 | 18 |
| viduq3-mix | 0 | 12 | 18 |

> `0` 表示该分辨率档位该模型不支持或不建议使用（系统会通过 supportedResolutions 阻断）。

---

## 四、注意事项

1. **Veo 3.1 按次计费**：ApiMart 对 Veo 3.1 系列按次（/次）而非按秒计费。`getCreditCost()` 内部仍用 `perSec × duration`，duration=8 固定，因此将 creditCost720p 设为 2，代入后得 16 credits/call = $0.16，成本 $0.080，利润率约 50%。

2. **HappyHorse 极贵**：$0.230/s 是列表中最贵的模型（非 Sora Pro），10 秒 1080p 视频将耗费 $2.30。建议在 UI 上明确标注为"高级模型"并消耗较多积分，避免用户误操作。

3. **估算价格需验证**：`doubao-seedance-2.0-fast`、`MiniMax-Hailuo-2.3-Fast`、`veo3.1-quality/lite` 等变体未在 ApiMart 价格列表中直接出现，实际费率以 ApiMart 账单为准。

4. **汇率波动**：ApiMart 以 USD 计价，人民币套餐定价需考虑汇率波动，建议预留 5-10% 的汇率缓冲。

---

## 五、采集过程记录

```
工具: Chrome DevTools MCP (mcp__chrome-devtools__)
页面: https://apimart.ai/zh/model (已登录账号)
步骤:
  1. list_pages → 确认页面 ID=18 已选中 apimart.ai/zh/model
  2. evaluate_script: () => document.body.innerText → 提取第 1 页 12 条模型定价
  3. click (CSS: a[aria-label='下一页'] 或 "下一页" 链接) → 翻至第 2 页
  4. evaluate_script: () => document.body.innerText → 提取第 2 页 7 条模型定价
  5. 整理汇总，共 19 条记录（页面显示"共 19 条记录，第 2/2 页"）
```
