# 记忆为什么越久越模糊

9:16 竖屏代码渲染科普短片（88s），AI 旁白 + 字级字幕 + BGM 闪避混音。全片无素材，画面由 HTML/Canvas 程序逐帧绘制，无头浏览器截图 + FFmpeg 合成。

## 内容结构（反转叙事）

1. 反直觉开场：你还记得十年前的今天吗？
2. 直觉模型：记忆像录像带，越久越模糊
3. 证据：艾宾浩斯遗忘曲线（1885，20 分钟剩 58.2%，1 天剩 33.7%）
4. 反转一：Tulving 提取失败说（1975）——遗忘不是丢失，是线索缺失（舌尖现象）
5. 反转二：记忆是重建的——Bartlett 鬼怪故事（1932，350→180 词）+ Loftus 误导信息效应
6. 金句：它不是录像带，是一幅永远在修改的画

## 文件

| 文件 | 作用 |
|---|---|
| `index.html` | 12 场竖屏视觉母题 + 旁白逐字高亮字幕（1080×1920） |
| `render.mjs` | 无头浏览器逐帧截图 + FFmpeg 合成成片（支持 `--duration/--output/--music/--audio/--cuts`） |
| `vcheck.mjs` | 12 场景中心时点静帧验证 |
| `build-audio.mjs` | 旁白 + BGM 侧链闪避 + 4 个情绪音效混音 |
| `analyze-bgm.mjs` | BGM 节拍分析 |
| `story.md` | 分镜、旁白稿、出处表 |
| `final_88s.mp4` | 成片（1080×1920 / 30fps / 88s） |

## 复现

```bash
# 1. 生成旁白音轨（voice_timed.wav：12 句 TTS + 句间 0.35s 间隔）
#    TTS 逐句生成后拼接，时间轴见 story.md

# 2. 混音（旁白为主，BGM 自动压低，音效对齐切点）
node build-audio.mjs

# 3. 渲染成片
node render.mjs --duration 88 --output final_88s.mp4 \
  --cuts "7.65,16.38,22.53,30.38,36.23,42.58,49.61,54.96,62.89,69.24,76.27" \
  --music bgm.mp3 --audio audio.wav
```

依赖：Node.js、playwright-core、Edge、FFmpeg。BGM（bgm.mp3）因版权不入库。

## 事实来源

艾宾浩斯遗忘曲线数据（人民网科普/天津交通职院心理中心）；Tulving 提取失败说（Simply Psychology/PapaCambridge）；Bartlett 1932 与 Loftus 误导信息（Save My Exams/Lawyers & Jurists）。详见 story.md。
