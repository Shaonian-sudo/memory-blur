// build-audio.mjs — 为《记忆为什么越久越模糊》合成成片音轨
// 输入：voice_timed.wav（旁白，句间带 0.35s 间隔）、bgm.mp3（BGM）
// 输出：audio.wav（旁白为主 + BGM 闪避 ducking + 情绪音效）
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const root = dirname(fileURLToPath(import.meta.url));
const voicePath = resolve(root, process.argv[2] || "voice_timed.wav");
const bgmPath = resolve(root, process.argv[3] || "bgm.mp3");
const outPath = resolve(root, process.argv[4] || "audio.wav");
const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";

// 音效时刻（对齐旁白切点）：
// whoosh 22.4s（S4 遗忘曲线陡降）、boom 30.4s（S5 大问号）、sweep 49.6s（S8 磁带→画笔）、bell 84.0s（S12 结尾余韵）
const filterComplex = [
  "[0:a]aformat=sample_rates=48000:channel_layouts=stereo,adelay=1500|1500[voicex]",
  "[1:a]aformat=sample_rates=48000:channel_layouts=stereo,volume=0.85[bgmx]",
  "[bgmx][voicex]sidechaincompress=threshold=0.03:ratio=6:attack=8:release=260[bgmduck]",
  "aevalsrc='0.35*sin(2*PI*(180+520*min(t,0.9)/0.9)*t)':d=1.1[whooshx]",
  "[whooshx]aformat=sample_rates=48000:channel_layouts=stereo,adelay=22400|22400[whooshd]",
  "aevalsrc='0.9*sin(2*PI*52*t)*exp(-5*t)':d=1.8[boommx]",
  "[boommx]aformat=sample_rates=48000:channel_layouts=stereo,adelay=30400|30400[boommd]",
  "aevalsrc='0.3*sin(2*PI*(300+900*min(t,0.7)/0.7)*t)*exp(-2.2*t)':d=1.2[sweepx]",
  "[sweepx]aformat=sample_rates=48000:channel_layouts=stereo,adelay=49500|49500[sweepd]",
  "aevalsrc='(0.7*sin(2*PI*1046*t)+0.35*sin(2*PI*1568*t))*exp(-1.1*t)':d=4[bellx]",
  "[bellx]aformat=sample_rates=48000:channel_layouts=stereo,adelay=84000|84000[belld]",
  "[voicex][bgmduck][whooshd][boommd][sweepd][belld]amix=inputs=6:normalize=0,alimiter=limit=0.95[mixout]"
].join(";");

const args = [
  "-y", "-hide_banner", "-loglevel", "error",
  "-i", voicePath,
  "-i", bgmPath,
  "-filter_complex", filterComplex,
  "-map", "[mixout]",
  "-t", "88",
  "-c:a", "pcm_s16le",
  outPath
];

try {
  await execFileAsync(ffmpegPath, args, { maxBuffer: 16 * 1024 * 1024 });
  console.log("audio mix saved to", outPath);
} catch (err) {
  console.error("mix failed:", err.message);
  process.exit(1);
}
